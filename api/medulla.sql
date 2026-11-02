-- ==============================================================
-- پایگاه داده پلتفرم مشاوره تحصیلی مدولا (Medulla)
-- مخصوص ایمپورت مستقیم در phpMyAdmin (هاست اشتراکی cPanel / DirectAdmin)
-- سازگار با MySQL 5.7+ و MariaDB 10.3+
-- کدگذاری: utf8mb4_unicode_ci
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ایجاد و آماده‌سازی دیتابیس (اختیاری در صورت انتخاب دیتابیس در phpMyAdmin)
CREATE DATABASE IF NOT EXISTS `medulla_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medulla_db`;

-- --------------------------------------------------------
-- ۱. جدول موسسات و آکادمی‌ها (workspaces)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `workspaces`;
CREATE TABLE `workspaces` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'نام موسسه / آکادمی',
  `manager_id` INT UNSIGNED NULL,
  `manager_name` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `debt` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'بدهی به تومان',
  `revenue` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'درآمد به تومان',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `workspaces` (`id`, `name`, `manager_id`, `manager_name`, `phone`, `status`, `debt`, `revenue`) VALUES
(1, 'آکادمی هدف (شعبه مرکزی سمنان)', 2, 'مهندس رضایی', '09120000002', 'active', 0.00, 145000000.00),
(2, 'موسسه کنکور اندیشه و قلم', 11, 'دکتر ناصری', '09121111111', 'active', 18500000.00, 62000000.00),
(3, 'آکادمی نخبگان شریف', 12, 'مهندس کاویانی', '09122222222', 'suspended', 32000000.00, 38000000.00);

