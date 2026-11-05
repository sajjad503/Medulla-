<?php
/**
 * پلتفرم مدولا - ماژول تکالیف و فعالیت‌های درسی دانش‌آموزان
 * آدرس: api/homeworks.php
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ۱. دریافت لیست تکالیف
if ($method === 'GET') {
    $role = $currentUser['role'];
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;

    if ($role === 'student') {
        // دانش‌آموز فقط تکالیف خودش را دریافت می‌کند
        $stmt = $pdo->prepare("
            SELECT h.*, adv.full_name as advisor_name
            FROM homeworks h
            LEFT JOIN users adv ON adv.id = h.advisor_id
            WHERE h.student_id = ?
            ORDER BY h.id DESC
        ");
        $stmt->execute([$currentUser['id']]);
        $rows = $stmt->fetchAll();
    } elseif ($role === 'advisor') {
        // مشاور تکالیفی که خودش برای دانش‌آموزانش تعیین کرده را می‌بیند
        if ($studentId > 0) {
            $stmt = $pdo->prepare("
                SELECT h.*, s.full_name as student_name, s.grade as student_grade
                FROM homeworks h
                JOIN users s ON s.id = h.student_id
                WHERE h.advisor_id = ? AND h.student_id = ?
                ORDER BY h.id DESC
            ");
            $stmt->execute([$currentUser['id'], $studentId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT h.*, s.full_name as student_name, s.grade as student_grade
                FROM homeworks h
                JOIN users s ON s.id = h.student_id
                WHERE h.advisor_id = ?
                ORDER BY h.id DESC
            ");
            $stmt->execute([$currentUser['id']]);
        }
        $rows = $stmt->fetchAll();
    } elseif ($role === 'manager') {
        // مدیر موسسه تکالیف موسسه خودش را می‌بیند
        $wId = (int)($currentUser['workspace_id'] ?? 1);
        $stmt = $pdo->prepare("
            SELECT h.*, s.full_name as student_name, adv.full_name as advisor_name
            FROM homeworks h
            JOIN users s ON s.id = h.student_id
            JOIN users adv ON adv.id = h.advisor_id
            WHERE h.workspace_id = ? OR s.workspace_id = ?
            ORDER BY h.id DESC
        ");
        $stmt->execute([$wId, $wId]);
        $rows = $stmt->fetchAll();
    } elseif (in_array($role, ['founder', 'superadmin'])) {
        // مدیر کل همه تکالیف را می‌بیند
        $stmt = $pdo->query("
            SELECT h.*, s.full_name as student_name, adv.full_name as advisor_name
            FROM homeworks h
            JOIN users s ON s.id = h.student_id
            JOIN users adv ON adv.id = h.advisor_id
            ORDER BY h.id DESC LIMIT 100
        ");
        $rows = $stmt->fetchAll();
    } else {
        $rows = [];
    }

    json_response($rows ?: []);
}

// ۲. تعیین تکلیف جدید توسط مشاور
if ($method === 'POST' && empty($action)) {
    if (!in_array($currentUser['role'], ['advisor', 'manager', 'founder', 'superadmin'])) {
        json_error("تنها مشاور یا مدیر مجاز به تعریف تکلیف است.", 403);
    }

    $data = get_json_input();
    $studentId = (int)($data['student_id'] ?? 0);
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $subject = trim($data['subject'] ?? 'عمومی');
    $dueDate = trim($data['due_date'] ?? date('Y/m/d'));
    
    if (empty($title) || !$studentId) {
        json_error("عنوان تکلیف و انتخاب دانش‌آموز الزامی است.", 400);
    }

    // بررسی اینکه مشاور به این دانش‌آموز دسترسی دارد
    if ($currentUser['role'] === 'advisor') {
        $checkStmt = $pdo->prepare("SELECT id, workspace_id FROM users WHERE id = ? AND advisor_id = ? AND role = 'student'");
        $checkStmt->execute([$studentId, $currentUser['id']]);
        $st = $checkStmt->fetch();
        if (!$st) {
            json_error("شما تنها مجاز به تعیین تکلیف برای دانش‌آموزان تحت نظر خود هستید.", 403);
        }
        $workspaceId = $st['workspace_id'] ?? $currentUser['workspace_id'];
    } else {
        $stStmt = $pdo->prepare("SELECT workspace_id FROM users WHERE id = ?");
        $stStmt->execute([$studentId]);
        $st = $stStmt->fetch();
        $workspaceId = $st['workspace_id'] ?? 1;
    }

    $stmt = $pdo->prepare("
        INSERT INTO homeworks (student_id, advisor_id, workspace_id, title, description, subject, due_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([$studentId, $currentUser['id'], $workspaceId, $title, $description, $subject, $dueDate]);

    json_response([
        "success" => true,
        "message" => "تکلیف با موفقیت ثبت شد و در میز کار دانش‌آموز قرار گرفت.",
        "id" => (int)$pdo->lastInsertId()
    ]);
}

// ۳. تغییر وضعیت تکلیف (تیک انجام شد توسط دانش‌آموز یا بازخورد مشاور)
if ($method === 'POST' && $action === 'toggle') {
    $data = get_json_input();
    $homeworkId = (int)($data['id'] ?? 0);
    $studentNote = trim($data['student_note'] ?? '');

    $stmt = $pdo->prepare("SELECT * FROM homeworks WHERE id = ?");
    $stmt->execute([$homeworkId]);
    $hw = $stmt->fetch();

    if (!$hw) {
        json_error("تکلیف یافت نشد.", 404);
    }

    if ($currentUser['role'] === 'student' && (int)$hw['student_id'] !== (int)$currentUser['id']) {
        json_error("دسترسی غیرمجاز. شما فقط مجاز به تیک زدن تکالیف خود هستید.", 403);
    }

    $newStatus = ($hw['status'] === 'completed') ? 'pending' : 'completed';
    $completedAt = ($newStatus === 'completed') ? date('Y-m-d H:i:s') : null;

    $updateStmt = $pdo->prepare("
        UPDATE homeworks 
        SET status = ?, student_note = IFNULL(NULLIF(?, ''), student_note), completed_at = ?
        WHERE id = ?
    ");
    $updateStmt->execute([$newStatus, $studentNote, $completedAt, $homeworkId]);

    json_response([
        "success" => true,
        "message" => ($newStatus === 'completed') ? "تکلیف به عنوان انجام‌شده ثبت شد." : "وضعیت تکلیف به در انتظار تغییر یافت.",
        "status" => $newStatus
    ]);
}

// ۴. حذف تکلیف توسط مشاور
if ($method === 'POST' && $action === 'delete') {
    $data = get_json_input();
    $homeworkId = (int)($data['id'] ?? 0);

    $stmt = $pdo->prepare("SELECT * FROM homeworks WHERE id = ?");
    $stmt->execute([$homeworkId]);
    $hw = $stmt->fetch();

    if (!$hw) json_error("تکلیف یافت نشد.", 404);

    if ($currentUser['role'] === 'advisor' && (int)$hw['advisor_id'] !== (int)$currentUser['id']) {
        json_error("شما فقط مجاز به حذف تکالیف تعیین‌شده توسط خود هستید.", 403);
    }

    $delStmt = $pdo->prepare("DELETE FROM homeworks WHERE id = ?");
    $delStmt->execute([$homeworkId]);

    json_response(["success" => true, "message" => "تکلیف با موفقیت حذف شد."]);
}

json_error("درخواست نامعتبر است.", 405);
