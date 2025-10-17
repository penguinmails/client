# Convex Self-Hosting Setup Guide

## Overview
This guide explains how to **run Convex locally** using Docker, including:
- Setting up the backend and dashboard containers
- Configuring environment variables
- Generating and using the **Admin Key**
- Accessing the Convex dashboard locally

This setup allows you to run Convex **without relying on the Convex Cloud**, ideal for testing, local development, or private deployments.

---

## 🚀 1. Start Convex with Docker

Create or update your `docker-compose.yml` file with the following configuration:

```yaml
version: "3.8"

services:
  convex-backend:
    image: ghcr.io/get-convex/convex-backend:latest
    stop_grace_period: 10s
    stop_signal: SIGINT
    ports:
      - "3210:3210"
      - "3211:3211"
    volumes:
      - convex_data:/convex/data
    environment:
      - INSTANCE_NAME=local
      - INSTANCE_SECRET=my-local-secret
      - DOCUMENT_RETENTION_DELAY=172800
      - RUST_LOG=info
    healthcheck:
      test: curl -f http://localhost:3210/version
      interval: 5s
      start_period: 10s

  convex-dashboard:
    image: ghcr.io/get-convex/convex-dashboard:latest
    stop_grace_period: 10s
    stop_signal: SIGINT
    ports:
      - "6791:6791"
    environment:
      - NEXT_PUBLIC_DEPLOYMENT_URL=http://127.0.0.1:3210
    depends_on:
      convex-backend:
        condition: service_healthy

volumes:
  convex_data:
```

Start both services:

```bash
docker compose up -d
```

Once running:
- **Backend:** http://127.0.0.1:3210  
- **Dashboard:** http://127.0.0.1:6791

---

## 🔐 2. Generate the Admin Key

Inside the backend container, run:

```bash
docker compose exec convex-backend ./generate_admin_key.sh
```

Example output:

```
Generated admin key:
convex-admin-6c7a3f9d81d44b5b8a9a9a9a3ffb5f4e
```

> ⚠️ There is **no default admin key** — you must generate one manually.

If the script does not exist:

```bash
openssl rand -hex 32
```
Then prepend it with `convex-admin-`.

---

## ⚙️ 3. Configure Environment Variables (Optional)

Add to your `.env.local`:

```bash
CONVEX_SELF_HOSTED_ADMIN_KEY=convex-admin-6c7a3f9d81d44b5b8a9a9a9a3ffb5f4e
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
```

Restart services:

```bash
docker compose down
docker compose up -d
```

---

## 🖥️ 4. Access the Convex Dashboard

Open your browser and go to:  
👉 **http://127.0.0.1:6791**

Login with:
- **Deployment URL:** `http://127.0.0.1:3210`  
- **Admin Key:** (the one you generated)

---

## 🧩 5. Troubleshooting

| Problem | Possible Cause | Solution |
|----------|----------------|-----------|
| The deployment URL or admin key is invalid | Wrong or missing Admin Key | Regenerate the key and ensure it starts with `convex-admin-` |
| Dashboard can’t connect to backend | Backend not ready | Check logs: `docker compose logs convex-backend` |
| Port conflict (3210 or 6791) | Another service is using the port | Change the port mapping in `docker-compose.yml` |
| Persistent data not saving | Volume not mounted | Ensure the `convex_data` volume exists and is mounted correctly |

---

## ✅ Summary

| Component | Port | Description |
|------------|------|-------------|
| Convex Backend | 3210 | Main API server |
| Site Proxy | 3211 | Proxy used internally |
| Dashboard | 6791 | Web management interface |

---

### Example Final `.env.local`

```bash
# Convex Configuration
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=convex-admin-6c7a3f9d81d44b5b8a9a9a9a3ffb5f4e
```
