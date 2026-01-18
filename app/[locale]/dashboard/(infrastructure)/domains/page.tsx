import DomainsTab from "@features/domains/ui/components/domains-tab";
import { getDomainsData } from "@features/domains/actions";

async function page() {
  const { domains, dnsRecords } = await getDomainsData();

  // Transform domains to match DomainsTab expected interface
  const transformedDomains = domains.map((domain) => ({
    id: domain.id,
    domain: domain.domain,
    status: domain.status,
    mailboxes: domain.emailAccounts || 0,
    records: {
      spf: domain.records?.spf || "pending",
      dkim: domain.records?.dkim || "pending",
      dmarc: domain.records?.dmarc || "pending",
      mx: domain.records?.mx || "pending",
    },
    addedDate: domain.createdAt || null,
  }));

  return <DomainsTab domains={transformedDomains} dnsRecords={dnsRecords} />;
}
export default page;

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
