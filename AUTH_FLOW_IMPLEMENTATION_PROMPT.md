# ⚠️ DEPRECATED - See Updated Documentation

**This file has been moved to `/docs/architecture/authentication.md`**

Please refer to the updated documentation for complete authentication architecture details.

---

# Auth Flow Implementation Reference & Guide

**Status**: Deprecated - Migrated to `/docs/architecture/authentication.md`

**Last Updated**: January 16, 2026

## Quick Reference

For the complete authentication architecture documentation, see:
- [Authentication Architecture](./docs/architecture/authentication.md)
- [Feature API Contracts](./docs/feature-api-contracts.md)
- [Database Architecture](./docs/database-architecture.md)

## Summary of Changes

This document has been transformed into comprehensive documentation with:

1. **Structured Sections**: Clear table of contents and organized content
2. **Code Examples**: Complete TypeScript interfaces and implementation examples
3. **Testing Strategy**: Detailed unit and integration test examples
4. **Security Guidelines**: Comprehensive security considerations
5. **Performance Optimization**: Caching strategies and optimization techniques
6. **Migration Guide**: Step-by-step migration instructions
7. **Verification Checklist**: Pre-deployment verification steps

## Key Architecture Components

### Data Models
- **BaseUser**: Core identity (id, email, emailVerified)
- **AuthUser**: Enriched with profile, tenants, companies, roles, permissions

### Error Handling
- Custom error hierarchy (AuthError, SessionRecoveryError, EnrichmentError)
- Exponential backoff for session recovery
- Silent background refresh for enrichment failures

### Integration Points
- PostHog analytics tracking (login_attempt_start, login_success, login_failure, session_recovery)
- Next.js App Router with middleware protection
- Loading states (skeleton, NProgress, inline spinners)

### Security
- CSRF protection (Next.js implicit + explicit tokens)
- Dual role validation (middleware + component)
- Short-lived tokens with secure cookies
- Zod schema validation

### Performance
- 1-minute session cache
- 5-minute enrichment cache
- Parallel fetching of profile/tenants/companies
- Lazy loading and code splitting

## Migration Checklist

- [x] BaseUser Definition verified
- [x] Session Context with retries implemented
- [x] Enrichment Context with separate loading states
- [x] RoleGuard for granular access control
- [x] Logout fix (redirects to `/`)
- [x] Metrics tracking in `auth-metrics.ts`

## Verification Commands

```bash
# Type checking
npm run typecheck

# Testing
npm run test

# Linting
npm run lint
```

## Related Files

- `/context/auth/` - Authentication context providers
- `/lib/monitoring/auth-metrics.ts` - Analytics tracking
- `/types/auth-user.ts` - Type definitions
- `/components/auth/` - Authentication components

---

*This file is kept for historical reference. All new development should reference the updated documentation.*
