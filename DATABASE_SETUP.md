# Database Setup Guide for DiscoveryOS

## Overview
This guide will help you set up the DiscoveryOS database for testing. The project uses Prisma ORM with PostgreSQL.

## Prerequisites
- Node.js (v18+)
- PostgreSQL 12+ (or SQLite as alternative)
- npm or yarn

## Step 1: Create .env.local File

Create a `.env.local` file in the project root with the following content:

### Option A: PostgreSQL (Recommended for Production/Full Testing)

```env
# Supabase Configuration
SUPABASE_URL=https://test-supabase-url.supabase.co
SUPABASE_ANON_KEY=test_supabase_anon_key_12345
SUPABASE_SERVICE_ROLE_KEY=test_supabase_service_role_key_12345

# Database - PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/discoveryos

# NextAuth / Authentication
NEXTAUTH_SECRET=test-secret-key-for-local-development-12345
NEXTAUTH_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,xlsx,csv,txt,doc

# AI & Processing
OPENAI_API_KEY=sk-test-key-placeholder-12345

# Environment
NODE_ENV=development
```

#### PostgreSQL Setup:
1. Install PostgreSQL on your system
2. Create a database:
   ```bash
   createdb discoveryos
   ```
3. Update DATABASE_URL with your PostgreSQL credentials

### Option B: SQLite (Quick Testing, No Setup Required)

```env
# Supabase Configuration
SUPABASE_URL=https://test-supabase-url.supabase.co
SUPABASE_ANON_KEY=test_supabase_anon_key_12345
SUPABASE_SERVICE_ROLE_KEY=test_supabase_service_role_key_12345

# Database - SQLite (File-based, no server needed)
DATABASE_URL=file:./prisma/test.db

# NextAuth / Authentication
NEXTAUTH_SECRET=test-secret-key-for-local-development-12345
NEXTAUTH_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,xlsx,csv,txt,doc

# AI & Processing
OPENAI_API_KEY=sk-test-key-placeholder-12345

# Environment
NODE_ENV=development
```

**Note:** SQLite is convenient for local testing but should NOT be used in production.

## Step 2: Initialize Prisma Client

After creating `.env.local`, generate the Prisma client:

```bash
npm run prisma:generate
```

This command generates the TypeScript types for your database schema.

## Step 3: Apply Database Migrations

### If migrations exist:
```bash
npx prisma migrate deploy
```

### If migrations don't exist (first time setup):
```bash
npx prisma db push
```

This command:
- Synchronizes your Prisma schema with the database
- Creates all necessary tables
- Sets up relationships and constraints

## Step 4: Verify Database Connection

Run the following command to open Prisma Studio (interactive database GUI):

```bash
npm run prisma:studio
```

This should open http://localhost:5555 in your browser, showing all your database tables.

## Step 5: Start the Development Server

```bash
npm run dev
```

The server should now start without database connection errors.

## Testing Database Connectivity

After setup, test the database with these curl commands:

```bash
# Test Projects API (requires auth header)
curl -X GET http://localhost:3000/api/projects \
  -H "x-user-id: test-user-id"

# Test Insights API
curl -X GET http://localhost:3000/api/insights

# Test Documents API
curl -X GET http://localhost:3000/api/documents

# Test Chat API (POST)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test-project","userId":"test-user","message":"test"}'
```

## Troubleshooting

### Error: `ENOENT: no such file or directory, open '.env.local'`
- Create the `.env.local` file in the project root
- Ensure DATABASE_URL is set correctly

### Error: `Client not connected to database`
- Verify DATABASE_URL is correct
- For PostgreSQL: Ensure PostgreSQL server is running and accessible
- For SQLite: Ensure the `prisma/` directory exists and is writable

### Error: `P1000: Authentication failed`
- Check PostgreSQL credentials in DATABASE_URL
- Verify PostgreSQL user and password are correct

### Error: `Migration has not been recorded in the database`
- Run `npx prisma migrate deploy --force-reset` to reset migrations
- Or use `npx prisma db push` to sync without migrations

## Common Tasks

### Reset Database (Caution: Deletes all data)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npm run prisma:migrate
```

### View Database Schema
```bash
npm run prisma:studio
```

### Generate Prisma Client (After schema changes)
```bash
npm run prisma:generate
```

## Architecture Notes

- **Prisma Client**: Singleton pattern used in `lib/prisma.ts`
- **API Routes**: All routes import from `lib/prisma.ts` to use shared client instance
- **Database**: Configured via `DATABASE_URL` environment variable
- **Schema**: Defined in `prisma/schema.prisma`

## Next Steps

1. Set up your environment variables (.env.local)
2. Generate Prisma client
3. Apply migrations
4. Start the development server
5. Test API endpoints

For more information, see DEVELOPER_GUIDE.md and IMPLEMENTATION_SUMMARY.md
