import { z } from "zod";

export const pppkProfileSchema = z.object({
  tempat_lahir: z.string().trim().min(1, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  pendidikan: z.string().trim().min(1, "Pendidikan wajib diisi"),
  alamat: z.string().trim().min(1, "Alamat wajib diisi"),
  jabatan: z.string().trim().min(1, "Jabatan wajib diisi"),
  unit_kerja: z.string().trim().min(1, "Unit kerja wajib diisi"),
});

export type PppkProfileFormData = z.infer<typeof pppkProfileSchema>;

export interface PppkProfileProps {
  id: string;
  nip: string;
  nama: string;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  pendidikan?: string | null;
  alamat?: string | null;
  jabatan?: string | null;
  unit_kerja?: string | null;
  profil_lengkap: boolean;
}

