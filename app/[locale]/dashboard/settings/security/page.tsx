import { ChangePasswordForm } from "@/features/settings";
import { SecurityRecommendations } from "@/features/settings";
import {
  AlertSuccessTwoAuth,
  TwoAuthProvider,
  TwoFactorAuthenticationSwitch,
} from "@/features/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";

function SecuritySettingsPage() {
  const t = useTranslations("Settings.security");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <p className="text-gray-600 dark:text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <TwoAuthProvider>
        <Card className="grid grid-cols-2 grid-rows-[auto_auto] justify-items-stretch ">
          <CardHeader>
            <CardTitle>{t("twoFactorAuth")}</CardTitle>
            <CardDescription>{t("twoFactorDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="justify-self-end">
            <TwoFactorAuthenticationSwitch />
          </CardContent>
          <CardFooter className="col-span-2">
            <AlertSuccessTwoAuth />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("securityRecommendations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityRecommendations />
          </CardContent>
        </Card>
      </TwoAuthProvider>
    </div>
  );
}

export default SecuritySettingsPage;
