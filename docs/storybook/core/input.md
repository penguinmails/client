# Input Component

The Input component provides a consistent, accessible text input field built on native HTML input elements with enhanced styling and behavior.

## 📋 Props Table

| Prop               | Type       | Default     | Description                          |
| ------------------ | ---------- | ----------- | ------------------------------------ |
| `type`             | `string`   | `"text"`    | HTML input type attribute            |
| `className`        | `string`   | `undefined` | Additional CSS classes               |
| `placeholder`      | `string`   | `undefined` | Placeholder text                     |
| `disabled`         | `boolean`  | `false`     | Disable input interaction            |
| `required`         | `boolean`  | `false`     | Mark as required field               |
| `value`            | `string`   | `undefined` | Controlled value                     |
| `defaultValue`     | `string`   | `undefined` | Initial value for uncontrolled input |
| `onChange`         | `function` | `undefined` | Change event handler                 |
| `onFocus`          | `function` | `undefined` | Focus event handler                  |
| `onBlur`           | `function` | `undefined` | Blur event handler                   |
| `aria-describedby` | `string`   | `undefined` | ARIA description ID                  |
| `aria-invalid`     | `boolean`  | `undefined` | ARIA invalid state                   |

_All standard HTML input props are supported through the component's TypeScript interface._

## 💡 Usage Examples

### Basic Input

```tsx
import { Input } from '@/components/ui/input'

// Basic text input
<Input placeholder="Enter your name" />

// Email input
<Input type="email" placeholder="your@email.com" />

// Password input
<Input type="password" placeholder="Enter password" />
```

### Form Integration

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<form className="space-y-4">
  <div>
    <Label htmlFor="username">Username</Label>
    <Input id="username" placeholder="Enter username" required />
  </div>
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="your@email.com" required />
  </div>
</form>;
```

### With Validation States

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
    aria-describedby="email-error"
    aria-invalid="false"
  />
  <p id="email-error" className="text-sm text-muted-foreground">
    We'll never share your email
  </p>
</div>

// Error state
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    placeholder="Enter password"
    aria-describedby="password-error"
    aria-invalid="true"
  />
  <p id="password-error" className="text-sm text-destructive">
    Password must be at least 8 characters
  </p>
</div>
```

### Search Input

```tsx
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

<div className="relative">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input type="search" placeholder="Search campaigns..." className="pl-10" />
</div>;
```

### Input with Icons

```tsx
import { Input } from "@/components/ui/input";
import { Mail, User } from "lucide-react";

<div className="space-y-4">
  <div className="relative">
    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input placeholder="Full name" className="pl-10" />
  </div>

  <div className="relative">
    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input type="email" placeholder="Email address" className="pl-10" />
  </div>
</div>;
```

### Controlled Input with State

```tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";

function SearchComponent() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-2">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
        className={isLoading ? "opacity-50" : ""}
        disabled={isLoading}
      />
      {search && (
        <p className="text-sm text-muted-foreground">Searching for: {search}</p>
      )}
    </div>
  );
}
```

### File Input

```tsx
import { Input } from "@/components/ui/input";

<div className="space-y-2">
  <Label htmlFor="avatar">Profile Picture</Label>
  <Input
    id="avatar"
    type="file"
    accept="image/*"
    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
  />
</div>;
```

## ♿ Accessibility

- Native HTML input ensures screen reader compatibility
- Supports all standard ARIA attributes
- Proper focus management with visible focus indicators
- Error states with `aria-invalid` and error messaging
- Label association for form accessibility
- File input styling supports keyboard navigation

## 🎯 Design Guidelines

- Always pair with a Label component for accessibility
- Use appropriate input types for better mobile keyboards
- Include helpful placeholder text, but don't replace labels
- Provide clear error messages for validation
- Use `aria-describedby` to connect help text
- Consider using `type="search"` for search inputs
- File inputs should have clear accept attributes
- Disable inputs should maintain proper contrast

## 🔗 Related Components

- [Button](./button.md) - For form submission
- [Alert](./alert.md) - For error messaging
