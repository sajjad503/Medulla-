-- ====================================================================
-- پلتفرم جامع هدایت تحصیلی و کنکور مدولاس (Medullas)
-- اسکریپت نصب کامل پایگاه داده از صفر (Fresh Installation)
-- شامل تمامی جداول، کلیدهای خارجی و داده‌های اولیه
-- کدگذاری: utf8mb4_unicode_ci
-- مسیر: database/schema_install.sql
-- ====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `medulla_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `medulla_db`;

-- --------------------------------------------------------------------
-- ۱. جدول آکادمی‌ها و موسسات آموزشی (academies / workspaces)
-- سلسله‌مراتب: زیر نظر مدیر کل (Superadmin)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `workspaces`;
DROP TABLE IF EXISTS `academies`;
CREATE TABLE `academies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'نام موسسه / آکادمی',
  `manager_id` INT UNSIGNED NULL COMMENT 'شناسه کاربر مدیر موسسه',
  `manager_name` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `debt` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `revenue` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_manager` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد ویو یا جدول مستعار برای سازگاری عقب‌رو
CREATE TABLE `workspaces` LIKE `academies`;

-- --------------------------------------------------------------------
-- ۲. جدول جامع کاربران (users)
-- سلسله‌مراتب: مدیر کل -> مدیر آکادمی -> مشاور (وابسته یا مستقل) -> دانش‌آموز -> اولیا
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT UNSIGNED DEFAULT NULL COMMENT 'شناسه موسسه متبوع (در صورت مستقل بودن مشاور، NULL است)',
  `role` ENUM('founder', 'superadmin', 'manager', 'advisor', 'student', 'parent') NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `custom_group` VARCHAR(100) DEFAULT NULL,
  `grade` VARCHAR(100) DEFAULT NULL,
  `invite_code` VARCHAR(50) DEFAULT NULL,
  `advisor_id` INT UNSIGNED DEFAULT NULL COMMENT 'مشاور تخصیص داده شده به این دانش‌آموز',
  `student_id` INT UNSIGNED DEFAULT NULL COMMENT 'برای اولیا جهت اتصال به فرزند',
  `child_name` VARCHAR(255) DEFAULT NULL,
  `parent_phone` VARCHAR(50) DEFAULT NULL,
  `taraz` INT DEFAULT 0,
  `school_name` VARCHAR(255) DEFAULT NULL,
  `target_field` VARCHAR(255) DEFAULT NULL,
  `is_independent` TINYINT(1) DEFAULT 0 COMMENT '۱ یعنی مشاور مستقل از هر موسسه و مستقیم زیر نظر مدیر کل',
  `onboarded` TINYINT(1) DEFAULT 1,
  `subscription_status` VARCHAR(50) DEFAULT 'paid',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone_number`),
  INDEX `idx_role` (`role`),
  INDEX `idx_workspace` (`workspace_id`),
  INDEX `idx_advisor` (`advisor_id`),
  CONSTRAINT `fk_user_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `academies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۳. جدول تکالیف دانش‌آموزان (homeworks)
-- مشاور برای دانش‌آموز تعیین می‌کند؛ دانش‌آموز تیک انجام می‌دهد
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `homeworks`;
CREATE TABLE `homeworks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT UNSIGNED DEFAULT NULL COMMENT 'موسسه مربوطه جهت نظارت مدیر آکادمی',
  `advisor_id` INT UNSIGNED NOT NULL COMMENT 'مشاور تعیین‌کننده تکلیف',
  `student_id` INT UNSIGNED NOT NULL COMMENT 'دانش‌آموز دریافت‌کننده تکلیف',
  `title` VARCHAR(255) NOT NULL COMMENT 'عنوان تکلیف',
  `description` TEXT NULL COMMENT 'شرح و جزئیات مباحث مورد مطالعه یا حل تست',
  `subject` VARCHAR(100) DEFAULT 'عمومی' COMMENT 'درس مربوطه',
  `due_date` VARCHAR(50) NOT NULL COMMENT 'مهلت انجام (تاریخ شمسی)',
  `status` ENUM('pending', 'completed', 'overdue') NOT NULL DEFAULT 'pending',
  `student_note` TEXT NULL COMMENT 'یادداشت یا توضیحات دانش‌آموز پس از انجام',
  `advisor_feedback` TEXT NULL COMMENT 'بازخورد یا نظر مشاور',
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_hw` (`student_id`),
  INDEX `idx_advisor_hw` (`advisor_id`),
  INDEX `idx_workspace_hw` (`workspace_id`),
  CONSTRAINT `fk_hw_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hw_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hw_workspace` FOREIGN KEY (`workspace_id`) REFERENCES `academies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۴. جدول آزمون‌های روان‌شناختی و فایل‌های کارنامه آپلود شده (student_assessment_uploads)
-- شامل کارنامه‌های MBTI، هالند، گاردنر، وارک و مهارت مطالعه
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `student_assessment_uploads`;
CREATE TABLE `student_assessment_uploads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `test_key` VARCHAR(50) NOT NULL COMMENT 'کلید آزمون (mbti, holland, gardner, vark, study_skills)',
  `test_title` VARCHAR(255) NOT NULL COMMENT 'عنوان فارسی آزمون',
  `file_url` LONGTEXT NOT NULL COMMENT 'آدرس فایل آپلود شده',
  `file_name` VARCHAR(255) NOT NULL COMMENT 'نام اصلی فایل',
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `file_type` VARCHAR(100) NOT NULL COMMENT 'نوع فایل (image/png, application/pdf, ...)',
  `advisor_notes` TEXT NULL COMMENT 'یادداشت و تحلیل مشاور روی کارنامه',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_test` (`student_id`),
  CONSTRAINT `fk_test_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۵. جدول برنامه‌های هفتگی مطالعه (study_plans)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `study_plans`;
