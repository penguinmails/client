# Strategic Mocking Patterns and Examples

This document provides comprehensive patterns and examples for strategic mocking in the PenguinMails testing infrastructure. The key principle is to mock only external dependencies while using real UI components.

## Table of Contents

1. [Mocking Philosophy](docs/guides/actions-api.md#mocking-philosophy)
2. [What to Mock vs. What Not to Mock](docs/guides/actions-api.md#what-to-mock-vs-what-not-to-mock)
3. [External Dependency Mocking](docs/guides/actions-api.md#external-dependency-mocking)
4. [Context Provider Mocking](docs/guides/actions-api.md#context-provider-mocking)
5. [Next.js Hook Mocking](docs/guides/actions-api.md#nextjs-hook-mocking)
6. [API and Server Action Mocking](docs/guides/actions-api.md#api-and-server-action-mocking)
7. [Third-Party Library Mocking](docs/guides/actions-api.md#third-party-library-mocking)
8. [Pre-configured Mock Strategies](docs/guides/actions-api.md#pre-configured-mock-strategies)
9. [Custom Mock Strategies](docs/guides/actions-api.md#custom-mock-strategies)
10. [Mock Data Generators](docs/guides/actions-api.md#mock-data-generators)

## Mocking Philosophy

### Core Principle: Mock at the Boundary

Mock only at the boundaries between your application and external systems:

```typescript
// ✅ CORRECT - Mock external boundaries
jest.mock('@/lib/api/userService');        // External API
jest.mock('next/navigation');               // Next.js framework
jest.mock('@features/auth/ui/context/auth-context');        // External state management

// ❌ WRONG - Don't mock internal components
jest.mock('@/components/ui/button');       // Internal UI component
jest.mock('@/components/forms/UserForm');  // Internal business component
```

### Benefits of Strategic Mocking

1. **Higher Test Confidence**: Tests use real component interactions
2. **Catch Integration Issues**: Real components reveal actual problems
3. **Reduced Maintenance**: No need to update component mocks
4. **Better Refactoring Safety**: Tests break when real behavior changes
5. **Realistic Performance Testing**: Measure actual component overhead

## What to Mock vs. What Not to Mock

### ✅ DO Mock (External Dependencies)

| Category | Examples | Reason |
|----------|----------|---------|
| **APIs & Server Actions** | `fetch`, `@/lib/actions/*` | External data sources |
| **Context Providers** | `AuthContext`, `AnalyticsContext` | External state management |
| **Next.js Hooks** | `useRouter`, `useSearchParams` | Framework dependencies |
| **Third-party Libraries** | `posthog-js`, `sonner` | External services |
| **Node.js Modules** | `fs`, `path`, `crypto` | Server-side dependencies |

### ❌ DON'T Mock (Internal Components)

| Category | Examples | Reason |
|----------|----------|---------|
| **UI Components** | `Button`, `Card`, `Input` | Test real interactions |
| **Layout Components** | `DashboardHeader`, `Sidebar` | Test real composition |
| **Form Components** | `ContactForm`, `LoginForm` | Test real validation |
| **Business Components** | `UserProfile`, `CampaignList` | Test real logic |

## External Dependency Mocking

### API Service Mocking

```typescript
// Mock external API calls
jest.mock('@/lib/api/userService', () => ({
  getUserProfile: jest.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }),
  updateUserProfile: jest.fn().mockResolvedValue({
    success: true,
    data: { id: 'user-1', name: 'Updated Name' },
  }),
  deleteUser: jest.fn().mockRejectedValue(
    new Error('User cannot be deleted')
  ),
}));

// Mock fetch for direct API calls
global.fetch = jest.fn().mockImplementation((url: string) => {
  if (url.includes('/api/users')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        users: [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ],
      }),
    });
  }
  
  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: 'Not found' }),
  });
});
```

### Server Action Mocking

```typescript
// Mock Next.js server actions
jest.mock('@/lib/actions/campaignActions', () => ({
  createCampaign: jest.fn().mockImplementation(async (formData: FormData) => {
    const name = formData.get('name') as string;
    
    if (!name) {
      return { success: false, error: 'Name is required' };
    }
    
    return {
      success: true,
      data: {
        id: 'campaign-1',
        name,
        status: 'draft',
        createdAt: new Date().toISOString(),
      },
    };
  }),
  
  updateCampaign: jest.fn().mockResolvedValue({
    success: true,
    data: { id: 'campaign-1', status: 'active' },
  }),
  
  deleteCampaign: jest.fn().mockResolvedValue({
    success: true,
  }),
}));

// Mock form actions with realistic validation
jest.mock('@/lib/actions/formActions', () => ({
  submitContactForm: jest.fn().mockImplementation(async (data) => {
    // Simulate validation
    if (!data.email || !data.email.includes('@')) {
      return { success: false, errors: { email: 'Invalid email' } };
    }
    
    // Simulate success
    return { success: true, message: 'Form submitted successfully' };
  }),
}));
```

## Context Provider Mocking

### Authentication Context

```typescript
// Mock AuthContext with comprehensive user data
jest.mock('@features/auth/ui/context/auth-context', () => ({
  useAuth: jest.fn(() => ({
    // User data
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      profile: {
        userId: 'test-user-1',
        role: 'user',
        isPenguinMailsStaff: false,
        preferences: { 
          theme: 'light',
          language: 'en',
          notifications: true,
        },
        lastLoginAt: new Date('2024-01-01'),
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      tenants: ['tenant-1'],
    },
    
    // Authentication state
    isAuthenticated: true,
    loading: false,
    error: null,
    sessionExpired: false,
    
    // Tenant/Company management
    selectedTenantId: 'tenant-1',
    selectedCompanyId: 'company-1',
    userTenants: [
      { id: 'tenant-1', name: 'Test Tenant' },
    ],
    userCompanies: [
      { id: 'company-1', name: 'Test Company' },
    ],
    
    // Actions
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    signup: jest.fn().mockResolvedValue({ success: true }),
    updateUser: jest.fn().mockResolvedValue({ success: true }),
    setSelectedTenant: jest.fn(),
    setSelectedCompany: jest.fn(),
    refreshProfile: jest.fn().mockResolvedValue({}),
    refreshTenants: jest.fn().mockResolvedValue([]),
    refreshCompanies: jest.fn().mockResolvedValue([]),
    clearError: jest.fn(),
    restoreSession: jest.fn().mockResolvedValue(true),
    
    // System health
    systemHealth: { status: 'healthy', lastCheck: new Date() },
    checkSystemHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
  })),
  
  // Mock the provider component
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Variation: Mock different authentication states
export const createAuthMock = (overrides: Partial<any> = {}) => ({
  useAuth: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    ...overrides,
  })),
});

// Usage in tests
beforeEach(() => {
  // Mock unauthenticated state
  jest.mocked(useAuth).mockReturnValue(
    createAuthMock({ isAuthenticated: false }).useAuth()
  );
});
```

### Analytics Context

```typescript
// Mock AnalyticsContext with realistic metrics
jest.mock('@features/analytics/ui/context/analytics-context', () => ({
  useAnalytics: jest.fn(() => ({
    // Metrics data
    metrics: {
      // User metrics
      totalUsers: 1500,
      activeUsers: 1200,
      newUsers: 150,
      returningUsers: 1050,
      
      // Campaign metrics
      totalCampaigns: 45,
      activeCampaigns: 12,
      emailsSent: 25000,
      emailsDelivered: 24500,
      opensCount: 6125,
      clicksCount: 1225,
      
      // Performance metrics
      openRate: 0.25,
      clickRate: 0.05,
      conversionRate: 0.15,
      bounceRate: 0.02,
      
      // Revenue metrics
      totalRevenue: 125000,
      monthlyRevenue: 15000,
      averageOrderValue: 85.50,
    },
    
    // State
    loading: false,
    error: null,
    lastUpdated: new Date(),
    
    // Date range
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
    
    // Actions
    refreshMetrics: jest.fn().mockResolvedValue({}),
    getMetricsByDateRange: jest.fn().mockResolvedValue({}),
    trackEvent: jest.fn(),
    setDateRange: jest.fn(),
    
    // Filters
    filters: {
      campaign: null,
      segment: null,
      source: null,
    },
    setFilters: jest.fn(),
  })),
  
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock loading state
export const createAnalyticsLoadingMock = () => ({
  useAnalytics: jest.fn(() => ({
    metrics: null,
    loading: true,
    error: null,
    refreshMetrics: jest.fn(),
    trackEvent: jest.fn(),
  })),
});

// Mock error state
export const createAnalyticsErrorMock = (error: string) => ({
  useAnalytics: jest.fn(() => ({
    metrics: null,
    loading: false,
    error: new Error(error),
    refreshMetrics: jest.fn().mockRejectedValue(new Error(error)),
    trackEvent: jest.fn(),
  })),
});
```

## Next.js Hook Mocking

### Navigation Hooks

```typescript
// Mock Next.js navigation with comprehensive functionality
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    // Navigation methods
    push: jest.fn().mockResolvedValue(true),
    replace: jest.fn().mockResolvedValue(true),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    
    // Prefetching
    prefetch: jest.fn().mockResolvedValue(undefined),
    
    // Route information (read-only in app router)
    // These are handled by separate hooks in app router
  })),
  
  usePathname: jest.fn(() => '/dashboard'),
  
  useSearchParams: jest.fn(() => {
    const params = new URLSearchParams('?tab=overview&filter=active');
    return {
      ...params,
      // Add any custom methods if needed
      toString: () => params.toString(),
    };
  }),
  
  // Server-side functions
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`Redirect to ${url}`);
  }),
  
  notFound: jest.fn().mockImplementation(() => {
    throw new Error('Not Found');
  }),
}));

// Mock different route states
export const createRouterMock = (pathname: string, searchParams?: string) => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => pathname),
  useSearchParams: jest.fn(() => new URLSearchParams(searchParams || '')),
});

// Usage in tests
beforeEach(() => {
  const routerMock = createRouterMock('/campaigns', 'status=active');
  Object.entries(routerMock).forEach(([key, value]) => {
    jest.mocked(require('next/navigation')[key]).mockImplementation(value);
  });
});
```

### Headers and Cookies

```typescript
// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => {
    const headerMap = new Map([
      ['user-agent', 'Mozilla/5.0 (Test Browser)'],
      ['accept-language', 'en-US,en;q=0.9'],
      ['authorization', 'Bearer test-token'],
      ['x-forwarded-for', '127.0.0.1'],
    ]);
    
    return {
      get: (name: string) => headerMap.get(name.toLowerCase()),
      has: (name: string) => headerMap.has(name.toLowerCase()),
      forEach: (callback: (value: string, key: string) => void) => {
        headerMap.forEach(callback);
      },
      entries: () => headerMap.entries(),
      keys: () => headerMap.keys(),
      values: () => headerMap.values(),
    };
  }),
  
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => {
      const cookieMap = {
        'session-token': { value: 'test-session-token' },
        'theme': { value: 'dark' },
        'language': { value: 'en' },
      };
      return cookieMap[name as keyof typeof cookieMap];
    }),
    
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn((name: string) => ['session-token', 'theme'].includes(name)),
    
    getAll: jest.fn(() => [
      { name: 'session-token', value: 'test-session-token' },
      { name: 'theme', value: 'dark' },
    ]),
  })),
}));
```

## API and Server Action Mocking

### RESTful API Mocking

```typescript
// Mock comprehensive API responses
const createApiMock = () => {
  const mockResponses = {
    '/api/users': {
      GET: {
        users: [
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
        ],
        pagination: { page: 1, limit: 10, total: 2 },
      },
      POST: (body: any) => ({
        success: true,
        data: { id: '3', ...body, createdAt: new Date().toISOString() },
      }),
    },
    
    '/api/campaigns': {
      GET: {
        campaigns: [
          {
            id: 'camp-1',
            name: 'Welcome Series',
            status: 'active',
            emailsSent: 1500,
            openRate: 0.25,
            clickRate: 0.05,
          },
        ],
      },
      POST: (body: any) => ({
        success: true,
        data: { id: 'camp-2', ...body, status: 'draft' },
      }),
    },
  };

  return jest.fn().mockImplementation(async (url: string, options: RequestInit = {}) => {
    const method = options.method || 'GET';
    const endpoint = url.replace(/^https?:\/\/[^\/]+/, ''); // Remove domain
    
    const mockData = mockResponses[endpoint as keyof typeof mockResponses];
    
    if (!mockData) {
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    }
    
    const responseData = mockData[method as keyof typeof mockData];
    
    if (typeof responseData === 'function') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const result = responseData(body);
      
      return Promise.resolve({
        ok: true,
        status: method === 'POST' ? 201 : 200,
        json: () => Promise.resolve(result),
      });
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(responseData),
    });
  });
};

// Apply the mock
global.fetch = createApiMock();
```

### GraphQL API Mocking

```typescript
// Mock GraphQL API responses
jest.mock('@/lib/graphql/client', () => ({
  graphqlClient: {
    request: jest.fn().mockImplementation((query: string, variables?: any) => {
      // Mock based on query content
      if (query.includes('getUserProfile')) {
        return Promise.resolve({
          user: {
            id: variables?.userId || 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            profile: {
              avatar: 'https://example.com/avatar.jpg',
              bio: 'Test user bio',
            },
          },
        });
      }
      
      if (query.includes('getCampaigns')) {
        return Promise.resolve({
          campaigns: {
            nodes: [
              { id: '1', name: 'Campaign 1', status: 'ACTIVE' },
              { id: '2', name: 'Campaign 2', status: 'DRAFT' },
            ],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        });
      }
      
      return Promise.reject(new Error('Unknown query'));
    }),
  },
}));
```

## Third-Party Library Mocking

### Analytics and Tracking

```typescript
// Mock PostHog analytics
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  reset: jest.fn(),
  isFeatureEnabled: jest.fn().mockReturnValue(false),
  getFeatureFlag: jest.fn().mockReturnValue(null),
  onFeatureFlags: jest.fn(),
  
  // Mock person properties
  people: {
    set: jest.fn(),
    increment: jest.fn(),
  },
  
  // Mock group analytics
  group: jest.fn(),
}));

// Mock Google Analytics
jest.mock('gtag', () => ({
  gtag: jest.fn(),
}));
```

### UI Libraries

```typescript
// Mock Sonner toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
    promise: jest.fn().mockResolvedValue(undefined),
  },
  Toaster: ({ children }: { children?: React.ReactNode }) => children || null,
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
```

### Date and Time Libraries

```typescript
// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    // Simple mock implementation
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15';
    if (formatStr === 'MMM dd, yyyy') return 'Jan 15, 2024';
    return date.toISOString();
  }),
  parseISO: jest.fn((dateStr: string) => new Date(dateStr)),
  isValid: jest.fn(() => true),
  addDays: jest.fn((date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }),
}));

// Mock moment.js (if used)
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return {
    ...moment,
    default: jest.fn(() => ({
      format: jest.fn(() => '2024-01-15'),
      add: jest.fn().mockReturnThis(),
      subtract: jest.fn().mockReturnThis(),
      isValid: jest.fn(() => true),
    })),
  };
});
```

## Pre-configured Mock Strategies

The testing infrastructure provides pre-configured mock strategies for common scenarios:

### Basic Mock Strategy

```typescript
import { basicMockStrategy, withMockStrategy } from '@/lib/test-utils';

// Use pre-configured basic mocks
describe('Component Tests', () => {
  beforeEach(() => {
    withMockStrategy(basicMockStrategy, () => {
      // Your test setup
    });
  });
  
  // Tests automatically have:
  // - Next.js navigation mocks
  // - Internationalization mocks
  // - Toast notification mocks
  // - Server/client-only mocks
});
```

### Authentication Mock Strategy

```typescript
import { authMockStrategy } from '@/lib/test-utils';

// Includes authentication-related mocks
withMockStrategy(authMockStrategy, () => {
  // Tests have access to:
  // - AuthContext mock
  // - NileDB mocks
  // - Authentication hooks
});
```

### Analytics Mock Strategy

```typescript
import { analyticsMockStrategy } from '@/lib/test-utils';

// Includes analytics and tracking mocks
withMockStrategy(analyticsMockStrategy, () => {
  // Tests have access to:
  // - AnalyticsContext mock
  // - PostHog mocks
  // - Tracking utilities
});
```

### Comprehensive Mock Strategy

```typescript
import { comprehensiveMockStrategy } from '@/lib/test-utils';

// Includes all common mocks
withMockStrategy(comprehensiveMockStrategy, () => {
  // Tests have access to all pre-configured mocks
});
```

## Custom Mock Strategies

### Creating Custom Strategies

```typescript
import { createCustomMockStrategy, basicMockStrategy } from '@/lib/test-utils';

// Extend basic strategy with custom mocks
const customMockStrategy = createCustomMockStrategy(basicMockStrategy, {
  external: [
    {
      module: '@/lib/services/emailService',
      implementation: {
        sendEmail: jest.fn().mockResolvedValue({ success: true }),
        validateEmail: jest.fn().mockReturnValue(true),
      },
      resetBetweenTests: true,
    },
  ],
  contexts: [
    {
      contextName: 'EmailContext',
      mockData: {
        templates: [
          { id: '1', name: 'Welcome Email' },
          { id: '2', name: 'Newsletter' },
        ],
        loading: false,
      },
    },
  ],
});

// Use custom strategy
withMockStrategy(customMockStrategy, () => {
  // Your tests with custom mocks
});
```

### Component-Specific Mock Strategies

```typescript
// Create mock strategy for specific component needs
const dashboardMockStrategy = createCustomMockStrategy(authMockStrategy, {
  external: [
    {
      module: '@/lib/services/dashboardService',
      implementation: {
        getDashboardData: jest.fn().mockResolvedValue({
          widgets: [
            { id: '1', type: 'metric', value: 1500 },
            { id: '2', type: 'chart', data: [] },
          ],
        }),
      },
      resetBetweenTests: true,
    },
  ],
});

// Use in dashboard tests
describe('Dashboard Components', () => {
  beforeEach(() => {
    withMockStrategy(dashboardMockStrategy, () => {
      // Dashboard-specific setup
    });
  });
});
```

## Mock Data Generators

### Realistic Data Generation

```typescript
import { mockDataGenerators } from '@/lib/test-utils';

// Generate realistic user data
const testUser = mockDataGenerators.user({
  name: 'Custom Name',
  role: 'admin',
});

// Generate campaign data
const testCampaign = mockDataGenerators.campaign({
  status: 'active',
  emailsSent: 5000,
});

// Generate analytics data
const testAnalytics = mockDataGenerators.analytics({
  totalUsers: 2500,
  conversionRate: 0.18,
});
```

### Custom Data Generators

```typescript
// Create custom data generators
const createMockTemplate = (overrides: Partial<any> = {}) => ({
  id: `template-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Template',
  subject: 'Test Subject',
  content: '<p>Test content</p>',
  type: 'email',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createMockCampaignWithTemplates = (templateCount: number = 3) => ({
  ...mockDataGenerators.campaign(),
  templates: Array.from({ length: templateCount }, (_, i) =>
    createMockTemplate({ name: `Template ${i + 1}` })
  ),
});

// Use in tests
const campaignWithTemplates = createMockCampaignWithTemplates(5);
```

## Best Practices for Strategic Mocking

### 1. Mock Consistency

```typescript
// Create consistent mock data across tests
const createConsistentUserMock = () => ({
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  // Always include all required fields
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
});

// Use in multiple test files
beforeEach(() => {
  jest.mocked(useAuth).mockReturnValue({
    user: createConsistentUserMock(),
    isAuthenticated: true,
    // ... other auth properties
  });
});
```

### 2. Mock Validation

```typescript
// Add validation to mocks to catch test errors early
const createValidatedApiMock = () => {
  return jest.fn().mockImplementation(async (url: string, options: RequestInit = {}) => {
    // Validate request format
    if (options.method === 'POST' && !options.body) {
      throw new Error('POST request missing body');
    }
    
    // Return appropriate response
    return {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
  });
};
```

### 3. Mock Cleanup

```typescript
// Ensure proper cleanup between tests
afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  
  // Reset specific mocks if needed
  jest.mocked(fetch).mockClear();
});

// Reset module mocks between test suites
afterAll(() => {
  jest.resetModules();
});
```

### 4. Mock Documentation

```typescript
// Document complex mocks for team understanding
/**
 * Mock AuthContext for testing authenticated user scenarios
 * 
 * Provides:
 * - Authenticated user with admin role
 * - Two tenants available
 * - No loading or error states
 * 
 * Use this mock for testing components that require
 * authenticated admin users with multiple tenants.
 */
const createAdminUserMock = () => ({
  // Mock implementation
});
```

This strategic mocking approach ensures that your tests provide genuine confidence in your application's behavior while maintaining good performance and maintainability.