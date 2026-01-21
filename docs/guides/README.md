# Development Guides

This directory contains comprehensive guides for developers working with PenguinMails, covering development workflows, best practices, and step-by-step instructions for common tasks.

## Navigation

← [Back to Documentation Home](../README.md)

## Essential Guides

### 🚀 Getting Started

- **[Development Workflow](./development-workflow.md)** - Core development processes and Git workflow
- **[Team Guidelines](./team-guidelines.md)** - Collaboration standards and code review practices
- **[Troubleshooting](./troubleshooting.md)** - General troubleshooting approaches and common issues

### 🏗️ Architecture & Patterns

- **[Import Path Validation](./import-path-validation.md)** - Module import standards and validation
- **[Type Analysis](./type-analysis.md)** - TypeScript type system analysis
- **[Type Documentation](./type-documentation.md)** - Type definition documentation standards
- **[Domain Conflict Resolution](./domain-conflict-resolution.md)** - Resolving domain-related conflicts

### 🔧 Development Tools & Quality

- **[ESLint and CI Optimizations](./eslint-and-ci-optimizations.md)** - Linting configuration and CI/CD improvements
- **[Lint Cleanup](./lint-cleanup.md)** - Code quality maintenance and cleanup strategies
- **[Things to Avoid](./things-to-avoid.md)** - Common pitfalls and anti-patterns

### 🌐 API Development

- **[Actions API](./actions-api.md)** - Server actions implementation patterns
- **[Actions Best Practices](./actions-best-practices.md)** - Best practices for server actions
- **[Actions Migration Lessons](./actions-migration-lessons.md)** - Lessons learned from API migrations

### 🎨 UI & Frontend

- **[Styling Guidelines](./styling-guidelines.md)** - CSS and component styling standards
- **[UI Primitive Detection Fix](./ui-primitive-detection-fix.md)** - UI component troubleshooting
- **[Internationalization](./internationalization.md)** - i18n implementation and best practices

### 🧪 Testing & Quality Assurance

- **[Testing General](./testing-general.md)** - General testing strategies and approaches
- **[Testing Legacy](./testing-legacy.md)** - Legacy code testing strategies

### ⚙️ Feature Development

- **[Feature Flags](./feature-flags.md)** - Feature flag implementation and management
- **[Settings Integration Lessons](./settings-integration-lessons.md)** - Settings feature integration patterns

### 📚 Documentation & Process

- **[Documentation Maintenance](./documentation-maintenance.md)** - Documentation upkeep and standards
- **[Documentation Ownership](./documentation-ownership.md)** - Documentation responsibility and ownership model

## Quick Navigation by Role

### For New Developers

1. **[Development Workflow](./development-workflow.md)** - Start here for essential processes
2. **[Team Guidelines](./team-guidelines.md)** - Understand collaboration standards
3. **[Styling Guidelines](./styling-guidelines.md)** - Learn UI development patterns
4. **[Testing General](./testing-general.md)** - Understand testing approaches

### For Frontend Developers

- **[Styling Guidelines](./styling-guidelines.md)** ↔ [Component System](../components/README.md)
- **[Internationalization](./internationalization.md)** ↔ [Feature Development](../features/README.md)
- **[UI Primitive Detection Fix](./ui-primitive-detection-fix.md)** ↔ [Troubleshooting](../troubleshooting/README.md)

### For Backend Developers

- **[Actions API](./actions-api.md)** ↔ [API Routes](../architecture/api-routes.md)
- **[Actions Best Practices](./actions-best-practices.md)** ↔ [Authentication](../architecture/authentication.md)
- **[Type Analysis](./type-analysis.md)** ↔ [Type System](../architecture/type-system.md)

### For Team Leads

- **[Team Guidelines](./team-guidelines.md)** ↔ [Documentation Ownership](./documentation-ownership.md)
- **[Development Workflow](./development-workflow.md)** ↔ [Review Processes](../maintenance/review-and-update-processes.md)
- **[ESLint and CI Optimizations](./eslint-and-ci-optimizations.md)** ↔ [Performance Monitoring](../performance/monitoring.md)

## Cross-References

### Architecture Integration

- **[Import Path Validation](./import-path-validation.md)** ↔ [Import Path Conventions](../architecture/import-path-conventions.md)
- **[Type Documentation](./type-documentation.md)** ↔ [Type System](../architecture/type-system.md)
- **[Actions API](./actions-api.md)** ↔ [API Routes](../architecture/api-routes.md)

### Testing Integration

- **[Testing General](./testing-general.md)** ↔ [Best Practices](../testing/best-practices.md)
- **[Testing Legacy](./testing-legacy.md)** ↔ [Migration Guide](../testing/migration-guide.md)

### Infrastructure Integration

- **[Development Workflow](./development-workflow.md)** ↔ [NileDB Setup](../infrastructure/niledb-setup.md)
- **[ESLint and CI Optimizations](./eslint-and-ci-optimizations.md)** ↔ [Docker NileDB](../infrastructure/docker-niledb.md)

### Performance Integration

- **[Actions Best Practices](./actions-best-practices.md)** ↔ [Performance Optimization](../performance/optimization.md)
- **[Styling Guidelines](./styling-guidelines.md)** ↔ [Bundle Analysis](../performance/bundle-analysis.md)

## Guide Usage Patterns

### Problem-Solving Workflow

1. **Identify the issue** - Check [Troubleshooting](./troubleshooting.md)
2. **Find relevant guide** - Use role-based navigation above
3. **Apply best practices** - Follow established patterns
4. **Validate solution** - Use testing and quality guides

### Development Workflow Integration

1. **Setup** - [Development Workflow](./development-workflow.md)
2. **Code** - Role-specific guides (Frontend/Backend)
3. **Test** - [Testing guides](../testing/README.md)
4. **Review** - [Team Guidelines](./team-guidelines.md)
5. **Deploy** - [Infrastructure guides](../infrastructure/README.md)

## Contributing to Guides

### Creating New Guides

1. **Identify the need** - Is there a gap in current documentation?
2. **Choose the right category** - Follow the structure above
3. **Use practical examples** - Include code snippets and real scenarios
4. **Cross-reference** - Link to related documentation
5. **Follow standards** - Use [Documentation Guidelines](../maintenance/documentation-guidelines.md)

### Updating Existing Guides

1. **Check for accuracy** - Ensure information is current
2. **Improve clarity** - Simplify complex explanations
3. **Add cross-references** - Link to new related content
4. **Update examples** - Keep code samples current
5. **Follow review process** - Use [Review Processes](../maintenance/review-and-update-processes.md)

## Related Documentation

### Core Architecture

- **[Architecture Overview](../architecture/README.md)** - System design and technical decisions
- **[Database Architecture](../architecture/database-architecture.md)** - Data layer design
- **[Authentication](../architecture/authentication.md)** - Security architecture

### Implementation Resources

- **[Testing Documentation](../testing/README.md)** - Comprehensive testing strategies
- **[Infrastructure Guides](../infrastructure/README.md)** - Deployment and environment setup
- **[Component System](../components/README.md)** - UI component architecture
- **[Performance Optimization](../performance/README.md)** - Performance best practices

### Process Documentation

- **[Maintenance Guidelines](../maintenance/README.md)** - Documentation maintenance processes
- **[Troubleshooting Resources](../troubleshooting/README.md)** - Problem resolution guides

---

**Maintained by**: Development Team  
**Last Updated**: January 2026  
**Related**: [Team Guidelines](./team-guidelines.md) | [Documentation Guidelines](../maintenance/documentation-guidelines.md)
