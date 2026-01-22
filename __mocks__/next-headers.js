// Mock function for Storybook environment
const mockFn = () => {
  const fn = () => {};
  fn.mock = { calls: [] };
  return fn;
};

module.exports = {
  headers: () => new Map(),
  cookies: () => ({
    get: mockFn(),
    set: mockFn(),
  }),
};