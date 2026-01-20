/**
 * ESLint Extended Configuration with FSD Compliance Rules
 * 
 * This config extends the base eslint.config.mjs and adds FSD
 * architectural and style validation rules.
 * 
 * Use: npm run lint:fsd
 * 
 * Architectural Rules:
 * - no-upward-dependencies: Prevent FSD layer violations
 * - no-cross-feature-imports: Prevent cross-feature coupling
 * - no-old-import-paths: Catch legacy imports
 * - no-business-logic-in-components: Keep UI components pure
 * 
 * Style Rules:
 * - no-hex-colors: Prevent hardcoded hex colors
 * - no-arbitrary-spacing: Prevent arbitrary Tailwind spacing values
 * - require-semantic-tokens: Enforce design token usage
 */

import baseConfig from "./eslint.config.mjs";
import fsdCompliancePlugin from "./eslint-plugin-fsd-compliance.js";

const extendedConfig = [
  ...baseConfig,
  {
    // Add FSD rules to main source files
    files: [
      "app/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "lib/**/*.{js,jsx,ts,tsx}",
      "hooks/**/*.{js,jsx,ts,tsx}",
      "context/**/*.{js,jsx,ts,tsx}",
      "features/**/*.{js,jsx,ts,tsx}",
      "shared/**/*.{js,jsx,ts,tsx}",
    ],
    plugins: {
      "fsd-compliance": fsdCompliancePlugin,
    },
    rules: {
      // FSD Architectural Rules
      "fsd-compliance/no-upward-dependencies": "error",
      "fsd-compliance/no-cross-feature-imports": "error",
      "fsd-compliance/no-old-import-paths": "error",
      "fsd-compliance/no-business-logic-in-components": "warn",
      
      // FSD Style Rules
      "fsd-compliance/no-hex-colors": "error",
      "fsd-compliance/no-arbitrary-spacing": "warn",
      "fsd-compliance/require-semantic-tokens": "warn",
    },
  },
  // Special rules for test files - relax FSD rules for testing flexibility
  {
    files: [
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/test/**/*.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ],
    plugins: {
      "fsd-compliance": fsdCompliancePlugin,
    },
    rules: {
      // Allow arbitrary spacing in test files for viewport testing and component previews
      "fsd-compliance/no-arbitrary-spacing": "off",
      // Allow upward dependencies in test files - tests legitimately need to test features layer
      "fsd-compliance/no-upward-dependencies": "off",
      // Allow business logic in test components for testing purposes
      "fsd-compliance/no-business-logic-in-components": "off",
    },
  },
];

export default extendedConfig;
