import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export const testConfig = {
  files: [
    "**/*.{test,spec}.{js,jsx,ts,tsx}",
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/test/**/*.{js,jsx,ts,tsx}",
    "**/tests/**/*.{js,jsx,ts,tsx}",
  ],
  rules: {
    // Relaxed rules for test files
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // Keep some important rules
    "prefer-const": "error",
  },
};

// Test files - relaxed rules for flexibility (ignores handled by main config)
const eslintConfig = [
  // Next.js and TypeScript configuration for test files - relaxed
  ...compat.extends("next", "next/typescript", "prettier"),
  testConfig,
];

export default eslintConfig;
