export interface AdminSpkValidationItem {
  id: string;
  status: "menunggu_ttd_laksma" | "selesai" | "ditolak";
  scan_ttd_url?: string | null;
  ttd_pppk_at?: string | null;
  ttd_laksma_at?: string | null;
  alasan_tolak?: string | null;
  pppk: {
    id: string;
    nip: string;
    nama: string;
    jabatan?: string | null;
    unit_kerja?: string | null;
  };
  batch: {
    id: string;
    nomor_surat: string;
    masa_kerja_mulai: string;
    masa_kerja_selesai: string;
  };
}

// Alias for backwards compatibility if needed
export type LaksmaSpkItem = AdminSpkValidationItem;

