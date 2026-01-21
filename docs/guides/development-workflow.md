# Development Workflow and Patterns

## Overview

This section covers advanced development workflow, testing strategies, troubleshooting guides, and common patterns used across the project. For basic setup and onboarding, see the [Getting Started Guide](../getting-started.md). For feature-specific development guides, see the documentation co-located with the relevant code.

## Development Process

### Prerequisites

Before diving into advanced development patterns, ensure you have completed the basic setup:

1. **Environment Setup**: Complete the [Getting Started Guide](../getting-started.md)
2. **Code Organization**: Understand the [project structure](../getting-started.md#understanding-the-codebase)
3. **Type System**: Review [TypeScript organization](../architecture/README.md)
4. **Testing**: Follow [testing strategies](#testing-strategies)

### Advanced Development Principles

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

- [Analytics Testing](docs/guides/testing-general.md)
- [Billing Testing](docs/guides/testing-general.md)
- [Component Testing Patterns](docs/architecture/README.md#testing)

## Architectural Decisions and Patterns

### Key Architectural Refactoring Patterns

#### Component Refactoring (Billing Dashboard Example)

- **Large Component Reduction**: Successfully reduced `RealTimeBillingDashboard.tsx` from 975 to 208 lines (78% reduction)
- **Modular Extraction**: Extracted 9 sub-components into dedicated files with single responsibilities
- **Hook Extraction**: Moved complex state management logic to custom hooks (`useBillingRefresh`)
- **Benefits**: Improved maintainability, testability, reusability, and performance through smaller bundle sizes

#### Performance Monitor Refactoring

- **Monolithic Reduction**: Reduced `RuntimePerformanceMonitor` from 1066 to 369 lines (65% reduction)
- **Modular Architecture**: Extracted utilities for statistics, validation, measurement, and reporting
- **Composable Pattern**: Created reusable utility functions that can be combined flexibly
- **Backward Compatibility**: Maintained existing API while providing new modular approach

### Security Architecture Patterns

#### OLTP-First Security Boundaries

- **Database-Level Isolation**: Use Row-Level Security (RLS) for tenant isolation
- **PCI Compliance**: Implement payment tokenization with external processors
- **Sensitive Data Protection**: Store only last 4 digits and tokenized IDs for payment methods
- **Audit Trail**: Complete financial audit trail with `created_by_id` and operation logging
- **Data Boundary Enforcement**: Never store sensitive data (PII, payment info, credentials) in analytics layer

### Performance Optimization Patterns

#### Analytics Performance Optimization

- **Progressive Filtering**: Load OLTP data first (fast), then apply basic filters, load analytics separately
- **Redis Caching Strategy**: 5-15 minute TTL based on data freshness requirements
- **Composite Cache Keys**: Include filter combinations and date ranges in cache keys
- **Parallel Processing**: Process OLTP and OLAP data simultaneously for mixed calculations

#### Caching TTL Strategy

```typescript
const cacheTTLs = {
  performance: 5 * 60, // 5 minutes - frequently changing data
  usage: 10 * 60, // 10 minutes - moderate change frequency
  effectiveness: 15 * 60, // 15 minutes - slower changing metrics
  overview: 5 * 60, // 5 minutes - dashboard data
  timeSeries: 10 * 60, // 10 minutes - chart data
};
```

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
    const stats = await analyticsService.getCampaignStats(id);
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
  args: any,
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

### Database Integration

- [Database Optimization](docs/architecture/database-architecture.md)
- [Database Query Patterns](docs/architecture/database-architecture.md#query-performance)
- [Type Safety with Analytics Services](docs/architecture/database-architecture.md#type-system)

### Next.js Patterns

- **App Router**: Use app directory structure for routing
- **Server Actions**: Implement server-side logic with type safety
- **Client Components**: Mark client-only components appropriately

### TypeScript Patterns {#type-patterns}

- [Type System Organization](docs/architecture/README.md)
- [Type Safety Best Practices](docs/architecture/README.md#type-safety-best-practices)
- [Generic Utilities](docs/architecture/README.md#generic-type-utilities)

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
- **Database Queries**: Optimize database queries and indexes
- **Caching**: Implement appropriate caching strategies
- **Lazy Loading**: Use dynamic imports for large components

## Troubleshooting

### Common Issues

- [General Troubleshooting](./troubleshooting.md)
- [Database-Specific Issues](docs/architecture/database-architecture.md)
- [Type System Issues](docs/architecture/README.md#type-system-limitations)

### Debugging Strategies

1. **Use TypeScript**: Let the type system catch errors early
2. **Console Logging**: Strategic logging for debugging
3. **React DevTools**: Use React DevTools for component debugging
4. **Network Tab**: Monitor API calls and performance
5. **Database Dashboard**: Use database dashboard for backend debugging

### Performance Debugging

- **React Profiler**: Identify performance bottlenecks
- **Database Metrics**: Monitor query performance
- **Bundle Analyzer**: Analyze bundle size and dependencies

## Migration Patterns

### General Migration Strategies

- [Migration Patterns](docs/features/analytics/MIGRATION.md)
- [Type Migration Strategies](docs/architecture/README.md#migration-and-evolution)
- [Service Migration Patterns](docs/guides/actions-migration-lessons.md)

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
- **Database DevTools**: Database debugging tools

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

- [Analytics Documentation](docs/architecture/README.md)
- [Type System Guide](docs/architecture/README.md)
- [Infrastructure Setup](../infrastructure/)

### Actions Development

- [Actions Best Practices](./actions-best-practices.md) - Patterns and guidelines for actions
- [Actions API Documentation](./actions-api.md) - API reference and interfaces
- [Actions Migration Lessons](./actions-migration-lessons.md) - Architectural evolution insights

### Feature-Specific Help

- [Analytics Services](docs/architecture/README.md)
- [Authentication Implementation](docs/architecture/README.md)
- [Billing Implementation](docs/architecture/README.md)

### Common Questions

- **Type Errors**: Check [Type System Guide](docs/architecture/README.md)
- **Performance Issues**: Review [troubleshooting guide](./troubleshooting.md)
- **Testing Questions**: See feature-specific testing guides
- **Architecture Questions**: Review [analytics architecture](docs/architecture/README.md)

## Contributing

When contributing to the project:

1. **Follow Patterns**: Use established patterns and conventions
2. **Update Documentation**: Keep documentation current with changes
3. **Add Tests**: Include appropriate test coverage
4. **Type Safety**: Ensure strict TypeScript compliance
5. **Performance**: Consider performance implications of changes

For specific contribution guidelines, see the relevant feature documentation.
