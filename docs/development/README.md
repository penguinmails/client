# Development Workflow and Patterns

## Overview

This section covers general development workflow, testing strategies, troubleshooting guides, and common patterns used across the project. For feature-specific development guides, see the documentation co-located with the relevant code.

## Development Process

### Getting Started

1. **Environment Setup**: Follow [Infrastructure Setup](../infrastructure/) guides
2. **Code Organization**: Understand the [project structure](#project-structure)
3. **Type System**: Review [TypeScript organization](../types/README.md)
4. **Testing**: Follow [testing strategies](#testing-strategies)

### Project Structure

```
├── app/                    # Next.js app router pages
├── components/            # React components (with co-located docs)
├── lib/                   # Business logic and utilities
│   ├── actions/          # Server actions (with co-located docs)
│   ├── services/         # Business services (with co-located docs)
│   └── utils/           # Utility functions
├── types/                # TypeScript type definitions
├── convex/               # Convex backend functions
└── docs/                 # Central documentation hub
```

### Code Organization Principles

1. **Co-location**: Keep related code and documentation together
2. **Domain Separation**: Organize by business domain, not technical layer
3. **Clear Boundaries**: Maintain separation between UI, services, and data layers
4. **Type Safety**: Use TypeScript strictly throughout the codebase

## Testing Strategies

### Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what the code does, not how
- **Test Pyramid**: Unit tests > Integration tests > E2E tests
- **Co-located Tests**: Keep tests near the code they test

### Testing Patterns

#### Unit Testing

```typescript
// Service testing pattern
describe("CampaignAnalyticsService", () => {
  it("should calculate open rate correctly", () => {
    const service = new CampaignAnalyticsService();
    const result = service.calculateOpenRate(100, 25);
    expect(result).toBe(25);
  });
});
```

#### Component Testing

```typescript
// Component testing with React Testing Library
describe('AnalyticsCard', () => {
  it('should display loading state', () => {
    render(<AnalyticsCard loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

#### Integration Testing

```typescript
// Service integration testing
describe("Analytics Integration", () => {
  it("should fetch and process campaign data", async () => {
    const result = await analyticsService.getCampaignStats("campaign-1");
    expect(result).toMatchObject({
      openRate: expect.any(Number),
      clickRate: expect.any(Number),
    });
  });
});
```

### Feature-Specific Testing

- [Analytics Testing](../../lib/services/analytics/testing.md)
- [Billing Testing](../../lib/actions/billing/testing.md)
- [Component Testing Patterns](../../components/analytics/README.md#testing)

## Common Development Patterns

### Service Layer Pattern

Consistent service organization across features:

```typescript
// Base service interface
interface BaseService<T, K> {
  getById(id: K): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

// Feature-specific service implementation
class CampaignService implements BaseService<Campaign, CampaignId> {
  // Implementation details
}
```

### Error Handling Pattern

Standardized error handling across the application:

```typescript
// Result type for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Service method with error handling
async function getCampaignStats(id: string): Promise<Result<CampaignStats>> {
  try {
    const stats = await convex.query(api.analytics.getCampaignStats, { id });
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Hook Pattern

Consistent React hook patterns:

```typescript
// Data fetching hook pattern
function useAnalyticsData<T>(
  query: string,
  args: any
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  // Implementation
}
```

## Platform-Specific Patterns

### Convex Integration

- [Convex Limitations and Workarounds](./convex-limitations.md)
- [Convex Query Patterns](./convex-limitations.md#query-performance-limitations)
- [Type Safety with Convex](./convex-limitations.md#type-system-limitations)

### Next.js Patterns

- **App Router**: Use app directory structure for routing
- **Server Actions**: Implement server-side logic with type safety
- **Client Components**: Mark client-only components appropriately

### TypeScript Patterns {#type-patterns}

- [Type System Organization](../types/README.md)
- [Type Safety Best Practices](../types/README.md#type-safety-best-practices)
- [Generic Utilities](../types/README.md#generic-type-utilities)

## Code Quality Standards

### Linting and Formatting

- **ESLint**: Enforce code quality rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled

### Code Review Guidelines

1. **Type Safety**: Ensure all code is properly typed
2. **Test Coverage**: New features should include tests
3. **Documentation**: Update relevant documentation
4. **Performance**: Consider performance implications
5. **Security**: Review for security vulnerabilities

### Performance Considerations

- **Bundle Size**: Monitor and optimize bundle size
- **Database Queries**: Optimize Convex queries and indexes
- **Caching**: Implement appropriate caching strategies
- **Lazy Loading**: Use dynamic imports for large components

## Troubleshooting

### Common Issues

- [General Troubleshooting](./troubleshooting.md)
- [Convex-Specific Issues](./convex-limitations.md)
- [Type System Issues](../types/README.md#type-system-limitations)

### Debugging Strategies

1. **Use TypeScript**: Let the type system catch errors early
2. **Console Logging**: Strategic logging for debugging
3. **React DevTools**: Use React DevTools for component debugging
4. **Network Tab**: Monitor API calls and performance
5. **Convex Dashboard**: Use Convex dashboard for backend debugging

### Performance Debugging

- **React Profiler**: Identify performance bottlenecks
- **Convex Metrics**: Monitor query performance
- **Bundle Analyzer**: Analyze bundle size and dependencies

## Migration Patterns

### General Migration Strategies

- [Migration Patterns](./migration-patterns.md)
- [Type Migration Strategies](../types/README.md#migration-and-evolution)
- [Service Migration Patterns](../../lib/services/analytics/migration-lessons.md)

### Backward Compatibility

Strategies for maintaining compatibility during migrations:

1. **Gradual Migration**: Migrate incrementally, not all at once
2. **Feature Flags**: Use feature flags for gradual rollouts
3. **Deprecation Warnings**: Provide clear migration paths
4. **Version Compatibility**: Maintain API compatibility during transitions

## Development Tools

### Recommended Extensions

- **TypeScript**: Enhanced TypeScript support
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **React DevTools**: React debugging
- **Convex DevTools**: Convex backend debugging

### Useful Scripts

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Build
npm run build
```

## Getting Help

### Documentation Resources

- [Analytics Documentation](../analytics/README.md)
- [Type System Guide](../types/README.md)
- [Infrastructure Setup](../infrastructure/)

### Actions Development

- [Actions Best Practices](./actions-best-practices.md) - Patterns and guidelines for actions
- [Actions API Documentation](./actions-api.md) - API reference and interfaces
- [Actions Migration Lessons](./actions-migration-lessons.md) - Architectural evolution insights

### Feature-Specific Help

- [Analytics Services](../../lib/services/analytics/README.md)
- [Authentication Implementation](../../lib/actions/core/README.md)
- [Billing Implementation](../../lib/actions/billing/README.md)

### Common Questions

- **Type Errors**: Check [Convex Limitations](./convex-limitations.md)
- **Performance Issues**: Review [troubleshooting guide](./troubleshooting.md)
- **Testing Questions**: See feature-specific testing guides
- **Architecture Questions**: Review [analytics architecture](../analytics/README.md)

## Contributing

When contributing to the project:

1. **Follow Patterns**: Use established patterns and conventions
2. **Update Documentation**: Keep documentation current with changes
3. **Add Tests**: Include appropriate test coverage
4. **Type Safety**: Ensure strict TypeScript compliance
5. **Performance**: Consider performance implications of changes

For specific contribution guidelines, see the relevant feature documentation.
