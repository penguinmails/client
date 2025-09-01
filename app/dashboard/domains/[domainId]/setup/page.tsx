import DomainSetupClient from "@/components/domain-setup-client";

// Server component (Next.js page requirements)
export default async function DomainSetupPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  return <DomainSetupClient domainId={domainId} />;
}
