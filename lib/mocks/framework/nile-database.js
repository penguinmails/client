// Mock for @niledatabase/client to avoid ESM parsing errors in Jest
module.exports = {
  // Mock NileDB client
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          maybeSingle: jest.fn(),
          then: jest.fn(),
        })),
        insert: jest.fn(() => ({
          values: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => ({
            then: jest.fn(),
          })),
        })),
      })),
    })),
  })),

  // Mock auth utilities
  getCurrentUser: jest.fn(),
  requireAuth: jest.fn(),
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),

  // Mock types
  User: {},
  Session: {},
  AuthError: class AuthError extends Error {},
};