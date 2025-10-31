import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  "stories": [
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    'storybook-next-intl',
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ]
};
export default config;
