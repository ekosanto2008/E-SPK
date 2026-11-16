import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { records } = await request.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Data PPPK tidak boleh kosong" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Chunk records menjadi batch 500 baris untuk efisiensi
    const chunkSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabaseAdmin
        .from("pppk")
        .upsert(chunk, { onConflict: "nip" });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      totalInserted += chunk.length;
    }

    return NextResponse.json({
      success: true,
      count: totalInserted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengimpor data PPPK" },
      { status: 500 }
    );
  }
}

