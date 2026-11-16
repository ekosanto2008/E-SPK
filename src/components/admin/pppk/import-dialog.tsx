"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import Papa from "papaparse";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRecords = async (rows: any[]) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const recordsToInsert: Array<{
        nip: string;
        nama: string;
        kontrak_mulai: string;
        kontrak_selesai: string;
        profil_lengkap: boolean;
      }> = [];

      for (const r of rows) {
        const nip = String(r.nip || r.NIP || "").trim();
        const nama = String(r.nama || r.Nama || r.NAMA || "").trim();
        const kontrak_mulai = String(r.kontrak_mulai || r["Tanggal Masuk"] || r["Kontrak Mulai"] || "").trim();
        const kontrak_selesai = String(r.kontrak_selesai || r["Tanggal Selesai"] || r["Kontrak Selesai"] || "").trim();

        if (nip && nama && kontrak_mulai && kontrak_selesai) {
          recordsToInsert.push({
            nip,
            nama,
            kontrak_mulai,
            kontrak_selesai,
            profil_lengkap: false,
          });
        }
      }

      if (recordsToInsert.length === 0) {
        throw new Error("Tidak ada data valid yang ditemukan dalam file (kolom wajib: nip, nama, kontrak_mulai, kontrak_selesai).");
      }

      // Upsert batch data melalui server API route
      const res = await fetch("/api/admin/pppk/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: recordsToInsert }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengimpor data ke database.");
      }

      setSuccessCount(json.count || recordsToInsert.length);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses file import");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith(".csv");
    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processRecords(results.data);
        },
        error: (err) => {
          setErrorMsg(err.message);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processRecords(data);
        } catch (err: any) {
          setErrorMsg("Gagal membaca file Excel: " + err.message);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Data PPPK (CSV / Excel)</DialogTitle>
          <DialogDescription>
            Unggah berkas untuk memasukkan ribuan data PPPK secara sekaligus. Kolom wajib: <code>nip</code>, <code>nama</code>, <code>kontrak_mulai</code>, <code>kontrak_selesai</code> (format YYYY-MM-DD).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {errorMsg && (
            <Alert variant="destructive" className="p-3 text-sm">
              {errorMsg}
            </Alert>
          )}

          {successCount !== null && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 p-3 text-sm">
              Berhasil mengimpor {successCount} data PPPK!
            </Alert>
          )}

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-theme-xs dark:bg-gray-700">
              <UploadIcon className="size-6 text-brand-500" />
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {loading ? "Sedang memproses..." : "Klik untuk memilih file CSV atau Excel"}
            </p>
            <p className="mt-1 text-xs text-gray-400">File maksimal 5MB</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
