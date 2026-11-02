<?php
/**
 * پلتفرم مدولا - مسیریاب سرور داخلی PHP برای ویندوز ۷
 * Medulla Built-in Web Server Router for Windows 7 & Offline Mode
 * نحوه اجرا: php -S 127.0.0.1:8000 windows7/router.php
 */

$root = dirname(__DIR__);
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// تنظیم هدرهای CORS برای دسترسی بدون محدودیت در محیط لوکال
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. بررسی مسیرهای API، احراز هویت و پایگاه‌داده
if (preg_match('#^/(api|auth|records|subscription|sync|health)#', $uri)) {
    // بازنویسی مسیر به api/index.php
    require $root . '/api/index.php';
    exit();
}

// 2. بررسی فایل‌های استاتیک در پوشه dist یا ریشه (CSS, JS, تصاویر, آیکون‌ها)
$distFile = $root . '/dist' . $uri;
$publicFile = $root . '/public' . $uri;
$rootFile = $root . $uri;

if ($uri !== '/' && file_exists($distFile) && is_file($distFile)) {
    return false; // اجازه به سرور داخلی PHP برای سرو مستقیم فایل
}
if ($uri !== '/' && file_exists($publicFile) && is_file($publicFile)) {
    return false;
}
if ($uri !== '/' && file_exists($rootFile) && is_file($rootFile)) {
    return false;
}

// 3. برای روت‌های SPA ری‌اکت، فایل اصلی index.html را لود کن
header("Content-Type: text/html; charset=UTF-8");
if (file_exists($root . '/dist/index.html')) {
    readfile($root . '/dist/index.html');
} elseif (file_exists($root . '/index.html')) {
    readfile($root . '/index.html');
} else {
    echo "<h1>پلتفرم مدولا</h1><p>فایل‌های فرانت‌اند یافت نشد. لطفاً دستور npm run build را اجرا نمایید.</p>";
}
exit();
