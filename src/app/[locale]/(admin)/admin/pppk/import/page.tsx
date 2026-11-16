import PageBreadcrumb from "@/components/common/page-breadcrumb";
import ExcelImportView from "@/components/admin/pppk/excel-import-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Master PPPK dari Excel | SPK Digital TNI AL",
  description: "Unggah dan impor ribuan data master pegawai PPPK dari berkas Excel ke database Supabase",
};

export default function AdminImportPppkPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Import Master PPPK dari Excel" />
      <ExcelImportView />
    </div>
  );
}

