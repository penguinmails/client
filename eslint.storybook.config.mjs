import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Storybook files - relaxed rules configuration
export const storybookConfig = {
  files: ["**/*.stories.{js,jsx,ts,tsx}", "**/*.story.{js,jsx,ts,tsx}"],
  rules: {
    // Relaxed rules for Storybook development
    "no-console": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/rules-of-hooks": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // Keep some important rules
    "prefer-const": "error",
  },
};

// For standalone usage (ignores handled by main config)
const eslintConfig = [
  ...compat.extends("next", "next/typescript", "prettier"),
  storybookConfig,
];

export default eslintConfig;
