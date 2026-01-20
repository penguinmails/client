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

export default server;