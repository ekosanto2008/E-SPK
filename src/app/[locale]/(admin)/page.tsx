import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPK Digital TNI AL",
  description: "Sistem Informasi Surat Perjanjian Kerja PPPK TNI AL",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;
  if (role === "admin" || user.email === "admin@spk.internal") {
    redirect("/admin/dashboard");
  } else {
    redirect("/pppk/dashboard");
  }
}
