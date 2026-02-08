# Port Forward Script for Social Media Application
# This script sets up port forwarding for all services to make them accessible on localhost

Write-Host "🚀 Starting port forwarding for all services..." -ForegroundColor Green
Write-Host ""

# Frontend
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n social-media svc/social-media-frontend 5173:5173"

Start-Sleep -Seconds 2

# Backend
Write-Host "⚙️  Backend API: http://localhost:8081" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n social-media svc/social-media-backend 8081:8081"

Start-Sleep -Seconds 2

# Grafana
Write-Host "📊 Grafana: http://localhost:3000" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n social-media svc/social-media-grafana 3000:3000"

Start-Sleep -Seconds 2

# Prometheus
Write-Host "📈 Prometheus: http://localhost:9090" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n social-media svc/social-media-prometheus 9090:9090"

Start-Sleep -Seconds 2

# pgAdmin
Write-Host "🐘 pgAdmin: http://localhost:8080" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n social-media svc/social-media-pgadmin 8080:80"

Write-Host ""
Write-Host "✅ All port forwards started!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend:   http://localhost:5173"
Write-Host "   Backend:    http://localhost:8081"
Write-Host "   Grafana:    http://localhost:3000 (admin/admin)"
Write-Host "   Prometheus: http://localhost:9090"
Write-Host "   pgAdmin:    http://localhost:8080 (admin@admin.com/admin)"
Write-Host ""
Write-Host "⚠️  Keep all PowerShell windows open to maintain port forwarding" -ForegroundColor Yellow
Write-Host "   Close any window to stop that specific port forward"
Write-Host ""
