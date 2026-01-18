# i18n Extraction Opportunities in App Layer

## Overview
This document identifies hardcoded text in the `app/[locale]/` folder that should be moved to i18n translation files (`messages/en.json` and `messages/es.json`).

---

## High Priority - Critical User-Facing Text

### 1. **Analytics Layout** (`app/[locale]/dashboard/analytics/(layout)/layout.tsx`)
**Current:**
```tsx
<h1 className="text-3xl font-bold text-foreground">
  Analytics Hub
</h1>
<p className="text-muted-foreground mt-1">
  Comprehensive performance insights and campaign analytics
</p>
```

**Required i18n keys:**
```json
{
  "Analytics": {
    "layout": {
      "title": "Analytics Hub",
      "description": "Comprehensive performance insights and campaign analytics"
    }
  }
}
```

**Status:** ⚠️ Missing - Should be moved immediately

---

### 2. **Infrastructure Layout** (`app/[locale]/dashboard/(infrastructure)/layout.tsx`)
**Current:**
```tsx
<h1 className="text-3xl font-bold text-foreground">Domains & Mailboxes</h1>
<p className="text-muted-foreground ">
  Manage your email domains and mailboxes configuration
</p>
```

**Required i18n keys:**
```json
{
  "Infrastructure": {
    "layout": {
      "title": "Domains & Mailboxes",
      "description": "Manage your email domains and mailboxes configuration"
    }
  }
}
```

**Status:** ⚠️ Missing - Should be moved immediately

---

### 3. **Error Handling Text** (`app/[locale]/error.tsx`)
**Current:**
```tsx
<summary className="cursor-pointer font-medium text-foreground">
  Technical Details
</summary>
```

**Note:** This file already uses `useTranslations("Error")` but has one hardcoded "Technical Details" string.

**Required i18n key:**
```json
{
  "Error": {
    "technicalDetails": "Technical Details"
  }
}
```

**Status:** ⚠️ Partially migrated

---

### 4. **Not Found Page** (`app/[locale]/not-found.tsx`)
**Current:**
```tsx
<h1 className="text-6xl font-extrabold text-primary-600 mb-4">{t("title")}</h1>
<p className="text-2xl text-primary-700 mb-6">
  {t("description")}
</p>
<div className="text-lg text-primary-600 mb-8">
  {t("helpText")}
  <ul className="mt-2 list-none">
    <li>
      <Link href="/" className="text-primary-600 underline hover:no-underline">
        {t("backHome")}
      </Link>
    </li>
    <li>
      <Link href="/signup" className="text-primary-600 underline hover:no-underline">
        {t("createAccount")}
      </Link>
    </li>
    <li>
      <Link href="/dashboard" className="text-primary-600 underline hover:no-underline">
        {t("goToDashboard")}
      </Link>
    </li>
  </ul>
</div>
```

**Status:** ✅ Properly internationalized

---

## Medium Priority - Settings & Configuration Pages

### 5. **Settings Tracking Page** (`app/[locale]/dashboard/settings/tracking/page.tsx`)
**Current:**
```tsx
<h1 className="text-2xl font-bold">{t("Settings.tracking.title")}</h1>
<p className="text-gray-600 dark:text-muted-foreground">
  {t("Settings.tracking.description")}
</p>
```

**Status:** ✅ Already using i18n - Verify keys exist in `en.json`

**Verification needed:**
- Ensure `Settings.tracking.title` and `Settings.tracking.description` exist
- Check `messages/es.json` has Spanish translations

---

### 6. **Settings Billing Page** (`app/[locale]/dashboard/settings/billing/page.tsx`)
**Current:**
```tsx
<h1 className="text-2xl font-bold">{t("Settings.billing.title")}</h1>
<p className="text-muted-foreground">
  {t("Settings.billing.description")}
</p>
```

**Status:** ✅ Already using i18n

---

### 7. **Settings General Page** (`app/[locale]/dashboard/settings/page.tsx`)
**Current:**
```tsx
<h1 className="text-2xl font-bold">{t("Settings.general.title")}</h1>
<p className="text-muted-foreground">
  {t("Settings.general.description")}
</p>
```

