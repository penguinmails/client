// Mock for next/navigation to support both Storybook and Jest
// Simple mock function for cross-environment compatibility
const mockFn = () => {
  const fn = () => {};
  fn.mock = { calls: [] };
  return fn;
};

module.exports = {
  useRouter: () => ({
    push: mockFn(),
    replace: mockFn(),
    back: mockFn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: mockFn(),
  }),
};
