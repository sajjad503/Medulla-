@echo off
chcp 65001 >nul
title بستن سرور مدولا - ویندوز ۷
echo در حال توقف سرور مدولا...
taskkill /f /im php.exe >nul 2>&1
echo سرور با موفقیت متوقف شد.
timeout /t 2 >nul
exit
