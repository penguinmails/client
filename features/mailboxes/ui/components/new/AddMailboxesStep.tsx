"use client";
import { useAddMailboxesContext } from "@features/inbox/ui/context/add-mailboxes-context";
import { getDomainsData } from "@features/domains/actions";
import { productionLogger } from "@/lib/logger";
import { useEffect, useState } from "react";
import AddMailboxDetails from "./AddMailboxDetails";
import MailboxSetting from "./MailboxSetting";
import SuccessStep from "./SuccessStep";

function AddMailboxesStep() {
  const { currentStep } = useAddMailboxesContext();
  const [domains, setDomains] = useState<Array<{
    id: number;
    domain: string;
    name: string;
    status: string;
  }>>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await getDomainsData();
        // Transform domains to match expected format
        const transformedDomains = data.domains.map(domain => ({
          id: domain.id,
          domain: domain.domain,
          name: domain.name || domain.domain, // Fallback to domain if name is undefined
          status: domain.status
        }));
        setDomains(transformedDomains);
      } catch (error) {
        productionLogger.error("Failed to fetch domains:", error);
        // Set empty array on error to prevent UI from breaking
        setDomains([]);
      }
    };

    fetchDomains();
  }, []);

  switch (currentStep) {
    case 1:
      return <AddMailboxDetails domains={domains} />;
    case 2:
      return <MailboxSetting />;
    case 3:
      return <SuccessStep />;
    default:
      return <div>Unknown Step</div>;
  }
}
export default AddMailboxesStep;
