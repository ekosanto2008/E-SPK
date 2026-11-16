"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DownloadIcon, FileIcon } from "@/icons";
import { generateSignedPagePdfBlob } from "@/lib/pdf/generate-signed-page";
import type { SpkPrintProps } from "../pdf-page-one";

interface SpkPageTenProps {
  data: SpkPrintProps;
  status?: string;
  scanUrl?: string | null;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

export default function SpkPageTen({
  data,
  status,
  scanUrl,
}: SpkPageTenProps) {
  // Mode default: Selalu "naskah" agar ukuran dan format 100% seragam dan matching dengan Hal 1-9
  const [viewMode, setViewMode] = useState<"naskah" | "full_scan">("naskah");
  const [renderStatus, setRenderStatus] = useState<"loading" | "ready" | "error">(
    scanUrl ? "loading" : "ready"
  );

  // Canvas khusus untuk mengekstrak/menampilkan area meterai & TTD basah dari scan
  const meteraiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Canvas untuk mode full scan jika user ingin melihat lembar mentah
  const fullScanCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const pppkNama = data.pppk.nama || "dr. Chendy Fiollitha Sambuari, MBBS.";
  const pppkNip = data.pppk.nip || "199011182023212031";

  const laksmaNama = data.laksma.nama || "Bambang Wasito, S.E., M.Han.";
  const laksmaPangkat = data.laksma.pangkat || "Laksamana Pertama TNI";
  const laksmaJabatan = data.laksma.jabatan || "Kadisminpersal";
  const ttdLaksmaUrl = data.laksma.ttdUrl;

  const isFinalApproved = status === "disetujui" || status === "selesai";
  const isLaksmaSigned = isFinalApproved && !!ttdLaksmaUrl;

  const [isDownloadingScan, setIsDownloadingScan] = useState(false);

  const handleDownloadScanPdf = async () => {
    if (!scanUrl) return;

    if (!isLaksmaSigned || !ttdLaksmaUrl) {
      window.open(scanUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsDownloadingScan(true);
    try {
      const blob = await generateSignedPagePdfBlob(scanUrl, ttdLaksmaUrl);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Berkas_Pengesahan_SPK_${pppkNip}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat PDF scan bertanda tangan:", err);
      window.open(scanUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloadingScan(false);
    }
  };

  // Ekstrak potongan meterai + TTD basah dari berkas scan PDF secara native
  useEffect(() => {
    if (!scanUrl) return;

    let isCancelled = false;

    const loadAndRenderSignatures = async () => {
      try {
        setRenderStatus("loading");

        // 1. Pastikan PDF.js termuat dari file lokal
        if (!window.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.getElementById("pdfjs-core-script") as HTMLScriptElement | null;
            if (existing) {
              if ((existing as any)._loaded) {
                resolve();
              } else {
                existing.addEventListener("load", () => resolve());
                existing.addEventListener("error", (e) => reject(e));
              }
              return;
            }

            const script = document.createElement("script");
            script.id = "pdfjs-core-script";
            script.src = "/js/pdf/pdf.min.js";
            script.onload = () => {
              (script as any)._loaded = true;
              resolve();
            };
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
          });
        }

        if (isCancelled) return;

        const pdfjs = window.pdfjsLib;
        if (!pdfjs) throw new Error("PDF.js library tidak terdeteksi");

        pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf/pdf.worker.min.js";

        // 2. Fetch via internal proxy
        const targetUrl = `/api/pdf-proxy?url=${encodeURIComponent(scanUrl)}`;
        const loadingTask = pdfjs.getDocument({
          url: targetUrl,
          withCredentials: false,
        });

        const pdfDoc = await loadingTask.promise;
        if (isCancelled) return;

        const page = await pdfDoc.getPage(1);
        if (isCancelled) return;

        // Skala 2.5 untuk ketajaman ultra HD
        const viewport = page.getViewport({ scale: 2.5 });

        // Buat canvas offscreen untuk render 1 halaman penuh
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const offscreenCtx = offscreenCanvas.getContext("2d");
        if (!offscreenCtx) return;

        await page.render({
          canvasContext: offscreenCtx,
          viewport: viewport,
        }).promise;

        if (isCancelled) return;

        // A. Potong HANYA area meterai dan tanda tangan PPPK (Pihak Kedua)
        // Koordinat eksak 1:1 sesuai ukuran asli di PDF:
        // x0 = 364.74 pt, y0 = 370.48 pt, width = 190.11 pt (67.07 mm), height = 102.0 pt (36.0 mm)
        const cropX = viewport.width * (364.74 / 595.28);
        const cropY = viewport.height * (370.48 / 841.89);
        const cropW = viewport.width * (190.11 / 595.28);
        const cropH = viewport.height * (102.0 / 841.89);

        const targetMeteraiCanvas = meteraiCanvasRef.current;
        if (targetMeteraiCanvas) {
          targetMeteraiCanvas.width = cropW;
          targetMeteraiCanvas.height = cropH;
          const targetCtx = targetMeteraiCanvas.getContext("2d");
          if (targetCtx) {
            targetCtx.clearRect(0, 0, cropW, cropH);
            targetCtx.drawImage(
              offscreenCanvas,
              cropX,
              cropY,
              cropW,
              cropH,
              0,
              0,
              cropW,
              cropH
            );

            // Bersihkan background kertas scan agar 100% transparan dan tidak meninggalkan border kotak
            try {
              const imgData = targetCtx.getImageData(0, 0, cropW, cropH);
              const data = imgData.data;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Hitung kecerahan (luminance) dan selisih saturasi
                const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const saturation = maxC === 0 ? 0 : (maxC - minC) / maxC;

                // Jika mendekati warna kertas scanner putih/abu-abu kotor (bukan tinta TTD & bukan meterai berwarna)
                if (luminance > 225 && saturation < 0.12) {
                  data[i + 3] = 0; // 100% transparan
                } else if (luminance > 195 && saturation < 0.12) {
                  // Gradasi lembut pada tepi potongan kertas agar tidak bergaris kotak
                  const alphaFactor = (225 - luminance) / 30;
                  data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, alphaFactor)));
                }
              }
              targetCtx.putImageData(imgData, 0, 0);
            } catch (cleanErr) {
              console.warn("Background cleaning skipped:", cleanErr);
            }
          }
        }

        // B. Jika user membuka mode full_scan, render ke fullScanCanvasRef
        const targetFullCanvas = fullScanCanvasRef.current;
        if (targetFullCanvas) {
          targetFullCanvas.width = viewport.width;
          targetFullCanvas.height = viewport.height;
          const fullCtx = targetFullCanvas.getContext("2d");
          if (fullCtx) {
            fullCtx.drawImage(offscreenCanvas, 0, 0);
          }
        }

        if (!isCancelled) {
          setRenderStatus("ready");
        }
      } catch (err) {
        console.error("Gagal memproses crop meterai/TTD dari scan:", err);
        if (!isCancelled) {
          setRenderStatus("error");
        }
      }
    };

