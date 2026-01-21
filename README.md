# PenguinMails Client

A modern email marketing platform built with Next.js, featuring real-time analytics, multi-tenant architecture, and edge deployment. Designed for scalability, performance, and developer experience.

## \U0001f680 Quick Start

```bash
# Install dependencies
npm install

# Start local infrastructure (NileDB + Redis)
docker compose up -d

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## \U0001f3d7\ufe0f Architecture

### Core Stack

- **Frontend**: Next.js 15 with App Router and TypeScript
- **Database**: NileDB for multi-tenant data isolation (4 separate databases: OLTP, OLAP, Messages, Queue)
- **ORM**: Drizzle ORM with PostgreSQL connections for each database
- **Cache**: Redis for analytics caching and performance optimization
- **Authentication**: NileDB integrated auth with role-based permissions
- **Deployment**: Cloudflare Workers with OpenNext adapter
- **Styling**: Tailwind CSS with shadcn/ui components

### Key Features

- **Multi-tenant Architecture**: Complete data isolation between organizations
- **Real-time Analytics**: Live campaign performance tracking and reporting
- **Edge Deployment**: Global CDN with sub-100ms response times
- **Type Safety**: End-to-end TypeScript with strict validation
- **Modern UI**: Responsive design with dark/light mode support

## \U0001f4da Documentation

### New Developer Resources

- **[Getting Started Guide](docs/getting-started.md)** - Complete onboarding for new developers
- **[Quick Reference](docs/quick-reference.md)** - Commands, patterns, and shortcuts
- **[Architecture Overview](docs/architecture/README.md)** - System design and technical foundation
- **[Development Workflow](docs/guides/development-workflow.md)** - Development processes and best practices

### Technical Documentation

- **[Component System](docs/components/README.md)** - Unified component library and design system
- **[Feature Documentation](docs/features/README.md)** - Feature-specific guides and APIs
- **[Testing Strategies](docs/testing/README.md)** - Testing approaches and best practices
- **[Infrastructure Setup](docs/infrastructure/README.md)** - Deployment and configuration guides

### Specialized Guides

- **[Troubleshooting](docs/troubleshooting/README.md)** - Common issues and debugging
- **[Performance Optimization](docs/performance/README.md)** - Bundle analysis and optimization
- **[Type System Guide](docs/architecture/type-system.md)** - TypeScript patterns and utilities

## 🛠️ Development

### Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd penguinmails-client
npm install

# Start development environment
npm run db:start    # Start NileDB + Redis containers
npm run dev         # Start development server
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

**For complete setup instructions, see the [Getting Started Guide](docs/getting-started.md).**

### Essential Commands

```bash
# Development
npm run dev              # Start development server
npm run db:start         # Start NileDB + Redis containers
npm run db:stop          # Stop containers

# Code Quality
npm run test             # Run test suite
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Building & Deployment
npm run build            # Build Next.js application
npm run deploy           # Deploy to Cloudflare Workers
```

**For complete command reference, see the [Quick Reference Guide](docs/quick-reference.md).**

### Project Structure

```
\u251c\u2500\u2500 app/                 # Next.js App Router pages and layouts
\u251c\u2500\u2500 components/          # Reusable UI components
\u251c\u2500\u2500 lib/                 # Utilities, actions, and business logic
\u2502   \u251c\u2500\u2500 actions/         # Server actions (modular architecture)
\u2502   \u251c\u2500\u2500 services/        # Business logic services
\u2502   \u2514\u2500\u2500 utils/           # Shared utilities
\u251c\u2500\u2500├── database/           # Database migrations and schemas
\u251c\u2500\u2500 types/               # TypeScript type definitions
\u251c\u2500\u2500 docs/                # Comprehensive documentation
\u2514\u2500\u2500 scripts/             # Build and maintenance scripts
```

## 🚀 Deployment

### Cloudflare Workers (Recommended)

The application is optimized for Cloudflare Workers with global edge deployment:

```bash
# Build and deploy
npm run build:open-next
npm run deploy

# Preview deployment locally
npm run preview
```

**Live Application**: https://penguin-mails.mailspenguin.workers.dev

### CI/CD Pipeline

Automated deployment via GitHub Actions:

- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests
- **Manual**: Deploy via GitHub Actions workflow

### Environment Configuration

Required environment variables:

```bash
# Cloudflare
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Database & Auth (Local Development)
NILEDB_USER=your_user_id_here
NILEDB_PASSWORD=your_password_here
NILEDB_API_URL=your_api_url_here
NILEDB_POSTGRES_URL=postgres://username:password@host:port/database

# Redis (Local Development)
REDIS_URL=redis://localhost:6379

# External Services
STRIPE_SECRET_KEY=your-stripe-key
RESEND_API_KEY=your-resend-key

# Loop Email Service (Transactional Emails)
LOOP_API_KEY=your_loop_api_key_here
LOOP_VERIFICATION_TRANSACTIONAL_ID=your_verification_id_here
LOOP_RESET_TRANSACTIONAL_ID=your_reset_id_here
LOOP_WELCOME_TRANSACTIONAL_ID=your_welcome_id_here
LOOP_NOTIFICATION_TRANSACTIONAL_ID=your_notification_id_here
```

**Database Services** (when running `docker compose up -d`):

- **OLTP Database**: Port 5443, Database: `oltp`
- **OLAP Database**: Port 5444, Database: `olap`
- **Messages Database**: Port 5445, Database: `messages`
- **Queue Database**: Port 5446, Database: `queue`
- **Redis Cache**: Port 6380, URL: `redis://localhost:6379`

