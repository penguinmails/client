// Mock for @niledatabase/client to avoid ESM parsing errors in Jest
// Simple mock function for Storybook environment
const mockFn = () => {
  const fn = () => {};
  fn.mock = { calls: [] };
  return fn;
};

// Mock for @niledatabase/react hooks
const useSignIn = (options = {}) => {
  const signIn = mockFn();
  // Return the function directly or as an object based on usage
  return signIn;
};

const useSignOut = (options = {}) => {
  const signOut = mockFn();
  return signOut;
};

const useUser = (options = {}) => ({
  user: null,
  isLoading: false,
  error: null,
});

const useSession = (options = {}) => ({
  session: null,
  isLoading: false,
  error: null,
});

module.exports = {
  // Mock NileDB client
  createClient: mockFn(() => ({
    auth: {
      signIn: mockFn(),
      signOut: mockFn(),
      getUser: mockFn(),
      getSession: mockFn(),
    },
    from: mockFn(() => ({
      select: mockFn(() => ({
        eq: mockFn(() => ({
          single: mockFn(),
          maybeSingle: mockFn(),
          then: mockFn(),
        })),
        insert: mockFn(() => ({
          values: mockFn(() => ({
            select: mockFn(() => ({
              single: mockFn(),
            })),
          })),
        })),
        update: mockFn(() => ({
          eq: mockFn(() => ({
            select: mockFn(() => ({
              single: mockFn(),
            })),
          })),
        })),
        delete: mockFn(() => ({
          eq: mockFn(() => ({
            then: mockFn(),
          })),
        })),
      })),
    })),
  })),

  // Mock auth utilities
  getCurrentUser: mockFn(),
  requireAuth: mockFn(),
  getSession: mockFn(),
  signIn: mockFn(),
  signOut: mockFn(),

  // Mock NileDB React hooks
  useSignIn,
  useSignOut,
  useUser,
  useSession,

  // Mock components
  SignOutButton: ({ children, className, buttonText, ...props }) => {
    const React = require('react');
    return React.createElement('button', {
      className,
      ...props,
    }, buttonText || children || 'Sign Out');
  },

  // Mock types
  User: {},
  Session: {},
  AuthError: class AuthError extends Error {},
};