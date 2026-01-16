# Feature API Contracts

This document defines the public API contracts for each feature in the FSD architecture. Features should only import from each other's public APIs defined in their `index.ts` files, never from internal modules.

## Feature API Structure

Each feature follows this structure:
```
features/[feature-name]/
├── index.ts              # Public API - ONLY import from this file
├── actions/              # Server actions (internal)
├── api/                  # API layer (internal)
├── lib/                  # Business logic (internal)
├── model/                # State management (internal)
├── types/                # Type definitions (internal)
├── ui/                   # UI components (internal)
└── data/                 # Data operations (internal)
```

## Public API Contracts

### Admin Feature (`@/features/admin`)

**Purpose**: System administration and health monitoring

**Public API**:
```typescript
// System Health
export { fetchAdminSystemHealth, fetchBasicSystemHealth } from './api';
export { AdminSystemHealthProvider, useAdminSystemHealth } from './model';
export { AdminSystemHealthIndicator, SystemHealthProvider } from './ui/components';

// Admin Dashboard
export { AdminDashboard, AdminUserTable } from './ui/components';

// Types
export type { AdminSystemHealthData, SystemHealthStatus } from './types';
```

**Usage Example**:
```typescript
import { useAdminSystemHealth, AdminSystemHealthIndicator } from '@/features/admin';
```

### Analytics Feature (`@/features/analytics`)

**Purpose**: Data analytics, charts, and metrics

**Public API**:
```typescript
// Actions
export { getAnalyticsData, getChartData, getMetrics } from './actions';

// Components
export { AnalyticsChart, MetricsCard, DashboardWidget } from './ui/components';

// Services
export { analyticsService, metricsCalculator } from './lib/services';

// Types
export type { AnalyticsData, ChartData, MetricData } from './types';
```

**Usage Example**:
```typescript
import { AnalyticsChart, getAnalyticsData } from '@/features/analytics';
```

### Auth Feature (`@/features/auth`)

**Purpose**: Authentication and user management

**Public API**:
```typescript
// Components
export { AuthTemplate, ProtectedRoute, PasswordInput } from './ui/components';

// Context
export { AuthProvider, useAuth } from './ui/context/auth-context';

// Operations
export { signIn, signUp, signOut, resetPassword } from './lib/auth-operations';

// Types
export type { AuthUser, AuthSession, LoginCredentials } from './types';
```

**Usage Example**:
```typescript
import { useAuth, ProtectedRoute } from '@/features/auth';
```

### Billing Feature (`@/features/billing`)

**Purpose**: Subscription management and payments

**Public API**:
```typescript
// Actions
export { createCheckoutSession, getSubscriptionStatus } from './actions';

// Components
export { BillingSettings, SubscriptionCard } from './ui/components';

// Hooks
export { useSubscription, useBillingInfo } from './lib/hooks';

// Types
export type { SubscriptionPlan, BillingInfo } from './types';
```

### Campaigns Feature (`@/features/campaigns`)

**Purpose**: Email campaign management

**Public API**:
```typescript
// Actions
export { getCampaigns, createCampaign, updateCampaign } from './actions';

// Components
export { CampaignsList, CampaignForm, CampaignMetrics } from './ui/components';

// Types
export type { Campaign, CampaignStatus, CampaignMetrics } from './types';
```

### Domains Feature (`@/features/domains`)

**Purpose**: Domain management and verification

**Public API**:
```typescript
// Actions
export { getDomains, verifyDomain, getDomainAnalytics } from './actions';

// Components
export { DomainsList, DomainAnalyticsDashboard } from './ui/components';

// Hooks
export { useDomainAnalytics } from './ui/components/hooks';

// Types
export type { Domain, DomainStatus, DomainAnalytics } from './types';
```

### Inbox Feature (`@/features/inbox`)

**Purpose**: Email conversations and messaging

