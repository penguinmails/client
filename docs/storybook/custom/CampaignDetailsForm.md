# CampaignDetailsForm Component

The CampaignDetailsForm provides a comprehensive form interface for creating and editing email campaign details, built with React Hook Form integration and consistent UI components.

## 🏗️ Component Architecture

- **React Hook Form**: Built with react-hook-form for form state management
- **Zod Validation**: Uses form validation schemas for data integrity
- **Conditional Rendering**: Adapts UI based on readOnly mode
- **Responsive Design**: Grid layout that adapts to different screen sizes
- **Internationalization**: Supports text content through translation system

## 📋 Props Table

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `form` | `UseFormReturn<CampaignFormValues>` | **required** | React Hook Form instance |
| `readOnly` | `boolean` | `false` | Display in read-only mode |
| `sendingAccounts` | `{value: string, label: string}[]` | **required** | Available email accounts for selection |

## 💡 Usage Examples

### Basic Campaign Creation

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  fromName: z.string().min(1, 'From name is required'),
  fromEmail: z.string().email('Valid email is required'),
  status: z.string().optional(),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

function CreateCampaignPage() {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      fromName: '',
      fromEmail: '',
      status: 'DRAFT',
    },
  })

  const sendingAccounts = [
    { value: 'account1', label: 'Marketing Team <marketing@company.com>' },
    { value: 'account2', label: 'Sales Team <sales@company.com>' },
  ]

  const onSubmit = (data: CampaignFormValues) => {
    console.log('Form data:', data)
    // Handle form submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Campaign Details</h2>
        <CampaignDetailsForm
          form={form}
          sendingAccounts={sendingAccounts}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit">Create Campaign</Button>
        <Button type="button" variant="outline">Save Draft</Button>
      </div>
    </form>
  )
}
```

### Read-Only Campaign Display

```tsx
import { useForm } from 'react-hook-form'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'

function CampaignDetailsView({ campaign }) {
  const form = useForm({
    defaultValues: campaign,
  })

  const sendingAccounts = [
    { value: campaign.fromEmail, label: `${campaign.fromName} <${campaign.fromEmail}>` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <Button>Edit Campaign</Button>
      </div>
      
      <CampaignDetailsForm
        form={form}
        readOnly={true}
        sendingAccounts={sendingAccounts}
      />
    </div>
  )
}
```

### Multi-Step Campaign Creation

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function MultiStepCampaignCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  
  const form = useForm({
    defaultValues: formData,
  })

  const sendingAccounts = [
    { value: 'marketing@company.com', label: 'Marketing <marketing@company.com>' },
    { value: 'sales@company.com', label: 'Sales <sales@company.com>' },
  ]

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  const onNext = (data) => {
    setFormData({ ...formData, ...data })
    nextStep()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step {currentStep}: Campaign Details</CardTitle>
      </CardHeader>
      <CardContent>
        <CampaignDetailsForm
          form={form}
          sendingAccounts={sendingAccounts}
        />
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Button
            onClick={form.handleSubmit(onNext)}
          >
            {currentStep === 1 ? 'Next: Template' : 'Create Campaign'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Campaign Settings Integration

```tsx
import { useForm } from 'react-hook-form'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function CampaignSettingsPage() {
  const form = useForm()

  const sendingAccounts = [
    { value: 'noreply@company.com', label: 'No Reply <noreply@company.com>' },
    { value: 'support@company.com', label: 'Support <support@company.com>' },
  ]

  return (
    <Tabs defaultValue="details" className="space-y-4">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="audience">Audience</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <CampaignDetailsForm
          form={form}
          sendingAccounts={sendingAccounts}
        />
      </TabsContent>
      
      {/* Other tabs content */}
    </Tabs>
  )
}
```

### Form Validation Integration

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'
import { Alert, AlertDescription } from '@/components/ui/alert'

const campaignSchema = z.object({
  name: z.string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must be less than 100 characters'),
  fromName: z.string()
    .min(1, 'From name is required')
    .max(50, 'From name must be less than 50 characters'),
  fromEmail: z.string()
    .email('Please enter a valid email address')
    .refine((email) => email.includes('@'), 'Email must contain @ symbol'),
})

function ValidatedCampaignForm() {
  const form = useForm({
    resolver: zodResolver(campaignSchema),
  })

  const sendingAccounts = [
    { value: 'test@company.com', label: 'Test Account <test@company.com>' },
  ]

  return (
    <div className="space-y-4">
      {Object.keys(form.formState.errors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the errors below before submitting.
          </AlertDescription>
        </Alert>
      )}
      
      <CampaignDetailsForm
        form={form}
        sendingAccounts={sendingAccounts}
      />
    </div>
  )
}
```

### Dynamic Account Loading

```tsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CampaignDetailsForm } from '@/components/campaigns/forms/CampaignDetailsForm'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

function DynamicAccountsForm() {
  const [sendingAccounts, setSendingAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const form = useForm()

  const loadAccounts = async () => {
    setLoading(true)
    try {
      // Simulate API call
      const accounts = await fetch('/api/sending-accounts').then(r => r.json())
      setSendingAccounts(accounts)
    } catch (error) {
      console.error('Failed to load accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Campaign Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadAccounts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Accounts
        </Button>
      </div>
      
      <CampaignDetailsForm
        form={form}
        sendingAccounts={sendingAccounts}
      />
    </div>
  )
}
```

## ♿ Accessibility

- Proper label associations for all form fields
- Error messages associated with respective fields
- Screen reader announcements for validation errors
- Keyboard navigation support
- Sufficient color contrast
- Form field descriptions for context

## 🎯 Design Guidelines

- Use in campaign creation and editing flows
- Set readOnly=true for view-only displays
- Provide sending accounts with descriptive labels
- Handle form validation with proper error display
- Use consistent spacing and typography
- Consider multi-step forms for complex workflows
- Show loading states during form submission

## 🔗 Related Components

- [Form](./core/form.md) - Form wrapper and validation
- [Input](./core/input.md) - Text input fields
- [Select](./core/select.md) - Dropdown selections
- [Button](./core/button.md) - Form actions
- [Card](./core/card.md) - Layout container

## 🔧 Dependencies

- **react-hook-form**: Form state management
- **@/components/ui/form**: Form field components
- **@/types/campaign**: TypeScript types for campaign data
- **@/components/campaigns/data/copy**: Text content system
