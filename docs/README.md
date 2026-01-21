# PenguinMails Documentation

Welcome to the PenguinMails documentation. This directory contains comprehensive documentation for developers, administrators, and contributors working with the PenguinMails email marketing platform.

## Quick Start

- **[Getting Started](./getting-started.md)** - New developer onboarding and project setup
- **[Quick Reference](./quick-reference.md)** - Common commands, patterns, and shortcuts

## Documentation Sections

### 🏗️ [Architecture](./architecture/)

System design, technical decisions, and architectural patterns used throughout the platform.

- [Authentication](./architecture/authentication.md) - Auth system and security
- [Database Architecture](./architecture/database-architecture.md) - NileDB multi-tenant setup
- [API Routes](./architecture/api-routes.md) - API design patterns
- [Type System](./architecture/type-system.md) - TypeScript architecture

### 📚 [Guides](./guides/)

Development workflows, best practices, and step-by-step guides for common tasks.

- [Development Workflow](./guides/development-workflow.md) - Essential development processes
- [Testing General](./guides/testing-general.md) - Testing strategies and practices
- [Internationalization](./guides/internationalization.md) - i18n implementation
- [Team Guidelines](./guides/team-guidelines.md) - Collaboration standards

### 🔧 [Infrastructure](./infrastructure/)

Deployment guides, environment setup, and infrastructure configuration.

- [NileDB Setup](./infrastructure/niledb-setup.md) - Database configuration
- [Docker NileDB](./infrastructure/docker-niledb.md) - Local development setup
- [Email Auth](./infrastructure/email-auth.md) - Email service configuration
- [DNS Setup](./infrastructure/dns-setup.md) - Domain configuration

### 🧪 [Testing](./testing/)

Testing strategies, best practices, and testing framework documentation.

- [Best Practices](./testing/best-practices.md) - Testing standards and patterns
- [Developer Guide](./testing/developer-guide.md) - Testing workflow for developers
- [Migration Guide](./testing/migration-guide.md) - Testing migration strategies
- [Architectural Boundary Testing](./testing/architectural-boundary-testing.md) - System boundary tests

### 🚀 [Features](./features/)

Feature-specific documentation organized by business domain.

- [Analytics](./features/analytics/) - Analytics and reporting features
- [Auth](./features/auth/) - Authentication and user management
- [Billing](./features/billing/) - Payment and subscription features

### 🧩 [Components](./components/)

Reusable UI components, unified component system, and component development guidelines.

- [Unified Components](./components/unified-button.md) - Unified component system
- [System Health](./components/system-health.md) - Health monitoring components

### ⚡ [Performance](./performance/)

Performance monitoring, optimization guides, and bundle analysis.

- [Bundle Analysis](./performance/bundle-analysis.md) - Bundle size optimization
- [Monitoring](./performance/monitoring.md) - Performance monitoring setup
- [Optimization](./performance/optimization.md) - Performance improvement strategies

### 🔧 [Maintenance](./maintenance/)

Documentation maintenance, ownership, and review processes.

- [Documentation Guidelines](./maintenance/documentation-guidelines.md) - Standards and processes
- [Documentation Ownership](./maintenance/documentation-ownership.md) - Responsibility model
- [Review and Update Processes](./maintenance/review-and-update-processes.md) - Maintenance workflows

### 🔍 [Troubleshooting](./troubleshooting/)

Common issues, error resolution, and debugging guides.

- [TypeScript Fixes](./troubleshooting/typescript-fixes.md) - Common TypeScript issues
- [Chunk Load Error Fix](./troubleshooting/chunk-load-error-fix.md) - Build and deployment issues

### 📦 [Archive](./archive/)

Historical documents, migration artifacts, and deprecated guides.

- [Migration Documents](./archive/migration/) - FSD migration and architectural transitions
- [Temporary Fixes](./archive/temporary/) - Outdated implementation guides

## Getting Started

New to PenguinMails? Follow this recommended learning path:

### For New Developers

1. **[Getting Started Guide](./getting-started.md)** - Project setup and initial configuration
2. **[Development Workflow](./guides/development-workflow.md)** - Essential development processes
3. **[Architecture Overview](./architecture/README.md)** - System design and technical foundation
4. **[Quick Reference](./quick-reference.md)** - Common commands and patterns

### For Component Development

1. **[Component System](./components/README.md)** - Unified components and UI patterns
2. **[Testing Best Practices](./testing/best-practices.md)** - Component testing strategies
3. **[Styling Guidelines](./guides/styling-guidelines.md)** - UI development standards

### For Backend Development

1. **[NileDB Setup](./infrastructure/niledb-setup.md)** - Database configuration and setup
2. **[Authentication](./architecture/authentication.md)** - Auth system implementation
3. **[API Routes](./architecture/api-routes.md)** - API development patterns
4. **[Testing Guide](./testing/README.md)** - Backend testing strategies

