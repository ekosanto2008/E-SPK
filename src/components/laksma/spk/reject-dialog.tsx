"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import type { LaksmaSpkItem } from "./types";

interface RejectDialogProps {
  item: LaksmaSpkItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function RejectDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Alasan penolakan wajib diisi agar PPPK dapat memperbaiki.");
      return;
    }

    if (!item) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/laksma/spk/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, reason: reason.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengembalikan berkas.");
      }

      onSuccess();
      onOpenChange(false);
      setReason("");
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengembalikan berkas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleReject}>
          <DialogHeader>
            <DialogTitle>Tolak / Kembalikan Berkas SPK</DialogTitle>
            <DialogDescription>
              Kembalikan berkas ke PPPK <strong>{item?.pppk.nama}</strong> (NIP: {item?.pppk.nip}) untuk diperbaiki dan diunggah ulang.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <Alert variant="destructive" className="p-3 text-sm">
                {errorMsg}
              </Alert>
            )}

            <Field>
              <FieldLabel className="mb-1.5 block">
                Alasan Penolakan <span className="text-red-500">*</span>
              </FieldLabel>
              <Textarea
                placeholder="Contoh: Hasil scan tanda tangan buram/tidak terbaca, atau meterai belum ditandatangani."
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Memproses..." : "Tolak & Kembalikan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

