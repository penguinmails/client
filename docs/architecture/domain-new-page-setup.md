# Domain New Page Setup

## Overview

This document describes the implementation of the `/dashboard/domains/new` route, which was previously missing and causing 404 errors.

## Problem

The application had multiple components linking to `/dashboard/domains/new`:

- `features/domains/ui/components/header.tsx`
- `app/[locale]/dashboard/(infrastructure)/layout.tsx`
- `features/analytics/ui/components/dashboard/actions/QuickActions.tsx`

However, there was no route file for this path, resulting in 404 errors when users tried to access it.

## Solution

Created a new page at `app/[locale]/dashboard/(domains&ips)/domains/new/page.tsx` that adapts the existing domain creation components to work as a standalone page.

## Implementation Details

### File Structure

```
app/[locale]/dashboard/(domains&ips)/domains/
├── [domainId]/
│   └── accounts/
│       └── [accountId]/
│           └── content.tsx
└── new/
    └── page.tsx  ← NEW FILE
```

### Key Components Used

1. **FormProvider** (from `react-hook-form`)
   - Wraps the entire component tree
   - Provides form context to all child components
   - Required because components use `useFormContext()`
   - **Important**: `useForm` must be called synchronously, so we separate async translation loading from form initialization

2. **AddDomainProvider** (from `@features/domains/ui/context/add-domain-context`)
   - Provides domain creation context
   - Manages step state and form data

3. **NewDomainStepper**
   - Displays the step progress indicator
   - Uses the `Stepper` component from `@/components/ui/Stepper`

4. **NewDomainStep**
   - Renders the appropriate step component based on current step:
     - Step 1: `EnterDomain` - Domain input form
     - Step 2: `NewDomainDNSSetUp` - DNS records display
     - Step 3: `Confirmation` - Success message

5. **NewDomainNavigation**
   - Handles navigation between steps
   - Validates form inputs
   - Manages domain submission
   - Handles completion redirect

6. **NewDomainHeaderDetails**
   - Displays current step information
   - Shows step title, subtitle, and icon

### Internationalization

Added translations for the new page in both English and Spanish:

**English (`messages/en.json`):**

```json
"domains": {
  "new": {
    "title": "Add New Domain",
    "subtitle": "Configure your domain for email sending",
    "steps": {
      "domain": "Add Domain",
      "dns": "DNS Setup",
      "verify": "Verify Domain"
    }
  }
}
```

**Spanish (`messages/es.json`):**

```json
"domains": {
  "new": {
    "title": "Añadir Nuevo Dominio",
    "subtitle": "Configura tu dominio para el envío de correos",
    "steps": {
      "domain": "Añadir Dominio",
      "dns": "Configuración DNS",
      "verify": "Verificar Dominio"
    }
  }
}
```

### Page Flow

1. **User navigates to `/dashboard/domains/new`**
   - Main page component renders with `Suspense` boundary
   - `TranslationsWrapper` fetches translations asynchronously
   - `NewDomainPageContent` renders with translations and initializes form synchronously
   - FormProvider and AddDomainProvider wrap the component tree

2. **Step 1: Add Domain**
   - User enters domain name
   - Form validation occurs
   - User clicks "Next" to proceed

3. **Step 2: DNS Setup**
   - DNS records are displayed (SPF, DKIM, DMARC, MX)
   - User can copy record values
   - User can check DNS status
   - User clicks "Finish" to complete

4. **Step 3: Verification**
   - Success message is displayed
   - User is redirected to `/dashboard/domains`

### Technical Notes

- **Dynamic Rendering**: The page uses `export const dynamic = 'force-dynamic'` to ensure server-side rendering
- **Form Validation**: Uses `mode: "onChange"` for real-time validation
- **Type Safety**: TypeScript interface `DomainFormValues` ensures type safety
- **Back Navigation**: Includes a back button that navigates to `/dashboard/domains`
- **Async/Sync Separation**: The page uses a `Suspense` boundary to separate async translation loading from synchronous form initialization, avoiding the "useForm cannot be called in an async function" error
  - `NewDomainPage` (default export): Synchronous component with `Suspense` boundary
  - `TranslationsWrapper`: Async component that fetches translations
  - `NewDomainPageContent`: Synchronous component that initializes the form

### Architecture Pattern

The page follows the **Server Component + Client Component** pattern:

```tsx
// Server Component (async)
async function TranslationsWrapper() {
  const t = await getTranslations("domains.new");
  return <NewDomainPageContent t={t} />;
}

// Client Component (sync)
function NewDomainPageContent({ t }: { t: Translations }) {
  const form = useForm<DomainFormValues>({ ... }); // ✅ Called synchronously
  return (...);
}

// Main Export (sync with Suspense)
export default function NewDomainPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranslationsWrapper />
    </Suspense>
  );
}
```

This pattern ensures:

1. ✅ Translations are loaded asynchronously on the server
2. ✅ `useForm` is called synchronously in a client component
3. ✅ Proper loading states are shown during translation fetch
4. ✅ Type safety is maintained throughout

### Testing

After implementation, verify:

1. ✅ Page loads at `/dashboard/domains/new`
2. ✅ Stepper displays correctly
3. ✅ Form validation works
4. ✅ Navigation between steps works
5. ✅ DNS records display correctly
6. ✅ Copy functionality works
7. ✅ Completion redirects to domains list

### Future Enhancements

1. **Loading States**: Add loading indicators for async operations
2. **Error Handling**: Add error boundaries for better error handling
3. **Route Protection**: Add authentication middleware if needed
4. **SEO Metadata**: Add proper metadata for search engines
5. **Analytics**: Track domain creation events

## Related Files

- `app/[locale]/dashboard/(domains&ips)/domains/new/page.tsx` - New page file
- `features/domains/ui/context/add-domain-context.tsx` - Context provider
- `features/domains/ui/components/new/NewDomainStepper.tsx` - Stepper component
- `features/domains/ui/components/new/NewDomainStep.tsx` - Step renderer
- `features/domains/ui/components/new/NewDomainNavigation.tsx` - Navigation
- `features/domains/ui/components/new/NewDomainHeaderDetails.tsx` - Header
- `messages/en.json` - English translations
- `messages/es.json` - Spanish translations
