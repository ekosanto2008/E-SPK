export interface SpkSettings {
  id?: string;
  nama_laksma: string;
  pangkat_laksma: string;
  jabatan_laksma: string;
  kepmenhan_nomor: string;
  kepmenhan_tanggal: string;
  ttd_laksma_url?: string | null;
  is_active?: boolean;
}

export interface SettingsFormProps {
  initialData?: SpkSettings | null;
  onSaved?: () => void;
}