CREATE TABLE `study_plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `advisor_id` INT UNSIGNED NOT NULL,
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `plan_data` LONGTEXT NOT NULL,
  `is_approved` TINYINT(1) DEFAULT 1,
  `feedback` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_plan_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۶. جدول گزارش‌های کار روزانه (work_reports)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `work_reports`;
CREATE TABLE `work_reports` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `report_date` VARCHAR(50) NOT NULL,
  `total_study_time` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `total_test_count` INT NOT NULL DEFAULT 0,
  `report_items` LONGTEXT NOT NULL,
  `student_note` TEXT DEFAULT NULL,
  `is_read_by_advisor` TINYINT(1) DEFAULT 0,
  `advisor_feedback` TEXT DEFAULT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_report_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۷. جدول برنامه‌ریز روزانه تفصیلی ۲۴ ساعته (daily_planner)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `daily_planner`;
CREATE TABLE `daily_planner` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `planner_date` VARCHAR(50) NOT NULL,
  `blocks` LONGTEXT NOT NULL,
  `sleep_hours` DECIMAL(4,1) DEFAULT 7.0,
  `mood` VARCHAR(50) DEFAULT 'عالی',
  `total_focus_time` DECIMAL(5,2) DEFAULT 0.00,
  `advisor_review` LONGTEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_planner_date` (`student_id`, `planner_date`),
  CONSTRAINT `fk_planner_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۸. جدول جلسات و تماس‌ها (advisor_events)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `advisor_events`;
CREATE TABLE `advisor_events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `advisor_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED DEFAULT NULL,
  `event_date` VARCHAR(50) NOT NULL,
  `event_time` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(50) NOT NULL DEFAULT 'meeting',
  `status` VARCHAR(50) DEFAULT 'scheduled',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۹. جدول پیام‌رسانی بین پنل‌ها (messages)
-- --------------------------------------------------------------------
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
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۱۰. جدول پرداخت‌ها و اشتراک‌ها (payments)
-- --------------------------------------------------------------------
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
  `notes` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- ۱۱. جدول تنظیمات پلتفرم (platform_settings) و لاگ‌های امنیتی (access_logs)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `access_logs`;
CREATE TABLE `access_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- داده‌های پایه و کاربران نمونه اولیه
-- هش رمز عبور ۱۲۳: $2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq
-- ====================================================================

-- درج موسسات
INSERT INTO `academies` (`id`, `name`, `manager_id`, `manager_name`, `phone`, `status`, `debt`, `revenue`) VALUES
(1, 'آکادمی هدف (شعبه مرکزی سمنان)', 2, 'مهندس رضایی', '09120000002', 'active', 0.00, 145000000.00),
(2, 'موسسه کنکور اندیشه و قلم', NULL, 'دکتر ناصری', '09121111111', 'active', 18500000.00, 62000000.00);

INSERT INTO `workspaces` SELECT * FROM `academies`;

