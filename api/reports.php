<?php
/**
 * پلتفرم مدولا - گزارش‌های کار روزانه مطالعه (api/reports.php)
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ۱. دریافت گزارش‌های مطالعه
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    if ($currentUser['role'] === 'student') {
        $studentId = $currentUser['id'];
    } elseif ($currentUser['role'] === 'parent') {
        $studentId = $currentUser['student_id'] ?? 5;
    } elseif (!$studentId) {
        $studentId = 5;
    }

    $stmt = $pdo->prepare("SELECT * FROM work_reports WHERE student_id = ? ORDER BY report_date DESC LIMIT 30");
    $stmt->execute([$studentId]);
    $reports = $stmt->fetchAll();

    $formatted = array_map(function($r) {
        return [
            "id" => (int)$r['id'],
            "student_id" => (int)$r['student_id'],
            "report_date" => $r['report_date'],
            "total_study_time" => (float)$r['total_study_time'],
            "total_test_count" => (int)$r['total_test_count'],
            "report_items" => json_decode($r['report_items'], true) ?: [],
            "student_note" => $r['student_note'] ?? '',
            "is_read_by_advisor" => (bool)$r['is_read_by_advisor'],
            "advisor_feedback" => $r['advisor_feedback'] ?? '',
            "status" => $r['status'] ?? 'pending',
            "created_at" => $r['created_at']
        ];
    }, $reports);

    json_response($formatted);
}

// ۲. ثبت یا بررسی گزارش کار
if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    $data = get_json_input();

    // ثبت بازخورد مشاور
    if ($action === 'feedback' || isset($data['feedback']) && in_array($currentUser['role'], ['advisor', 'founder', 'manager'])) {
        $reportId = (int)($data['report_id'] ?? 0);
        $feedback = trim($data['feedback'] ?? '');
        $status = $data['status'] ?? 'approved';

        $stmt = $pdo->prepare("UPDATE work_reports SET advisor_feedback = ?, is_read_by_advisor = 1, status = ? WHERE id = ?");
        $stmt->execute([$feedback, $status, $reportId]);

        json_response([
            "success" => true,
            "message" => "بازخورد مشاور روی گزارش کار با موفقیت ثبت شد."
        ]);
    }

    // ارسال گزارش کار روزانه توسط دانش‌آموز
    $studentId = ($currentUser['role'] === 'student') ? $currentUser['id'] : (int)($data['student_id'] ?? 5);
    $reportDate = $data['report_date'] ?? date('Y-m-d');
    $totalStudyTime = (float)($data['total_study_time'] ?? 0.0);
    $totalTestCount = (int)($data['total_test_count'] ?? 0);
    $reportItems = $data['report_items'] ?? [];
    $studentNote = trim($data['student_note'] ?? '');

    $itemsJson = json_encode($reportItems, JSON_UNESCAPED_UNICODE);

    $insertStmt = $pdo->prepare("
        INSERT INTO work_reports (student_id, report_date, total_study_time, total_test_count, report_items, student_note, is_read_by_advisor, status)
        VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')
    ");
    $insertStmt->execute([$studentId, $reportDate, $totalStudyTime, $totalTestCount, $itemsJson, $studentNote]);

    json_response([
        "success" => true,
        "message" => "گزارش کار با موفقیت ارسال شد و در نوبت بررسی مشاور قرار گرفت.",
        "report_id" => (int)$pdo->lastInsertId()
    ]);
}

json_error("درخواست نامعتبر است.", 405);
