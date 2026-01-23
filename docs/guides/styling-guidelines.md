# Styling Guidelines

## Overview

This document defines the preferred styling patterns and standards for our React components using Tailwind CSS. Following these guidelines ensures consistency, maintainability, and accessibility across our design system.

## Core Principles

### 1. Semantic Over Specific
Use semantic tokens and class names that describe **what** something is, not **how** it looks.

```tsx
// ✅ Good - Semantic
<Button className="bg-primary text-primary-foreground">
  Save
</Button>

// ❌ Bad - Specific  
<Button className="bg-blue-600 text-white">
  Save
</Button>
```

### 2. Design Tokens First
Always prefer design system tokens over hardcoded values.

```tsx
// ✅ Good - Using design tokens
<div className="bg-background text-foreground border-border">

// ❌ Bad - Hardcoded values
<div className="bg-white text-gray-900 border-gray-200">
```

### 3. Consistent Spacing
Use the standard Tailwind spacing scale instead of arbitrary values.

```tsx
// ✅ Good - Standard spacing
<div className="p-4 m-6 gap-3">

// ❌ Bad - Arbitrary values
<div className="p-[16px] m-[24px] gap-[12px]">
```

## Color System

### Semantic Color Tokens

We use semantic color tokens that automatically adapt to light/dark mode:

| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `bg-background` | Main background | White | Gray-900 |
| `text-foreground` | Primary text | Gray-900 | Gray-100 |
| `bg-muted` | Subtle backgrounds | Gray-100 | Gray-800 |
| `text-muted-foreground` | Secondary text | Gray-600 | Gray-400 |
| `bg-border` | Border colors | Gray-200 | Gray-700 |
| `bg-primary` | Primary actions | Blue-600 | Blue-500 |
| `text-primary` | Primary text | Blue-600 | Blue-400 |
| `bg-destructive` | Error/destructive | Red-600 | Red-500 |
| `text-destructive` | Error text | Red-600 | Red-400 |

### Color Usage Examples

```tsx
// ✅ Cards and containers
<Card className="bg-background border-border">
  <CardHeader className="bg-muted">
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
</Card>

// ✅ Interactive elements
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>

<Button variant="destructive" className="bg-destructive text-destructive-foreground">
  Delete
</Button>

// ✅ Text hierarchy
<h1 className="text-foreground">Heading</h1>
<p className="text-muted-foreground">Supporting text</p>
```

### What to Avoid

```tsx
// ❌ Never use raw hex colors
className="bg-#3b82f6"

// ❌ Avoid specific color names
className="bg-blue-500 text-white"

// ❌ Don't hardcode dark mode colors
className="bg-white dark:bg-gray-900"
```

## Spacing System

### Standard Spacing Scale

Use Tailwind's standard spacing scale:

| Value | Class | Pixels | Usage |
|-------|-------|--------|-------|
| `1` | `p-1`, `m-1`, `gap-1` | 4px | Tight spacing |
| `2` | `p-2`, `m-2`, `gap-2` | 8px | Small spacing |
| `3` | `p-3`, `m-3`, `gap-3` | 12px | Medium-small |
| `4` | `p-4`, `m-4`, `gap-4` | 16px | **Default spacing** |
| `6` | `p-6`, `m-6`, `gap-6` | 24px | Large spacing |
| `8` | `p-8`, `m-8`, `gap-8` | 32px | Extra large |

### Spacing Patterns

```tsx
// ✅ Standard component spacing
<Card className="p-6 gap-4">
  <CardHeader className="pb-4">
    <CardTitle>Title</CardTitle>
  </CardHeader>
</Card>

// ✅ Grid and flexbox gaps
<div className="grid grid-cols-2 gap-4">
<div className="flex gap-3">

// ✅ Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

### What to Avoid

```tsx
// ❌ Arbitrary pixel values
className="p-[16px] m-[24px] gap-[12px]"

// ❌ Inconsistent spacing
className="p-3 mx-5 my-2 gap-4"

// ❌ Using rem/em without scale
className="p-[1rem] m-[1.5rem]"
```

## Typography System

### Font Size Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Captions, labels |
| `text-sm` | 14px | Secondary text |
| `text-base` | 16px | **Body text** |
| `text-lg` | 18px | Large body |
| `text-xl` | 20px | Small headings |
| `text-2xl` | 24px | Medium headings |
| `text-3xl` | 30px | Large headings |

### Typography Examples

```tsx
// ✅ Text hierarchy
<h1 className="text-3xl font-bold text-foreground">Page Title</h1>
<h2 className="text-xl font-semibold text-foreground">Section Title</h2>
<p className="text-base text-muted-foreground">Body text content</p>
<p className="text-sm text-muted-foreground">Caption text</p>

// ✅ Interactive text
<Link className="text-primary hover:text-primary/80 underline">
  Click here
</Link>
```

### What to Avoid

```tsx
// ❌ Arbitrary font sizes
className="text-[16px] text-[18px] text-[24px]"

// ❌ Hardcoded line heights
className="leading-[1.5] tracking-[0.5px]"

