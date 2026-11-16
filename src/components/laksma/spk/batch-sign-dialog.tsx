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
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import type { LaksmaSpkItem } from "./types";

interface BatchSignConfirmDialogProps {
  items: LaksmaSpkItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function BatchSignConfirmDialog({
  items,
  open,
  onOpenChange,
  onSuccess,
}: BatchSignConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBatchSign = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const ids = items.map((i) => i.id);

      const res = await fetch("/api/laksma/spk/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menandatangani berkas SPK.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menandatangani berkas SPK.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Tanda Tangan SPK Massal</DialogTitle>
          <DialogDescription>
            Anda akan menandatangani dan mengesahkan secara digital sebanyak <strong>{items.length} berkas SPK PPPK</strong> yang telah diverifikasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {errorMsg && (
            <Alert variant="destructive" className="p-3 text-sm">
              {errorMsg}
            </Alert>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-300 space-y-1.5">
            <p className="font-semibold">Perhatian:</p>
            <p>
              &bull; Tanda tangan Anda (yang telah dikonfigurasi di sistem) akan diterapkan ke seluruh berkas terpilih.
            </p>
            <p>
              &bull; Status SPK akan menjadi <strong>Final (Selesai)</strong> dan masa kontrak aktif PPPK akan otomatis diperbarui.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button onClick={handleBatchSign} disabled={loading}>
            {loading ? "Menandatangani..." : `Tandatangani ${items.length} Dokumen`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

