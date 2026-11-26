"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import {
  calculateAge,
  getBirthDateFromNip,
  getKontrakStatus,
  BATAS_USIA_PENSIUN,
} from "./utils";

interface PppkManagementProps {
  initialRecords: PppkRecord[];
  onRefresh: () => void;
}

type SortField = "nip" | "nama" | "umur" | "kontrak_selesai" | null;
type SortOrder = "asc" | "desc";

export default function PppkManagement({
  initialRecords,
  onRefresh,
}: PppkManagementProps) {
  const [records, setRecords] = useState<PppkRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [filterOption, setFilterOption] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Sorting state (default: umur desc jika ingin mendahulukan yang tertua/mendekati pensiun)
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Sinkronkan records jika initialRecords berubah dari fetch parent
  useMemo(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // Handle klik header kolom untuk sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        // Toggle kembali ke default atau null
        setSortField(null);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      // Khusus umur defaultnya 'desc' agar yang paling tua/dekat pensiun tampil teratas
      setSortOrder(field === "umur" ? "desc" : "asc");
    }
  };

  // Filter & Sort list
  const filteredAndSorted = useMemo(() => {
    const list = records.filter((r) => {
      const matchSearch =
        r.nip.toLowerCase().includes(search.toLowerCase()) ||
        r.nama.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      const birthDate = getBirthDateFromNip(r.nip, r.tanggal_lahir);
      const age = calculateAge(birthDate);

      if (filterOption === "habis") {
        return getKontrakStatus(r.kontrak_selesai).status === "habis";
      }
      if (filterOption === "segera") {
        return getKontrakStatus(r.kontrak_selesai).status === "segera";
      }
      if (filterOption === "aktif") {
        return getKontrakStatus(r.kontrak_selesai).status === "aktif";
      }
      if (filterOption === "mendekati_pensiun") {
        // Usia 57 tahun (1 tahun menuju 58)
        return age !== null && age === BATAS_USIA_PENSIUN - 1;
      }
      if (filterOption === "capai_pensiun") {
        // Usia >= 58 tahun
        return age !== null && age >= BATAS_USIA_PENSIUN;
      }
      if (filterOption === "semua_pensiun") {
        // Usia >= 57 tahun (mendekati atau sudah pensiun)
        return age !== null && age >= BATAS_USIA_PENSIUN - 1;
      }

      return true;
    });

    if (sortField) {
      list.sort((a, b) => {
        if (sortField === "umur") {
          const ageA = calculateAge(getBirthDateFromNip(a.nip, a.tanggal_lahir)) ?? -1;
          const ageB = calculateAge(getBirthDateFromNip(b.nip, b.tanggal_lahir)) ?? -1;
          return sortOrder === "asc" ? ageA - ageB : ageB - ageA;
        }

        if (sortField === "nama") {
          return sortOrder === "asc"
            ? a.nama.localeCompare(b.nama)
            : b.nama.localeCompare(a.nama);
        }

        if (sortField === "nip") {
          return sortOrder === "asc"
            ? a.nip.localeCompare(b.nip)
            : b.nip.localeCompare(a.nip);
        }

        if (sortField === "kontrak_selesai") {
          return sortOrder === "asc"
            ? a.kontrak_selesai.localeCompare(b.kontrak_selesai)
            : b.kontrak_selesai.localeCompare(a.kontrak_selesai);
        }

        return 0;
      });
    }

    return list;
  }, [records, search, filterOption, sortField, sortOrder]);

  // Statistik cards
  const stats = useMemo(() => {
    let habis = 0,
      segera = 0,
      aktif = 0,
      nearingPension = 0;
    records.forEach((r) => {
      const st = getKontrakStatus(r.kontrak_selesai).status;
      if (st === "habis") habis++;
      else if (st === "segera") segera++;
      else aktif++;

      const birthDate = getBirthDateFromNip(r.nip, r.tanggal_lahir);
      const age = calculateAge(birthDate);
      if (age !== null && age >= BATAS_USIA_PENSIUN - 1) {
        nearingPension++;
      }
    });
    return { total: records.length, habis, segera, aktif, nearingPension };
  }, [records]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredAndSorted.map((r) => r.id));
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

  // Render sort icon helper
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <span className="ms-1 text-gray-400 opacity-60 text-xs">↕</span>;
    }
    return (
      <span className="ms-1 text-brand-600 dark:text-brand-400 font-bold text-xs">
        {sortOrder === "asc" ? "▲ (Naik)" : "▼ (Turun)"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <SummaryCards
        total={stats.total}
        habis={stats.habis}
        segera={stats.segera}
        aktif={stats.aktif}
      />

      {/* Banner informasi jika ada personel mendekati batas usia pensiun */}
      {stats.nearingPension > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-500/10 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold">
                Perhatian Batas Usia Pensiun (BUP {BATAS_USIA_PENSIUN} Tahun)
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Terdapat <strong>{stats.nearingPension} personel PPPK</strong> yang telah mendekati usia pensiun (≥ 57 tahun). Pastikan masa perpanjangan kontrak disesuaikan sebelum membuat SPK baru.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFilterOption("semua_pensiun");
              setSortField("umur");
              setSortOrder("desc");
            }}
            className="shrink-0 text-xs h-8 bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700"
          >
            Lihat Personel (≥ 57 Th)
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
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
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">Semua Data PPPK</option>
              <optgroup label="Status Kontrak">
                <option value="habis">🔴 Kontrak Habis</option>
                <option value="segera">🟡 Habis &lt; 3 Bulan</option>
                <option value="aktif">🟢 Masih Aktif</option>
              </optgroup>
              <optgroup label="Status Batas Usia Pensiun (BUP 58 Th)">
                <option value="semua_pensiun">⚠️ Mendekati &amp; Capai Pensiun (≥ 57 Th)</option>
                <option value="mendekati_pensiun">🟡 Mendekati Pensiun (57 Th)</option>
                <option value="capai_pensiun">⛔ Sudah Capai Pensiun (≥ 58 Th)</option>
              </optgroup>
            </select>

            {sortField && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500 hover:text-gray-800"
                onClick={() => setSortField(null)}
              >
                Reset Urutan
              </Button>
            )}
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
                      filteredAndSorted.length > 0 &&
                      filteredAndSorted.every((r) => selectedIds.includes(r.id))
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAll(Boolean(checked))
                    }
                  />
                </TableCell>

                <TableCell
                  onClick={() => handleSort("nip")}
                  className="cursor-pointer font-semibold select-none hover:text-brand-600 transition"
                >
                  NIP {renderSortIndicator("nip")}
                </TableCell>

                <TableCell
                  onClick={() => handleSort("nama")}
                  className="cursor-pointer font-semibold select-none hover:text-brand-600 transition"
                >
                  Nama PPPK {renderSortIndicator("nama")}
                </TableCell>

                {/* Kolom Umur dengan Fitur Sortir */}
                <TableCell
                  onClick={() => handleSort("umur")}
                  className="cursor-pointer font-semibold select-none hover:text-brand-600 transition"
                  title="Klik untuk mengurutkan berdasarkan Umur"
                >
                  <span className="flex items-center">
                    Umur {renderSortIndicator("umur")}
                  </span>
                </TableCell>

                <TableCell
                  onClick={() => handleSort("kontrak_selesai")}
                  className="cursor-pointer font-semibold select-none hover:text-brand-600 transition"
                >
                  Habis Kontrak {renderSortIndicator("kontrak_selesai")}
                </TableCell>

                <TableCell className="font-semibold">Status SPK</TableCell>
                <TableCell className="font-semibold">Profil</TableCell>
              </TableRow>
            </TableHeader>
            <PppkTableRows
              records={filteredAndSorted}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </Table>
        </div>
      </div>

      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={onRefresh}
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
