import { mockNileUser } from '@/shared/lib/data/team.mock';

// Mock for @/shared/config/nile
export const nile = {
  users: {
    getSelf: jest.fn(() => Promise.resolve(mockNileUser)),
  },
  // Add other mock methods as needed
};
