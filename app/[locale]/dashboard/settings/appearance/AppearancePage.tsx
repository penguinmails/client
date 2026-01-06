"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AppearanceSettingsPage() {
  const t = useTranslations("AppearanceSettings");

  // Placeholder state, would ideally load from UserPreference
  const [theme, setTheme] = useState("LIGHT");
  const [layoutDensity, setLayoutDensity] = useState("NORMAL");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const themeOptions = [
    { value: "LIGHT", i18nKey: "theme.light" },
    { value: "DARK", i18nKey: "theme.dark" },
    { value: "CONTRAST", i18nKey: "theme.contrast" },
  ];

  const densityOptions = [
    { value: "COMPACT", i18nKey: "layoutDensity.compact" },
    { value: "NORMAL", i18nKey: "layoutDensity.normal" },
    { value: "WIDE", i18nKey: "layoutDensity.wide" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage(t("notifications.success"));
    }, 1000);

    // In a real implementation, you would call your API:
    // try {
    //   const response = await fetch('/api/user/preferences', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ theme, layoutDensity }),
    //   });
    //   if (response.ok) {
    //     setSaveMessage(t('notifications.success'));
    //   } else {
    //     setSaveMessage(t('notifications.error'));
    //   }
    // } catch (error) {
    //   setSaveMessage(t('notifications.genericError'));
    // } finally {
    //   setIsSaving(false);
    // }
  };

  return (
    <div className="bg-white dark:bg-card shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-foreground">
          {t("title")}
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>{t("description")}</p>
        </div>

        {saveMessage && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            {saveMessage}
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-foreground">
              {t("theme.label")}
            </label>
            <fieldset className="mt-2">
              <legend className="sr-only">{t("theme.label")}</legend>
              <div className="space-y-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {themeOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      id={`theme-${option.value.toLowerCase()}`}
                      name="theme"
                      type="radio"
                      value={option.value}
                      checked={theme === option.value}
                      onChange={(e) => setTheme(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-border"
                    />
                    <label
                      htmlFor={`theme-${option.value.toLowerCase()}`}
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-foreground"
                    >
                      {t(option.i18nKey as any)}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Layout Density Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-foreground">
              {t("layoutDensity.label")}
            </label>
            <fieldset className="mt-2">
              <legend className="sr-only">{t("layoutDensity.label")}</legend>
              <div className="space-y-2 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {densityOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      id={`density-${option.value.toLowerCase()}`}
                      name="layoutDensity"
                      type="radio"
                      value={option.value}
                      checked={layoutDensity === option.value}
                      onChange={(e) => setLayoutDensity(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 dark:border-border"
                    />
                    <label
                      htmlFor={`density-${option.value.toLowerCase()}`}
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-foreground"
                    >
                      {t(option.i18nKey as any)}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSaving ? t("saveButton.saving") : t("saveButton.default")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
