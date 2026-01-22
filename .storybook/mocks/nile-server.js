// Mock Nile database modules for Storybook
export const server = {
  // Mock server functionality
  query: () => Promise.resolve([]),
  mutation: () => Promise.resolve({}),
  auth: {
    getUser: () => Promise.resolve(null),
    signIn: () => Promise.resolve({}),
    signOut: () => Promise.resolve({}),
  },
};

// Mock React hooks for NileDB
export const useSignIn = (options = {}) => {
  const signIn = (credentials) => {
    console.log("Mock signIn called with:", credentials);
    if (options.onSuccess) {
      setTimeout(() => options.onSuccess(), 100);
    }
  };
  signIn.mutate = signIn;
  signIn.mutateAsync = async (credentials) => {
    console.log("Mock signInAsync called with:", credentials);
    if (options.onSuccess) {
      setTimeout(() => options.onSuccess(), 100);
    }
    return {};
  };
  signIn.isLoading = false;
  signIn.isError = false;
  signIn.isSuccess = false;
  signIn.error = null;
  return signIn;
};

export const useSignOut = (options = {}) => {
  const signOut = () => {
    console.log("Mock signOut called");
    if (options.onSuccess) {
      setTimeout(() => options.onSuccess(), 100);
    }
  };
  signOut.mutate = signOut;
  signOut.mutateAsync = async () => {
    console.log("Mock signOutAsync called");
    if (options.onSuccess) {
      setTimeout(() => options.onSuccess(), 100);
    }
    return {};
  };
  signOut.isLoading = false;
  signOut.isError = false;
  signOut.isSuccess = false;
  signOut.error = null;
  return signOut;
};

export const useUser = (options = {}) => ({
  user: null,
  isLoading: false,
  error: null,
});

export const useSession = (options = {}) => ({
  session: null,
  isLoading: false,
  error: null,
});

// Mock SignOutButton component
export const SignOutButton = ({
  children,
  className,
  buttonText,
  ...props
}) => {
  const React = require("react");
  return React.createElement(
    "button",
    {
      className,
      ...props,
      onClick: () => {
        console.log("Mock SignOutButton clicked");
      },
    },
    buttonText || children || "Sign Out",
  );
};

// Mock UserInfo component
export const UserInfo = ({ children, className, ...props }) => {
  const React = require("react");
  return React.createElement(
    "div",
    {
      className,
      ...props,
    },
    children || "User Info",
  );
};

// Mock SessionProvider component
export const SessionProvider = ({ children, ...props }) => {
  const React = require("react");
  return React.createElement(React.Fragment, null, children);
};

// Mock useNile hook
export const useNile = () => ({
  client: createClient({}),
  user: null,
  isLoading: false,
  error: null,
});

// Mock client creation
export const createClient = (config) => {
  return {
    auth: {
      signIn: async () => ({}),
      signOut: async () => ({}),
      getUser: async () => null,
      getSession: async () => null,
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (field, value) => ({
          single: async () => null,
          maybeSingle: async () => null,
          then: async (callback) => callback(null),
        }),
      }),
      insert: (data) => ({
        values: (values) => ({
          select: (columns) => ({
            single: async () => null,
          }),
        }),
      }),
      update: (data) => ({
        eq: (field, value) => ({
          select: (columns) => ({
            single: async () => null,
          }),
        }),
      }),
      delete: () => ({
        eq: (field, value) => ({
          then: async (callback) => callback(null),
        }),
      }),
    }),
  };
};

// Mock auth object from @niledatabase/client
export const auth = {
  signIn: async () => ({}),
  signOut: async () => ({}),
  getUser: async () => null,
  getSession: async () => null,
  signUp: async () => ({ user: null, error: null }),
};

// Mock ActiveSession type
export const ActiveSession = {};

// Mock auth utilities
export const getCurrentUser = async () => null;
export const requireAuth = async () => null;
export const getSession = async () => null;
export const signIn = async () => ({});
export const signOut = async () => ({});

// Mock types
export const User = {};
export const Session = {};
export const AuthError = class AuthError extends Error {};

export default server;
