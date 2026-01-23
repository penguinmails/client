# Local Development Setup

## Quick Start

Start the complete local environment with a single command:

```bash
npm run dev:local
```

This will:

1. ✓ Create `.env.local` with default local values (if it doesn't exist)
2. ✓ Start all Docker services (NileDB + Redis)
3. ✓ Run the Next.js development server on http://localhost:3000

## What Gets Set Up

**Docker Services** (via `docker-compose.yml`):

- NileDB OLTP database on port `5443`
- NileDB OLAP database on port `5444`
- NileDB Messages database on port `5445`
- NileDB Queue database on port `5446`
- Redis cache on port `6380`

**Application**:

- Next.js dev server on http://localhost:3000

## Environment Variables

`.env.local` is created automatically with defaults for local development:

```bash
# NileDB (Local Docker Testing Containers)
NILEDB_USER=00000000-0000-7000-8000-000000000000
NILEDB_PASSWORD=password
NILEDB_API_URL=http://localhost:3005/v2/databases/01000000-0000-7000-8000-000000000000
NILEDB_POSTGRES_URL=postgres://00000000-0000-7000-8000-000000000000:password@localhost:5443/oltp

# Redis
REDIS_URL=redis://localhost:6380
```

To use custom values, edit `.env.local` after initial setup.

## Important: NILEDB_API_URL

**For Local Development:**

- Use `NILEDB_API_URL=http://localhost:3005/v2/databases/01000000-0000-7000-8000-000000000000`
- This connects to the local NileDB testing container running on port 3005
- The database ID `01000000-0000-7000-8000-000000000000` corresponds to the OLTP database

**For Production:**

- Use `NILEDB_API_URL=https://us-west-2.api.thenile.dev/v2/databases/your-db-id`
- This is for NileDB cloud (not local testing containers)
- This is only needed when using NileDB cloud (not the local testing containers)

## Useful Commands

```bash
# View Docker logs
npm run db:logs

# Stop Docker services
npm run db:stop

# Start Docker services
npm run db:start
```

## Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker ps

# View detailed logs
npm run db:logs:follow
```

### App crashes on startup

1. Verify `.env.local` exists
2. Check Docker services are running: `docker ps`
3. View logs: `npm run db:logs`

### Port already in use

```bash
# Stop existing containers
npm run db:stop

# Then restart
npm run dev:local
```

### Clean restart from scratch

```bash
# Stop and remove all containers and volumes
docker compose down -v

# Start fresh
npm run dev:local
```

## Dependencies

- Docker & Docker Compose
- Node.js 18+
- npm or yarn