    loadAndRenderSignatures();

    return () => {
      isCancelled = true;
    };
  }, [scanUrl, viewMode]);

  return (
    <div className="spk-a4-page bg-white text-black font-['Arial',sans-serif] text-[12pt] leading-[1.4] p-10 sm:p-14 shadow-md rounded-sm border border-gray-200 max-w-[800px] mx-auto min-h-[1100px] flex flex-col justify-between relative">
      <div>
        {/* Nomor Halaman Atas Tengah: Seragam persis Hal 1-9 */}
        <div className="text-center mb-6 font-bold text-[11pt]">-10-</div>

        {/* Bilah Kontrol / Status Scan Realtime (Disembunyikan saat Print Preview) */}
        {scanUrl && (
          <div className="mb-6 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
              <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px]">
                ✓
              </span>
              <span>Lembar Tanda Tangan & Meterai Fisik Terverifikasi</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-emerald-100/80 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("naskah")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === "naskah"
                      ? "bg-white text-emerald-900 shadow-xs font-bold"
                      : "text-emerald-700 hover:text-emerald-950"
                  }`}
                >
                  Format Naskah Resmi (Standar Cetak)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("full_scan")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === "full_scan"
                      ? "bg-white text-emerald-900 shadow-xs font-bold"
                      : "text-emerald-700 hover:text-emerald-950"
                  }`}
                >
                  Lihat Lembar Scan Penuh
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadScanPdf}
                disabled={isDownloadingScan}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <DownloadIcon className="size-3.5" />
                {isDownloadingScan ? "Menyiapkan PDF..." : "Unduh PDF Scan"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAMPILAN ALTERNATIF: LEMBAR SCAN PENUH (JIKA DIKLIK USER)
           ======================================================== */}
        {viewMode === "full_scan" && scanUrl ? (
          <div className="space-y-4">
            <div className="relative w-full rounded border border-gray-200 shadow-xs overflow-hidden bg-white">
              <canvas ref={fullScanCanvasRef} className="w-full h-auto block" />
              {ttdLaksmaUrl && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    top: "46.8%",
                    left: "17%",
                    width: "25%",
                    height: "10.2%",
                  }}
                >
                  <img
                    src={ttdLaksmaUrl}
                    alt="TTD Kadisminpersal"
                    className="object-contain max-h-full max-w-full"
                    loading="eager"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 text-center italic no-print">
              *Tampilan ini hanya untuk verifikasi lembar fisik penuh. Untuk mencetak dengan ukuran seragam, gunakan mode &ldquo;Format Naskah Resmi&rdquo;.
            </p>
          </div>
        ) : (
          /* ========================================================
              TAMPILAN UTAMA: FORMAT NASKAH RESMI (100% MATCHING DENGAN HAL 1-9)
              - Ukuran, padding, margin, dan font persis seragam
              - TTD Kadisminpersal di sebelah kiri
              - Meterai Rp 10.000 + TTD Basah asli dari scan di sebelah kanan
             ======================================================== */
          <>
            {/* Pasal 13 */}
            <div className="text-center mb-2">
              <p className="font-bold">Pasal 13</p>
              <p className="font-bold">Lain-lain</p>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex gap-2 spk-text-justify">
                <span className="w-6 shrink-0">(1)</span>
                <p>
                  Pihak Kedua bersedia melaksanakan seluruh ketentuan yang telah diatur dalam peraturan kedinasan dan peraturan lainnya yang berlaku di Pihak Kesatu.
                </p>
              </div>
              <div className="flex gap-2 spk-text-justify">
                <span className="w-6 shrink-0">(2)</span>
                <p>
                  Pihak Kedua wajib menyimpan dan menjaga kerahasiaan baik dokumen maupun informasi milik Pihak Kesatu sesuai dengan ketentuan peraturan perundang-undangan.
                </p>
              </div>
              <div className="flex gap-2 spk-text-justify">
                <span className="w-6 shrink-0">(3)</span>
                <p>
                  Pihak Kesatu dapat memperpanjang masa Perjanjian Kerja yang dilaksanakan sesuai dengan peraturan-perundang-undangan.
                </p>
              </div>
            </div>

            {/* Paragraf Penutup */}
            <p className="spk-text-justify mb-8 indent-8">
              Demikian Perjanjian Kerja ini dibuat dalam rangkap 2 (dua) oleh pihak Kesatu dan Pihak Kedua dalam keadaan sehat dan sadar serta tanpa pengaruh ataupun paksaan dari pihak manapun, masing-masing bermeterai cukup dan mempunyai kekuatan hukum yang sama.
            </p>

            {/* Blok Tanda Tangan: Simetris dan sejajar lurus */}
            <div className="grid grid-cols-2 gap-6 mt-6 pt-2">
              {/* Kolom Kiri: Pihak Kesatu */}
              <div className="flex flex-col justify-between items-center text-center min-h-[270px]">
                {/* Header Jabatan Pihak Kesatu (3 baris) */}
                <div className="flex flex-col items-center min-h-[75px]">
                  <p className="font-bold mb-0.5">Pihak Kesatu,</p>
                  <p className="text-[11pt]">a.n. Kepala Staf Angkatan Laut</p>
                  <p className="text-[11pt]">{laksmaJabatan},</p>
                </div>

                {/* Area Tanda Tangan Kadis: Selalu tampil jika ttdLaksmaUrl tersedia */}
                <div className="w-[67mm] max-w-full h-[38mm] flex items-center justify-center relative my-1">
                  {ttdLaksmaUrl ? (
                    <img
                      src={ttdLaksmaUrl}
                      alt="TTD Kadisminpersal"
                      className="object-contain max-h-[38mm] w-auto block mx-auto"
                      loading="eager"
                      decoding="sync"
                      style={{
                        maxHeight: "38mm",
                        width: "auto",
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                        backgroundColor: "transparent",
                      }}
                    />
                  ) : (
                    <div className="h-[38mm] w-[67mm]" />
                  )}
                </div>

                {/* Nama & Pangkat Pihak Kesatu (Tanpa Underline) */}
                <div className="flex flex-col items-center min-h-[45px]">
                  <p className="font-bold text-[11pt]">{laksmaNama}</p>
                  <p className="text-[11pt]">{laksmaPangkat}</p>
                </div>
              </div>

              {/* Kolom Kanan: Pihak Kedua */}
              <div className="flex flex-col justify-between items-center text-center min-h-[270px]">
                {/* Header Pihak Kedua (3 baris seimbang) */}
                <div className="flex flex-col items-center min-h-[75px]">
                  <p className="font-bold mb-0.5">Pihak Kedua,</p>
                  <p className="text-[11pt] invisible select-none">&nbsp;</p>
                  <p className="text-[11pt] invisible select-none">&nbsp;</p>
                </div>

                {/* Area Meterai & TTD Basah PPPK - Ukuran Eksak 100% 1:1 Fisik (67mm x 36mm) */}
                <div className="w-[67mm] max-w-full h-[38mm] flex items-center justify-center relative my-1">
                  {scanUrl ? (
                    <div className="relative flex items-center justify-center h-full w-full">
                      {/* Canvas Berisi Potongan Meterai Fisik Rp 10.000 + TTD Basah dari Berkas Scan */}
                      <canvas
                        ref={meteraiCanvasRef}
                        className={`w-[67mm] h-[36mm] max-w-full object-contain border-0 outline-none shadow-none block mx-auto ${
                          renderStatus === "loading" ? "opacity-0" : "opacity-100"
                        } transition-opacity duration-300`}
                        style={{
                          width: "67mm",
                          height: "36mm",
                          border: "none",
                          outline: "none",
                          boxShadow: "none",
                          mixBlendMode: "multiply",
                          backgroundColor: "transparent",
                        }}
                      />

                      {/* Loading state sederhana saat canvas sedang merender */}
                      {renderStatus === "loading" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic animate-pulse">
                            Memuat meterai & TTD...
                          </span>
                        </div>
                      )}

                      {/* Fallback jika canvas gagal merender */}
                      {renderStatus === "error" && (
                        <div className="h-24 w-40 border-2 border-emerald-500 rounded-lg flex flex-col items-center justify-center text-center p-2 bg-emerald-50/70">
                          <span className="text-xs font-bold text-emerald-800">
                            ✓ Meterai Rp 10.000,-
                          </span>
                          <span className="text-[8pt] text-gray-600 font-semibold">
                            Ditandatangani Basah
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Area Kosong Bersih untuk Meterai & Tanda Tangan Basah Fisik */
                    <div className="w-[67mm] max-w-full h-[38mm] flex items-center justify-center" />
                  )}
                </div>

                {/* Nama & NIP Pihak Kedua (Tanpa Underline) */}
                <div className="flex flex-col items-center min-h-[45px]">
                  <p className="font-bold text-[11pt]">{pppkNama}</p>
                  <p className="text-[11pt]">NI. {pppkNip}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
