# Design Document

## Overview

This design outlines the centralization of all TypeScript type definitions into the `/types` folder. The current codebase has types scattered across 50+ files, with significant duplication and inconsistency. The centralized approach will organize types by domain, eliminate duplication, resolve circular dependencies, and provide a single source of truth for all type definitions.

## Architecture

### Current State Analysis

Based on the codebase analysis, types are currently scattered across:

- `/types` folder (8 files) - partially centralized
- Component prop interfaces (40+ files)
- Context type definitions (8 files)
- Schema definitions in various locations
- Inline type definitions in utility files
- Domain-specific type files (campaigns, domains, clients)

### Target Architecture

```
/types
├── index.ts              # Barrel exports for all types
├── common.ts             # Shared/generic types
├── ui.ts                 # UI component prop types
├── auth.ts               # Authentication & user types
├── campaign.ts           # Campaign-related types (enhanced)
├── domain.ts             # Domain & DNS types (enhanced)
├── mailbox.ts            # Mailbox & email account types (enhanced)
├── template.ts           # Template & email types (enhanced)
├── client.ts             # Client/lead management types
├── conversation.ts       # Inbox & conversation types (enhanced)
├── analytics.ts          # Analytics & reporting types
├── settings.ts           # Settings & configuration types
├── notification.ts       # Notification types (enhanced)
├── navigation.ts         # Navigation & routing types
└── forms.ts              # Form validation schemas & types
```

## Components and Interfaces

### 1. Type Organization Strategy

**Domain-Based Grouping:**
- Each domain gets its own file (campaign, domain, mailbox, etc.)
- Related types are co-located for better discoverability
- Shared types go in `common.ts`

**Naming Conventions:**
- Interfaces: PascalCase (e.g., `CampaignMetrics`)
- Types: PascalCase (e.g., `CampaignStatus`)
- Enums: PascalCase with const assertion (e.g., `CampaignStatus`)
- Props interfaces: ComponentName + "Props" (e.g., `CampaignFormProps`)

### 2. Enhanced Type Files

**campaign.ts** - Consolidates:
- Existing campaign types from `/types/campaign.ts`
- Campaign form types from `components/campaigns/types.tsx`
- Campaign schemas from `app/dashboard/inbox/schemas/schemas.tsx`
- Campaign action types and enums

**domain.ts** - Consolidates:
- Existing domain types from `/types/domain.d.ts`
- Enhanced domain types from `components/domains/types.ts`
- DNS record types and verification statuses
- Email account and mailbox types

**client.ts** - New file consolidating:
- Client schema from inbox schemas
- Client form types from components
- Lead management types from lib/data

### 3. Component Props Centralization

**ui.ts** - Contains:
- Generic UI component props (buttons, cards, tables)
- Layout component props
- Form component props
- Chart and visualization component props

**Specific Domain Props:**
- Campaign component props → `campaign.ts`
- Domain component props → `domain.ts`
- Settings component props → `settings.ts`

## Data Models

### 1. Core Entity Types

```typescript
// Enhanced Campaign Types
export interface Campaign {
  id: string | number;
  name: string;
  status: CampaignStatus;
  fromName: string;
  fromEmail: string;
  metrics: CampaignMetrics;
  settings: CampaignSettings;
  createdAt: string | Date;
  updatedAt: string | Date;
  companyId: number;
  createdById?: string;
}

// Enhanced Domain Types  
export interface Domain {
  id: number;
  name: string;
  provider: string;
  status: DomainStatus;
  verification: DomainVerification;
  emailAccounts: EmailAccount[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Enhanced Client Types
export interface Client {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  notes?: string;
  status: ClientStatus;
  campaigns: CampaignClient[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Form and Validation Types

All Zod schemas will be centralized in `forms.ts` with their inferred types:

```typescript
// Centralized form schemas
export const campaignFormSchema = z.object({...});
export const domainFormSchema = z.object({...});
export const clientFormSchema = z.object({...});

// Inferred types
export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
export type DomainFormValues = z.infer<typeof domainFormSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;
```

## Error Handling

### 1. Type Safety Improvements

- Strict typing for all API responses
- Proper error type definitions
- Validation error types for forms
- Status and state type safety

### 2. Migration Error Prevention

- Gradual migration approach to avoid breaking changes
- Temporary type aliases during transition
- Comprehensive type checking during migration

## Testing Strategy

### 1. Type Testing

- Type-only imports to verify type definitions
- TypeScript compilation tests for each type file
- Import/export validation tests

### 2. Migration Validation

- Automated tests to verify all imports are updated
- Build verification after each migration step
- Runtime validation that functionality remains intact

### 3. Integration Testing

- Component rendering tests with new prop types
- Form validation tests with centralized schemas
- API integration tests with centralized response types

## Implementation Phases

### Phase 1: Core Type Centralization
- Create enhanced type files for main domains
- Migrate existing `/types` folder content
- Set up barrel exports in `index.ts`

### Phase 2: Component Props Migration
- Move component prop interfaces to appropriate type files
- Update component imports
- Remove inline prop definitions

### Phase 3: Form and Schema Centralization
- Consolidate Zod schemas in `forms.ts`
- Update form components to use centralized schemas
- Migrate validation types

### Phase 4: Context and Utility Types
- Move context type definitions
- Centralize utility and helper types
- Update all imports across the codebase

### Phase 5: Cleanup and Optimization
- Remove old type definition files
- Optimize imports and exports
- Final validation and testing

## Migration Strategy

### 1. Backward Compatibility

During migration, maintain backward compatibility by:
- Creating type aliases in old locations that re-export from new locations
- Gradual migration of imports
- Deprecation warnings for old import paths

### 2. Import Update Process

1. Create new centralized type files
2. Add re-exports in old locations
3. Update imports file by file
4. Remove re-exports and old files
5. Validate no broken imports remain

### 3. Validation Steps

- TypeScript compilation success
- No circular dependency warnings
- All tests passing
- Runtime functionality verification
