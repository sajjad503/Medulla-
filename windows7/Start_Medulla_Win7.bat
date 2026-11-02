@echo off
chcp 65001 >nul
title سامانه مشاوره تحصیلی مدولا - نسخه ویندوز ۷ (Medulla Win7)
color 0B

echo ================================================================
echo    🎓 سامانه مشاوره تحصیلی و هدایت کنکور مدولا (Medulla)
echo              اجرای پلتفرم اختصاصی ویندوز ۷
echo ================================================================
echo.

cd /d "%~dp0.."

:: بررسی وجود مفسر PHP
set "PHP_CMD="

if exist "%~dp0..\php\php.exe" (
    set "PHP_CMD=%~dp0..\php\php.exe"
    goto PHP_FOUND
)

if exist "C:\xampp\php\php.exe" (
    set "PHP_CMD=C:\xampp\php\php.exe"
    goto PHP_FOUND
)

if exist "D:\xampp\php\php.exe" (
    set "PHP_CMD=D:\xampp\php\php.exe"
    goto PHP_FOUND
)

where php.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "PHP_CMD=php.exe"
    goto PHP_FOUND
)

:PHP_NOT_FOUND
echo ⚠️ مفسر PHP در سیستم شما یافت نشد!
echo.
echo برای اجرای مدولا در ویندوز ۷، کافیست یکی از دو راه زیر را انجام دهید:
echo  1) نرم‌افزار XAMPP نسخه مناسب ویندوز ۷ را باز کنید و کلید Start ماژول‌های Apache و MySQL را بزنید.
echo  2) یا پوشه php پرتابل را در کنار فایل‌های پروژه قرار دهید.
echo.
echo جهت دانلود نسخه پرتابل PHP 7.4 / 8.1 برای ویندوز ۷:
echo   https://windows.php.net/download/
echo.
pause
exit /b 1

:PHP_FOUND
echo [OK] مفسر PHP شناسایی شد: %PHP_CMD%
echo.

:: بررسی وجود پوشه بیلد فرانت‌اند
if not exist "dist\index.html" (
    echo [INFO] فایل‌های کامپایل‌شده فرانت‌اند در پوشه dist قرار دارند.
)

echo [RUN] در حال راه‌اندازی سرور داخلی مدولا روی پورت 8000...
echo [LINK] آدرس دسترسی در مرورگر: http://127.0.0.1:8000
echo.

:: بستن پردازه‌های قبلی احتمالی
taskkill /f /im php.exe >nul 2>&1

:: اجرای سرور محلی PHP در پس‌زمینه
start "Medulla_PHP_Server" /b "%PHP_CMD%" -S 127.0.0.1:8000 windows7/router.php

timeout /t 2 >nul

:: باز کردن برنامه در مرورگر در حالت اپلیکیشن دسکتاپ
echo [OPEN] در حال باز کردن برنامه مدولا در مرورگر...
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:8000
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:8000
) else if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    start "" "C:\Program Files\Mozilla Firefox\firefox.exe" http://127.0.0.1:8000
) else (
    start "" "http://127.0.0.1:8000"
)

echo.
echo ================================================================
echo ✅ مدولا با موفقیت اجرا شد!
echo برای بستن برنامه، می‌توانید این پنجره را ببندید یا فایل Stop_Medulla.bat را اجرا کنید.
echo ================================================================
echo.
pause
