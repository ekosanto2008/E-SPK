import PageBreadcrumb from "@/components/common/page-breadcrumb";
import DownloadSignedButton from "@/components/pppk/history/download-signed-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, TimeIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Kontrak SPK | SPK Digital TNI AL",
  description: "Riwayat dan arsip dokumen Perjanjian Kerja PPPK yang telah disahkan",
};

export default async function PppkHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: pppk } = await supabase
    .from("pppk")
    .select("id, nip, nama, kontrak_mulai, kontrak_selesai")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pppk) {
    redirect("/signin");
  }

  // Ambil semua daftar SPK (riwayat dan aktif) milik PPPK ini
  const { data: spkList } = await supabase
    .from("spk")
    .select(`
      id,
      status,
      scan_ttd_url,
      ttd_laksma_at,
      created_at,
      spk_batch (
        nomor_surat,
        masa_kerja_mulai,
        masa_kerja_selesai,
        tanggal_surat,
        spk_settings (
          nama_laksma,
          pangkat_laksma,
          jabatan_laksma,
          ttd_laksma_url
        )
      )
    `)
    .eq("pppk_id", pppk.id)
    .order("created_at", { ascending: false });

  const completedSpks = spkList?.filter((s) => s.status === "selesai") || [];

  const formatDateTime = (isoStr?: string | null) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Riwayat Kontrak" />

      {/* Ringkasan Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
              <TimeIcon className="size-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Arsip & Riwayat Perjanjian Kerja (SPK)
              </h2>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {pppk.nama} &bull; NIP: {pppk.nip} &bull; Batas Kontrak Saat Ini: {pppk.kontrak_selesai || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                Total SPK Disahkan
              </span>
              <span className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                {completedSpks.length} Dokumen
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Daftar Riwayat Kontrak */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">
              Daftar Riwayat Perjanjian Kerja
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Seluruh naskah SPK yang telah selesai ditandatangani dan disahkan oleh Kadisminpersal.
            </p>
          </div>
        </div>

        {!spkList || spkList.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Belum ada riwayat kontrak SPK yang tercatat untuk akun Anda.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/2">
                  <TableCell className="font-semibold">Nomor Surat SPK</TableCell>
                  <TableCell className="font-semibold">Masa Perjanjian Kerja</TableCell>
                  <TableCell className="font-semibold">Tanggal Disahkan (Final)</TableCell>
                  <TableCell className="font-semibold">Status Dokumen</TableCell>
                  <TableCell className="font-semibold text-center">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spkList.map((item) => {
                  const batch = item.spk_batch as any;
                  const isFinal = item.status === "selesai";

                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                      <TableCell>
                        <p className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                          {batch?.nomor_surat || "Belum ada nomor"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Tanggal Surat: {batch?.tanggal_surat || "-"}
                        </p>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                          {batch?.masa_kerja_mulai || "-"} s.d. {batch?.masa_kerja_selesai || "-"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {isFinal && item.ttd_laksma_at ? (
                          <div>
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              ✓ {formatDateTime(item.ttd_laksma_at)}
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Oleh {batch?.spk_settings?.jabatan_laksma || "Kadisminpersal"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Belum disahkan
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="light"
                          color={
                            isFinal
                              ? "success"
                              : item.status === "menunggu_ttd_laksma"
                              ? "warning"
                              : item.status === "ditolak"
                              ? "error"
                              : "gray"
                          }
                        >
                          {isFinal
                            ? "🟢 Selesai (Final)"
                            : item.status === "menunggu_ttd_laksma"
                            ? "🟡 Menunggu TTD Kadis"
                            : item.status === "ditolak"
                            ? "🔴 Ditolak"
                            : item.status === "menunggu_ttd_pppk"
                            ? "Menunggu TTD PPPK"
                            : "Kedaluwarsa"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href="/pppk/spk">
                            <Button size="sm" variant="outline" className="text-xs">
                              <FileIcon className="size-3.5 me-1" />
                              Buka Naskah SPK
                            </Button>
                          </Link>

                          {item.scan_ttd_url && (
                            <DownloadSignedButton
                              scanUrl={item.scan_ttd_url}
                              ttdLaksmaUrl={batch?.spk_settings?.ttd_laksma_url}
                              isFinal={isFinal}
                              nip={pppk.nip}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

