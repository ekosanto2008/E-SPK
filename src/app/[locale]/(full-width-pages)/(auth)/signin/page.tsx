import SignIn from "@/components/others/auth/sign-in";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Masuk | E-SPK Digital TNI AL",
  description: "Halaman Masuk Sistem Informasi Surat Perjanjian Kerja PPPK TNI AL",
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignIn />
    </Suspense>
  );
}