// ❌ Using specific font families
className="font-['Inter']"
```

## Layout Patterns

### Flexbox Patterns

```tsx
// ✅ Centering content
<div className="flex items-center justify-center min-h-screen">

// ✅ Space between elements
<div className="flex items-center justify-between">

// ✅ Column layout with gaps
<div className="flex flex-col gap-4">

// ✅ Responsive flex
<div className="flex flex-col md:flex-row gap-6">
```

### Grid Patterns

```tsx
// ✅ Standard grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ✅ Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">

// ✅ Aspect ratio
<div className="aspect-video bg-muted">
```

### What to Avoid

```tsx
// ❌ Custom flex combinations
className="flex items-center justify-center" // This is actually fine!
className="flex justify-start items-center"  // Less common pattern

// ❌ Hardcoded dimensions
className="w-[350px] h-[200px]"

// ❌ Complex calculations
className="w-[calc(100%-2rem)]"
```

## Component Composition

### Button Patterns

```tsx
// ✅ Primary button
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Save
</Button>

// ✅ Secondary button
<Button variant="secondary" className="bg-secondary text-secondary-foreground">
  Cancel
</Button>

// ✅ Icon button
<Button variant="ghost" size="icon" className="h-10 w-10">
  <X className="h-4 w-4" />
</Button>
```

### Card Patterns

```tsx
// ✅ Standard card
<Card className="bg-background border-border">
  <CardHeader className="pb-4">
    <CardTitle className="text-foreground">Card Title</CardTitle>
    <CardDescription className="text-muted-foreground">
      Card description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Form Patterns

```tsx
// ✅ Form field
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    className="bg-background border-border"
  />
</div>

// ✅ Form actions
<div className="flex justify-end gap-3 pt-4">
  <Button variant="outline">Cancel</Button>
  <Button>Save</Button>
</div>
```

## Responsive Design

### Breakpoint Usage

```tsx
// ✅ Mobile-first responsive
<div className="
  p-4           // Mobile: padding
  md:p-6        // Tablet: larger padding
  lg:p-8        // Desktop: largest padding
  gap-4         // Consistent gap across breakpoints
  md:gap-6      // Larger gap on tablet+
  lg:grid-cols-3 // 3 columns on desktop
">
```

### Responsive Patterns

```tsx
// ✅ Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">

// ✅ Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// ✅ Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

## Accessibility Considerations

### Color Contrast

Always ensure sufficient color contrast when using semantic tokens:

```tsx
// ✅ Good contrast ratios
<Button className="bg-primary text-primary-foreground">  // High contrast
<Button variant="outline" className="border-border">       // Good contrast

// ⚠️ Check contrast for custom combinations
<div className="bg-muted text-muted-foreground">  // May need testing
```

### Focus States

```tsx
// ✅ Proper focus handling
<Button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</Button>

<Input className="focus:border-primary focus:ring-1 focus:ring-primary" />
```

## Common Patterns to Avoid

### 1. Arbitrary Values
```tsx
// ❌ Avoid
className="w-[350px] h-[200px] p-[24px] m-[16px] gap-[12px]"

// ✅ Use instead
className="w-80 h-48 p-6 m-4 gap-3"
```

### 2. Hardcoded Colors
```tsx
// ❌ Avoid
className="bg-blue-500 text-white border-gray-300"

// ✅ Use instead  
className="bg-primary text-primary-foreground border-border"
```

### 3. Inconsistent Spacing
```tsx
// ❌ Avoid
className="p-3 mx-5 my-2 gap-4"

// ✅ Use consistent scale
className="p-3 mx-4 my-2 gap-3"
```

### 4. Complex Calculations
```tsx
// ❌ Avoid
className="w-[calc(100vw-2rem)] h-[calc(100vh-4rem)]"

// ✅ Use simpler approach
className="w-full h-screen p-4"
```

## Migration Guide

When refactoring existing components:

1. **Start with colors** - Replace hardcoded colors with semantic tokens
2. **Update spacing** - Convert arbitrary values to standard scale
3. **Fix typography** - Use the typography scale
4. **Test responsiveness** - Ensure mobile-first patterns work
5. **Check accessibility** - Verify contrast and focus states

## Tools and Validation

### ESLint Rules
We should implement linting rules to catch:
- Arbitrary values (`w-[...px]`, `p-[...px]`)
- Hardcoded colors (`#[0-9a-fA-F]{3,8}`)
- Missing semantic tokens

### Manual Checklist
- [ ] Using semantic color tokens
- [ ] Standard spacing scale
- [ ] Typography scale
- [ ] Mobile-first responsive design
- [ ] Proper focus states
- [ ] Sufficient color contrast

## Conclusion

These guidelines ensure our design system is:
- **Consistent** - Same patterns across all components
- **Maintainable** - Easy to update globally
- **Accessible** - Proper contrast and focus states
- **Scalable** - Works across all screen sizes
- **Future-proof** - Easy to theme and customize

For questions or suggestions about these guidelines, please open an issue or discuss with the design system team.