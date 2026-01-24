Write-Host "Starting Port Forwarding for Social Media Clone..."
Write-Host "Frontend will be at: http://localhost:5173"
Write-Host "Backend will be at:  http://localhost:8081"
Write-Host "pgAdmin will be at:  http://localhost:5050"
Write-Host "------------------------------------------------"
Write-Host "Keep this window open!"

$p1 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-backend 8081:8081 --namespace social-network" -NoNewWindow -PassThru
$p2 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-frontend 5173:5173 --namespace social-network" -NoNewWindow -PassThru
$p3 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-pgadmin 5050:80 --namespace social-network" -NoNewWindow -PassThru

Read-Host "Press Enter to stop and exit..."

Stop-Process -Id $p1.Id
Stop-Process -Id $p2.Id
Stop-Process -Id $p3.Id
