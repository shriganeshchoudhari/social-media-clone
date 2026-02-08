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
