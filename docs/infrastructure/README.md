# Infrastructure Documentation

This directory contains documentation for deploying, configuring, and managing the PenguinMails infrastructure. These guides cover database setup, email services, DNS configuration, and deployment processes.

## Quick Start

### Essential Setup

1. **[NileDB Setup](./niledb-setup.md)** - Multi-tenant database configuration
2. **[Docker NileDB](./docker-niledb.md)** - Local development database setup
3. **[Email Authentication](./email-auth.md)** - Email service configuration

## Infrastructure Components

### Database & Storage

- **[NileDB Setup](./niledb-setup.md)** - Complete NileDB configuration guide
- **[NileDB Migration Guide](./niledb-migration-guide.md)** - Database migration procedures
- **[Docker NileDB](./docker-niledb.md)** - Local development database with Docker

### Email Services

- **[Email Authentication](./email-auth.md)** - Email service authentication and configuration
- **[Loop Integration](./loop-integration.md)** - Transactional email service integration

### DNS & Domains

- **[DNS Setup](./dns-setup.md)** - Domain configuration and DNS management

## Infrastructure Architecture

### Multi-Tenant Database

PenguinMails uses NileDB for complete tenant isolation with four separate databases:

- **OLTP Database** (Port 5443) - Transactional data
- **OLAP Database** (Port 5444) - Analytics and reporting
- **Messages Database** (Port 5445) - Email content and conversations
- **Queue Database** (Port 5446) - Background job processing

### Email Infrastructure

- **Loops** - Transactional email delivery
- **Resend** - Email delivery service
- **Domain verification** - SPF, DKIM, and DMARC configuration

### Deployment Targets

- **Cloudflare Workers** - Primary edge deployment
- **Docker** - Local development environment
- **OpenNext** - Cloudflare Workers adapter

## Environment Configuration

### Development Environment

```bash
# Start local infrastructure
npm run db:start        # Start NileDB + Redis containers
docker compose up -d     # Alternative container start

# Database ports
OLTP: 5443
OLAP: 5444
Messages: 5445
Queue: 5446
Redis: 6379
```

### Production Environment

- Cloudflare Workers deployment
- NileDB cloud instances
- External email service providers

## Security Considerations

### Database Security

- Multi-tenant data isolation
- Row-level security policies
- Encrypted connections
- Access control and authentication

### Email Security

- SPF record configuration
- DKIM signing setup
- DMARC policy implementation
- Domain verification processes

## Monitoring & Maintenance

### Health Checks

- Database connectivity monitoring
- Email service status validation
- DNS resolution verification
- Performance metrics tracking

### Backup & Recovery

- Automated database backups
- Point-in-time recovery procedures
- Disaster recovery planning
- Data retention policies

## Troubleshooting

### Common Issues

- Database connection problems
- Email delivery failures
- DNS propagation delays
- SSL certificate issues

### Debugging Tools

- Container logs: `npm run db:logs`
- Database connectivity tests
- Email service diagnostics
- DNS lookup utilities

## Related Documentation

- **[Architecture Documentation](../architecture/)** - System design and database architecture
- **[Troubleshooting Guides](../troubleshooting/)** - Infrastructure problem resolution
- **[Development Guides](../guides/)** - Development workflow and environment setup

## Support Resources

For infrastructure issues:

1. Check the troubleshooting section
2. Review container logs and service status
3. Validate configuration against setup guides
4. Consult vendor documentation for external services
