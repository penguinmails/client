# UnifiedCard Component

The UnifiedCard component is a reusable card component that follows the design token system and provides consistent styling variants across the application.

## Features

- **Design Token Integration**: Uses the centralized design token system for consistent styling
- **Variant System**: Supports multiple visual variants (default, outlined, elevated, ghost)
- **Size Variants**: Provides three size options (sm, default, lg) with proper token-based spacing
- **Complete API**: Includes all necessary card sub-components (Header, Title, Description, Content, Footer, Action)
- **Accessibility**: Proper semantic structure and accessibility support
- **TypeScript**: Full TypeScript support with proper type definitions

## Variants

### Visual Variants
- `default`: Standard card with border and subtle shadow
- `outlined`: Card with emphasized border (border-2)
- `elevated`: Card with enhanced shadow for prominence
- `ghost`: Minimal card without border or shadow

### Size Variants
- `sm`: Compact card with reduced padding (gap-4 p-4)
- `default`: Standard card size (gap-6 py-6)
- `lg`: Spacious card with generous padding (gap-8 p-8)

## Usage

```tsx
import { 
  UnifiedCard, 
  UnifiedCardHeader, 
  UnifiedCardTitle, 
  UnifiedCardDescription,
  UnifiedCardContent,
  UnifiedCardFooter 
} from '@/components/unified/UnifiedCard';

// Basic usage
<UnifiedCard>
  <UnifiedCardHeader>
    <UnifiedCardTitle>Card Title</UnifiedCardTitle>
    <UnifiedCardDescription>Card description</UnifiedCardDescription>
  </UnifiedCardHeader>
  <UnifiedCardContent>
    Card content goes here
  </UnifiedCardContent>
</UnifiedCard>

// With variants and sizes
<UnifiedCard variant="elevated" size="lg">
  <UnifiedCardContent>
    Large elevated card
  </UnifiedCardContent>
</UnifiedCard>

// With actions
<UnifiedCard>
  <UnifiedCardHeader withAction>
    <UnifiedCardTitle>Title</UnifiedCardTitle>
    <UnifiedCardAction>
      <Button>Action</Button>
    </UnifiedCardAction>
  </UnifiedCardHeader>
</UnifiedCard>
```

## API Reference

### UnifiedCard Props
- `variant?: 'default' | 'outlined' | 'elevated' | 'ghost'` - Visual variant
- `size?: 'sm' | 'default' | 'lg'` - Size variant
- `className?: string` - Additional CSS classes
- All standard HTML div attributes

### UnifiedCardHeader Props
- `bordered?: boolean` - Add bottom border
- `withAction?: boolean` - Enable action layout
- `className?: string` - Additional CSS classes

### UnifiedCardTitle Props
- `size?: 'sm' | 'default' | 'lg'` - Title size
- `className?: string` - Additional CSS classes

## Design Token Compliance

The UnifiedCard component fully complies with the design token system:

- Uses `cardTokens` from `shared/config/design-tokens.ts`
- Implements variant system through `getCardVariants` function
- No hardcoded styles - all styling through design tokens
- Supports theme switching (light/dark mode)

## Testing

The component includes comprehensive tests covering:
- All variant combinations
- Size variations
- Complete component structure
- Custom className application
- Accessibility features

Run tests with:
```bash
npm test -- components/unified/__tests__/UnifiedCard.test.tsx
```

## Examples

See `components/unified/__tests__/UnifiedCard.example.tsx` for comprehensive usage examples including:
- All variant demonstrations
- Size comparisons
- Complex cards with actions
- Stats card patterns
- Real-world usage scenarios

## Requirements Compliance

This component satisfies the following FSD migration requirements:

- **Requirement 3.4**: Uses "Unified" prefix for standardized components
- **Requirement 3.2**: Located in components/ as reusable derived component
- **Requirement 3.5**: Contains no feature-specific business logic
- **Requirement 2.4**: Enforces token-based styling over hardcoded values
- **Requirement 2.5**: Supports variant-based styling through props mapping to token sets

The UnifiedCard component successfully extracts common card patterns from various feature components and provides a consistent, token-based card system for the entire application.