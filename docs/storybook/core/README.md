# Core UI Components

This directory contains documentation for the core UI components that form the foundation of our design system. These components are built on Radix UI primitives and styled with Tailwind CSS.

## 📚 Component Index

### Interactive Components

- **[Button](./button.md)** - Primary interactive element for actions and submissions
- **[Input](./input.md)** - Text input fields with validation and accessibility support

### Layout & Structure

- **[Card](./card.md)** - Flexible container for grouping related content
- **[Dialog](./dialog.md)** - Accessible modal dialogs and overlays

### Feedback & Status

- **[Alert](./alert.md)** - Contextual feedback messages and notifications
- **[Badge](./badge.md)** - Small indicators for status, categories, and metadata

### Data Display

- **[Avatar](./avatar.md)** - User profile images with fallback support

---

## 🏗️ Component Architecture

All core components are built following these principles:

### Design System Foundation

- **Radix UI Primitives**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first styling approach
- **Class Variance Authority (CVA)**: Type-safe variant management
- **TypeScript**: Full type safety and IntelliSense

### Accessibility Standards

- **WCAG 2.1 AA Compliance**: All components meet accessibility guidelines
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators and management

### Consistent Patterns

- **Prop Interfaces**: Standardized prop naming and types
- **Variant System**: Consistent visual variants across components
- **Size System**: Standardized sizing options
- **Class Name Merging**: Using `cn()` utility for class composition

## 🎨 Design Tokens

Components use these design tokens from our theme:

### Colors

- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `muted` - Muted/background colors
- `accent` - Accent color for highlights
- `destructive` - Error and destructive action color

### Spacing

- Consistent padding and margins using Tailwind spacing scale
- Component-specific spacing built into the design

### Typography

- Consistent font sizes and weights
- Proper line height for readability

---

## 🔧 Usage Guidelines

### Import Pattern

```tsx
import { Button } from '@/components/ui/button'
```

### Best Practices

- Always pair inputs with labels for accessibility
- Use appropriate variants for the context
- Follow the established size conventions
- Maintain sufficient color contrast
- Test with keyboard navigation

### Component Composition

Components are designed to work together:

- Cards contain other components
- Buttons trigger dialogs and forms
- Badges provide status indicators
- Alerts provide contextual feedback

---

*This documentation is maintained alongside the component source code and should be updated when components are modified.*
