# Getting Started with PenguinMails

Welcome to PenguinMails! This comprehensive guide will take you from initial setup to productive development. PenguinMails is a modern email marketing platform built with Next.js, featuring real-time analytics, multi-tenant architecture, and edge deployment.

## What is PenguinMails?

PenguinMails is designed for B2B companies that need scalable email marketing infrastructure with complete data isolation, real-time analytics, and global edge deployment.

### Core Capabilities

- **Email Campaign Management**: Create, schedule, and manage email marketing campaigns
- **Multi-tenant Architecture**: Complete data isolation between organizations
- **Real-time Analytics**: Live campaign performance tracking and reporting
- **Lead Management**: Contact tracking and lead nurturing workflows
- **Template Management**: Email template creation and management system
- **Inbox Management**: Email conversation and reply handling
- **Domain Management**: Email domain setup and verification
- **User Management**: Role-based access control and team collaboration

### Key Technical Features

- **Edge Deployment**: Global CDN with sub-100ms response times
- **Modern UI**: Responsive design with dark/light mode support
- **Type Safety**: End-to-end TypeScript with strict validation
- **Performance Optimized**: Sub-15 second build times, optimized bundle sizes

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- **Git** for version control
- **Docker** for local development services
- A code editor (VS Code recommended with TypeScript extensions)

## Quick Start (5 Minutes)

Get PenguinMails running locally in just a few steps:

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd penguinmails-client
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration (see Environment Setup below)

# 3. Start development services
npm run db:start    # Start NileDB + Redis containers
npm run dev         # Start development server (in another terminal)
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Setup

### Essential Environment Variables

For local development, you need these core variables in your `.env.local`:

```bash
# Database & Auth (Required)
NILEDB_USER=your_user_id_here
NILEDB_PASSWORD=your_password_here
NILEDB_API_URL=your_api_url_here
NILEDB_POSTGRES_URL=postgres://username:password@host:port/database

# Redis Cache (Required)
REDIS_URL=redis://localhost:6379

# External Services (Optional for basic development)
STRIPE_SECRET_KEY=your-stripe-key
RESEND_API_KEY=your-resend-key

# Loop Email Service (Optional - for transactional emails)
LOOP_API_KEY=your_loop_api_key_here
LOOP_VERIFICATION_TRANSACTIONAL_ID=your_verification_id_here
LOOP_RESET_TRANSACTIONAL_ID=your_reset_id_here
LOOP_WELCOME_TRANSACTIONAL_ID=your_welcome_id_here
LOOP_NOTIFICATION_TRANSACTIONAL_ID=your_notification_id_here
```

### Development Database Services

When you run `npm run db:start`, these services become available:

| Service           | Port | Database   | Purpose                  |
| ----------------- | ---- | ---------- | ------------------------ |
| OLTP Database     | 5443 | `oltp`     | Transactional data       |
| OLAP Database     | 5444 | `olap`     | Analytics and reporting  |
| Messages Database | 5445 | `messages` | Email content            |
| Queue Database    | 5446 | `queue`    | Background jobs          |
| Redis Cache       | 6379 | -          | Performance optimization |

## Understanding the Codebase

### Project Structure Overview

```
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── [locale]/          # Internationalized routes (en, es)
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── dashboard/     # Main dashboard pages
│   │   └── signup/        # User registration flow
│   └── api/               # API routes
│       ├── analytics/     # Analytics endpoints
│       ├── auth/          # Authentication endpoints
│       └── campaigns/     # Campaign management endpoints
├── features/              # Feature-based organization (FSD architecture)
│   ├── analytics/        # Analytics feature
│   ├── auth/             # Authentication feature
│   ├── campaigns/        # Campaign management feature
│   └── [feature]/        # Other business features
├── components/             # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── design-system/    # Unified design system components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Business logic, utilities, and data access
│   ├── actions/          # Server actions for forms and mutations
│   ├── services/         # External service integrations
│   ├── utils/            # Shared utility functions
│   └── validation/       # Zod schema validations
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── context/               # React context providers
├── messages/              # Internationalization files (en.json, es.json)
├── docs/                  # Project documentation
└── scripts/               # Build and maintenance scripts
```

### Technology Stack

- **Frontend**: Next.js 15 with App Router and TypeScript
- **Database**: NileDB (Multi-tenant PostgreSQL with 4 separate databases)
- **ORM**: Drizzle ORM with type-safe queries
- **Cache**: Redis for analytics and performance optimization
- **Authentication**: NileDB integrated auth with role-based permissions
- **UI**: Tailwind CSS with shadcn/ui components
- **Deployment**: Cloudflare Workers with OpenNext adapter

## Essential Development Commands

### Daily Development Workflow

```bash
# Start development environment
npm run db:start         # Start NileDB + Redis containers
npm run dev              # Start development server with Turbopack

# Code quality checks (run before committing)
npm run typecheck        # TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run test             # Run test suite

# Database management
npm run db:stop          # Stop containers
npm run db:logs          # View container logs
docker compose up -d     # Alternative container start
docker compose down      # Stop all containers

# Building and deployment
npm run build            # Build Next.js application
npm run start            # Start production server
npm run deploy           # Deploy to Cloudflare Workers
```

### Component Development with Storybook

```bash
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook
npm run storybook-docs   # Generate Storybook documentation
```

## Your First Development Task

Let's walk through creating a simple feature to get familiar with the codebase:

### 1. Understanding the Architecture

PenguinMails follows Feature-Sliced Design (FSD) architecture:

- **Features** are organized by business domain (analytics, auth, campaigns)
- **Components** are reusable UI elements
- **Lib** contains business logic and utilities
- **Types** provide TypeScript definitions

