/**
 * Helper untuk memformat tanggal pembuka naskah resmi SPK Halaman 1:
 * "Pada hari ini tanggal [X] bulan [Y] Tahun [Z] yang bertandatangan di bawah ini:"
 */

const BULAN_INDONESIA = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export interface SpkOpeningDateResult {
  tanggal: string;
  bulan: string;
  tahun: string;
  fullText: string;
}

export function formatSpkOpeningDate(dateStr?: string | null): SpkOpeningDateResult {
  if (!dateStr || !dateStr.trim()) {
    return {
      tanggal: "……..",
      bulan: "………",
      tahun: new Date().getFullYear().toString(),
      fullText: `Pada hari ini tanggal…….. bulan………Tahun ${new Date().getFullYear()} yang bertandatangan di bawah ini:`,
    };
  }

  try {
    const trimmed = dateStr.trim();
    const parts = trimmed.split("-");

    if (parts.length === 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);

      const monthName = BULAN_INDONESIA[monthNum] || parts[1];
      const dayStr = isNaN(day) ? parts[2] : day.toString();

      return {
        tanggal: dayStr,
        bulan: monthName,
        tahun: year,
        fullText: `Pada hari ini tanggal ${dayStr} bulan ${monthName} Tahun ${year} yang bertandatangan di bawah ini:`,
      };
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      return {
        tanggal: "……..",
        bulan: "………",
        tahun: new Date().getFullYear().toString(),
        fullText: `Pada hari ini tanggal…….. bulan………Tahun ${new Date().getFullYear()} yang bertandatangan di bawah ini:`,
      };
    }

    const dayStr = d.getDate().toString();
    const monthName = d.toLocaleDateString("id-ID", { month: "long" });
    const yearStr = d.getFullYear().toString();

    return {
      tanggal: dayStr,
      bulan: monthName,
      tahun: yearStr,
      fullText: `Pada hari ini tanggal ${dayStr} bulan ${monthName} Tahun ${yearStr} yang bertandatangan di bawah ini:`,
    };
  } catch {
    return {
      tanggal: "……..",
      bulan: "………",
      tahun: new Date().getFullYear().toString(),
      fullText: `Pada hari ini tanggal…….. bulan………Tahun ${new Date().getFullYear()} yang bertandatangan di bawah ini:`,
    };
  }
}

/**
 * Mengubah format tanggal ISO / YYYY-MM-DD menjadi format baku resmi Indonesia:
 * Contoh: "2027-12-17" -> "17 Desember 2027"
 */
export function formatIndonesianDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return "-";

  const trimmed = dateStr.trim();

  // Jika sudah berformat teks dengan spasi dan nama bulan (misal: "17 Desember 2027")
  if (/[a-zA-Z]/.test(trimmed) && trimmed.includes(" ")) {
    return trimmed;
  }

  // Format YYYY-MM-DD
  const parts = trimmed.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const monthName = BULAN_INDONESIA[monthNum];
    if (monthName && !isNaN(day)) {
      return `${day} ${monthName} ${year}`;
    }
  }

  // Format DD/MM/YYYY
  const slashParts = trimmed.split(/[/]/);
  if (slashParts.length === 3 && slashParts[2].length === 4) {
    const day = parseInt(slashParts[0], 10);
    const monthNum = parseInt(slashParts[1], 10);
    const year = slashParts[2];
    const monthName = BULAN_INDONESIA[monthNum];
    if (monthName && !isNaN(day)) {
      return `${day} ${monthName} ${year}`;
    }
  }

  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthName = BULAN_INDONESIA[d.getMonth() + 1];
      const year = d.getFullYear();
      if (monthName) {
        return `${day} ${monthName} ${year}`;
      }
    }
  } catch {}

  return trimmed;
}

