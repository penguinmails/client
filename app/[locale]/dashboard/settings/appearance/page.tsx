import { AppearanceSettings } from "@features/settings/ui/components";
import { useTranslations } from "next-intl";

function AppearanceSettingsPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Settings.appearance.title")}</h1>
        <p className="text-muted-foreground">
          {t("Settings.appearance.description")}
        </p>
      </div>
      <AppearanceSettings />
    </div>
  );
}

export default AppearanceSettingsPage;

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
