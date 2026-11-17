import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "NIP / Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const trimmedId = String(identifier).trim();
    const isEmail = trimmedId.includes("@");
    const supabaseAdmin = createAdminClient();

    let emailToAuth = trimmedId;

    if (!isEmail) {
      // Input adalah NIP PPPK
      // 1. Cek apakah NIP terdaftar di data master pppk
      const { data: pppkData, error: pppkErr } = await supabaseAdmin
        .from("pppk")
        .select("id, user_id, nip, nama, profil_lengkap")
        .eq("nip", trimmedId)
        .single();

      if (pppkErr || !pppkData) {
        return NextResponse.json(
          { error: "NIP tidak terdaftar dalam pangkalan data PPPK TNI AL. Silakan periksa kembali atau hubungi Administrator Disminpersal." },
          { status: 404 }
        );
      }

      emailToAuth = `${trimmedId}@spk.internal`;

      // 2. Lazy Registration: jika belum punya user_id / auth record, buatkan otomatis
      if (!pppkData.user_id) {
        // Cek apakah akun auth sudah pernah dibuat sebelumnya
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = userList?.users?.find(
          (u) => u.email === emailToAuth
        );

        let authUserId = existingAuthUser?.id;

        if (!authUserId) {
          // Buat akun auth baru dengan password default = NIP
          const { data: newAuth, error: createAuthErr } =
            await supabaseAdmin.auth.admin.createUser({
              email: emailToAuth,
              password: password, // jika saat registrasi awal user memasukkan default NIP
              email_confirm: true,
              user_metadata: {
                role: "pppk",
                nip: trimmedId,
                name: pppkData.nama,
              },
            });

          if (createAuthErr || !newAuth.user) {
            return NextResponse.json(
              { error: createAuthErr?.message || "Gagal membuat akun PPPK" },
              { status: 500 }
            );
          }
          authUserId = newAuth.user.id;
        }

        // Pastikan record profile ada
        await supabaseAdmin.from("profiles").upsert({
          id: authUserId,
          role: "pppk",
          email: emailToAuth,
        });

        // Tautkan user_id ke tabel pppk
        await supabaseAdmin
          .from("pppk")
          .update({ user_id: authUserId })
          .eq("id", pppkData.id);
      }
    }

    return NextResponse.json({
      success: true,
      email: emailToAuth,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

