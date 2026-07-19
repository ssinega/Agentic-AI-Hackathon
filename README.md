# DiscoveryOS

Transform Customer Research into Actionable Product Intelligence.

## Overview

DiscoveryOS is a production-ready full-stack SaaS application designed for Product Managers to collect, analyze, and act on customer insights. The platform transforms raw research data into actionable intelligence through AI-powered analysis.

## Features

- **Document Upload**: Support for PDF, DOCX, XLSX, CSV, and TXT files
- **AI-Powered Analysis**: Automatic extraction of themes, personas, and opportunities
- **Insights Management**: Organize and filter customer research insights
- **Persona Detection**: AI-generated customer personas from research data
- **Theme Analysis**: Automatic clustering of related insights
- **Opportunity Ranking**: Data-driven prioritization of product opportunities
- **Report Generation**: Create comprehensive research reports
- **AI Chat Interface**: Ask questions about your research data
- **Dark/Light Theme**: Modern, responsive UI with theme support
- **Real-time Collaboration**: Project-based organization

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui with Radix UI
- **Database**: Prisma ORM, Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Visualization**: Recharts
- **API**: RESTful with Next.js API Routes
- **Form Validation**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- (Optional) OpenAI API key for enhanced AI features

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discoveryos
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then fill in your Supabase credentials and other configuration.

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
discoveryos/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── api/                      # API routes
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard-specific components
│   ├── insights/                 # Insights components
│   ├── personas/                 # Personas components
│   ├── themes/                   # Themes components
│   ├── opportunities/            # Opportunities components
│   ├── upload/                   # Upload components
│   ├── reports/                  # Reports components
│   └── chat/                     # Chat interface components
├── prisma/                       # Database schema and migrations
│   └── schema.prisma             # Prisma schema
├── lib/                          # Utility functions and helpers
│   ├── auth.ts                   # Authentication utilities
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts                  # General utilities
│   ├── validators.ts             # Input validation
│   ├── api-client.ts             # API client wrapper
│   ├── ai-processor.ts           # AI analysis logic
│   └── constants.ts              # Application constants
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── public/                       # Static files
├── styles/                       # Global styles
└── middleware.ts                 # Authentication middleware

```

## Database Schema

The application includes the following main entities:

- **User**: User accounts and profiles
- **Project**: Customer research projects
- **Document**: Uploaded research documents
- **Insight**: Extracted customer insights
- **Theme**: Clustered insights by theme
- **Persona**: AI-generated customer personas
- **Opportunity**: Ranked product opportunities
- **Report**: Generated research reports
- **ChatHistory**: AI chat conversation logs

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Management
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:reset
```

## API Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project details
- `POST /api/documents/upload` - Upload document
- `POST /api/insights` - Generate insights
- `GET /api/insights` - List insights
- `POST /api/themes` - Analyze themes
- `POST /api/personas` - Detect personas
- `POST /api/opportunities` - Rank opportunities
- `POST /api/reports/generate` - Generate report
- `POST /api/chat` - Chat with AI
- `GET /api/analytics` - Get dashboard analytics

## Configuration

All configuration is managed through environment variables in `.env.local`. See `.env.example` for available options.

## Deployment

The application can be deployed to:

- Vercel (recommended for Next.js)
- AWS, Google Cloud, Azure
- Self-hosted Docker containers

## Contributing

This is a production application for the AI Agent Hackathon. All code follows:

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component composition patterns

## License

Proprietary - AI Agent Hackathon

## Support

For issues or questions, please refer to the project documentation or contact the development team.
