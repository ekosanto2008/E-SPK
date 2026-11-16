import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Hanya izinkan domain Supabase atau local untuk keamanan
    const parsed = new URL(targetUrl);
    if (!parsed.hostname.includes("supabase.co") && !parsed.hostname.includes("localhost")) {
      return NextResponse.json({ error: "Invalid target domain" }, { status: 403 });
    }

    const res = await fetch(targetUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${res.statusText}` },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/pdf");
    headers.set("Content-Length", buffer.byteLength.toString());
    headers.set("Cache-Control", "public, max-age=3600");

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to proxy PDF" },
      { status: 500 }
    );
  }
}

