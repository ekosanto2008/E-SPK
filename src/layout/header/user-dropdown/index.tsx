"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { ChevronDownIcon, LogOutIcon, UserCircleIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/utils";
import { useEffect, useState } from "react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [pppkName, setPppkName] = useState<string>("");
  const [pppkNip, setPppkNip] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");

        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = prof?.role?.toUpperCase() || "";
        setUserRole(role);

        // Jika user adalah PPPK, ambil nama masing-masing PPPK dari tabel pppk
        if (
          role === "PPPK" ||
          (!role &&
            data.user.email?.includes("@spk.internal") &&
            data.user.email !== "admin@spk.internal")
        ) {
          const { data: pppkData } = await supabase
            .from("pppk")
            .select("nama, nip")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (pppkData) {
            if (pppkData.nama) setPppkName(pppkData.nama);
            if (pppkData.nip) setPppkNip(pppkData.nip);
          }
        }
      }
    });
  }, []);

  const handleSignOut = async () => {
    try {
      // 1. Destroy session di server (hapus cookies auth, spk_session_time, headers no-cache)
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout API failed:", e);
    }

    try {
      // 2. Sign out di Supabase client
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase client signout failed:", e);
    }

    // 3. Bersihkan client storage
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    // 4. Mencegah browser "Back" kembali ke halaman terlindungi:
    window.history.replaceState(null, "", "/signin");
    window.location.replace("/signin");
  };

  const displayName =
    userRole === "ADMIN"
      ? "Admin SPK"
      : pppkName
      ? pppkName
      : userRole === "PPPK"
      ? "PPPK"
      : userEmail
      ? userEmail.split("@")[0]
      : "Pengguna";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="dropdown-toggle flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/5 max-w-[260px]">
        <UserCircleIcon className="size-5 shrink-0 text-gray-400" />
        <span className="block text-sm font-medium truncate max-w-[180px]">
          {displayName}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-gray-400 transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-2">
        <div className="px-3 py-2 text-xs">
          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
            {displayName}
          </p>
          <p className="truncate text-gray-400 mt-0.5 font-mono">
            {pppkNip ? `NIP: ${pppkNip}` : userEmail || "TNI AL SPK"}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          className="cursor-pointer"
        >
          <LogOutIcon />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