### For DevOps and Infrastructure

1. **[Docker NileDB](./infrastructure/docker-niledb.md)** - Local development environment
2. **[DNS Setup](./infrastructure/dns-setup.md)** - Domain and deployment configuration
3. **[Performance Monitoring](./performance/monitoring.md)** - System monitoring setup

## Cross-References and Related Content

### Development Workflow

- [Development Workflow](./guides/development-workflow.md) ↔ [Team Guidelines](./guides/team-guidelines.md)
- [Testing Best Practices](./testing/best-practices.md) ↔ [Developer Guide](./testing/developer-guide.md)
- [Component System](./components/README.md) ↔ [Styling Guidelines](./guides/styling-guidelines.md)

### Architecture and Design

- [Database Architecture](./architecture/database-architecture.md) ↔ [NileDB Setup](./infrastructure/niledb-setup.md)
- [Authentication](./architecture/authentication.md) ↔ [Email Auth](./infrastructure/email-auth.md)
- [Type System](./architecture/type-system.md) ↔ [TypeScript Fixes](./troubleshooting/typescript-fixes.md)

### Performance and Optimization

- [Bundle Analysis](./performance/bundle-analysis.md) ↔ [Optimization](./performance/optimization.md)
- [Performance Monitoring](./performance/monitoring.md) ↔ [Analytics Features](./features/analytics/)

### Maintenance and Operations

- [Documentation Guidelines](./maintenance/documentation-guidelines.md) ↔ [Documentation Ownership](./maintenance/documentation-ownership.md)
- [Review Processes](./maintenance/review-and-update-processes.md) ↔ [Team Guidelines](./guides/team-guidelines.md)

## Documentation by Role

### Frontend Developers

- [Component System](./components/README.md)
- [Styling Guidelines](./guides/styling-guidelines.md)
- [Internationalization](./guides/internationalization.md)
- [Performance Optimization](./performance/optimization.md)

### Backend Developers

- [Database Architecture](./architecture/database-architecture.md)
- [API Routes](./architecture/api-routes.md)
- [Authentication](./architecture/authentication.md)
- [NileDB Setup](./infrastructure/niledb-setup.md)

### DevOps Engineers

- [Docker NileDB](./infrastructure/docker-niledb.md)
- [DNS Setup](./infrastructure/dns-setup.md)
- [Performance Monitoring](./performance/monitoring.md)
- [Infrastructure Overview](./infrastructure/README.md)

### Team Leads and Architects

- [Architecture Overview](./architecture/README.md)
- [Team Guidelines](./guides/team-guidelines.md)
- [Documentation Ownership](./maintenance/documentation-ownership.md)
- [Review Processes](./maintenance/review-and-update-processes.md)

## Documentation Standards

- All documentation follows markdown format with consistent structure
- Use kebab-case for file naming (e.g., `development-workflow.md`)
- Include clear headings and table of contents for longer documents
- Reference related documents with relative links
- Keep content current and archive outdated information in [Archive](./archive/)
- Follow the [Documentation Guidelines](./maintenance/documentation-guidelines.md) for quality standards

## Contributing to Documentation

When adding or updating documentation:

1. **Choose the right location** based on content type and audience
2. **Follow naming conventions** using kebab-case for consistency
3. **Update navigation** in relevant README files and this main index
4. **Cross-reference** related documents to improve discoverability
5. **Review guidelines** in [Documentation Maintenance](./maintenance/documentation-guidelines.md)
6. **Test all links** to ensure they work correctly
7. **Consider the audience** and structure content appropriately

## Finding Information

### Search Strategies

- **By topic**: Use the section-based navigation above
- **By role**: Check the "Documentation by Role" section
- **By workflow**: Follow the "Getting Started" learning paths
- **By problem**: Start with [Troubleshooting](./troubleshooting/)

### Common Searches

- **Setup issues**: [Infrastructure](./infrastructure/) → [Troubleshooting](./troubleshooting/)
- **Development patterns**: [Guides](./guides/) → [Architecture](./architecture/)
- **Component usage**: [Components](./components/) → [Testing](./testing/)
- **Performance issues**: [Performance](./performance/) → [Troubleshooting](./troubleshooting/)

## Support and Feedback

For questions about the documentation or to report issues:

- **Documentation issues**: Check [Troubleshooting](./troubleshooting/) first
- **Process questions**: Review [Team Guidelines](./guides/team-guidelines.md)
- **Ownership questions**: Consult [Documentation Ownership](./maintenance/documentation-ownership.md)
- **Content updates**: Follow [Review and Update Processes](./maintenance/review-and-update-processes.md)

---

_This documentation is maintained by the PenguinMails development team. Last updated: January 2026_
