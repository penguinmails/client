// Optimized ESLint configuration using split configs for better performance
// Consolidated ignores with specialized rule configs for different file types

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

import { mainConfig } from "./eslint.main.config.mjs";
import { testConfig } from "./eslint.test.config.mjs";
import { storybookConfig } from "./eslint.storybook.config.mjs";

// Consolidated global ignores (covers all file types)
const globalIgnores = {
  ignores: [
    "**/node_modules/**",
    ".git/**",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "public/**",
    ".vscode/**",
    "*.log",
    "next-env.d.ts",
    ".eslintcache",
    "tsconfig.json",
    "tsconfig.tsbuildinfo",
    "*.lock",
    "package.json",
    "package-lock.json",
    "*.yml",
    "*.yaml",
    "*.md",
    "jest.setup.js",
    "jest.config.js",
    "coverage/**",
    "storybook-static/**",
    ".storybook/**",
    "scripts/**",
    "database/**",
    "docs/**",
    "*.config.*",
    "*.setup.*",
    "__mocks__/**",
    "middleware.ts",
    "postcss.config.mjs",
    "update-firebase-secrets.sh",
    "version.txt",
    "docker-compose.yml",
    ".env*",
    "messages",
    "email-sender/**/*.{js,jsx,ts,tsx}",
  ],
};

// Combine all rule configurations directly (no slice operations needed!)
const eslintConfig = [
  globalIgnores,
  ...compat.extends("next", "next/typescript", "prettier"),
  mainConfig,
  testConfig,
  storybookConfig,
];

export default eslintConfig;
