# DiscoveryOS Database Setup Script for Windows/PowerShell
# This script helps you set up the environment variables for database testing

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DiscoveryOS Database Setup Script    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
$envLocalPath = ".\.env.local"
if (Test-Path $envLocalPath) {
    Write-Host "⚠️  .env.local already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "Choose your database option:" -ForegroundColor Green
Write-Host "1) SQLite (Recommended for quick testing, no setup needed)" -ForegroundColor Cyan
Write-Host "2) PostgreSQL (For production-like testing)" -ForegroundColor Cyan
Write-Host ""

$dbChoice = Read-Host "Enter choice (1 or 2)"

$envContent = @"
# Supabase Configuration
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
"@

if ($dbChoice -eq "1") {
    Write-Host ""
    Write-Host "Configuring SQLite database..." -ForegroundColor Green
    $envContent += "`n# Database - SQLite`nDATABASE_URL=file:./prisma/test.db`n"
    Write-Host "✓ SQLite database configured (file:./prisma/test.db)" -ForegroundColor Green
} elseif ($dbChoice -eq "2") {
    Write-Host ""
    Write-Host "Configuring PostgreSQL database..." -ForegroundColor Green
    Write-Host ""
    
    $pgHost = Read-Host "PostgreSQL host (default: localhost)"
    if (-not $pgHost) { $pgHost = "localhost" }
    
    $pgPort = Read-Host "PostgreSQL port (default: 5432)"
    if (-not $pgPort) { $pgPort = "5432" }
    
    $pgUser = Read-Host "PostgreSQL user (default: postgres)"
    if (-not $pgUser) { $pgUser = "postgres" }
    
    $pgPassword = Read-Host "PostgreSQL password (default: password)" -AsSecureString
    $pgPasswordPlain = [System.Net.NetworkCredential]::new("", $pgPassword).Password
    if (-not $pgPasswordPlain) { $pgPasswordPlain = "password" }
    
    $pgDatabase = Read-Host "Database name (default: discoveryos)"
    if (-not $pgDatabase) { $pgDatabase = "discoveryos" }
    
    $databaseUrl = "postgresql://${pgUser}:${pgPasswordPlain}@${pgHost}:${pgPort}/${pgDatabase}"
    $envContent += "`n# Database - PostgreSQL`nDATABASE_URL=$databaseUrl`n"
    
    Write-Host ""
    Write-Host "✓ PostgreSQL database configured" -ForegroundColor Green
    Write-Host "  Host: $pgHost" -ForegroundColor Gray
    Write-Host "  Port: $pgPort" -ForegroundColor Gray
    Write-Host "  Database: $pgDatabase" -ForegroundColor Gray
} else {
    Write-Host "Invalid choice. Using SQLite by default." -ForegroundColor Yellow
    $envContent += "`n# Database - SQLite`nDATABASE_URL=file:./prisma/test.db`n"
}

# Write .env.local file
try {
    Set-Content -Path $envLocalPath -Value $envContent -Encoding UTF8
    Write-Host ""
    Write-Host "✓ .env.local file created successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Error creating .env.local file: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Next Steps                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Generate Prisma client:" -ForegroundColor Green
Write-Host "   npm run prisma:generate" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Apply database migrations:" -ForegroundColor Green
Write-Host "   npx prisma db push" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Start the development server:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. (Optional) View database in Prisma Studio:" -ForegroundColor Green
Write-Host "   npm run prisma:studio" -ForegroundColor Yellow
Write-Host ""
Write-Host "For more information, see DATABASE_SETUP.md" -ForegroundColor Cyan
