import { KontrakStatusType } from "./types";

export function getKontrakStatus(kontrakSelesaiStr: string): {
  status: KontrakStatusType;
  label: string;
  badgeClass: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selesai = new Date(kontrakSelesaiStr);
  selesai.setHours(0, 0, 0, 0);

  const diffTime = selesai.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      status: "habis",
      label: "Kontrak Habis",
      badgeClass: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400",
    };
  }

  if (diffDays <= 90) {
    return {
      status: "segera",
      label: "< 3 Bulan",
      badgeClass: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400",
    };
  }

  return {
    status: "aktif",
    label: "Aktif",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400",
  };
}

export function getSpkStatusBadge(
  status?: string,
  kontrakStatus?: KontrakStatusType
): {
  label: string;
  badgeClass: string;
} {
  // Jika saat ini sedang ada proses SPK baru yang berjalan:
  if (status === "menunggu_ttd_pppk") {
    return {
      label: "Menunggu TTD PPPK",
      badgeClass: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400",
    };
  }
  if (status === "ditolak") {
    return {
      label: "Ditolak (Upload Ulang)",
      badgeClass: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400",
    };
  }
  if (status === "menunggu_ttd_laksma") {
    return {
      label: "Menunggu TTD Kadis",
      badgeClass: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400",
    };
  }

  // Jika masa kontrak sudah mendekati habis (< 3 Bulan) dan belum ada SPK baru yang dibuat:
  if (kontrakStatus === "segera") {
    return {
      label: "Siapkan SPK Baru",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400",
    };
  }

  // Jika masa kontrak sudah habis dan belum ada SPK baru yang dibuat:
  if (kontrakStatus === "habis") {
    return {
      label: "Perlu SPK Baru",
      badgeClass: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400",
    };
  }

  // Jika kontrak masih aktif (> 3 Bulan):
  if (status === "selesai") {
    return {
      label: "Final (Selesai)",
      badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400",
    };
  }

  return {
    label: "Kontrak Aktif",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400",
  };
}
