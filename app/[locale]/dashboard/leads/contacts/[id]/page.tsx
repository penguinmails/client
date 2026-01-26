import { getClientById } from "@/features/leads/actions/clients";
import ContactDetail from "@/features/leads/ui/components/ContactDetail";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function ContactDetailPage({ params }: PageProps) {
    const { id } = await params;

    const result = await getClientById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <ContactDetail client={result.data} />
    );
}
