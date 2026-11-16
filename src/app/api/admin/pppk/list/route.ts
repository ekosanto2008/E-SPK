import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("pppk")
      .select(`
        id,
        nip,
        nama,
        kontrak_mulai,
        kontrak_selesai,
        tempat_lahir,
        tanggal_lahir,
        pendidikan,
        alamat,
        jabatan,
        unit_kerja,
        profil_lengkap,
        spk (
          id,
          status,
          scan_ttd_url,
          spk_batch (
            nomor_surat
          )
        )
      `)
      .order("kontrak_selesai", { ascending: true });

    if (error) throw error;

    const formatted = (data || []).map((row: any) => {
      const activeSpk = Array.isArray(row.spk)
        ? row.spk.find((s: any) => s.status !== "expired")
        : row.spk;

      return {
        ...row,
        spk: activeSpk
          ? {
              id: activeSpk.id,
              status: activeSpk.status,
              scan_ttd_url: activeSpk.scan_ttd_url,
              batch: activeSpk.spk_batch,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data PPPK" },
      { status: 500 }
    );
  }
}

