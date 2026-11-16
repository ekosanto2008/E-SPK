"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ProfileEditableFields from "./editable-fields";
import ProfileReadOnlyFields from "./read-only-fields";
import { pppkProfileSchema, type PppkProfileFormData, type PppkProfileProps } from "./schema";

export default function ProfileForm({ pppk }: { pppk: PppkProfileProps }) {
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PppkProfileFormData>({
    resolver: zodResolver(pppkProfileSchema),
    defaultValues: {
      tempat_lahir: pppk.tempat_lahir || "",
      tanggal_lahir: pppk.tanggal_lahir || "",
      pendidikan: pppk.pendidikan || "",
      alamat: pppk.alamat || "",
      jabatan: pppk.jabatan || "",
      unit_kerja: pppk.unit_kerja || "",
    },
  });

  const onSubmit = async (data: PppkProfileFormData) => {
    setStatusMessage(null);
    try {
      const res = await fetch("/api/pppk/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan profil.");

      setStatusMessage({
        type: "success",
        text: "Data profil Anda berhasil disimpan! Mengalihkan ke dokumen SPK...",
      });

      setTimeout(() => {
        router.push("/pppk/dashboard");
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Gagal menyimpan data profil.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {statusMessage && (
        <Alert
          variant={statusMessage.type === "error" ? "destructive" : "default"}
          className="p-3 text-sm"
        >
          {statusMessage.text}
        </Alert>
      )}

      {!pppk.profil_lengkap && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 p-3 text-sm">
          ⚠️ <strong>Profil Belum Lengkap:</strong> Harap lengkapi data diri Anda di bawah ini sebelum melanjutkan proses penandatanganan SPK. Data ini akan dicantumkan pada Surat Perjanjian Kerja (SPK) Anda.
        </Alert>
      )}

      <ProfileReadOnlyFields nip={pppk.nip} nama={pppk.nama} />

      <ProfileEditableFields register={register} errors={errors} />

      <div className="flex justify-end pt-4">
        <Button size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan Data..." : "Simpan Profil"}
        </Button>
      </div>
    </form>
  );
}

