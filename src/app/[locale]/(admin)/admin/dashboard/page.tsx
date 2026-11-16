"use client";

import ComponentCard from "@/components/common/component-card";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, DocIcon, FileIcon, GearIcon, KeyIcon, UsersIcon } from "@/icons";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [totalPppk, setTotalPppk] = useState(0);
  const [pendingPppk, setPendingPppk] = useState(0);
  const [pendingValidation, setPendingValidation] = useState(0);
  const [finished, setFinished] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/dashboard/stats");
        const json = await res.json();
        if (json.stats) {
          setTotalPppk(json.stats.totalPppk);
          setPendingPppk(json.stats.pendingPppk);
          setPendingValidation(json.stats.pendingLaksma);
          setFinished(json.stats.finished);
        }
      } catch (err) {
        console.error("Gagal memuat statistik admin:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Dashboard Admin SPK" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Total Personel PPPK</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-title-lg font-bold text-gray-800 dark:text-white">
              {loading ? "..." : totalPppk}
            </h3>
            <Badge variant="light" color="primary">Terdaftar</Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-white p-5 dark:border-blue-900/30 dark:bg-white/3">
          <p className="text-sm text-blue-600 dark:text-blue-400">Menunggu TTD PPPK</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-title-lg font-bold text-gray-800 dark:text-white">
              {loading ? "..." : pendingPppk}
            </h3>
            <Badge variant="light" color="info">Meterai Fisik</Badge>
          </div>
        </div>

        <Link href="/admin/spk" className="block group">
          <div className="rounded-2xl border border-amber-200 bg-white p-5 transition group-hover:border-amber-400 dark:border-amber-900/30 dark:bg-white/3">
            <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu Validasi SPK</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-title-lg font-bold text-gray-800 dark:text-white">
                {loading ? "..." : pendingValidation}
              </h3>
              <Badge variant="light" color="warning">Perlu Validasi</Badge>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-emerald-200 bg-white p-5 dark:border-emerald-900/30 dark:bg-white/3">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">SPK Selesai (Final)</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-title-lg font-bold text-gray-800 dark:text-white">
              {loading ? "..." : finished}
            </h3>
            <Badge variant="light" color="success">Sah</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComponentCard title="Aksi Cepat Admin" desc="Pintasan ke menu operasional utama SPK">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/admin/pppk">
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <span className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-brand-500" />
                  <span className="text-sm font-medium">Data PPPK & Kontrak</span>
                </span>
                <ArrowRightIcon className="size-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/admin/spk">
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <span className="flex items-center gap-2">
                  <DocIcon className="size-4 text-amber-500" />
                  <span className="text-sm font-medium">Verifikasi & Validasi SPK</span>
                </span>
                <ArrowRightIcon className="size-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/admin/pppk/import">
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <span className="flex items-center gap-2">
                  <FileIcon className="size-4 text-emerald-500" />
                  <span className="text-sm font-medium">Import Excel PPPK</span>
                </span>
                <ArrowRightIcon className="size-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <span className="flex items-center gap-2">
                  <GearIcon className="size-4 text-blue-500" />
                  <span className="text-sm font-medium">Pengaturan SPK & TTD</span>
                </span>
                <ArrowRightIcon className="size-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/admin/users" className="sm:col-span-2">
              <Button variant="outline" className="w-full justify-between h-auto py-3">
                <span className="flex items-center gap-2">
                  <KeyIcon className="size-4 text-purple-500" />
                  <span className="text-sm font-medium">Kelola Akun & Password</span>
                </span>
                <ArrowRightIcon className="size-4 text-gray-400" />
              </Button>
            </Link>
          </div>
        </ComponentCard>

        <ComponentCard title="Panduan Alur SPK Digital" desc="Tahapan penerbitan hingga pengesahan">
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-xs text-brand-500">1</span>
              <span><strong>Import PPPK:</strong> Admin upload data Excel NIP, nama, dan tanggal masa kerja.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-xs text-brand-500">2</span>
              <span><strong>Batch Buat SPK:</strong> Admin pilih PPPK dan terbitkan nomor surat SPK.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-xs text-brand-500">3</span>
              <span><strong>Meterai PPPK:</strong> PPPK mencetak lembar akhir, menempelkan meterai Rp 10.000, TTD, dan mengunggah hasil scan.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-xs text-brand-500">4</span>
              <span><strong>Validasi & Pengesahan Admin:</strong> Admin memeriksa hasil scan meterai PPPK & melakukan validasi pengesahan/TTD serentak.</span>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
