import DomainsTab from "@features/domains/ui/components/domains-tab";
import { getDomainsData } from "@features/domains/actions";
import { Domain } from "@features/domains/types";
import { productionLogger } from "@/lib/logger";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function page() {
  try {
    const data = await getDomainsData();
    const { domains, dnsRecords } = data;

    const transform = (domainList: Domain[]) => domainList.map((domain: Domain) => ({
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
      expirationDate: domain.expirationDate || null,
    }));
    const transformedUnified = transform(domains);

    return (
      <DomainsTab domains={transformedUnified} dnsRecords={dnsRecords} />
    );
  } catch (error) {
    productionLogger.error("Error loading domains page:", error);
    return (
      <div className="container mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error Loading Domains</CardTitle>
            <CardDescription>Failed to connect to HestiaCP infrastructure.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
}
export default page;

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
