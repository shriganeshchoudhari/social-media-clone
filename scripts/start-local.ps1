Write-Host "Starting Port Forwarding for Social Media Clone..."
Write-Host "Frontend will be at: http://localhost:5173"
Write-Host "Backend will be at:  http://localhost:8081"
Write-Host "pgAdmin will be at:  http://localhost:5050"
Write-Host "Prometheus will be at: http://localhost:9090"
Write-Host "Grafana will be at:    http://localhost:3000"
Write-Host "------------------------------------------------"
Write-Host "Keep this window open!"

$p1 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-backend 8081:8081 --namespace social-network" -NoNewWindow -PassThru
$p2 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-frontend 5173:5173 --namespace social-network" -NoNewWindow -PassThru
$p3 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-pgadmin 5050:80 --namespace social-network" -NoNewWindow -PassThru
$p4 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-prometheus 9090:9090 --namespace social-network" -NoNewWindow -PassThru
$p5 = Start-Process kubectl -ArgumentList "port-forward svc/social-app-grafana 3000:3000 --namespace social-network" -NoNewWindow -PassThru

Read-Host "Press Enter to stop and exit..."

Stop-Process -Id $p1.Id
Stop-Process -Id $p2.Id
Stop-Process -Id $p3.Id
Stop-Process -Id $p4.Id
Stop-Process -Id $p5.Id
