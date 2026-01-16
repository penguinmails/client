import { Suspense } from "react";
import { AdminDashboard } from "@/features/admin/ui/components/dashboard/AdminDashboard";
import { AdminDashboardSkeleton } from "@/features/admin/ui/components/dashboard/AdminDashboardSkeleton";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        <Suspense fallback={<AdminDashboardSkeleton />}>
          <AdminDashboard />
        </Suspense>
      </div>
    </div>
  );
}