For complete setup instructions, see [`docs/architecture/build-validation-and-deployment.md`](docs/architecture/build-validation-and-deployment.md).

## \U0001f4e7 Email Service Integration

### Loop Transactional Emails

The application uses Loop (loops.so) for sending transactional emails including verification, password reset, and welcome emails. This provides a reliable, scalable email delivery service separate from marketing campaigns.

#### Setup Steps

1. **Create a Loops Account**: Sign up at [loops.so](https://loops.so)

2. **Get API Key**: Navigate to Settings → API Keys in your Loops dashboard

3. **Configure Environment**: Add your API key to `.env`:

   ```bash
   LOOP_API_KEY=your-api-key-here
   ```

4. **Create Transactional Emails**: In your Loops dashboard, create the following transactional emails with these IDs:
   - **Verification Email** (ID: `verification`)
     - Variables: `{{userName}}`, `{{verificationToken}}`, `{{verificationUrl}}`
   - **Password Reset Email** (ID: `password-reset`)
     - Variables: `{{userName}}`, `{{resetToken}}`, `{{resetUrl}}`
   - **Welcome Email** (ID: `welcome`)
     - Variables: `{{userName}}`, `{{companyName}}`, `{{loginUrl}}`
   - **Notification Email** (ID: `notification`)
     - Variables: `{{userName}}`, `{{message}}`, `{{subject}}`, `{{timestamp}}`

5. **Test Integration**: Use the test endpoint to verify email sending:
   ```bash
   curl "http://localhost:3000/api/test/emails?email=test@example.com"
   ```

#### Usage in Code

```typescript
import { sendVerificationEmail } from "@/lib/actions/emailActions";
import { getLoopService } from "@/lib/services/loop";

// Send verification email
await sendVerificationEmail({
  email: "user@example.com",
  token: "verification-token",
  userName: "John Doe",
});

// Send notification email
const loopService = getLoopService();
await loopService.sendNotificationEmail(
  "user@example.com",
  "Your account has been updated successfully.",
  "Account Update Notification",
  "John Doe",
);
```

#### API Endpoints

- `POST /api/emails/send` - Send transactional emails (requires authentication)
- `POST /api/emails/notification` - Send notification emails (requires authentication)
- `GET /api/emails/notification` - Test notification email functionality
- `GET /api/test/emails` - Test email functionality

## \U0001f9ea Testing & Quality

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Full user workflow testing
- **Performance Tests**: Load testing and optimization validation

### Code Quality

- **TypeScript**: Strict type checking with zero compilation errors
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting
- **Husky**: Pre-commit hooks for quality gates

### Performance Monitoring

- **Build Performance**: Sub-15 second build times
- **Runtime Performance**: <100ms API response times
- **Bundle Analysis**: Optimized bundle sizes and tree shaking
- **Core Web Vitals**: Lighthouse performance scoring

## \U0001f91d Contributing

### Development Workflow

1. **Fork** the repository and create a feature branch
2. **Follow** the coding standards and patterns in [`docs/guides/development-workflow.md`](docs/guides/development-workflow.md)
3. **Test** your changes with `npm run test` and `npm run typecheck`
4. **Document** any new features or changes
5. **Submit** a pull request with a clear description

### Code Standards

- Use TypeScript for all new code
- Follow the established component and utility patterns
- Add tests for new functionality
- Update documentation for user-facing changes
- Ensure accessibility compliance (WCAG 2.1 AA)

## \U0001f4c4 License & Support

### Documentation Maintenance

- **Automated Validation**: Links, references, and content freshness
- **Ownership Model**: Clear responsibility assignments per feature area
- **Regular Updates**: Monthly reviews and quarterly architecture updates

### Getting Help

### TypeScript Type Analysis

The project includes a comprehensive TypeScript type analysis tool for identifying repeated types and categorizing them by architectural layers (Backend/DB vs Frontend/UI). This helps maintain clean type organization and prevents architectural drift.

#### Usage

```bash
# Analyze types in the current project
npm run type-analysis

# Analyze specific directory
npm run type-analysis -- --directory ./src/types

# Generate JSON output
npm run type-analysis -- --format json --output ./types.json

# Verbose output with detailed logging
npm run type-analysis -- --verbose
```

#### Features

- **Type Categorization**: Automatically categorizes types into Backend/DB, Frontend/UI, and Shared/Common layers
- **Conflict Detection**: Identifies exact duplicates, semantic conflicts, and naming conflicts
- **Markdown Reports**: Generates detailed reports with recommendations for consolidation
- **Performance Optimized**: Analyzes large codebases in under 5 seconds
- **CLI Interface**: Flexible command-line interface with multiple output formats

#### Report Structure

The generated report includes:

- **Summary Statistics**: Total types, conflicts, and category breakdowns
- **Type Categories**: Detailed breakdown by architectural layer
- **Conflict Analysis**: Specific conflicts with resolution strategies
- **Recommendations**: Actionable suggestions for type consolidation

For more information, see the [Type Analysis Documentation](docs/guides/type-analysis.md).

### Getting Help

- **Documentation**: Comprehensive guides in [`docs/guides/`](docs/guides/) directory
- **Troubleshooting**: Common issues in [`docs/guides/troubleshooting.md`](docs/guides/troubleshooting.md)
- **Architecture**: System design in [`docs/architecture/README.md`](docs/architecture/README.md)

Built with \u2764\ufe0f for modern email marketing workflows.
