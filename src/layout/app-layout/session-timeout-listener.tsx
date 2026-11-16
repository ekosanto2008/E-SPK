"use client";

import { supabase } from "@/lib/supabase/client";
import { useEffect } from "react";

const ONE_HOUR_SECONDS = 3600;

export default function SessionTimeoutListener() {
  useEffect(() => {
    // 1. Cegah Back-Forward Cache (bfcache) saat tombol "Back" browser ditekan
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Halaman dimuat dari memory cache browser setelah navigasi back/forward
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    // 2. Fungsi Logout Otomatis saat sesi 1 jam habis
    const triggerAutoLogout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {}

      try {
        await supabase.auth.signOut();
      } catch {}

      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      window.history.replaceState(null, "", "/signin?reason=session_expired");
      window.location.replace("/signin?reason=session_expired");
    };

    // 3. Hitung sisa waktu sesi 1 jam berdasarkan cookie spk_session_time
    const checkSessionExpiry = () => {
      const match = document.cookie.match(/(?:^|; )spk_session_time=([^;]*)/);
      if (match && match[1]) {
        const sessionStart = parseInt(match[1], 10);
        if (!isNaN(sessionStart)) {
          const elapsedSeconds = Math.floor((Date.now() - sessionStart) / 1000);
          const remainingSeconds = ONE_HOUR_SECONDS - elapsedSeconds;

          if (remainingSeconds <= 0) {
            triggerAutoLogout();
            return null;
          }
          return remainingSeconds;
        }
      }
      return ONE_HOUR_SECONDS;
    };

    const remainingSecs = checkSessionExpiry();
    if (remainingSecs === null) return;

    // Pasang timer timeout untuk logout otomatis tepat saat 1 jam tercapai
    const timeoutId = setTimeout(() => {
      triggerAutoLogout();
    }, remainingSecs * 1000);

    // Interval pemeriksaan periodik setiap 15 detik
    const intervalId = setInterval(() => {
      checkSessionExpiry();
    }, 15000);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}

