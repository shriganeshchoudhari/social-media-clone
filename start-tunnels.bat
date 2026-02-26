@echo off
SET FE_TUNNEL=socialclone5173
SET BE_TUNNEL=socialbackend8081
SET FE_PORT=5173
SET BE_PORT=8081

echo --- Initializing DevTunnels for Social Media Clone ---

:: Step 1: Configure Frontend Tunnel
echo Setting up Frontend Tunnel (%FE_TUNNEL%)...
devtunnel port show %FE_TUNNEL% -p %FE_PORT% >nul 2>&1 || devtunnel port create %FE_TUNNEL% -p %FE_PORT% --protocol http
devtunnel access create %FE_TUNNEL% -p %FE_PORT% --anonymous

:: Step 2: Configure Backend Tunnel
echo Setting up Backend Tunnel (%BE_TUNNEL%)...
devtunnel port show %BE_TUNNEL% -p %BE_PORT% >nul 2>&1 || devtunnel port create %BE_TUNNEL% -p %BE_PORT% --protocol http
devtunnel access create %BE_TUNNEL% -p %BE_PORT% --anonymous

:: Step 3: Launch Hosting in separate windows
echo Launching host windows...
start "Frontend Tunnel" cmd /k "devtunnel host %FE_TUNNEL%"
start "Backend Tunnel" cmd /k "devtunnel host %BE_TUNNEL%"

echo.
echo --- Setup Complete! ---
echo Tunnels are running in separate windows. 
echo Do not close them or the links will stop working.
pause