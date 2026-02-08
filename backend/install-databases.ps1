# Install Database Services Script
# RIGHT-CLICK THIS FILE AND SELECT "Run with PowerShell as Administrator"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Services Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click this file and select 'Run with PowerShell as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Install MongoDB
Write-Host "Installing MongoDB..." -ForegroundColor Yellow
choco install mongodb -y
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MongoDB installed successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ MongoDB installation failed" -ForegroundColor Red
}
Write-Host ""

# Install Memurai (Redis for Windows)
Write-Host "Installing Memurai (Redis for Windows)..." -ForegroundColor Yellow
choco install memurai-developer -y
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Memurai installed successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Memurai installation failed" -ForegroundColor Red
}
Write-Host ""

# Install Elasticsearch
Write-Host "Installing Elasticsearch..." -ForegroundColor Yellow
choco install elasticsearch -y
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Elasticsearch installed successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Elasticsearch installation failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Start MongoDB
try {
    net start MongoDB
    Write-Host "✅ MongoDB service started" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  MongoDB service may need manual start" -ForegroundColor Yellow
}

# Start Memurai
try {
    net start Memurai
    Write-Host "✅ Memurai service started" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Memurai service may need manual start" -ForegroundColor Yellow
}

# Start Elasticsearch
try {
    net start elasticsearch-service-x64
    Write-Host "✅ Elasticsearch service started" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Elasticsearch service may need manual start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Waiting 5 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verify services
Write-Host ""
Write-Host "Verifying service status..." -ForegroundColor Yellow
Write-Host ""

$allRunning = $true

# Check MongoDB
try {
    $mongo = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongo.TcpTestSucceeded) {
        Write-Host "✅ MongoDB: Running on port 27017" -ForegroundColor Green
    }
    else {
        Write-Host "❌ MongoDB: Not accessible on port 27017" -ForegroundColor Red
        $allRunning = $false
    }
}
catch {
    Write-Host "❌ MongoDB: Error checking service" -ForegroundColor Red
    $allRunning = $false
}

# Check Redis
try {
    $redis = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redis.TcpTestSucceeded) {
        Write-Host "✅ Redis: Running on port 6379" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Redis: Not accessible on port 6379" -ForegroundColor Red
        $allRunning = $false
    }
}
catch {
    Write-Host "❌ Redis: Error checking service" -ForegroundColor Red
    $allRunning = $false
}

# Check Elasticsearch
try {
    $es = Test-NetConnection -ComputerName localhost -Port 9200 -WarningAction SilentlyContinue
    if ($es.TcpTestSucceeded) {
        Write-Host "✅ Elasticsearch: Running on port 9200" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Elasticsearch: Not accessible on port 9200" -ForegroundColor Red
        $allRunning = $false
    }
}
catch {
    Write-Host "❌ Elasticsearch: Error checking service" -ForegroundColor Red
    $allRunning = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allRunning) {
    Write-Host "🎉 All services are running successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create MongoDB database: mongosh" -ForegroundColor White
    Write-Host "   > use social_mongo" -ForegroundColor Gray
    Write-Host "   > db.createCollection('user_activity_logs')" -ForegroundColor Gray
    Write-Host "2. Run integration tests: mvn test -Dtest=FeatureIntegrationTest" -ForegroundColor White
}
else {
    Write-Host "⚠️  Some services failed to start" -ForegroundColor Yellow
    Write-Host "Please check the logs and try starting them manually" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
