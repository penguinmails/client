import { InfrastructureDiagnostics } from "@/features/infrastructure/ui/components/diagnostics";

export default function AdminDiagnosticsPage() {
    return (
        <main className="min-h-[calc(100vh-100px)] bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold text-white mb-8">System Diagnostics</h1>
                <InfrastructureDiagnostics />
            </div>
        </main>
    );
}

export const dynamic = 'force-dynamic';
