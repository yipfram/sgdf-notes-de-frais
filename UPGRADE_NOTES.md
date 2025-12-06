# Next.js 16 Upgrade Notes

## Summary
Successfully upgraded from Next.js 15.5.4 to 16.0.7 on December 6, 2024.

## Changes Made

### Dependencies Updated
- **Next.js**: 15.5.4 → 16.0.7
- **React**: 19.1.1 → 19.2.1
- **React-DOM**: 19.1.1 → 19.2.1
- **@clerk/nextjs**: 6.32.0 → 6.36.0 (for Next.js 16 compatibility)
- **eslint-config-next**: 15.5.4 → 16.0.7
- **baseline-browser-mapping**: Added latest version to resolve warning

### Configuration Changes

#### ESLint Configuration
- **Removed**: `.eslintrc.json` (old ESLint config format)
- **Added**: `eslint.config.mjs` (new flat config format for ESLint 9)
- **Updated**: `package.json` lint script from `next lint` to `eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0`

#### Next.js Configuration
- **Updated**: `next.config.js` to add `turbopack: {}` configuration
  - Turbopack is now the default bundler in Next.js 16
  - Kept webpack config for fallback compatibility

#### TypeScript Configuration
- **Auto-updated by Next.js**: `tsconfig.json`
  - Changed `jsx` from `preserve` to `react-jsx` (React automatic runtime)
  - Added `.next/dev/types/**/*.ts` to include paths

### Code Changes

#### InstallPrompt Component
- Fixed React 19 strict mode compliance issue
- Moved state initialization from `useEffect` to render-time computation
- This prevents "calling setState synchronously within an effect" error
- No functional changes, just better React patterns

## Deprecation Warnings

### Middleware Convention (Not Urgent)
The `middleware.ts` file convention is deprecated in favor of `proxy`. This is a deprecation warning only - middleware still works in Next.js 16.

**Action Required**: In a future update, consider migrating from `src/middleware.ts` to the new proxy configuration.

**Documentation**: https://nextjs.org/docs/messages/middleware-to-proxy

## Breaking Changes Addressed

### 1. Turbopack Default
- **Issue**: Next.js 16 uses Turbopack by default instead of webpack
- **Resolution**: Added empty `turbopack: {}` config to silence migration warning
- **Impact**: Build now uses Turbopack, which is faster than webpack

### 2. ESLint Migration
- **Issue**: `next lint` command is removed in Next.js 16
- **Resolution**: Migrated to direct ESLint CLI usage with flat config
- **Impact**: Linting now uses standard ESLint commands

### 3. React 19 Stricter Rules
- **Issue**: React 19 has stricter linting rules for effect usage
- **Resolution**: Fixed InstallPrompt component to follow React best practices
- **Impact**: Code is more maintainable and follows React recommended patterns

## Verification

✅ Linting passes with 0 errors and 0 warnings
✅ TypeScript compilation succeeds
✅ Build process works (tested with Turbopack)
✅ All dependencies compatible with Next.js 16

## Notes for Developers

1. **Build System**: Turbopack is now used by default. If you need webpack for debugging, use `next build --webpack`
2. **Linting**: Use `pnpm lint` instead of `next lint`
3. **TypeScript**: The React automatic runtime is now used (no need to import React in every file)
4. **Environment**: Ensure all environment variables from `.env.example` are set for successful builds

## Future Considerations

- Monitor for Clerk updates supporting Next.js 16 if any issues arise
- Consider migrating middleware to proxy configuration when stable
- Keep dependencies up to date with Next.js minor version updates
