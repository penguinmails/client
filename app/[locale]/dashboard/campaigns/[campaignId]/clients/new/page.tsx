import { Metadata } from "next";
import NewClientForm from "@/features/leads/ui/components/forms/NewLeadForm";
// import { Header } from "@/features/leads/ui/components/forms/LeadHeader";
import { copyText as t } from "@/features/leads/ui/components/clients/data/copy";

export const metadata: Metadata = {
  title: t.page.title,
  description: t.page.description,
};

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  return (
    <div className="container mx-auto py-6">
      <NewClientForm campaignId={campaignId} />
    </div>
  );
}
