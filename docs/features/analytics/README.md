# Analytics System Architecture

## Overview

The analytics system provides comprehensive tracking and reporting capabilities across campaigns, domains, mailboxes, and templates. The system is built on domain-driven design principles with a clear separation between data collection and UI presentation.

## Core Principles

### Single Source of Truth

All analytics data flows through standardized services that ensure consistency across the application. Each metric has a single, authoritative calculation method.

### Data vs UI Separation

The analytics system maintains clear boundaries:

- **Data Layer**: NileDB-based services handle data collection, storage, and calculations
- **Service Layer**: TypeScript services provide business logic and data transformation
- **UI Layer**: React components consume processed data through standardized hooks

### Domain-Driven Design

Analytics are organized by business domain:

- **Campaign Analytics**: Campaign performance, sequence steps, lead generation
- **Domain Analytics**: Domain reputation, deliverability metrics
- **Mailbox Analytics**: Individual mailbox performance and health
- **Template Analytics**: Template usage and effectiveness

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Analytics System                         │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ├── Dashboard Components                                  │
│  ├── Analytics Cards                                       │
│  └── Chart Components                                      │
├─────────────────────────────────────────────────────────────┤
│  Service Layer (TypeScript Services)                       │
│  ├── Campaign Analytics Service                            │
│  ├── Domain Analytics Service                              │
│  ├── Mailbox Analytics Service                             │
│  └── Template Analytics Service                            │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (NileDB)                                       │
│  ├── Analytics Schemas                                     │
│  ├── Analytics Procedures                                  │
│  └── Analytics Calculations                                │
└─────────────────────────────────────────────────────────────┘
```

## Standardized Metrics

### Key Performance Indicators (KPIs)

**Campaign Metrics**:

- Open Rate: (Opens / Sent) × 100
- Click Rate: (Clicks / Sent) × 100
- Reply Rate: (Replies / Sent) × 100
- Bounce Rate: (Bounces / Sent) × 100

**Domain Metrics**:

- Domain Reputation Score: Calculated based on deliverability factors
- Deliverability Rate: (Delivered / Sent) × 100
- Spam Rate: (Spam Reports / Sent) × 100

**Mailbox Metrics**:

- Mailbox Health Score: Composite score based on multiple factors
- Send Volume: Total emails sent per time period
- Response Rate: (Responses / Sent) × 100

### Calculation Standards

All metrics follow consistent calculation patterns:

1. **Deterministic Operations**: Same inputs always produce same outputs
2. **Index-Optimized**: Calculations leverage database indexes for performance
3. **Cache-Friendly**: Results are structured for efficient caching
4. **Type-Safe**: All calculations use strongly-typed interfaces

## Navigation

### Service Documentation

- [Analytics Services Architecture](docs/architecture/README.md)
- [Service Troubleshooting](docs/guides/troubleshooting.md)
- [NileDB Setup Guide](docs/architecture/database-architecture.md)
- [NileDB Optimization](docs/architecture/database-architecture.md)

### Component Documentation

- [Analytics Components](docs/architecture/README.md)
- [Component Troubleshooting](docs/guides/troubleshooting.md)

### Type System

- [Analytics Types](docs/architecture/README.md)
- [Type System Documentation](../../architecture/type-system.md)

### Development Resources

- [Testing Strategies](docs/guides/testing-general.md)
- [Migration Lessons](docs/guides/actions-migration-lessons.md)
- [Performance Patterns](docs/architecture/database-architecture.md)

## Database Strategy

The analytics system uses a hybrid approach:

### OLTP (Online Transaction Processing)

- Real-time data collection during user interactions
- Immediate updates for campaign actions (opens, clicks, replies)
- Transactional consistency for critical operations

### OLAP (Online Analytical Processing)

- Batch processing for complex aggregations
- Historical trend analysis and reporting
- Optimized read queries for dashboard displays

## Integration Patterns

### Database Integration

The analytics system integrates with NileDB through:

- **Queries**: Read-optimized data retrieval
- **Mutations**: Transactional data updates
- **Actions**: External API integrations and complex processing

### Service Integration

Analytics services integrate with:

- **Campaign System**: Track campaign performance
- **Domain Management**: Monitor domain health
- **Mailbox Management**: Track mailbox performance
- **Template System**: Measure template effectiveness

## Performance Considerations

### Index Strategy

- Compound indexes for common query patterns
- Time-based partitioning for historical data
- Selective indexing to minimize storage overhead

### Caching Strategy

- Service-level caching for frequently accessed data
- Component-level caching for UI performance
- Invalidation strategies for real-time updates

### Query Optimization

- Batch operations for bulk data processing
- Pagination for large result sets
- Selective field retrieval to minimize data transfer

## Business Context

For business rationale and strategic context behind the analytics system, see the [Analytics Architecture](../../architecture/README.md) documentation.

## Getting Started

1. **Understanding the Architecture**: Start with [Service Architecture](docs/architecture/README.md)
2. **Setting Up Analytics**: Follow the [NileDB Setup Guide](docs/architecture/database-architecture.md)
3. **Common Issues**: Check [Troubleshooting Guide](docs/guides/troubleshooting.md)
4. **Type System**: Review [Analytics Types](docs/architecture/README.md)

## Architecture Deep Dive

For detailed system architecture information, see:

- [System Architecture](docs/architecture/database-architecture.md) - Comprehensive architectural overview
- [Service Architecture](docs/architecture/README.md) - Implementation details

## Evolution and History

For historical context and migration lessons, see:

- [Migration Lessons Learned](docs/guides/actions-migration-lessons.md)
- [Architectural Evolution](docs/architecture/database-architecture.md#evolution-and-scalability)
- [Refactoring Decisions](docs/guides/actions-migration-lessons.md#refactoring-decisions)
