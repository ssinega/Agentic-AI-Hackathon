# DiscoveryOS - Developer Quick Reference

## Core Application Structure

### Page Routes (Client-Side Rendered with "use client")
All pages include proper TypeScript types, error handling, and state management.

#### Auth Pages
- `/login` - Login form with email/password
- `/signup` - Registration with validation
- Both redirect to `/dashboard` on success

#### Dashboard Pages (Protected Routes)
- `/dashboard` - Overview with KPI stats
- `/dashboard/projects` - Project management
- `/dashboard/projects/[id]` - Project details
- `/dashboard/upload` - File upload interface
- `/dashboard/insights` - Insights list with filters
- `/dashboard/personas` - User personas grid
- `/dashboard/themes` - Clustered themes
- `/dashboard/opportunities` - Ranked opportunities
- `/dashboard/reports` - Reports management
- `/dashboard/chat` - AI chat interface
- `/dashboard/settings` - User preferences

---

## API Routes (Server-Side)

### Authentication (`/api/auth/`)
```typescript
POST /api/auth/register    // Create new user
POST /api/auth/login       // Authenticate user
POST /api/auth/logout      // Sign out
GET  /api/auth/me          // Get current user
```

### Projects (`/api/projects/`)
```typescript
GET  /api/projects         // List user projects
POST /api/projects         // Create project
GET  /api/projects/[id]    // Get project details
PUT  /api/projects/[id]    // Update project
DELETE /api/projects/[id]  // Delete project
```

### Documents (`/api/documents/`)
```typescript
GET  /api/documents        // List documents (with optional projectId filter)
POST /api/documents        // Create document
GET  /api/documents/[id]   // Get document details
DELETE /api/documents/[id] // Delete document
```

### Insights (`/api/insights/`)
```typescript
GET  /api/insights              // List insights with filters (projectId, type)
POST /api/insights/generate     // Generate insights from document
```

### Themes (`/api/themes/`)
```typescript
GET  /api/themes                // List themes for project
```

### Personas (`/api/personas/`)
```typescript
GET  /api/personas              // List personas for project
```

### Opportunities (`/api/opportunities/`)
```typescript
GET  /api/opportunities         // List ranked opportunities
```

### Upload (`/api/upload/`)
```typescript
POST /api/upload                // Handle file upload
```

### Reports (`/api/reports/`)
```typescript
GET  /api/reports               // List reports
POST /api/reports               // Generate new report
```

### Chat (`/api/chat/`)
```typescript
POST /api/chat                  // Send message and get response
```

### Analytics (`/api/analytics/dashboard/`)
```typescript
GET  /api/analytics/dashboard   // Get dashboard metrics
```

---

## Component Usage Examples

### Dashboard Components
```typescript
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentUploads } from "@/components/dashboard/RecentUploads";

// Usage
<StatsCard 
  icon={<Icon />}
  label="Insights"
  value={284}
  trend="+45 this week"
  trendColor="up"
/>

<TrendChart 
  title="Insights Over Time"
  data={[{ name: "Week 1", value: 45 }, ...]}
/>
```

### Insights Components
```typescript
import { InsightCard } from "@/components/insights/InsightCard";
import { FilterPanel } from "@/components/insights/FilterPanel";

<InsightCard
  content="Users want dark mode"
  type="feature_request"
  sentiment="positive"
  frequency={23}
/>
```

### Persona Components
```typescript
import { PersonaCard } from "@/components/personas/PersonaCard";
import { PersonaGrid } from "@/components/personas/PersonaGrid";

<PersonaGrid personas={personas} />
```

### Upload Components
```typescript
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { FileList } from "@/components/upload/FileList";

<FileUploadZone 
  onDrop={handleDrop}
  onFileSelect={handleFileSelect}
/>
```

### Chat Components
```typescript
import { MessageList } from "@/components/chat/MessageList";
import { InputBox } from "@/components/chat/InputBox";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";

<MessageList messages={messages} />
<InputBox onSend={handleSendMessage} />
<SuggestedPrompts 
  prompts={suggestedQuestions}
  onSelectPrompt={selectPrompt}
/>
```

---

## Data Types & Interfaces

### Core Models
```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

interface Insight {
  id: string;
  projectId: string;
  documentId: string;
  content: string;
  type: "customer_need" | "pain_point" | "feature_request" | "feedback" | "behavior";
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  frequency: number;
  createdAt: Date;
}

interface Persona {
  id: string;
  projectId: string;
  type: "primary" | "secondary" | "tertiary";
  name: string;
  description?: string;
  goals?: string;
  frustrations?: string;
  size?: "large" | "medium" | "small";
  createdAt: Date;
}

interface Theme {
  id: string;
  projectId: string;
  name: string;
  frequency: number;
  description?: string;
  relatedInsights: string[];
  createdAt: Date;
}

interface Opportunity {
  id: string;
  projectId: string;
  title: string;
  description: string;
  frequency: number;
  severity: "high" | "medium" | "low";
  confidence: number;
  score: number;
  ranking?: number;
  createdAt: Date;
}
```

