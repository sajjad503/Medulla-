<?php
/**
 * پلتفرم مدولا - ماژول مالی و اشتراک‌ها (api/subscription.php)
 */
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// دریافت وضعیت اشتراک
if ($method === 'GET' && ($action === 'status' || empty($action))) {
    $token = get_bearer_token();
    $user = $token ? verify_jwt($token) : null;

    $settingsStmt = $pdo->query("SELECT setting_key, setting_value FROM platform_settings");
    $settings = $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

    json_response([
        "is_student" => ($user['role'] ?? 'student') === 'student',
        "is_active" => true,
        "subscription_status" => "paid",
        "student_fee" => (int)($settings['student_fee'] ?? 490000),
        "card_number" => $settings['card_number'] ?? '6219861408052453',
        "card_holder" => $settings['card_holder'] ?? 'سجاد حامدی',
        "bank_name" => $settings['bank_name'] ?? 'بانک سامان'
    ]);
}

// لیست فیش‌های واریزی برای بررسی مدیر کل
if ($method === 'GET' && $action === 'receipts') {
    $currentUser = require_auth($pdo);
    if ($currentUser['role'] !== 'founder') json_error("دسترسی غیرمجاز است.", 403);

    $stmt = $pdo->query("SELECT * FROM payments ORDER BY id DESC LIMIT 50");
    $receipts = $stmt->fetchAll();
    json_response($receipts);
}

// آپلود یا ثبت فیش واریزی توسط دانش‌آموز
if ($method === 'POST' && $action === 'upload-receipt') {
    $currentUser = require_auth($pdo);
    $data = get_json_input();

    $tracking = $data['tracking_code'] ?? 'TRX-' . rand(1000000, 9999999);
    $receiptImage = $data['receipt_image'] ?? '';
    $notes = $data['notes'] ?? 'واریز فیش نقدی / کارت به کارت';

    $stmt = $pdo->prepare("
        INSERT INTO payments (student_id, student_name, student_phone, amount, method, status, tracking_code, receipt_image, notes)
        VALUES (?, ?, ?, 490000, 'card_to_card', 'pending', ?, ?, ?)
    ");
    $stmt->execute([
        $currentUser['id'],
        $currentUser['full_name'],
        $currentUser['phone_number'],
        $tracking,
        $receiptImage,
        $notes
    ]);

    json_response([
        "success" => true,
        "message" => "فیش واریزی با موفقیت ثبت شد و به مدیر پلتفرم ارسال گردید."
    ]);
}

// تایید یا رد فیش توسط مدیر کل
if ($method === 'POST' && $action === 'verify') {
    $currentUser = require_auth($pdo);
    if ($currentUser['role'] !== 'founder') json_error("دسترسی غیرمجاز است.", 403);

    $data = get_json_input();
    $paymentId = (int)($data['payment_id'] ?? 0);
    $status = $data['status'] ?? 'verified';

    $stmt = $pdo->prepare("UPDATE payments SET status = ? WHERE id = ?");
    $stmt->execute([$status, $paymentId]);

    json_response([
        "success" => true,
        "message" => "وضعیت فیش با موفقیت به‌روزرسانی شد."
    ]);
}

// به‌روزرسانی هزینه اشتراک توسط مدیر کل
if ($method === 'POST' && $action === 'settings') {
    $currentUser = require_auth($pdo);
    if ($currentUser['role'] !== 'founder') json_error("دسترسی غیرمجاز است.", 403);

    $data = get_json_input();
    if (isset($data['student_fee'])) {
        $stmt = $pdo->prepare("
            INSERT INTO platform_settings (setting_key, setting_value) 
            VALUES ('student_fee', ?) 
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");
        $stmt->execute([(string)$data['student_fee']]);
    }

    json_response([
        "success" => true,
        "message" => "تنظیمات اشتراک پلتفرم با موفقیت به‌روزرسانی شد."
    ]);
}

json_error("عملیات نامعتبر است.", 404);
