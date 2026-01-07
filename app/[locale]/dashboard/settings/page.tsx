import { ProfileForm, ProfileErrorBoundary } from "@/features/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

function GeneralSettingsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Settings.general.title")}</h1>
        <p className="text-muted-foreground">
          {t("Settings.general.description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("Settings.general.profileInformation.title")}
          </CardTitle>
          <CardDescription>
            {t("Settings.general.profileInformation.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileErrorBoundary maxRetries={3}>
            <ProfileForm />
          </ProfileErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
export default GeneralSettingsPage;
