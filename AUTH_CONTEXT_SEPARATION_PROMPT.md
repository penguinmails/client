# Auth Context Separation — Implementation Guide

This document describes the architectural improvements to the authentication system, separating core session management from business data enrichment.

## Architecture: Dual-Context Approach

We use two nested providers to separate concerns:

1. **BaseAuthProvider** (NileDB)
   - Handles the "Hard Auth" (login, logout, session cookies).
   - Provides `user.id`, `user.email`, `isAuthenticated`.
   - Optimized for speed and instant session recovery.
   - Solves the **Login Timing Issue** with internal retry logic.

2. **UserEnrichmentProvider** (Application Data)
   - Depends on `BaseAuthProvider`.
   - Fetches profile, roles, tenant memberships, and company data.
   - Provides `enrichedUser`, `isLoadingEnrichment`, and specific data helpers.
   - Enables **Skeleton UI Patterns** while bootstrapping application state.

---

## Problems Solved

### 1. Login "No Session" Flash
- **Problem**: Calling `checkSession()` too fast after `signInHook()` returns 401.
- **Solution**: `BaseAuthProvider` implements a 3-retry backoff (200ms intervals) before reporting a failed session.

### 2. Tight Coupling vs. Parallel Loading
- **Problem**: UI blocked waiting for DB enrichment despite having a valid session.
- **Solution**: Split contexts allow the App Shell (Sidebar, Header) to render immediately while role-dependent features show skeletons during enrichment.

### 3. Role-Based Navigation
- **Problem**: Nav links visible before role is known.
- **Solution**: Sidebar now checks `isLoadingEnrichment`. If true, it renders `NavLinkSkeleton` for protected routes.

---

## Implementation Details

### Provider Composition
```tsx
// Root Provider (features/auth/ui/context/auth-context.tsx)
export const AuthProvider = ({ children }) => {
  return (
    <BaseAuthProvider>
      <UserEnrichmentProvider>
        {children}
      </UserEnrichmentProvider>
    </BaseAuthProvider>
  );
};
```

### Usage Patterns

**Protective Routing (Instant)**:
```tsx
const { isAuthenticated } = useBaseAuth();
if (!isAuthenticated) return <Redirect to="/login" />;
```

**Feature Rendering (Enriched)**:
```tsx
const { enrichedUser, isLoadingEnrichment } = useEnrichment();

if (isLoadingEnrichment) return <FeatureSkeleton />;
if (enrichedUser.role !== 'admin') return null;
return <AdminFeature />;
```

---

## Dashboard Enrichment Gate

The `EnrichedUserGate` component (in `features/auth/ui/components/`) wraps the main dashboard content:

- While `isLoadingEnrichment` is true → Show global dashboard skeleton.
- Once loaded, check business rules:
  - **Email Unverified**: Show "Verification Required" banner with resend CTA.
  - **Payment Overdue**: Show "Billing Action Required" gate with Stripe link.
  - **Active**: Render children.

---

## Technical Challenges

- **Provider Nesting**: Ensure `UserEnrichmentProvider` properly resets its state when `BaseAuth.user` changes (e.g., on logout).
- **Type Safety**: Use discriminating unions or clear interfaces for `BaseUser` vs `EnrichedUser`.
- **Performance**: Ensure no redundant re-renders when enrichment completes. Use `useMemo` for context values.
