# Quick Start: Database Setup for DiscoveryOS

## TL;DR - 3 Minutes to Database Connection

### For Windows Users (PowerShell)
```powershell
.\setup-database.ps1
npm run prisma:generate
npx prisma db push
npm run dev
```

### For Mac/Linux Users (Bash)
```bash
chmod +x setup-database.sh
./setup-database.sh
npm run prisma:generate
npx prisma db push
npm run dev
```

---

## Manual Setup (If Scripts Don't Work)

### 1. Create `.env.local` in project root

**Option A - SQLite (Easiest):**
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

**Option B - PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/discoveryos
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

### 2. Initialize Database
```bash
npm run prisma:generate
npx prisma db push
```

### 3. Restart Server
```bash
npm run dev
```

---

## Verify It's Working

```bash
# Should return: {"documents":[]}
curl http://localhost:3000/api/documents
```

If you see `{"documents":[]}` → ✅ Database is connected!

---

## What Was Changed

✅ Created `lib/prisma.ts` - Centralized database client  
✅ Updated all API routes to use shared Prisma instance  
✅ Created setup scripts and documentation  

**Why**: Multiple Prisma instances were causing connection errors. Now all routes use one shared connection.

---

## API Endpoints Ready to Test

After setup, these endpoints will work:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/documents` | GET | List documents |
| `/api/documents` | POST | Upload document |
| `/api/insights` | GET | List insights |
| `/api/chat` | POST | Send chat message |
| `/api/personas` | GET | List personas |
| `/api/themes` | GET | List themes |
| `/api/opportunities` | GET | List opportunities |
| `/api/reports` | GET | List reports |

---

## Still Having Issues?

See `DATABASE_SETUP_STATUS.md` for detailed troubleshooting.

---

## Next: Full Testing

Once database is connected, test the full application with:
- Create projects
- Upload documents  
- Generate insights
- Create personas
- View reports
- Chat with AI

See `DATABASE_TESTING_REPORT.md` for complete testing checklist.
