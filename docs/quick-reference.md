# Quick Reference Guide

This guide provides quick access to common commands, patterns, and workflows for PenguinMails development. For comprehensive setup instructions, see the [Getting Started Guide](./getting-started.md).

## Essential Commands

### Development Environment

```bash
# Start development environment
npm run db:start         # Start NileDB + Redis containers
npm run dev              # Start development server with Turbopack

# Stop environment
npm run db:stop          # Stop containers
docker compose down      # Alternative stop command
```

### Code Quality & Testing

```bash
npm run typecheck        # TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm test                 # Run Jest test suite
npm run test:watch       # Run tests in watch mode
```

### Building & Deployment

```bash
npm run build            # Build Next.js application
npm run start            # Start production server
npm run deploy           # Deploy to Cloudflare Workers
npm run preview          # Preview Cloudflare deployment locally
```

### Database Operations

```bash
npm run db:logs          # View container logs
docker ps                # Check container status
docker compose up -d     # Start containers (alternative)
```

### Storybook

```bash
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook
```

## Environment Configuration

### Required Environment Variables

```bash
# Copy template and edit
cp .env.example .env.local

# Essential variables for local development
NILEDB_USER=your_user_id_here
NILEDB_PASSWORD=your_password_here
NILEDB_API_URL=your_api_url_here
REDIS_URL=redis://localhost:6379
```

### Database Ports (Docker)

| Service  | Port | Database   | Purpose            |
| -------- | ---- | ---------- | ------------------ |
| OLTP     | 5443 | `oltp`     | Transactional data |
| OLAP     | 5444 | `olap`     | Analytics          |
| Messages | 5445 | `messages` | Email content      |
| Queue    | 5446 | `queue`    | Background jobs    |
| Redis    | 6379 | -          | Cache              |

## Code Patterns & Templates

### API Route Template

```typescript
// app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse } from "@/lib/utils/error-handling";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    // Business logic here
    return NextResponse.json({ data });
  } catch (error) {
    const { body, status } = createErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
```

### Component Template

```typescript
// components/[feature]/ComponentName.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComponentNameProps {
  // Define props
}

export function ComponentName({ prop }: ComponentNameProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### Server Action Template

```typescript
// lib/actions/[feature]-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  // Define validation schema
});

export async function actionName(formData: FormData) {
  const validatedFields = schema.safeParse({
    // Parse form data
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  try {
    // Business logic
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Action failed" };
  }
}
```

### Form with Validation Template

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export function FormComponent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', name: '' },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Database Patterns

### NileDB Query Pattern

```typescript
// lib/data/[feature]-data.ts
import { nile } from "@/lib/niledb";
import { NextRequest } from "next/server";

export async function getFeatureData(req: NextRequest) {
  const db = nile(req); // Pass request for session context

  return await db
    .select()
    .from(featureTable)
    .where(eq(featureTable.tenantId, db.tenantId)); // Auto tenant isolation
}
```

### Type-Safe Schema Definition

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const featureTable = pgTable("features", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Authentication Patterns

### Protected Route

```typescript
// app/[locale]/protected-page/page.tsx
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await requireAuth();
  if (!user) redirect('/login');

  return <PageContent user={user} />;
}
```

### API Route Authentication

```typescript
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    // Authenticated logic
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

## UI Component Shortcuts

### Common shadcn/ui Imports

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
```

### Tailwind CSS Utility Classes

```css
/* Layout */
.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}
.grid-responsive {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

/* Spacing */
.section-spacing {
  @apply py-12 lg:py-16;
}
.card-spacing {
  @apply p-6 lg:p-8;
}

/* Typography */
.heading-xl {
  @apply text-3xl font-bold tracking-tight lg:text-4xl;
}
.heading-lg {
  @apply text-2xl font-semibold tracking-tight;
}
.text-muted {
  @apply text-muted-foreground;
}
```

## Internationalization

### Using Translations

```typescript
// In components
import { useTranslations } from 'next-intl';
const t = useTranslations('namespace');
return <h1>{t('title')}</h1>;

// In server components
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('namespace');
return <h1>{t('title')}</h1>;
```

### Translation File Structure

```json
// messages/en.json
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "dashboard": { "title": "Dashboard", "welcome": "Welcome back, {name}!" }
}
```

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
  placeholder="blur"
/>
```

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if needed
});
```

### Redis Caching

```typescript
import { redis } from "@/lib/cache";

export async function getCachedData(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchData();
  await redis.setex(key, 3600, JSON.stringify(data)); // 1 hour cache
  return data;
}
```

## Troubleshooting Quick Fixes

### TypeScript Errors

```bash
rm -rf .next node_modules/.cache
npm install && npm run typecheck
```

### Database Connection Issues

```bash
docker ps                    # Check container status
npm run db:logs             # View logs
npm run db:stop && npm run db:start  # Restart
```

### Build Errors

```bash
rm -rf .next node_modules/.cache
npm install && npm run build
```

### Port Conflicts

```bash
lsof -i :3000               # Check what's using port 3000
lsof -i :6379               # Check Redis port
```

## Git Workflow

### Branch Naming

```bash
feature/add-email-templates
bugfix/fix-auth-redirect
hotfix/critical-security-patch
```

### Commit Messages

```bash
feat: add email template management
fix: resolve authentication redirect loop
docs: update API documentation
refactor: simplify user data fetching
test: add unit tests for email validation
```

### Common Git Commands

```bash
git checkout -b feature/new-feature
git add . && git commit -m "feat: implement feature"
git push origin feature/new-feature

# Update from main
git checkout main && git pull origin main
git checkout feature/new-feature && git rebase main
```

## Development Checklist

### Before Starting Development

- [ ] Pull latest changes: `git pull origin main`
- [ ] Start services: `npm run db:start`
- [ ] Start dev server: `npm run dev`
- [ ] Check types: `npm run typecheck`

### Before Committing

- [ ] Run linter: `npm run lint`
- [ ] Check types: `npm run typecheck`
- [ ] Run tests: `npm test`
- [ ] Test build: `npm run build`

### Before Deploying

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build successful
- [ ] Environment variables configured

## Useful Aliases

Add these to your shell profile for faster development:

```bash
# Development shortcuts
alias pdev="npm run dev"
alias pdb="npm run db:start"
alias ptc="npm run typecheck"
alias plint="npm run lint"
alias ptest="npm test"

# Git shortcuts
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"
```

---

For comprehensive guides, see:

- **[Getting Started Guide](./getting-started.md)** - Complete setup and onboarding
- **[Architecture Documentation](./architecture/README.md)** - System design details
- **[Development Workflow](./guides/development-workflow.md)** - Advanced development processes
