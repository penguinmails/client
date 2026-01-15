# Auth Context Separation — Implementation Guide

This document describes the architectural improvements to the authentication system, separating core session management from business data enrichment.

## Architecture: Dual-Context Approach

We use two nested providers to separate concerns:

1. **BaseAuthProvider** (NileDB)
   - Handles the "Hard Auth" (login, logout, session cookies).
   - Provides `user.id`, `user.email`, `isAuthenticated`.
   - Optimized for baseline navigation and manual redirection controls.

2. **UserEnrichmentProvider** (Application Data)
   - Depends on `BaseAuthProvider`.
   - Fetches profile, roles, tenant memberships, and company data.
   - Provides `enrichedUser`, `isLoadingEnrichment`, and specific data helpers.
   - Enables **Skeleton UI Patterns** while bootstrapping application state.

---

## Problems Solved & Lessons Learned

### 1. Login Cookie Propagation
- **Problem**: Calling `checkSession()` too fast after `signInHook()` returns 401 because cookies aren't yet available.
- **Solution**: Added a small delay (300ms) after `signInHook` before redirecting, and an background background polling loop in `BaseAuthProvider` that keeps checking for the session until found.

### 2. Manual Redirection Control
- **Problem**: NileDB's default behavior can trigger unexpected redirects to `/`.
- **Solution**: Explicitly handling redirects in the `login` function using `safePush` and ensuring the `ProtectedRoute` is the source of truth for dashboard access.

### 3. NileDB Context Warnings
- **Problem**: Terminal warnings about `nile.userId is not set` in server-side API routes.
- **Solution**: All core queries (`getCurrentUser`, `getUserTenants`, etc.) now accept an optional `NextRequest`. They extract headers and use `withContext({ headers, userId })` to ensure the session is properly propagated.

---

## Next Steps: Dashboard-Centric Session Optimization

We are investigating a strategy to further simplify the auth flow and improve perceived performance:

### 1. Delayed Verification
- Instead of checking the session globally on every page load, we should defer the full NileDB validation until the user reaches a **Protected Route** inside the dashboard layout.
- The sidebar and navbar should render immediately (unblocked) while the `BaseAuthProvider` verifies the session in the background.

### 2. Layout-Level Logic
- Move the "pending" session logic into the dashboard layout. While the session is being verified:
  - Header/Sidebar are visible.
  - Main content area shows a skeleton.
  - Once NileDB session is confirmed, unblock feature items and trigger the `UserEnrichmentProvider`.

### 3. Fetch Interceptor Simplification
- With the authentication logic concentrated in the context recovery, we may no longer need the `GlobalFetchInterceptor` to handle 401s globally. The auth context itself can handle the "session gone" state by observing its own recovery status.

---

## Technical Maintenance

- **Provider Nesting**: Ensure `UserEnrichmentProvider` properly resets its state when `BaseAuth.user` changes.
- **Environment Parity**: Rate limits are loosened in `middleware.ts` during development to prevent 429 errors from high-frequency polling.
