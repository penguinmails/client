# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build & Test Commands
- `npm run dev` - Next.js dev server with Turbopack enabled
- `npm run build` - Production build (ignores TypeScript/ESLint errors during build)
- `npm run typecheck` - Type checking for app code only
- `npm run typecheck:tests` - Type checking for test files only
- `npm run ts:ci` - Combined typecheck for CI
- `npm run test` - Jest test runner
- `npm run test:watch` - Jest in watch mode
- `npm run lint` - ESLint with caching

## Critical Architecture Patterns
- **Dual Authentication**: NileDB primary auth with legacy User mapping in `context/AuthContext.tsx`
- **Rate Limiting**: Client-side sessionStorage-based login rate limiting (`lib/auth/rate-limit.ts`)
- **Dual Logging**: `developmentLogger` (dev only) vs `productionLogger` (all environments) (`lib/utils/logger.ts`)
- **Server Actions**: All server actions use `NextRequest` context (`lib/actions/*.ts`)
- **Test Co-location**: Test files MUST be in `__tests__/` folders alongside source files

## Code Style Guidelines
- ESLint config ignores build artifacts, docs, scripts, database directories
- Prettier integration with ESLint
- TypeScript strict mode enabled with path mapping `@/*` → `./*`
- Console warnings allowed in development, errors logged in all environments
- React 19 with `"use client"` directive for client components

## Environment Configuration
- Multiple TypeScript configs: `tsconfig.json` (main), `tsconfig.app.json`, `tsconfig.test.json`
- Next.js config uses `withNextIntl` plugin for i18n
- Build ignores TypeScript and ESLint errors (`next.config.ts` lines 7-11)
- Environment variables include NileDB, Redis, Stripe, Loop email service