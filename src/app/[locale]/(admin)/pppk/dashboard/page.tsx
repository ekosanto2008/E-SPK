import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon, TimeIcon, UserCircleIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard PPPK | SPK Digital TNI AL",
  description: "Status Perjanjian Kerja Pegawai Pemerintah dengan Perjanjian Kerja",
};

export default async function PppkDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: pppk } = await supabase
    .from("pppk")
    .select(`
      *,
      spk (
        id,
        status,
        scan_ttd_url,
        alasan_tolak,
        ttd_laksma_at,
        created_at,
        spk_batch (
          nomor_surat,
          masa_kerja_mulai,
          masa_kerja_selesai,
          tanggal_surat,
          spk_settings (
            jabatan_laksma
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pppk) {
    redirect("/signin");
  }

  const allSpks = Array.isArray(pppk.spk) ? pppk.spk : pppk.spk ? [pppk.spk] : [];
  const activeSpk = allSpks.find((s: any) => s.status !== "expired");
  const completedSpks = allSpks.filter((s: any) => s.status === "selesai");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selesaiDate = pppk.kontrak_selesai ? new Date(pppk.kontrak_selesai) : null;
  if (selesaiDate) selesaiDate.setHours(0, 0, 0, 0);
  const isKontrakAktif = selesaiDate ? selesaiDate.getTime() > today.getTime() : false;

  const needsSignature = activeSpk && (activeSpk.status === "menunggu_ttd_pppk" || activeSpk.status === "ditolak");

  const formatDateTime = (isoStr?: string | null) => {
    if (!isoStr) return "-";
    try {
      const d = new Date(isoStr);
      return (
        d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB"
      );
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Dashboard Pegawai" />

      {/* Profil Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 font-bold text-xl dark:bg-brand-500/10">
              ⚓
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {pppk.nama}
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                NIP: {pppk.nip} &bull; Batas Kontrak: {pppk.kontrak_selesai || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/pppk/profile">
              <Button variant="outline" size="sm">
                <UserCircleIcon className="size-4 me-1.5" />
                {pppk.profil_lengkap ? "Edit Data Profil" : "Lengkapi Profil"}
              </Button>
            </Link>

            <Link href="/pppk/history">
              <Button variant="outline" size="sm">
                <TimeIcon className="size-4 me-1.5" />
                Riwayat Kontrak ({completedSpks.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Card Status Dokumen SPK Aktif */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-white">Status Perjanjian Kerja (SPK)</h3>
          {activeSpk ? (
            <Badge
              variant="light"
              color={
                activeSpk.status === "selesai"
                  ? "success"
                  : activeSpk.status === "ditolak"
                  ? "error"
                  : "warning"
              }
            >
              {activeSpk.status === "selesai"
                ? "🟢 SPK Final (Selesai)"
                : activeSpk.status === "ditolak"
                ? "🔴 Ditolak"
                : activeSpk.status === "menunggu_ttd_laksma"
                ? "🟡 Menunggu TTD Kadis"
                : "🔵 Menunggu TTD & Meterai Anda"}
            </Badge>
          ) : isKontrakAktif ? (
            <Badge variant="light" color="success">🟢 Kontrak Aktif</Badge>
          ) : (
            <Badge variant="light" color="error">🔴 Kontrak Habis</Badge>
          )}
        </div>

        {activeSpk ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nomor Surat: <span className="font-mono font-medium text-gray-800 dark:text-white">{activeSpk.spk_batch?.nomor_surat}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Masa Perjanjian: {activeSpk.spk_batch?.masa_kerja_mulai} s.d. {activeSpk.spk_batch?.masa_kerja_selesai}
            </p>

            {activeSpk.status === "selesai" && activeSpk.ttd_laksma_at && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 inline-block">
                ✓ Telah disahkan Final pada tanggal: <strong>{formatDateTime(activeSpk.ttd_laksma_at)}</strong> oleh {activeSpk.spk_batch?.spk_settings?.jabatan_laksma || "Kadisminpersal"}
              </p>
            )}

            <div className="pt-2 flex items-center gap-3">
              <Link href="/pppk/spk">
                <Button size="sm">
                  <FileIcon className="size-4 me-1.5" />
                  {needsSignature ? "Buka Dokumen SPK & Proses TTD" : "Lihat Dokumen SPK Lengkap"}
                </Button>
              </Link>

              <Link href="/pppk/history">
                <Button size="sm" variant="outline">
                  <TimeIcon className="size-4 me-1.5" />
                  Buka Riwayat Kontrak
                </Button>
              </Link>
            </div>
          </div>
        ) : isKontrakAktif ? (
          <div className="space-y-2 py-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Status kepegawaian Anda saat ini berstatus <span className="font-semibold text-emerald-600 dark:text-emerald-400">AKTIF</span> hingga tanggal <span className="font-mono font-semibold">{pppk.kontrak_selesai}</span>.
            </p>
            <p className="text-xs text-gray-500">
              Anda tidak perlu menandatangani kontrak baru saat ini. SPK perpanjangan baru akan diterbitkan saat masa kontrak Anda mendekati batas berakhir.
            </p>
            <div className="pt-2">
              <Link href="/pppk/history">
                <Button size="sm" variant="outline">
                  <TimeIcon className="size-4 me-1.5" />
                  Lihat Riwayat Kontrak Anda
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">
            Masa kontrak Anda telah berakhir. Menunggu penerbitan draf SPK perpanjangan baru dari Admin.
          </p>
        )}
      </div>

      {/* Card Ringkasan Riwayat Kontrak */}
      {completedSpks.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/3 space-y-4">
          <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">
                Riwayat Pengesahan Kontrak SPK
              </h3>
              <p className="text-xs text-gray-500">
                Arsip Surat Perjanjian Kerja (SPK) yang telah sah secara hukum.
              </p>
            </div>
            <Link href="/pppk/history">
              <Button variant="outline" size="sm">
                Lihat Semua ({completedSpks.length})
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {completedSpks.slice(0, 3).map((item: any) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-bold text-gray-800 dark:text-white">
                    {item.spk_batch?.nomor_surat || "SPK Final"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Masa Kontrak: {item.spk_batch?.masa_kerja_mulai} s.d. {item.spk_batch?.masa_kerja_selesai}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Disahkan Final: {formatDateTime(item.ttd_laksma_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/pppk/spk">
                    <Button size="sm" variant="outline" className="text-xs">
                      <FileIcon className="size-3.5 me-1" />
                      Lihat Naskah
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
