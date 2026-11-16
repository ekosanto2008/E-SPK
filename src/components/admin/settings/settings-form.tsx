"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { spkSettingsSchema, type SpkSettingsFormData } from "./schema";
import SignatureUpload from "./signature-upload";
import type { SpkSettings } from "./types";

interface SettingsFormProps {
  initialData?: SpkSettings | null;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeExistingTtd, setRemoveExistingTtd] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SpkSettingsFormData>({
    resolver: zodResolver(spkSettingsSchema),
    defaultValues: {
      nama_laksma: initialData?.nama_laksma || "",
      pangkat_laksma: initialData?.pangkat_laksma || "Laksamana Pertama TNI",
      jabatan_laksma: initialData?.jabatan_laksma || "Kadisminpersal",
      kepmenhan_nomor: initialData?.kepmenhan_nomor || "",
      kepmenhan_tanggal: initialData?.kepmenhan_tanggal || "",
    },
  });

  const onSubmit = async (data: SpkSettingsFormData) => {
    setStatusMessage(null);
    try {
      let ttdUrl = initialData?.ttd_laksma_url || null;

      if (removeExistingTtd) {
        ttdUrl = null;
      }

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `laksma/ttd_${Date.now()}.${fileExt}`;

        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        uploadFormData.append("bucket", "signatures");
        uploadFormData.append("path", filePath);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(
            `Gagal upload TTD: ${uploadJson.error || "Gagal mengunggah file"}`
          );
        }

        ttdUrl = uploadJson.url;
      }

      const payload = {
        id: initialData?.id || undefined,
        ...data,
        ttd_laksma_url: ttdUrl,
        is_active: true,
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || "Gagal menyimpan pengaturan");
      }

      setStatusMessage({
        type: "success",
        text: "Pengaturan SPK berhasil disimpan!",
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan saat menyimpan pengaturan",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {statusMessage && (
        <Alert
          variant={
            statusMessage.type === "error" ? "destructive" : "default"
          }
          className="p-3 text-sm"
        >
          {statusMessage.text}
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={Boolean(errors.nama_laksma)}>
          <FieldLabel className="mb-1.5 block">
            Nama Laksma TNI <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("nama_laksma")}
            placeholder="Contoh: Bambang Wasito, S.E., M.Han."
          />
          <FieldError errors={[errors.nama_laksma]} />
        </Field>

        <Field data-invalid={Boolean(errors.pangkat_laksma)}>
          <FieldLabel className="mb-1.5 block">
            Pangkat <span className="text-red-500">*</span>
          </FieldLabel>
          <Input {...register("pangkat_laksma")} />
          <FieldError errors={[errors.pangkat_laksma]} />
        </Field>

        <Field data-invalid={Boolean(errors.jabatan_laksma)}>
          <FieldLabel className="mb-1.5 block">
            Jabatan <span className="text-red-500">*</span>
          </FieldLabel>
          <Input {...register("jabatan_laksma")} />
          <FieldError errors={[errors.jabatan_laksma]} />
        </Field>

        <Field data-invalid={Boolean(errors.kepmenhan_nomor)}>
          <FieldLabel className="mb-1.5 block">
            Nomor Kepmenhan <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("kepmenhan_nomor")}
            placeholder="Contoh: KEP/273/II/2024"
          />
          <FieldError errors={[errors.kepmenhan_nomor]} />
        </Field>

        <Field data-invalid={Boolean(errors.kepmenhan_tanggal)}>
          <FieldLabel className="mb-1.5 block">
            Tanggal Kepmenhan <span className="text-red-500">*</span>
          </FieldLabel>
          <Input type="date" {...register("kepmenhan_tanggal")} />
          <FieldError errors={[errors.kepmenhan_tanggal]} />
        </Field>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <FieldLabel className="mb-3 block font-medium">
          Tanda Tangan Digital / Scan Laksma
        </FieldLabel>
        <SignatureUpload
          currentUrl={initialData?.ttd_laksma_url}
          onFileSelect={(file) => {
            setSelectedFile(file);
            setRemoveExistingTtd(false);
          }}
          onRemove={() => {
            setSelectedFile(null);
            setRemoveExistingTtd(true);
          }}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}

