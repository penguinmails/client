# Database Architecture & NileDB Integration Guide

## Overview

This application uses **NileDB** as the primary database system, providing built-in multi-tenancy, authentication, and PostgreSQL compatibility. This guide covers the complete database architecture, authentication patterns, and best practices.

## Architecture Overview

### NileDB Core Concepts

**NileDB** provides:
- **Built-in Multi-Tenancy**: Automatic tenant isolation at the database level
- **Authentication System**: Server-side session management with JWT tokens
- **PostgreSQL Compatibility**: Standard SQL with tenant-aware queries
- **Automatic User Management**: Users, tenants, and tenant_users tables managed by NileDB

### Database Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NileDB Core   │    │  Custom Tables  │    │   Analytics     │
│                 │    │                 │    │                 │
│ • users         │    │ • user_profiles │    │ • OLAP DB       │
│ • tenants       │    │ • companies*    │    │ • Messages DB   │
│ • tenant_users  │    │ • custom_data   │    │ • Queue DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

*Note: In our implementation, **tenants ARE companies**. We don't use separate company tables.

## Key Tables & Schema

### NileDB Managed Tables

#### `users` (NileDB Core)
```sql
users {
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  given_name TEXT,
  family_name TEXT,
  picture TEXT,
  email_verified TIMESTAMP,
  created TIMESTAMP,
  updated TIMESTAMP,
  deleted TIMESTAMP
}
```

#### `tenants` (NileDB Core)
```sql
tenants {
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  created TIMESTAMP,
  updated TIMESTAMP,
  deleted TIMESTAMP,
  compute_id UUID
}
```

#### `tenant_users` (NileDB Core)
```sql
tenant_users {
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  email TEXT,
  roles TEXT[] NOT NULL, -- NileDB-managed array for auth
  created TIMESTAMP,
  updated TIMESTAMP,
  deleted TIMESTAMP,
  PRIMARY KEY (tenant_id, user_id)
}
```

### Custom Application Tables

#### `user_profiles` (Application Extension)
```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin
  is_penguinmails_staff BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  last_login_at TIMESTAMP,
  created TIMESTAMP DEFAULT NOW(),
  updated TIMESTAMP DEFAULT NOW()
);
```

## Code Architecture

### Directory Structure

```
lib/
├── data/                    # Main data access layer
│   ├── index.ts            # Main exports
│   ├── nile.ts             # NileDB SDK instance
│   ├── auth/               # Authentication & sessions
│   │   ├── session.ts      # Session management
│   │   └── users.ts        # User profiles
│   ├── entities/           # Business entities
│   │   └── companies.ts    # Company (tenant) management
│   └── utils/              # Utilities & errors
├── niledb/                 # NileDB-specific implementations
│   ├── session.ts          # NileDB session functions
│   ├── users.ts            # NileDB user functions
│   └── companies.ts        # NileDB company functions
└── db/                     # Legacy compatibility layer
    └── index.ts            # Re-exports for backward compatibility
```

### Core Functions

#### Session Management (`lib/data/auth/session.ts`)

```typescript
// Get current authenticated user
const user = await getCurrentUser(req);

// Validate session exists
const isValid = await validateSession(req);

// Require authentication (throws if not authenticated)
const user = await requireAuth(req);

// Get user's tenants
const tenants = await getUserTenants(req);

// Execute query with tenant context
const results = await queryWithContext(sql, params, req);
```

#### User Management (`lib/data/auth/users.ts`)

```typescript
// Get enhanced user profile
const profile = await getUserProfile(req);

// Update user profile
await updateUserProfile({ role: 'admin' }, req);

// Initialize profile on first login
await initializeUserProfile(userId, req);
```

#### Company Management (`lib/data/entities/companies.ts`)

```typescript
// Get user's companies (tenants)
const companies = await getUserCompanies(userId, req);

// Get specific company
const company = await getCompanyById(companyId, req);

// Create new company (tenant)
const company = await createCompany({ name: 'Acme Inc' }, req);
```

## Authentication Patterns

### 1. API Route Authentication

```typescript
import { requireAuth, getUserProfile } from '@/shared/queries/auth';
import { createErrorResponse } from '@/shared/queries/utils';

export async function GET(req: NextRequest) {
  try {
    // Require authentication - throws if not authenticated
    const user = await requireAuth(req);
    
    // Get enhanced profile with custom data
    const profile = await getUserProfile(req);
    
    return NextResponse.json({ profile });
  } catch (error) {
    const { body, status } = createErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
```

### 2. Server Component Authentication

```typescript
import { getCurrentUser, getUserTenants } from '@/shared/queries/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const tenants = await getUserTenants();
  
  return <Dashboard user={user} tenants={tenants} />;
}
```

### 3. Client-Side Authentication (React Context)

```typescript
import { useAuth } from '@features/auth/ui/context/auth-context';

function Dashboard() {
  const { 
    user, 
    nileUser, 
    userTenants, 
    selectedTenantId,
    setSelectedTenant 
  } = useAuth();
  
  if (!user) return <LoginForm />;
  
  return (
    <div>
      <TenantSelector 
        tenants={userTenants}
        selected={selectedTenantId}
        onSelect={setSelectedTenant}
      />
    </div>
  );
}
```

## Critical Best Practices

### ⚠️ Common Pitfalls to Avoid

