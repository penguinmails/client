import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Main application code - strict rules configuration
export const mainConfig = {
  files: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "types/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "context/**/*.{js,jsx,ts,tsx}",
    "i18n/**/*.{js,jsx,ts,tsx}",
    "features/**/*.{js,jsx,ts,tsx}",
    "shared/**/*.{js,jsx,ts,tsx}",
  ],
  rules: {
    // Strict rules for main application code
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/no-unused-expressions": "warn",
    "@typescript-eslint/no-array-constructor": "warn",
    "no-console": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/incompatible-library": "off",
    "import/no-self-import": "error",
  },
  linterOptions: {
    reportUnusedDisableDirectives: "warn",
  },
};

// For standalone usage (ignores handled by main config)
const eslintConfig = [
  ...compat.extends("next", "next/typescript", "prettier"),
  mainConfig,
];

export default eslintConfig;
