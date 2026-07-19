# DiscoveryOS Database Setup Status Report

## Current Status

### ✅ Completed Actions

1. **Created Shared Prisma Client Instance** (`lib/prisma.ts`)
   - Implemented singleton pattern to prevent multiple client instances
   - Properly handles development/production environment
   - Includes error logging configuration

2. **Updated All API Routes**
   - `/api/projects/route.ts` ✓
   - `/api/documents/route.ts` ✓
   - `/api/insights/route.ts` ✓
   - `/api/chat/route.ts` ✓
   - `/api/personas/route.ts` ✓
   - `/api/themes/route.ts` ✓
   - `/api/opportunities/route.ts` ✓
   - `/api/reports/route.ts` ✓

   All routes now use the shared Prisma client from `lib/prisma.ts` instead of creating new instances.

3. **Created Setup Documentation**
   - `DATABASE_SETUP.md` - Comprehensive setup guide
   - `setup-database.ps1` - PowerShell setup script for Windows
   - `setup-database.sh` - Bash setup script for Linux/macOS

### 🔄 Next Steps Required

#### Step 1: Create .env.local File with Database Configuration

**Option A: Using Setup Script (Recommended)**

For Windows (PowerShell):
```powershell
.\setup-database.ps1
```

For Linux/macOS (Bash):
```bash
chmod +x setup-database.sh
./setup-database.sh
```

**Option B: Manual Setup**

Create `.env.local` in the project root with:

**For SQLite (Quick Testing):**
```env
DATABASE_URL=file:./prisma/test.db
SUPABASE_URL=https://test-supabase-url.supabase.co
SUPABASE_ANON_KEY=test_supabase_anon_key_12345
SUPABASE_SERVICE_ROLE_KEY=test_supabase_service_role_key_12345
NEXTAUTH_SECRET=test-secret-key-for-local-development-12345
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,xlsx,csv,txt,doc
OPENAI_API_KEY=sk-test-key-placeholder-12345
NODE_ENV=development
```

**For PostgreSQL (Production-like):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/discoveryos
SUPABASE_URL=https://test-supabase-url.supabase.co
SUPABASE_ANON_KEY=test_supabase_anon_key_12345
SUPABASE_SERVICE_ROLE_KEY=test_supabase_service_role_key_12345
NEXTAUTH_SECRET=test-secret-key-for-local-development-12345
NEXTAUTH_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=pdf,docx,xlsx,csv,txt,doc
OPENAI_API_KEY=sk-test-key-placeholder-12345
NODE_ENV=development
```

#### Step 2: Generate Prisma Client
```bash
npm run prisma:generate
```

This generates TypeScript types for database queries.

#### Step 3: Synchronize Database Schema
```bash
npx prisma db push
```

This creates all database tables defined in `prisma/schema.prisma`.

#### Step 4: Restart Development Server
```bash
npm run dev
```

The server should now connect to the database without errors.

#### Step 5: Test Database Connectivity

Try these API endpoints:

```bash
# Get insights (should return empty array initially)
curl http://localhost:3000/api/insights

# Get documents (should return empty array initially)
curl http://localhost:3000/api/documents

# Get themes (should return empty array initially)
curl http://localhost:3000/api/themes

# Get personas (should return empty array initially)
curl http://localhost:3000/api/personas

# Get opportunities (should return empty array initially)
curl http://localhost:3000/api/opportunities

# Get reports (should return empty array initially)
curl http://localhost:3000/api/reports

# Post to chat API (test with sample data)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test-proj","userId":"test-user","message":"test"}'
```

## Database Architecture

### Schema Overview
The application uses a relational database with the following tables:

- **users** - User accounts and profiles
- **projects** - Research projects belonging to users
- **documents** - Uploaded documents/files
- **insights** - Extracted insights from documents
- **themes** - Clustered/grouped themes from insights
- **personas** - User personas generated from insights
- **opportunities** - Product opportunities identified
- **reports** - Generated reports
- **chat_history** - Chat messages and responses

### Relationships
- Users → Projects (1:N)
- Projects → Documents, Insights, Themes, Personas, Opportunities, Reports, ChatHistory (1:N)
- Documents referenced in Insights
- All cascade delete on project deletion

## Environment Variables Configuration

### Required for Database
- `DATABASE_URL` - Connection string for PostgreSQL or SQLite

### Required for Authentication
- `NEXTAUTH_SECRET` - Secret key for session encryption
- `NEXTAUTH_URL` - Base URL of the application

### Required for APIs
- `API_BASE_URL` - Base URL for internal API calls

### Required for File Uploads
- `MAX_FILE_SIZE` - Maximum file size in bytes
- `ALLOWED_FILE_TYPES` - Comma-separated list of allowed file extensions

### Optional for AI Features
- `OPENAI_API_KEY` - OpenAI API key (optional for development)

### Supabase Configuration
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Troubleshooting

### Issue: Database connection errors in API responses

**Solution:** 
1. Verify `.env.local` file exists in project root
2. Check `DATABASE_URL` is correctly set
3. For PostgreSQL: Ensure database server is running
4. For SQLite: Ensure `prisma/` directory exists and is writable

### Issue: `P1000 - Authentication failed` with PostgreSQL

**Solution:**
1. Verify PostgreSQL username and password in DATABASE_URL
2. Check PostgreSQL server is accepting connections on specified host/port
3. Verify database exists: `createdb discoveryos`

### Issue: Prisma client not found in API routes

**Solution:**
1. Ensure `npm run prisma:generate` has been run
2. Check imports use `@/lib/prisma` not individual files
3. Rebuild Next.js: `npm run build` or restart dev server

### Issue: Migration issues

**Solution:**
1. Use `npx prisma db push` for initial setup (no migrations yet)
2. To reset: `npx prisma migrate reset` (caution: deletes data)
3. Check migration files in `prisma/migrations/` directory

## Files Modified/Created

### New Files
1. `lib/prisma.ts` - Shared Prisma client instance
2. `DATABASE_SETUP.md` - Database setup guide
3. `setup-database.ps1` - Windows setup script
4. `setup-database.sh` - Linux/macOS setup script
5. `DATABASE_SETUP_STATUS.md` - This file

### Modified Files
1. `app/api/projects/route.ts` - Updated to use shared Prisma
2. `app/api/documents/route.ts` - Updated to use shared Prisma
3. `app/api/insights/route.ts` - Updated to use shared Prisma
4. `app/api/chat/route.ts` - Updated to use shared Prisma
5. `app/api/personas/route.ts` - Updated to use shared Prisma
6. `app/api/themes/route.ts` - Updated to use shared Prisma
7. `app/api/opportunities/route.ts` - Updated to use shared Prisma
8. `app/api/reports/route.ts` - Updated to use shared Prisma

## Next Verification Steps

After completing the setup, verify:

1. ✓ Server starts without database errors
2. ✓ API endpoints respond (empty arrays expected initially)
3. ✓ No 500 errors from database connection issues
4. ✓ Prisma Studio opens and shows empty tables: `npm run prisma:studio`
5. ✓ Can create test data via API endpoints

## Summary

The backend is now configured to use a centralized Prisma client instance, eliminating multiple connection issues. All you need to do is:

1. Create `.env.local` with DATABASE_URL (see guide above)
2. Run `npm run prisma:generate`
3. Run `npx prisma db push`
4. Restart the server

The frontend should then connect properly to the database and all API endpoints should return data successfully instead of 500 errors.
