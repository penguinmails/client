# Mock Files Audit Results

## Overview

This document provides a comprehensive audit of all mock files in the `lib/mocks/` directory, categorizing them as either domain-specific or generic, and identifying which features domain-specific mocks belong to.

## Complete File Inventory

### Root Level Files

- `lib/mocks/campaigns.ts` - Domain-specific (Campaigns feature)
- `lib/mocks/providers.ts` - Mixed (contains both domain-specific and generic providers)
- `lib/mocks/README.md` - Documentation

### Framework Directory

- `lib/mocks/framework/client-only.js` - Generic (Framework mock)
- `lib/mocks/framework/server-only.js` - Generic (Framework mock)
- `lib/mocks/framework/nile-database.js` - Generic (Framework mock)
- `lib/mocks/framework/next-intl.js` - Generic (Framework mock)
- `lib/mocks/framework/next/headers.js` - Generic (Framework mock)
- `lib/mocks/framework/next/navigation.js` - Generic (Framework mock)

## Categorization Results

### Generic Framework Mocks (Keep in Shared)

These mocks provide generic framework functionality and should remain in the shared layer:

1. **`lib/mocks/framework/client-only.js`**
   - Type: Generic framework mock
   - Purpose: Mocks client-only module marker
   - Should remain: ✅ Shared layer

2. **`lib/mocks/framework/server-only.js`**
   - Type: Generic framework mock
   - Purpose: Mocks server-only module marker
   - Should remain: ✅ Shared layer

3. **`lib/mocks/framework/nile-database.js`**
   - Type: Generic framework mock
   - Purpose: Mocks NileDB client and auth utilities
   - Should remain: ✅ Shared layer

4. **`lib/mocks/framework/next-intl.js`**
   - Type: Generic framework mock
   - Purpose: Mocks Next.js internationalization
   - Should remain: ✅ Shared layer

5. **`lib/mocks/framework/next/headers.js`**
   - Type: Generic framework mock
   - Purpose: Mocks Next.js headers API
   - Should remain: ✅ Shared layer

6. **`lib/mocks/framework/next/navigation.js`**
   - Type: Generic framework mock
   - Purpose: Mocks Next.js navigation hooks
   - Should remain: ✅ Shared layer

### Domain-Specific Mocks (Move to Features)

#### 1. Campaigns Feature Mocks

**File: `lib/mocks/campaigns.ts`**

- Type: Domain-specific
- Target Feature: `features/campaigns/`
- Target Location: `features/campaigns/lib/mocks.ts`
- Content:
  - `campaignsData` - Campaign mock data
  - `availableMailboxes` - Mailbox data for campaigns
  - `campaignLeads` - Lead data for campaigns
  - `MockCampaign` interface

#### 2. Multi-Domain Provider Mocks

**File: `lib/mocks/providers.ts`**

- Type: Mixed (contains multiple domain-specific providers)
- Needs to be split across multiple features:

**Campaign-related content → `features/campaigns/lib/mocks.ts`:**

- `MockCampaign` interface and data
- `mockCampaignProvider`
- `getMockCampaigns()`
- `getActiveCampaigns()`

**Lead-related content → `features/leads/lib/mocks.ts`:**

- `MockLead` interface and data
- `mockLeadProvider`
- `getMockLeads()`
- `getNewLeads()`

**Mailbox-related content → `features/mailboxes/lib/mocks.ts`:**

- `MockMailbox` interface and data
- `mockMailboxProvider`
- `getMockMailboxes()`
- `getActiveMailboxes()`

**Onboarding-related content → `features/onboarding/lib/mocks.ts`:**

- `MockOnboardingStep` interface and data
- `mockOnboardingProvider`
- `getMockOnboardingSteps()`
- `getIncompleteOnboardingSteps()`

**Analytics-related content → `features/analytics/lib/mocks.ts`:**

- `mockAnalyticsProvider`
- `getMockAnalyticsData()`
- Analytics-specific `StatsCardData`

**Generic provider base → Keep in shared (`lib/test-utils/mock-provider.ts`):**

- `BaseMockProvider` class
- `MockDataProvider` interface

## Migration Plan Summary

### Files to Move

1. **`lib/mocks/campaigns.ts`** → `features/campaigns/lib/mocks.ts`
   - Complete file migration
   - Update imports in campaign-related tests

2. **`lib/mocks/providers.ts`** → Split across multiple features:
   - Campaign providers → `features/campaigns/lib/mocks.ts`
   - Lead providers → `features/leads/lib/mocks.ts`
   - Mailbox providers → `features/mailboxes/lib/mocks.ts`
   - Onboarding providers → `features/onboarding/lib/mocks.ts`
   - Analytics providers → `features/analytics/lib/mocks.ts`
   - Generic `BaseMockProvider` → `lib/test-utils/mock-provider.ts`

### Files to Keep in Shared

All files in `lib/mocks/framework/` should remain in the shared layer as they provide generic framework mocking functionality.

### Import Updates Required

After migration, the following import patterns will need to be updated:

```typescript
// Old imports (to be updated)
import { campaignsData } from "@/lib/mocks/campaigns";
import { mockCampaignProvider } from "@/lib/mocks/providers";
import { mockLeadProvider } from "@/lib/mocks/providers";

// New imports (after migration)
import { campaignsData } from "@/features/campaigns";
import { mockCampaignProvider } from "@/features/campaigns";
import { mockLeadProvider } from "@/features/leads";
```

## Validation Checklist

- [ ] All domain-specific mocks identified
- [ ] Target feature locations determined
- [ ] Generic framework mocks identified for retention
- [ ] Import update requirements documented
- [ ] Migration plan created for each domain-specific mock

## Next Steps

1. Execute task 5.2: Move campaign mocks to campaigns feature
2. Execute task 5.3: Move provider mocks to appropriate features
3. Execute task 5.4: Move remaining domain-specific mocks
4. Execute task 5.5: Organize generic mocks in shared test-utils
5. Execute task 5.6: Validate mocks reorganization
