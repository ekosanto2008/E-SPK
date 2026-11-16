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
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { UserAccountItem } from "./types";

interface ResetPasswordModalProps {
  user: UserAccountItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (!user) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          newPassword: newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mereset password.");
      }

      onSuccess();
      onOpenChange(false);
      setNewPassword("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleReset}>
          <DialogHeader>
            <DialogTitle>Reset Password Pengguna</DialogTitle>
            <DialogDescription>
              Atur ulang password untuk akun <strong>{user?.email}</strong>{" "}
              {user?.nama ? `(${user.nama})` : ""}.
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
                Password Baru <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="text"
                placeholder="Masukkan password baru minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

