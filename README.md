# Aiproxy

Aiproxy is a SaaS control plane built to monetize `CLIProxyAPIPlus` as the runtime core. Instead of replacing the proxy engine, Aiproxy wraps workspace onboarding, provider connection, entitlement enforcement, analytics, and admin operations around isolated customer runtimes.

## Product model

- **Core runtime:** `CLIProxyAPIPlus`
- **Commercial layer:** Aiproxy web control plane
- **Runtime strategy:** hybrid pooled infrastructure with one runtime/container per workspace
- **Monetization:** fixed subscription tiers with entitlement-first activation
- **Primary journey:** signup → create workspace → connect provider → generate tenant key → make first successful call

## Features

- **Workspace-scoped subscriptions** (Free, Starter, Pro plans)
- **Runtime provisioning per workspace** using `CLIProxyAPIPlus` as core
- **Provider connection management** for all providers supported by the core runtime
- **Tenant API key management** with usage tracking and limits
- **Real-time analytics** with usage events and aggregation
- **Audit logging** for security and compliance
- **Admin/backoffice operations** for entitlement, runtime state, and support workflows

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL for production and staging
- Tailwind CSS
- Zod validation

## Getting Started

### Prerequisites

- Node.js 20 LTS
- npm
- PostgreSQL database

### Installation

1. Clone the repository and install dependencies with npm:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string

3. Create and apply your local development migration:

```bash
npm run db:migrate
```

4. Seed demo data (optional):

```bash
npm run db:seed
```

This creates 3 demo workspaces:
- **Free Tier**: Acme Corp (1 key, basic usage)
- **Starter Tier**: TechStart Inc (3 keys, moderate usage)
- **Pro Tier**: Enterprise LLC (10 keys, heavy usage with analytics)

5. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Usage

### Dashboard

The main dashboard allows you to:
- Create and manage API keys
- View usage statistics (requests, tokens, cost, latency)
- Monitor key activity and last usage times
- Revoke compromised keys

### API access model

Use your Aiproxy tenant key against the workspace runtime managed by Aiproxy. The control plane handles workspace state, provider onboarding, entitlement checks, and runtime orchestration on top of `CLIProxyAPIPlus`.

```typescript
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'your-aiproxy-key',
  baseURL: 'http://localhost:3000/api/proxy'
})

const response = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }]
})
```

### API endpoints

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/[id]` - Revoke API key
- `GET /api/analytics` - Get usage statistics
- `POST /api/proxy/chat` - Forward requests through the workspace runtime path

## Architecture notes

- The web app is the **control plane**, not the core proxy engine.
- `CLIProxyAPIPlus` remains the runtime core that executes provider-backed proxy traffic.
- Aiproxy is responsible for workspace lifecycle, entitlement enforcement, provider onboarding, analytics, and admin/backoffice workflows.

## Database schema

- **User**: User accounts with email/password authentication
- **Workspace**: Multi-tenant workspaces with subscription plans (free/starter/pro)
- **ApiKey**: API keys scoped to workspaces with usage limits
- **Runtime**: Isolated runtime/container record for each workspace
- **ProviderConnection**: Runtime/provider connectivity state for each workspace
- **UsageEvent**: Granular usage tracking (tokens, cost, latency, status)
- **Request**: Per-request analytics records for workspace and key usage
- **AuditLog**: Security audit trail (key creation, plan changes, suspensions)

## Development

This repository uses **npm** as the canonical package manager. `package-lock.json` is the source of truth for dependency resolution.

```bash
# Run development server
npm run dev

# Generate Prisma client
npm run db:generate

# Create and apply a development migration
npm run db:migrate

# Apply committed migrations in non-development environments
npm run db:migrate:deploy

# Run local type checks
npm run typecheck

# Run the current test suite
npm test

# Run the full local verification pipeline
npm run check

# Seed demo data
npm run db:seed
```

## Production Deployment

1. Set up a production PostgreSQL database
2. Configure environment variables from `.env.example`
3. Apply committed migrations: `npm run db:migrate:deploy`
4. Build the application: `npm run build`
5. Start the server: `npm start`

## Environment and database notes

- `.env` files are local-only and should not be committed.
- `prisma/dev.db` is a historical local artifact and is not part of the PostgreSQL deployment path.
- The repository currently targets PostgreSQL as the source of truth for production readiness work.

## Next steps

See:

- `docs/plans/2026-04-17-aiproxy-core-realignment-design.md`
- `docs/plans/2026-04-17-aiproxy-core-realignment-implementation.md`