---

## Utility Functions

### AI Processor (`lib/ai-processor.ts`)
```typescript
// Cluster insights into themes
clusterInsightsIntoThemes(insights: Insight[]): Theme[]

// Generate personas from insights
generatePersonasFromInsights(insights: Insight[], themes: Theme[], projectId: string): Persona[]

// Rank opportunities
rankOpportunities(insights: Insight[], projectId: string): Opportunity[]

// Calculate opportunity score
calculateOpportunityScore(opportunity: Opportunity): number

// Analyze sentiment
analyzeSentiment(text: string): "positive" | "negative" | "neutral"

// Calculate confidence
calculateConfidence(frequency: number, maxFrequency: number): number
```

### Validation (`lib/validators.ts`)
```typescript
// Auth schemas
signUpSchema      // Validates name, email, password match
loginSchema       // Validates email, password

// Resource schemas
createProjectSchema    // Validates project creation
insightSchema          // Validates insight data
personaSchema          // Validates persona data
opportunitySchema      // Validates opportunity data

// Utility schemas
paginationSchema   // Validates page, pageSize
searchSchema       // Validates query, sortBy, sortOrder
```

### Utilities (`lib/utils.ts`)
```typescript
cn()                    // Combine classNames
formatDate()            // Format date string
formatDateTime()        // Format date with time
formatFileSize()        // Human-readable file size
slugify()               // Convert to URL slug
truncate()              // Truncate text with ellipsis
getInitials()           // Get name initials
isValidEmail()          // Email validation
capitalizeWords()       // Title case text
convertToPercentage()   // Calculate percentage
generateId()            // Generate random ID
getQueryParam()         // Parse URL params
combineParams()         // Build query string
delay()                 // Async delay
```

---

## Authentication Flow

1. **Sign Up** → POST `/api/auth/register` → Verify email
2. **Login** → POST `/api/auth/login` → Get session
3. **Protected Routes** → Check session in middleware
4. **API Calls** → Include auth header
5. **Logout** → POST `/api/auth/logout`

---

## Error Handling Pattern

```typescript
// Standard API response
try {
  // Validate input
  const validated = schema.parse(body);
  
  // Process request
  const result = await database.create(validated);
  
  // Return success
  return NextResponse.json({ success: true, data: result });
} catch (error: any) {
  // Return error
  return NextResponse.json(
    { error: error.message || "Operation failed" },
    { status: 400 }
  );
}
```

---

## Form Validation Pattern

```typescript
// Client-side with React Hook Form + Zod
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// In template
{errors.email && <span>{errors.email.message}</span>}
```

---

## State Management

### Custom Hooks (in `hooks/`)
- `useAuth()` - Current user and auth methods
- `useProjects()` - Project CRUD operations
- `useInsights()` - Insight queries and generation
- `useTheme()` - Theme toggle functionality

### Component State
- Use `useState` for local component state
- Use `useCallback` for memoized callbacks
- Use `useEffect` for side effects

---

## Styling System

### Tailwind CSS
- Dark theme via CSS variables
- Gradient utilities: `from-indigo-600 to-purple-600`
- Responsive prefixes: `md:`, `lg:`, `xl:`
- Dark backgrounds: `bg-slate-800`, `bg-slate-900`
- Border colors: `border-slate-700/50`

### Color Palette
```
Primary: Indigo-600 (#6366f1)
Secondary: Purple-600 (#a855f7)
Accent: Cyan-600 (#06b6d4)
Success: Emerald-600 (#10b981)
Warning: Amber-600 (#f59e0b)
Danger: Red-600 (#ef4444)
Neutral: Slate shades
```

---

## Database Schema

View `prisma/schema.prisma` for complete schema. Key tables:
- `users` - User accounts
- `projects` - Research projects
- `documents` - Uploaded files
- `insights` - Extracted insights
- `themes` - Clustered themes
- `personas` - User personas
- `opportunities` - Product opportunities
- `reports` - Generated reports
- `chatHistory` - Chat messages

---

## Deployment Checklist

- [ ] Set environment variables
- [ ] Run database migrations
- [ ] Build and test locally
- [ ] Deploy to Vercel/production
- [ ] Verify API routes
- [ ] Test authentication flow
- [ ] Monitor error logs
- [ ] Set up analytics/monitoring

---

## Common Tasks

### Add a new page
1. Create `app/(dashboard)/newfeature/page.tsx`
2. Export default component
3. Add route to sidebar constants

### Add a new API endpoint
1. Create `app/api/resource/route.ts`
2. Implement GET/POST/PUT/DELETE
3. Add validation schemas
4. Handle errors

### Create new component
1. Create file in `components/category/Component.tsx`
2. Define TypeScript interfaces
3. Export component
4. Add to component barrel exports

### Query data from API
```typescript
const response = await fetch('/api/endpoint', {
  method: 'GET',
  headers: { 'x-user-id': userId }
});
const data = await response.json();
```

---

For more details, refer to individual file docstrings and IMPLEMENTATION_SUMMARY.md
