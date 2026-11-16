import {
  DocIcon,
  FileIcon,
  GearIcon,
  KeyIcon,
  LayoutGridIcon,
  UserCircleIcon,
  UsersIcon,
  TimeIcon,
} from "@/icons";
import type { NavItem } from "./types";

// Menu untuk Admin SPK (sekarang memegang seluruh validasi & pengesahan SPK)
export const adminNavItems: NavItem[] = [
  {
    key: "admin-dashboard",
    icon: <LayoutGridIcon className="size-6" />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    key: "admin-pppk",
    icon: <UsersIcon className="size-6" />,
    name: "Data PPPK & Kontrak",
    path: "/admin/pppk",
  },
  {
    key: "admin-spk",
    icon: <DocIcon className="size-6" />,
    name: "Verifikasi & Validasi SPK",
    path: "/admin/spk",
  },
  {
    key: "admin-settings",
    icon: <GearIcon className="size-6" />,
    name: "Pengaturan SPK",
    path: "/admin/settings",
  },
  {
    key: "admin-users",
    icon: <KeyIcon className="size-6" />,
    name: "Kelola Akun & Password",
    path: "/admin/users",
  },
];

// Fallback/Legacy - jika ada role laksma, diarahkan ke adminNavItems
export const laksmaNavItems: NavItem[] = adminNavItems;

// Menu untuk PPPK
export const pppkNavItems: NavItem[] = [
  {
    key: "pppk-dashboard",
    icon: <LayoutGridIcon className="size-6" />,
    name: "Dashboard Saya",
    path: "/pppk/dashboard",
  },
  {
    key: "pppk-profile",
    icon: <UserCircleIcon className="size-6" />,
    name: "Data Profil Saya",
    path: "/pppk/profile",
  },
  {
    key: "pppk-spk",
    icon: <FileIcon className="size-6" />,
    name: "Dokumen SPK",
    path: "/pppk/spk",
  },
  {
    key: "pppk-history",
    icon: <TimeIcon className="size-6" />,
    name: "Riwayat Kontrak",
    path: "/pppk/history",
  },
];

// Default fallback items
export const navItems: NavItem[] = [
  {
    key: "default-dashboard",
    icon: <LayoutGridIcon className="size-6" />,
    name: "Dashboard",
    path: "/",
  },
];

export const othersItems: NavItem[] = [];
export const supportItems: NavItem[] = [];
