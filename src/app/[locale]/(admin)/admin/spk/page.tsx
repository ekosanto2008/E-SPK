"use client";

import PageBreadcrumb from "@/components/common/page-breadcrumb";
import AdminSpkManagement from "@/components/admin/spk/admin-spk-management";
import type { AdminSpkValidationItem } from "@/components/admin/spk/types";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

export default function AdminSpkPage() {
  const [items, setItems] = useState<AdminSpkValidationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spk")
        .select(`
          id,
          status,
          scan_ttd_url,
          ttd_pppk_at,
          ttd_laksma_at,
          alasan_tolak,
          pppk:pppk_id (
            id,
            nip,
            nama,
            jabatan,
            unit_kerja
          ),
          batch:batch_id (
            id,
            nomor_surat,
            masa_kerja_mulai,
            masa_kerja_selesai
          )
        `)
        .in("status", ["menunggu_ttd_laksma", "selesai", "ditolak"])
        .order("ttd_pppk_at", { ascending: false });

      if (error) throw error;

      const formatted: AdminSpkValidationItem[] = (data || []).map((row: any) => ({
        id: row.id,
        status: row.status,
        scan_ttd_url: row.scan_ttd_url,
        ttd_pppk_at: row.ttd_pppk_at,
        ttd_laksma_at: row.ttd_laksma_at,
        alasan_tolak: row.alasan_tolak,
        pppk: row.pppk,
        batch: row.batch,
      }));

      setItems(formatted);
    } catch (err) {
      console.error("Gagal mengambil daftar SPK Admin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpks();
  }, [fetchSpks]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Verifikasi & Pengesahan SPK PPPK" />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Memuat berkas SPK masuk...
        </div>
      ) : (
        <AdminSpkManagement initialItems={items} onRefresh={fetchSpks} />
      )}
    </div>
  );
}

