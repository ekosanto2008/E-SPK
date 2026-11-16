import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, nip } = body;

    const cookieStore = await cookies();
    const now = Date.now();
    const ONE_HOUR_IN_SECONDS = 3600;

    // Simpan timestamp sesi aktif (1 jam / 3600 detik)
    cookieStore.set("spk_session_time", now.toString(), {
      path: "/",
      maxAge: ONE_HOUR_IN_SECONDS,
      httpOnly: false, // Dibaca oleh client untuk auto-logout listener
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (role) {
      cookieStore.set("spk_user_role", role, {
        path: "/",
        maxAge: ONE_HOUR_IN_SECONDS,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    if (nip) {
      cookieStore.set("spk_user_nip", nip, {
        path: "/",
        maxAge: ONE_HOUR_IN_SECONDS,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return NextResponse.json({
      success: true,
      sessionStart: now,
      expiresIn: ONE_HOUR_IN_SECONDS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menginisialisasi sesi" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionTimeStr = cookieStore.get("spk_session_time")?.value;
    const role = cookieStore.get("spk_user_role")?.value;

    if (!sessionTimeStr) {
      return NextResponse.json({ active: false, remainingSeconds: 0 });
    }

    const sessionStart = parseInt(sessionTimeStr, 10);
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - sessionStart) / 1000);
    const remainingSeconds = Math.max(0, 3600 - elapsedSeconds);

    if (remainingSeconds <= 0) {
      return NextResponse.json({ active: false, remainingSeconds: 0 });
    }

    return NextResponse.json({
      active: true,
      role: role || null,
      remainingSeconds,
    });
  } catch {
    return NextResponse.json({ active: false, remainingSeconds: 0 });
  }
}

