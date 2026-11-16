"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyIcon, SearchIcon } from "@/icons";
import { useEffect, useMemo, useState } from "react";
import ResetPasswordModal from "./reset-password-modal";
import type { UserAccountItem } from "./types";

interface UserListManagementProps {
  initialUsers: UserAccountItem[];
  onRefresh: () => void;
}

export default function UserListManagement({
  initialUsers,
  onRefresh,
}: UserListManagementProps) {
  const [users, setUsers] = useState<UserAccountItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [targetUser, setTargetUser] = useState<UserAccountItem | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.nama && u.nama.toLowerCase().includes(search.toLowerCase())) ||
        (u.nip && u.nip.includes(search));

      if (!matchSearch) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;

      return true;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="space-y-6">
      {alertSuccess && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 p-3 text-sm">
          {alertSuccess}
        </Alert>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="Cari Email, NIP, atau Nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-9"
              />
              <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">Semua Peran (Role)</option>
              <option value="admin">Admin</option>
              <option value="pppk">PPPK</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/2">
                <TableCell className="font-semibold">Email / Login ID</TableCell>
                <TableCell className="font-semibold">Nama / Identitas</TableCell>
                <TableCell className="font-semibold">Peran (Role)</TableCell>
                <TableCell className="font-semibold">Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada akun pengguna yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2">
                    <TableCell>
                      <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {u.nama || "-"}
                      </p>
                      {u.nip && (
                        <p className="text-xs text-gray-400 font-mono">NIP: {u.nip}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="light"
                        color={
                          u.role === "admin"
                            ? "primary"
                            : u.role === "laksma"
                            ? "warning"
                            : "gray"
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setTargetUser(u)}
                      >
                        <KeyIcon className="size-3.5 me-1 text-amber-500" />
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ResetPasswordModal
        user={targetUser}
        open={Boolean(targetUser)}
        onOpenChange={(open) => !open && setTargetUser(null)}
        onSuccess={() => {
          setAlertSuccess(`Password untuk ${targetUser?.email} berhasil diubah!`);
          setTargetUser(null);
          onRefresh();
        }}
      />
    </div>
  );
}
