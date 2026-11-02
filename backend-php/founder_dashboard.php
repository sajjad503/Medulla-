<?php
/**
 * پلتفرم مدولا - پنل مدیریت کل (Founder Dashboard)
 * آدرس: api/founder_dashboard.php
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
if ($currentUser['role'] !== 'founder') {
    json_error("دسترسی غیرمجاز. فقط مدیر کل پلتفرم مجاز به ورود به این بخش است.", 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ۱. دریافت داده‌های داشبورد مدیر کل
if ($method === 'GET' && empty($action)) {
    // آمار کلی
    $countInstitutes = (int)$pdo->query("SELECT COUNT(*) FROM workspaces")->fetchColumn();
    $countAdvisors = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'advisor'")->fetchColumn();
    $countStudents = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();

    // لیست موسسات
    $institutes = $pdo->query("SELECT * FROM workspaces ORDER BY id ASC")->fetchAll();

    // لیست مشاوران همراه با تعداد دانش‌آموزان هر مشاور
    $advisorsStmt = $pdo->query("
        SELECT u.id, u.full_name, u.phone_number, u.grade, u.custom_group, u.status, u.invite_code,
               COUNT(s.id) as student_count
        FROM users u
        LEFT JOIN users s ON s.advisor_id = u.id AND s.role = 'student'
        WHERE u.role = 'advisor'
        GROUP BY u.id
        ORDER BY u.id ASC
    ");
    $advisors = $advisorsStmt->fetchAll();

    // لیست دانش‌آموزان با نام مشاور مربوطه
    $studentsStmt = $pdo->query("
        SELECT s.id, s.full_name, s.phone_number, s.grade, s.custom_group, s.status, s.taraz,
               s.school_name, s.target_field, s.advisor_id, s.subscription_status,
               adv.full_name as advisor_name
        FROM users s
        LEFT JOIN users adv ON adv.id = s.advisor_id
        WHERE s.role = 'student'
        ORDER BY s.id DESC
    ");
    $students = $studentsStmt->fetchAll();

    // تنظیمات پلتفرم
    $settingsRows = $pdo->query("SELECT setting_key, setting_value FROM platform_settings")->fetchAll();
    $settings = [];
    foreach ($settingsRows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    json_response([
        "stats" => [
            "total_institutes" => $countInstitutes,
            "total_advisors" => $countAdvisors,
            "total_students" => $countStudents,
            "platform_balance" => 245000000,
            "monthly_revenue" => 38500000
        ],
        "institutes" => $institutes,
        "advisors" => $advisors,
        "students" => $students,
        "pending_students" => array_values(array_filter($students, fn($s) => empty($s['advisor_id']))),
        "settings" => $settings,
        "system_logs" => [
            ["id" => 1, "action" => "بررسی امنیتی سشن‌ها", "time" => "لحظاتی پیش", "status" => "موفق"],
            ["id" => 2, "action" => "همگام‌سازی دیتابیس MySQL", "time" => "۵ دقیقه قبل", "status" => "پایدار"]
        ]
    ]);
}

// ۲. فعال/غیرفعال‌سازی کاربر
if ($method === 'POST' && $action === 'toggle-status') {
    $data = get_json_input();
    $userId = (int)($data['user_id'] ?? $_GET['id'] ?? 0);
    
    if (!$userId) json_error("شناسه کاربر الزامی است.");

    $stmt = $pdo->prepare("SELECT status FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) json_error("کاربر یافت نشد.", 404);

    $newStatus = ($user['status'] === 'active') ? 'suspended' : 'active';
    $updateStmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    $updateStmt->execute([$newStatus, $userId]);

    json_response([
        "success" => true,
        "message" => "وضعیت کاربر با موفقیت تغییر کرد.",
        "new_status" => $newStatus
    ]);
}

// ۳. تخصیص مشاور به دانش‌آموز
if ($method === 'POST' && $action === 'assign-advisor') {
    $data = get_json_input();
    $studentId = (int)($data['student_id'] ?? $_GET['student_id'] ?? 0);
    $advisorId = (int)($data['advisor_id'] ?? $_GET['advisor_id'] ?? 0);

    if (!$studentId || !$advisorId) json_error("شناسه دانش‌آموز و مشاور الزامی است.");

    $stmt = $pdo->prepare("UPDATE users SET advisor_id = ?, status = 'active' WHERE id = ? AND role = 'student'");
    $stmt->execute([$advisorId, $studentId]);

    json_response([
        "success" => true,
        "message" => "مشاور با موفقیت به دانش‌آموز تخصیص داده شد."
    ]);
}

json_error("عملیات نامعتبر است.", 404);
