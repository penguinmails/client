# Auth Context Refactor Instructions

## Primary Objectives
✅ Fix login error flash
✅ Separate auth/enrichment concerns
✅ Comply with AUTH_FLOW.md
✅ Implement dashboard loading states

## Implementation Checklist

### Core Architecture
- [ ] Create BaseAuthContext
- [ ] Create UserEnrichmentContext
- [ ] Update auth types

### Error Handling
- [ ] Add session check retries
- [ ] Implement error boundaries
- [ ] Add loading transitions

### UI Requirements
- [ ] Dashboard skeleton loading
- [ ] Navbar role-based states
- [ ] Payment/verification banners

### Testing
- [ ] Update auth integration tests
- [ ] Add enrichment error cases
- [ ] Verify AUTH_FLOW compliance

## Login Error Fix Strategy
```ts
// Before
await signInHook();
redirect();

// After
await signInHook();
await checkSessionWithRetry(3); // 3 retries
await enrichUser();
safeRedirect();
```

## Documentation
- [x] Created PROPOSAL_AUTH_CONTEXT_SPLIT.md
- [ ] Update AUTH_FLOW.md
- [ ] Add ADR (Architecture Decision Record)