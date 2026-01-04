import { DomainsHeader } from "@features/domains/ui/components/header";
import OverviewCards from "@features/domains/ui/components/overview-cards";
import { DomainsTable } from "@features/domains/ui/components/tables/domains-table";
import { type Domain } from "@features/domains/types";

type DomainsContentProps = {
  domains: Domain[];
};

export default function DomainsContent({ domains }: DomainsContentProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <DomainsHeader />
      <OverviewCards />
      <DomainsTable domains={domains} />
    </div>
  );
}

export type { Domain };
