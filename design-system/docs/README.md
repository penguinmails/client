# 🎨 Design System Penguin Mails

A complete, scalable, and modern design system for the Penguin Mails application, built with TypeScript, Tailwind CSS, and React.

## 📋 Table of Contents

- Features
- Structure
- Installation
- Basic Usage
- Tokens
- Foundations
- Components
- Migration
- Contribution

## ✨ Features

- **🏗️ Modular Architecture**: Organized structure into tokens, foundations, primitives, components, and patterns
- **🎨 Design Tokens**: Full token system with support for light/dark themes
- **📱 Responsive**: Responsive configuration with customizable breakpoints
- **🔧 TypeScript**: Strong typing for safer development
- **🎯 Configurable**: Easy customization and extension
- **📚 Documented**: Complete documentation and examples
- **♿ Accessible**: Accessibility considerations included
- **🚀 Performance**: Optimized for performance

## 📁 Structure

```md
design-system/
├── tokens/                    # Design Tokens (single source of truth)
│   ├── colors.ts             # Complete color palette
│   ├── typography.ts         # Typography (families, sizes, weights)
│   ├── spacing.ts            # Spacing system
│   ├── shadows.ts            # Shadows and elevations
│   ├── borders.ts            # Radii and borders
│   ├── breakpoints.ts        # Responsive breakpoints
│   ├── animations.ts         # Animation configuration
│   ├── z-index.ts            # Depth layers (z-index)
│   └── index.ts              # Centralized export
│
├── foundations/              # System foundations
│   ├── theme.ts             # Theme configuration (light/dark)
│   ├── css-variables.ts     # CSS variables generator
│   └── index.ts
│
├── primitives/              # Base primitive components
│   ├── Box/                 # Basic container (implemented)
│   └── index.ts
│
├── components/              # Composite components (placeholder)
│   └── index.ts             # No components implemented yet
│
├── patterns/                # Composition patterns (placeholder)
│   └── index.ts             # No patterns implemented yet
│
├── hooks/                   # Design system hooks
│   └── index.ts             # Hooks infrastructure (no useTheme hook)
│
├── utils/                   # System utilities (placeholder)
│   └── index.ts             # No utilities implemented yet
│
└── docs/                    # Documentation
    ├── README.md           # This file
    ├── MIGRATION.md        # Migration guide
    └── (additional docs pending)
```

## 🚀 Installation

The design system is already integrated into the project. To use the available components:

```typescript
// Import tokens
import { colors, spacing, typography } from '@/design-system/tokens';

// Import theme management
import { useTheme } from '@/design-system/foundations';

// Import available primitives
import { Box } from '@/design-system/primitives';
// Note: Box is currently the only implemented primitive
```

## 💡 Basic Usage

### Tokens

```typescript
import { colors, getColor, spacing, fontSize } from '@/design-system/tokens';

// Use colors
const primaryColor = colors.primary.light; // 'oklch(0.623 0.214 259.815)'
const darkColor = getColor('primary', true); // With dark theme

// Use spacing
const padding = spacing.md; // '1rem'
const margin = spacingTokens.buttonPadding; // '0.5rem 1rem'
```

### Foundations

```typescript
import { initializeFoundations, setFoundationsTheme } from '@/design-system/foundations';

// Initialize system
initializeFoundations('light');

// Change theme
setFoundationsTheme('dark');
```

### Components

```typescript
import { Box, Container, Section } from '@/design-system';

function MyComponent() {
  return (
    <Container>
      <Section padding="lg" margin="md">
        <Box
          display="flex"
          justify="center"
          align="center"
          padding="md"
          backgroundColor="primary"
          color="primaryForeground"
          borderRadius="md"
        >
          Content styled with the design system
        </Box>
      </Section>
    </Container>
  );
}
```

## 🎨 Tokens

### Colors

The color system includes:

- **Semantic colors**: primary, secondary, success, warning, error
- **Text colors**: foreground, muted
- **Background colors**: background, card, popover
- **Interface colors**: border, input, ring, accent
- **Functional colors**: for tags, project-specific notifications

### Typography

Complete typographic system:

- **Families**: sans, serif, mono
- **Sizes**: from xs (12px) to 6xl (60px)
- **Weights**: from thin (100) to extrabold (800)
- **Line heights**: tight, snug, normal, relaxed, loose
- **Letter spacing**: from tighter to widest

### Spacing

Spacing scale based on 4px:

- **Base**: 0.25rem (4px)
- **Scale**: xs, sm, md, lg, xl, 2xl, 3xl, 4xl
- **Semantic**: buttonPadding, inputPadding, cardPadding
- **Responsive**: mobile, tablet, desktop

### Shadows

Layered shadow system:

- **Levels**: 2xs, xs, sm, md, lg, xl, 2xl
- **Themes**: floating, card, dropdown, modal, sidebar
- **States**: focus, focusRing, hover, active