#### 1. **Infinite Loops in React Context**
```typescript
// ❌ BAD: Dependencies cause infinite re-renders
const restoreSession = useCallback(async () => {
  // ... session logic
  setSelectedTenant(tenants[0].id); // This triggers re-render
}, [selectedTenant]); // This dependency causes loop!

// ✅ GOOD: Use setState callback pattern
const restoreSession = useCallback(async () => {
  // ... session logic
  setSelectedTenant(current => current || tenants[0].id);
}, [fetchProfile, fetchTenants]); // Stable dependencies only
```

#### 2. **Column Name Mismatches**
```typescript
// ❌ BAD: Assuming column names
SELECT created_at, updated_at FROM user_profiles; -- These don't exist!

// ✅ GOOD: Use actual NileDB column names
SELECT created, updated FROM user_profiles; -- NileDB uses these names
```

#### 3. **Missing Table Relationships**
```typescript
// ❌ BAD: Assuming custom junction tables exist
SELECT * FROM companies c
JOIN company_users cu ON c.id = cu.company_id; -- company_users doesn't exist!

// ✅ GOOD: Use NileDB's tenant system
SELECT * FROM tenants t
JOIN tenant_users tu ON t.id = tu.tenant_id; -- Use NileDB tables
```

#### 4. **Incorrect Tenant Mapping**
```typescript
// ❌ BAD: Treating tenants and companies as separate
const companies = await getCompanies(tenantId);
const tenant = await getTenant(companyId);

// ✅ GOOD: Tenant IS the company
const company = await getCompanyById(tenantId); // tenantId === companyId
```

### ✅ Best Practices

#### 1. **Always Use Request Context**
```typescript
// Pass NextRequest to maintain session context
const profile = await getUserProfile(req);
const companies = await getUserCompanies(userId, req);
```

#### 2. **Handle Errors Consistently**
```typescript
try {
  const user = await requireAuth(req);
  // ... business logic
} catch (error) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Handle other errors...
}
```

#### 3. **Use TypeScript Types**
```typescript
// Define proper types for database results
const rows = await queryWithContext<{
  id: string;
  name: string;
  roles: string[];
}>(query, params, req);
```

#### 4. **Batch State Updates**
```typescript
// Minimize re-renders by batching related updates
setUserTenants(tenants);
setUserCompanies(companies);
setIsStaff(profile.isPenguinMailsStaff);
setNileUser(profile); // This triggers other effects
```

## Environment Configuration

### Required Environment Variables

```env
# NileDB Configuration
NILEDB_API_URL=https://us-west-2.api.thenile.dev
NILEDB_USER=your-user-id
NILEDB_PASSWORD=your-password
NILEDB_POSTGRES_URL=postgres://user:pass@host:port/db

# Database IDs
NILEDB_DATABASE_ID=your-database-id
```

### Development Setup

```env
# Local development with NileDB cloud
NILEDB_API_URL=https://us-west-2.api.thenile.dev
NILEDB_USER=019993a8-a8ad-7037-92ef-5c94e520d505
NILEDB_PASSWORD=***
NILEDB_POSTGRES_URL=postgres://019993a8-a8ad-7037-92ef-5c94e520d505:***@us-west-2.db.thenile.dev:5432/penguin_mails_dev
```

## Debugging & Troubleshooting

### Common Issues

#### 1. **Column Does Not Exist**
```
Error: column "created_at" does not exist
Hint: Perhaps you meant to reference the column "user_profiles.created".
```
**Solution**: Use NileDB column names (`created`, `updated`) not Rails-style (`created_at`, `updated_at`)

#### 2. **Relation Does Not Exist**
```
Error: relation "company_users" does not exist
```
**Solution**: Use NileDB's `tenant_users` table instead of custom junction tables

#### 3. **Infinite API Calls**
```
[niledb][DEBUG][REQUEST] [GET] /api/profile (repeating)
```
**Solution**: Check React Context dependencies and use stable callback patterns

#### 4. **Session Context Missing**
```
[niledb][WARN] nile.userId is not set
```
**Solution**: Ensure `NextRequest` is passed to all database functions

### Debug Logging

Enable NileDB debug logging:
```env
NILEDB_LOG_LEVEL=DEBUG
```

This shows all SQL queries and API calls for debugging.

## Migration Guide

### From Custom Auth to NileDB

1. **Update imports**:
   ```typescript
   // Old
   import { getUser } from '@/shared/auth';
   
   // New
   import { getCurrentUser } from '@/shared/queries/auth';
   ```

2. **Update database queries**:
   ```typescript
   // Old
   SELECT * FROM users WHERE id = $1;
   
   // New - uses NileDB session context
   const user = await getCurrentUser(req);
   ```

3. **Update tenant handling**:
   ```typescript
   // Old - separate company concept
   const company = await getCompany(companyId);
   
   // New - tenant IS the company
   const company = await getCompanyById(tenantId, req);
   ```

## Performance Considerations

### Query Optimization

1. **Use tenant context**: NileDB automatically adds tenant filters
2. **Batch related queries**: Fetch related data in parallel
3. **Cache user sessions**: Avoid repeated profile fetches
4. **Use proper indexes**: NileDB handles tenant-aware indexing

### Connection Management

- NileDB SDK manages connection pooling automatically
- Use single SDK instance across the application
- Avoid creating multiple database connections

This architecture provides a robust, scalable foundation for multi-tenant B2B applications with proper authentication, tenant isolation, and type safety.