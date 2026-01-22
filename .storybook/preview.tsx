import type { Preview } from '@storybook/nextjs'
import nextIntl from './next-intl';
import React from 'react';
import '@/app/[locale]/globals.css';

// Mock providers for Storybook
const MockSessionProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const MockUserEnrichmentProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

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
    actions: { argTypesRegex: '^on.*' },
    nextIntl,
  },
  decorators: [
    (Story) => (
      <MockSessionProvider>
        <MockUserEnrichmentProvider>
          <Story />
        </MockUserEnrichmentProvider>
      </MockSessionProvider>
    ),
  ],
};

export default preview;