import { InfrastructureDiagnostics } from "@/features/infrastructure/ui/components/diagnostics";

export default function AdminDiagnosticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Diagnostics</h1>
      <InfrastructureDiagnostics />
    </div>
  );
}

export const dynamic = 'force-dynamic';
