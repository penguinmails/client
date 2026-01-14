/**
 * Type definitions for test utilities and mocks
 * Provides type-safe alternatives to 'any' usage in tests
 */

/**
 * Partial console interface for testing
 * Includes only the methods we typically mock in tests
 */
export interface MockConsole extends Partial<Console> {
    log?: jest.Mock;
    warn?: jest.Mock;
    error?: jest.Mock;
    debug?: jest.Mock;
    info?: jest.Mock;
}

/**
 * Generic mock function type for simple mocks
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockFunction<T extends (...args: any[]) => any = () => void> = jest.Mock<T>;

/**
 * Type-safe mock fetch function
 */
export type MockFetch = jest.MockedFunction<typeof global.fetch>;

/**
 * Utility to create a type-safe mock console
 */
export function createMockConsole(): MockConsole {
    return {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
    };
}

/**
 * Type-safe console assignment for tests
 */
export function mockGlobalConsole(mockConsole: MockConsole): void {
    global.console = mockConsole as unknown as Console;
}