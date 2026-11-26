import { KontrakStatusType } from "./types";

// Batas Usia Pensiun (BUP) PPPK reguler di lingkungan instansi pemerintah / TNI AL
export const BATAS_USIA_PENSIUN = 58;

/**
 * Ekstrak tanggal lahir dari 8 digit pertama NIP (YYYYMMDD).
 * Format NIP ASN/PPPK: 18 digit (contoh: 196901212025211006 -> lahir 21 Januari 1969).
 */
export function getBirthDateFromNip(
  nip: string,
  fallbackTanggalLahir?: string | null
): Date | null {
  const cleanNip = (nip || "").replace(/\D/g, "");
  if (cleanNip.length >= 8) {
    const year = parseInt(cleanNip.substring(0, 4), 10);
    const month = parseInt(cleanNip.substring(4, 6), 10) - 1; // 0-indexed month
    const day = parseInt(cleanNip.substring(6, 8), 10);

    // Validasi range tahun dan tanggal yang wajar
    if (year >= 1940 && year <= 2015 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  if (fallbackTanggalLahir) {
    const d = new Date(fallbackTanggalLahir);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Hitung umur dalam tahun penuh dari tanggal lahir ke tanggal target (default: hari ini).
 */
export function calculateAge(
  birthDate: Date | null,
  targetDate: Date = new Date()
): number | null {
  if (!birthDate) return null;
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const m = targetDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Format tanggal lahir singkat untuk display (contoh: "21 Jan 1969").
 */
export function formatBirthDateShort(date: Date | null): string {
  if (!date) return "-";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Evaluasi status pensiun personel berdasarkan umur saat ini dan proyeksi umur di akhir kontrak.
 */
export function getPensionStatus(
  currentAge: number | null,
  projectedAgeAtEnd?: number | null
): {
  isPension: boolean;
  isNearingPension: boolean;
  label: string;
  badgeClass: string;
  warningNote?: string;
} {
  if (currentAge === null) {
    return {
      isPension: false,
      isNearingPension: false,
      label: "-",
      badgeClass: "",
    };
  }

  // Sudah mencapai atau melampaui batas usia pensiun saat ini (>= 58)
  if (currentAge >= BATAS_USIA_PENSIUN) {
    return {
      isPension: true,
      isNearingPension: true,
      label: `Pensiun (≥${BATAS_USIA_PENSIUN} Th)`,
      badgeClass: "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-400 font-semibold",
      warningNote: `Sudah berusia ${currentAge} tahun (telah mencapai/melebihi BUP ${BATAS_USIA_PENSIUN} tahun).`,
    };
  }

  // Mendekati batas usia pensiun (57 tahun / sisa ≤ 1 tahun menuju 58)
  if (currentAge >= BATAS_USIA_PENSIUN - 1) {
    return {
      isPension: false,
      isNearingPension: true,
      label: "Mendekati Pensiun",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 font-semibold",
      warningNote: `Berusia ${currentAge} tahun (menuju pensiun dalam ≤ 1 tahun).`,
    };
  }

  // Jika masa perpanjangan kontrak baru melampaui batas usia pensiun
  if (projectedAgeAtEnd && projectedAgeAtEnd >= BATAS_USIA_PENSIUN) {
    return {
      isPension: false,
      isNearingPension: true,
      label: "Lewat BUP di Kontrak",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-400 font-semibold",
      warningNote: `Akan mencapai usia pensiun (${projectedAgeAtEnd} tahun) sebelum atau saat masa kontrak baru berakhir.`,
    };
  }

  return {
    isPension: false,
    isNearingPension: false,
    label: "Produktif",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300",
  };
}

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
      label: "Menunggu Validasi Admin",
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
