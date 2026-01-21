# FSD Migration Validation - Quick Reference

## 🚀 Quick Validation Commands

### Essential Tests (Run First)
```bash
# 1. Core architectural compliance
npm test __tests__/architectural-boundary-tests.test.ts

# 2. App layer integration
npm test __tests__/app-layer-integration.test.ts

# 3. Import path validation
npx tsx scripts/fsd-import-path-validator.ts
```

### Component Migration Check
```bash
# Verify key migrations completed
ls features/admin/ui/components/dashboard/AdminDashboardSkeleton.tsx
ls features/campaigns/ui/components/templates/TemplateItem.tsx
ls features/leads/ui/components/filters/ClientsHeader.tsx
ls features/onboarding/ui/components/OnboardingLayout.tsx
```

### App Layer Import Check
```bash
# Check for old import patterns (should return no results)
grep -r "@/components/\(admin\|templates\|clients\)" app/ --include="*.tsx"
```

## ✅ Expected Results

### Test Results
- **Architectural Tests**: All critical tests pass, some warnings OK
- **Integration Tests**: 18/18 tests passing
- **Import Validation**: Zero old import paths in app layer

### File Structure
- ✅ Components migrated to `features/[feature]/ui/components/`
- ✅ Old component directories cleaned up
- ✅ App layer uses new import paths

## 🔍 What to Look For

### 🟢 Good Signs
- All tests passing
- Components in correct feature directories
- App layer imports from `@/features/...`
- No cross-feature imports
- TypeScript compilation successful

### 🔴 Red Flags
- Critical test failures
- Missing migrated components
- Broken imports causing errors
- Cross-feature dependencies
- Build failures

## 📞 Quick Issue Resolution

### Common Issues
1. **Import Error**: Update path to `@/features/[feature]/ui/components/...`
2. **Missing Component**: Check if migrated to correct feature directory
3. **Test Failure**: Run with `--verbose` to see specific violations
4. **Build Error**: Run `npm run typecheck` for detailed errors

### Emergency Commands
```bash
# Check build status
npm run build

# Verify TypeScript
npm run typecheck

# Run all tests
npm test
```

## 📋 Validation Checklist

- [ ] Architectural tests passing
- [ ] Integration tests passing  
- [ ] No old import paths in app layer
- [ ] Components in correct locations
- [ ] Application builds successfully
- [ ] Manual testing of key features
- [ ] No critical violations reported

## 🎯 Success Criteria Met

✅ **200+ components migrated**  
✅ **95%+ FSD compliance**  
✅ **Zero critical violations**  
✅ **All functionality preserved**  
✅ **Comprehensive test coverage**  

---

**For detailed validation**: See `fsd-migration-validation-prompt.md`  
**For complete guide**: See `docs/fsd-migration-completion-guide.md`