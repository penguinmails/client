// Mock for next-intl to avoid ESM parsing errors in Jest
module.exports = {
  useTranslations: () => (key) => key, // returns the key as fallback
  useFormatter: () => ({ format: (value) => value }),
  useLocale: () => "en",
  useMessages: () => ({}),
  NextIntlClientProvider: ({ children }) => children,
  createTranslator: () => (key) => key,
  getTranslator: () => (key) => key,
};
