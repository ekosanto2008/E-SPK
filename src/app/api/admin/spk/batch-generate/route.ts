import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      nomor_surat,
      masa_kerja_mulai,
      masa_kerja_selesai,
      tanggal_surat,
      kepmenhan_nomor,
      kepmenhan_tanggal,
      pppk_ids,
    } = await request.json();

    if (
      !nomor_surat ||
      !masa_kerja_mulai ||
      !masa_kerja_selesai ||
      !pppk_ids?.length
    ) {
      return NextResponse.json(
        { error: "Data batch SPK dan daftar PPPK tidak lengkap" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Ambil setting SPK aktif
    const { data: setting, error: setErr } = await supabaseAdmin
      .from("spk_settings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (setErr || !setting) {
      return NextResponse.json(
        {
          error:
            "Pengaturan SPK aktif belum ditemukan. Atur di menu Pengaturan SPK terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // 2. Buat record settings khusus jika nomor atau tanggal Kepmenhan di-set spesifik untuk batch ini
    let targetSettingsId = setting.id;
    if (
      (kepmenhan_nomor && kepmenhan_nomor.trim() !== setting.kepmenhan_nomor) ||
      (kepmenhan_tanggal && kepmenhan_tanggal.trim() !== setting.kepmenhan_tanggal)
    ) {
      const { data: customSetting, error: customErr } = await supabaseAdmin
        .from("spk_settings")
        .insert({
          nama_laksma: setting.nama_laksma,
          pangkat_laksma: setting.pangkat_laksma,
          jabatan_laksma: setting.jabatan_laksma,
          ttd_laksma_url: setting.ttd_laksma_url,
          kepmenhan_nomor: kepmenhan_nomor ? kepmenhan_nomor.trim() : setting.kepmenhan_nomor,
          kepmenhan_tanggal: kepmenhan_tanggal ? kepmenhan_tanggal.trim() : setting.kepmenhan_tanggal,
          is_active: false,
        })
        .select("id")
        .single();

      if (!customErr && customSetting) {
        targetSettingsId = customSetting.id;
      }
    }

    // 3. Buat record batch baru terhubung ke setting yang sesuai
    const { data: batch, error: batchErr } = await supabaseAdmin
      .from("spk_batch")
      .insert({
        settings_id: targetSettingsId,
        nomor_surat,
        masa_kerja_mulai,
        masa_kerja_selesai,
        tanggal_surat,
        jumlah_pppk: pppk_ids.length,
      })
      .select()
      .single();

    if (batchErr || !batch) {
      return NextResponse.json(
        { error: batchErr?.message || "Gagal membuat batch" },
        { status: 500 }
      );
    }

    // 3. Update SPK lama milik PPPK terpilih menjadi 'expired'
    await supabaseAdmin
      .from("spk")
      .update({ status: "expired" })
      .in("pppk_id", pppk_ids)
      .neq("status", "expired");

    // 4. Insert SPK baru untuk masing-masing PPPK
    const newSpkRecords = pppk_ids.map((id: string) => ({
      pppk_id: id,
      batch_id: batch.id,
      status: "menunggu_ttd_pppk",
    }));

    const { error: spkErr } = await supabaseAdmin
      .from("spk")
      .insert(newSpkRecords);

    if (spkErr) {
      return NextResponse.json({ error: spkErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, batchId: batch.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal memproses batch SPK" },
      { status: 500 }
    );
  }
}

