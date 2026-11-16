import ComponentCard from "@/components/common/component-card";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import SpkDocumentViewer from "@/components/pppk/spk/spk-document-viewer";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dokumen SPK Saya | SPK Digital TNI AL",
  description: "Surat Perjanjian Kerja PPPK dan Pengesahan Tanda Tangan",
};

export default async function PppkSpkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // 1. Ambil PPPK
  const { data: pppk } = await supabase
    .from("pppk")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pppk) {
    redirect("/signin");
  }

  // Cek apakah profil sudah lengkap
  if (!pppk.profil_lengkap) {
    redirect("/pppk/profile");
  }

  // 2. Ambil SPK aktif PPPK
  const { data: spk } = await supabase
    .from("spk")
    .select(`
      id,
      status,
      scan_ttd_url,
      alasan_tolak,
      spk_batch (
        nomor_surat,
        masa_kerja_mulai,
        masa_kerja_selesai,
        tanggal_surat,
        spk_settings (
          nama_laksma,
          pangkat_laksma,
          jabatan_laksma,
          kepmenhan_nomor,
          kepmenhan_tanggal,
          ttd_laksma_url
        )
      )
    `)
    .eq("pppk_id", pppk.id)
    .neq("status", "expired")
    .maybeSingle();

  if (!spk || !spk.spk_batch) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selesaiDate = pppk.kontrak_selesai ? new Date(pppk.kontrak_selesai) : null;
    if (selesaiDate) selesaiDate.setHours(0, 0, 0, 0);
    const isAktif = selesaiDate ? selesaiDate.getTime() > today.getTime() : false;

    return (
      <div>
        <div className="no-print">
          <PageBreadcrumb pageTitle="Dokumen SPK" />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/3 space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xl">
            {isAktif ? "🟢" : "ℹ️"}
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white">
            {isAktif ? "Status Kontrak Anda Masih Aktif" : "Belum Ada Draf SPK Baru"}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {isAktif
              ? `Perjanjian Kerja Anda saat ini berstatus aktif hingga tanggal ${pppk.kontrak_selesai}. Anda tidak perlu menandatangani kontrak baru saat ini.`
              : "Belum ada draf Surat Perjanjian Kerja (SPK) yang dibuat oleh Admin untuk Anda saat ini."}
          </p>
        </div>
      </div>
    );
  }

  const batch = (spk.spk_batch as any);
  const settings = batch.spk_settings;

  const spkData = {
    nomorSurat: batch.nomor_surat,
    tanggalSurat: batch.tanggal_surat,
    laksma: {
      nama: settings?.nama_laksma || "",
      pangkat: settings?.pangkat_laksma || "",
      jabatan: settings?.jabatan_laksma || "",
      kepmenhanNomor: settings?.kepmenhan_nomor || "",
      kepmenhanTanggal: settings?.kepmenhan_tanggal || "",
      ttdUrl: settings?.ttd_laksma_url || "",
    },
    pppk: {
      nama: pppk.nama,
      nip: pppk.nip,
      tempatLahir: pppk.tempat_lahir || "",
      tanggalLahir: pppk.tanggal_lahir || "",
      pendidikan: pppk.pendidikan || "",
      alamat: pppk.alamat || "",
      jabatan: pppk.jabatan || "",
      unitKerja: pppk.unit_kerja || "",
    },
    masaKerjaMulai: batch.masa_kerja_mulai,
    masaKerjaSelesai: batch.masa_kerja_selesai,
  };

  return (
    <div>
      <div className="no-print">
        <PageBreadcrumb pageTitle="Dokumen SPK" />
      </div>

      <SpkDocumentViewer
        data={spkData}
        spkId={spk.id}
        status={spk.status}
        scanUrl={spk.scan_ttd_url}
        alasanTolak={spk.alasan_tolak}
      />
    </div>
  );
}

