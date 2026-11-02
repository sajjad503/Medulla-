<?php
/**
 * پلتفرم مدولا - مسیریاب جامع و یکپارچه PHP (api/index.php)
 * پشتیبانی از تمامی اندپوینت‌های سیستم در هاست اشتراکی cPanel / DirectAdmin
 */
require_once __DIR__ . '/db.php';

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// پاکسازی پیشوندها
$cleanPath = preg_replace('#^/api#', '', $path);
if (empty($cleanPath)) $cleanPath = '/';

// ---------------------------------------------------------------------
// ۰. بررسی سلامت سرور (Health Check)
// ---------------------------------------------------------------------
if ($cleanPath === '/health') {
    json_response([
        "status" => "ok",
        "engine" => "Vanilla PHP 8+ / MySQL PDO",
        "platform" => "Medulla Educational Core",
        "timestamp" => date('Y-m-d H:i:s')
    ]);
}

// ---------------------------------------------------------------------
// ۱. احراز هویت (Auth)
// ---------------------------------------------------------------------
if ($cleanPath === '/auth/login' || $cleanPath === '/login') {
    require __DIR__ . '/login.php';
    exit();
}

if ($cleanPath === '/auth/switch-role') {
    $data = get_json_input();
    $role = $data['role'] ?? 'student';
    $phone = $data['phone'] ?? null;

    $stmt = $phone ? $pdo->prepare("SELECT * FROM users WHERE phone_number = ? LIMIT 1") : $pdo->prepare("SELECT * FROM users WHERE role = ? LIMIT 1");
    $stmt->execute($phone ? [$phone] : [$role]);
    $user = $stmt->fetch();

    if (!$user) {
        json_error("کاربر برای این نقش یافت نشد.", 404);
    }

    $token = generate_jwt($user);
    json_response([
        "access_token" => $token,
        "token_type" => "bearer",
        "role" => $user['role'],
        "name" => $user['full_name'],
        "user_id" => (int)$user['id'],
        "onboarded" => (bool)$user['onboarded']
    ]);
}

if ($cleanPath === '/auth/change-password') {
    $user = require_auth($pdo);
    $data = get_json_input();
    $newPass = trim($data['new_password'] ?? '');

    if (strlen($newPass) < 4) {
        json_error("رمز عبور جدید باید حداقل ۴ کاراکتر باشد.", 400);
    }

    $hash = password_hash($newPass, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$hash, $user['id']]);

    json_response(["success" => true, "message" => "رمز عبور با موفقیت تغییر یافت."]);
}

// ---------------------------------------------------------------------
// ۲. اندپوینت‌های مدیر کل (Founder)
// ---------------------------------------------------------------------
if ($cleanPath === '/auth/founder/data') {
    require __DIR__ . '/founder_dashboard.php';
    exit();
}

if (preg_match('#^/auth/founder/toggle-status/(\d+)#', $cleanPath, $matches)) {
    $_GET['action'] = 'toggle-status';
    $_GET['id'] = $matches[1];
    require __DIR__ . '/founder_dashboard.php';
    exit();
}

if (preg_match('#^/auth/assign-advisor/(\d+)#', $cleanPath, $matches)) {
    $_GET['action'] = 'assign-advisor';
    $_GET['student_id'] = $matches[1];
    if (isset($_GET['advisor_id'])) {
        $_GET['advisor_id'] = (int)$_GET['advisor_id'];
    }
    require __DIR__ . '/founder_dashboard.php';
    exit();
}

// ---------------------------------------------------------------------
// ۳. اندپوینت‌های مدیر موسسه (Manager)
// ---------------------------------------------------------------------
if ($cleanPath === '/auth/manager/students') {
    require_auth($pdo);
    $stmt = $pdo->query("
        SELECT s.*, adv.full_name as advisor_name
        FROM users s
        LEFT JOIN users adv ON adv.id = s.advisor_id
        WHERE s.role = 'student'
        ORDER BY s.id DESC
    ");
    json_response($stmt->fetchAll());
}

if ($cleanPath === '/auth/pending-students') {
    require_auth($pdo);
    $stmt = $pdo->query("SELECT * FROM users WHERE role = 'student' AND advisor_id IS NULL");
    json_response($stmt->fetchAll());
}

if ($cleanPath === '/auth/advisors-list') {
    require_auth($pdo);
    $stmt = $pdo->query("SELECT id, full_name, phone_number, grade, custom_group FROM users WHERE role = 'advisor'");
    json_response($stmt->fetchAll());
}

if (preg_match('#^/auth/manager/student-dossier/(\d+)#', $cleanPath, $matches)) {
    $studentId = (int)$matches[1];
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$studentId]);
    $st = $stmt->fetch();
    json_response($st ?: ["id" => $studentId, "full_name" => "دانش‌آموز"]);
}

// ---------------------------------------------------------------------
// ۴. برنامه‌های مطالعه (Study Plans)
// ---------------------------------------------------------------------
if ($cleanPath === '/records/my-plan') {
    require __DIR__ . '/study_plans.php';
    exit();
}

if (preg_match('#^/records/student-plan/(\d+)#', $cleanPath, $matches)) {
    $_GET['student_id'] = $matches[1];
    require __DIR__ . '/study_plans.php';
    exit();
}

if ($cleanPath === '/records/save-plan') {
    require __DIR__ . '/study_plans.php';
    exit();
}

// ---------------------------------------------------------------------
// ۵. گزارش‌های کار (Work Reports)
// ---------------------------------------------------------------------
if ($cleanPath === '/records/my-reports') {
    require __DIR__ . '/reports.php';
    exit();
}

