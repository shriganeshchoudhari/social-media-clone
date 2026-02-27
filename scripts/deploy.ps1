#!/usr/bin/env pwsh
# Deployment script for social-media-clone to kind Kubernetes cluster

param(
    [string]$Namespace = "social-media",
    [string]$ReleaseName = "social-media",
    [switch]$SkipBuild,
    [switch]$SkipLoad,
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Social Media Clone - Kubernetes Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$prerequisites = @("docker", "kubectl", "helm", "kind")
foreach ($cmd in $prerequisites) {
    if (-not (Test-Command $cmd)) {
        Write-Host "ERROR: $cmd is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ $cmd found" -ForegroundColor Green
}

# Check kind cluster
Write-Host "`nChecking kind cluster status..." -ForegroundColor Yellow
$clusterInfo = kubectl cluster-info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No Kubernetes cluster found. Please start your kind cluster." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Kubernetes cluster is running" -ForegroundColor Green

# Handle uninstall
if ($Uninstall) {
    Write-Host "`nUninstalling Helm release..." -ForegroundColor Yellow
    helm uninstall $ReleaseName -n $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Helm release uninstalled" -ForegroundColor Green
    }
    kubectl delete namespace $Namespace --ignore-not-found=true
    Write-Host "✓ Namespace deleted" -ForegroundColor Green
    exit 0
}

# Build Docker images
if (-not $SkipBuild) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Building Docker Images" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Build backend
    Write-Host "`nBuilding backend image..." -ForegroundColor Yellow
    Push-Location backend
    docker build -t social-backend:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Backend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✓ Backend image built successfully" -ForegroundColor Green
    
    # Build frontend
    Write-Host "`nBuilding frontend image..." -ForegroundColor Yellow
    Push-Location social-ui
    docker build -t social-ui:latest .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✓ Frontend image built successfully" -ForegroundColor Green
}
else {
    Write-Host "`nSkipping Docker image build..." -ForegroundColor Yellow
}

# Load images into kind
if (-not $SkipLoad) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Verifying Images" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # For Docker Desktop Kubernetes, images are already available from local Docker registry
    # For kind clusters, we would need to load images explicitly
    $clusterContext = kubectl config current-context
    
    if ($clusterContext -like "*kind*") {
        Write-Host "`nLoading backend image into kind..." -ForegroundColor Yellow
        kind load docker-image social-backend:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to load backend image" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ Backend image loaded" -ForegroundColor Green
        
        Write-Host "`nLoading frontend image into kind..." -ForegroundColor Yellow
        kind load docker-image social-ui:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to load frontend image" -ForegroundColor Red
            exit 1
        }
        Write-Host "✓ Frontend image loaded" -ForegroundColor Green
    }
    else {
        Write-Host "`nUsing Docker Desktop Kubernetes - images available from local registry" -ForegroundColor Green
        Write-Host "✓ Backend image: social-backend:latest" -ForegroundColor Green
        Write-Host "✓ Frontend image: social-ui:latest" -ForegroundColor Green
    }
}
else {
    Write-Host "`nSkipping image verification..." -ForegroundColor Yellow
}

# Deploy with Helm
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deploying with Helm" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nCreating namespace if not exists..." -ForegroundColor Yellow
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

Write-Host "`nDeploying Helm chart..." -ForegroundColor Yellow
helm upgrade --install $ReleaseName ./helm/social-media-clone `
    --namespace $Namespace `
    --create-namespace `
    --wait `
    --timeout 10m

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Helm deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Helm chart deployed successfully" -ForegroundColor Green

# Wait for pods to be ready
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Waiting for Pods to be Ready" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nWaiting for all pods to be ready (timeout: 5 minutes)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all -n $Namespace --timeout=300s

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All pods are ready" -ForegroundColor Green
}
else {
    Write-Host "WARNING: Some pods may not be ready yet" -ForegroundColor Yellow
}

# Display deployment information
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nPods:" -ForegroundColor Yellow
kubectl get pods -n $Namespace

Write-Host "`nServices:" -ForegroundColor Yellow
kubectl get services -n $Namespace

Write-Host "`nPersistent Volume Claims:" -ForegroundColor Yellow
kubectl get pvc -n $Namespace

# Get NodePort information
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Access Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$frontendPort = kubectl get service $ReleaseName-frontend -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}' 2>$null
$pgadminPort = kubectl get service $ReleaseName-pgadmin -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}' 2>$null
$prometheusPort = kubectl get service $ReleaseName-prometheus -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}' 2>$null
$grafanaPort = kubectl get service $ReleaseName-grafana -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}' 2>$null

Write-Host "`nTo access the application:" -ForegroundColor Green
Write-Host "  Frontend:   http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  pgAdmin:    http://localhost:$pgadminPort (admin@admin.com / admin)" -ForegroundColor White
Write-Host "  Prometheus: http://localhost:$prometheusPort" -ForegroundColor White
Write-Host "  Grafana:    http://localhost:$grafanaPort (admin / admin)" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  View logs:        kubectl logs -f <pod-name> -n $Namespace" -ForegroundColor White
Write-Host "  Describe pod:     kubectl describe pod <pod-name> -n $Namespace" -ForegroundColor White
Write-Host "  Port forward:     kubectl port-forward svc/$ReleaseName-backend 8081:8081 -n $Namespace" -ForegroundColor White
Write-Host "  Uninstall:        .\deploy.ps1 -Uninstall" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
