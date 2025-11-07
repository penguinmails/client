# Design System Guidelines

This document establishes the foundational design principles, patterns, and standards for the Penguin Mails design system.

## 🎨 Design Philosophy

### Core Principles

#### 1. Accessibility First

- All components meet WCAG 2.1 AA standards
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with proper ARIA attributes
- Sufficient color contrast ratios (4.5:1 minimum)
- Focus management and visual focus indicators

#### 2. Consistency

- Standardized component variants and sizes
- Consistent spacing using Tailwind's spacing scale
- Unified color palette and typography
- Predictable interaction patterns
- Reusable design tokens

#### 3. Flexibility

- Component composition patterns
- Extensible variant systems
- Theming support with CSS custom properties
- Responsive design across all breakpoints
- Customization without breaking accessibility

#### 4. Developer Experience

- TypeScript for type safety
- Clear prop interfaces
- Comprehensive documentation
- Easy testing and debugging
- Intuitive API design

## 🏗️ Component Architecture

### Design Patterns

#### Compound Components

```tsx
// Example: Card composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Controlled vs Uncontrolled

```tsx
// Controlled
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>...</DialogContent>
</Dialog>

// Uncontrolled
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>
```

#### Render Props

```tsx
// For maximum flexibility
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Component Hierarchy

#### Foundation Layer

- **Design Tokens**: Colors, spacing, typography, shadows
- **Utilities**: `cn()` function for class merging
- **Primitives**: Radix UI primitives with our styling

#### Core Components

- Basic interactive elements (Button, Input)
- Layout containers (Card, Dialog)
- Feedback components (Alert, Badge)
- Data display (Avatar, Table)

#### Composite Components

- Form components with validation
- Navigation components
- Data visualization components
- Complex interaction patterns

## 🎨 Visual Design

### Color System

#### Primary Colors

- **Primary**: Main brand color for CTAs and highlights
- **Primary-foreground**: Text on primary background
- **Secondary**: Muted brand variation
- **Secondary-foreground**: Text on secondary background

#### Semantic Colors

- **Destructive**: Error states and destructive actions
- **Success**: Success states and positive feedback
- **Warning**: Warning states and caution
- **Info**: Information states and neutral alerts

#### Neutral Colors

- **Background**: Main page background
- **Foreground**: Main text color
- **Muted**: Secondary text and UI elements
- **Border**: Input borders and dividers
- **Input**: Input field backgrounds

### Typography

#### Font Stack

- **Sans-serif**: System font stack for best performance
- **Monospace**: Code and data display

#### Type Scale

- **xs (0.75rem)**: Captions and metadata
- **sm (0.875rem)**: Secondary text
- **base (1rem)**: Body text
- **lg (1.125rem)**: Large body text
- **xl (1.25rem)**: Small headings
- **2xl (1.5rem)**: Medium headings
- **3xl (1.875rem)**: Large headings
- **4xl (2.25rem)**: Hero headings

#### Font Weights

- **400 (normal)**: Body text
- **500 (medium)**: Emphasis
- **600 (semibold)**: Headings
- **700 (bold)**: Strong emphasis

### Spacing

#### Spacing Scale

- **1 (0.25rem)**: Tight spacing
- **2 (0.5rem)**: Small gaps
- **3 (0.75rem)**: Medium gaps
- **4 (1rem)**: Standard spacing
- **6 (1.5rem)**: Large gaps
- **8 (2rem)**: Section spacing
- **12 (3rem)**: Major sections

#### Component Spacing

- **Form fields**: `space-y-2` between label and input
- **Form groups**: `space-y-4` between related fields
- **Card sections**: `space-y-6` between header/content/footer
- **Button groups**: `gap-2` between related buttons

### Borders & Shadows

#### Border Radius

- **sm (0.125rem)**: Subtle rounding
- **md (0.375rem)**: Standard components
- **lg (0.5rem)**: Cards and containers
- **xl (0.75rem)**: Large containers
- **full (9999px)**: Circular elements

#### Shadows

- **sm**: Subtle depth
- **md**: Standard elevation
- **lg**: Modal and dropdown elevation
- **xl**: Floating elements

## 📱 Responsive Design

### Breakpoints

- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Grid System

- **12-column grid** for layouts
- **Flexbox** for component alignment
- **CSS Grid** for complex layouts

### Mobile-First Approach

```tsx
// Start with mobile styles
<div className="space-y-4">
  <Button>Action</Button>
</div>

// Add responsive behavior
<div className="space-y-4 md:space-y-6 md:flex md:gap-4">
  <Button className="w-full md:w-auto">Action</Button>
</div>
```

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance

#### Perceivable

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Text Alternatives**: Alt text for images, labels for form inputs
- **Adaptable**: Content reflows without horizontal scrolling

#### Operable

- **Keyboard Accessible**: All functionality available via keyboard
- **No Seizures**: No content flashes more than 3 times per second
- **Navigable**: Clear focus indicators and logical tab order

#### Understandable

- **Readable**: Clear, simple language
- **Predictable**: Consistent navigation and interaction patterns
- **Input Assistance**: Clear error messages and validation

#### Robust

- **Compatible**: Works with assistive technologies
- **Valid Code**: Proper HTML markup and ARIA usage

### Testing Guidelines

#### Manual Testing

- Navigate with keyboard only
- Test with screen reader
- Check color contrast ratios
- Verify focus indicators

#### Automated Testing

- Use axe-core for accessibility testing
- Include accessibility tests in CI/CD
- Test component prop interfaces

## 🔧 Implementation Guidelines

### File Structure

```md
components/
├── ui/                    # Core UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── custom/                # Application-specific components
│   ├── auth/
│   ├── campaigns/
│   └── ...
└── shared/                # Shared utility components
```

### Naming Conventions

#### Components

- **PascalCase**: `CampaignDetailsForm`
- **Kebab-case files**: `campaign-details-form.tsx`

#### Props

- **camelCase**: `onValueChange`
- **Boolean props**: `isLoading`, `hasError`
- **Event handlers**: `onClick`, `onSubmit`

#### CSS Classes

- **Tailwind utilities**: Use design tokens
- **Custom classes**: `className` prop only

### Code Standards

#### TypeScript

```tsx
// Good: Clear prop interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

// Good: Proper typing for event handlers
const handleSubmit = (data: FormData) => {
  // Implementation
}
```

#### Component Structure

```tsx
// Good: Well-structured component
export function Component({ prop1, prop2, className, ...props }) {
  return (
    <Element
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </Element>
  )
}
```

## 📋 Quality Assurance

### Component Checklist

- [ ] TypeScript interfaces defined
- [ ] Default prop values set
- [ ] Accessibility attributes included
- [ ] Responsive design tested
- [ ] Dark mode compatibility
- [ ] Error states handled
- [ ] Loading states included
- [ ] Documentation complete

### Testing Requirements

- [ ] Unit tests for component logic
- [ ] Integration tests for component interactions
- [ ] Accessibility tests with axe-core
- [ ] Visual regression tests
- [ ] Performance tests for complex components

---

*This document should be updated whenever design system changes are made to maintain consistency and standards.*
