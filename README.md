# Aiproxy

A production-ready SaaS MVP for managing AI API keys with usage analytics and cost tracking.

## Features

- **Workspace-scoped subscriptions** (Free, Starter, Pro plans)
- **API key management** with automatic usage tracking and limits
- **Multi-provider proxy** (OpenAI, Anthropic, Google AI)
- **Real-time analytics** with usage events and aggregation
- **Audit logging** for security and compliance
- **Cost tracking** with per-request token usage
- **Tier enforcement** (Free: 1 key, 10k tokens/month; Starter: 5 keys, 100k tokens; Pro: unlimited)
- Multi-user workspaces with role-based access

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key for proxying requests

3. Initialize the database:

```bash
npm run db:push
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

### API Proxy

Use your Aiproxy keys with the OpenAI SDK:

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

### API Endpoints

- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/[id]` - Revoke API key
- `GET /api/analytics` - Get usage statistics
- `POST /api/proxy/chat` - Proxy OpenAI chat completions

## Database Schema

- **User**: User accounts with email/password authentication
- **Workspace**: Multi-tenant workspaces with subscription plans (free/starter/pro)
- **ApiKey**: API keys scoped to workspaces with usage limits
- **ProviderConfig**: Encrypted provider credentials (OpenAI, Anthropic, Google)
- **UsageEvent**: Granular usage tracking (tokens, cost, latency, status)
- **AuditLog**: Security audit trail (key creation, plan changes, suspensions)

## Development

```bash
# Run development server
npm run dev

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed demo data
npm run db:seed
```

## Production Deployment

1. Set up a production PostgreSQL database
2. Configure environment variables
3. Run database migrations: `npm run db:migrate`
4. Build the application: `npm run build`
5. Start the server: `npm start`

## Next Steps

See the implementation plan in the dashboard for the next 5 priority tasks to enhance this MVP.
