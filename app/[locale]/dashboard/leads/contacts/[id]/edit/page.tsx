import { getClientById } from "@/features/leads/actions/clients";
import LeadEditForm from "@/features/leads/ui/components/forms/LeadEditForm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function ContactEditPage({ params }: PageProps) {
    const { id } = await params;

    const result = await getClientById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/leads/contacts/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Edit Contact</h1>
            </div>

            <LeadEditForm client={result.data} />
        </div>
    );
}
