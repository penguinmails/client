import { AdminShell } from "@/features/admin/ui/components/layout/AdminShell";

export const dynamic = 'force-dynamic';

/**
 * Admin Layout - Server Component
 * Uses AdminShell with AdminSidebar for admin-specific navigation.
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminShell>{children}</AdminShell>;
}
