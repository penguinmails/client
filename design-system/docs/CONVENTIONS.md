# 📋 Overview

This document defines the coding conventions, naming standards, and best practices for the Design System Penguin Mails project.

## 📁 File and Folder Naming

### Folders

- **Component folders**: `PascalCase` (e.g., `Button/`, `Card/`, `InputField/`)
- **Configuration folders**: `kebab-case` (e.g., `css-variables.ts`)
- **Documentation files**: `kebab-case.md` (e.g., `migration-guide.md`)

### Files

- **Component files**: `PascalCase.tsx` (e.g., `Button.tsx`, `Card.tsx`)
- **Type files**: `PascalCase.ts` (e.g., `ThemeTokens.ts`, `ColorScale.ts`)
- **Configuration files**: `kebab-case.ts` (e.g., `css-variables.ts`, `theme-config.ts`)
- **Utility files**: `kebab-case.ts` (e.g., `class-names.ts`, `responsive-helpers.ts`)
- **Documentation files**: `kebab-case.md` (e.g., `conventions.md`, `getting-started.md`)

## 🎨 Naming Conventions

### Design Tokens

- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_SPACING`, `BASE_FONT_SIZE`)
- **Token objects**: `camelCase` with descriptive names (e.g., `colorPrimary`, `spacingMedium`)
- **Token categories**: `camelCase` (e.g., `colors`, `typography`, `spacing`)

### CSS Classes

- **Design System prefix**: `ds-` (e.g., `ds-button`, `ds-card`)
- **Component variants**: `ds-[component]--[variant]` (e.g., `ds-button--primary`)
- **Component states**: `ds-[component]--[state]` (e.g., `ds-button--disabled`)
- **Responsive classes**: `[breakpoint]:[class]` (e.g., `sm:ds-button`, `lg:ds-card`)

### CSS Custom Properties

- **Variables**: `--ds-[category]-[name]` (e.g., `--ds-color-primary`, `--ds-spacing-md`)
- **Theme variants**: `--ds-[category]-[name]-[theme]` (e.g., `--ds-color-primary-light`)

## 🏗️ Code Structure

### TypeScript

#### Interfaces and Types

```typescript
// Component props interfaces
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
}

// Type definitions
type ThemeMode = "light" | "dark";
type SpacingScale = "xs" | "sm" | "md" | "lg" | "xl";
type ColorPalette = Record<string, ColorScale>;

// Utility types
export type DesignSystemConfig = {
  theme: ThemeMode;
  tokens: DesignTokens;
  components: ComponentConfig;
};
```

#### Exports

```typescript
// Named exports for individual items
export { colors, spacing, typography };
export { Button, Card, Input };

// Default exports for modules
export default DesignSystem;

// Re-exports
export * from "./tokens";
export { designTokens } from "./foundations";
```

### React Components

#### Functional Components

```typescript
import React from 'react';
import { Box, type BoxProps } from '../primitives/Box';
import { getComponentsConfig } from '../components';
import { cn } from '../utils';

interface ButtonProps extends BoxProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <Box
      as="button"
      className={cn(
        'ds-button',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        className
      )}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Button;
```

#### Component Organization

```md
Button/
├── Button.tsx # Main component
├── Button.styles.ts # Styles (if separated)
├── Button.test.tsx # Tests
├── Button.stories.tsx # Storybook stories
└── index.ts # Component exports
```

## 📱 Responsive Design

### Breakpoints

- **Base**: Default styles (no prefix)
- **sm**: `640px` and up
- **md**: `768px` and up
- **lg**: `1024px` and up
- **xl**: `1280px` and up
- **2xl**: `1536px` and up

### Implementation

```typescript
// CSS approach
.component {
  /* Base styles */
  display: block;

  /* Responsive styles */
  @media (min-width: 768px) {
    .md\:component {
      display: flex;
    }
  }
}

// TypeScript approach
const responsiveProps = {
  base: { display: 'block' },
  sm: { display: 'block' },
  md: { display: 'flex' },
  lg: { display: 'grid' }
};
```

## 🎨 Theming

### Theme Structure

```typescript
const lightTheme = {
  colors: {
    primary: {
      50: "#eff6ff",
      500: "#3b82f6",
      900: "#1e3a8a",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
  },
};

const darkTheme = {
  // Override specific values
  colors: {
    primary: {
      // Dark theme values
    },
  },
};
```

### CSS Variables Generation

```typescript
// Generate CSS custom properties
const generateCSSVariables = (theme: ThemeTokens): string => {
  return Object.entries(theme.colors)
    .map(([category, values]) => {
      return Object.entries(values)
        .map(([shade, value]) => {
          return `--ds-color-${category}-${shade}: ${value};`;
        })
        .join("\n");
    })
    .join("\n");
};
```

## 🧪 Testing

### Test Structure

```typescript
// Component tests
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('ds-button--primary');
  });
});

// Token tests
import { colors, spacing } from '../tokens';

describe('Design Tokens', () => {
  it('has valid color values', () => {
    expect(colors.primary.light).toMatch(/^oklch\(/);
  });
});
```

## 📚 Documentation

### JSDoc Comments

```typescript
/**
 * Button component for triggering actions
 *
 * @param variant - Visual style variant
 * @param size - Size of the button
 * @param disabled - Whether the button is disabled
 * @param children - Button content
 * @returns JSX button element
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  ...props
}) => {
  // Implementation
};
```

### README Structure

````markdown
# Component Name

## Description

Brief description of the component.

## Props

| Name    | Type   | Default   | Description    |
| ------- | ------ | --------- | -------------- |
| variant | string | 'default' | Visual variant |

## Examples

```typescript
<Component variant="primary">
  Content
</Component>
```
````

## Tokens Used

- `--ds-color-primary`
- `--ds-spacing-md`

## 🚀 Performance

### Code Splitting

```typescript
// Lazy import components
const Button = lazy(() => import("./Button"));
const Card = lazy(() => import("./Card"));

// Tree shaking friendly exports
export { Button } from "./Button";
export { Card } from "./Card";
```

### Optimization

- Use `React.memo` for expensive components
- Implement proper key props for lists
- Use `useMemo` and `useCallback` appropriately
- Optimize CSS with proper classname merging

## ♿ Accessibility

### Requirements

- All interactive elements must be keyboard accessible
- Proper ARIA attributes for complex components
- Focus management for modals and dropdowns
- Color contrast ratios meeting WCAG 2.1 AA

### Implementation

```typescript
// Accessible button
<Button
  aria-label="Close modal"
  aria-describedby="modal-description"
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }}
>
  ×
</Button>
```

## 🔄 Migration

### Version Updates

- Maintain backward compatibility when possible
- Provide migration guides for breaking changes
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Document deprecated features

### Deprecation Process

1. Mark feature as deprecated in documentation
2. Add deprecation warnings in development
3. Provide timeline for removal
4. Update migration guide

## 📝 Git Guidelines

### Commit Messages

```md
type(scope): description

feat(tokens): add new color scale for brand colors
fix(components): resolve Button variant prop type
docs(conventions): update naming guidelines
```

### Branch Naming

- `feature/design-token-system`
- `fix/button-accessibility`
- `docs/component-guidelines`
- `chore/dependency-updates`

## 🛠️ Development Tools

### ESLint Rules

- Use TypeScript ESLint
- Enforce consistent naming
- Disallow any types except where absolutely necessary
- Require proper JSDoc comments

### Prettier Configuration

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas where valid

### Git Hooks

- Pre-commit: Run linting and tests
- Pre-push: Run full test suite
- Commit message validation
