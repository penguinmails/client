import { getTranslations } from "next-intl/server";
import CampaignsContent from "./campaigns-content";

export const dynamic = 'force-dynamic';

/**
 * Campaigns Page - Server Component
 * 
 * Fetches translations on the server and passes them to the client component.
 * This pattern enables partial rendering where the layout stays stable
 * while only the page content updates during navigation.
 */
export default async function CampaignsPage() {
  const t = await getTranslations("Campaigns");

  return (
    <CampaignsContent
      title={t("title")}
      subtitle={t("subtitle")}
      newCampaignLabel={t("newCampaign")}
    />
  );
}
