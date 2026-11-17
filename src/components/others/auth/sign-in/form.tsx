"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useRouter } from "@/i18n/navigation";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { supabase } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { signInSchema, type SignInFormData } from "./schema";

export default function SignInFormFields() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
      keepLoggedIn: true,
    },
    mode: "onTouched",
  });

  const handleFormSubmit = async (data: SignInFormData) => {
    setErrorMessage(null);
    try {
      // 1. Panggil API Route untuk verifikasi NIP / Email & Lazy Registration
      const res = await fetch("/api/auth/login-nip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorMessage(json.error || "Gagal masuk");
        return;
      }

      // 2. Login menggunakan Supabase Client
      const emailToLogin = json.email;
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: emailToLogin,
          password: data.password,
        });

      if (authError || !authData.user) {
        if (authError?.message === "Invalid login credentials") {
          const isEmail = data.identifier.trim().includes("@");
          setErrorMessage(
            isEmail
              ? "Kata sandi yang Anda masukkan tidak sesuai. Silakan periksa kembali kredensial akun Anda."
              : "Kata sandi yang Anda masukkan tidak sesuai. Bagi personel yang baru pertama kali mengakses sistem, silakan gunakan NIP sebagai kata sandi awal."
          );
        } else {
          setErrorMessage(authError?.message || "Gagal melakukan autentikasi ke sistem.");
        }
        return;
      }

      // 3. Ambil role user dari tabel profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      let userRole = profile?.role;
      if (!userRole) {
        if (emailToLogin === "admin@spk.internal") userRole = "admin";
        else userRole = "pppk";
      }

      // 4. Inisialisasi masa aktif sesi 1 jam (3600 detik) & role di server cookies
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: userRole,
          nip: json.nip || null,
        }),
      });

      // 5. Redirect sesuai role dengan location.replace agar history signin terganti
      if (userRole === "admin") {
        window.location.replace("/admin/dashboard");
      } else {
        // Cek kelengkapan profil PPPK
        const { data: pppkInfo } = await supabase
          .from("pppk")
          .select("profil_lengkap")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        if (pppkInfo && !pppkInfo.profil_lengkap) {
          window.location.replace("/pppk/profile");
        } else {
          window.location.replace("/pppk/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan tidak terduga");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
      noValidate
    >
      {reason === "session_expired" && !errorMessage && (
        <Alert variant="warning" className="p-3 text-sm">
          Sesi Anda telah berakhir setelah 1 jam. Silakan masuk kembali demi keamanan.
        </Alert>
      )}

      {reason === "unauthorized" && !errorMessage && (
        <Alert variant="warning" className="p-3 text-sm">
          Silakan masuk terlebih dahulu untuk mengakses sistem.
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="p-3 text-sm">
          {errorMessage}
        </Alert>
      )}

      <Field data-invalid={Boolean(errors.identifier)}>
        <FieldLabel className="mb-1.5 block">
          NIP <span className="text-red-500">*</span>
        </FieldLabel>
        <Input
          {...register("identifier")}
          type="text"
          placeholder=""
          aria-invalid={errors.identifier ? "true" : undefined}
        />
        <FieldError errors={[errors.identifier]} />
      </Field>

      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel className="mb-1.5 block">
          Password <span className="text-red-500">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder=""
            aria-invalid={errors.password ? "true" : undefined}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-gray-500 dark:text-gray-400"
            >
              {showPassword ? (
                <EyeIcon className="fill-current" />
              ) : (
                <EyeCloseIcon className="fill-current" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldError errors={[errors.password]} />
      </Field>

      <div className="flex items-center justify-between">
        <Field orientation="horizontal" className="w-auto items-center gap-3">
          <Controller
            control={control}
            name="keepLoggedIn"
            render={({ field }) => (
              <Checkbox
                id="keep-logged-in"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
            )}
          />
          <FieldLabel
            htmlFor="keep-logged-in"
            className="text-theme-sm block cursor-pointer font-normal text-gray-700 dark:text-gray-400"
          >
            Ingat saya
          </FieldLabel>
        </Field>
      </div>

      <div>
        <Button
          className="w-full"
          size="lg"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </div>
    </form>
  );
}


