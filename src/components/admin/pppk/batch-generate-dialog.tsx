"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useEffect, useMemo, useState } from "react";
import type { BatchGenerateInput, PppkRecord } from "./types";
import {
  BATAS_USIA_PENSIUN,
  calculateAge,
  formatBirthDateShort,
  getBirthDateFromNip,
  getKontrakStatus,
} from "./utils";

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
  const [activeConfirmed, setActiveConfirmed] = useState(false);

  const [form, setForm] = useState<BatchGenerateInput>({
    nomor_surat: "",
    masa_kerja_mulai: "",
    masa_kerja_selesai: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    kepmenhan_nomor: "",
    kepmenhan_tanggal: "",
  });

  // Reset checkbox konfirmasi saat dialog dibuka kembali
  useEffect(() => {
    if (open) {
      setActiveConfirmed(false);
      setErrorMsg(null);
    }
  }, [open]);

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

  // Evaluasi batas usia pensiun untuk seluruh PPPK terpilih
  const pensionAudit = useMemo(() => {
    const endContractDate = form.masa_kerja_selesai
      ? new Date(form.masa_kerja_selesai)
      : null;

    const items = selectedPppks.map((p) => {
      const birthDate = getBirthDateFromNip(p.nip, p.tanggal_lahir);
      const currentAge = calculateAge(birthDate);
      const projectedAge =
        birthDate && endContractDate && !isNaN(endContractDate.getTime())
          ? calculateAge(birthDate, endContractDate)
          : null;

      const isAlreadyPension = currentAge !== null && currentAge >= BATAS_USIA_PENSIUN;
      const isNearingPension = currentAge !== null && currentAge === BATAS_USIA_PENSIUN - 1;
      const willExceedInContract =
        !isAlreadyPension &&
        projectedAge !== null &&
        projectedAge >= BATAS_USIA_PENSIUN;

      return {
        pppk: p,
        birthDate,
        currentAge,
        projectedAge,
        isAlreadyPension,
        isNearingPension,
        willExceedInContract,
        needsAttention: isAlreadyPension || isNearingPension || willExceedInContract,
      };
    });

    const affected = items.filter((i) => i.needsAttention);
    return {
      items,
      affected,
      hasIssues: affected.length > 0,
    };
  }, [selectedPppks, form.masa_kerja_selesai]);

  // Cek apakah ada PPPK yang masa kontrak kerjanya masih aktif (> 3 bulan tersisa)
  const activeContractsList = useMemo(() => {
    return selectedPppks.filter(
      (p) => getKontrakStatus(p.kontrak_selesai).status === "aktif"
    );
  }, [selectedPppks]);

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

    // Validasi kontrak masih aktif: wajib konfirmasi jika ada personel yang masa kontraknya belum habis
    if (activeContractsList.length > 0 && !activeConfirmed) {
      setErrorMsg(
        `Validasi Kontrak Aktif: Terdapat ${activeContractsList.length} personel terpilih yang masa kontrak kerjanya masih berstatus AKTIF. Harap periksa rincian di bawah dan berikan tanda centang persetujuan validasi jika ingin menerbitkan SPK perpanjangan lebih awal.`
      );
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat SPK Baru untuk {selectedPppks.length} PPPK</DialogTitle>
            <DialogDescription>
              Penerbitan surat perjanjian kerja perpanjangan kontrak bagi seluruh personel terpilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <Alert variant="destructive" className="p-3 text-sm">
                {errorMsg}
              </Alert>
            )}

            {/* Peringatan SPK yang Sedang Berjalan */}
            {inProgressList.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 p-3 text-xs">
                ⚠️ <strong>Peringatan SPK Berjalan:</strong> {inProgressList.length} PPPK masih memiliki SPK aktif/sedang berproses. Melanjutkan akan mengganti SPK berjalan tersebut dengan SPK baru ini.
              </Alert>
            )}

            {/* Validasi Personel yang Kontrak Kerjanya Masih Aktif */}
            {activeContractsList.length > 0 && (
              <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 p-4 dark:border-emerald-600/60 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Validasi Kontrak Masih Aktif ({activeContractsList.length} Personel Terpilih)
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Sistem mendeteksi ada personel yang masa kontrak kerjanya saat ini <strong>masih aktif</strong> (belum memasuki periode habis kontrak &lt; 3 bulan):
                    </p>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-emerald-200 bg-white/95 dark:border-emerald-900/50 dark:bg-gray-900/90 divide-y divide-emerald-100 dark:divide-gray-800">
                  {activeContractsList.map((p) => (
                    <div key={p.id} className="p-2.5 text-xs flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {p.nama}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">
                            (NIP: {p.nip})
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Masa kontrak saat ini berlaku s.d.{" "}
                          <strong className="text-emerald-700 dark:text-emerald-400">
                            {formatIndonesianDate(p.kontrak_selesai)}
                          </strong>
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        Masih Aktif
                      </span>
                    </div>
                  ))}
                </div>

                {/* Checkbox Konfirmasi Validasi Kontrak Aktif */}
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="confirm-active-checkbox"
                    checked={activeConfirmed}
                    onCheckedChange={(checked) => setActiveConfirmed(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="confirm-active-checkbox"
                    className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 cursor-pointer select-none leading-relaxed"
                  >
                    Saya mengonfirmasi untuk menerbitkan perpanjangan SPK baru lebih awal bagi personel yang kontrak kerjanya masih berstatus aktif di atas.
                  </label>
                </div>
              </div>
            )}

            {/* Validasi Batas Usia Pensiun (BUP 58 Tahun) */}
            {pensionAudit.hasIssues && (
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 dark:border-amber-700/60 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Validasi Batas Usia Pensiun (BUP {BATAS_USIA_PENSIUN} Tahun)
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      Sistem mendeteksi <strong>{pensionAudit.affected.length} personel</strong> yang mendekati atau melampaui usia pensiun (dihitung berdasarkan tanggal lahir pada NIP):
                    </p>
                  </div>
                </div>

                {/* Daftar PPPK yang Terkena Validasi Pensiun */}
                <div className="max-h-48 overflow-y-auto rounded-xl border border-amber-200 bg-white/95 dark:border-amber-900/50 dark:bg-gray-900/90 divide-y divide-amber-100 dark:divide-gray-800">
                  {pensionAudit.affected.map((item) => (
                    <div key={item.pppk.id} className="p-2.5 text-xs flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.pppk.nama}
                          </span>
                          <span className="font-mono text-[11px] text-gray-500">
                            (NIP: {item.pppk.nip})
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Lahir: {formatBirthDateShort(item.birthDate)} &bull; Umur sekarang:{" "}
                          <strong className="text-gray-800 dark:text-gray-200">
                            {item.currentAge} tahun
                          </strong>
                          {item.projectedAge !== null && item.projectedAge !== item.currentAge && (
                            <span>
                              {" "}➔ Di akhir kontrak:{" "}
                              <strong className={item.projectedAge >= BATAS_USIA_PENSIUN ? "text-red-600 font-bold" : ""}>
                                {item.projectedAge} tahun
                              </strong>
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-end">
                        {item.isAlreadyPension ? (
                          <span className="inline-flex rounded-full bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 text-[10px] font-bold">
                            Sudah BUP ({item.currentAge} Th)
                          </span>
                        ) : item.isNearingPension ? (
                          <span className="inline-flex rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                            Mendekati BUP (57 Th)
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-[10px] font-bold">
                            Lewat BUP di Kontrak
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
