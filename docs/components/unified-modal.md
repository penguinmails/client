# UnifiedModal Component

The `UnifiedModal` component provides a standardized modal/dialog interface using design tokens for consistent styling across the application. It's built on top of Radix UI Dialog primitives and integrates with the FSD design token system.

## Features

- **Design Token Integration**: All styling uses the centralized design token system
- **Multiple Size Variants**: sm, default, lg, xl, and full-screen options
- **Flexible Layout**: Modular components for header, body, and footer
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Customizable**: Optional close button, bordered sections, and custom styling
- **Responsive**: Automatic responsive behavior across screen sizes

## Basic Usage

```tsx
import {
  UnifiedModal,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalBody,
  UnifiedModalFooter,
  UnifiedModalTrigger,
  UnifiedModalClose,
} from '@/components/unified/UnifiedModal';
import { Button } from '@/components/ui/button/button';

function BasicModal() {
  return (
    <UnifiedModal>
      <UnifiedModalTrigger asChild>
        <Button>Open Modal</Button>
      </UnifiedModalTrigger>
      <UnifiedModalContent>
        <UnifiedModalHeader>
          <UnifiedModalTitle>Modal Title</UnifiedModalTitle>
          <UnifiedModalDescription>
            Optional description text
          </UnifiedModalDescription>
        </UnifiedModalHeader>
        <UnifiedModalBody>
          <p>Modal content goes here</p>
        </UnifiedModalBody>
        <UnifiedModalFooter>
          <UnifiedModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </UnifiedModalClose>
          <Button>Confirm</Button>
        </UnifiedModalFooter>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}
```

## Size Variants

The modal supports five size variants using design tokens:

```tsx
// Small modal (max-w-sm)
<UnifiedModalContent size="sm">

// Default modal (max-w-lg) - default
<UnifiedModalContent size="default">

// Large modal (max-w-2xl)
<UnifiedModalContent size="lg">

// Extra large modal (max-w-4xl)
<UnifiedModalContent size="xl">

// Full screen modal (95vw x 95vh)
<UnifiedModalContent size="full">
```

## Component API

### UnifiedModal

Root modal component. Accepts all props from Radix UI Dialog.Root.

```tsx
interface UnifiedModalProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  size?: ModalSize;
}
```

### UnifiedModalContent

Main modal content container with size variants.

```tsx
interface UnifiedModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  showClose?: boolean; // Show/hide close button (default: true)
  className?: string;
}
```

### UnifiedModalHeader

Header section with optional border.

```tsx
interface UnifiedModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean; // Add bottom border (default: false)
}
```

### UnifiedModalFooter

Footer section with optional border.

```tsx
interface UnifiedModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean; // Add top border (default: false)
}
```

## Advanced Examples

### Controlled Modal

```tsx
function ControlledModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UnifiedModal open={isOpen} onOpenChange={setIsOpen}>
      <UnifiedModalTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          Open Controlled Modal
        </Button>
      </UnifiedModalTrigger>
      <UnifiedModalContent size="lg">
        <UnifiedModalHeader bordered>
          <UnifiedModalTitle>Controlled Modal</UnifiedModalTitle>
        </UnifiedModalHeader>
        <UnifiedModalBody>
          <p>This modal's state is controlled externally.</p>
        </UnifiedModalBody>
        <UnifiedModalFooter bordered>
          <Button onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </UnifiedModalFooter>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}
```

### Form Modal

```tsx
function FormModal() {
  return (
    <UnifiedModal>
      <UnifiedModalTrigger asChild>
        <Button>Create Item</Button>
      </UnifiedModalTrigger>
      <UnifiedModalContent size="lg">
        <UnifiedModalHeader bordered>
          <UnifiedModalTitle>Create New Item</UnifiedModalTitle>
          <UnifiedModalDescription>
            Fill out the form below to create a new item.
          </UnifiedModalDescription>
        </UnifiedModalHeader>
        <UnifiedModalBody>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter name" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter description" />
            </div>
          </form>
        </UnifiedModalBody>
        <UnifiedModalFooter bordered>
          <UnifiedModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </UnifiedModalClose>
          <Button type="submit">Create</Button>
        </UnifiedModalFooter>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}
```

