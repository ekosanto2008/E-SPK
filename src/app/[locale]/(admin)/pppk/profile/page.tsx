import ComponentCard from "@/components/common/component-card";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ProfileForm from "@/components/pppk/profile/profile-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil Pegawai PPPK | SPK Digital TNI AL",
  description: "Lengkapi data identitas pegawai untuk perjanjian kontrak kerja PPPK",
};

export default async function PppkProfilePage() {
  const supabase = await createClient();

  // 1. Ambil user sesi login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // 2. Ambil data master PPPK yang terhubung dengan user
  const { data: pppk, error } = await supabase
    .from("pppk")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !pppk) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Profil Pegawai" />
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center dark:border-red-900/30 dark:bg-white/3">
          <p className="text-red-600 dark:text-red-400">
            Data PPPK tidak ditemukan untuk akun ini. Pastikan NIP Anda sudah terdaftar oleh Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Data Profil Pegawai" />

      <div className="space-y-6">
        <ComponentCard
          title="Identitas Pihak Kedua (PPPK)"
          desc="Data berikut akan dicantumkan secara resmi pada Surat Perjanjian Kerja (SPK) Anda bersama TNI Angkatan Laut."
        >
          <ProfileForm pppk={pppk} />
        </ComponentCard>
      </div>
    </div>
  );
}
