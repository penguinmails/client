/**
 * Mock Strategy Utilities for External Dependencies
 * 
 * This module provides pre-configured mock strategies for common external
 * dependencies while ensuring real UI components are never mocked.
 */

import { MockStrategy, ExternalMock, ContextMock, HookMock } from './component-testing';

// ============================================================================
// EXTERNAL DEPENDENCY MOCKS
// ============================================================================

/**
 * Mock for Next.js navigation hooks
 */
export const nextNavigationMock: ExternalMock = {
  module: 'next/navigation',
  implementation: {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }),
    usePathname: () => '/test-path',
    useSearchParams: () => new URLSearchParams('?test=true'),
    redirect: jest.fn(),
    notFound: jest.fn(),
  },
  resetBetweenTests: true,
};

/**
 * Mock for Next.js headers
 */
export const nextHeadersMock: ExternalMock = {
  module: 'next/headers',
  implementation: {
    headers: () => new Map([
      ['user-agent', 'test-agent'],
      ['accept-language', 'en-US'],
    ]),
    cookies: () => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }),
  },
  resetBetweenTests: true,
};

/**
 * Mock for next-intl internationalization
 */
export const nextIntlMock: ExternalMock = {
  module: 'next-intl',
  implementation: {
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({
      format: (value: unknown) => String(value),
      dateTime: (date: Date) => date.toISOString(),
      number: (num: number) => num.toString(),
    }),
    useLocale: () => 'en',
    useMessages: () => ({}),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
    createTranslator: () => (key: string) => key,
    getTranslator: () => (key: string) => key,
  },
  resetBetweenTests: false,
};

/**
 * Mock for NileDB client
 */
export const nileDbMock: ExternalMock = {
  module: '@niledatabase/client',
  implementation: {
    createClient: jest.fn(() => ({
      auth: {
        signIn: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
        signOut: jest.fn().mockResolvedValue({}),
        getUser: jest.fn().mockResolvedValue({ id: 'test-user', email: 'test@example.com' }),
        getSession: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({}),
        maybeSingle: jest.fn().mockResolvedValue(null),
        then: jest.fn().mockResolvedValue([]),
      })),
    })),
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'test-user' }),
    requireAuth: jest.fn().mockResolvedValue({ id: 'test-user' }),
    getSession: jest.fn().mockResolvedValue({ access_token: 'test-token' }),
  },
  resetBetweenTests: true,
};

/**
 * Mock for NileDB React hooks
 */
export const nileDbReactMock: ExternalMock = {
  module: '@niledatabase/react',
  implementation: {
    useSignIn: () => ({
      signIn: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
      loading: false,
      error: null,
    }),
    useSignUp: () => ({
      signUp: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
      loading: false,
      error: null,
    }),
    useAuth: () => ({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false,
      error: null,
    }),
  },
  resetBetweenTests: true,
};

/**
 * Mock for Sonner toast notifications
 */
export const sonnerMock: ExternalMock = {
  module: 'sonner',
  implementation: {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      loading: jest.fn(),
      dismiss: jest.fn(),
    },
    Toaster: ({ children }: { children?: React.ReactNode }) => children || null,
  },
  resetBetweenTests: true,
};

/**
 * Mock for PostHog analytics
 */
export const postHogMock: ExternalMock = {
  module: 'posthog-js',
  implementation: {
    init: jest.fn(),
    capture: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
    reset: jest.fn(),
    isFeatureEnabled: jest.fn().mockReturnValue(false),
  },
  resetBetweenTests: true,
};

/**
 * Mock for server-only module
 */
export const serverOnlyMock: ExternalMock = {
  module: 'server-only',
  implementation: {},
  resetBetweenTests: false,
};

/**
 * Mock for client-only module
 */
export const clientOnlyMock: ExternalMock = {
  module: 'client-only',
  implementation: {},
  resetBetweenTests: false,
};

// ============================================================================
// CONTEXT MOCKS
// ============================================================================

/**
 * Mock for AuthContext
 */
