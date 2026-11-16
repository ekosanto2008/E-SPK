import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const [{ count: totalPppk }, { data: spks }] = await Promise.all([
      supabaseAdmin.from("pppk").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("spk").select("status").neq("status", "expired"),
    ]);

    const pendingPppk = (spks || []).filter(
      (s) => s.status === "menunggu_ttd_pppk"
    ).length;
    const pendingLaksma = (spks || []).filter(
      (s) => s.status === "menunggu_ttd_laksma"
    ).length;
    const finished = (spks || []).filter((s) => s.status === "selesai").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalPppk: totalPppk || 0,
        pendingPppk,
        pendingLaksma,
        pendingValidation: pendingLaksma,
        finished,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal memuat statistik" },
      { status: 500 }
    );
  }
}

