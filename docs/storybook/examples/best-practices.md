# Usage Examples and Best Practices

This document provides comprehensive examples and best practices for using the Penguin Mails design system components effectively.

## 🏗️ Component Composition Patterns

### Building Complex UIs

#### Dashboard Layout Pattern

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

function DashboardLayout() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, John</p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/avatars/user.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        {/* More cards... */}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Summer Sale', status: 'Running', opens: '24%' },
              { name: 'Newsletter', status: 'Completed', opens: '18%' },
              { name: 'Product Launch', status: 'Draft', opens: '-' },
            ].map((campaign) => (
              <div key={campaign.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Open rate: {campaign.opens}
                  </p>
                </div>
                <Badge variant={getStatusVariant(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'Running': return 'default'
    case 'Completed': return 'secondary'
    case 'Draft': return 'outline'
    default: return 'outline'
  }
}
```

#### Form Layout Pattern

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.string().min(1, 'Please select a role'),
})

function UserForm() {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      // Handle form submission
      console.log('Form data:', data)
    } catch (error) {
      console.error('Submission error:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
        <CardDescription>
          Add a new user to your organization
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Please fix the errors below before submitting.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                className={form.formState.errors.firstName ? 'border-destructive' : ''}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                className={form.formState.errors.lastName ? 'border-destructive' : ''}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              className={form.formState.errors.email ? 'border-destructive' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => form.setValue('role', value)}>
              <SelectTrigger className={form.formState.errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

#### Modal Pattern

```tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

function ConfirmationDialog() {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOpen(false)
      setConfirmText('')
      // Handle success
    } catch (err) {
      setError('Failed to delete item. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Campaign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the campaign
            and remove all associated data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <code className="text-sm font-mono">DELETE</code> to confirm:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmText !== 'DELETE'}
          >
            {isDeleting ? 'Deleting...' : 'Delete Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## 🎨 Common Design Patterns

### Loading States

```tsx
// Button loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Card loading skeleton
<Card>
  <CardHeader>
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse" />
      <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
    </div>
  </CardContent>
</Card>

// List loading state
<div className="space-y-3">
  {[...Array(3)].map((_, i) => (
    <div key={i} className="flex items-center space-x-3">
      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
      <div className="space-y-1">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-3 bg-muted rounded w-16 animate-pulse" />
      </div>
    </div>
  ))}
</div>
```

#### Error States

```tsx
// Form error display
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      className="border-destructive"
      aria-describedby="email-error"
      aria-invalid="true"
    />
    <p id="email-error" className="text-sm text-destructive">
      Please enter a valid email address
    </p>
  </div>
</div>

// Empty state
<Card>
  <CardContent className="flex flex-col items-center justify-center py-10">
    <div className="rounded-full bg-muted p-3">
      <Mail className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">No campaigns yet</h3>
    <p className="text-sm text-muted-foreground text-center">
      Get started by creating your first email campaign
    </p>
    <Button className="mt-4">
      Create Campaign
    </Button>
  </CardContent>
</Card>
```

#### Success States

```tsx
// Success alert
<Alert>
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your campaign has been created successfully. You can now start building your email content.
  </AlertDescription>
</Alert>

// Success feedback
<div className="flex items-center space-x-2 text-green-600">
  <CheckCircle className="h-4 w-4" />
  <span className="text-sm font-medium">Campaign published</span>
</div>
```

## 📱 Responsive Design Examples

### Mobile-First Approach

```tsx
// Mobile: Stack vertically, Desktop: Side by side
<div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
  <Card className="flex-1">
    <CardHeader>
      <CardTitle className="text-base md:text-lg">Total Users</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">1,234</div>
    </CardContent>
  </Card>
  <Card className="flex-1">
    <CardHeader>
      <CardTitle className="text-base md:text-lg">Active Campaigns</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">8</div>
    </CardContent>
  </Card>
</div>

// Responsive grid
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent className="p-4">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-32 object-cover rounded-md mb-2"
        />
        <h3 className="font-semibold text-sm">{item.title}</h3>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Responsive Navigation

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'

function ResponsiveNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Logo</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/" className="text-sm font-medium">Home</a>
            <a href="/campaigns" className="text-sm font-medium">Campaigns</a>
            <a href="/analytics" className="text-sm font-medium">Analytics</a>
            <Button>Sign In</Button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <a href="/" className="text-lg font-medium">Home</a>
                  <a href="/campaigns" className="text-lg font-medium">Campaigns</a>
                  <a href="/analytics" className="text-lg font-medium">Analytics</a>
                  <Button className="w-full">Sign In</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## ♿ Accessibility Best Practices

### Proper Label Association

```tsx
// Good: Proper label association
<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input
    id="username"
    type="text"
    placeholder="Enter your username"
    aria-describedby="username-help"
  />
  <p id="username-help" className="text-sm text-muted-foreground">
    Choose a unique username
  </p>
</div>

// Good: Grouping related inputs
<fieldset>
  <legend className="text-sm font-medium">Contact Information</legend>
  <div className="space-y-4 mt-2">
    <div>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" />
    </div>
    <div>
      <Label htmlFor="phone">Phone</Label>
      <Input id="phone" type="tel" />
    </div>
  </div>
</fieldset>
```

### Error Handling

```tsx
// Good: Clear error messaging
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    aria-describedby="password-error password-help"
    aria-invalid={!!errors.password}
  />
  <p id="password-help" className="text-sm text-muted-foreground">
    Password must be at least 8 characters
  </p>
  {errors.password && (
    <p id="password-error" className="text-sm text-destructive">
      {errors.password.message}
    </p>
  )}
</div>

// Good: Live region for dynamic updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>
```

### Focus Management

```tsx
// Good: Focus management in modals
function Modal() {
  const dialogRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Focus the dialog when it opens
    dialogRef.current?.focus()
  }, [])

  return (
    <Dialog>
      <DialogContent ref={dialogRef} tabIndex={-1}>
        <DialogTitle>Edit Campaign</DialogTitle>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

## 🔧 Performance Best Practices

### Component Optimization

```tsx
// Good: Memoize expensive calculations
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }))
  }, [data])

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.processed}</div>
      ))}
    </div>
  )
})

// Good: Lazy loading for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Bundle Optimization

```tsx
// Good: Dynamic imports for route-based code splitting
import { lazy, Suspense } from 'react'

// Instead of: import CampaignForm from './CampaignForm'
const CampaignForm = lazy(() => import('./CampaignForm'))

function CampaignPage() {
  return (
    <Suspense fallback={<CampaignFormSkeleton />}>
      <CampaignForm />
    </Suspense>
  )
}
```

---

*These examples demonstrate the proper usage patterns and best practices for building accessible, performant, and maintainable user interfaces with our design system.*
