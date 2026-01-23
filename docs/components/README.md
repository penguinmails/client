# Component Documentation

This directory contains documentation for reusable UI components and component systems used throughout the PenguinMails application.

## Organization

### Unified Components

The unified component system provides standardized, design-token-based components for consistent UI patterns:

- **[UnifiedButton](./unified-button.md)** - Comprehensive button component with variants, sizes, and icon support
- **[UnifiedCard](./unified-card.md)** - Reusable card component with design token integration
- **[UnifiedErrorBoundary](./unified-error-boundary.md)** - Standardized error handling and display
- **[UnifiedLoadingSpinner](./unified-loading-spinner.md)** - Consistent loading states across the application
- **[UnifiedModal](./unified-modal.md)** - Standardized modal/dialog interface
- **[UnifiedSkeleton](./unified-skeleton.md)** - Loading placeholders for different content types

### Component Systems

- **[System Health Components](./system-health.md)** - Health monitoring and retry functionality
- **[Design System Tokens](../architecture/semantic-tokens.md)** - Core design system tokens and patterns

## Usage Guidelines

### When to Use Unified Components

Use unified components when you need:

- Consistent styling across features
- Design token integration
- Standardized behavior patterns
- Accessibility compliance
- Maintainable component APIs

### Component Selection

- **UnifiedButton**: For all button interactions (actions, navigation, forms)
- **UnifiedCard**: For content containers and information display
- **UnifiedModal**: For dialogs, forms, and overlay content
- **UnifiedErrorBoundary**: For error handling in components and pages
- **UnifiedLoadingSpinner**: For loading states and async operations
- **UnifiedSkeleton**: For content placeholders during loading

### Migration Path

When migrating from basic UI components to unified components:

1. **Identify patterns**: Look for repeated styling or behavior
2. **Check variants**: Ensure the unified component supports your use case
3. **Update imports**: Replace basic component imports with unified versions
4. **Apply design tokens**: Remove hardcoded styles in favor of variant props
5. **Test accessibility**: Verify keyboard navigation and screen reader support

## Design Token Integration

All unified components use the design token system from `lib/config/design-tokens.ts`:

- **Colors**: Semantic color tokens for consistent theming
- **Spacing**: Standardized spacing and sizing tokens
- **Typography**: Consistent text sizing and styling
- **States**: Hover, focus, and interaction states
- **Animations**: Standardized transitions and effects

## Component Development

### Creating New Components

When creating new reusable components:

1. **Follow naming convention**: Use "Unified" prefix for standardized components
2. **Implement design tokens**: Use token-based styling over hardcoded values
3. **Support variants**: Provide size and visual variant options
4. **Include documentation**: Create comprehensive usage documentation
5. **Add tests**: Include unit tests for all variants and interactions
6. **Consider accessibility**: Implement proper ARIA attributes and keyboard support

### Component Structure

```
components/unified/
├── UnifiedComponent.tsx          # Component implementation
├── UnifiedComponent.md           # Usage documentation
└── __tests__/
    ├── UnifiedComponent.test.tsx # Unit tests
    ├── UnifiedComponent.example.tsx # Usage examples
    └── UnifiedComponent.stories.tsx # Storybook stories (if applicable)
```

## Related Documentation

- **[Architecture Overview](../architecture/README.md)** - System architecture and design decisions
- **[Design Tokens](../architecture/semantic-tokens.md)** - Design token system documentation
- **[Testing Guidelines](../testing/README.md)** - Component testing best practices
- **[Styling Guidelines](../guides/styling-guidelines.md)** - CSS and styling conventions

## Contributing

When contributing to component documentation:

1. **Keep examples practical**: Show real-world usage scenarios
2. **Document all props**: Include comprehensive API documentation
3. **Show migration paths**: Help developers transition from old patterns
4. **Include accessibility notes**: Document keyboard navigation and screen reader support
5. **Update related docs**: Ensure cross-references are maintained
