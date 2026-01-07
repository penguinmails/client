# Internationalization (i18n) Guide

This guide documents the internationalization patterns and conventions used in the Penguin Mails project.

## Overview

The project uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization. All user-facing text must be extracted into translation files to support multiple languages.

## Translation Files

Translation files are located in the `messages/` directory:

| File               | Purpose                        |
| ------------------ | ------------------------------ |
| `messages/en.json` | English translations (default) |
| `messages/es.json` | Spanish translations           |

## Adding New Translations

### 1. Update Message Files

Add translation keys to both `messages/en.json` and `messages/es.json`:

```json
// messages/en.json
{
  "Settings": {
    "section": {
      "key": "Translated text here"
    }
  }
}

// messages/es.json
{
  "Settings": {
    "section": {
      "key": "Texto traducido aquí"
    }
  }
}
```

### 2. Update Component

Use the `useTranslations` hook in your component:

```tsx
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("Settings.section.key")}</h1>
    </div>
  );
}
```

## Recommended Pattern: Single Hook with Full Namespace Keys

Use a single `useTranslations()` hook and prefix all keys with their namespace:

```tsx
// ✅ RECOMMENDED - Single hook, full namespace keys
const t = useTranslations();
{
  t("Settings.general.title");
}
{
  t("Common.loading");
}
{
  t("BillingTab.currentPlan");
}

// ❌ AVOID - Multiple hooks or short keys
const t = useTranslations("Settings");
const tCommon = useTranslations("Common");
{
  t("general.title");
} // Breaks if namespace changes
```

### Benefits of This Pattern

1. **Consistency**: One pattern across all components
2. **Maintainability**: Keys are self-documenting with full namespace
3. **Type Safety**: Easy to find and update keys
4. **No Namespace Conflicts**: Full paths prevent collisions

## Namespace Structure

Organize translations by feature/section:

| Namespace                           | Used For                                          |
| ----------------------------------- | ------------------------------------------------- |
| `Common`                            | Shared translations (loading, buttons, errors)    |
| `Settings.*`                        | Settings pages (general, security, billing, etc.) |
| `BillingTab`                        | Billing tab content                               |
| `UsageTab`                          | Usage & limits tab content                        |
| `BillingPage`                       | Legacy billing page                               |
| `Login`, `SignUp`, `ForgotPassword` | Authentication pages                              |

## Common Translations

The `Common` namespace contains frequently used translations:

```json
{
  "Common": {
    "tryAgain": "Try Again",
    "loading": "Loading...",
    "cancel": "Cancel",
    "submit": "Submit",
    "ok": "OK",
    "update": "Update",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "add": "Add",
    "remove": "Remove",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "confirm": "Confirm",
    "error": "Error",
    "success": "Success",
    "updating": "Updating..."
  }
}
```

## Settings Page Translations

Settings pages use the `Settings` namespace with nested sections:

```json
{
  "Settings": {
    "general": {
      "title": "General Settings",
      "description": "Manage your account preferences and profile information"
    },
    "security": {
      "title": "Security Settings",
      "changePassword": "Change Password",
      "twoFactorAuth": "Two-Factor Authentication"
    },
    "billing": {
      "title": "Billing & Usage"
    },
    "appearance": {
      "title": "Appearance Settings"
    },
    "team": {
      "title": "Team Management"
    }
  }
}
```

## Billing & Usage Translations

### BillingTab Namespace

```json
{
  "BillingTab": {
    "currentPlan": "Current Plan",
    "active": "Active",
    "paymentMethod": "Payment Method",
    "changePlan": "Change Plan"
  }
}
```

### UsageTab Namespace

```json
{
  "UsageTab": {
    "usageStatistics": "Usage Statistics",
    "resetMessage": "Your usage limits will reset on",
    "unlimited": "Unlimited",
    "emailsSent": "Emails Sent",
    "contactsReached": "Contacts Reached",
    "activeCampaigns": "Active Campaigns",
    "emailAccounts": "Email Accounts",
    "storageUsed": "Storage Used",
    "failedToLoad": "Failed to load usage data",
    "unexpectedError": "An unexpected error occurred"
  }
}
```

## Interpolation

Support variables in translations using curly braces:

```tsx
// Component
{t("Settings.billing.planDetails", { planName: "Pro" })}
// Output: "Pro Plan"

// Message file
{
  "planDetails": "{planName} Plan"
}
```

## Pluralization

Handle plural forms:

```tsx
// Component
{t("Common.itemsCount", { count: items.length })}

// Message file
{
  "itemsCount_one": "{count} item",
  "itemsCount_other": "{count} items"
}
```

## Best Practices

### Do ✅

- Use full namespace keys: `t("Settings.section.key")`
- Add translations to both `en.json` and `es.json` simultaneously
- Use descriptive key names that indicate content
- Group related translations under shared namespaces
- Test in both languages during development

### Don't ❌

- Don't hardcode text directly in JSX
- Don't use multiple `useTranslations()` hooks
- Don't use short keys without namespace prefix
- Don't leave keys missing from one language file
- Don't use the same key for different texts

## Files Internationalized (January 2025)

The following files have been internationalized:

### Settings Pages

- `app/[locale]/dashboard/settings/page.tsx` - General Settings
- `app/[locale]/dashboard/settings/layout.tsx` - Settings Layout
- `app/[locale]/dashboard/settings/notifications/page.tsx` - Notifications
- `app/[locale]/dashboard/settings/security/page.tsx` - Security
- `app/[locale]/dashboard/settings/tracking/page.tsx` - Tracking
- `app/[locale]/dashboard/settings/appearance/page.tsx` - Appearance
- `app/[locale]/dashboard/settings/team/page.tsx` - Team Management

### Billing Components

- `app/[locale]/dashboard/settings/billing/page.tsx` - Billing wrapper
- `app/[locale]/dashboard/settings/billing/Billing-Tab.tsx` - BillingTab
- `app/[locale]/dashboard/settings/billing/BillingPage.tsx` - BillingPage
- `app/[locale]/dashboard/settings/billing/usage-tab.tsx` - UsageTab

## Verification

Before committing, verify:

1. ✅ All text wrapped in `t()` function
2. ✅ All keys exist in `messages/en.json`
3. ✅ All keys exist in `messages/es.json`
4. ✅ Next.js build succeeds (`npm run build`)
5. ✅ No TypeScript errors (`npm run typecheck`)
6. ✅ No ESLint warnings (`npm run lint`)

## Related Files

- `messages/en.json` - English translation file
- `messages/es.json` - Spanish translation file
- `shared/config/i18n/` - i18n configuration
- `app/[locale]/` - Locale-aware routes
