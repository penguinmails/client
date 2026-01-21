# Authentication Architecture

## Overview

This document describes the authentication architecture for the PenguinMails client application, including data models, error handling, integration points, and security considerations.

## Table of Contents

1. [Core Architecture & Types](docs/guides/actions-api.md#1-core-architecture--types)
2. [Error Handling System](docs/guides/actions-api.md#2-error-handling-system)
3. [Integration Points](docs/guides/actions-api.md#3-integration-points)
4. [Testing Strategy](docs/guides/actions-api.md#4-testing-strategy)
5. [Security & Performance](docs/guides/actions-api.md#5-security--performance)
6. [Implementation Checklist](docs/guides/actions-api.md#6-implementation-checklist)
7. [Migration Guide](docs/guides/actions-api.md#7-migration-guide)
8. [Verification](docs/guides/actions-api.md#8-verification)

---

## 1. Core Architecture & Types

### Data Models

#### BaseUser (Session Level)

The `BaseUser` interface represents the core identity information available at the session level:

```typescript
interface BaseUser {
  id: string;
  email: string;
  emailVerified?: Date;
}
```

**Properties:**

- `id`: Unique user identifier (UUID)
- `email`: User's email address
- `emailVerified`: Optional timestamp when email was verified

#### AuthUser (Enriched Level)

The `AuthUser` interface extends `BaseUser` with additional profile and organizational data:

```typescript
interface AuthUser extends BaseUser {
  profile: UserProfile;
  tenants: Tenant[];
  companies: Company[];
  roles: UserRole[];
  permissions: string[];
}
```

**Properties:**

- `profile`: User profile data (bio, avatar, preferences)
- `tenants`: Multi-tenant containers the user belongs to
- `companies`: Organizational units within tenants
- `roles`: User roles across tenants
- `permissions`: Granular permission strings for access control

### Database Schema (Conceptual)

The authentication system relies on the following database tables:

- **`users`**: Core identity managed by NileDB
- **`user_profiles`**: Application-specific data (bio, avatar, preferences)
- **`tenants`**: Multi-tenant containers
- **`tenant_users`**: Many-to-many relationship with roles
- **`companies`**: Organizational units within tenants (optional)

### API Endpoints

| Endpoint            | Method | Description                       |
| ------------------- | ------ | --------------------------------- |
| `/api/auth/session` | GET    | Validate NileDB session           |
| `/api/auth/login`   | POST   | Authenticate credentials          |
| `/api/auth/logout`  | POST   | Invalidate session                |
| `/api/auth/signup`  | POST   | Register and trigger verification |
| `/api/user/profile` | GET    | Fetch enriched profile            |
| `/api/user/tenants` | GET    | Fetch available tenants           |

---

## 2. Error Handling System

### Error Class Hierarchy

The authentication system uses a custom error hierarchy for precise error handling:

```typescript
class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

class SessionRecoveryError extends AuthError {
  constructor(attempts: number) {
    super("Session recovery failed", "SESSION_RECOVERY_FAILED", { attempts });
  }
}

class EnrichmentError extends AuthError {
  constructor(userId: string, source: string) {
    super(`Failed to load ${source}`, "ENRICHMENT_FAILED", { userId });
  }
}
```

### Error Codes

| Error Code                | Description                              | Recovery Strategy                                                  |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `SESSION_RECOVERY_FAILED` | Session restoration failed after retries | Exponential backoff (500ms, 1s, 2s) up to 3 attempts               |
| `ENRICHMENT_FAILED`       | Failed to load user profile/tenants      | Silent background refresh on focus; blocking error on initial load |
| `NETWORK_ERROR`           | Connectivity issues                      | Global connectivity listeners triggering toast notifications       |

### Recovery Strategies

#### Session Recovery

- **Exponential backoff**: 500ms → 1s → 2s
- **Maximum attempts**: 3
- **Trigger**: Automatic on session validation failure

#### Enrichment Recovery

- **Initial load**: Blocking error with retry option
- **Background refresh**: Silent update on window focus
- **Cache invalidation**: 5-minute TTL for enrichment data

#### Network Recovery

- **Global listeners**: Monitor connectivity state
- **Toast notifications**: Inform users of network issues
- **Offline mode**: Graceful degradation where possible

---

## 3. Integration Points

### Analytics (PostHog)

Authentication events are tracked in `features/auth/lib/metrics.ts`:

| Event                 | Trigger               | Description                               |
| --------------------- | --------------------- | ----------------------------------------- |
| `login_attempt_start` | Form submit           | User initiated login                      |
| `login_success`       | Session valid         | Successful authentication                 |
| `login_failure`       | API error             | Failed login (excludes validation errors) |
| `session_recovery`    | Automatic restoration | Tracks restoration success/failure        |

### Router Integration

#### Next.js App Router

- Uses `useRouter` for client-side transitions
- Supports `redirectTo` parameter for post-login redirects

#### Middleware

- Server-side session validation
- Automatic redirects for protected routes
- Role-based access control

#### Redirect Logic

- **ProtectedRoute**: Checks session and redirects to `/` if unauthenticated
- **LoginForm**: Handles `redirectTo` param for post-login navigation
- **Logout**: Hard redirect to `/` to clear client state completely

### Loading States

| State Type       | Implementation                            | Description                              |
| ---------------- | ----------------------------------------- | ---------------------------------------- |
| **Initial Load** | Full screen skeleton                      | Shown while checking session on app load |
| **Navigation**   | Top progress bar (NProgress)              | Indicates route transitions              |
| **Action**       | Inline spinner on buttons                 | Shows during form submission             |
| **Background**   | Silent updates (React Query `isFetching`) | Refreshes data without UI disruption     |

---

## 4. Testing Strategy

### Unit Tests

#### Contexts

Test `SessionProvider` state transitions with mocked NileDB hooks:

```typescript
// Example test structure
describe("SessionProvider", () => {
  it("transitions from unauthenticated to authenticated", () => {
    // Mock NileDB hook to return session
    // Verify AuthUser is set correctly
  });

  it("handles session recovery failure", () => {
    // Mock NileDB hook to throw error
    // Verify error state and retry logic
  });
});
```

#### Hooks

Test `useAuth` verified/unverified states:

```typescript
describe("useAuth", () => {
  it("returns verified user with full profile", () => {
    // Mock enrichment provider
    // Verify AuthUser structure
  });

  it("returns base user when enrichment fails", () => {
    // Mock enrichment failure
    // Verify BaseUser is returned
  });
});
```

#### Utils

Test retry logic with fake timers:

```typescript
describe("retryWithBackoff", () => {
  it("retries with exponential backoff", async () => {
    // Use fake timers
    // Verify delays: 500ms, 1s, 2s
  });
});
```

### Integration Tests

#### Login Flow

```typescript
describe("Login Flow", () => {
  it("completes login and redirects", async () => {
    // Fill form with credentials
    // Submit form
    // Verify API call to /api/auth/login
    // Check redirect to /dashboard
  });
});
```

#### Protected Routes

```typescript
describe("Protected Routes", () => {
  it("redirects unauthenticated users", () => {
    // Visit /dashboard without session
    // Verify redirect to /
  });

  it("allows authenticated users", () => {
    // Login first
    // Visit /dashboard
    // Verify no redirect
  });
});
```

#### Logout

```typescript
describe("Logout", () => {
  it("clears session and redirects", async () => {
    // Click logout button
    // Verify session cleared
    // Verify URL is /
  });
});
```

### Mocks

#### MockNileProvider

Simulates NileDB session states:

- `authenticated`: Returns valid session
- `unauthenticated`: Returns null session
- `loading`: Returns undefined session
- `error`: Throws error

#### MockEnrichmentProvider

Returns fixture data for:

- User profiles
- Tenants
- Companies
- Roles and permissions

---

## 5. Security & Performance

### Security

#### CSRF Protection

- **Next.js implicit protection**: Built-in CSRF protection for API routes
- **Explicit tokens**: Required for mutations (POST, PUT, DELETE, PATCH)

#### Role Validation

- **Middleware level**: Route access control
- **Component level**: UI element visibility
- **Dual-check**: Both checks required for complete protection

#### Session Management

- **Short-lived tokens**: Access tokens with limited lifetime
- **Secure cookies**: HttpOnly, Secure, SameSite=Strict
- **Token refresh**: Automatic refresh before expiration

#### Input Validation

- **Zod schemas**: Strict validation for all inputs
- **Type safety**: TypeScript ensures type correctness
- **Runtime validation**: Prevents malformed data

### Performance

#### Caching Strategy

| Data Type  | Cache Duration | Cache Location             |
| ---------- | -------------- | -------------------------- |
| Session    | 1 minute       | Memory cache in operations |
| Enrichment | 5 minutes      | SWR/React Query cache      |
| Profile    | 5 minutes      | React Query cache          |
| Tenants    | 5 minutes      | React Query cache          |

#### Optimization Techniques

1. **Parallel Fetching**
   - Profile, tenants, and companies fetched simultaneously
   - Reduces total load time

2. **Lazy Loading**
   - Heavy dashboard components loaded on demand
   - Reduces initial bundle size

3. **Code Splitting**
   - Auth routes separated from main bundle
   - Faster initial page load

4. **Background Updates**
   - Silent refresh on window focus
   - No UI disruption during data updates

---

## 6. Implementation Checklist

### ✅ Completed Items

- [x] **BaseUser Definition**: Verified in `types/auth-user.ts` or `index.ts`
- [x] **Session Context**: Implemented with retries
- [x] **Enrichment Context**: Implemented with separate loading states
- [x] **RoleGuard**: Created for granular access control
- [x] **Logout Fix**: Redirects to `/` preventing 404 loops
- [x] **Metrics**: `features/auth/lib/metrics.ts` tracking core events

### Verification Steps

1. **Type Checking**

   ```bash
   npm run typecheck
   ```

   Ensures `AuthUser` propagation is correct throughout the codebase.

2. **Testing**

   ```bash
   npm run test:auth
   ```

   Or run manual walkthrough of authentication flows.

3. **Analytics Verification**
   - Check PostHog dashboard for `login_success` events
   - Verify `session_recovery` tracking
   - Confirm `login_failure` events are captured

---

## 7. Migration Guide

### Step 1: Delete Legacy Code

```bash
# Remove old authentication context
rm context/base-auth-context.tsx
```

### Step 2: Update Root Layout

Update `_app.tsx` or RootLayout to wrap with `AuthProvider`:

```typescript
// app/[locale]/layout.tsx
import { AuthProvider } from '@/context/auth';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### Step 3: Replace Direct NileDB Calls

Replace all direct `useNile` calls with `useSession` or `useEnrichment`:

```typescript
// Before
import { useNile } from "@niledatabase/react";
const { user } = useNile();

// After
import { useSession } from "@/context/auth";
const { user } = useSession();
```

### Step 4: Update Redirects

Replace all `redirect('/login')` with `redirect('/')`:

```typescript
// Before
redirect("/login");

// After
redirect("/");
```

### Step 5: Update Protected Routes

Use the new `ProtectedRoute` component or `RoleGuard`:

```typescript
// Before
if (!user) redirect('/login');

// After
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

## 8. Verification

### Pre-Deployment Checklist

1. **Type Safety**

   ```bash
   npm run typecheck
   ```

   - No TypeScript errors
   - `AuthUser` properly propagated

2. **Test Coverage**

   ```bash
   npm run test
   ```

   - All auth-related tests passing
   - Integration tests cover login, logout, and protected routes

3. **Linting**

   ```bash
   npm run lint
   ```

   - No ESLint errors
   - FSD compliance verified

4. **Manual Testing**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials
   - [ ] Logout functionality
   - [ ] Protected route access
   - [ ] Session recovery on page refresh
   - [ ] Role-based access control

5. **Analytics Verification**
   - [ ] PostHog events firing correctly
   - [ ] `login_success` events tracked
   - [ ] `session_recovery` events tracked

6. **Performance**
   - [ ] Initial load time < 2 seconds
   - [ ] No unnecessary re-renders
   - [ ] Cache working correctly

### Troubleshooting

#### Session Not Persisting

- Check cookie settings (HttpOnly, Secure, SameSite)
- Verify NileDB session configuration
- Check middleware session validation

#### Enrichment Failing Silently

- Check network requests in DevTools
- Verify API endpoints are accessible
- Check error logging in PostHog

#### Role-Based Access Not Working

- Verify `RoleGuard` is properly configured
- Check middleware role validation
- Ensure permissions are correctly assigned

---

## Related Documentation

- [Feature API Contracts](./feature-api-contracts.md)
- [Database Architecture](./database-architecture.md)
- [FSD Migration Strategy](../archive/migration/fsd-migration-strategy.md)
- [Styling Guidelines](docs/guides/styling-guidelines.md)

## References

- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [NileDB Documentation](https://www.niledatabase.com/docs)
- [PostHog Analytics](https://posthog.com/docs)
