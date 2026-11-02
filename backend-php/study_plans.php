<?php
/**
 * پلتفرم مدولا - مدیریت برنامه‌های هفتگی مطالعه (api/study_plans.php)
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ۱. دریافت برنامه تحصیلی دانش‌آموز جاری (یا توسط مشاور برای دانش‌آموز خاص)
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    if ($currentUser['role'] === 'student') {
        $studentId = $currentUser['id'];
    } elseif ($currentUser['role'] === 'parent') {
        $studentId = $currentUser['student_id'] ?? 5;
    } elseif (!$studentId) {
        $studentId = 5; // پیش‌فرض یاشا محبی
    }

    $stmt = $pdo->prepare("SELECT * FROM study_plans WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$studentId]);
    $plan = $stmt->fetch();

    if ($plan) {
        $planData = json_decode($plan['plan_data'], true);
        json_response([
            "id" => (int)$plan['id'],
            "student_id" => (int)$plan['student_id'],
            "advisor_id" => (int)$plan['advisor_id'],
            "start_date" => $plan['start_date'],
            "end_date" => $plan['end_date'],
            "plan_data" => $planData ?: [],
            "feedback" => $plan['feedback'] ?? ''
        ]);
    } else {
        // ایجاد یک ساختار پیش‌فرض برای روزهای هفته
        $defaultDays = [
            "شنبه" => [],
            "یکشنبه" => [],
            "دوشنبه" => [],
            "سه‌شنبه" => [],
            "چهارشنبه" => [],
            "پنجشنبه" => [],
            "جمعه" => []
        ];
        json_response([
            "id" => 0,
            "student_id" => $studentId,
            "advisor_id" => $currentUser['id'],
            "start_date" => "۱۴۰۵/۰۸/۰۱",
            "end_date" => "۱۴۰۵/۰۸/۰۷",
            "plan_data" => $defaultDays,
            "feedback" => "هنوز برنامه‌ای برای این هفته ثبت نشده است."
        ]);
    }
}

// ۲. ذخیره یا ویرایش برنامه مطالعه توسط مشاور
if ($method === 'POST') {
    if (!in_array($currentUser['role'], ['advisor', 'founder', 'manager'])) {
        json_error("تنها مشاور، مدیر موسسه یا مدیر کل مجاز به ذخیره برنامه هفتگی هستند.", 403);
    }

    $data = get_json_input();
    $studentId = (int)($data['student_id'] ?? 0);
    $planData = $data['plan_data'] ?? [];
    $feedback = trim($data['feedback'] ?? '');
    $startDate = trim($data['start_date'] ?? '۱۴۰۵/۰۸/۰۱');
    $endDate = trim($data['end_date'] ?? '۱۴۰۵/۰۸/۰۷');

    if (!$studentId) {
        json_error("شناسه دانش‌آموز الزامی است.");
    }

    $planJson = json_encode($planData, JSON_UNESCAPED_UNICODE);

    // بررسی وجود رکورد قبلی
    $checkStmt = $pdo->prepare("SELECT id FROM study_plans WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $checkStmt->execute([$studentId]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        $updateStmt = $pdo->prepare("
            UPDATE study_plans 
            SET advisor_id = ?, start_date = ?, end_date = ?, plan_data = ?, feedback = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $updateStmt->execute([$currentUser['id'], $startDate, $endDate, $planJson, $feedback, $existing['id']]);
        $planId = $existing['id'];
    } else {
        $insertStmt = $pdo->prepare("
            INSERT INTO study_plans (student_id, advisor_id, start_date, end_date, plan_data, feedback)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([$studentId, $currentUser['id'], $startDate, $endDate, $planJson, $feedback]);
        $planId = $pdo->lastInsertId();
    }

    json_response([
        "success" => true,
        "message" => "برنامه مطالعاتی هفتگی با موفقیت ذخیره و به پنل دانش‌آموز و اولیا ابلاغ شد.",
        "plan_id" => (int)$planId
    ]);
}

json_error("متد درخواست نامعتبر است.", 405);
