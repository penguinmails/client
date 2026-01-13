# FSD Deep Cleanup & Final Migration Instructions

This document outlines the final "Deep Sweep" phase of the Feature-Sliced Design (FSD) migration. The goal is to audit the remaining high-level routes in `app/[locale]/`, ensure strictly no business logic remains in the `app/` layer, and standardize the codebase structure.

## Current State
- **Dashboard**: largely migrated (Campaigns, Leads, Billing, Domains, Inbox, Mailboxes, Settings, Analytics).
- **Public Routes**: `signup`, `verify`, `email-confirmation`, `forgot-password`, `reset-password` and the Landing Page (`app/[locale]/page.tsx`) need auditing.
- **Admin**: `app/[locale]/admin` needs auditing.

## Objectives

### 1. Audit Public Routes
- **Target**: `app/[locale]/signup`, `verify`, `email-confirmation`, `forgot-password`, `reset-password`.
- **Task**: 
    - Ensure these routes are thin wrappers.
    - Move logic to `features/auth` or `features/onboarding`.
    - Check for local `components/` folders that should be in `features/`.

### 2. Audit Landing Page
- **Target**: `app/[locale]/page.tsx`.
- **Task**:
    - Verify it imports components from `features/marketing` or `features/landing` (if exists) or `components/`.
    - Extract complex sections (Hero, Features, Pricing) into feature components if they contain logic, or `shared/ui` if they are pure display.

### 3. Audit Admin Module
- **Target**: `app/[locale]/admin`.
- **Task**:
    - Ensure logic is in `features/admin`.
    - Verify `page.tsx` and sub-routes are thin wrappers.

### 4. Shared Layer & Components Check
- **Target**: `components/` (root) vs `shared/ui`.
- **Task**:
    - `components/ui` usually contains Shadcn UI.
    - `shared/ui` might contain global business-agnostic components.
    - ensure no "feature" components are hiding in `components/`.

### 5. Final Code Quality Sweep
- **Circular Dependencies**: Watch out for cross-feature imports (e.g. `features/inbox` importing `features/domains`). Use `shared` or event bus if needed.
- **Exports**: Ensure `features/[slice]/index.ts` is the *only* place other slices import from.
- **Types**: Ensure all Zod schemas and Types are in `features/[slice]/types` or `model`.

## Workflow
1.  **Select a Target**: Pick one of the areas above (e.g. Public Routes).
2.  **Inspect**: Read `page.tsx` and local files.
3.  **Refactor**: Move logic to `features/`.
4.  **Verify**: Run `npx tsc --noEmit`.

## Definition of Done
- No `actions.ts` files in `app/`.
- No `components/` folders inside `app/` route segments.
- All `page.tsx` files are < 100 lines (optimally < 50) and primarily handle data fetching or layout composition.
