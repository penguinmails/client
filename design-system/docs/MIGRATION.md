
# 📋 Overview

This guide provides instructions for migrating existing code to use the Design System Penguin Mails, as well as guidance for future module migration and expansion.

## 🚀 Getting Started

### Quick Start

```typescript
// Import the complete design system
import designSystem from './design-system';

// Initialize the design system with real initialization
const { foundationsManager } = designSystem.initDesignSystem('light');

// Import specific modules
import { colors, spacing, typography } from './design-system/tokens';
import { Box } from './design-system/primitives';
import { useTheme } from './design-system/foundations';
```

### Basic Usage Examples

#### Using Design Tokens

```typescript
import { colors, spacing, fontSize } from './design-system/tokens';

const buttonStyle = {
  backgroundColor: colors.primary.light,
  padding: spacing.md,
  fontSize: fontSize.base
};
```

#### Using Components

```typescript
import { Box } from './design-system/primitives';
import { Container, Section } from './design-system';

function MyComponent() {
  return (
    <Container>
      <Section padding="lg" margin="md">
        <Box display="flex" justify="center" padding="md">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded">
            Click me
          </button>
        </Box>
      </Section>
    </Container>
  );
}
```

#### Using Hooks

```typescript
import { useTheme } from './design-system/foundations';

function ThemeAwareComponent() {
  const { theme, setTheme, isDark } = useTheme();
  
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={`px-4 py-2 rounded ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

## 🔄 Migration Patterns

### From Custom CSS to Design System

#### Before (Custom CSS)

```css
.my-button {
  background-color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: white;
}

.my-button:hover {
  background-color: #2563eb;
}
```

#### After (Design System)

```typescript
import { Box } from './design-system/primitives';

function MyButton() {
  return (
    <Box
      display="inline-flex"
      align="center"
      justify="center"
      padding="sm"
      backgroundColor="blue-500"
      color="white"
      borderRadius="sm"
      className="hover:bg-blue-600 transition-colors"
    >
      Click me
    </Box>
  );
}
```

### From Inline Styles to Design Tokens

#### Before (Inline Styles)

```typescript
const containerStyle = {
  padding: '1rem',
  margin: '0.5rem',
  backgroundColor: '#f8fafc',
  color: '#1e293b'
};
```

#### After (Design Tokens)

```typescript
import { spacing, colors } from './design-system/tokens';

const containerStyle = {
  padding: spacing.md,
  margin: spacing.sm,
  backgroundColor: colors.background.light,
  color: colors.text.primary
};
```

### From Custom Components to Design System Components

#### Before (Custom Component)

```typescript
function CustomContainer({ children, className, style }) {
  return (
    <div
      className={`custom-container ${className || ''}`}
      style={{ padding: '1rem', margin: '0.5rem', ...style }}
    >
      {children}
    </div>
  );
}
```

#### After (Design System Component)

```typescript
import { Box } from './design-system/primitives';

function CustomContainer({ children, className, ...props }) {
  return (
    <Box
      padding="md"
      margin="sm"
      className={className}
      {...props}
    >
      {children}
    </Box>
  );
}
```

## 📦 Module Migration Strategy

### Phase 1: Core Tokens Migration

1. **Identify existing design tokens** in your current codebase
2. **Map to design system tokens**:
   - Colors → `tokens/colors.ts`
   - Typography → `tokens/typography.ts`
   - Spacing → `tokens/spacing.ts`
   - Breakpoints → `tokens/breakpoints.ts`
3. **Replace hardcoded values** with design system tokens
4. **Test responsive behavior** across all breakpoints

### Phase 2: Component Migration

1. **Audit existing components** for design consistency
2. **Identify reusable patterns** and map to design system:
   - Buttons → `components/Button/`
   - Cards → `components/Card/`
   - Forms → `patterns/forms/`
   - Layouts → `patterns/layouts/`
3. **Migrate one component family at a time**
4. **Update imports** throughout the codebase

### Phase 3: Foundation Migration

1. **Theme system migration**:
   - Light/Dark theme support
   - CSS variables generation
   - Theme switching functionality
2. **Hook integration**:
   - `useTheme` for theme management
   - Direct access to tokens via imports
   - Custom hook implementation for responsive behavior

### Phase 4: Advanced Features

1. **Pattern migration**:
   - Form patterns for consistent validation
   - Layout patterns for common arrangements
   - Navigation patterns for user flows
2. **Utility integration**:
   - Class name utilities
   - Responsive utilities
   - Animation utilities

