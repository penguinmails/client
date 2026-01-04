"use client";

import { ProtectedRoute } from "@/features/auth/ui/components/ProtectedRoute";
import AnalyticsProviderClient from "@/features/analytics/ui/components/AnalyticsProviderClient";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSideBar from "@/features/analytics/ui/components/layout/Sidebar";
import Header from "@/shared/layout/components/DashboardHeader";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AnalyticsProviderClient>
        <SidebarProvider>
          <AppSideBar />
          <SidebarInset className="max-w-10/12 md:peer-data-[variant=inset]:shadow-none gap-5 overflow-hidden">
            <div className="rounded-lg shadow-sm">
              <Header />
            </div>
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 rounded-lg shadow-sm">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AnalyticsProviderClient>
    </ProtectedRoute>
  );
}
