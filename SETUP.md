# AIProxy Setup Guide

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)
- npm or yarn

## Local Development Setup

### 1. Start PostgreSQL Database

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts a PostgreSQL 16 container on port 5432 with:
- Database: `aiproxy`
- User: `postgres`
- Password: `postgres`

### 2. Configure Environment Variables

Copy the example environment file and update as needed:

```bash
cp .env.example .env
```

The `.env` file is already configured for local development with PostgreSQL.

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption (change in production)
- `RUNTIME_MODE`: Set to `mock` for local development
- `PLATFORM_ADMIN_EMAILS`: Comma-separated list of admin emails for beta launch

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This will:
- Apply the initial PostgreSQL schema
- Create all tables with proper indexes
- Set up enums and foreign keys

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Seed the Database (Optional)

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Platform Admin Configuration

Platform administrators can be configured in two ways:

### 1. Database Flag (Recommended for Production)

Set `isPlatformAdmin = true` directly in the database:

```sql
UPDATE "User" SET "isPlatformAdmin" = true WHERE email = 'admin@example.com';
```

### 2. Environment Variable (Beta Launch)

Add admin emails to `.env`:

```
PLATFORM_ADMIN_EMAILS="admin@example.com,another-admin@example.com"
```

This is useful for beta launch when you want to quickly grant admin access without database changes.

## Production Deployment

### Database Setup

1. Provision a PostgreSQL database (Supabase recommended for low-cost VPS deployments)
2. Update `DATABASE_URL` in your production environment
3. Run migrations: `npm run db:migrate:deploy`

### Environment Variables

Ensure these are set in production:
- `DATABASE_URL`: Production PostgreSQL connection string
- `SESSION_SECRET`: Strong random secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your production domain
- `RUNTIME_MODE`: Set to `production` or appropriate mode
- `RUNTIME_ENDPOINT`: Your runtime service endpoint
- `PLATFORM_ADMIN_EMAILS`: Initial admin emails (optional)

### Security Checklist

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS settings
- [ ] Review and set appropriate rate limits
- [ ] Enable database connection pooling
- [ ] Set up database backups
- [ ] Configure monitoring and logging

## Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes (dev only)
npm run db:migrate       # Create and apply migration
npm run db:migrate:deploy # Apply migrations (production)
npm run db:seed          # Seed database

# Quality
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run test             # Run tests
npm run check            # Run all checks + build
```

## Troubleshooting

### Database Connection Issues

If you see "Can't reach database server" errors:

1. Ensure PostgreSQL is running: `docker compose -f docker-compose.dev.yml ps`
2. Check connection string in `.env`
3. Verify PostgreSQL is accepting connections: `docker compose -f docker-compose.dev.yml logs postgres`

### Migration Issues

If migrations fail:

1. Check database connectivity
2. Ensure no other migrations are running
3. Review migration files in `prisma/migrations/`
4. Reset database if needed (dev only): `npx prisma migrate reset`

### Platform Admin Access

If admin features are not accessible:

1. Verify user email matches `PLATFORM_ADMIN_EMAILS` in `.env`
2. Or check `isPlatformAdmin` flag in database
3. Clear browser cookies and log in again
4. Check server logs for authorization errors