**Status:** ✅ Already using i18n

---

## Low Priority - Component-Level Features

### 8. **Admin Page** (`app/[locale]/admin/page.tsx`)
**Current:**
```tsx
<h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
<p className="text-muted-foreground mt-2">{t("description")}</p>
```

**Status:** ✅ Using i18n with root-level keys (needs namespace clarification)

**Recommendation:** Use namespaced keys like `Admin.title` and `Admin.description`

---

## Summary Table

| File | Component | Type | Status | Priority |
|------|-----------|------|--------|----------|
| `analytics/(layout)/layout.tsx` | Analytics Hub title & description | Page header | ⚠️ Hardcoded | 🔴 HIGH |
| `(infrastructure)/layout.tsx` | Domains & Mailboxes title & description | Page header | ⚠️ Hardcoded | 🔴 HIGH |
| `error.tsx` | Technical Details | Error UI | ⚠️ Partially | 🟡 MEDIUM |
| `settings/tracking/page.tsx` | Settings tracking | Page content | ✅ Migrated | 🟢 DONE |
| `settings/billing/page.tsx` | Settings billing | Page content | ✅ Migrated | 🟢 DONE |
| `settings/page.tsx` | Settings general | Page content | ✅ Migrated | 🟢 DONE |
| `admin/page.tsx` | Admin panel | Page header | ⚠️ Root keys | 🟡 MEDIUM |
| `not-found.tsx` | 404 page | Error page | ✅ Migrated | 🟢 DONE |

---

## Implementation Recommendations

### Phase 1: High Priority (Do First)
1. Add `Analytics` namespace to `messages/en.json` and `messages/es.json`
2. Add `Infrastructure` namespace to translation files
3. Update `app/[locale]/error.tsx` to use i18n for "Technical Details"

### Phase 2: Medium Priority (Verify & Cleanup)
1. Verify all `Settings.*` keys exist in both language files
2. Standardize `admin/page.tsx` to use `Admin.title` instead of root keys
3. Review any other dynamic page headers

### Phase 3: Best Practices
- Add ESLint rule to detect hardcoded strings in `app/[locale]/**/*.tsx` files
- Reference: `/home/israel/personal/code/penguinmails/client/__tests__/cross-feature-integration.test.ts` already has tests for i18n violations
- Consider extracting page headers into a reusable pattern with translations

---

## Implementation Pattern

### Before (Hardcoded):
```tsx
"use client";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance insights and campaign analytics
          </p>
        </div>
      </div>
    </div>
  );
}
```

### After (i18n):
```tsx
"use client";
import { useTranslations } from "next-intl";

function Layout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Analytics.layout");
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Translation Files:
**messages/en.json:**
```json
{
  "Analytics": {
    "layout": {
      "title": "Analytics Hub",
      "description": "Comprehensive performance insights and campaign analytics"
    }
  }
}
```

**messages/es.json:**
```json
{
  "Analytics": {
    "layout": {
      "title": "Hub de Análisis",
      "description": "Análisis integral de rendimiento e información de campañas"
    }
  }
}
```

---

## Files to Check/Update

### Phase 1 Actions:
- [ ] Update `messages/en.json` - Add `Analytics` namespace
- [ ] Update `messages/es.json` - Add Spanish translation for `Analytics`
- [ ] Update `messages/en.json` - Add `Infrastructure` namespace
- [ ] Update `messages/es.json` - Add Spanish translation for `Infrastructure`
- [ ] Update `app/[locale]/dashboard/analytics/(layout)/layout.tsx` - Add import & translation call
- [ ] Update `app/[locale]/dashboard/(infrastructure)/layout.tsx` - Add import & translation call
- [ ] Update `app/[locale]/error.tsx` - Extract "Technical Details" to i18n

### Verification Steps:
1. Run `npm run ts:ci` to verify TypeScript compiles
2. Run `npm run test` to ensure no tests break
3. Check Spanish locale works in browser UI
4. Verify no console warnings about missing translations
