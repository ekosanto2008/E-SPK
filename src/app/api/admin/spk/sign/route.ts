import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Daftar ID SPK tidak boleh kosong" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. Ambil detail SPK beserta data masa kerja dari spk_batch
    const { data: spkList, error: fetchErr } = await supabaseAdmin
      .from("spk")
      .select(`
        id,
        pppk_id,
        spk_batch (
          masa_kerja_mulai,
          masa_kerja_selesai
        )
      `)
      .in("id", ids);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    // 2. Update status SPK menjadi selesai & bubuhkan tanggal pengesahan
    const { error: signErr } = await supabaseAdmin
      .from("spk")
      .update({
        status: "selesai",
        ttd_laksma_at: new Date().toISOString(),
      })
      .in("id", ids);

    if (signErr) {
      return NextResponse.json({ error: signErr.message }, { status: 500 });
    }

    // 3. Sinkronkan masa kontrak baru ke master PPPK
    if (spkList && spkList.length > 0) {
      for (const item of spkList) {
        const batch = item.spk_batch as any;
        if (item.pppk_id && batch?.masa_kerja_selesai) {
          await supabaseAdmin
            .from("pppk")
            .update({
              kontrak_mulai: batch.masa_kerja_mulai,
              kontrak_selesai: batch.masa_kerja_selesai,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.pppk_id);
        }
      }
    }

    return NextResponse.json({ success: true, count: ids.length });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengesahkan/menandatangani SPK" },
      { status: 500 }
    );
  }
}

