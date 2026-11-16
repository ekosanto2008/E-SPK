"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocIcon, SearchIcon } from "@/icons";
import { useMemo, useState } from "react";
import BatchSignConfirmDialog from "./batch-sign-dialog";
import LaksmaTableRows from "./laksma-table-rows";
import RejectDialog from "./reject-dialog";
import type { LaksmaSpkItem } from "./types";

interface LaksmaSpkManagementProps {
  initialItems: LaksmaSpkItem[];
  onRefresh: () => void;
}

export default function LaksmaSpkManagement({
  initialItems,
  onRefresh,
}: LaksmaSpkManagementProps) {
  const [items, setItems] = useState<LaksmaSpkItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"pending" | "signed" | "all">("pending");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [rejectTarget, setRejectTarget] = useState<LaksmaSpkItem | null>(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.pppk.nip.toLowerCase().includes(search.toLowerCase()) ||
        item.pppk.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.batch.nomor_surat.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (tabFilter === "pending") return item.status === "menunggu_ttd_laksma";
      if (tabFilter === "signed") return item.status === "selesai";

      return true;
    });
  }, [items, search, tabFilter]);

  const pendingItems = useMemo(
    () => filtered.filter((i) => i.status === "menunggu_ttd_laksma"),
    [filtered]
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingItems.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedObjects = items.filter((i) => selectedIds.includes(i.id));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="Cari NIP, Nama, atau No SPK..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            </div>

            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setTabFilter("pending")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  tabFilter === "pending"
                    ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Menunggu TTD ({items.filter((i) => i.status === "menunggu_ttd_laksma").length})
              </button>
              <button
                onClick={() => setTabFilter("signed")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  tabFilter === "signed"
                    ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Sudah Disahkan ({items.filter((i) => i.status === "selesai").length})
              </button>
              <button
                onClick={() => setTabFilter("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  tabFilter === "all"
                    ? "bg-white text-gray-800 shadow-theme-xs dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          <Button
            size="sm"
            disabled={selectedIds.length === 0}
            onClick={() => setIsBatchOpen(true)}
          >
            <DocIcon className="size-4 me-1.5" />
            Tandatangani Serentak ({selectedIds.length})
          </Button>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/2">
                <TableCell className="w-10">
                  <Checkbox
                    checked={
                      pendingItems.length > 0 &&
                      pendingItems.every((r) => selectedIds.includes(r.id))
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(Boolean(checked))
                    }
                  />
                </TableCell>
                <TableCell className="font-semibold">NIP</TableCell>
                <TableCell className="font-semibold">Nama PPPK</TableCell>
                <TableCell className="font-semibold">Nomor & Masa SPK</TableCell>
                <TableCell className="font-semibold">Berkas Scan</TableCell>
                <TableCell className="font-semibold">Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <LaksmaTableRows
              items={filtered}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onOpenReject={(target) => setRejectTarget(target)}
            />
          </Table>
        </div>
      </div>

      <RejectDialog
        item={rejectTarget}
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        onSuccess={() => {
          setRejectTarget(null);
          onRefresh();
        }}
      />

      <BatchSignConfirmDialog
        items={selectedObjects}
        open={isBatchOpen}
        onOpenChange={setIsBatchOpen}
        onSuccess={() => {
          setSelectedIds([]);
          onRefresh();
        }}
      />
    </div>
  );
}

