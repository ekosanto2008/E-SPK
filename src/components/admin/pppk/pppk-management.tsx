"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, SearchIcon, UploadIcon } from "@/icons";
import { useMemo, useState } from "react";
import BatchGenerateDialog from "./batch-generate-dialog";
import ImportDialog from "./import-dialog";
import PppkTableRows from "./pppk-table-rows";
import SummaryCards from "./summary-cards";
import type { PppkRecord } from "./types";
import { getKontrakStatus } from "./utils";

interface PppkManagementProps {
  initialRecords: PppkRecord[];
  onRefresh: () => void;
}

export default function PppkManagement({
  initialRecords,
  onRefresh,
}: PppkManagementProps) {
  const [records, setRecords] = useState<PppkRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [filterKontrak, setFilterKontrak] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Filter list
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.nip.toLowerCase().includes(search.toLowerCase()) ||
        r.nama.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filterKontrak !== "all") {
        const kStatus = getKontrakStatus(r.kontrak_selesai).status;
        if (kStatus !== filterKontrak) return false;
      }

      return true;
    });
  }, [records, search, filterKontrak]);

  // Statistik cards
  const stats = useMemo(() => {
    let habis = 0,
      segera = 0,
      aktif = 0;
    records.forEach((r) => {
      const st = getKontrakStatus(r.kontrak_selesai).status;
      if (st === "habis") habis++;
      else if (st === "segera") segera++;
      else aktif++;
    });
    return { total: records.length, habis, segera, aktif };
  }, [records]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedPppkObjects = records.filter((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-6">
      <SummaryCards
        total={stats.total}
        habis={stats.habis}
        segera={stats.segera}
        aktif={stats.aktif}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="Cari NIP atau Nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            </div>

            <select
              value={filterKontrak}
              onChange={(e) => setFilterKontrak(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">Semua Status Kontrak</option>
              <option value="habis">🔴 Kontrak Habis</option>
              <option value="segera">🟡 Habis &lt; 3 Bulan</option>
              <option value="aktif">🟢 Masih Aktif</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              <UploadIcon className="size-4 me-1.5" />
              Import CSV/Excel
            </Button>

            <Button
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => setIsBatchOpen(true)}
            >
              <FileIcon className="size-4 me-1.5" />
              Buat SPK ({selectedIds.length})
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/2">
                <TableCell className="w-10">
                  <Checkbox
                    checked={
                      filtered.length > 0 &&
                      filtered.every((r) => selectedIds.includes(r.id))
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(Boolean(checked))
                    }
                  />
                </TableCell>
                <TableCell className="font-semibold">NIP</TableCell>
                <TableCell className="font-semibold">Nama PPPK</TableCell>
                <TableCell className="font-semibold">Batas Kontrak</TableCell>
                <TableCell className="font-semibold">Status SPK</TableCell>
                <TableCell className="font-semibold">Profil</TableCell>
              </TableRow>
            </TableHeader>
            <PppkTableRows
              records={filtered}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </Table>
        </div>
      </div>

      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => {
          onRefresh();
          setIsImportOpen(false);
        }}
      />

      <BatchGenerateDialog
        open={isBatchOpen}
        onOpenChange={setIsBatchOpen}
        selectedPppks={selectedPppkObjects}
        onSuccess={() => {
          setSelectedIds([]);
          onRefresh();
        }}
      />
    </div>
  );
}

