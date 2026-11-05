<?php
/**
 * پلتفرم مدولا - آپلود امن نتایج آزمون‌های شخصیت‌شناسی و رغبت‌سنجی
 * آدرس: api/upload_test.php
 */
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    json_error("تنها متد POST مجاز است.", 405);
}

// ایجاد پوشه آپلود امن در صورت عدم وجود
$uploadDir = dirname(__DIR__) . '/uploads/tests/';
if (!file_exists($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
    // فایل امنیتی htaccess جهت جلوگیری از اجرای مستقیم اسکریپت‌ها در پوشه آپلود
    @file_put_contents($uploadDir . '.htaccess', "Options -Indexes\n<FilesMatch \"\.(php|phtml|php5|php7|phar)$\">\nOrder Deny,Allow\nDeny from all\n</FilesMatch>\n");
}

// دریافت اطلاعات تکمیلی
$testKey = trim($_POST['test_key'] ?? 'general');
$testTitle = trim($_POST['test_title'] ?? 'کارنامه آزمون');
$studentId = isset($_POST['student_id']) ? (int)$_POST['student_id'] : 0;
$phone = trim($_POST['phone_number'] ?? '');

// اگر کاربر لاگین بود، استخراج شناسه
$token = get_bearer_token();
if ($token) {
    $decoded = verify_jwt($token);
    if ($decoded && isset($decoded['id'])) {
        $studentId = (int)$decoded['id'];
    }
}

// اگر شناسه نبود ولی شماره موبایل ارسال شده بود (مثلاً در فرم ثبت‌نام)
if (!$studentId && !empty($phone)) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE phone_number = ? LIMIT 1");
    $stmt->execute([$phone]);
    $u = $stmt->fetch();
    if ($u) $studentId = (int)$u['id'];
}

// بررسی وجود فایل
if (!isset($_FILES['test_file']) || $_FILES['test_file']['error'] !== UPLOAD_ERR_OK) {
    // پشتیبانی از فرمت Base64 در بدنه JSON اگر به صورت JSON ارسال شده باشد
    $input = get_json_input();
    if (!empty($input['file_base64']) && !empty($input['file_name'])) {
        $fileName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $input['file_name']);
        $fileData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $input['file_base64']));
        
        if (strlen($fileData) > 5 * 1024 * 1024) {
            json_error("حجم فایل نباید بیشتر از ۵ مگابایت باشد.", 400);
        }

        $safeName = uniqid('test_', true) . '_' . $fileName;
        file_put_contents($uploadDir . $safeName, $fileData);
        $fileUrl = '/uploads/tests/' . $safeName;

        // ذخیره در دیتابیس
        if ($studentId > 0) {
            $stmt = $pdo->prepare("
                INSERT INTO student_assessment_uploads (student_id, test_key, test_title, file_url, file_name, file_size, file_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$studentId, $testKey, $testTitle, $fileUrl, $fileName, strlen($fileData), 'image/jpeg']);
        }

        json_response([
            "success" => true,
            "message" => "فایل کارنامه با موفقیت آپلود شد.",
            "file_url" => $fileUrl,
            "file_name" => $fileName
        ]);
    }

    json_error("فایلی دریافت نشد یا خطایی در ارسال رخ داد.", 400);
}

$file = $_FILES['test_file'];

// ۱. اعتبارسنجی حجم فایل (حداکثر ۵ مگابایت)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    json_error("حجم فایل ارسالی بیش از ۵ مگابایت است. لطفاً فایل کم‌حجم‌تری انتخاب نمایید.", 400);
}

// ۲. اعتبارسنجی نوع فایل (MIME Type و پسوند مجاز)
$allowedMimes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'application/pdf' => 'pdf'
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!array_key_exists($mime, $allowedMimes)) {
    json_error("فرمت فایل غیرمجاز است. تنها آپلود تصاویر (JPG, PNG, WebP) و اسناد PDF مجاز است.", 400);
}

$origName = basename($file['name']);
$ext = $allowedMimes[$mime];
$safeName = 'test_' . bin2hex(random_bytes(8)) . '_' . time() . '.' . $ext;
$destPath = $uploadDir . $safeName;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    json_error("خطا در ذخیره‌سازی امن فایل روی سرور.", 500);
}

$fileUrl = '/uploads/tests/' . $safeName;

// ۳. ثبت در دیتابیس
if ($studentId > 0) {
    $stmt = $pdo->prepare("
        INSERT INTO student_assessment_uploads (student_id, test_key, test_title, file_url, file_name, file_size, file_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$studentId, $testKey, $testTitle, $fileUrl, $origName, $file['size'], $mime]);
}

json_response([
    "success" => true,
    "message" => "کارنامه آزمون با موفقیت بارگذاری شد.",
    "file_url" => $fileUrl,
    "file_name" => $origName,
    "file_size" => $file['size'],
    "file_type" => $mime
]);
