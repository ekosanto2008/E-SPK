-- ==============================================================================
-- SKRIP MIGRASI DATABASE SPK PPPK DIGITAL
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda
-- ==============================================================================

-- 1. Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'pppk', 'laksma')),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Data master PPPK
-- Admin import: nip, nama, kontrak_mulai, kontrak_selesai
-- PPPK input sendiri: tempat_lahir, tanggal_lahir, pendidikan, alamat, jabatan, unit_kerja
CREATE TABLE IF NOT EXISTS public.pppk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nip TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  kontrak_mulai DATE NOT NULL,
  kontrak_selesai DATE NOT NULL,
  tempat_lahir TEXT,
  tanggal_lahir DATE,
  pendidikan TEXT,
  alamat TEXT,
  jabatan TEXT,
  unit_kerja TEXT,
  profil_lengkap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pengaturan SPK (data Laksma, Kepmenhan)
CREATE TABLE IF NOT EXISTS public.spk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_laksma TEXT NOT NULL,
  pangkat_laksma TEXT NOT NULL DEFAULT 'Laksamana Pertama TNI',
  jabatan_laksma TEXT NOT NULL DEFAULT 'Kadisminpersal',
  kepmenhan_nomor TEXT NOT NULL,
  kepmenhan_tanggal DATE NOT NULL,
  ttd_laksma_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Batch SPK (1 batch = 1x admin klik simpan untuk multiple PPPK)
CREATE TABLE IF NOT EXISTS public.spk_batch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID NOT NULL REFERENCES public.spk_settings(id) ON DELETE RESTRICT,
  nomor_surat TEXT NOT NULL,
  masa_kerja_mulai DATE NOT NULL,
  masa_kerja_selesai DATE NOT NULL,
  tanggal_surat DATE NOT NULL,
  jumlah_pppk INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SPK individual per PPPK
CREATE TABLE IF NOT EXISTS public.spk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pppk_id UUID NOT NULL REFERENCES public.pppk(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.spk_batch(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'menunggu_ttd_pppk'
    CHECK (status IN ('menunggu_ttd_pppk', 'menunggu_ttd_laksma', 'ditolak', 'selesai', 'expired')),
  scan_ttd_url TEXT,
  alasan_tolak TEXT,
  ttd_pppk_at TIMESTAMPTZ,
  ttd_laksma_at TIMESTAMPTZ,
  ditolak_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint unik: Hanya boleh ada 1 SPK aktif (selain expired) per PPPK
CREATE UNIQUE INDEX IF NOT EXISTS idx_spk_active_per_pppk
ON public.spk (pppk_id)
WHERE status != 'expired';

-- Index performa query
CREATE INDEX IF NOT EXISTS idx_pppk_kontrak_selesai ON public.pppk (kontrak_selesai);
CREATE INDEX IF NOT EXISTS idx_pppk_nip ON public.pppk (nip);
CREATE INDEX IF NOT EXISTS idx_spk_status ON public.spk (status);
CREATE INDEX IF NOT EXISTS idx_spk_batch_id ON public.spk (batch_id);

-- Function & Trigger: Auto-update kontrak PPPK saat status SPK menjadi selesai
CREATE OR REPLACE FUNCTION public.update_kontrak_on_spk_selesai()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'selesai' AND OLD.status != 'selesai' THEN
    UPDATE public.pppk
    SET
      kontrak_mulai = (SELECT masa_kerja_mulai FROM public.spk_batch WHERE id = NEW.batch_id),
      kontrak_selesai = (SELECT masa_kerja_selesai FROM public.spk_batch WHERE id = NEW.batch_id),
      updated_at = NOW()
    WHERE id = NEW.pppk_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_kontrak ON public.spk;
CREATE TRIGGER trg_update_kontrak
AFTER UPDATE ON public.spk
FOR EACH ROW
EXECUTE FUNCTION public.update_kontrak_on_spk_selesai();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pppk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
DROP POLICY IF EXISTS profiles_own ON public.profiles;
CREATE POLICY profiles_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- PPPK
DROP POLICY IF EXISTS pppk_admin_all ON public.pppk;
CREATE POLICY pppk_admin_all ON public.pppk
  FOR ALL USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS pppk_own_select ON public.pppk;
CREATE POLICY pppk_own_select ON public.pppk
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS pppk_own_update ON public.pppk;
CREATE POLICY pppk_own_update ON public.pppk
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS pppk_laksma_select ON public.pppk;
CREATE POLICY pppk_laksma_select ON public.pppk
  FOR SELECT USING (public.get_user_role() = 'laksma');

-- SPK_SETTINGS
DROP POLICY IF EXISTS settings_admin_all ON public.spk_settings;
CREATE POLICY settings_admin_all ON public.spk_settings
  FOR ALL USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS settings_read ON public.spk_settings;
CREATE POLICY settings_read ON public.spk_settings
  FOR SELECT USING (TRUE);

-- SPK_BATCH
DROP POLICY IF EXISTS batch_admin_all ON public.spk_batch;
CREATE POLICY batch_admin_all ON public.spk_batch
  FOR ALL USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS batch_read ON public.spk_batch;
CREATE POLICY batch_read ON public.spk_batch
  FOR SELECT USING (TRUE);

-- SPK
DROP POLICY IF EXISTS spk_admin_all ON public.spk;
CREATE POLICY spk_admin_all ON public.spk
  FOR ALL USING (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS spk_pppk_select ON public.spk;
CREATE POLICY spk_pppk_select ON public.spk
  FOR SELECT USING (
    pppk_id IN (SELECT id FROM public.pppk WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS spk_pppk_update ON public.spk;
CREATE POLICY spk_pppk_update ON public.spk
  FOR UPDATE USING (
    pppk_id IN (SELECT id FROM public.pppk WHERE user_id = auth.uid())
    AND status IN ('menunggu_ttd_pppk', 'ditolak', 'menunggu_ttd_laksma')
  );

DROP POLICY IF EXISTS spk_laksma_select ON public.spk;
CREATE POLICY spk_laksma_select ON public.spk
  FOR SELECT USING (
    public.get_user_role() = 'laksma'
    AND status IN ('menunggu_ttd_laksma', 'selesai')
  );

DROP POLICY IF EXISTS spk_laksma_update ON public.spk;
CREATE POLICY spk_laksma_update ON public.spk
  FOR UPDATE USING (
    public.get_user_role() = 'laksma'
    AND status = 'menunggu_ttd_laksma'
  );

-- ==============================================================================
-- STORAGE BUCKETS (Jalankan konfigurasi bucket di Supabase Storage jika diperlukan)
-- Bucket 1: signatures (public / authenticated untuk simpan ttd Laksma)
-- Bucket 2: scans (authenticated untuk simpan scan pdf PPPK)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('scans', 'scans', false)
ON CONFLICT (id) DO NOTHING;

