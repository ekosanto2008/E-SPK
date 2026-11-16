"use client";

import { Document, Image, Page, pdf } from "@react-pdf/renderer";
import React from "react";

// Helper untuk memuat PDF.js jika belum tersedia
async function ensurePdfJsLoaded(): Promise<any> {
  if (typeof window === "undefined") return null;

  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/js/pdf/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = "/js/pdf/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("PDF.js gagal dimuat"));
      }
    };
    script.onerror = () => reject(new Error("Gagal mengambil file pdf.min.js"));
    document.body.appendChild(script);
  });
}

/**
 * Menghasilkan Blob file PDF Lembar Pengesahan Halaman 10 yang lengkap
 * dengan menggabungkan scan TTD PPPK & Meterai dengan TTD Kadisminpersal.
 */
export async function generateSignedPagePdfBlob(
  scanPdfUrl: string,
  ttdLaksmaUrl?: string | null
): Promise<Blob> {
  const pdfjsLib = await ensurePdfJsLoaded();
  if (!pdfjsLib) {
    throw new Error("Lingkungan tidak mendukung pembuatan PDF di sisi klien");
  }

  // 1. Ambil berkas PDF scan sebagai ArrayBuffer
  const pdfResponse = await fetch(scanPdfUrl);
  if (!pdfResponse.ok) {
    throw new Error("Gagal mengunduh berkas scan dari penyimpanan");
  }
  const pdfArrayBuffer = await pdfResponse.arrayBuffer();

  // 2. Render halaman 1 dari scan PDF ke offscreen canvas resolusi tinggi
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Gagal membuat konteks grafis 2D canvas");
  }

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
  }).promise;

  // 3. Bubuhkan gambar tanda tangan Kadisminpersal di kolom Pihak Kesatu jika tersedia
  if (ttdLaksmaUrl) {
    try {
      const imgRes = await fetch(ttdLaksmaUrl);
      if (imgRes.ok) {
        const imgBlob = await imgRes.blob();
        const objectUrl = URL.createObjectURL(imgBlob);

        const ttdImg = new window.Image();
        await new Promise<void>((resolve, reject) => {
          ttdImg.onload = () => resolve();
          ttdImg.onerror = () => reject(new Error("Gagal memuat gambar TTD"));
          ttdImg.src = objectUrl;
        });

        // Koordinat presisi kolom Pihak Kesatu (Kadisminpersal)
        const dx = viewport.width * 0.17;
        const dy = viewport.height * 0.468;
        const dw = viewport.width * 0.25;
        const dh = viewport.height * 0.102;

        ctx.drawImage(ttdImg, dx, dy, dw, dh);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (ttdErr) {
      console.warn("Peringatan saat menempelkan tanda tangan Kadis:", ttdErr);
    }
  }

  // 4. Konversi canvas ke Data URL JPEG kualitas tinggi
  const fullPageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

  // 5. Bungkus dalam dokumen PDF A4 resmi menggunakan @react-pdf/renderer
  const finalPdfBlob = await pdf(
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        {
          size: "A4",
          style: {
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
          },
        },
        React.createElement(Image, {
          src: fullPageDataUrl,
          style: {
            width: "100%",
            height: "100%",
          },
        })
      )
    )
  ).toBlob();

  return finalPdfBlob;
}