## 🔧 Configuration Migration

### Theme Configuration

```typescript
// Before: Hardcoded theme
const theme = {
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff'
};

// After: Design system theme
import { initializeFoundations, setFoundationsTheme } from './design-system/foundations';

const { foundationsManager } = initializeFoundations('light');
setFoundationsTheme('dark');
```

### Responsive Configuration

```typescript
// Before: Custom breakpoints
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px'
};

// After: Design system breakpoints
import { breakpoints } from './design-system/tokens';
// Uses: sm, md, lg, xl, 2xl
```

## 🧪 Testing Migration

### Visual Regression Testing

```typescript
import { render } from '@testing-library/react';
import { Box } from './design-system/primitives';

test('Box component renders correctly', () => {
  const { container } = render(
    <Box padding="md" backgroundColor="blue-500">Content</Box>
  );
  
  expect(container.firstChild).toHaveClass('bg-blue-500', 'p-4');
});
```

### Token Validation

```typescript
import { colors, spacing } from './design-system/tokens';

test('Design tokens are valid', () => {
  expect(colors.primary.light).toBeDefined();
  expect(spacing.md).toBeDefined();
  expect(typeof colors.primary.light).toBe('string');
});
```

## 🚨 Common Migration Issues

### Issue 1: Naming Conflicts

**Problem**: Existing classes conflict with design system prefix `ds-`
**Solution**: Use unique naming or configure prefix in `utilsConfig`

### Issue 2: Missing Dependencies

**Problem**: Components depend on missing design tokens or wrong import paths
**Solution**:

```typescript
// Import from correct paths
import { colors, spacing, typography } from './design-system/tokens';
import { Box } from './design-system/primitives';
import { useTheme } from './design-system/foundations';
```

### Issue 3: TypeScript Errors

**Problem**: Missing type definitions after migration

**Solution**:

```typescript
// Import types explicitly
import { type BoxProps } from './design-system/primitives/Box';
```

### Issue 4: Performance Issues

**Problem**: Large bundle size after importing entire design system

**Solution**:

```typescript
// Import specific modules only
import { Box } from './design-system/primitives';
import { spacing } from './design-system/tokens';

// Use tree shaking (only what's available)
import { Box, Container, Section } from './design-system';
```

## 📋 Migration Checklist

### Pre-Migration

- [ ] Audit existing design tokens
- [ ] Identify reusable components
- [ ] Document current theme implementation
- [ ] Set up testing framework
- [ ] Create migration branch

### During Migration

- [ ] Migrate tokens first
- [ ] Test token usage
- [ ] Migrate components incrementally
- [ ] Update imports throughout codebase
- [ ] Test component functionality
- [ ] Verify responsive behavior
- [ ] Update documentation

### Post-Migration

- [ ] Remove old custom styles
- [ ] Update build configuration
- [ ] Run full test suite
- [ ] Update component documentation
- [ ] Train team on new system
- [ ] Monitor for issues

## 🔄 Future Module Migration

### Adding New Components

1. **Create component structure**:

   ```md
   components/NewComponent/
   ├── NewComponent.tsx
   ├── NewComponent.styles.ts
   ├── NewComponent.test.tsx
   └── index.ts
   ```

2. **Add to component index**:

   ```typescript
   // components/index.ts
   export { default as NewComponent } from './NewComponent/NewComponent';
   ```

3. **Update main design system export**:

   ```typescript
   // design-system/index.ts
   export { NewComponent } from './components/NewComponent';
   ```

### Adding New Tokens

1. **Create token file**:

   ```md
   tokens/newTokenCategory.ts
   ```

2. **Export from tokens index**:

   ```typescript
   // tokens/index.ts
   export * from './newTokenCategory';
   ```

3. **Update documentation**:
   - Add to `TOKENS.md`
   - Update examples
   - Document usage patterns

### Adding New Patterns

1. **Create pattern structure**:

   ```md
   patterns/newPattern/
   ├── newPattern.tsx
   ├── newPattern.hooks.ts
   ├── newPattern.utils.ts
   └── index.ts
   ```

2. **Export from patterns index**:

   ```typescript
   // patterns/index.ts
   export * from './newPattern';
   ```

## 📚 Additional Resources

- [Design Tokens Guide](TOKENS.md)
- [Components Guide](COMPONENTS.md)
- [Code Conventions](CONVENTIONS.md)
- [Usage Examples](EXAMPLES.md)

---

**Need Help?** Refer to the main [README.md](README.md) or contact the design system maintainers.
