import { getTranslations } from "next-intl/server";
import OnboardingContent from "./onboarding-content";

/**
 * Onboarding Page - Server Component
 * 
 * Fetches translations on the server and passes them to the client component.
 */
export default async function OnboardingPage() {
  const t = await getTranslations("Onboarding");

  return (
    <OnboardingContent
      welcomeTitle={t("welcome")}
      setupDescription={t("setup")}
      noStepsMessage={t("noSteps")}
    />
  );
}
