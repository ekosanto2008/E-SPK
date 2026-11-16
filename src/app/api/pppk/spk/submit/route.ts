import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { spkId, scanUrl } = await request.json();

    if (!spkId || !scanUrl) {
      return NextResponse.json(
        { error: "SPK ID dan URL Scan wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("spk")
      .update({
        scan_ttd_url: scanUrl,
        status: "menunggu_ttd_laksma",
        ttd_pppk_at: new Date().toISOString(),
        alasan_tolak: null,
        ditolak_at: null,
      })
      .eq("id", spkId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengupdate status SPK" },
      { status: 500 }
    );
  }
}