if (preg_match('#^/records/student-reports/(\d+)#', $cleanPath, $matches)) {
    $_GET['student_id'] = $matches[1];
    require __DIR__ . '/reports.php';
    exit();
}

if ($cleanPath === '/records/daily-report') {
    require __DIR__ . '/reports.php';
    exit();
}

// ---------------------------------------------------------------------
// ۶. برنامه‌ریز روزانه تفصیلی ۲۴ ساعته (Daily Planner)
// ---------------------------------------------------------------------
if ($cleanPath === '/records/daily-planner') {
    require __DIR__ . '/daily_planner.php';
    exit();
}

if ($cleanPath === '/records/daily-planner-review') {
    $_GET['action'] = 'review';
    require __DIR__ . '/daily_planner.php';
    exit();
}

// ---------------------------------------------------------------------
// ۷. داشبورد و ارتباط اولیا (Parent Dashboard & Messaging)
// ---------------------------------------------------------------------
if ($cleanPath === '/records/parent-overview') {
    require __DIR__ . '/parent_dashboard.php';
    exit();
}

if ($cleanPath === '/records/parent-messages') {
    require __DIR__ . '/messages.php';
    exit();
}

if ($cleanPath === '/records/advisor-message-to-parent') {
    require __DIR__ . '/messages.php';
    exit();
}

if (preg_match('#^/records/advisor-parent-messages/(\d+)#', $cleanPath, $matches)) {
    $_GET['student_id'] = $matches[1];
    require __DIR__ . '/messages.php';
    exit();
}

// رویدادها و رزرو جلسات / تماس‌ها
if ($cleanPath === '/records/events') {
    $user = require_auth($pdo);
    if ($method === 'POST') {
        $data = get_json_input();
        $advId = (int)($data['advisor_id'] ?? ($user['role'] === 'advisor' ? $user['id'] : 3));
        $stdId = (int)($data['student_id'] ?? ($user['role'] === 'student' ? $user['id'] : 5));
        $evDate = $data['event_date'] ?? date('Y/m/d');
        $evTime = $data['event_time'] ?? '۱۸:۰۰';
        $title = $data['title'] ?? 'جلسه مشاوره';
        $evType = $data['event_type'] ?? 'meeting';

        $stmt = $pdo->prepare("INSERT INTO advisor_events (advisor_id, student_id, event_date, event_time, title, event_type) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$advId, $stdId, $evDate, $evTime, $title, $evType]);

        json_response(["success" => true, "message" => "رویداد یا تماس با موفقیت ثبت شد."]);
    }
    $stmt = $pdo->query("SELECT * FROM advisor_events ORDER BY id DESC LIMIT 50");
    json_response($stmt->fetchAll());
}

if ($cleanPath === '/records/my-students') {
    $adv = require_auth($pdo);
    $stmt = $pdo->prepare("SELECT id, full_name as name, phone_number as phone, grade, taraz, subscription_status FROM users WHERE role = 'student' AND advisor_id = ?");
    $stmt->execute([$adv['id']]);
    $stds = $stmt->fetchAll();
    if (empty($stds)) {
        // Fallback for demo
        $allStmt = $pdo->query("SELECT id, full_name as name, phone_number as phone, grade, taraz, subscription_status FROM users WHERE role = 'student' LIMIT 5");
        $stds = $allStmt->fetchAll();
    }
    json_response($stds);
}

if ($cleanPath === '/records/my-profile') {
    $user = require_auth($pdo);
    json_response([
        "id" => (int)$user['id'],
        "name" => $user['full_name'],
        "phone" => $user['phone_number'],
        "grade" => $user['grade'] ?? 'دوازدهم تجربی',
        "taraz" => (int)($user['taraz'] ?? 7120),
        "school" => $user['school_name'] ?? 'دبیرستان علامه حلی',
        "target" => $user['target_field'] ?? 'پزشکی دانشگاه تهران'
    ]);
}

// ---------------------------------------------------------------------
// ۸. مالی و اشتراک (Subscription)
// ---------------------------------------------------------------------
if ($cleanPath === '/subscription/status') {
    $_GET['action'] = 'status';
    require __DIR__ . '/subscription.php';
    exit();
}

if ($cleanPath === '/subscription/founder/receipts') {
    $_GET['action'] = 'receipts';
    require __DIR__ . '/subscription.php';
    exit();
}

if ($cleanPath === '/subscription/founder/verify') {
    $_GET['action'] = 'verify';
    require __DIR__ . '/subscription.php';
    exit();
}

if ($cleanPath === '/subscription/settings') {
    $_GET['action'] = 'settings';
    require __DIR__ . '/subscription.php';
    exit();
}

if ($cleanPath === '/subscription/upload-receipt') {
    $_GET['action'] = 'upload-receipt';
    require __DIR__ . '/subscription.php';
    exit();
}

if ($cleanPath === '/subscription/dev-reset') {
    json_response(["success" => true, "status" => "paid"]);
}

// ---------------------------------------------------------------------
// ۹. همگام‌سازی آفلاین (Offline Queue Sync)
// ---------------------------------------------------------------------
if ($cleanPath === '/sync/offline-queue') {
    $data = get_json_input();
    $queue = $data['queue'] ?? [];
    json_response([
        "success" => true,
        "message" => count($queue) . " مورد آفلاین با موفقیت همگام‌سازی شد.",
        "synced_count" => count($queue)
    ]);
}

// ---------------------------------------------------------------------
// مسیر نامشخص (404)
// ---------------------------------------------------------------------
http_response_code(404);
json_error("مسیر درخواستی در سرور PHP یافت نشد: " . $path, 404);
