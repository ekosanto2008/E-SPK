import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { id, ...settingsData } = payload;

    const supabaseAdmin = createAdminClient();

    let result;
    if (id) {
      const { data, error } = await supabaseAdmin
        .from("spk_settings")
        .update(settingsData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("spk_settings")
        .insert({ ...settingsData, is_active: true })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}

