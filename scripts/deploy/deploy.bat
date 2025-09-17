@echo off
echo === Dreamoda Deployment Packager ===
echo.

REM Create clean timestamp (remove invalid characters)
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%d%%b%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set timestamp=%mydate%-%mytime%
set timestamp=%timestamp: =0%

REM Get absolute project root path
for %%i in ("%~dp0..\..") do set projectRoot=%%~fi
set scriptsDir=%projectRoot%\scripts
set tempDir=%TEMP%\dreamoda-deploy-%timestamp%
set zipPath=%scriptsDir%\dist\dreamoda-deploy-%timestamp%.zip

echo Project Root: %projectRoot%
echo Temp Directory: %tempDir%
echo Output ZIP: %zipPath%
echo.

echo Creating directories...
if not exist "%tempDir%" mkdir "%tempDir%"
if not exist "%scriptsDir%\dist" mkdir "%scriptsDir%\dist"

REM Verify critical directories exist
if not exist "%projectRoot%\backend" (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

echo [1/4] Copying backend files...
xcopy "%projectRoot%\backend" "%tempDir%\backend\" /E /I /Y /Q
if errorlevel 1 (
    echo ERROR: Failed to copy backend files
    goto :cleanup_and_exit
)

echo [2/4] Copying frontend build files...
if exist "%projectRoot%\frontend\dist" (
    xcopy "%projectRoot%\frontend\dist\*" "%tempDir%\" /E /Y /Q
    if errorlevel 1 (
        echo ERROR: Failed to copy frontend build files
        goto :cleanup_and_exit
    )
    echo   Frontend build files copied successfully
) else (
    echo   WARNING: Frontend dist directory not found - run 'npx vite build' first
)

echo [3/4] Copying configuration files...
set configCount=0
if exist "%projectRoot%\.htaccess" (
    copy "%projectRoot%\.htaccess" "%tempDir%\" /Y >nul
    set /a configCount+=1
    echo   .htaccess copied
)
echo   %configCount% configuration files copied

echo.
echo [4/4] Creating deployment ZIP file...
powershell -command "Add-Type -AssemblyName System.IO.Compression.FileSystem; try { [System.IO.Compression.ZipFile]::CreateFromDirectory('%tempDir%', '%zipPath%'); Write-Host 'ZIP file created successfully' } catch { Write-Host 'ERROR: Failed to create ZIP file -' $_.Exception.Message; exit 1 }"

if errorlevel 1 (
    echo ERROR: ZIP creation failed
    goto :cleanup_and_exit
)

REM Get file size
for %%A in ("%zipPath%") do set fileSize=%%~zA
set /a fileSizeMB=%fileSize%/1024/1024

echo Cleaning up temporary files...
rmdir /S /Q "%tempDir%" 2>nul

echo.
echo ===== DEPLOYMENT PACKAGE CREATED SUCCESSFULLY =====
echo File: %zipPath%
echo Size: %fileSizeMB% MB (%fileSize% bytes)
echo.
echo Package Contents:
echo - Backend API (PHP + Environment Adapter)
echo - Frontend Application (React Build + Assets)
echo - Configuration Files (.htaccess)
echo.
echo ===== NEXT STEPS =====
echo 1. Login to Hostinger hPanel
echo 2. Go to File Manager ^> public_html
echo 3. Upload the ZIP file above
echo 4. Extract files to root directory
echo 5. Visit: https://yourdomain.com/scripts/deploy/verify_deployment.php
echo.
echo Ready to upload to Hostinger!
echo.
@REM pause
goto :end

:cleanup_and_exit
echo.
echo Cleaning up due to error...
if exist "%tempDir%" rmdir /S /Q "%tempDir%" 2>nul
echo Deployment failed!
@REM pause
exit /b 1

:end