export const authContextMock: ContextMock = {
  contextName: 'AuthContext',
  mockData: {
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      profile: {
        userId: 'test-user-1',
        role: 'user',
        isPenguinMailsStaff: false,
        preferences: { theme: 'light' },
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tenants: ['tenant-1'],
    },
    nileUser: null,
    userTenants: [],
    userCompanies: [],
    isStaff: false,
    profile: {
      userId: 'test-user-1',
      role: 'user',
      isPenguinMailsStaff: false,
      preferences: { theme: 'light' },
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    loading: false,
    error: null,
    selectedTenantId: null,
    selectedCompanyId: null,
    setSelectedTenant: jest.fn(),
    setSelectedCompany: jest.fn(),
    refreshProfile: jest.fn(),
    refreshTenants: jest.fn(),
    refreshCompanies: jest.fn(),
    clearError: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    systemHealth: { status: 'healthy' },
    checkSystemHealth: jest.fn(),
    signup: jest.fn(),
    updateUser: jest.fn(),
    refreshUserData: jest.fn(),
    isAuthenticated: true,
    sessionExpired: false,
    restoreSession: jest.fn().mockResolvedValue(true),
  },
};

/**
 * Mock for AnalyticsContext
 */
export const analyticsContextMock: ContextMock = {
  contextName: 'AnalyticsContext',
  mockData: {
    metrics: {
      totalUsers: 100,
      activeUsers: 75,
      conversionRate: 0.15,
      revenue: 50000,
      campaigns: 25,
      emailsSent: 10000,
    },
    loading: false,
    error: null,
    refreshMetrics: jest.fn(),
    getMetricsByDateRange: jest.fn(),
    trackEvent: jest.fn(),
  },
};

// ============================================================================
// HOOK MOCKS
// ============================================================================

/**
 * Mock for custom hooks
 */
export const customHookMocks: HookMock[] = [
  {
    hookName: 'useMobile',
    module: '@/shared/hooks/use-mobile',
    implementation: () => false,
  },
  {
    hookName: 'useToast',
    module: '@/shared/hooks/use-toast',
    implementation: () => ({
      toast: jest.fn(),
      dismiss: jest.fn(),
      toasts: [],
    }),
  },
  {
    hookName: 'useOnlineStatus',
    module: '@/shared/hooks/use-online-status',
    implementation: () => true,
  },
];

// ============================================================================
// PRE-CONFIGURED MOCK STRATEGIES
// ============================================================================

/**
 * Basic mock strategy for simple component tests
 */
export const basicMockStrategy: MockStrategy = {
  external: [
    nextNavigationMock,
    nextIntlMock,
    sonnerMock,
    serverOnlyMock,
    clientOnlyMock,
  ],
  contexts: [],
  hooks: customHookMocks,
};

/**
 * Authentication-focused mock strategy
 */
export const authMockStrategy: MockStrategy = {
  external: [
    nextNavigationMock,
    nextIntlMock,
    nileDbMock,
    nileDbReactMock,
    sonnerMock,
    serverOnlyMock,
    clientOnlyMock,
  ],
  contexts: [authContextMock],
  hooks: customHookMocks,
};

/**
 * Analytics-focused mock strategy
 */
export const analyticsMockStrategy: MockStrategy = {
  external: [
    nextNavigationMock,
    nextIntlMock,
    postHogMock,
    sonnerMock,
    serverOnlyMock,
    clientOnlyMock,
  ],
  contexts: [authContextMock, analyticsContextMock],
  hooks: customHookMocks,
};

/**
 * Comprehensive mock strategy for complex integration tests
 */
export const comprehensiveMockStrategy: MockStrategy = {
  external: [
    nextNavigationMock,
    nextHeadersMock,
    nextIntlMock,
    nileDbMock,
    nileDbReactMock,
    postHogMock,
    sonnerMock,
    serverOnlyMock,
    clientOnlyMock,
  ],
  contexts: [authContextMock, analyticsContextMock],
  hooks: customHookMocks,
};

// ============================================================================
// MOCK STRATEGY UTILITIES
// ============================================================================

/**
 * Creates a custom mock strategy by combining existing strategies
 */
export function createCustomMockStrategy(
  baseStrategy: MockStrategy,
  overrides: Partial<MockStrategy> = {}
): MockStrategy {
  return {
    external: [...baseStrategy.external, ...(overrides.external || [])],
    contexts: [...baseStrategy.contexts, ...(overrides.contexts || [])],
    hooks: [...baseStrategy.hooks, ...(overrides.hooks || [])],
  };
}

/**
 * Applies mock strategy with proper cleanup
 */
export function withMockStrategy<T>(
  strategy: MockStrategy,
  testFn: () => T
): T {
  // Apply mocks
  strategy.external.forEach(mock => {
    if (mock.resetBetweenTests) {
      jest.doMock(mock.module, () => mock.implementation);
    }
  });

  try {
    return testFn();
  } finally {
    // Cleanup mocks that need resetting
    strategy.external.forEach(mock => {
      if (mock.resetBetweenTests) {
        jest.dontMock(mock.module);
      }
    });
  }
}

/**
 * Creates a mock fetch implementation for API testing
 */
export function createMockFetch(responses: Record<string, unknown> = {}): jest.MockedFunction<typeof fetch> {
  return jest.fn().mockImplementation((url: string | URL) => {
    const urlString = url.toString();
    
    // Find matching response
    const matchingKey = Object.keys(responses).find(key => urlString.includes(key));
    const response = matchingKey ? responses[matchingKey] : { data: null };
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response);
  });
}

/**
 * Mock data generators for common entities
 */
export const mockDataGenerators = {
  user: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }),

  tenant: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'test-tenant-1',
    name: 'Test Tenant',
    created: new Date().toISOString(),
    ...overrides,
  }),

  company: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'test-company-1',
    name: 'Test Company',
    domain: 'test.com',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  campaign: (overrides: Partial<Record<string, unknown>> = {}) => ({
    id: 'test-campaign-1',
    name: 'Test Campaign',
    status: 'active',
    emailsSent: 100,
    opensCount: 25,
    clicksCount: 5,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  analytics: (overrides: Partial<unknown> = {}) => ({
    totalUsers: 100,
    activeUsers: 75,
    conversionRate: 0.15,
    revenue: 50000,
    campaigns: 25,
    emailsSent: 10000,
    ...overrides,
  }),
};

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  MockStrategy,
  ExternalMock,
  ContextMock,
  HookMock,
} from './component-testing';