"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import type { PppkRecord } from "./types";
import {
  calculateAge,
  formatBirthDateShort,
  getBirthDateFromNip,
  getKontrakStatus,
  getPensionStatus,
  getSpkStatusBadge,
} from "./utils";

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
          <TableCell colSpan={7} className="text-center py-8 text-gray-400">
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

        // Hitung umur dari NIP (dengan fallback tanggal_lahir jika ada)
        const birthDate = getBirthDateFromNip(row.nip, row.tanggal_lahir);
        const age = calculateAge(birthDate);
        const pensionInfo = getPensionStatus(age);

        return (
          <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
            <TableCell className="w-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(row.id)}
              />
            </TableCell>

            {/* NIP */}
            <TableCell>
              <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                {row.nip}
              </span>
            </TableCell>

            {/* Nama PPPK */}
            <TableCell>
              <p className="font-medium text-gray-800 dark:text-white/90">{row.nama}</p>
            </TableCell>

            {/* Umur & Status Pensiun (Bisa di-sort) */}
            <TableCell>
              {age !== null ? (
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {age} tahun
                    </span>
                    {pensionInfo.isNearingPension && (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.2 text-[11px] ${pensionInfo.badgeClass}`}
                        title={pensionInfo.warningNote}
                      >
                        {pensionInfo.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Lahir: {formatBirthDateShort(birthDate)}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-gray-400">-</span>
              )}
            </TableCell>

            {/* Habis Kontrak */}
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

            {/* Status SPK */}
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

            {/* Kelengkapan Profil */}
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
