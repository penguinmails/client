# FSD Validation Test File Exclusion

## Problem
The FSD (Feature-Sliced Design) validation script was flagging test files for architectural violations. Test files in `__tests__` directories were being flagged for importing from different layers (e.g., `@/app/[locale]/forgot-password/page`, `@/features/auth/hooks/use-auth`).

## Why This Was Incorrect
Test files legitimately need to import from various layers to properly test components:
- Tests for app layer pages need to import from `@/app/...`
- Tests for features need to import from `@/features/...`
- Tests for components need to import from `@/components/...`

This is expected behavior for testing and does not violate FSD architecture principles.

## Solution
Modified the FSD validation script (`scripts/fsd-import-path-validator.ts`) to exclude test files from validation:

### Changes Made:
1. Added `isTestFile()` function that detects test files using multiple patterns:
   - `*.test.tsx`
   - `*.test.ts`
   - `*.spec.tsx`
   - `*.spec.ts`
   - Files in `__tests__` directories
   - Files with `.test.` or `.spec.` in the name

2. Updated the file filtering logic in `main()` to exclude test files:
   ```typescript
   const targetFiles = allFiles.filter(file => 
     (file.includes('/app/') || 
      file.includes('/features/') || 
      file.includes('/components/') ||
      file.includes('/shared/')) &&
     !isTestFile(file)  // Exclude test files
   );
   ```

## Impact
- Test files are no longer validated for FSD import path violations
- Only actual source code files are now validated
- The FSD validation now focuses on architectural compliance of production code
- Test files can freely import from any layer for testing purposes

## Files Modified
- `scripts/fsd-import-path-validator.ts`

## Verification
After the changes, running `npm run fsd:validate` no longer flags test files like:
- `features/auth/ui/components/__tests__/ForgotPasswordPage.test.tsx`
- `features/auth/ui/components/__tests__/LoginPage.test.tsx`
- `features/auth/ui/components/__tests__/ResetPasswordPage.test.tsx`
- `features/auth/ui/components/__tests__/SignUpFormView.test.tsx`

The validation now correctly identifies legitimate architectural issues in production code while allowing test files the flexibility they need.
