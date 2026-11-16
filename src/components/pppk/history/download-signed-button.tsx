"use client";

import { Button } from "@/components/ui/button";
import { DownloadIcon } from "@/icons";
import { generateSignedPagePdfBlob } from "@/lib/pdf/generate-signed-page";
import { useState } from "react";

interface DownloadSignedButtonProps {
  scanUrl: string;
  ttdLaksmaUrl?: string | null;
  isFinal: boolean;
  nip: string;
}

export default function DownloadSignedButton({
  scanUrl,
  ttdLaksmaUrl,
  isFinal,
  nip,
}: DownloadSignedButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async () => {
    // Jika belum final atau tidak ada data TTD Kadis, buka file scan asli
    if (!isFinal || !ttdLaksmaUrl) {
      window.open(scanUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsProcessing(true);
    try {
      // Buat berkas PDF pengesahan yang telah dibubuhi TTD Kadisminpersal
      const blob = await generateSignedPagePdfBlob(scanUrl, ttdLaksmaUrl);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Berkas_Pengesahan_SPK_${nip}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error("Gagal membuat berkas pengesahan PDF:", err);
      // Fallback: buka file scan asli jika generator gagal
      window.open(scanUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="text-xs"
      onClick={handleDownload}
      disabled={isProcessing}
    >
      <DownloadIcon className="size-3.5 me-1" />
      {isProcessing ? "Menyiapkan PDF..." : "Berkas TTD"}
    </Button>
  );
}

