import { DashboardShell } from "@/components/layout/DashboardShell";

export const dynamic = 'force-dynamic';

/**
 * Dashboard Root Layout - Server Component
 * 
 * Delegates to DashboardShell client component for all client-side logic.
 * This pattern enables Next.js partial rendering - the shell remains stable
 * while only children (page content) update during navigation.
 */
export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