-- --------------------------------------------------------
-- ۲. جدول کاربران کل سیستم (users)
-- شامل: مدیر کل (founder)، مدیر موسسه (manager)، مشاور (advisor)، دانش‌آموز (student)، اولیا (parent)
-- رمز عبور پیش‌فرض تمام کاربران تست: 123
-- هش bcrypt معادل با 123: $2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT UNSIGNED DEFAULT 1,
  `role` ENUM('founder', 'manager', 'advisor', 'student', 'parent') NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `custom_group` VARCHAR(100) DEFAULT NULL,
  `grade` VARCHAR(100) DEFAULT NULL,
  `invite_code` VARCHAR(50) DEFAULT NULL,
  `advisor_id` INT UNSIGNED DEFAULT NULL,
  `student_id` INT UNSIGNED DEFAULT NULL COMMENT 'برای نقش اولیا جهت اتصال به فرزند',
  `child_name` VARCHAR(255) DEFAULT NULL,
  `parent_phone` VARCHAR(50) DEFAULT NULL,
  `taraz` INT DEFAULT 0,
  `school_name` VARCHAR(255) DEFAULT NULL,
  `target_field` VARCHAR(255) DEFAULT NULL,
  `onboarded` TINYINT(1) DEFAULT 1,
  `subscription_status` VARCHAR(50) DEFAULT 'paid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone_number`),
  INDEX `idx_role` (`role`),
  INDEX `idx_advisor` (`advisor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- درج کاربران تست با رمز ۱۲۳:
INSERT INTO `users` (`id`, `workspace_id`, `role`, `full_name`, `phone_number`, `password_hash`, `status`, `custom_group`, `grade`, `invite_code`, `advisor_id`, `student_id`, `child_name`, `parent_phone`, `taraz`, `school_name`, `target_field`, `onboarded`, `subscription_status`) VALUES
-- ۱. مدیر کل پلتفرم (Founder)
(1, 1, 'founder', 'سجاد حامدی (مدیر کل و صاحب پلتفرم)', '09910746198', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مدیر ارشد', 'سیستم', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, 'paid'),
-- ۲. مدیر موسسه (Manager)
(2, 1, 'manager', 'مهندس رضایی', '09120000002', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مدیر آکادمی', 'مدیریت', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, 'paid'),
-- ۳. مشاوران تخصصی
(3, 1, 'advisor', 'دکتر کاظمی', '09120000003', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور ارشد', 'پزشکی', 'KAZEMI', NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, 'paid'),
(4, 1, 'advisor', 'خانم دکتر سعیدی', '09120000005', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور تخصصی', 'دندانپزشکی', 'SAEEDI', NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, 'paid'),
(30, 1, 'advisor', 'دکتر رضایی (مشاور ارشد مدولا سمنان)', '09100341562', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور ارشد سمنان', 'هدایت تحصیلی و کنکور', 'MEDULLA', NULL, NULL, NULL, NULL, 0, NULL, NULL, 1, 'paid'),
-- ۴. دانش‌آموزان
(5, 1, 'student', 'یاشا محبی', '09120000004', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'VIP کنکور', 'دوازدهم تجربی', NULL, 3, NULL, NULL, '09120000099', 7120, 'دبیرستان علامه حلی', 'پزشکی دانشگاه تهران', 1, 'paid'),
(6, 1, 'student', 'سارا امینی', '09120000006', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'عادی', 'دوازدهم تجربی', NULL, 3, NULL, NULL, '09120000098', 6850, 'دبیرستان فرزانگان', 'داروسازی شهید بهشتی', 1, 'paid'),
(7, 1, 'student', 'آریا صبوری', '09120000007', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'عادی', 'یازدهم تجربی', NULL, 3, NULL, NULL, '09120000097', 6400, 'دبیرستان البرز', 'دندانپزشکی دانشگاه شیراز', 1, 'paid'),
(31, 1, 'student', 'دانش‌آموز اول (رشته تجربی - سمنان)', '09100341563', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'VIP کنکور ۱۴۰۵', 'دوازدهم تجربی', NULL, 30, NULL, NULL, '09100341569', 7150, 'دبیرستان شهید بهشتی سمنان', 'پزشکی دانشگاه تهران', 1, 'paid'),
(32, 1, 'student', 'دانش‌آموز دوم (رشته ریاضی - سمنان)', '09100341564', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'VIP کنکور ۱۴۰۵', 'دوازدهم ریاضی', NULL, 30, NULL, NULL, '09100341568', 6920, 'دبیرستان نمونه دولتی سمنان', 'مهندسی کامپیوتر دانشگاه شریف', 1, 'paid'),
-- ۵. اولیا (Parent)
(20, 1, 'parent', 'آقای محبی (ولی یاشا محبی)', '09120000099', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'اولیا', 'اولیا', NULL, NULL, 5, 'یاشا محبی', '09120000099', 0, NULL, NULL, 1, 'paid'),
(21, 1, 'parent', 'ولی دانش‌آموز اول (سمنان)', '09100341569', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'اولیا', 'اولیا', NULL, NULL, 31, 'دانش‌آموز اول (رشته تجربی)', '09100341569', 0, NULL, NULL, 1, 'paid');

-- --------------------------------------------------------
-- ۳. جدول برنامه‌های هفتگی مطالعه (study_plans)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `study_plans`;
CREATE TABLE `study_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `advisor_id` INT UNSIGNED NOT NULL,
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `plan_data` LONGTEXT NOT NULL COMMENT 'JSON structure of days and subjects',
  `is_approved` TINYINT(1) DEFAULT 1,
  `feedback` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_plan` (`student_id`),
  INDEX `idx_advisor_plan` (`advisor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `study_plans` (`id`, `student_id`, `advisor_id`, `start_date`, `end_date`, `plan_data`, `is_approved`, `feedback`) VALUES
(1, 5, 3, '۱۴۰۵/۰۸/۰۱', '۱۴۰۵/۰۸/۰۷', '{"شنبه":[{"title":"زیست‌شناسی دهم - فصل گوارش","duration":90,"description":"مطالعه دقیق متن کتاب + حل ۴۰ تست آموزشی","isDone":true},{"title":"شیمی یازدهم - استوکیومتری","duration":75,"description":"مرور فرمول‌ها + حل ۲۵ تست زمان‌دار","isDone":true},{"title":"ریاضیات جامع - مشتق","duration":90,"description":"حل تست‌های کنکور ۹۸ تا ۱۴۰۲","isDone":false}],"یکشنبه":[{"title":"فیزیک دوازدهم - حرکت‌شناسی","duration":90,"description":"نمودارهای مکان-زمان + ۳۰ تست","isDone":true},{"title":"زیست دوازدهم - رونویسی ژنتیک","duration":90,"description":"بررسی تصاویر کتاب و دام‌های تستی","isDone":false}],"دوشنبه":[{"title":"شیمی دهم - ساختار اتم","duration":75,"description":"تست‌های مضرب ۳ گاج نقره‌ای","isDone":false},{"title":"ریاضیات - مثلثات","duration":90,"description":"رفع اشکال آزمون قلم‌چی","isDone":false}],"سه‌شنبه":[{"title":"زیست - گردش مواد","duration":90,"description":"ترکیب نوار قلب با گردش لنفاوی","isDone":false}],"چهارشنبه":[{"title":"فیزیک - نوسان و امواج","duration":90,"description":"فرمول‌های سرعت موج و صوت","isDone":false}],"پنجشنبه":[{"title":"شبیه‌سازی آزمونک جامع","duration":60,"description":"آزمون زمان‌دار جهت آمادگی جمعه","isDone":false}],"جمعه":[{"title":"آزمون آزمایشی ماز/قلم‌چی","duration":210,"description":"تحلیل کامل پس از آزمون","isDone":false}]}', 1, 'برنامه منظم و هدفمند است. حتماً تست‌های زمان‌دار زیست را در اولویت قرار بده.');

-- --------------------------------------------------------
-- ۴. جدول گزارش‌های کار روزانه دانش‌آموز (work_reports)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `work_reports`;
CREATE TABLE `work_reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `report_date` VARCHAR(50) NOT NULL,
  `total_study_time` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `total_test_count` INT NOT NULL DEFAULT 0,
  `report_items` LONGTEXT NOT NULL COMMENT 'JSON structure of subjects, hours, tests',
  `student_note` TEXT DEFAULT NULL,
  `is_read_by_advisor` TINYINT(1) DEFAULT 0,
  `advisor_feedback` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_report` (`student_id`),
  INDEX `idx_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `work_reports` (`id`, `student_id`, `report_date`, `total_study_time`, `total_test_count`, `report_items`, `student_note`, `is_read_by_advisor`, `advisor_feedback`, `status`) VALUES
(1, 5, '2026-10-24', 6.50, 120, '{"زیست‌شناسی":{"time":2.5,"tests":55},"شیمی":{"time":2.0,"tests":35},"فیزیک":{"time":2.0,"tests":30}}', 'کپسول مرور: لنفوسیت T در تیموس بالغ می‌شود. آنتالپی پیوند همیشه مثبت است.', 1, 'عالی بود یاشا جان. سرعت تست‌زنی شیمی بهتر شده.', 'approved'),
(2, 5, '2026-10-25', 7.00, 145, '{"زیست‌شناسی":{"time":3.0,"tests":70},"ریاضیات":{"time":2.0,"tests":40},"شیمی":{"time":2.0,"tests":35}}', 'تست‌های زمان‌دار زیست رو با درصد ۸۱٪ زدم.', 1, 'نتیجه فوق‌العاده است، همین پیوستگی را حفظ کن.', 'approved');

-- --------------------------------------------------------
-- ۵. جدول برنامه‌ریز روزانه تفصیلی ۲۴ ساعته (daily_planner)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `daily_planner`;
CREATE TABLE `daily_planner` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `planner_date` VARCHAR(50) NOT NULL,
  `blocks` LONGTEXT NOT NULL COMMENT 'JSON: 24h timeline blocks and categories',
  `sleep_hours` DECIMAL(4,1) DEFAULT 7.0,
  `mood` VARCHAR(50) DEFAULT 'عالی',
  `total_focus_time` DECIMAL(5,2) DEFAULT 0.00,
  `advisor_review` LONGTEXT DEFAULT NULL COMMENT 'JSON: review status, feedback, score',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_date` (`student_id`, `planner_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `daily_planner` (`id`, `student_id`, `planner_date`, `blocks`, `sleep_hours`, `mood`, `total_focus_time`, `advisor_review`) VALUES
(1, 5, '2026-10-25', '[{"id":1,"startTime":"07:00","endTime":"08:30","category":"study","title":"زیست‌شناسی - فصل گوارش","completed":true,"notes":"مرور سریع نکات"},{"id":2,"startTime":"08:45","endTime":"10:15","category":"study","title":"تست‌زنی زیست","completed":true,"notes":"۴۰ تست آموزشی"},{"id":3,"startTime":"10:30","endTime":"12:30","category":"study","title":"شیمی استوکیومتری","completed":true,"notes":"فرمول‌های ترکیبی"},{"id":4,"startTime":"12:30","endTime":"14:00","category":"rest","title":"ناهار و استراحت","completed":true,"notes":""},{"id":5,"startTime":"14:00","endTime":"16:00","category":"study","title":"ریاضیات کاربرد مشتق","completed":false,"notes":""}]', 7.0, 'عالی', 5.50, '{"reviewed":true,"advisor_name":"دکتر کاظمی","score":95,"comment":"تقسیم‌بندی زمان عالی بود؛ برای ساعت ۱۶ به بعد پارت مرور اضافه شود."}');

-- --------------------------------------------------------
-- ۶. جدول رویدادها، جلسات و تماس‌ها (advisor_events)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `advisor_events`;
CREATE TABLE `advisor_events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `advisor_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED DEFAULT NULL,
  `event_date` VARCHAR(50) NOT NULL,
  `event_time` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(50) NOT NULL DEFAULT 'meeting' COMMENT 'meeting, call, consultation',
  `status` VARCHAR(50) DEFAULT 'scheduled',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_advisor_event` (`advisor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `advisor_events` (`id`, `advisor_id`, `student_id`, `event_date`, `event_time`, `title`, `event_type`, `status`) VALUES
(1, 3, 5, '۱۴۰۵/۰۸/۰۴', '۱۸:۳۰', 'تماس تلفنی بررسی کارنامه ماز یاشا محبی', 'call', 'scheduled'),
(2, 3, 5, '۱۴۰۵/۰۸/۰۶', '۱۹:۰۰', 'جلسه آنلاین تنظیم برنامه هفتگی جدید', 'meeting', 'scheduled');

-- --------------------------------------------------------
-- ۷. جدول پیام‌رسانی بین پنل‌ها (messages)
-- پشتیبانی از: پیام مشاور به اولیا، اولیا به مشاور، موسسه به مشاور
-- --------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT UNSIGNED NOT NULL,
  `receiver_id` INT UNSIGNED NOT NULL,
  `sender_role` VARCHAR(50) NOT NULL,
  `receiver_role` VARCHAR(50) NOT NULL,
  `student_id` INT UNSIGNED DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_receiver` (`receiver_id`),
  INDEX `idx_student_msg` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `sender_role`, `receiver_role`, `student_id`, `message`, `is_read`, `created_at`) VALUES
(1, 3, 20, 'advisor', 'parent', 5, 'سلام جناب محبی گرامی، روند مطالعاتی یاشا در درس زیست‌شناسی در هفته گذشته رشد چشمگیری داشته است.', 1, '2026-10-24 18:00:00'),
(2, 3, 20, 'advisor', 'parent', 5, 'برنامه هفتگی جدید یاشا ثبت شد. میانگین ساعت مطالعه هدف‌گذاری شده روی ۷.۵ ساعت روزانه است.', 0, '2026-10-25 19:30:00');

-- --------------------------------------------------------
-- ۸. جدول پرداختی‌ها و فیش‌های واریزی (payments)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `student_phone` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL DEFAULT 490000.00,
  `method` VARCHAR(50) DEFAULT 'card_to_card',
  `status` ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  `tracking_code` VARCHAR(100) DEFAULT NULL,
  `receipt_image` TEXT DEFAULT NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `grace_until` TIMESTAMP NULL,
  `notes` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payments` (`id`, `student_id`, `student_name`, `student_phone`, `amount`, `method`, `status`, `tracking_code`, `receipt_image`, `notes`) VALUES
(1, 6, 'سارا امینی', '09120000006', 490000.00, 'card_to_card', 'pending', 'TRX-9842105', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'واریز کارت به کارت شتابی');

-- --------------------------------------------------------
-- ۹. جدول تنظیمات پلتفرم (platform_settings)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `platform_settings` (`setting_key`, `setting_value`) VALUES
('student_fee', '490000'),
('card_number', '6219861408052453'),
('card_holder', 'سجاد حامدی'),
('bank_name', 'بانک سامان'),
('site_title', 'پلتفرم جامع هدایت تحصیلی و کنکور مدولا');

SET FOREIGN_KEY_CHECKS = 1;
