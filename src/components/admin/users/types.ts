export interface UserAccountItem {
  id: string;
  email: string;
  role: "admin" | "laksma" | "pppk";
  nip?: string | null;
  nama?: string | null;
  created_at: string;
}

