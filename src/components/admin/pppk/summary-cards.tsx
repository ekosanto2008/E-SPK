"use client";

import { Badge } from "@/components/ui/badge";
import { UsersIcon } from "@/icons";

interface SummaryCardsProps {
  total: number;
  habis: number;
  segera: number;
  aktif: number;
}

export default function SummaryCards({
  total,
  habis,
  segera,
  aktif,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total PPPK</p>
            <h3 className="mt-2 text-title-md font-bold text-gray-800 dark:text-white/90">{total}</h3>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
            <UsersIcon className="size-6" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-900/30 dark:bg-white/3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-500 dark:text-red-400">Kontrak Habis</p>
            <h3 className="mt-2 text-title-md font-bold text-red-600 dark:text-red-400">{habis}</h3>
          </div>
          <Badge variant="light" color="error" size="sm">⚠️ Perlu SPK</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-white p-5 dark:border-amber-900/30 dark:bg-white/3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-500 dark:text-amber-400">Habis &lt; 3 Bulan</p>
            <h3 className="mt-2 text-title-md font-bold text-amber-600 dark:text-amber-400">{segera}</h3>
          </div>
          <Badge variant="light" color="warning" size="sm">Perhatian</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-5 dark:border-emerald-900/30 dark:bg-white/3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400">Kontrak Aktif</p>
            <h3 className="mt-2 text-title-md font-bold text-emerald-600 dark:text-emerald-400">{aktif}</h3>
          </div>
          <Badge variant="light" color="success" size="sm">Aman</Badge>
        </div>
      </div>
    </div>
  );
}

