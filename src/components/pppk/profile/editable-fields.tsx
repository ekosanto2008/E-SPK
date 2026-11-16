"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import type { PppkProfileFormData } from "./schema";

interface ProfileEditableFieldsProps {
  register: UseFormRegister<PppkProfileFormData>;
  errors: FieldErrors<PppkProfileFormData>;
}

export default function ProfileEditableFields({
  register,
  errors,
}: ProfileEditableFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={Boolean(errors.tempat_lahir)}>
          <FieldLabel className="mb-1.5 block">
            Tempat Lahir <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("tempat_lahir")}
            placeholder="Contoh: Balikpapan"
          />
          <FieldError errors={[errors.tempat_lahir]} />
        </Field>

        <Field data-invalid={Boolean(errors.tanggal_lahir)}>
          <FieldLabel className="mb-1.5 block">
            Tanggal Lahir <span className="text-red-500">*</span>
          </FieldLabel>
          <Input type="date" {...register("tanggal_lahir")} />
          <FieldError errors={[errors.tanggal_lahir]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={Boolean(errors.pendidikan)}>
          <FieldLabel className="mb-1.5 block">
            Pendidikan Terakhir <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("pendidikan")}
            placeholder="Contoh: S-1 Profesi Dokter Umum"
          />
          <FieldError errors={[errors.pendidikan]} />
        </Field>

        <Field data-invalid={Boolean(errors.jabatan)}>
          <FieldLabel className="mb-1.5 block">
            Jabatan PPPK <span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            {...register("jabatan")}
            placeholder="Contoh: Dokter Ahli Pertama"
          />
          <FieldError errors={[errors.jabatan]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.unit_kerja)}>
        <FieldLabel className="mb-1.5 block">
          Unit Kerja Penempatan <span className="text-red-500">*</span>
        </FieldLabel>
        <Input
          {...register("unit_kerja")}
          placeholder="Contoh: Rumkital dr. Azhar Zahir Manokwari"
        />
        <FieldError errors={[errors.unit_kerja]} />
      </Field>

      <Field data-invalid={Boolean(errors.alamat)}>
        <FieldLabel className="mb-1.5 block">
          Alamat Lengkap <span className="text-red-500">*</span>
        </FieldLabel>
        <Textarea
          {...register("alamat")}
          placeholder="Contoh: Jl. Lembah Hijau RT/RW 002/013 Kel. Wosi, Kec. Manokwari Barat"
          rows={3}
        />
        <FieldError errors={[errors.alamat]} />
      </Field>
    </div>
  );
}

