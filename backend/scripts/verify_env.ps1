# Service Verification Script
Write-Host "Checking Database Services..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check PostgreSQL
try {
    $pg = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($pg.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL: Running on port 5432" -ForegroundColor Green
    }
    else {
        Write-Host "❌ PostgreSQL: Not accessible on port 5432" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ PostgreSQL: Error checking service" -ForegroundColor Red
}

# Check MongoDB
try {
    $mongo = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($mongo.TcpTestSucceeded) {
        Write-Host "✅ MongoDB: Running on port 27017" -ForegroundColor Green
    }
    else {
        Write-Host "❌ MongoDB: Not accessible on port 27017" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ MongoDB: Error checking service" -ForegroundColor Red
}

# Check Redis
try {
    $redis = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
    if ($redis.TcpTestSucceeded) {
        Write-Host "✅ Redis: Running on port 6379" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Redis: Not accessible on port 6379" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Redis: Error checking service" -ForegroundColor Red
}

# Check Elasticsearch
try {
    $es = Test-NetConnection -ComputerName localhost -Port 9200 -WarningAction SilentlyContinue
    if ($es.TcpTestSucceeded) {
        Write-Host "✅ Elasticsearch: Running on port 9200" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Elasticsearch: Not accessible on port 9200" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Elasticsearch: Error checking service" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Verification Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PostgreSQL
Write-Host "1. PostgreSQL (User Data)" -ForegroundColor Yellow
try {
    $userCount = psql -U postgres -d socialdb -t -c "SELECT COUNT(*) FROM users;" 2>$null
    $postCount = psql -U postgres -d socialdb -t -c "SELECT COUNT(*) FROM posts;" 2>$null
    Write-Host "   Users: $($userCount.Trim())" -ForegroundColor Green
    Write-Host "   Posts: $($postCount.Trim())" -ForegroundColor Green
    
    # Show recent users
    Write-Host "   Recent users:" -ForegroundColor Cyan
    psql -U postgres -d socialdb -c "SELECT username, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;" 2>$null
}
catch {
    Write-Host "   ❌ Error connecting to PostgreSQL" -ForegroundColor Red
}
Write-Host ""

# MongoDB
Write-Host "2. MongoDB (Activity Logs)" -ForegroundColor Yellow
try {
    $logCount = mongosh --quiet --eval "use social_mongo; db.user_activity_logs.countDocuments()" 2>$null
    Write-Host "   Activity Logs: $logCount" -ForegroundColor Green
    
    # Show recent logs
    if ($logCount -gt 0) {
        Write-Host "   Recent activity:" -ForegroundColor Cyan
        mongosh --quiet --eval "use social_mongo; db.user_activity_logs.find().sort({timestamp: -1}).limit(5).forEach(printjson)" 2>$null
    }
}
catch {
    Write-Host "   ❌ Error connecting to MongoDB" -ForegroundColor Red
}
Write-Host ""

# Redis
Write-Host "3. Redis (Cache)" -ForegroundColor Yellow
try {
    $keyCount = redis-cli DBSIZE 2>$null
    $cacheKeys = redis-cli KEYS "userProfiles*" 2>$null
    Write-Host "   Total Keys: $keyCount" -ForegroundColor Green
    Write-Host "   Cached Profiles: $($cacheKeys.Count)" -ForegroundColor Green
    
    # Show cached keys
    if ($cacheKeys.Count -gt 0) {
        Write-Host "   Cached users:" -ForegroundColor Cyan
        $cacheKeys | Select-Object -First 5 | ForEach-Object {
            Write-Host "     - $_" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "   ❌ Error connecting to Redis" -ForegroundColor Red
}
Write-Host ""

# Elasticsearch
Write-Host "4. Elasticsearch (Search Index)" -ForegroundColor Yellow
try {
    $esResponse = Invoke-RestMethod -Uri "http://localhost:9200/users/_count" -Headers @{Authorization = ("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("elastic:changeme"))) } -ErrorAction Stop
    Write-Host "   Indexed Users: $($esResponse.count)" -ForegroundColor Green
    
    # Show sample indexed users
    if ($esResponse.count -gt 0) {
        Write-Host "   Sample indexed users:" -ForegroundColor Cyan
        $searchResponse = Invoke-RestMethod -Uri "http://localhost:9200/users/_search?size=5" -Headers @{Authorization = ("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("elastic:changeme"))) } -ErrorAction Stop
        $searchResponse.hits.hits | ForEach-Object {
            Write-Host "     - $($_.source.username): $($_.source.bio)" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "   ❌ Error connecting to Elasticsearch" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
