import { mockNileUser } from '@/features/team/data/mock';

// Mock for @/app/api/[...nile]/nile
export const nile = {
  users: {
    getSelf: jest.fn(() => Promise.resolve(mockNileUser)),
  },
  // Add other mock methods as needed
};
