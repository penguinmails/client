module.exports = {
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    back: () => {},
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: () => {},
  }),
};