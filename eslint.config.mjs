import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores - exclude generated files and directories
  {
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
      "middleware.ts",
      "postcss.config.mjs",
      "update-firebase-secrets.sh",
      "version.txt",
      "docker-compose.yml",
      ".env*",
    ],
  },
  // Next.js and TypeScript configuration with FSD compliance
  ...compat.extends("next", "next/typescript", "prettier"),
  {
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
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "error",
      "@typescript-eslint/no-var-requires": "error",
      // Relax some rules that cause issues with generated code
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-array-constructor": "warn",
      // Allow console in development, but warn about it
      "no-console": "warn",
      // Relax React hooks rules for complex patterns
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Disable incompatible-library warnings for React Hook Form and TanStack Table
      // These libraries are widely used and tested, and their APIs work correctly
      // despite React Compiler warnings about memoization safety
      // Specific libraries affected: react-hook-form (watch functions), @tanstack/react-table (useReactTable)
      "react-hooks/incompatible-library": "off",
      // Handle complex import patterns
      "import/no-cycle": "warn",
      "import/no-self-import": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
  // Special rules for Storybook stories - allow console, any types, and React Hook violations for development flexibility
  {
    files: [
      "**/*.stories.{js,jsx,ts,tsx}",
      "**/*.story.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // Allow React Hook violations in Storybook render functions (special case)
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      // Still enforce other important rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Special rules for test files - allow console, any types, and React Hook violations for testing flexibility
  {
    files: [
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/test/**/*.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // Still enforce other important rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
