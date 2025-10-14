@echo off
title Dreamoda Development Tools

:MENU
cls
echo ===============================================
echo         Dreamoda Development Tools
echo ===============================================
echo.
echo 1. Deploy to Hostinger
echo 2. Verify Configuration
echo 3. Check Environment (after deployment)
echo 4. Build Frontend Only
echo 5. Sync uploads to frontend/public (for GitHub Pages)
echo 6. Exit
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" goto DEPLOY
if "%choice%"=="2" goto VERIFY_CONFIG
if "%choice%"=="3" goto CHECK_ENV
if "%choice%"=="4" goto BUILD_FRONTEND
if "%choice%"=="5" goto SYNC_UPLOADS
if "%choice%"=="6" goto EXIT
echo Invalid choice. Please try again.
pause
goto MENU

:DEPLOY
cls
echo === Deploying to Hostinger ===
echo.
call "%~dp0deploy\deploy.bat"
echo.
echo Deployment completed!
pause
goto MENU

:VERIFY_CONFIG
cls
echo === Verifying Configuration ===
echo.
php "%~dp0verify_config.php"
echo.
pause
goto MENU

:CHECK_ENV
cls
echo === Environment Check ===
echo.
echo This will open the environment check in your browser.
echo Make sure you've already deployed to Hostinger.
echo.
echo URL: https://yourdomain.com/scripts/deploy/verify_deployment.php
echo.
pause
goto MENU

:BUILD_FRONTEND
cls
echo === Building Frontend ===
echo.
cd /d "%~dp0..\frontend"
echo Installing dependencies...
call npm install
echo.
echo Building for production...
call npx vite build
echo.
echo Frontend build completed!
cd /d "%~dp0"
pause
goto MENU

::SYNC_UPLOADS
cls
echo === Syncing storage/uploads to frontend/public ===
echo.
set "PROJECT_ROOT=%~dp0..\"
set "SRC_DIR=%PROJECT_ROOT%storage\uploads"
set "DST_DIR=%PROJECT_ROOT%frontend\public\storage\uploads"
if not exist "%DST_DIR%" mkdir "%DST_DIR%"
xcopy "%SRC_DIR%\*" "%DST_DIR%\" /E /I /Y /Q
if errorlevel 1 (
  echo ERROR: Failed to copy storage/uploads into frontend/public
  pause
  goto MENU
)
echo storage/uploads synced to frontend/public
pause
goto MENU

:EXIT
echo.
echo Thank you for using Dreamoda Tools!
pause
exit
