import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id, reason } = await request.json();

    if (!id || !reason) {
      return NextResponse.json(
        { error: "ID SPK dan alasan penolakan wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("spk")
      .update({
        status: "ditolak",
        alasan_tolak: String(reason).trim(),
        ditolak_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengembalikan berkas" },
      { status: 500 }
    );
  }
}

