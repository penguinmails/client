// Jest setup file for test environment configuration
require('@testing-library/jest-dom');

// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch for tests
global.fetch = jest.fn();

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Set up test environment variables
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
Object.defineProperty(process.env, 'NILEDB_USER', { value: 'test-user' });
Object.defineProperty(process.env, 'NILEDB_PASSWORD', { value: 'test-password' });
Object.defineProperty(process.env, 'NILEDB_API_URL', { value: 'https://test.api.thenile.dev/v2/databases/test-db-id' });
Object.defineProperty(process.env, 'NILEDB_POSTGRES_URL', { value: 'postgres://test.db.thenile.dev:5432/test_db' });
Object.defineProperty(process.env, 'NEXT_PUBLIC_APP_URL', { value: 'http://localhost:3000' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock PostHog for tests
jest.mock('posthog-js', () => ({
  init: jest.fn(() => ({
    capture: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
  })),
}));

// Mock sonner toast for tests
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));
