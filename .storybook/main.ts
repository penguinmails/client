import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    'storybook-next-intl',
    '@storybook/addon-jest'
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  "typescript": {
    "reactDocgen": "react-docgen-typescript",
    "reactDocgenTypescriptOptions": {
      "shouldExtractLiteralValuesFromEnum": true,
      "propFilter": (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  "webpackFinal": async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../'),
      // Mock Nile database modules with actual mock files for Storybook
      '@niledatabase/server': path.resolve(__dirname, './mocks/nile-server.js'),
      '@niledatabase/client': path.resolve(__dirname, './mocks/nile-server.js'),
      '@niledatabase/react': path.resolve(__dirname, './mocks/nile-server.js'),
    };
    return config;
  },
};
export default config;
