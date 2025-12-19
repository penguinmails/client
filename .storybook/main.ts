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
  webpackFinal: async (config) => {
    // Fix path aliases and mock server-side modules
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../'),
        // Mock Nile database modules with actual mock files for Storybook
        '@/convex/_generated/api': path.resolve(__dirname, './mocks/convex-api.js'),
        '@niledatabase/server': path.resolve(__dirname, './mocks/nile-server.js'),
        '@niledatabase/client': path.resolve(__dirname, './mocks/nile-server.js'),
        '@niledatabase/react': path.resolve(__dirname, './mocks/nile-server.js'),
        '@niledatabase/nextjs': path.resolve(__dirname, './mocks/nile-nextjs.js'),
      };
    }
    
    // Fallback for ALL Node.js modules that shouldn't run in browser
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      // File system
      fs: false,
      // Path - use false to avoid issues
      path: false,
      // Crypto
      crypto: false,
      // Node.js specifics (from pg and nile errors)
      async_hooks: false,
      dns: false,
      net: false,
      tls: false,
      // Additional common Node.js modules
      stream: false,
      http: false,
      https: false,
      zlib: false,
      util: false,
      // PostgreSQL
      'pg-native': false,
      pg: false,
    };
    
    return config;
  }
};

export default config;