### 2. Key Architectural Patterns

#### Multi-tenant Architecture

- Complete data isolation between organizations
- NileDB handles tenant context automatically
- All database operations are tenant-scoped

#### Type Safety

- Strict TypeScript throughout the codebase
- Zod schemas for runtime validation
- End-to-end type safety from database to UI

#### Authentication Flow

- Server-side sessions managed by NileDB
- JWT tokens for session management
- Role-based access control
- Request-based authentication checking

### 3. Common Development Patterns

#### API Route Pattern

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse } from "@/lib/utils/error-handling";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const data = await businessLogic(req);
    return NextResponse.json(data);
  } catch (error) {
    const { body, status } = createErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
```

#### Component Pattern

```typescript
// components/feature/FeatureComponent.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface Props {
  // Define props with TypeScript
}

export function FeatureComponent({ prop }: Props) {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Feature content */}
      </CardContent>
    </Card>
  );
}
```

#### Service Pattern

```typescript
// lib/services/feature-service.ts
import { db } from "@/lib/db-client";

export class FeatureService {
  async getById(id: string) {
    return await db.query.features.findFirst({
      where: eq(features.id, id),
    });
  }

  async create(data: CreateFeatureData) {
    return await db.insert(features).values(data).returning();
  }
}
```

## Development Best Practices

### Code Quality Standards

#### TypeScript

- Strict type checking enabled
- No `any` types allowed
- Use `import type` for type-only imports

#### File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: camelCase (`userSettings.ts`)
- **API routes**: lowercase with hyphens (`forgot-password/route.ts`)

#### Import Path Conventions

- Use `@/` prefix for all internal imports
- Avoid relative imports except for co-located files
- Use barrel exports (`index.ts`) for clean public APIs

### Testing Strategy

#### Testing Philosophy

- **Test Behavior, Not Implementation**: Focus on what the code does
- **Test Pyramid**: Unit tests > Integration tests > E2E tests
- **Co-located Tests**: Keep tests near the code they test

#### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run typecheck
```

#### Writing Tests

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { FeatureComponent } from './FeatureComponent';

describe('FeatureComponent', () => {
  it('should display the feature title', () => {
    render(<FeatureComponent />);
    expect(screen.getByText('Feature Title')).toBeInTheDocument();
  });
});
```

## Troubleshooting Common Issues

### Development Server Won't Start

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :6379

# Restart Docker services
npm run db:stop
npm run db:start
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Run type checking
npm run typecheck
```

### Database Connection Issues

```bash
# Check Docker containers
docker ps

# View container logs
npm run db:logs

# Restart containers
npm run db:stop && npm run db:start
```

## Next Steps: Your Learning Journey

Now that you have the basics set up, here's a structured learning path to become productive with PenguinMails:

### Week 1: Foundation (Essential)

**Goal**: Get comfortable with daily development tasks

1. **[Architecture Documentation](./architecture/README.md)** - Understand the system design and multi-tenant architecture
2. **[Component System](./components/README.md)** - Learn about the unified component library and design patterns
3. **[Quick Reference Guide](./quick-reference.md)** - Bookmark this for daily development commands and patterns
4. **Practice**: Create a simple component and API route using the patterns above

### Week 2-3: Feature Development (Intermediate)

**Goal**: Build complete features end-to-end

4. **[Feature Documentation](./features/README.md)** - Explore feature-specific guides and understand FSD architecture
5. **[Testing Guide](./testing/README.md)** - Learn testing strategies and write tests for your components
6. **[Development Workflow](./guides/development-workflow.md)** - Advanced development processes and architectural patterns
7. **Practice**: Implement a complete feature with tests and documentation

### Month 1+: Advanced Topics (Expert)

**Goal**: Optimize performance and contribute to architecture decisions

8. **[Infrastructure Setup](./infrastructure/README.md)** - Advanced deployment and configuration
9. **[Performance Optimization](./performance/README.md)** - Bundle analysis and optimization techniques
10. **[Troubleshooting Guide](./troubleshooting/README.md)** - Advanced debugging and problem resolution
11. **[Type System Guide](./architecture/type-system.md)** - Advanced TypeScript patterns and utilities

### Ongoing: Specialization

**Goal**: Become an expert in specific areas

- **Analytics**: Deep dive into [Analytics Architecture](./architecture/database-architecture.md)
- **Authentication**: Master [Authentication Patterns](./architecture/authentication.md)
- **Performance**: Specialize in [Performance Monitoring](./performance/monitoring.md)
- **Testing**: Become a [Testing Expert](./testing/best-practices.md)

## Getting Help

### Documentation Resources

- **[Quick Reference](./quick-reference.md)** - Common commands and patterns
- **[Troubleshooting](./troubleshooting/README.md)** - Common issues and solutions
- **[Architecture](./architecture/README.md)** - System design and technical decisions
- **[Development Workflow](./guides/development-workflow.md)** - Development processes and patterns

### When You're Stuck

1. Check the [Troubleshooting Guide](./troubleshooting/README.md)
2. Review the [Quick Reference](./quick-reference.md) for common patterns
3. Consult feature-specific documentation in the relevant directory
4. Review the [Architecture Documentation](./architecture/README.md) for system understanding

## Contributing Guidelines

When contributing to PenguinMails:

1. **Follow established patterns** and conventions
2. **Write tests** for new functionality
3. **Update documentation** for changes
4. **Ensure type safety** throughout your code
5. **Consider performance** implications of changes
6. **Run quality checks** before committing:
   ```bash
   npm run typecheck && npm run lint && npm run test
   ```

For detailed contribution guidelines, see the [Development Workflow](./guides/development-workflow.md) guide.

Welcome to the PenguinMails team! 🐧📧
