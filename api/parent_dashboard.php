<?php
/**
 * پلتفرم مدولا - داشبورد اولیا و نظارت والدین (api/parent_dashboard.php)
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// دانش‌آموز تحت پوشش این ولی
$studentId = $currentUser['student_id'] ?? 5;

// دریافت اطلاعات دانش‌آموز و مشاور وی
$stmt = $pdo->prepare("
    SELECT s.*, adv.full_name as advisor_name, adv.phone_number as advisor_phone
    FROM users s
    LEFT JOIN users adv ON adv.id = s.advisor_id
    WHERE s.id = ?
");
$stmt->execute([$studentId]);
$student = $stmt->fetch();

if (!$student) {
    // پیش‌فرض اگر کاربر در دیتابیس یافت نشد
    $student = [
        "id" => 5,
        "full_name" => "یاشا محبی",
        "grade" => "دوازدهم تجربی",
        "school_name" => "دبیرستان علامه حلی",
        "target_field" => "پزشکی دانشگاه تهران",
        "taraz" => 7120,
        "advisor_name" => "دکتر کاظمی",
        "advisor_phone" => "09120000003"
    ];
}

if ($method === 'GET') {
    // گزارش‌های اخیر دانش‌آموز
    $reportsStmt = $pdo->prepare("SELECT * FROM work_reports WHERE student_id = ? ORDER BY report_date DESC LIMIT 7");
    $reportsStmt->execute([$studentId]);
    $rawReports = $reportsStmt->fetchAll();

    $totalHours = 0;
    $totalTests = 0;
    $reports = [];
    foreach ($rawReports as $r) {
        $totalHours += (float)$r['total_study_time'];
        $totalTests += (int)$r['total_test_count'];
        $reports[] = [
            "id" => (int)$r['id'],
            "date" => $r['report_date'],
            "study_time" => (float)$r['total_study_time'],
            "test_count" => (int)$r['total_test_count'],
            "items" => json_decode($r['report_items'], true) ?: [],
            "note" => $r['student_note'] ?? '',
            "feedback" => $r['advisor_feedback'] ?? '',
            "status" => $r['status'] ?? 'approved'
        ];
    }

    // برنامه هفتگی جاری
    $planStmt = $pdo->prepare("SELECT * FROM study_plans WHERE student_id = ? ORDER BY id DESC LIMIT 1");
    $planStmt->execute([$studentId]);
    $plan = $planStmt->fetch();
    $planData = $plan ? json_decode($plan['plan_data'], true) : [];

    $studentPayload = [
        "id" => (int)($student['id'] ?? 5),
        "name" => $student['full_name'],
        "grade" => $student['grade'] ?? 'دوازدهم تجربی',
        "school_name" => $student['school_name'] ?? 'دبیرستان استعداد درخشان',
        "target_field" => $student['target_field'] ?? 'پزشکی دانشگاه تهران',
        "taraz" => (int)($student['taraz'] ?? 7120),
        "phone" => $student['phone_number'] ?? '09120000004',
        "advisor_name" => $student['advisor_name'] ?? 'دکتر کاظمی',
        "advisor_phone" => $student['advisor_phone'] ?? '09120000003'
    ];

    $advisorPayload = [
        "name" => $student['advisor_name'] ?? 'دکتر کاظمی',
        "phone" => $student['advisor_phone'] ?? '09120000003',
        "specialty" => 'مشاور ارشد کنکور تجربی و هدایت تحصیلی',
        "next_meeting" => 'چهارشنبه ۴ آبان - ساعت ۱۸:۳۰ (تماس تلفنی با اولیا)'
    ];

    $metricsPayload = [
        "today_study_hours" => 6.5,
        "weekly_study_hours" => $totalHours ?: 42.5,
        "weekly_tests_count" => $totalTests ?: 780,
        "attendance_rate" => 96,
        "plan_completion_rate" => 88,
        "recent_exam_score" => 84.5
    ];

    json_response([
        "student" => $studentPayload,
        "child_info" => $studentPayload,
        "advisor" => $advisorPayload,
        "metrics" => $metricsPayload,
        "stats" => [
            "total_hours_week" => $totalHours ?: 42.5,
            "total_tests_week" => $totalTests ?: 780,
            "completion_rate" => 92,
            "streak_days" => 14
        ],
        "recent_reports" => $reports,
        "current_plan" => $planData
    ]);
}

// رزرو درخواست تماس با مشاور
if ($method === 'POST') {
    $data = get_json_input();
    $eventDate = $data['event_date'] ?? date('Y/m/d');
    $eventTime = $data['event_time'] ?? '۱۸:۰۰';
    $title = $data['title'] ?? 'درخواست تماس تلفنی اولیا با مشاور';
    $eventType = $data['event_type'] ?? 'call';

    $advisorId = $student['advisor_id'] ?? 3;

    $stmt = $pdo->prepare("
        INSERT INTO advisor_events (advisor_id, student_id, event_date, event_time, title, event_type, status)
        VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
    ");
    $stmt->execute([$advisorId, $studentId, $eventDate, $eventTime, $title, $eventType]);

    json_response([
        "success" => true,
        "message" => "درخواست تماس تلفنی با مشاور با موفقیت ثبت شد و در تقویم کاری مشاور قرار گرفت."
    ]);
}

json_error("درخواست نامعتبر است.", 405);
