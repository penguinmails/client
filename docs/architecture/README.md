# Architecture Documentation

## Overview

This directory contains comprehensive documentation for the PenguinMails architecture, covering system design, technical decisions, and architectural patterns used throughout the platform.

## Navigation

← [Back to Documentation Home](../README.md)

## Documentation Index

### Core Architecture

- **[Authentication](./authentication.md)** - Authentication system and security architecture
- **[Database Architecture](./database-architecture.md)** - NileDB multi-tenant database design
- **[API Routes](./api-routes.md)** - API design patterns and conventions
- **[Type System](./type-system.md)** - TypeScript architecture and type definitions
- **[Feature API Contracts](./feature-api-contracts.md)** - API contract definitions between features
- **[Import Path Conventions](./import-path-conventions.md)** - Standardized import path patterns
- **[Semantic Tokens](./semantic-tokens.md)** - Design system token usage and conventions
- **[Build Validation and Deployment](./build-validation-and-deployment.md)** - Production build validation and deployment guide

## Quick Navigation

### For New Developers

- **Getting oriented?** Start with [Database Architecture](./database-architecture.md) and [Authentication](./authentication.md)
- **Need API patterns?** Check [API Routes](./api-routes.md) and [Feature API Contracts](./feature-api-contracts.md)
- **Working with types?** See [Type System](./type-system.md)
- **Import questions?** Review [Import Path Conventions](./import-path-conventions.md)

### For Frontend Developers

- **Component architecture?** See [Semantic Tokens](./semantic-tokens.md) and [Type System](./type-system.md)
- **API integration?** Check [API Routes](./api-routes.md) and [Feature API Contracts](./feature-api-contracts.md)
- **Import patterns?** Review [Import Path Conventions](./import-path-conventions.md)

### For Backend Developers

- **Database design?** Start with [Database Architecture](./database-architecture.md)
- **Auth implementation?** See [Authentication](./authentication.md)
- **API development?** Check [API Routes](./api-routes.md)
- **Type safety?** Review [Type System](./type-system.md)

### For DevOps Engineers

- **Deployment process?** See [Build Validation and Deployment](./build-validation-and-deployment.md)
- **Database setup?** Check [Database Architecture](./database-architecture.md)
- **Infrastructure patterns?** Review [Authentication](./authentication.md) for security considerations

## Architecture Principles

### Multi-Tenant Architecture

The platform is built with complete tenant isolation using NileDB's multi-tenant PostgreSQL capabilities:

- **Data Isolation**: Complete separation between organizations
- **Security**: Tenant-scoped authentication and authorization
- **Scalability**: Efficient resource utilization across tenants

### Feature-Sliced Design (FSD)

The project follows FSD principles with clear layer separation:

```
├── features/            # Business features (admin, analytics, campaigns, etc.)
├── shared/              # Shared infrastructure and utilities
├── components/          # Cross-feature UI primitives
└── app/                 # Application layer (Next.js App Router)
```

### Type Safety

- **Strict TypeScript**: No `any` types allowed
- **Database Types**: Generated from schema with Drizzle ORM
- **API Contracts**: Typed interfaces between frontend and backend
- **Validation**: Zod schemas for runtime type checking

## Key Technologies

### Database & Backend

- **NileDB**: Multi-tenant PostgreSQL with built-in authentication
- **Drizzle ORM**: Type-safe database queries and migrations
- **Next.js API Routes**: Server-side API endpoints
- **Zod**: Schema validation and type inference

### Frontend & UI

- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Strict type checking throughout
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Component library built on Radix UI

## Cross-References

### Related Documentation

- **[Infrastructure Setup](../infrastructure/README.md)** - Environment and deployment configuration
- **[Development Guides](../guides/README.md)** - Development workflows and best practices
- **[Testing Strategies](../testing/README.md)** - Testing architecture and patterns
- **[Component System](../components/README.md)** - UI component architecture
- **[Performance Optimization](../performance/README.md)** - Performance architecture considerations

### Implementation Guides

- **Database Setup**: [NileDB Setup](../infrastructure/niledb-setup.md)
- **Authentication Flow**: [Email Auth](../infrastructure/email-auth.md)
- **Development Workflow**: [Development Workflow](../guides/development-workflow.md)
- **Testing Patterns**: [Best Practices](../testing/best-practices.md)

## Migration and Evolution

### Completed Migrations

✅ **Feature-Sliced Design Migration** - January 2026

- 159 components analyzed and properly classified
- 151 components migrated to appropriate FSD locations
- Zero functional regressions
- Comprehensive documentation created

### Future Considerations

- **Microservices Evolution**: Potential service extraction patterns
- **Performance Optimization**: Architecture improvements for scale
- **Security Enhancements**: Advanced security patterns and practices

## Validation and Quality

The architecture is continuously validated through:

- **TypeScript Compilation**: Zero type errors
- **Import Resolution**: 100% success rate
- **Test Suite**: Comprehensive test coverage
- **Build Process**: Production build validation
- **ESLint Rules**: Architectural compliance checking

## Support and Contribution

### Getting Help

1. **Architecture questions**: Review relevant documentation in this directory
2. **Implementation guidance**: Check [Development Guides](../guides/README.md)
3. **Complex decisions**: Consult with the architecture team
4. **Pattern evolution**: Update documentation when patterns change

### Contributing to Architecture

1. **Propose changes**: Follow [Team Guidelines](../guides/team-guidelines.md)
2. **Document decisions**: Update relevant architecture documents
3. **Validate changes**: Run all validation tools
4. **Review process**: Follow [Review Processes](../maintenance/review-and-update-processes.md)

---

**Maintained by**: Architecture Team  
**Last Updated**: January 2026  
**Related**: [Documentation Guidelines](../maintenance/documentation-guidelines.md)
