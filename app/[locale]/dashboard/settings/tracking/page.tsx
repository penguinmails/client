import { TrackingPreferences } from "@/features/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export const dynamic = 'force-dynamic';

function TrackingSettingsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Settings.tracking.title")}</h1>
        <p className="text-gray-600 dark:text-muted-foreground">
          {t("Settings.tracking.description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("Settings.tracking.trackingInformation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackingPreferences />
        </CardContent>
      </Card>
    </div>
  );
}
export default TrackingSettingsPage;
