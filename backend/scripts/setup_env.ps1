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


# MongoDB Database Setup Script
Write-Host "Setting up MongoDB database for social media application..." -ForegroundColor Cyan
Write-Host ""

# Create database and collection
$mongoCommands = @"
use social_mongo
db.createCollection('user_activity_logs')
db.user_activity_logs.createIndex({ userId: 1, timestamp: -1 })
db.user_activity_logs.createIndex({ username: 1 })
print('Database social_mongo created successfully')
print('Collection user_activity_logs created with indexes')
exit
"@

# Save commands to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$mongoCommands | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Creating MongoDB database and collections..." -ForegroundColor Yellow

# Execute MongoDB commands
try {
    $result = mongosh --quiet --file $tempFile
    Write-Host $result -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ MongoDB database setup complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error setting up MongoDB database" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Verifying database creation..." -ForegroundColor Yellow

# Verify
$verifyCommands = @"
use social_mongo
db.getCollectionNames()
exit
"@

$tempFile2 = [System.IO.Path]::GetTempFileName()
$verifyCommands | Out-File -FilePath $tempFile2 -Encoding UTF8

try {
    $collections = mongosh --quiet --file $tempFile2
    Write-Host "Collections in social_mongo:" -ForegroundColor Cyan
    Write-Host $collections -ForegroundColor White
} catch {
    Write-Host "Could not verify collections" -ForegroundColor Yellow
} finally {
    Remove-Item $tempFile2 -ErrorAction SilentlyContinue
}

# Disable Elasticsearch Security for Local Development
# This script modifies the Elasticsearch configuration to disable security

Write-Host "Disabling Elasticsearch Security for Local Development..." -ForegroundColor Cyan
Write-Host ""

# Find Elasticsearch installation directory
$esPath = "C:\ProgramData\chocolatey\lib\elasticsearch\tools\elasticsearch-9.2.5"
if (-not (Test-Path $esPath)) {
    $esPath = "C:\elasticsearch"
}

if (-not (Test-Path $esPath)) {
    Write-Host "❌ Elasticsearch installation not found" -ForegroundColor Red
    Write-Host "Please specify the correct path" -ForegroundColor Yellow
    exit 1
}

$configFile = Join-Path $esPath "config\elasticsearch.yml"

if (-not (Test-Path $configFile)) {
    Write-Host "❌ elasticsearch.yml not found at: $configFile" -ForegroundColor Red
    exit 1
}

Write-Host "Found Elasticsearch config: $configFile" -ForegroundColor Green
Write-Host ""

# Backup original config
$backupFile = "$configFile.backup"
if (-not (Test-Path $backupFile)) {
    Copy-Item $configFile $backupFile
    Write-Host "✅ Created backup: $backupFile" -ForegroundColor Green
}

# Read current config
$config = Get-Content $configFile

# Check if security is already disabled
if ($config -match "xpack.security.enabled:\s*false") {
    Write-Host "✅ Security is already disabled" -ForegroundColor Green
} else {
    # Add security disable setting
    Write-Host "Adding security disable setting..." -ForegroundColor Yellow
    
    $newConfig = @"
# Disable security for local development
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl.enabled: false
xpack.security.transport.ssl.enabled: false

"@
    
    $newConfig + ($config -join "`n") | Set-Content $configFile
    Write-Host "✅ Security disabled in configuration" -ForegroundColor Green
}

Write-Host ""
Write-Host "Restarting Elasticsearch service..." -ForegroundColor Yellow

try {
    net stop elasticsearch-service-x64
    Start-Sleep -Seconds 2
    net start elasticsearch-service-x64
    Write-Host "✅ Elasticsearch service restarted" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please restart Elasticsearch service manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Waiting for Elasticsearch to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test connection
Write-Host "Testing connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9200" -UseBasicParsing
    Write-Host "✅ Elasticsearch is accessible!" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
} catch {
    Write-Host "❌ Elasticsearch is not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
