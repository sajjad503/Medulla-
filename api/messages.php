<?php
/**
 * پلتفرم مدولا - سیستم پیام‌رسانی بین مشاور، اولیا، مدیر و دانش‌آموز (api/messages.php)
 */
require_once __DIR__ . '/db.php';

$currentUser = require_auth($pdo);
$method = $_SERVER['REQUEST_METHOD'];

// ۱. دریافت پیام‌ها
if ($method === 'GET') {
    $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

    if ($currentUser['role'] === 'parent') {
        // دریافت پیام‌های اولیا
        $studentId = $currentUser['student_id'] ?? 5;
        $stmt = $pdo->prepare("
            SELECT m.*, u.full_name as sender_name 
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.receiver_id = ? OR (m.student_id = ? AND m.receiver_role = 'parent')
            ORDER BY m.id DESC
        ");
        $stmt->execute([$currentUser['id'], $studentId]);
        $messages = $stmt->fetchAll();
    } elseif ($currentUser['role'] === 'advisor') {
        // دریافت پیام‌های مشاور با اولیای یک دانش‌آموز مشخص
        if (!$studentId) $studentId = 5;
        $stmt = $pdo->prepare("
            SELECT m.*, u.full_name as sender_name 
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.student_id = ? AND (m.sender_role = 'advisor' OR m.receiver_role = 'advisor')
            ORDER BY m.id ASC
        ");
        $stmt->execute([$studentId]);
        $messages = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 50");
        $stmt->execute();
        $messages = $stmt->fetchAll();
    }

    json_response($messages ?: []);
}

// ۲. ارسال پیام (مشاور به اولیا یا برعکس)
if ($method === 'POST') {
    $data = get_json_input();
    $message = trim($data['message'] ?? $data['text'] ?? '');
    $studentId = (int)($data['student_id'] ?? 0);

    if (empty($message)) {
        json_error("متن پیام نمی‌تواند خالی باشد.");
    }

    if ($currentUser['role'] === 'advisor') {
        // پیدا کردن اولیای این دانش‌آموز
        $parentStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'parent' AND student_id = ? LIMIT 1");
        $parentStmt->execute([$studentId]);
        $parent = $parentStmt->fetch();
        $receiverId = $parent ? (int)$parent['id'] : 20;

        $insertStmt = $pdo->prepare("
            INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, student_id, message, is_read)
            VALUES (?, ?, 'advisor', 'parent', ?, ?, 0)
        ");
        $insertStmt->execute([$currentUser['id'], $receiverId, $studentId, $message]);
    } else {
        // اولیا به مشاور
        $studentStmt = $pdo->prepare("SELECT advisor_id FROM users WHERE id = ? LIMIT 1");
        $studentStmt->execute([$studentId ?: ($currentUser['student_id'] ?? 5)]);
        $student = $studentStmt->fetch();
        $receiverId = $student ? (int)$student['advisor_id'] : 3;

        $insertStmt = $pdo->prepare("
            INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, student_id, message, is_read)
            VALUES (?, ?, 'parent', 'advisor', ?, ?, 0)
        ");
        $insertStmt->execute([$currentUser['id'], $receiverId, $studentId ?: ($currentUser['student_id'] ?? 5), $message]);
    }

    json_response([
        "success" => true,
        "message" => "پیام با موفقیت ارسال شد و در پنل مخاطب قرار گرفت.",
        "message_id" => (int)$pdo->lastInsertId()
    ]);
}

json_error("درخواست نامعتبر است.", 405);
