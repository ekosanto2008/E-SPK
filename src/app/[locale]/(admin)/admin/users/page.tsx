"use client";

import ComponentCard from "@/components/common/component-card";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import type { UserAccountItem } from "@/components/admin/users/types";
import UserListManagement from "@/components/admin/users/user-list-management";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data akun");
      setUsers(json.users || []);
    } catch (err) {
      console.error("Gagal mengambil data akun pengguna:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Kelola Akun & Reset Password" />

      <ComponentCard
        title="Daftar Akun Pengguna"
        desc="Kelola seluruh akun terdaftar (Admin, Kadisminpersal, dan PPPK) serta lakukan reset kata sandi jika pengguna lupa password."
      >
        {loading ? (
          <div className="flex h-36 items-center justify-center text-sm text-gray-500">
            Memuat daftar pengguna...
          </div>
        ) : (
          <UserListManagement initialUsers={users} onRefresh={fetchUsers} />
        )}
      </ComponentCard>
    </div>
  );
}

