import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "User ID dan Password baru wajib diisi" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Update password user di Supabase Auth
    const { data: updated, error: authErr } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: String(newPassword),
      });

    if (authErr) {
      return NextResponse.json(
        { error: authErr.message || "Gagal mereset password di Supabase Auth" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
      email: updated.user.email,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

