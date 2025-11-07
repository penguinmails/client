# Dialog Component

The Dialog component provides accessible modal dialogs and overlays built on Radix UI primitives with proper focus management and keyboard navigation.

## 🏗️ Structure

The Dialog system consists of:

- **Dialog**: Root component
- **DialogTrigger**: Element that opens the dialog
- **DialogContent**: Main dialog container
- **DialogHeader**: Top section for title and description
- **DialogTitle**: Dialog title element
- **DialogDescription**: Dialog description
- **DialogFooter**: Bottom section for actions
- **DialogClose**: Close button
- **DialogOverlay**: Background overlay
- **DialogPortal**: Portal container
- **DialogClose**: Close trigger

## 📋 Props Table

### Dialog

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `undefined` | Controlled open state |
| `onOpenChange` | `function` | `undefined` | Open state change handler |
| `defaultOpen` | `boolean` | `undefined` | Initial open state |

### DialogTrigger

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `asChild` | `boolean` | `false` | Render as child component |

### DialogContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |
| `children` | `ReactNode` | `undefined` | Dialog content |

### DialogHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### DialogTitle

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### DialogDescription

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

### DialogFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Additional CSS classes |

## 💡 Usage Examples

### Basic Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <p>Dialog content goes here</p>
    </div>
  </DialogContent>
</Dialog>
```

### Confirmation Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function DeleteConfirmationDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Campaign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the campaign
            and remove all associated data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            // Delete logic here
            setOpen(false)
          }}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Form Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

function CreateCampaignDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Campaign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Create a new email campaign for your audience. You can customize the content and schedule later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### Image Preview Dialog

```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

<Dialog>
  <DialogTrigger asChild>
    <Button variant="ghost">Preview Template</Button>
  </DialogTrigger>
  <DialogContent className="max-w-4xl">
    <div className="w-full">
      <img 
        src="/templates/preview.jpg" 
        alt="Template Preview" 
        className="w-full h-auto rounded-lg"
      />
    </div>
  </DialogContent>
</Dialog>
```

### Settings Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Account Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Account Settings</DialogTitle>
      <DialogDescription>
        Manage your account preferences and security settings.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Email Notifications</div>
          <div className="text-sm text-muted-foreground">Receive email updates about your campaigns</div>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Two-Factor Authentication</div>
          <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
        </div>
        <Switch />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Data Export</div>
          <div className="text-sm text-muted-foreground">Allow data export requests</div>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Multi-Step Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function MultiStepDialog({ open, onOpenChange }) {
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Campaign (Step {step} of {totalSteps})</DialogTitle>
          <DialogDescription>
            {step === 1 && "Configure basic campaign settings"}
            {step === 2 && "Design your email template"}
            {step === 3 && "Review and launch your campaign"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {step === 1 && (
            <div>
              <h3 className="font-medium mb-2">Basic Settings</h3>
              <p>Campaign name, subject line, and audience selection</p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="font-medium mb-2">Email Design</h3>
              <p>Template selection, content editing, and personalization</p>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="font-medium mb-2">Review</h3>
              <p>Final review of all campaign settings before launch</p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={onOpenChange}>
              Launch Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Full-Screen Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Full Screen</Button>
  </DialogTrigger>
  <DialogContent className="max-w-[95vw] max-h-[95vh]">
    <DialogHeader>
      <DialogTitle>Full Screen Content</DialogTitle>
    </DialogHeader>
    <div className="overflow-y-auto max-h-[calc(95vh-8rem)]">
      <p>This dialog takes up most of the screen space.</p>
      <p>It can contain extensive content that would be difficult to fit in a standard modal.</p>
      {/* Add your content here */}
    </div>
  </DialogContent>
</Dialog>
```

## ♿ Accessibility

- Automatic focus trapping when dialog opens
- Focus returns to trigger element when dialog closes
- Escape key support to close dialog
- Screen reader announcements for dialog state
- Proper ARIA attributes and roles
- Keyboard navigation support
- High contrast focus indicators

## 🎯 Design Guidelines

- Always provide a clear way to close the dialog
- Use descriptive titles and helpful descriptions
- Keep dialogs focused on a single task or decision
- Use DialogFooter for primary and secondary actions
- Place primary action on the right
- Make dialogs keyboard accessible
- Don't use dialogs for critical information that needs to be persistent
- Ensure sufficient color contrast
- Test with screen readers for accessibility

## 🔗 Related Components

- [Button](./button.md) - For dialog triggers and actions
- [Alert](./alert.md) - For inline notifications
- [Card](./card.md) - For content organization
