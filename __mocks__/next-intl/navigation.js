// Mock for next-intl/navigation
module.exports = {
  createNavigation: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Link: ({ children, href, ...props }) => null,
    redirect: () => {},
    usePathname: () => '/',
    useRouter: () => ({
      push: () => {},
      replace: () => {},
      back: () => {},
      forward: () => {},
      refresh: () => {},
      prefetch: () => {},
    }),
    getPathname: () => '/',
  }),
};
