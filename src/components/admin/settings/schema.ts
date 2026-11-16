import { z } from "zod";

export const spkSettingsSchema = z.object({
  nama_laksma: z.string().trim().min(1, "Nama Laksma wajib diisi"),
  pangkat_laksma: z.string().trim().min(1, "Pangkat wajib diisi"),
  jabatan_laksma: z.string().trim().min(1, "Jabatan wajib diisi"),
  kepmenhan_nomor: z.string().trim().min(1, "Nomor Kepmenhan wajib diisi"),
  kepmenhan_tanggal: z.string().min(1, "Tanggal Kepmenhan wajib diisi"),
});

export type SpkSettingsFormData = z.infer<typeof spkSettingsSchema>;

