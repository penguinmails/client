// Mock for @niledatabase/server in Storybook
// This prevents errors when components import server-side Nile code

export const Nile = () => ({
  db: {},
  tenants: {},
  users: {},
});

export default {
  Nile,
};
