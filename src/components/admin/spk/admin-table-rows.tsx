"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon } from "@/icons";
import { useState } from "react";
import type { AdminSpkValidationItem } from "./types";

interface AdminTableRowsProps {
  items: AdminSpkValidationItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenReject: (item: AdminSpkValidationItem) => void;
}

export default function AdminTableRows({
  items,
  selectedIds,
  onToggleSelect,
  onOpenReject,
}: AdminTableRowsProps) {
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
            Tidak ada dokumen SPK yang memerlukan penanganan saat ini.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <>
      <TableBody>
        {items.map((row) => {
          const isSelected = selectedIds.includes(row.id);
          const isPending = row.status === "menunggu_ttd_laksma";

          return (
            <TableRow key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
              <TableCell className="w-10">
                {isPending && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(row.id)}
                  />
                )}
              </TableCell>

              <TableCell>
                <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                  {row.pppk.nip}
                </span>
              </TableCell>

              <TableCell>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white/90">{row.pppk.nama}</p>
                  <p className="text-xs text-gray-400">{row.pppk.jabatan || "-"}</p>
                </div>
              </TableCell>

              <TableCell>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {row.batch.nomor_surat}
                </span>
                <p className="text-[11px] text-gray-400">
                  {row.batch.masa_kerja_mulai} s.d. {row.batch.masa_kerja_selesai}
                </p>
              </TableCell>

              <TableCell>
                {row.scan_ttd_url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setPreviewPdfUrl(row.scan_ttd_url!)}
                  >
                    <EyeIcon className="size-3.5 me-1" />
                    Lihat Scan
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">Belum ada</span>
                )}
              </TableCell>

              <TableCell>
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onOpenReject(row)}
                    >
                      Tolak
                    </Button>
                  </div>
                ) : row.status === "selesai" ? (
                  <Badge variant="light" color="success">Sudah Sah</Badge>
                ) : (
                  <Badge variant="light" color="error">Ditolak</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      {/* Modal Pratinjau Scan PDF */}
      <Dialog open={Boolean(previewPdfUrl)} onOpenChange={() => setPreviewPdfUrl(null)}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-4">
          <DialogHeader>
            <DialogTitle>Pratinjau Lembar Pengesahan & Meterai PPPK</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full rounded-xl overflow-hidden border">
            {previewPdfUrl && (
              <iframe
                src={`${previewPdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="Preview Scan PDF"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