-- درج کاربران
INSERT INTO `users` (`id`, `workspace_id`, `role`, `full_name`, `phone_number`, `password_hash`, `status`, `custom_group`, `grade`, `invite_code`, `advisor_id`, `student_id`, `is_independent`) VALUES
-- مدیر کل
(1, NULL, 'founder', 'سجاد حامدی (مدیر کل و صاحب پلتفرم)', '09910746198', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مدیر ارشد', 'سیستم', NULL, NULL, NULL, 0),
-- مدیر آکادمی
(2, 1, 'manager', 'مهندس رضایی', '09120000002', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مدیر آکادمی هدف', 'مدیریت', NULL, NULL, NULL, 0),
-- مشاور وابسته به آکادمی
(3, 1, 'advisor', 'دکتر کاظمی', '09120000003', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور ارشد آکادمی', 'پزشکی', 'KAZEMI', NULL, NULL, 0),
(30, 1, 'advisor', 'دکتر رضایی (مشاور ارشد سمنان)', '09100341562', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور ارشد', 'کنکور تجربی', 'MEDULLA', NULL, NULL, 0),
-- مشاور مستقل (بدون آکادمی - مستقیم زیر نظر مدیر کل)
(4, NULL, 'advisor', 'خانم دکتر سعیدی (مشاور مستقل)', '09120000005', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'مشاور مستقل کشوری', 'دندانپزشکی', 'SAEEDI', NULL, NULL, 1),
-- دانش‌آموزان
(5, 1, 'student', 'یاشا محبی', '09120000004', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'VIP آکادمی', 'دوازدهم تجربی', NULL, 3, NULL, 0),
(31, 1, 'student', 'دانش‌آموز اول (رشته تجربی)', '09100341563', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'VIP کنکور', 'دوازدهم تجربی', NULL, 30, NULL, 0),
(32, 1, 'student', 'دانش‌آموز دوم (رشته ریاضی)', '09100341564', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'عادی', 'دوازدهم ریاضی', NULL, 30, NULL, 0),
-- اولیا
(20, 1, 'parent', 'آقای محبی (ولی یاشا)', '09120000099', '$2y$10$E5zXgC7v0Jd4b9Qj5wXGce7QYxQ4KkP8k7sD3vH2rJzJ9y2m9H4Wq', 'active', 'اولیا', 'اولیا', NULL, NULL, 5, 0);

-- درج تکالیف نمونه اولیه
INSERT INTO `homeworks` (`id`, `workspace_id`, `advisor_id`, `student_id`, `title`, `description`, `subject`, `due_date`, `status`, `student_note`) VALUES
(1, 1, 3, 5, 'حل ۵۰ تست زمان‌دار زیست گفتار ۲ فصل گوارش', 'تست‌های زوج کتاب منبع اول + تحلیل تک تک گزینه‌ها', 'زیست‌شناسی', '۱۴۰۵/۰۸/۱۰', 'completed', 'تمام تست‌ها در ۷۵ دقیقه حل شد با درصد ۸۴٪.'),
(2, 1, 3, 5, 'خلاصه‌نویسی مبحث استوکیومتری و روابط جرمی', 'نوشتن فرمول‌های فرار در دفترچه کپسول', 'شیمی', '۱۴۰۵/۰۸/۱۲', 'pending', NULL),
(3, 1, 30, 31, 'آزمونک ۲۰ سوالی حرکت‌شناسی فیزیک', 'پاسخگویی به سوالات بر اساس تایمر ۳۰ دقیقه‌ای', 'فیزیک', '۱۴۰۵/۰۸/۰۸', 'overdue', NULL);

-- درج آزمون‌های نمونه آپلود شده
INSERT INTO `student_assessment_uploads` (`id`, `student_id`, `test_key`, `test_title`, `file_url`, `file_name`, `file_size`, `file_type`, `advisor_notes`) VALUES
(1, 5, 'mbti', 'آزمون شخصیت‌شناسی MBTI (تیپ INTJ)', 'https://images.unsplash.com/photo-1584697964190-7bb91148e658?w=800', 'mbti_result_yasha.pdf', 245000, 'application/pdf', 'دانش‌آموز تیپ استراتژیست است؛ برنامه‌های منعطف اما با چارچوب دقیق عملکرد بهتری خواهد داشت.'),
(2, 5, 'holland', 'آزمون رغبت‌سنجی شغلی هالند (کد IAS)', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800', 'holland_test.jpg', 180000, 'image/jpeg', 'گرایش شدید به تحقیقات علمی و پزشکی.');

-- درج تنظیمات پلتفرم
INSERT INTO `platform_settings` (`setting_key`, `setting_value`) VALUES
('student_fee', '490000'),
('card_number', '6219861408052453'),
('card_holder', 'سجاد حامدی'),
('bank_name', 'بانک سامان'),
('site_title', 'پلتفرم جامع هدایت تحصیلی و کنکور مدولاس');

SET FOREIGN_KEY_CHECKS = 1;
