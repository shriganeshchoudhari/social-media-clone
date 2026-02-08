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
