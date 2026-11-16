"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ProfileReadOnlyFieldsProps {
  nip: string;
  nama: string;
}

export default function ProfileReadOnlyFields({
  nip,
  nama,
}: ProfileReadOnlyFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-gray-50 dark:bg-white/2 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
      <Field>
        <FieldLabel className="mb-1.5 block text-gray-500">
          Nomor Induk PPPK (NIP)
        </FieldLabel>
        <Input
          value={nip}
          disabled
          className="bg-gray-100 font-mono text-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
        />
      </Field>

      <Field>
        <FieldLabel className="mb-1.5 block text-gray-500">
          Nama Lengkap (Sesuai SK)
        </FieldLabel>
        <Input
          value={nama}
          disabled
          className="bg-gray-100 font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
        />
      </Field>
    </div>
  );
}

