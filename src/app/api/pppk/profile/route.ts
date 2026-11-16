import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Sesi login tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tempat_lahir, tanggal_lahir, pendidikan, alamat, jabatan, unit_kerja } = body;

    if (!tempat_lahir || !tanggal_lahir || !pendidikan || !alamat || !jabatan || !unit_kerja) {
      return NextResponse.json(
        { error: "Semua kolom profil wajib diisi lengkap." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Ambil record PPPK yang terhubung dengan user_id yang sedang login
    const { data: pppk, error: pppkError } = await supabaseAdmin
      .from("pppk")
      .select("id, nip, nama")
      .eq("user_id", user.id)
      .maybeSingle();

    if (pppkError || !pppk) {
      return NextResponse.json(
        { error: "Data pegawai PPPK tidak ditemukan untuk akun ini." },
        { status: 404 }
      );
    }

    // 2. Update HANYA record PPPK milik user tersebut berdasarkan id spesifiknya
    const { error: updateError } = await supabaseAdmin
      .from("pppk")
      .update({
        tempat_lahir,
        tanggal_lahir,
        pendidikan,
        alamat,
        jabatan,
        unit_kerja,
        profil_lengkap: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pppk.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Gagal memperbarui profil pegawai." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil Anda berhasil disimpan.",
      pppkId: pppk.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server saat menyimpan profil." },
      { status: 500 }
    );
  }
}

