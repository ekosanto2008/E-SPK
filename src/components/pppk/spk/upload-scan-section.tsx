"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import { useRef, useState } from "react";

interface UploadScanProps {
  spkId: string;
  currentScanUrl?: string | null;
  onSuccess: () => void;
}

export default function UploadScanSection({
  spkId,
  currentScanUrl,
  onSuccess,
}: UploadScanProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Berkas harus berformat PDF.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setErrorMsg("Ukuran file maksimal 1 MB.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Upload scan PDF ke bucket 'scans' via server route
      const filePath = `scans/${spkId}/ttd_materai_${Date.now()}.pdf`;
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("bucket", "scans");
      uploadFormData.append("path", filePath);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(`Gagal mengunggah berkas: ${uploadJson.error || "Gagal upload"}`);
      }

      const scanUrl = uploadJson.url;

      // 3. Update status SPK menjadi 'menunggu_ttd_laksma' via server API route
      const updateRes = await fetch("/api/pppk/spk/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spkId, scanUrl }),
      });

      const updateJson = await updateRes.json();
      if (!updateRes.ok) {
        throw new Error(updateJson.error || "Gagal mengupdate status SPK");
      }

      setSuccessMsg("Dokumen SPK bertandatangan dan bermeterai berhasil dikirim untuk divalidasi!");
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses unggahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <Alert variant="destructive" className="p-3 text-sm">
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 p-3 text-sm">
          {successMsg}
        </Alert>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-theme-xs dark:bg-gray-700">
          <UploadIcon className="size-6 text-brand-500" />
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {loading
            ? "Sedang Mengunggah & Memvalidasi..."
            : currentScanUrl
            ? "Klik untuk Mengunggah Ulang Dokumen Scan"
            : "Klik untuk Memilih File Scan PDF"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Format PDF asli scan 1 halaman &bull; Maksimal 1 MB
        </p>
      </div>
    </div>
  );
}

