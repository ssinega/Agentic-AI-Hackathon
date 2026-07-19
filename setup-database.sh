#!/bin/bash

# DiscoveryOS Database Setup Script for Linux/macOS
# This script helps you set up the environment variables for database testing

echo "╔════════════════════════════════════════╗"
echo "║  DiscoveryOS Database Setup Script    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo ""
echo "Choose your database option:"
echo "1) SQLite (Recommended for quick testing, no setup needed)"
echo "2) PostgreSQL (For production-like testing)"
echo ""

read -p "Enter choice (1 or 2): " db_choice

ENV_CONTENT="# Supabase Configuration
SUPABASE_URL=https://test-supabase-url.supabase.co
SUPABASE_ANON_KEY=test_supabase_anon_key_12345
SUPABASE_SERVICE_ROLE_KEY=test_supabase_service_role_key_12345

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
"

if [ "$db_choice" = "1" ]; then
    echo ""
    echo "Configuring SQLite database..."
    ENV_CONTENT+=$'\n# Database - SQLite\nDATABASE_URL=file:./prisma/test.db\n'
    echo "✓ SQLite database configured (file:./prisma/test.db)"
elif [ "$db_choice" = "2" ]; then
    echo ""
    echo "Configuring PostgreSQL database..."
    echo ""
    
    read -p "PostgreSQL host (default: localhost): " pg_host
    pg_host="${pg_host:-localhost}"
    
    read -p "PostgreSQL port (default: 5432): " pg_port
    pg_port="${pg_port:-5432}"
    
    read -p "PostgreSQL user (default: postgres): " pg_user
    pg_user="${pg_user:-postgres}"
    
    read -sp "PostgreSQL password (default: password): " pg_password
    pg_password="${pg_password:-password}"
    echo ""
    
    read -p "Database name (default: discoveryos): " pg_database
    pg_database="${pg_database:-discoveryos}"
    
    database_url="postgresql://${pg_user}:${pg_password}@${pg_host}:${pg_port}/${pg_database}"
    ENV_CONTENT+=$'\n# Database - PostgreSQL\nDATABASE_URL='$database_url$'\n'
    
    echo ""
    echo "✓ PostgreSQL database configured"
    echo "  Host: $pg_host"
    echo "  Port: $pg_port"
    echo "  Database: $pg_database"
else
    echo "Invalid choice. Using SQLite by default."
    ENV_CONTENT+=$'\n# Database - SQLite\nDATABASE_URL=file:./prisma/test.db\n'
fi

# Write .env.local file
if echo "$ENV_CONTENT" > .env.local; then
    echo ""
    echo "✓ .env.local file created successfully!"
else
    echo "✗ Error creating .env.local file"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   Next Steps                           ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "1. Generate Prisma client:"
echo "   npm run prisma:generate"
echo ""
echo "2. Apply database migrations:"
echo "   npx prisma db push"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. (Optional) View database in Prisma Studio:"
echo "   npm run prisma:studio"
echo ""
echo "For more information, see DATABASE_SETUP.md"
