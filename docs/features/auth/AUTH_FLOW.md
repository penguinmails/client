# Auth Flow & Policies — Overview

This document describes the canonical authentication flow, current behavior, and the decided policies for three cross-cutting concerns: Turnstile (bot checks), payment gating, and email verification. It also lists implementation steps, relevant files, and acceptance criteria for tests and PRs.

## Goals
- Keep Turnstile behavior as-is but add thorough tests for signup and login flows.
- Enforce a *hard payment gate* (paywall) for dashboard functionality via a dedicated payment gate page and redirect after login when necessary.
- Use a *soft pester* approach for email verification in the Dashboard UI (banner/modal), but block select critical features until email is verified.

---

## High-level flow

1. Sign up
   - UI: `features/auth/ui/signup-form.tsx` (wrapper: `app/[locale]/signup/page.tsx`)
   - If Turnstile feature enabled: Turnstile widget shown and validated via `app/api/verify-turnstile/route.ts`.
   - Auth context `signUp` hook will call `/api/emails/send` and store `pendingVerificationEmail` in `localStorage`.

2. Verification email
   - Email contains a token and link to `/verify?token=...` (constructed by `lib/loop/client.ts`).
   - Token generation & storage: `features/auth/lib/email-verification.ts` (`storeVerificationToken`, `getVerificationTokenExpiry`).

3. User opens verification link
   - Page: `app/[locale]/verify/page.tsx` (uses `features/auth/ui/verify-email-view.tsx`) → POSTs `{ token }` to `/api/verify-email`.
   - Server: `app/api/verify-email/route.ts` validates token, marks as used, updates user `email_verified`.
   - On success: shows success & `Go to login`; on failure: shows message and offers resend.

4. Login
   - Page: `app/[locale]/page.tsx` (login, uses `features/auth/ui/login-form.tsx`) - shows Turnstile when rate-limit requires it (via `features/auth/lib/rate-limit.ts`).
   - Successful login → `SessionProvider` (in `session-context.tsx`) triggers the `useSignIn` mutation.
   - Upon `onSuccess` callback:
     - The provider waits for cookie propagation (400ms delay).
     - It performs a session verification retry loop via `recoverSessionWithRetry(6, 600, true)`.
     - Once verified, it sets the session state and navigates to the dashboard via SPA navigation.
   - This ensures we never navigate until the client-side session is confirmed and cookies are reliably set.

5. Payments & gating
   - Billing and subscription state are updated by Stripe webhooks: `app/api/webhooks/stripe/route.ts` and handlers in `lib/stripe/webhook-handlers.ts`.
   - New behavior: after login, check subscription status; if no active subscription or unpaid status, redirect to a new `Payment Gate` page (e.g., `/payment-gate`) which explains payment requirement and offers CTA to Billing.

6. Email verification in-dashboard UX
   - Soft pester: banner or persistent alert in `shared/layout/components/DashboardHeader.tsx` when `user.emailVerified` is falsy.
   - Block some critical features until email is verified (specific blocking points documented in the implementation checklist).

---

## FSD Architecture Considerations

The Authentication flow follows strict Feature-Sliced Design (FSD) principles:

- **App Layer (`app/`)**: 
  - Contains strictly routing and layout composition.
  - No business logic or state management.
  - Imports only from `features/`, `widgets/`, or `pages/`.
  - Example: `app/[locale]/signup/page.tsx` only renders `LandingLayout` and `SignUpForm`.

- **Feature Layer (`features/auth`)**:
  - `ui/`: Contains all UI components (`SignUpForm`, `LoginForm`, `VerifyEmailView`).
  - `model/` (or `lib/`): Contains business logic, hooks, and utilities (`useAuth`, `verifyToken`).
  - `api/`: containing server actions if any (though currently mostly using Next.js API routes).

- **Shared Layer (`shared/`)**:
  - Reusable UI components (`AuthTemplate`) and utilities.

---

## Files to update / implement

- Tests:
  - `features/auth/ui/__tests__/signup-form.test.tsx` — ensure Turnstile widget is shown when enabled and verification token flow is validated.
  - `features/auth/ui/__tests__/login-form.test.tsx` — validate Turnstile is shown when `getLoginAttemptStatus` returns `requiresTurnstile` and verify token exchange.

- Payment gate (new page):
  - Add `app/[locale]/payment-gate/page.tsx` (or `/payment-gate` per routing conventions) that describes paywall and links to billing portal.
  - Add redirect logic post-login in `features/auth/ui/context/auth-context.tsx` (after session established) to check subscription and redirect to the payment gate when needed.
  - Add small hook `features/billing/lib/hooks/use-subscription-status.ts` and/or action `features/billing/actions/get-subscription-status.ts` to fetch status.

- Email verification banner & gating:
  - Update `shared/layout/components/DashboardHeader.tsx` to display a `VerifyEmailBanner` when `user.emailVerified` is false.
  - Add gating helper `features/auth/lib/require-email-verified.ts` for components/actions that should be blocked until verification; show modal or CTA to resend.

- Tests for gating:
  - Integration tests that simulate an unverified session and assert blocked actions and banner visibility.
  - End-to-end or Playwright scenario for full flow (optional).

---

## Acceptance criteria (PR & tests)

- Turnstile
  - Tests confirm Turnstile widget appears on signup when feature flag enabled and is omitted when disabled.
  - Tests confirm Turnstile appears on login only when rate-limit requires it.
  - API `/api/verify-turnstile` validated in tests (mocked) and client-side behavior covered.

- Payment gate
  - After login, if user subscription status is not 'active', user is redirected to `/payment-gate`.
  - Payment gate page contains clear CTA to billing settings or checkout flow and displays current subscription status if available.
  - Integration test covers login → redirect → payment-gate.

- Email verification
  - Dashboard header shows verification banner when `user.emailVerified` is false.
  - At least one critical feature (e.g., creating a mailbox or sending a campaign) is blocked with a clear message and CTA to resend verification.
  - Tests validate banner presence and gating behavior.

---

## Implementation checklist

- [ ] Add/complete Turnstile tests for signup and login (unit tests)
- [ ] Implement `Payment Gate` page (`app/[locale]/payment-gate/page.tsx`)
- [ ] Add subscription status action/hook and wire to auth provider redirect
- [ ] Add `VerifyEmailBanner` in `DashboardHeader` and a gating helper
- [ ] Add tests for payment redirect and gated flows (integration tests)
- [ ] Add Playwright test (optional) for end-to-end signup → verify → login → dashboard → payment gate
- [ ] Update docs and feature-flags guidance (this file updated)

---

## Notes & rationale

- Turnstile remains feature-flagged and conditional (keeps attack surface low and allows rollback via flags). We will add tests so we can safely change enforcement later.
- Payment gating is implemented as a hard gate to the dashboard: the product depends on billing correctness and gating at login or first access keeps the rest of the app consistent.
- Email verification is UX-friendly (soft pester banner) but we will block only certain operations to avoid frustrating new users while keeping security.

---

If this looks good I will:
1. Finalize this doc and commit it to `docs/features/auth/AUTH_FLOW.md` (done),
2. Re-open work items and implement tests (Turnstile tests next), and
3. Implement the `payment-gate` and verification banner (in that order).

If you want any changes to the policies above (e.g., make email verification a hard block), tell me and I’ll update the doc and prioritize implementation accordingly.
