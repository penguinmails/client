// Mock for next-intl/navigation
const React = require('react');

module.exports = {
  createNavigation: () => ({
    Link: ({ children, href, ...props }) => {
      return React.createElement('a', { href, ...props }, children);
    },
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
