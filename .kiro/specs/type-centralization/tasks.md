# Implementation Plan

- [ ] 1. Set up enhanced type infrastructure and barrel exports
  - Create `/types/index.ts` with barrel exports for all type files
  - Create `/types/common.ts` for shared utility types and generic interfaces
  - Set up TypeScript path mapping in `tsconfig.json` for clean imports
  - _Requirements: 1.1, 4.1, 4.3_

- [ ] 2. Consolidate and enhance core domain types
- [ ] 2.1 Create comprehensive campaign types file
  - Merge existing `/types/campaign.ts` with `components/campaigns/types.tsx`
  - Add campaign form types and validation schemas from various components
  - Include campaign action enums and status types from scattered locations
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 2.2 Create comprehensive domain and DNS types file
  - Enhance existing `/types/domain.d.ts` with types from `components/domains/types.ts`
  - Add DNS record types, verification statuses, and email account types
  - Include domain form validation types and provider enums
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 2.3 Create comprehensive mailbox and email account types
  - Enhance existing `/types/mailbox.d.ts` with additional email account properties
  - Add warmup status types and mailbox configuration types
  - Include email provider enums and account creation types
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 2.4 Create comprehensive template and email types
  - Enhance existing `/types/templates.d.ts` with template folder and category types
  - Add email composition types and personalization tag types
  - Include template form validation schemas and usage tracking types
  - _Requirements: 2.1, 2.2, 3.1_

- [ ] 3. Create new domain-specific type files
- [ ] 3.1 Create client and lead management types file
  - Extract client types from `app/dashboard/inbox/schemas/schemas.tsx`
  - Add lead management types from `lib/data/leads.ts`
  - Include client form validation types and status enums
  - _Requirements: 2.1, 3.1, 6.1_

- [ ] 3.2 Create conversation and inbox types file
  - Enhance existing `/types/conversation.d.ts` with email and message types
  - Add inbox filter types and conversation status enums
  - Include message threading and reply types
  - _Requirements: 2.1, 3.1_

- [ ] 3.3 Create analytics and reporting types file
  - Extract analytics types from `components/analytics/**` components
  - Add chart data types and metric toggle interfaces
  - Include performance tracking and KPI types
  - _Requirements: 2.1, 3.1_

- [x] 3.4 Create settings and configuration types file
  - Extract settings types from `components/settings/**` components
  - Add user preference types and billing configuration types
  - Include notification settings and security configuration types
  - _Requirements: 2.1, 3.1_

- [ ] 4. Centralize component prop interfaces
- [ ] 4.1 Create UI component props types file
  - Extract generic UI component prop interfaces from components
  - Add form component props, button variants, and layout props
  - Include chart and visualization component prop types
  - _Requirements: 5.1, 5.3_

- [ ] 4.2 Move domain-specific component props to appropriate type files
  - Move campaign component props to `/types/campaign.ts`
  - Move domain component props to `/types/domain.ts`
  - Move settings component props to `/types/settings.ts`
  - _Requirements: 5.1, 5.2_

- [ ] 5. Centralize form validation schemas and types
- [ ] 5.1 Create comprehensive forms types file
  - Extract all Zod schemas from component files into `/types/forms.ts`
  - Create inferred TypeScript types for all form schemas
  - Add form validation error types and field validation types
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 5.2 Create authentication and user types file
  - Extract auth types from `context/AuthContext.tsx`
  - Add user profile types and role-based access types
  - Include session management and claims types
  - _Requirements: 2.1, 3.1_

- [ ] 6. Create navigation and routing types
- [ ] 6.1 Create navigation types file
  - Enhance existing `/types/nav-link.ts` with additional navigation types
  - Add route configuration types and breadcrumb types
  - Include sidebar and menu item types
  - _Requirements: 2.1, 3.1_

- [x] 6.2 Enhance notification types
  - Enhance existing `/types/notification.ts` with additional notification types
  - Add notification settings and preference types
  - Include alert and toast notification types
  - _Requirements: 2.1, 3.1_

- [ ] 7. Update imports across the codebase
- [ ] 7.1 Update component imports to use centralized types
  - Update all campaign-related components to import from `/types/campaign`
  - Update all domain-related components to import from `/types/domain`
  - Update all template-related components to import from `/types/template`
  - _Requirements: 1.3, 8.2_

- [ ] 7.2 Update context and utility file imports
  - Update all context files to import from centralized type files
  - Update utility functions to use centralized types
  - Update action files to import from centralized types
  - _Requirements: 1.3, 8.2_

- [ ] 7.3 Update form and validation imports
  - Update all form components to import schemas from `/types/forms`
  - Update validation utilities to use centralized schemas
  - Update API integration to use centralized response types
  - _Requirements: 1.3, 6.2, 8.2_

- [ ] 8. Remove duplicate and obsolete type definitions
- [ ] 8.1 Remove inline type definitions from components
  - Remove prop interfaces from campaign components
  - Remove prop interfaces from domain and settings components
  - Remove inline form validation schemas
  - _Requirements: 2.2, 8.3_

- [ ] 8.2 Remove obsolete type files
  - Remove `components/campaigns/types.tsx` after migration
  - Remove `components/domains/types.ts` after migration
  - Remove inline schemas from `app/dashboard/inbox/schemas/schemas.tsx`
  - _Requirements: 2.2, 8.3_

- [ ] 9. Validate and test the centralized type system
- [x] 9.1 Run TypeScript compilation tests
  - ✓ No TypeScript compilation errors found
  - ✓ No circular dependencies detected
  - ✓ All imports resolve correctly
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9.2 Test component functionality with new types
  - Verify all forms work with centralized validation schemas
  - Test component rendering with centralized prop types
  - Validate API integration with centralized response types
  - _Requirements: 8.1, 8.2_

- [x] 10. Create type documentation and usage guidelines
  - Write documentation for the new type organization structure
  - Create import guidelines for developers
  - Add examples of proper type usage patterns
  - _Requirements: 1.1, 3.2, 4.2_
