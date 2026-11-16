import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const path = formData.get("path") as string | null;

    if (!file || !bucket || !path) {
      return NextResponse.json(
        { error: "File, bucket, dan path wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: pubData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      url: pubData.publicUrl,
      path: path,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah berkas" },
      { status: 500 }
    );
  }
}