### Borders

Complete border configuration:

- **Radii**: none, xs, sm, md, lg, xl, 2xl, 3xl, full
- **Widths**: none, xs, sm, md, lg, xl, 2xl
- **Components**: button, input, card, modal, dropdown

## 🏗️ Foundations

### Theme Manager

Centralized theme management:

```typescript
import { themeManager } from '@/design-system/foundations';

// Change theme
themeManager.setTheme('dark');

// Listen for changes
themeManager.addThemeChangeListener((theme) => {
  console.log('Theme changed to:', theme);
});

// Get current theme tokens
const tokens = themeManager.getThemeTokens();
```

### CSS Variables Generator

Automatic CSS variable generation:

```typescript
import { generateCustomPropertiesCSS } from '@/design-system/foundations';

const css = generateCustomPropertiesCSS('light');
// Generates full CSS variables for the light theme
```

## 🧩 Components

### Primitives

#### Box

Base container with full layout system:

```typescript
<Box
  display="flex"
  direction="row"
  justify="center"
  align="center"
  padding="md"
  margin="sm"
  gap="md"
  borderRadius="md"
  backgroundColor="primary"
  color="primaryForeground"
  className="hover:bg-primary/90 transition-colors"
>
  Content
</Box>
```

#### Container & Section

Predefined layout components:

```typescript
<Container>
  <Section padding="lg" margin="md">
    <Box>Sectioned content</Box>
  </Section>
</Container>
```

## 📱 Responsive

The system includes configurable breakpoints:

```typescript
// Default breakpoints
{
  sm: '640px',    // 40rem
  md: '768px',    // 48rem
  lg: '1024px',   // 64rem
  xl: '80rem',    // 1280px
  '2xl': '96rem'  // 1536px
}

// Usage in components
<Box
  sm={{ display: "block", padding: "0.5rem" }}
  md={{ display: "flex", padding: "1rem" }}
  lg={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}
>
```

## 🔧 Configuration

### Customize Tokens

```typescript
// Override specific tokens
import { colors, spacing } from '@/design-system/tokens';

const customColors = {
  ...colors,
  primary: {
    light: 'rgb(59, 130, 246)', // blue-500
    dark: 'rgb(37, 99, 235)',   // blue-600
    description: 'Custom blue'
  }
};
```

### Configure Breakpoints

```typescript
// Customize breakpoints
import { breakpoints } from '@/design-system/tokens';

const customBreakpoints = {
  ...breakpoints,
  sm: '480px',   // Small mobile
  md: '768px',   // Large mobile / Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Wide screen
};
```

## ♿ Accessibility

The design system includes accessibility considerations:

- **Color contrast**: All tokens meet WCAG 2.1 AA
- **Focus management**: Visible and consistent focus styles
- **Semantic HTML**: Components respect HTML semantics
- **Screen reader support**: Appropriate ARIA attributes
- **Keyboard navigation**: Optimized keyboard navigation

## 🚀 Performance

- **Tree shaking**: Modules optimized for tree shaking
- **Code splitting**: Selective component imports
- **CSS optimization**: CSS variables for better performance
- **TypeScript**: Strong typing for better DX
- **Caching**: Cache system for processed tokens

## 📦 Export Structure

```typescript
// Current available exports
export { colors, spacing, typography, shadows, borders, breakpoints, animations, zIndex } from './tokens';
export { themeManager, initializeFoundations, setFoundationsTheme, useTheme } from './foundations';
export { Box, Container, Section } from './primitives';

// Placeholder exports (components ready for implementation)
export { } from './components';  // No components yet
export { } from './patterns';     // No patterns yet
export { } from './hooks';        // Infrastructure only
export { } from './utils';        // No utilities yet
```

## 🎯 Conventions

### Naming

- **Component folders**: `PascalCase` (e.g., `Button/`)
- **Component files**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Config files**: `kebab-case.ts` (e.g., `css-variables.ts`)
- **Tokens**: `camelCase` with prefix (e.g., `colorPrimary`, `spacingMd`)

### TypeScript

- **Interfaces**: Suffix `Props` for component props
- **Types**: `PascalCase` (e.g., `ThemeTokens`, `ColorScale`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_SPACING`)

## 📚 Additional Documentation

- [Migration Guide](MIGRATION.md) - How to migrate existing code
- Additional documentation files pending implementation
- [Conventions](CONVENTIONS.md) - Code and style conventions
- [Examples](EXAMPLES.md) - Use cases and practical examples

## 🤝 Contribution

To contribute to the design system:

1. Review the [code conventions](CONVENTIONS.md)
2. Ensure components have complete TypeScript typings
3. Include documentation for new tokens or components
4. Test in both themes (light/dark) if relevant
5. Verify documentation is up to date

## 📄 License

This design system is part of the Penguin Mails project and is subject to the same license.
