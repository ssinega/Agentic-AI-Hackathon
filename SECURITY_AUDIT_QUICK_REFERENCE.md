# Security Audit - Quick Reference

## Critical Issues at a Glance

### 🔴 CRITICAL (11 issues)

| # | Issue | File | Lines | Fix |
|---|-------|------|-------|-----|
| 1 | Missing Auth - Documents GET/POST | `app/api/documents/route.ts` | 4, 21 | Add `userId` check, ownership validation |
| 2 | Missing Auth - Insights GET | `app/api/insights/route.ts` | 4 | Add authentication middleware |
| 3 | Missing Auth - Themes GET | `app/api/themes/route.ts` | 4 | Add authentication middleware |
| 4 | Missing Auth - Personas GET | `app/api/personas/route.ts` | 4 | Add authentication middleware |
| 5 | Missing Auth - Opportunities GET | `app/api/opportunities/route.ts` | 4 | Add authentication middleware |
| 6 | Missing Auth - Reports GET/POST | `app/api/reports/route.ts` | 4, 18 | Add authentication middleware |
| 7 | Missing Auth + Body Validation - Chat POST | `app/api/chat/route.ts` | 4, 6, 20 | Extract userId from session, validate body |
| 8 | Missing Validation - Documents POST | `app/api/documents/route.ts` | 26 | Validate with fileUploadSchema |
| 9 | Missing Validation - Reports POST | `app/api/reports/route.ts` | 20 | Validate projectId and title |
| 10 | Hardcoded Demo Credentials | `app/(auth)/login/page.tsx` | 14, 15, 26, 31 | Replace with env vars |
| 11 | Unsafe JSON.parse (No Try/Catch) | `app/(dashboard)/reports/page.tsx` | 50 | Wrap in try/catch |

### 🟠 HIGH (8 issues)

| # | Issue | File | Lines | Fix |
|---|-------|------|-------|-----|
| 1 | Unsafe localStorage (No Try/Catch) | `lib/storage.ts` | 50, 66 | Add try/catch around getItem/setItem |
| 2 | Unsafe localStorage (No Try/Catch) | `lib/api-client.ts` | 14 | Add try/catch around getItem |
| 3 | Unsafe localStorage (No Try/Catch) | `app/(auth)/login/page.tsx` | 28 | Add try/catch around setItem |
| 4 | Unsafe localStorage (No Try/Catch) | `app/(auth)/signup/page.tsx` | 42 | Add try/catch around setItem |
| 5 | Header Spoofing (Missing JWT) | `app/api/projects/route.ts` | 7 | Extract userId from JWT, not headers |
| 6 | Missing Promise Error Handling | `app/(dashboard)/chat/page.tsx` | 51 | Add try/catch to setTimeout |
| 7 | Missing Promise Error Handling | `app/(dashboard)/upload/page.tsx` | 59, 74 | Add try/catch to file upload |
| 8 | Auth Bypass - Demo Mode | `middleware.ts` | 27 | Remove demoAllowedRoutes check |

---

## Implementation Order

### Phase 1: CRITICAL - Remove Authentication Bypass (2 hours)
1. Remove hardcoded credentials from `login/page.tsx`
2. Remove demo mode from `middleware.ts`
3. Create proper authentication middleware
4. Extract userId from JWT token

### Phase 2: CRITICAL - Secure API Endpoints (2 hours)
1. Add authentication check to all 6 GET endpoints
2. Add authentication check to all 2 POST endpoints
3. Add ownership validation to all database queries
4. Return 401/403 for unauthorized requests

### Phase 3: CRITICAL - Add Input Validation (1 hour)
1. Validate POST body in documents endpoint
2. Validate POST body in reports endpoint
3. Validate POST body in chat endpoint
4. Use existing validator schemas

### Phase 4: HIGH - Fix Storage & Parsing (1 hour)
1. Wrap all localStorage access in try/catch
2. Wrap all JSON.parse() calls in try/catch
3. Add error recovery logic
4. Test in different environments

---

## Code Snippets

### Fix Template for API Routes

```typescript
// ❌ BEFORE
export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  const documents = await prisma.document.findMany({
    where: projectId ? { projectId } : {},
  });
  return NextResponse.json({ documents });
}

// ✅ AFTER
export async function GET(request: NextRequest) {
  try {
    // Extract userId from authenticated session
    const userId = request.headers.get("x-user-id"); // TODO: Replace with JWT
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");

    // Verify ownership
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project || project.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const documents = await prisma.document.findMany({
      where: { userId, ...(projectId && { projectId }) },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
```

