// Mock for @/app/api/[...nile]/nile
export const nile = {
  users: {
    getSelf: jest.fn(() => Promise.resolve({
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    })),
  },
  // Add other mock methods as needed
};
