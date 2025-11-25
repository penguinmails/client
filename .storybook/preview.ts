import type { Preview } from '@storybook/nextjs'
import nextIntl from './next-intl';
import '@/app/[locale]/globals.css';

const preview: Preview = {
  initialGlobals: {
    locale: 'en',
    locales: {
      en: 'English',
      es: 'Español',
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true, // IMPORTANTE para Next 13/14/15 con next/navigation
      navigation: {
        pathname: "/dashboard",
        query: {},
      },
    },
    nextIntl,
  },
};

export default preview;
