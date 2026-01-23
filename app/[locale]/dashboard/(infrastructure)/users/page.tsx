import { getTranslations } from "next-intl/server";
import UsersContent from "./users-content";

export const dynamic = "force-dynamic";

/**
 * Panel Users Page - Server Component
 */
export default async function UsersPage() {
  const t = await getTranslations("Infrastructure.users");

  return (
    <UsersContent 
      title={t("title")}
      description={t("description")}
    />
  );
}
