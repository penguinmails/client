import DomainSetupClient from "@features/domains/ui/components/setup/domain-setup-client";

// Server component (Next.js page requirements)
export default async function DomainSetupPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  return <DomainSetupClient domainId={domainId} />;
}
