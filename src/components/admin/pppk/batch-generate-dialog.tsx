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
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { formatIndonesianDate, formatSpkOpeningDate } from "@/utils/spk-date-formatter";
import { useEffect, useState } from "react";
import type { BatchGenerateInput, PppkRecord } from "./types";

interface BatchGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPppks: PppkRecord[];
  onSuccess: () => void;
}

export default function BatchGenerateDialog({
  open,
  onOpenChange,
  selectedPppks,
  onSuccess,
}: BatchGenerateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState<BatchGenerateInput>({
    nomor_surat: "",
    masa_kerja_mulai: "",
    masa_kerja_selesai: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    kepmenhan_nomor: "",
    kepmenhan_tanggal: "",
  });

  // Ambil nilai bawaan Nomor & Tanggal Kepmenhan dari setting aktif
  useEffect(() => {
    if (open) {
      supabase
        .from("spk_settings")
        .select("kepmenhan_nomor, kepmenhan_tanggal")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setForm((prev) => ({
              ...prev,
              kepmenhan_nomor: prev.kepmenhan_nomor || data.kepmenhan_nomor || "",
              kepmenhan_tanggal: prev.kepmenhan_tanggal || data.kepmenhan_tanggal || "",
            }));
          }
        });
    }
  }, [open]);

  // Cek apakah ada PPPK yang sedang memiliki SPK aktif berjalan (belum selesai/expired)
  const inProgressList = selectedPppks.filter(
    (p) =>
      p.spk &&
      (p.spk.status === "menunggu_ttd_pppk" ||
        p.spk.status === "menunggu_ttd_laksma" ||
        p.spk.status === "ditolak")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.nomor_surat ||
      !form.masa_kerja_mulai ||
      !form.masa_kerja_selesai ||
      !form.tanggal_surat ||
      !form.kepmenhan_nomor ||
      !form.kepmenhan_tanggal
    ) {
      setErrorMsg("Semua kolom bertanda bintang (*) wajib diisi.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/spk/batch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pppk_ids: selectedPppks.map((p) => p.id),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal membuat batch SPK");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuat batch SPK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat SPK Baru untuk {selectedPppks.length} PPPK</DialogTitle>
            <DialogDescription>
              Nomor surat dan masa perjanjian kerja berikut akan berlaku untuk seluruh PPPK yang dipilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <Alert variant="destructive" className="p-3 text-sm">
                {errorMsg}
              </Alert>
            )}

            {inProgressList.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 p-3 text-xs">
                ⚠️ <strong>Peringatan:</strong> {inProgressList.length} PPPK masih memiliki SPK aktif/sedang berproses. Melanjutkan akan membatalkan SPK berjalan tersebut dan menggantinya dengan SPK baru ini.
              </Alert>
            )}

            <Field>
              <FieldLabel className="mb-1.5 block">
                Nomor Surat SPK <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                placeholder="Contoh: R/001/XI/2026"
                value={form.nomor_surat}
                onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="mb-1.5 block">
                  Masa Kerja Mulai <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="date"
                  value={form.masa_kerja_mulai}
                  onChange={(e) => setForm({ ...form, masa_kerja_mulai: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel className="mb-1.5 block">
                  Masa Kerja Selesai <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="date"
                  value={form.masa_kerja_selesai}
                  onChange={(e) => setForm({ ...form, masa_kerja_selesai: e.target.value })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel className="mb-1.5 block">
                Tanggal Surat SPK / Pembukaan Perjanjian (Halaman 1) <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="date"
                value={form.tanggal_surat}
                onChange={(e) => setForm({ ...form, tanggal_surat: e.target.value })}
              />
              <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                <span className="font-semibold block mb-0.5">
                  Teks yang tampil di Halaman 1 Naskah SPK:
                </span>
                <p className="italic text-[11px] bg-white/80 dark:bg-black/30 p-1.5 rounded border border-blue-100 dark:border-blue-900/30">
                  &ldquo;{formatSpkOpeningDate(form.tanggal_surat).fullText}&rdquo;
                </p>
              </div>
            </Field>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Dasar Hukum Kepmenhan (Pihak Kesatu - Halaman 1)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="mb-1.5 block">
                    Nomor Kepmenhan <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    placeholder="Contoh: KEP/273/II/2024"
                    value={form.kepmenhan_nomor || ""}
                    onChange={(e) => setForm({ ...form, kepmenhan_nomor: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel className="mb-1.5 block">
                    Tanggal Kepmenhan <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input
                    type="date"
                    value={form.kepmenhan_tanggal || ""}
                    onChange={(e) => setForm({ ...form, kepmenhan_tanggal: e.target.value })}
                  />
                </Field>
              </div>

              {form.kepmenhan_nomor && (
                <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <span className="font-semibold block mb-0.5">
                    Teks Dasar Hukum di Halaman 1:
                  </span>
                  <p className="italic text-[11px] bg-white/80 dark:bg-black/30 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                    &ldquo;... berdasarkan Kepmenhan Nomor: {form.kepmenhan_nomor} tanggal {formatIndonesianDate(form.kepmenhan_tanggal)}, untuk selanjutnya disebut Pihak Kesatu.&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Simpan & Buat SPK"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

