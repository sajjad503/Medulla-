<?php
/**
 * پلتفرم مدولا - برنامه‌ریز روزانه تفصیلی ۲۴ ساعته (api/daily_planner.php)
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ۱. دریافت برنامه‌ریز روزانه برای تاریخ مشخص
if ($method === 'GET') {
    $date = $_GET['date'] ?? date('Y-m-d');
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    if ($currentUser['role'] === 'student') {
        $studentId = $currentUser['id'];
    } elseif ($currentUser['role'] === 'parent') {
        $studentId = $currentUser['student_id'] ?? 5;
    } elseif (!$studentId) {
        $studentId = 5;
    }

    $stmt = $pdo->prepare("SELECT * FROM daily_planner WHERE student_id = ? AND planner_date = ? LIMIT 1");
    $stmt->execute([$studentId, $date]);
    $record = $stmt->fetch();

    if ($record) {
        json_response([
            "id" => (int)$record['id'],
            "student_id" => (int)$record['student_id'],
            "planner_date" => $record['planner_date'],
            "blocks" => json_decode($record['blocks'], true) ?: [],
            "sleep_hours" => (float)$record['sleep_hours'],
            "mood" => $record['mood'] ?? 'عالی',
            "total_focus_time" => (float)$record['total_focus_time'],
            "advisor_review" => $record['advisor_review'] ? json_decode($record['advisor_review'], true) : null
        ]);
    } else {
        json_response([
            "id" => 0,
            "student_id" => $studentId,
            "planner_date" => $date,
            "blocks" => [],
            "sleep_hours" => 7.0,
            "mood" => "عالی",
            "total_focus_time" => 0.0,
            "advisor_review" => null
        ]);
    }
}

// ۲. ذخیره یا به‌روزرسانی برنامه‌ریز روزانه توسط دانش‌آموز یا مشاور
if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    $data = get_json_input();

    // بررسی ثبت بررسی توسط مشاور
    if ($action === 'review' || isset($data['score']) || isset($data['comment'])) {
        if (!in_array($currentUser['role'], ['advisor', 'founder', 'manager'])) {
            json_error("تنها مشاور مجاز به ثبت بازخورد روی برنامه‌ریز روزانه است.", 403);
        }

        $studentId = (int)($data['student_id'] ?? 5);
        $plannerDate = $data['planner_date'] ?? date('Y-m-d');
        $score = (int)($data['score'] ?? 100);
        $comment = trim($data['comment'] ?? '');

        $reviewPayload = json_encode([
            "reviewed" => true,
            "advisor_name" => $currentUser['full_name'],
            "score" => $score,
            "comment" => $comment,
            "reviewed_at" => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);

        $stmt = $pdo->prepare("
            UPDATE daily_planner 
            SET advisor_review = ? 
            WHERE student_id = ? AND planner_date = ?
        ");
        $stmt->execute([$reviewPayload, $studentId, $plannerDate]);

        json_response([
            "success" => true,
            "message" => "بازخورد و نمره مشاور با موفقیت ثبت شد."
        ]);
    }

    // ذخیره برنامه‌ریز روزانه توسط دانش‌آموز
    $studentId = ($currentUser['role'] === 'student') ? $currentUser['id'] : (int)($data['student_id'] ?? 5);
    $plannerDate = $data['planner_date'] ?? date('Y-m-d');
    $blocks = $data['blocks'] ?? [];
    $sleepHours = (float)($data['sleep_hours'] ?? 7.0);
    $mood = $data['mood'] ?? 'عالی';
    $totalFocus = (float)($data['total_focus_time'] ?? 0.0);

    $blocksJson = json_encode($blocks, JSON_UNESCAPED_UNICODE);

    // استفاده از INSERT ... ON DUPLICATE KEY UPDATE جهت اتمیک بودن
    $upsertStmt = $pdo->prepare("
        INSERT INTO daily_planner (student_id, planner_date, blocks, sleep_hours, mood, total_focus_time)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            blocks = VALUES(blocks),
            sleep_hours = VALUES(sleep_hours),
            mood = VALUES(mood),
            total_focus_time = VALUES(total_focus_time),
            updated_at = NOW()
    ");
    $upsertStmt->execute([$studentId, $plannerDate, $blocksJson, $sleepHours, $mood, $totalFocus]);

    json_response([
        "success" => true,
        "message" => "برنامه روزانه و زمان‌بندی ۲۴ ساعته با موفقیت ذخیره شد."
    ]);
}

json_error("درخواست نامعتبر است.", 405);