### Confirmation Modal

```tsx
function ConfirmationModal() {
  return (
    <UnifiedModal>
      <UnifiedModalTrigger asChild>
        <Button variant="destructive">Delete Item</Button>
      </UnifiedModalTrigger>
      <UnifiedModalContent size="sm" showClose={false}>
        <UnifiedModalHeader>
          <UnifiedModalTitle>Confirm Deletion</UnifiedModalTitle>
          <UnifiedModalDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </UnifiedModalDescription>
        </UnifiedModalHeader>
        <UnifiedModalFooter>
          <UnifiedModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </UnifiedModalClose>
          <Button variant="destructive">Delete</Button>
        </UnifiedModalFooter>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}
```

## Design Token Integration

The UnifiedModal uses the following design tokens from `shared/config/design-tokens.ts`:

```typescript
export const modalTokens = {
  overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
  content: {
    base: "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg",
    sizes: {
      sm: "w-full max-w-sm p-4",
      default: "w-full max-w-lg p-6",
      lg: "w-full max-w-2xl p-6", 
      xl: "w-full max-w-4xl p-8",
      full: "w-[95vw] h-[95vh] p-6",
    },
  },
  header: {
    base: "flex flex-col space-y-1.5 text-center sm:text-left",
    bordered: "border-b pb-4 mb-4",
  },
  // ... other tokens
};
```

## Migration from Regular Dialog

To migrate existing Dialog components to UnifiedModal:

1. **Replace imports**:
   ```tsx
   // Before
   import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
   
   // After
   import { UnifiedModal, UnifiedModalContent, UnifiedModalHeader, UnifiedModalTitle } from "@/components/unified/UnifiedModal";
   ```

2. **Update component names**:
   ```tsx
   // Before
   <Dialog>
     <DialogContent className="sm:max-w-md">
       <DialogHeader>
         <DialogTitle>Title</DialogTitle>
       </DialogHeader>
     </DialogContent>
   </Dialog>
   
   // After
   <UnifiedModal>
     <UnifiedModalContent size="sm">
       <UnifiedModalHeader>
         <UnifiedModalTitle>Title</UnifiedModalTitle>
       </UnifiedModalHeader>
     </UnifiedModalContent>
   </UnifiedModal>
   ```

3. **Replace hardcoded classes with size props**:
   ```tsx
   // Before: className="sm:max-w-md"
   // After: size="sm"
   
   // Before: className="sm:max-w-2xl"
   // After: size="lg"
   ```

4. **Add structured content sections**:
   ```tsx
   <UnifiedModalContent>
     <UnifiedModalHeader>
       {/* Header content */}
     </UnifiedModalHeader>
     <UnifiedModalBody>
       {/* Main content */}
     </UnifiedModalBody>
     <UnifiedModalFooter>
       {/* Action buttons */}
     </UnifiedModalFooter>
   </UnifiedModalContent>
   ```

## Best Practices

1. **Use appropriate sizes**: Choose the right size variant for your content
2. **Structure content**: Use Header, Body, and Footer components for consistent layout
3. **Accessibility**: Always include a title and description when appropriate
4. **Actions**: Place primary actions on the right in the footer
5. **Borders**: Use bordered headers/footers for complex modals with multiple sections
6. **Close behavior**: Consider whether to show the close button based on the modal's purpose

## Testing

The component includes comprehensive tests covering:
- All size variants
- Bordered header and footer options
- Close button visibility control
- Custom className application
- Trigger and close interactions

Run tests with:
```bash
npm test -- components/unified/__tests__/UnifiedModal.test.tsx
```

## Related Components

- `UnifiedCard` - For card-based layouts
- `UnifiedButton` - For consistent button styling
- `Dialog` - Base dialog primitives (components/ui/dialog.tsx)
- `AlertDialog` - For confirmation dialogs (components/ui/alert-dialog.tsx)