### Fix Template for Body Validation

```typescript
// ❌ BEFORE
export async function POST(request: NextRequest) {
  const body = await request.json();
  const document = await prisma.document.create({
    data: body, // Raw, unvalidated!
  });
}

// ✅ AFTER
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate with schema
    const validated = fileUploadSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        ...validated,
        userId,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create document" },
      { status: 500 }
    );
  }
}
```

### Fix Template for localStorage

```typescript
// ❌ BEFORE
const token = localStorage.getItem("auth_token");

// ✅ AFTER
let token = null;
try {
  if (typeof window !== "undefined" && localStorage) {
    token = localStorage.getItem("auth_token");
  }
} catch (error) {
  console.error("Failed to retrieve auth token:", error);
}
```

### Fix Template for JSON.parse

```typescript
// ❌ BEFORE
const content = JSON.parse(report.content);

// ✅ AFTER
let content;
try {
  content = JSON.parse(report.content);
} catch (error) {
  console.error("Failed to parse report content:", error);
  showErrorMessage("Report format is invalid. Please regenerate.");
  return;
}
```

### Fix Template for Promise Error Handling

```typescript
// ❌ BEFORE
setTimeout(() => {
  const response = processChatQuery(messageText);
  setMessages((prev) => [...prev, newAssistantMessage]);
  setIsLoading(false);
}, 800);

// ✅ AFTER
try {
  const response = await processChatQuery(messageText);
  setMessages((prev) => [...prev, newAssistantMessage]);
} catch (error) {
  console.error("Chat error:", error);
  setMessages((prev) => [
    ...prev,
    {
      id: messages.length + 2,
      role: "assistant" as const,
      content: "Sorry, I encountered an error. Please try again.",
    },
  ]);
} finally {
  setIsLoading(false);
}
```

---

## Environment Variables Required

Add these to `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/discoveryos

# Authentication
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Demo mode (should be false in production)
DEMO_MODE=false

# JWT Secret (for custom auth)
JWT_SECRET=your_jwt_secret_here
```

---

## Testing Checklist

After implementing fixes:

- [ ] Try accessing `/api/documents` without auth header → Should get 401
- [ ] Try accessing `/api/chat` with spoofed userId → Should fail
- [ ] Try sending invalid JSON to POST endpoints → Should get 400
- [ ] Try creating report with corrupted JSON → Should handle gracefully
- [ ] Try accessing dashboard without login → Should redirect to /login
- [ ] Test localStorage in Node.js environment → Should not crash
- [ ] Test JSON.parse with invalid report → Should show error, not crash
- [ ] Try accessing other user's project → Should get 403
- [ ] Test all upload scenarios → Should handle errors gracefully

---

## Severity Impact Analysis

### If Not Fixed

**CRITICAL (6-24 hours to exploitation):**
- Complete data breach (all documents, insights, personas, opportunities, reports)
- User impersonation via chat
- Injection attacks via POST endpoints
- Authentication bypass via demo credentials

**HIGH (1-7 days to exploitation):**
- Application crashes under certain conditions
- Storage failures causing data loss
- Upload failures causing lost work
- Cross-user data access via header spoofing

### After Fixes

- ✅ All unauthorized access prevented
- ✅ All requests validated and authenticated
- ✅ All errors handled gracefully
- ✅ All data ownership verified
- ✅ Production-ready security posture

---

## Additional Recommendations

1. **Add Rate Limiting**
   - Prevent brute force attacks on login
   - Limit API requests per user

2. **Add Logging & Monitoring**
   - Log all authentication failures
   - Monitor for unusual access patterns
   - Alert on repeated failures

3. **Add CSRF Protection**
   - Implement CSRF tokens for state-changing operations
   - Verify referer headers

4. **Add Security Headers**
   - Content-Security-Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

5. **Regular Security Audits**
   - Review code quarterly
   - Test against OWASP Top 10
   - Penetration testing

---

## Contact

For questions or clarification on any security findings, refer to:
- SECURITY_AUDIT_REPORT.json (structured data)
- SECURITY_AUDIT_DETAILED.md (detailed descriptions)
- This file (quick reference)
