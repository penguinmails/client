import React from "react";
import { cn } from "@/shared/utils";
import DashboardHeader from "@/shared/layout/components/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function DashboardLayout({
  children,
  title,
  className,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="rounded-lg shadow-sm">
            <DashboardHeader />
          </div>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 rounded-lg shadow-sm">
            <div className={cn("space-y-6", className)}>
              {/* Header Section */}
              {title && (
                <div className="border-b border-border pb-4">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
              )}

              {/* Main Content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}