"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { PppkRecord } from "./types";
import { getKontrakStatus, getSpkStatusBadge } from "./utils";

interface PppkTableRowsProps {
  records: PppkRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export default function PppkTableRows({
  records,
  selectedIds,
  onToggleSelect,
}: PppkTableRowsProps) {
  if (records.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
            Tidak ada data PPPK yang ditemukan.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {records.map((row) => {
        const isSelected = selectedIds.includes(row.id);
        const kStatus = getKontrakStatus(row.kontrak_selesai);
        const spkBadge = getSpkStatusBadge(row.spk?.status, kStatus.status);

        return (
          <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
            <TableCell className="w-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(row.id)}
              />
            </TableCell>

            <TableCell>
              <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                {row.nip}
              </span>
            </TableCell>

            {/* Kolom Nama PPPK Saja (Jabatan Dihapus) */}
            <TableCell>
              <p className="font-medium text-gray-800 dark:text-white/90">{row.nama}</p>
            </TableCell>

            <TableCell>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {row.kontrak_selesai}
                </span>
                <div className="mt-1">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${kStatus.badgeClass}`}>
                    {kStatus.label}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${spkBadge.badgeClass}`}>
                {spkBadge.label}
              </span>
              {row.spk?.batch?.nomor_surat && (
                <p className="mt-0.5 text-[11px] text-gray-400 font-mono">
                  No: {row.spk.batch.nomor_surat}
                </p>
              )}
            </TableCell>

            <TableCell>
              <Badge variant="light" color={row.profil_lengkap ? "success" : "gray"}>
                {row.profil_lengkap ? "Lengkap" : "Belum"}
              </Badge>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
}
