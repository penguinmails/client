"use client";

import React from "react";
import AppSideBar from "@/components/layout/components/Sidebar";
import DashboardHeader from "@/components/layout/components/DashboardHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backHref?: string;
}

/**
 * Unified Dashboard Layout component that consolidates layout patterns
 * Uses existing UI components (Card, Breadcrumb, Button) and AppSideBar with SidebarProvider
 * Provides consistent layout structure across dashboard pages
 */
export function DashboardLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  actions,
  className,
  showBackButton = false,
  backHref = "/",
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset className="max-w-10/12 md:peer-data-[variant=inset]:shadow-none gap-5 overflow-hidden">
        <div className="rounded-lg shadow-sm">
          <DashboardHeader />
        </div>
        
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 rounded-lg shadow-sm">
          <div className={cn("space-y-6", className)}>
            {/* Header Section */}
            {(title || breadcrumbs.length > 0 || actions || showBackButton) && (
              <div className="space-y-4">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2"
                          >
                            <Home className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {crumb.href ? (
                              <BreadcrumbLink asChild>
                                <Link href={crumb.href}>{crumb.label}</Link>
                              </BreadcrumbLink>
                            ) : (
                              <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}

                {/* Title and Actions Row */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {showBackButton && (
                      <Button variant="ghost" size="sm" asChild className="mb-2">
                        <Link href={backHref} className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Link>
                      </Button>
                    )}
                    {title && (
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="text-muted-foreground">{description}</p>
                    )}
                  </div>

                  {actions && (
                    <div className="flex items-center space-x-2">{actions}</div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;
