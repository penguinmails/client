"use client";

import { useState, useEffect } from "react";
import { AdminUsersResponse } from "@/types/admin";
import { AdminUserTable } from "../users/AdminUserTable";
import { AdminUserFilters } from "../users/AdminUserFilters";
import { AdminDashboardSkeleton } from "./AdminDashboardSkeleton";
import { useAuth } from "@/hooks/auth/use-auth";
import { AdminRole } from "@/types/auth";
import { Info, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface AdminDashboardProps {
  initialData?: AdminUsersResponse;
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const { user } = useAuth();
  const t = useTranslations("AdminDashboard");
  const [data, setData] = useState<AdminUsersResponse | null>(
    initialData || null
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (
    search?: string,
    role?: string,
    staffOnly?: boolean
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role) params.set("role", role);
      if (staffOnly) params.set("staff_only", "true");

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = (errorData as Record<string, unknown>)?.error as string || "Unknown error";

        // Check if it's a permission error
        if (response.status === 403 || errorMessage.includes("Forbidden")) {
          throw new Error(t("permissionError", { role: user?.role || "unknown" }));
        }

        throw new Error(
          `Failed to fetch users: ${response.status} - ${errorMessage}`
        );
      }

      const result: AdminUsersResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!data || loading) return;

    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: data.users.length.toString(),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch more users: ${response.status}`);
      }

      const result: AdminUsersResponse = await response.json();
      setData((prev) =>
        prev
          ? {
            ...prev,
            users: [...prev.users, ...result.users],
            pagination: result.pagination,
          }
          : result
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more users"
      );
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  if (loading && !data) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-6">
        <div className="flex">
          <div className="shrink-0">
            <Lock className="h-6 w-6 text-amber-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {t("accessDeniedTitle")}
            </h3>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
              {error}
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md bg-amber-100 dark:bg-amber-900 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800"
              >
                {t("goBackToDashboard")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <AdminDashboardSkeleton />;
  }

  const isSupport = user?.role === AdminRole.SUPPORT;

  return (
    <div className="space-y-6">
      {isSupport && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="shrink-0">
              <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {t("supportNotice")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-muted-foreground truncate">
                    {t("totalUsers")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-foreground">
                    {data.total.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-muted-foreground truncate">
                    {t("staffUsers")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-foreground">
                    {data.users.filter((u) => u.isPenguinMailsStaff).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-muted-foreground truncate">
                    {t("tenants")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-foreground">
                    {data.users.reduce((sum, u) => sum + u.tenantCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-gray-400 dark:text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-muted-foreground truncate">
                    {t("companies")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-foreground">
                    {data.users.reduce((sum, u) => sum + u.companyCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminUserFilters
        onFilter={(search: string, role: string, staffOnly: boolean) =>
          fetchUsers(search, role, staffOnly)
        }
        loading={loading}
      />

      {/* User Table */}
      <AdminUserTable
        users={data.users}
        loading={loading}
        hasMore={data.pagination.hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
}