**Public API**:
```typescript
// Actions
export { getConversations, sendMessage, markAsRead } from './actions';

// Components
export { InboxList, ConversationView, MessageComposer } from './ui/components';

// Types
export type { Conversation, Message, MessageStatus } from './types';
```

### Leads Feature (`@/features/leads`)

**Purpose**: Lead and contact management

**Public API**:
```typescript
// Actions
export { getLeadLists, createLead, updateLead } from './actions';

// Components
export { LeadsList, LeadForm, LeadTable } from './ui/components';

// Types
export type { Lead, LeadList, LeadStatus } from './types';
```

### Notifications Feature (`@/features/notifications`)

**Purpose**: In-app notifications

**Public API**:
```typescript
// Actions
export { getNotifications, markNotificationAsRead } from './actions';

// Components
export { NotificationsPopover, NotificationListItem } from './ui/components';

// Types
export type { Notification, NotificationType } from './types';
```

### Onboarding Feature (`@/features/onboarding`)

**Purpose**: User onboarding flow

**Public API**:
```typescript
// Components
export { OnboardingWizard, OnboardingStep } from './ui/components';

// Data
export { getOnboardingProgress, updateOnboardingStep } from './data';
```

### Settings Feature (`@/features/settings`)

**Purpose**: User and application settings

**Public API**:
```typescript
// Actions
export { getProfile, updateProfile, getNotificationSettings } from './actions';

// Components
export { AccountSettings, AppearanceSettings, SecurityRecommendations } from './ui/components';

// Context
export { ClientPreferencesProvider, useClientPreferences } from './ui/context';

// Types
export type { UserProfile, NotificationSettings } from './types';
```

### Team Feature (`@/features/team`)

**Purpose**: Team member management

**Public API**:
```typescript
// Actions
export { getTeamMembers, inviteTeamMember, updateTeamMemberRole } from './actions';

// Components
export { TeamMembersList, InviteTeamMemberDialog } from './ui/components';

// Types
export type { TeamMember, TeamRole, TeamInvitation } from './types';
```

## API Boundary Rules

### ✅ Allowed Imports

1. **From feature public API**:
   ```typescript
   import { useAuth, AuthTemplate } from '@/features/auth';
   ```

2. **Within same feature** (internal imports):
   ```typescript
   // Inside features/auth/ui/components/
   import { authOperations } from '../lib/auth-operations';
   ```

3. **From shared layers**:
   ```typescript
   import { Button } from '@/components/ui/button';
   import { useSystemHealth } from '@/hooks/use-system-health';
   ```

### ❌ Forbidden Imports

1. **Direct imports from feature internals**:
   ```typescript
   // ❌ Don't do this
   import { AuthForm } from '@/features/auth/ui/components/AuthForm';
   
   // ✅ Do this instead
   import { AuthForm } from '@/features/auth';
   ```

2. **Cross-feature internal imports**:
   ```typescript
   // ❌ Don't do this
   import { campaignActions } from '@/features/campaigns/actions/campaign-actions';
   
   // ✅ Do this instead
   import { createCampaign } from '@/features/campaigns';
   ```

## Validation

Use the validation script to check API boundaries:

```bash
npm run validate:feature-apis
```

This script will:
- Check that all features have proper `index.ts` files
- Validate that no cross-feature internal imports exist
- Report any API boundary violations
- Suggest fixes for violations

## Best Practices

1. **Keep public APIs minimal**: Only export what other features actually need
2. **Use semantic exports**: Export meaningful names, not just `export *`
3. **Document breaking changes**: Update this document when changing public APIs
4. **Version your APIs**: Consider backwards compatibility when modifying exports
5. **Regular validation**: Run the validation script in CI/CD pipelines

## Migration Guide

When moving components between features:

1. **Update the source feature's index.ts**: Remove the export
2. **Update the target feature's index.ts**: Add the export
3. **Update all imports**: Change import paths to use new feature
4. **Run validation**: Ensure no boundary violations
5. **Update documentation**: Reflect changes in this document