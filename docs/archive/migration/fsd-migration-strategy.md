# FSD Migration Strategy & Roadmap

This document outlines the operational strategy for migrating to Feature-Sliced Design (FSD).

## Phase 1: Base Structure & Shared Layer (✅ COMPLETED)
**Goal**: Establish FSD base structure and migrate usage of `types/` to feature slices.
- **Status**: Completed.
- **Outcome**: Feature-specific types moved to `features/*/types/`. Root `types/` retained for backward compatibility re-exports. `shared/` layer fully operational.

## Phase 2: Feature Logic Extraction (PENG-318 - PENG-321)
**Goal**: Clean up the current "UI-heavy" components by extracting business logic, state, and direct API calls into the `features/` layer.
**Principle**: UI components should be "dumb". Smart logic lives in slices.

### Acceptance Criteria
- [ ] **Auth Flow**: Migrate authentication logic to `features/auth` (PENG-319).
- [ ] **Inbox Actions**: Move filtering & listing logic to `features/inbox-actions` (PENG-320).
- [ ] **Campaigns**: specific creation & management logic moved to `features/manage-campaign` (PENG-321).
- [ ] **No API Calls**: Ensure no direct `fetch` or database calls depend directly inside UI components.
- [ ] **Dependencies**: Features must only import from `entities` (models/types) and `shared`.

## Phase 3: Compositional Widgets (PENG-322 - PENG-325)
**Goal**: Create high-level "Widgets" that unite multiple features and entities into standalone UI blocks.
**Principle**: Pages should not compose atomic features directly; they should render Widgets.

### Acceptance Criteria
- [ ] **Inventory**: Identify required widgets (Sidebar, TopNav, DashboardView, InboxList) (PENG-322).
- [ ] **Layout Widgets**: Implement `Sidebar` and `TopNav` as widgets (PENG-323).
- [ ] **Dashboard**: Extract dashboard grid & composition logic into `widgets/dashboard-view` (PENG-324).
- [ ] **Inbox**: Create `InboxList` and `EmailReader` widgets (PENG-325).
- [ ] **Composition**: Widgets must strictly compose Features and Entities.

## Phase 4: Page Slimming & Cleanup (PENG-326 - PENG-328)
**Goal**: The final step. Pages become trivial connectors that fetch initial data and render Widgets. Remove legacy structures.

### Acceptance Criteria
- [ ] **Slim Pages**: Refactor all `page.tsx` files to be logic-less and thin (PENG-326).
- [ ] **Remove Legacy**: Deprecate and delete the old `components/` folder (PENG-327).
- [ ] **Validation**: Ensure strict no-upward-import rule compliance (PENG-328).
- [ ] **Build**: Application builds and runs successfully.

## Guidance for Execution
1. **Vertical Slices**: When working on Phase 2, pick ONE feature (e.g. Auth) and finish it before starting another.
2. **Incremental Pruning**: Don't delete legacy code until the replacement Feature/Widget is live and verified.
3. **Type Safety**: Leverage the types migrated in Phase 1 to ensure data consistency during extraction.
