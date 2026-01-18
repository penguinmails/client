# i18n Extraction Opportunities - Phase 2

## Overview
This document identifies additional hardcoded text in the `app/[locale]/` folder that should be moved to i18n translation files.

---

## High Priority - Dashboard & Campaign Pages

### 1. **Dashboard Page** (`app/[locale]/dashboard/page.tsx`)

#### 1.1 Time Formatting Function
**Location:** Lines 133-148
**Current:**
```tsx
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours === 1) {
    return "1 hour ago";
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }
}
```

**Required i18n keys:**
```json
{
  "Dashboard": {
    "timeAgo": {
      "justNow": "Just now",
      "oneHour": "1 hour ago",
      "hours": "{count} hours ago",
      "oneDay": "1 day ago",
      "days": "{count} days ago"
    }
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

#### 1.2 KPI Card Titles
**Location:** Lines 291-314
**Current:**
```tsx
const kpiData = [
  {
    title: "Active Campaigns",
    value: totalCampaigns.toString(),
    icon: Send,
    color: "bg-blue-500 text-blue-600",
  },
  {
    title: "Leads Contacted",
    value: totalLeadsContacted.toLocaleString(),
    icon: Users,
    color: "bg-green-500 text-green-600",
  },
  {
    title: "Open Rate",
    value: `${avgOpenRate}%`,
    icon: Mail,
    color: "bg-purple-500 text-purple-600",
  },
  {
    title: "Reply Rate",
    value: `${avgReplyRate}%`,
    icon: TrendingUp,
    color: "bg-orange-500 text-orange-600",
  },
];
```

**Required i18n keys:**
```json
{
  "Dashboard": {
    "kpi": {
      "activeCampaigns": "Active Campaigns",
      "leadsContacted": "Leads Contacted",
      "openRate": "Open Rate",
      "replyRate": "Reply Rate"
    }
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

#### 1.3 Unknown Company Fallback
**Location:** Line 353
**Current:**
```tsx
company: reply.company || "Unknown Company",
```

**Required i18n key:**
```json
{
  "Dashboard": {
    "unknownCompany": "Unknown Company"
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

### 2. **Campaigns Page** (`app/[locale]/dashboard/campaigns/page.tsx`)

#### 2.1 KPI Card Titles
**Location:** Lines 121-145
**Current:**
```tsx
const stats = [
  {
    title: "Total Campaigns",
    value: totalCampaigns.toString(),
    icon: Send,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Sent",
    value: totalSent.toLocaleString(),
    icon: Mail,
    iconColor: "text-purple-600 bg-purple-100",
  },
  {
    title: "Total Replies",
    value: totalRepliesPercent,
    icon: TrendingUp,
    iconColor: "text-green-500 bg-green-100",
  },
  {
    title: "Open Rate",
    value: openRate,
    icon: Eye,
    iconColor: "text-orange-500 bg-orange-100",
  },
  {
    title: "Reply Rate",
    value: replyRate,
    icon: Users,
    iconColor: "text-pink-600 bg-pink-100",
  },
];
```

**Required i18n keys:**
```json
{
  "Campaigns": {
    "kpi": {
      "totalCampaigns": "Total Campaigns",
      "totalSent": "Total Sent",
      "totalReplies": "Total Replies",
      "openRate": "Open Rate",
      "replyRate": "Reply Rate"
    }
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

### 3. **Leads Page** (`app/[locale]/dashboard/leads/page.tsx`)

#### 3.1 Page Header
**Location:** Lines 37-41
**Current:**
```tsx
<h1 className="text-3xl font-bold text-foreground">Lead Hub</h1>
<p className="text-muted-foreground mt-1">
  Manage your lead lists, imports, and contact database
</p>
```

**Required i18n keys:**
```json
{
  "Leads": {
    "layout": {
      "title": "Lead Hub",
      "description": "Manage your lead lists, imports, and contact database"
    }
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

#### 3.2 Tab Labels
**Location:** Lines 26-36
**Current:**
```tsx
const leadsTabs = [
  {
    id: "lists",
    label: "Lead Lists",
    count: leadListsData.length,
    icon: FileText,
  },
  { id: "upload", label: "Upload CSV", icon: Upload },
  {
    id: "contacts",
    label: "All Contacts",
    count: totalContacts,
    icon: Users,
  },
];
```

**Required i18n keys:**
```json
{
  "Leads": {
    "tabs": {
      "lists": "Lead Lists",
      "upload": "Upload CSV",
      "contacts": "All Contacts"
    }
  }
}
```

**Status:** ⚠️ Hardcoded - Should be moved immediately

---

## Summary Table

| File | Component | Type | Status | Priority |
|------|-----------|------|--------|----------|
| `dashboard/page.tsx` | Time formatting (Just now, 1 hour ago, etc.) | Helper function | ⚠️ Hardcoded | 🔴 HIGH |
| `dashboard/page.tsx` | KPI card titles (Active Campaigns, Leads Contacted, etc.) | Dashboard KPIs | ⚠️ Hardcoded | 🔴 HIGH |
| `dashboard/page.tsx` | Unknown Company fallback | Data display | ⚠️ Hardcoded | 🔴 HIGH |
| `campaigns/page.tsx` | KPI card titles (Total Campaigns, Total Sent, etc.) | Campaign KPIs | ⚠️ Hardcoded | 🔴 HIGH |
| `leads/page.tsx` | Page header (Lead Hub, description) | Page header | ⚠️ Hardcoded | 🔴 HIGH |
| `leads/page.tsx` | Tab labels (Lead Lists, Upload CSV, All Contacts) | Tab navigation | ⚠️ Hardcoded | 🔴 HIGH |

---

## Implementation Recommendations

### Phase 2 Actions:
1. **Update `messages/en.json`** - Add namespaces for:
   - `Dashboard.timeAgo` (time formatting)
   - `Dashboard.kpi` (KPI card titles)
   - `Dashboard.unknownCompany` (fallback text)
   - `Campaigns.kpi` (campaign KPI titles)
   - `Leads.layout` (page header)
   - `Leads.tabs` (tab labels)

2. **Update `messages/es.json`** - Add Spanish translations for all new keys

3. **Update `app/[locale]/dashboard/page.tsx`**:
   - Extract `formatTimeAgo` function to use i18n
   - Update KPI card titles to use translations
   - Update "Unknown Company" fallback to use translation

4. **Update `app/[locale]/dashboard/campaigns/page.tsx`**:
   - Update KPI card titles to use translations

5. **Update `app/[locale]/dashboard/leads/page.tsx`**:
   - Add `useTranslations` hook
   - Update page header to use translations
   - Update tab labels to use translations

---

## Implementation Pattern

### Before (Hardcoded):
```tsx
const kpiData = [
  {
    title: "Active Campaigns",
    value: totalCampaigns.toString(),
    icon: Send,
    color: "bg-blue-500 text-blue-600",
  },
];
```

### After (i18n):
```tsx
const t = useTranslations("Dashboard.kpi");

const kpiData = [
  {
    title: t("activeCampaigns"),
    value: totalCampaigns.toString(),
    icon: Send,
    color: "bg-blue-500 text-blue-600",
  },
];
```

### Translation Files:
**messages/en.json:**
```json
{
  "Dashboard": {
    "kpi": {
      "activeCampaigns": "Active Campaigns",
      "leadsContacted": "Leads Contacted",
      "openRate": "Open Rate",
      "replyRate": "Reply Rate"
    }
  }
}
```

**messages/es.json:**
```json
{
  "Dashboard": {
    "kpi": {
      "activeCampaigns": "Campañas Activas",
      "leadsContacted": "Leads Contactados",
      "openRate": "Tasa de Apertura",
      "replyRate": "Tasa de Respuesta"
    }
  }
}
```

---

## Files to Check/Update

### Phase 2 Actions:
- [ ] Update `messages/en.json` - Add Dashboard.timeAgo namespace
- [ ] Update `messages/en.json` - Add Dashboard.kpi namespace
- [ ] Update `messages/en.json` - Add Dashboard.unknownCompany
- [ ] Update `messages/en.json` - Add Campaigns.kpi namespace
- [ ] Update `messages/en.json` - Add Leads.layout namespace
- [ ] Update `messages/en.json` - Add Leads.tabs namespace
- [ ] Update `messages/es.json` - Add all Spanish translations
- [ ] Update `app/[locale]/dashboard/page.tsx` - Add useTranslations and extract time formatting
- [ ] Update `app/[locale]/dashboard/page.tsx` - Update KPI card titles
- [ ] Update `app/[locale]/dashboard/page.tsx` - Update Unknown Company fallback
- [ ] Update `app/[locale]/dashboard/campaigns/page.tsx` - Update KPI card titles
- [ ] Update `app/[locale]/dashboard/leads/page.tsx` - Add useTranslations
- [ ] Update `app/[locale]/dashboard/leads/page.tsx` - Update page header
- [ ] Update `app/[locale]/dashboard/leads/page.tsx` - Update tab labels

### Verification Steps:
1. Run `npm run ts:ci` to verify TypeScript compiles
2. Run `npm run test` to ensure no tests break
3. Check Spanish locale works in browser UI
4. Verify no console warnings about missing translations
