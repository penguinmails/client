import { NotificationSettings } from "@features/settings/ui/components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

function NotificationSettingsPage() {
  const t = useTranslations("Settings.notifications");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("emailNotifications")}</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>
    </div>
  );
}
export default NotificationSettingsPage;

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
