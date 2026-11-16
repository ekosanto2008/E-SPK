import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

// Masa aktif sesi: 1 Jam (3600 detik = 3600000 milidetik)
const ONE_HOUR_MS = 60 * 60 * 1000;

export default async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Lewatkan aset statis dan internal Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".") // file seperti .png, .css, .js, .ico
  ) {
    return NextResponse.next();
  }

  // 1. Inisialisasi Response dengan handleI18n
  let response = handleI18n(request);

  // 2. Inisialisasi Supabase Client untuk Middleware
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  let user: any = null;
  let userRole: string = "pppk";

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const cookieRole = request.cookies.get("spk_user_role")?.value;
      if (cookieRole) {
        userRole = cookieRole;
      } else if (user.email === "admin@spk.internal") {
        userRole = "admin";
      } else {
        userRole = "pppk";
      }
    }
  }

  // 3. Verifikasi Session Expiration (Batas 1 Jam)
  const sessionTimeCookie = request.cookies.get("spk_session_time")?.value;
  let isSessionExpired = false;

  if (user) {
    if (!sessionTimeCookie) {
      isSessionExpired = true;
    } else {
      const sessionStart = parseInt(sessionTimeCookie, 10);
      if (isNaN(sessionStart) || Date.now() - sessionStart > ONE_HOUR_MS) {
        isSessionExpired = true;
      }
    }
  }

  // 4. PROTEKSI API ADMIN (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!user || isSessionExpired || userRole !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak: Hanya Administrator yang diizinkan." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Lewatkan endpoint API lainnya
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect legacy /laksma routes ke /admin/spk
  if (pathname.startsWith("/laksma")) {
    const dest = user && userRole === "admin" ? "/admin/spk" : "/signin";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedPppk = pathname.startsWith("/pppk");
  const isProtectedArea = isProtectedAdmin || isProtectedPppk;
  const isAuthPage = pathname.startsWith("/signin") || pathname.startsWith("/signup");

  // 5. JIKA SESI KEDALUWARSA ATAU BELUM LOGIN PADA AREA TERPROTEKSI
  if (isProtectedArea) {
    if (!user || isSessionExpired) {
      const redirectUrl = new URL("/signin", request.url);
      if (isSessionExpired && user) {
        redirectUrl.searchParams.set("reason", "session_expired");
      }

      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Bersihkan semua cookie sesi jika kedaluwarsa
      request.cookies.getAll().forEach((c) => {
        if (
          c.name.includes("sb-") ||
          c.name.includes("auth") ||
          c.name.includes("session") ||
          c.name.includes("spk_")
        ) {
          redirectResponse.cookies.set(c.name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
          });
        }
      });

      redirectResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      redirectResponse.headers.set("Pragma", "no-cache");
      redirectResponse.headers.set("Expires", "0");

      return redirectResponse;
    }

    // 6. PENJAGAAN KETAT ROLING AKSES (ROLE-BASED ACCESS CONTROL)
    // a. URL ADMIN (/admin/*): Hanya role "admin" yang boleh masuk!
    if (isProtectedAdmin && userRole !== "admin") {
      const redirectResponse = NextResponse.redirect(
        new URL("/pppk/dashboard", request.url)
      );
      redirectResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      return redirectResponse;
    }

    // b. URL PPPK (/pppk/*): Hanya role "pppk" atau "admin" yang boleh masuk
    if (isProtectedPppk && userRole !== "pppk" && userRole !== "admin") {
      const redirectResponse = NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
      redirectResponse.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
      );
      return redirectResponse;
    }

    // 7. HEADER ANTI-CACHE PADA SEMUA HALAMAN TERPROTEKSI
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // 8. JIKA PENGGUNA SUDAH LOGIN & SESI MASIH AKTIF MENCOBA BUKA /signin
  if (isAuthPage && user && !isSessionExpired && !searchParams.get("reason")) {
    const destination = userRole === "admin" ? "/admin/dashboard" : "/pppk/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
