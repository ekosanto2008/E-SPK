export interface PppkRecord {
  id: string;
  nip: string;
  nama: string;
  kontrak_mulai: string;
  kontrak_selesai: string;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  pendidikan?: string | null;
  alamat?: string | null;
  jabatan?: string | null;
  unit_kerja?: string | null;
  profil_lengkap: boolean;
  spk?: {
    id: string;
    status: "menunggu_ttd_pppk" | "menunggu_ttd_laksma" | "ditolak" | "selesai" | "expired";
    scan_ttd_url?: string | null;
    batch?: {
      nomor_surat: string;
    };
  } | null;
}

export type KontrakStatusType = "habis" | "segera" | "aktif";

export interface BatchGenerateInput {
  nomor_surat: string;
  masa_kerja_mulai: string;
  masa_kerja_selesai: string;
  tanggal_surat: string;
  kepmenhan_nomor?: string;
  kepmenhan_tanggal?: string;
}

