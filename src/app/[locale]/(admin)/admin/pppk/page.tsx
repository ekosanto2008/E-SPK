"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import PppkManagement from "@/components/admin/pppk/pppk-management";
import type { PppkRecord } from "@/components/admin/pppk/types";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function AdminPppkPage() {
  const [records, setRecords] = useState<PppkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pppk/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data");
      setRecords(json.data || []);
    } catch (err) {
      console.error("Gagal mengambil data PPPK:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Data PPPK & Kontrak SPK" />
      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Memuat data PPPK...
        </div>
      ) : (
        <PppkManagement initialRecords={records} onRefresh={fetchRecords} />
      )}
    </div>
  );
}

