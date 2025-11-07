# Button Component

The Button component is a fundamental interactive element in our design system, built on Radix UI primitives with Tailwind CSS styling.

## 🎨 Variants

### Primary Button

- **Default**: Primary action button with brand colors
- **Secondary**: Secondary action with muted styling
- **Destructive**: For dangerous actions like delete/cancel
- **Outline**: Bordered button for less prominent actions
- **Ghost**: Minimal styling for subtle actions
- **Link**: Text-only button that looks like a link

### Sizes

- **Default**: Standard size (h-9 px-4 py-2)
- **Small**: Compact size (h-8 px-3)
- **Large**: Prominent size (h-10 px-6)
- **Icon**: Square button for icons only (size-9)

## 📋 Props Table

| Prop        | Type                                                                          | Default     | Description                          |
| ----------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| `variant`   | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"default"` | Visual style variant                 |
| `size`      | `"default" \| "sm" \| "lg" \| "icon"`                                         | `"default"` | Size of the button                   |
| `asChild`   | `boolean`                                                                     | `false`     | Render as child component using Slot |
| `className` | `string`                                                                      | `undefined` | Additional CSS classes               |
| `disabled`  | `boolean`                                                                     | `false`     | Disable button interaction           |
| `type`      | `string`                                                                      | `button`    | HTML button type attribute           |

## 💡 Usage Examples

### Basic Button

```tsx
import { Button } from '@/components/ui/button'

// Default button
<Button>Click me</Button>

// With different variants
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Delete Item</Button>
<Button variant="ghost">Ghost Button</Button>
```

### With Icons

```tsx
import { Button } from '@/components/ui/button'
import { Plus, Download, Settings } from 'lucide-react'

// Button with leading icon
<Button>
  <Plus className="size-4" />
  Add Item
</Button>

// Button with trailing icon
<Button variant="outline">
  Download
  <Download className="size-4" />
</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <Settings className="size-4" />
</Button>
```

### Form Integration

```tsx
// Submit button in a form
<form onSubmit={handleSubmit}>
  <input name="email" type="email" />
  <Button type="submit">Sign Up</Button>
</form>

// As a child component
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Size Variations

```tsx
// Small button for tight spaces
<Button size="sm">Small Action</Button>

// Large button for primary CTAs
<Button size="lg">Get Started</Button>

// Icon button for toolbars
<Button size="icon" variant="ghost">
  <MoreHorizontal className="size-4" />
</Button>
```

## ♿ Accessibility

- Includes proper focus-visible styling with ring indicators
- Supports `aria-invalid` states for form validation
- Maintains proper contrast ratios across all variants
- Keyboard navigation support built into Radix UI

## 🎯 Design Guidelines

- Use `default` variant for primary actions
- Use `outline` for secondary actions
- Use `destructive` only for destructive actions
- Icon-only buttons require `aria-label` for screen readers
- Maintain consistent spacing using the component's built-in padding
- Don't use `link` variant for actual navigation (use proper Link components)

## 🔗 Related Components

- [Badge](./badge.md) - For status indicators
- [Dialog](./dialog.md) - For modal actions
