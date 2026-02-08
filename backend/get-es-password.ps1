# Get Elasticsearch Password Script
Write-Host "Retrieving Elasticsearch Credentials..." -ForegroundColor Cyan
Write-Host ""

# Find Elasticsearch installation directory
$esPath = "C:\ProgramData\chocolatey\lib\elasticsearch\tools\elasticsearch-9.2.5"
if (-not (Test-Path $esPath)) {
    $esPath = "C:\elasticsearch"
}

if (-not (Test-Path $esPath)) {
    Write-Host "❌ Elasticsearch installation not found" -ForegroundColor Red
    Write-Host "Checking common locations..." -ForegroundColor Yellow
    
    # Check Program Files
    $programFiles = Get-ChildItem "C:\Program Files" -Directory -Filter "Elasticsearch*" -ErrorAction SilentlyContinue
    if ($programFiles) {
        $esPath = $programFiles[0].FullName
        Write-Host "Found at: $esPath" -ForegroundColor Green
    }
}

Write-Host "Elasticsearch Path: $esPath" -ForegroundColor White
Write-Host ""

# Check for password in config directory
$configPath = Join-Path $esPath "config"
Write-Host "Checking for credentials in: $configPath" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Elasticsearch Default Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Username: elastic" -ForegroundColor Green
Write-Host ""
Write-Host "To reset the password, run:" -ForegroundColor Yellow
Write-Host "  cd $esPath\bin" -ForegroundColor White
Write-Host "  .\elasticsearch-reset-password.bat -u elastic" -ForegroundColor White
Write-Host ""
Write-Host "Or to set a specific password:" -ForegroundColor Yellow
Write-Host "  .\elasticsearch-reset-password.bat -u elastic -i" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to test connection with common default passwords
Write-Host "Testing connection..." -ForegroundColor Yellow
$testPasswords = @("changeme", "elastic", "password")

foreach ($pwd in $testPasswords) {
    try {
        $pair = "elastic:$pwd"
        $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
        $base64 = [System.Convert]::ToBase64String($bytes)
        
        $headers = @{
            Authorization = "Basic $base64"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:9200" -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Connection successful with password: $pwd" -ForegroundColor Green
        Write-Host ""
        Write-Host "Add this to application.yml:" -ForegroundColor Cyan
        Write-Host "  spring:" -ForegroundColor White
        Write-Host "    elasticsearch:" -ForegroundColor White
        Write-Host "      uris: http://localhost:9200" -ForegroundColor White
        Write-Host "      username: elastic" -ForegroundColor White
        Write-Host "      password: $pwd" -ForegroundColor White
        exit 0
    } catch {
        # Continue to next password
    }
}

Write-Host "⚠️  Could not connect with default passwords" -ForegroundColor Yellow
Write-Host "Please reset the password using the command above" -ForegroundColor Yellow
