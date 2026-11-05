<?php
/**
 * پلتفرم مدولا - پنل اختصاصی مدیریت موسسه و آکادمی کنکور (Academy Manager)
 * آدرس: api/manager_dashboard.php
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
if (!in_array($currentUser['role'], ['manager', 'founder', 'superadmin'])) {
    json_error("دسترسی غیرمجاز. فقط مدیران موسسات مجاز به ورود به این بخش هستند.", 403);
}

$workspaceId = (int)($currentUser['workspace_id'] ?? 1);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ۱. دریافت اطلاعات کامل موسسه، مشاوران و دانش‌آموزان
if ($method === 'GET' && empty($action)) {
    // اطلاعات موسسه
    $wsStmt = $pdo->prepare("SELECT * FROM workspaces WHERE id = ? LIMIT 1");
    $wsStmt->execute([$workspaceId]);
    $academy = $wsStmt->fetch();

    if (!$academy) {
        $academy = [
            "id" => $workspaceId,
            "name" => "آکادمی کنکور مدولا (شعبه مرکزی)",
            "manager_name" => $currentUser['full_name'],
            "phone" => $currentUser['phone_number'],
            "status" => "active",
            "debt" => 0,
            "revenue" => 145000000
        ];
    }

    // مشاوران این موسسه
    $advStmt = $pdo->prepare("
        SELECT u.id, u.full_name, u.phone_number, u.grade, u.custom_group, u.status, u.invite_code,
               COUNT(DISTINCT s.id) as student_count,
               COUNT(DISTINCT h.id) as homework_count,
               SUM(CASE WHEN h.status = 'completed' THEN 1 ELSE 0 END) as completed_homework_count
        FROM users u
        LEFT JOIN users s ON s.advisor_id = u.id AND s.role = 'student' AND s.workspace_id = ?
        LEFT JOIN homeworks h ON h.advisor_id = u.id AND h.workspace_id = ?
        WHERE u.role = 'advisor' AND u.workspace_id = ?
        GROUP BY u.id
        ORDER BY u.id ASC
    ");
    $advStmt->execute([$workspaceId, $workspaceId, $workspaceId]);
    $advisors = $advStmt->fetchAll();

    // دانش‌آموزان این موسسه
    $stuStmt = $pdo->prepare("
        SELECT s.id, s.full_name, s.phone_number, s.grade, s.custom_group, s.status, s.taraz,
               s.school_name, s.target_field, s.advisor_id, s.subscription_status, s.parent_phone,
               adv.full_name as advisor_name
        FROM users s
        LEFT JOIN users adv ON adv.id = s.advisor_id
        WHERE s.role = 'student' AND s.workspace_id = ?
        ORDER BY s.id DESC
    ");
    $stuStmt->execute([$workspaceId]);
    $students = $stuStmt->fetchAll();

    // دانش‌آموزان بدون مشاور در این موسسه
    $pendingStudents = array_values(array_filter($students, fn($st) => empty($st['advisor_id'])));

    // تکالیف ثبت شده در این موسسه
    $hwStmt = $pdo->prepare("
        SELECT h.*, s.full_name as student_name, adv.full_name as advisor_name
        FROM homeworks h
        JOIN users s ON s.id = h.student_id
        JOIN users adv ON adv.id = h.advisor_id
        WHERE h.workspace_id = ? OR s.workspace_id = ?
        ORDER BY h.id DESC LIMIT 30
    ");
    $hwStmt->execute([$workspaceId, $workspaceId]);
    $recentHomeworks = $hwStmt->fetchAll();

    $totalHw = count($recentHomeworks);
    $completedHw = count(array_filter($recentHomeworks, fn($h) => $h['status'] === 'completed'));
    $hwRate = $totalHw > 0 ? round(($completedHw / $totalHw) * 100) : 100;

    json_response([
        "academy" => $academy,
        "stats" => [
            "total_advisors" => count($advisors),
            "total_students" => count($students),
            "pending_students" => count($pendingStudents),
            "active_homeworks" => $totalHw,
            "homework_completion_rate" => $hwRate,
            "monthly_revenue" => (float)($academy['revenue'] ?? 0)
        ],
        "advisors" => $advisors,
        "students" => $students,
        "pending_students" => $pendingStudents,
        "homeworks" => $recentHomeworks
    ]);
}

// ۲. افزودن مشاور جدید به این موسسه
if ($method === 'POST' && $action === 'add-advisor') {
    $data = get_json_input();
    $name = trim($data['full_name'] ?? '');
    $phone = trim($data['phone_number'] ?? '');
    $password = trim($data['password'] ?? '123456');
    $grade = trim($data['grade'] ?? 'مشاور تخصصی کنکور');
    $customGroup = trim($data['custom_group'] ?? 'مشاور موسسه');
    $inviteCode = strtoupper(trim($data['invite_code'] ?? 'ADV' . rand(1000, 9999)));

    if (empty($name) || empty($phone)) {
        json_error("نام مشاور و شماره موبایل الزامی است.", 400);
    }

    // بررسی تکراری نبودن شماره
    $check = $pdo->prepare("SELECT id FROM users WHERE phone_number = ? LIMIT 1");
    $check->execute([$phone]);
    if ($check->fetch()) {
        json_error("این شماره موبایل قبلاً در سیستم ثبت شده است.", 400);
    }

    $passHash = password_hash($password, PASSWORD_BCRYPT);
    $ins = $pdo->prepare("
        INSERT INTO users (workspace_id, role, full_name, phone_number, password_hash, status, custom_group, grade, invite_code, onboarded, is_independent)
        VALUES (?, 'advisor', ?, ?, ?, 'active', ?, ?, ?, 1, 0)
    ");
    $ins->execute([$workspaceId, $name, $phone, $passHash, $customGroup, $grade, $inviteCode]);

    json_response([
        "success" => true,
        "message" => "مشاور جدید با موفقیت به موسسه اضافه شد.",
        "advisor_id" => (int)$pdo->lastInsertId()
    ]);
}

// ۳. حذف یا تعلیق مشاور از موسسه
if ($method === 'POST' && $action === 'remove-advisor') {
    $data = get_json_input();
    $advisorId = (int)($data['advisor_id'] ?? 0);

    // بررسی اینکه مشاور متعلق به همین موسسه است
    $check = $pdo->prepare("SELECT id FROM users WHERE id = ? AND workspace_id = ? AND role = 'advisor'");
    $check->execute([$advisorId, $workspaceId]);
    if (!$check->fetch()) {
        json_error("مشاور مورد نظر در این موسسه یافت نشد.", 404);
    }

    // آزاد کردن دانش‌آموزان این مشاور در این موسسه
    $unassign = $pdo->prepare("UPDATE users SET advisor_id = NULL WHERE advisor_id = ? AND workspace_id = ?");
    $unassign->execute([$advisorId, $workspaceId]);

    // تعلیق یا خروج مشاور
    $upd = $pdo->prepare("UPDATE users SET status = 'suspended', workspace_id = NULL, is_independent = 1 WHERE id = ?");
    $upd->execute([$advisorId]);

    json_response([
        "success" => true,
        "message" => "مشاور از موسسه حذف و دانش‌آموزان به لیست بدون مشاور منتقل شدند."
    ]);
}

// ۴. تخصیص دانش‌آموز به مشاور در این موسسه
if ($method === 'POST' && $action === 'assign-student') {
    $data = get_json_input();
    $studentId = (int)($data['student_id'] ?? 0);
    $advisorId = (int)($data['advisor_id'] ?? 0);

    // بررسی دانش‌آموز متعلق به موسسه
    $stCheck = $pdo->prepare("SELECT id FROM users WHERE id = ? AND workspace_id = ? AND role = 'student'");
    $stCheck->execute([$studentId, $workspaceId]);
    if (!$stCheck->fetch()) json_error("دانش‌آموز متعلق به این موسسه نیست.", 404);

    // بررسی مشاور متعلق به موسسه
    $advCheck = $pdo->prepare("SELECT id FROM users WHERE id = ? AND workspace_id = ? AND role = 'advisor'");
    $advCheck->execute([$advisorId, $workspaceId]);
    if (!$advCheck->fetch()) json_error("مشاور متعلق به این موسسه نیست.", 404);

    $upd = $pdo->prepare("UPDATE users SET advisor_id = ?, status = 'active' WHERE id = ?");
    $upd->execute([$advisorId, $studentId]);

    json_response([
        "success" => true,
        "message" => "دانش‌آموز با موفقیت به مشاور تخصیص داده شد."
    ]);
}

// ۵. ثبت‌نام دانش‌آموز جدید در این موسسه
if ($method === 'POST' && $action === 'add-student') {
    $data = get_json_input();
    $name = trim($data['full_name'] ?? '');
    $phone = trim($data['phone_number'] ?? '');
    $grade = trim($data['grade'] ?? 'دوازدهم تجربی');
    $advisorId = !empty($data['advisor_id']) ? (int)$data['advisor_id'] : null;
    $taraz = (int)($data['taraz'] ?? 6500);
    $parentPhone = trim($data['parent_phone'] ?? '');

    if (empty($name) || empty($phone)) json_error("نام و شماره موبایل الزامی است.", 400);

    $check = $pdo->prepare("SELECT id FROM users WHERE phone_number = ? LIMIT 1");
    $check->execute([$phone]);
    if ($check->fetch()) json_error("این شماره قبلاً در سیستم ثبت شده است.", 400);

    $passHash = password_hash('123', PASSWORD_BCRYPT);
    $ins = $pdo->prepare("
        INSERT INTO users (workspace_id, role, full_name, phone_number, password_hash, status, grade, advisor_id, taraz, parent_phone, onboarded, subscription_status)
        VALUES (?, 'student', ?, ?, ?, 'active', ?, ?, ?, ?, 1, 'paid')
    ");
    $ins->execute([$workspaceId, $name, $phone, $passHash, $grade, $advisorId, $taraz, $parentPhone]);

    json_response([
        "success" => true,
        "message" => "دانش‌آموز با موفقیت در این موسسه ثبت‌نام شد.",
        "student_id" => (int)$pdo->lastInsertId()
    ]);
}

json_error("درخواست نامعتبر است.", 405);
