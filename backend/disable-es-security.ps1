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
