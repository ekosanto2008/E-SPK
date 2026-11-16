import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const [
      { data: profiles, error: pError },
      { data: pppkList, error: pppkError },
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, role, email, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("pppk")
        .select("user_id, nip, nama")
        .not("user_id", "is", null),
    ]);

    if (pError) throw pError;
    if (pppkError) throw pppkError;

    const pppkMap = new Map((pppkList || []).map((p) => [p.user_id, p]));

    const users = (profiles || []).map((prof) => {
      const p = pppkMap.get(prof.id);
      return {
        id: prof.id,
        email: prof.email || "",
        role: prof.role,
        nip: p?.nip || null,
        nama:
          p?.nama ||
          (prof.role === "admin"
            ? "Administrator"
            : null),
        created_at: prof.created_at,
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengambil daftar pengguna" },
      { status: 500 }
    );
  }
}

