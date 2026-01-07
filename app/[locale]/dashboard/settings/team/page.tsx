import TeamMembersTable from "@features/team/ui/components/team-members-table";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Force dynamic rendering to prevent SSR issues with analytics dependencies
export const dynamic = "force-dynamic";

function TeamSettingsPage() {
  const t = useTranslations("Settings.team");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-gray-600 dark:text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <TeamMembersTable />
        </CardContent>
      </Card>
    </div>
  );
}
export default TeamSettingsPage;
