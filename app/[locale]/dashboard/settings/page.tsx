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
  const t = useTranslations("Settings.general");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("profileInformation.title")}</CardTitle>
          <CardDescription>
            {t("profileInformation.description")}
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
