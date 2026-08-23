# Thinkatic — AI Agency Website

A full-stack web app for Thinkatic, an AI-native digital agency. It includes a marketing/landing site, a pricing page backed by a database, and a contact/PayPal checkout flow.

## Stack

- **Frontend** (`artifacts/thinkatic`): React 19 + Vite + Tailwind CSS v4 + shadcn/ui + Three.js / GSAP / Framer Motion
- **API server** (`artifacts/api-server`): Express 5 + Drizzle ORM + PostgreSQL
- **Shared libs** (`lib/`): `db` (Drizzle schema + pool), `api-zod` (generated Zod types), `api-client-react` (generated React Query hooks), `api-spec` (Orval config)
- **Package manager**: pnpm workspaces

## Initial setup (on first import)

```bash
# Install all workspace dependencies
pnpm install

# Push the database schema (requires DATABASE_URL secret to be set)
pnpm --filter @workspace/db exec drizzle-kit push
```

Both workflows (`artifacts/thinkatic: web` and `artifacts/api-server: API Server`) start automatically after setup.

## Running locally

| Service | Workflow | Port |
|---|---|---|
| Frontend | `artifacts/thinkatic: web` | 23363 (mapped to :80) |
| API server | `artifacts/api-server: API Server` | 8080 |

Both workflows start automatically. The frontend proxies `/api/*` requests to the API server.

## Environment variables / secrets

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (currently points to Railway — see note below) |
| `PAYPAL_CLIENT_ID` | PayPal SDK client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal SDK client secret |
| `SESSION_SECRET` | Express session signing secret |

> The `DATABASE_URL` secret is configured and the schema has been pushed. The API server connects and seeds data on startup.

## Database schema

Managed with Drizzle ORM. Schema files are in `lib/db/src/schema/`. To push schema changes to the database:

```bash
pnpm --filter @workspace/db exec drizzle-kit push
```

## User preferences

_None recorded yet._
