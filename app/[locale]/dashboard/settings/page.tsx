import { getTranslations } from "next-intl/server";
import GeneralSettingsContent from "./settings-content";

/**
 * General Settings Page - Server Component
 * 
 * Fetches translations on the server and passes them to the client component.
 */
export default async function GeneralSettingsPage() {
  const t = await getTranslations("Settings.general");

  return (
    <GeneralSettingsContent
      title={t("title")}
      description={t("description")}
      profileTitle={t("profileInformation.title")}
      profileDescription={t("profileInformation.description")}
    />
  );
}
