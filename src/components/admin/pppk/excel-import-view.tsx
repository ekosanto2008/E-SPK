"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DownloadIcon, UploadIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelImportView() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi unduh template Excel contoh
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        nip: "199011182023212031",
        nama: "dr. Chendy Fiollitha Sambuari, MBBS.",
        kontrak_mulai: "2024-03-01",
        kontrak_selesai: "2029-02-28",
      },
      {
        nip: "198505102023211002",
        nama: "Budi Santoso, S.Kep., Ns.",
        kontrak_mulai: "2024-03-01",
        kontrak_selesai: "2029-02-28",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master_PPPK");
    XLSX.writeFile(wb, "Template_Import_Master_PPPK.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          throw new Error("Berkas Excel kosong atau tidak memiliki baris data.");
        }

        setPreviewRows(rawData);
      } catch (err: any) {
        setErrorMsg("Gagal membaca file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessImport = async () => {
    if (previewRows.length === 0) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const recordsToInsert: Array<{
        nip: string;
        nama: string;
        kontrak_mulai: string;
        kontrak_selesai: string;
        profil_lengkap: boolean;
      }> = [];

      for (const r of previewRows) {
        const nip = String(r.nip || r.NIP || "").trim();
        const nama = String(r.nama || r.Nama || r.NAMA || "").trim();
        const kontrak_mulai = String(
          r.kontrak_mulai || r["Tanggal Masuk"] || r["Kontrak Mulai"] || ""
        ).trim();
        const kontrak_selesai = String(
          r.kontrak_selesai || r["Tanggal Selesai"] || r["Kontrak Selesai"] || ""
        ).trim();

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
        throw new Error(
          "Tidak ada baris valid yang ditemukan. Pastikan kolom 'nip', 'nama', 'kontrak_mulai', 'kontrak_selesai' terisi lengkap."
        );
      }

      // Batch upsert melalui server API route
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
      setPreviewRows([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan ke database Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <Alert variant="destructive" className="p-4">
          {errorMsg}
        </Alert>
      )}

      {successCount !== null && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 p-4">
          ✅ Berhasil memasukkan/memperbarui <strong>{successCount} data master PPPK</strong> ke Supabase!
        </Alert>
      )}

      {/* Petunjuk & Download Template */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Format Kolom Excel yang Dibutuhkan
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Gunakan nama kolom berikut pada baris pertama (header) file Excel Anda.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <DownloadIcon className="size-4 me-1.5" />
            Unduh Template Excel (.xlsx)
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 dark:bg-white/5 font-semibold text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-3 text-start">Header Kolom</th>
                <th className="p-3 text-start">Tipe Data</th>
                <th className="p-3 text-start">Keterangan</th>
                <th className="p-3 text-start">Contoh Isi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="p-3 font-mono font-bold text-brand-600">nip</td>
                <td className="p-3">Teks / Angka</td>
                <td className="p-3">Nomor Induk PPPK (Wajib & Unik)</td>
                <td className="p-3 font-mono">199011182023212031</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-brand-600">nama</td>
                <td className="p-3">Teks</td>
                <td className="p-3">Nama Lengkap beserta gelar</td>
                <td className="p-3">dr. Chendy Fiollitha Sambuari, MBBS.</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-brand-600">kontrak_mulai</td>
                <td className="p-3">Tanggal (YYYY-MM-DD)</td>
                <td className="p-3">Tanggal mulai TMT masa kerja</td>
                <td className="p-3 font-mono">2024-03-01</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-brand-600">kontrak_selesai</td>
                <td className="p-3">Tanggal (YYYY-MM-DD)</td>
                <td className="p-3">Tanggal berakhir kontrak kerja</td>
                <td className="p-3 font-mono">2029-02-28</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Area Upload File */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <h4 className="text-base font-bold text-gray-800 dark:text-white mb-3">
          Pilih Berkas Excel
        </h4>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-theme-xs dark:bg-gray-700">
            <UploadIcon className="size-6 text-brand-500" />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
            Klik untuk memilih file Excel (.xlsx / .xls)
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Mendukung ribuan baris data sekaligus
          </p>
        </div>

        {/* Tabel Preview Sebelum Simpan */}
        {previewRows.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-sm text-gray-800 dark:text-white">
                Pratinjau Data ({previewRows.length} baris terbaca)
              </h5>
              <Button onClick={handleProcessImport} disabled={loading} size="sm">
                {loading ? "Menyimpan ke Database..." : `Simpan ${previewRows.length} Data ke Supabase`}
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 dark:border-gray-800">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 dark:bg-white/5 sticky top-0">
                  <tr>
                    <th className="p-2 text-start">NIP</th>
                    <th className="p-2 text-start">Nama</th>
                    <th className="p-2 text-start">Mulai Kontrak</th>
                    <th className="p-2 text-start">Selesai Kontrak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {previewRows.slice(0, 10).map((r, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono">{r.nip || r.NIP}</td>
                      <td className="p-2">{r.nama || r.Nama}</td>
                      <td className="p-2 font-mono">{r.kontrak_mulai || r["Tanggal Masuk"]}</td>
                      <td className="p-2 font-mono">{r.kontrak_selesai || r["Tanggal Selesai"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 10 && (
              <p className="text-[11px] text-gray-400 text-center">
                ... dan {previewRows.length - 10} baris lainnya akan ikut disimpan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

