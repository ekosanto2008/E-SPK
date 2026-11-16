import ComponentCard from "@/components/common/component-card";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import SettingsForm from "@/components/admin/settings/settings-form";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan SPK | SPK Digital TNI AL",
  description: "Pengaturan Pejabat Penandatangan dan Dasar Kepmenhan SPK",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("spk_settings")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <PageBreadcrumb pageTitle="Pengaturan SPK" />

      <div className="space-y-6">
        <ComponentCard
          title="Data Pihak Kesatu & Dasar Perjanjian"
          desc="Atur data Laksma Pertama TNI dan Kepmenhan yang akan tercantum pada setiap dokumen SPK PPPK."
        >
          <SettingsForm initialData={settings} />
        </ComponentCard>
      </div>
    </div>
  );
}

