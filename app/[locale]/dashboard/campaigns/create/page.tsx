import { getTranslations } from "next-intl/server";
import CreateCampaignContent from "./create-campaign-content";

async function CampaignCreatePage() {
  const t = await getTranslations("Campaigns");

  return <CreateCampaignContent title={t("createTitle")} />;
}
export default CampaignCreatePage;
