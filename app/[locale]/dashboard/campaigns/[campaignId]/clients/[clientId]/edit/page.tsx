import { notFound } from "next/navigation";
import { getClient } from "@/features/leads";
import ClientForm from "@/features/leads/ui/components/forms/LeadForm";
import { LeadHeader } from "@/features/leads/ui/components/forms/LeadHeader";

interface EditClientPageProps {
  params: Promise<{ campaignId: string; clientId: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { campaignId, clientId } = await params;

  if (isNaN(Number(clientId))) {
    notFound();
  }

  const client = await getClient(clientId);

  if (!client) {
    notFound();
  }

  return (
    <div className="container py-8">
      <LeadHeader
        client={{ ...client, id: client.id.toString() }}
        campaignId={campaignId}
      />
      <ClientForm client={client} campaignId={campaignId} isEditMode={true} />
    </div>
  );
}
