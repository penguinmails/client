import { getTranslations } from "next-intl/server";
import DashboardContent from "./dashboard-content";

export const dynamic = "force-dynamic";

/**
 * Dashboard Page - Server Component
 *
 * Fetches translations on the server and passes them to the client component.
 * This pattern enables partial rendering where the layout stays stable
 * while only the page content updates during navigation.
 */
export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <DashboardContent
      title={t("title")}
      welcomeWithName={t("welcome.withName", { displayName: "{displayName}" })}
      welcomeAnonymous={t("welcome.anonymous")}
      recentRepliesTitle={t("recentReplies")}
    />
  );
}
