import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    try {
      await supabase.auth.signOut();
    } catch (signOutErr) {
      console.warn("Supabase sign out error:", signOutErr);
    }

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Hancurkan semua cookies sesi, auth, token, dan penanda role
    allCookies.forEach((c) => {
      if (
        c.name.includes("sb-") ||
        c.name.includes("auth") ||
        c.name.includes("session") ||
        c.name.includes("spk_")
      ) {
        cookieStore.set(c.name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      }
    });

    const response = NextResponse.json({ success: true, message: "Session destroyed" });

    // Hapus total cache, cookies, dan client storage dari browser
    response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');

    // Anti-cache headers ketat agar browser tidak menyimpan snapshot halaman
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal logout" },
      { status: 500 }
    );
  }
}
