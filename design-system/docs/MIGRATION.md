
# 📋 Overview

This guide provides instructions for migrating existing code to use the Design System Penguin Mails, as well as guidance for future module migration and expansion.

## 🚀 Getting Started

### Quick Start

```typescript
// Import the complete design system
import designSystem from './design-system';

// Initialize the design system
designSystem.initDesignSystem('light');

// Import specific modules
import { colors, spacing, typography } from './design-system/tokens';
import { Box, Button } from './design-system/primitives';
import { useTheme } from './design-system/hooks';
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
import { Box, Button, Card } from './design-system';

function MyComponent() {
  return (
    <Card>
      <Box padding="lg" margin="md">
        <Button variant="primary" size="md">
          Click me
        </Button>
      </Box>
    </Card>
  );
}
```

#### Using Hooks

```typescript
import { useTheme, useToken } from './design-system/hooks';

function ThemeAwareComponent() {
  const { theme, setTheme } = useTheme();
  const primaryColor = useToken('colors', 'primary', theme);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
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
import { Box, Button } from './design-system';

function MyButton() {
  return (
    <Button
      variant="primary"
      size="md"
      className="my-button"
    >
      Click me
    </Button>
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
function CustomInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="custom-input"
    />
  );
}
```

#### After (Design System Component)

```typescript
import { Input } from './design-system';

function CustomInput(props) {
  return (
    <Input
      variant="default"
      size="md"
      className="custom-input"
      {...props}
    />
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
   - `useToken` for token access
   - `useBreakpoint` for responsive behavior

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

initializeFoundations('light');
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
import { Box, Button } from './design-system';

test('Button renders correctly', () => {
  const { container } = render(
    <Button variant="primary">Click me</Button>
  );
  
  expect(container.firstChild).toHaveClass('ds-button', 'ds-button--primary');
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

**Problem**: Components depend on missing design tokens
**Solution**:

```typescript
// Ensure all required tokens are imported
import { 
  colors, 
  spacing, 
  typography, 
  shadows, 
  borders 
} from './design-system/tokens';
```

### Issue 3: TypeScript Errors

**Problem**: Missing type definitions after migration

**Solution**:

```typescript
// Import types explicitly
import { type BoxProps } from './design-system/primitives/Box';
import { type ButtonProps } from './design-system/components/Button';
```

### Issue 4: Performance Issues

**Problem**: Large bundle size after importing entire design system

**Solution**:

```typescript
// Import specific modules only
import { Button } from './design-system/components';
import { spacing } from './design-system/tokens';

// Use tree shaking
import { Button, Card, Input } from './design-system/components';
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
