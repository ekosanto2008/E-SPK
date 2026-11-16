"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { PrinterIcon } from "@/icons";
import { generateSignedPagePdfBlob } from "@/lib/pdf/generate-signed-page";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import type { SpkPrintProps } from "./pdf-page-one";
import { SpkPrintSignatureDoc } from "./pdf-signature-doc";
import UploadScanSection from "./upload-scan-section";
import {
  SpkPageOne,
  SpkPageTwo,
  SpkPageThree,
  SpkPageFour,
  SpkPageFive,
  SpkPageSix,
  SpkPageSeven,
  SpkPageEight,
  SpkPageNine,
  SpkPageTen,
} from "./pages";

interface SpkDocumentViewerProps {
  data: SpkPrintProps;
  spkId: string;
  status: string;
  scanUrl?: string | null;
  alasanTolak?: string | null;
  onRefresh?: () => void;
}

export default function SpkDocumentViewer({
  data,
  spkId,
  status,
  scanUrl,
  alasanTolak,
  onRefresh,
}: SpkDocumentViewerProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [activePage, setActivePage] = useState<number | "all">("all");

  const isFinal = status === "selesai" || status === "disetujui";

  // Cetak Naskah Lengkap (10 Halaman) menggunakan Print Preview Browser A4
  const handlePrintFullDocument = async () => {
    setActivePage("all");

    // Preload gambar tanda tangan Kadis agar pasti ter-load di memori sebelum dialog cetak terbuka
    if (data.laksma.ttdUrl) {
      try {
        const preloadImg = new window.Image();
        preloadImg.src = data.laksma.ttdUrl;
        if (!preloadImg.complete) {
          await new Promise<void>((resolve) => {
            preloadImg.onload = () => resolve();
            preloadImg.onerror = () => resolve();
          });
        }
      } catch {}
    }

    // Beri jeda cukup agar seluruh 10 halaman siap dirender di DOM
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // Cetak/Unduh Halaman 10 saja (jika sudah final, sertakan TTD Kadis & PPPK bermeterai)
  const handlePrintSignaturePage = async () => {
    setDownloading(true);
    try {
      let blob: Blob;

      if (isFinal && scanUrl && data.laksma.ttdUrl) {
        // Jika sudah final, buat berkas pengesahan lengkap dengan TTD Kadis
        blob = await generateSignedPagePdfBlob(scanUrl, data.laksma.ttdUrl);
      } else {
        // Jika belum final, buat lembar tanda tangan kosong untuk ditempel meterai
        blob = await pdf(<SpkPrintSignatureDoc data={data} />).toBlob();
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Halaman_TTD_SPK_${data.pppk.nip}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal generate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  const renderSinglePage = (pageNum: number) => {
    switch (pageNum) {
      case 1:
        return <SpkPageOne data={data} />;
      case 2:
        return <SpkPageTwo />;
      case 3:
        return <SpkPageThree />;
      case 4:
        return <SpkPageFour />;
      case 5:
        return <SpkPageFive />;
      case 6:
        return <SpkPageSix />;
      case 7:
        return <SpkPageSeven />;
      case 8:
        return <SpkPageEight />;
      case 9:
        return <SpkPageNine />;
      case 10:
        return <SpkPageTen data={data} status={status} scanUrl={scanUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Khusus: SPK Telah Final Selesai */}
      {isFinal && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm shadow">
                ✓
              </span>
              <h4 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                Dokumen SPK Telah Sah & Final (Disahkan Kadisminpersal)
              </h4>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1.5 leading-relaxed">
              Perjanjian Kerja ini telah lengkap ditandatangani basah bermeterai oleh Anda dan telah disahkan dengan Tanda Tangan resmi oleh Kadisminpersal. Silakan cetak atau simpan sebagai dokumen PDF lengkap (10 Halaman) sebagai arsip resmi Anda.
            </p>
          </div>

          <Button
            onClick={handlePrintFullDocument}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow font-semibold shrink-0 text-sm px-4 py-2"
          >
            <PrinterIcon className="size-4 me-1.5" />
            Cetak Dokumen Lengkap (10 Hal)
          </Button>
        </div>
      )}

      {/* Alert Status Tolak */}
      {status === "ditolak" && alasanTolak && (
        <Alert variant="destructive" className="p-4 no-print">
          <p className="font-semibold">❌ Dokumen SPK Dikembalikan oleh Admin:</p>
          <p className="mt-1 text-sm italic">&ldquo;{alasanTolak}&rdquo;</p>
          <p className="mt-2 text-xs">
            Silakan cetak ulang halaman pengesahan (Halaman 10), tempel meterai Rp 10.000,- dan tanda tangani dengan jelas, lalu unggah kembali berkas scan PDF Anda di bawah.
          </p>
        </Alert>
      )}

      {/* Header Bar Kontrol Dokumen */}
      <div className="sticky top-16 z-20 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/95 no-print">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">
                Surat Perjanjian Kerja (SPK) PPPK
              </span>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                10 Halaman
              </span>
              {isFinal && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ FINAL
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Nomor: {data.nomorSurat || "R/          /XI/2026"} &bull; {data.pppk.nama} ({data.pppk.nip})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Cetak Naskah Lengkap 10 Halaman */}
            <Button
              onClick={handlePrintFullDocument}
              size="sm"
              variant="outline"
              className="border-brand-500 text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-950/50"
            >
              <PrinterIcon className="size-4 me-1.5" />
              Cetak Dokumen Lengkap (10 Hal)
            </Button>

            {/* Tombol Cetak Khusus Halaman 10 (TTD & Meterai) */}
            <Button
              onClick={handlePrintSignaturePage}
              disabled={downloading}
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              <PrinterIcon className="size-4 me-1.5" />
              {downloading ? "Menyiapkan PDF..." : "Cetak Lembar TTD Saja (Hal 10)"}
            </Button>
          </div>
        </div>

        {/* Tab Navigasi Halaman */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 no-scrollbar">
          <button
            onClick={() => setActivePage("all")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${activePage === "all"
              ? "bg-brand-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            Lihat Semua (Hal 1-10)
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors shrink-0 ${activePage === p
                ? "bg-brand-500 text-white"
                : p === 10
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 font-bold"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              Hal {p} {p === 10 ? "★ (TTD)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Tampilan Lembar Dokumen SPK (A4 Layout Rata Kanan-Kiri Persis Word) */}
      <div className="spk-print-container bg-gray-100 dark:bg-gray-950 p-4 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-8">
        {activePage === "all" ? (
          <>
            <SpkPageOne data={data} />
            <SpkPageTwo />
            <SpkPageThree />
            <SpkPageFour />
            <SpkPageFive />
            <SpkPageSix />
            <SpkPageSeven />
            <SpkPageEight />
            <SpkPageNine />
            <SpkPageTen data={data} status={status} scanUrl={scanUrl} />
          </>
        ) : (
          renderSinglePage(activePage)
        )}
      </div>

      {/* Bagian Upload Scan Tanda Tangan: Hanya aktif jika belum final atau ditolak */}
      {!isFinal && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3 no-print">
          <h4 className="text-base font-bold text-gray-800 dark:text-white mb-1">
            {scanUrl
              ? "Unggah Ulang Lembar Pengesahan Tanda Tangan & Meterai"
              : "Unggah Lembar Pengesahan Tanda Tangan & Meterai"}
          </h4>
          <p className="text-xs text-gray-500 mb-4">
            Unduh/Cetak <strong>Halaman 10</strong> dengan tombol di atas, tempelkan meterai fisik Rp 10.000,- pada area tanda tangan Pihak Kedua, bubuhkan tanda tangan basah di atas meterai. Lalu scan halaman tersebut dan unggah berkas PDF-nya di sini.
          </p>

          <UploadScanSection
            spkId={spkId}
            currentScanUrl={scanUrl}
            onSuccess={() => {
              if (onRefresh) onRefresh();
              router.refresh();
            }}
          />
        </div>
      )}
    </div>
  );
}
