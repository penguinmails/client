import { AdminDashboard } from "@/features/admin/ui/components/dashboard/AdminDashboard";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <AdminDashboard />
        </div>
    );
}

export const dynamic = 'force-dynamic';
