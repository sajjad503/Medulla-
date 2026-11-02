<?php
/**
 * پلتفرم مدولا - ورود و احراز هویت کاربران (api/login.php)
 * پشتیبانی از متد POST با نام کاربری/شماره موبایل و رمز عبور
 */
require_once __DIR__ . '/db.php';

$data = get_json_input();
$phone = trim($data['username'] ?? $data['phone_number'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($phone) || empty($password)) {
    json_error("لطفاً شماره موبایل و رمز عبور را وارد کنید.", 400);
}

// استعلام کاربر از دیتابیس
$stmt = $pdo->prepare("SELECT * FROM users WHERE phone_number = ? LIMIT 1");
$stmt->execute([$phone]);
$user = $stmt->fetch();

if (!$user) {
    json_error("شماره موبایل یا رمز عبور اشتباه است.", 401);
}

if ($user['status'] === 'suspended') {
    json_error("حساب کاربری شما مسدود یا معلق شده است. لطفاً با پشتیبانی تماس بگیرید.", 403);
}

// بررسی رمز عبور (پشتیبانی از رمز پیش‌فرض 123 یا هش رمز عبور)
$passwordValid = false;
if ($password === '123' || password_verify($password, $user['password_hash'])) {
    $passwordValid = true;
}

if (!$passwordValid) {
    json_error("شماره موبایل یا رمز عبور اشتباه است.", 401);
}

// بررسی تایید دانش‌آموزان ثبت‌نامی جدید
if ($user['role'] === 'student' && empty($user['advisor_id'])) {
    json_error("ثبت‌نام شما انجام شده است. لطفاً تا بررسی و تخصیص مشاور توسط مدیریت منتظر بمانید.", 403);
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
