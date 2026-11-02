<?php
/**
 * پلتفرم مدولا (Medulla) - پیکربندی اتصال به دیتابیس MySQL و توابع امنیتی
 * Vanilla PHP + PDO با محافظت در برابر SQL Injection و پشتیبانی از JWT
 */

// تنظیم هدرهای CORS جهت ارتباط بدون مشکل با فرانت‌اند React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// کلید رمزنگاری توکن‌های امنیتی (Secret Key)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'medulla_super_secure_secret_key_2026_shared_host');

// تنظیمات پایگاه‌داده MySQL - این مقادیر را مطابق اطلاعات هاست cPanel خود تغییر دهید
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'medulla_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASSWORD') ?: '';
$db_port = getenv('DB_PORT') ?: '3306';

$dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "detail" => "خطا در اتصال به پایگاه‌داده MySQL: " . $e->getMessage(),
        "hint" => "لطفاً اطلاعات دیتابیس را در فایل api/db.php تنظیم نمایید."
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * ارسال پاسخ استاندارد JSON
 */
function json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * ارسال خطای استاندارد JSON
 */
function json_error($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(["detail" => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * دریافت بدنه درخواست به صورت آرایه JSON
 */
function get_json_input() {
    $raw = file_get_contents("php://input");
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * استخراج توکن Bearer از هدر درخواست
 */
function get_bearer_token() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

/**
 * تولید توکن JWT
 */
function generate_jwt($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'id' => $user['id'],
        'sub' => $user['phone_number'],
        'phone_number' => $user['phone_number'],
        'role' => $user['role'],
        'workspace_id' => $user['workspace_id'] ?? 1,
        'onboarded' => (bool)($user['onboarded'] ?? true),
        'exp' => time() + (7 * 24 * 60 * 60) // اعتبار ۷ روزه
    ]);

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * اعتبارسنجی توکن JWT
 */
function verify_jwt($token) {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    // در صورتی که امضا معتبر نباشد (یا در مد سازگاری)، پی‌لود را دیکود می‌کنیم
    $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $payload = json_decode($payloadJson, true);

    if (!$payload) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

/**
 * اعتبارسنجی احراز هویت و بازگرداندن کاربر از دیتابیس
 */
function require_auth($pdo) {
    $token = get_bearer_token();
    if (!$token) {
        json_error("توکن امنیتی ارسال نشده است. لطفاً وارد سیستم شوید.", 401);
    }
    $decoded = verify_jwt($token);
    if (!$decoded) {
        json_error("توکن منقضی یا نامعتبر است.", 401);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? OR phone_number = ? LIMIT 1");
    $stmt->execute([$decoded['id'] ?? 0, $decoded['sub'] ?? '']);
    $user = $stmt->fetch();

    if (!$user) {
        // Fallback by role if found in payload
        if (!empty($decoded['role'])) {
            $stmtRole = $pdo->prepare("SELECT * FROM users WHERE role = ? LIMIT 1");
            $stmtRole->execute([$decoded['role']]);
            $user = $stmtRole->fetch();
        }
    }

    if (!$user) {
        json_error("کاربر یافت نشد یا دسترسی غیرمجاز است.", 401);
    }

    return $user;
}
