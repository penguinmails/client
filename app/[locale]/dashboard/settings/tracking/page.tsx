import { TrackingPreferences } from "@/features/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

function TrackingSettingsPage() {
  const t = useTranslations("Settings.tracking");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-gray-600 dark:text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("trackingInformation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingPreferences />
        </CardContent>
      </Card>
    </div>
  );
}
export default TrackingSettingsPage;
