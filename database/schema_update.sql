-- ====================================================================
-- پلتفرم مدولاس (Medullas) - اسکریپت به‌روزرسانی دیتابیس بدون از دست رفتن اطلاعات
-- (Database Migration & Non-Destructive Update Script)
-- این فایل ساختارهای جدید را اضافه می‌کند و هیچ داده‌ای را پاک نمی‌کند.
-- مسیر: database/schema_update.sql
-- ====================================================================

SET NAMES utf8mb4;

-- ۱. ایجاد جدول تکالیف دانش‌آموزان در صورت عدم وجود
CREATE TABLE IF NOT EXISTS `homeworks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `workspace_id` INT UNSIGNED DEFAULT NULL COMMENT 'موسسه مربوطه',
  `advisor_id` INT UNSIGNED NOT NULL COMMENT 'مشاور تعیین‌کننده تکلیف',
  `student_id` INT UNSIGNED NOT NULL COMMENT 'دانش‌آموز دریافت‌کننده',
  `title` VARCHAR(255) NOT NULL COMMENT 'عنوان تکلیف',
  `description` TEXT NULL COMMENT 'شرح تکلیف',
  `subject` VARCHAR(100) DEFAULT 'عمومی' COMMENT 'درس مربوطه',
  `due_date` VARCHAR(50) NOT NULL COMMENT 'مهلت انجام',
  `status` ENUM('pending', 'completed', 'overdue') NOT NULL DEFAULT 'pending',
  `student_note` TEXT NULL,
  `advisor_feedback` TEXT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_hw` (`student_id`),
  INDEX `idx_advisor_hw` (`advisor_id`),
  INDEX `idx_workspace_hw` (`workspace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۲. ایجاد جدول آپلود نتایج آزمون‌های شخصیت‌شناسی در صورت عدم وجود
CREATE TABLE IF NOT EXISTS `student_assessment_uploads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT UNSIGNED NOT NULL,
  `test_key` VARCHAR(50) NOT NULL,
  `test_title` VARCHAR(255) NOT NULL,
  `file_url` LONGTEXT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `file_type` VARCHAR(100) NOT NULL,
  `advisor_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_student_test` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ۳. افزودن فیلد مشاور مستقل به جدول کاربران در صورت عدم وجود
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'is_independent'
);

SET @sql_stmt = IF(@col_exists = 0, 
    'ALTER TABLE `users` ADD COLUMN `is_independent` TINYINT(1) DEFAULT 0 COMMENT "مشاور مستقل بدون موسسه" AFTER `target_field`;', 
    'SELECT "Column is_independent already exists";'
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ۴. اطمینان از وجود نقش superadmin و founder در ENUM ستون role
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('founder', 'superadmin', 'manager', 'advisor', 'student', 'parent') NOT NULL;

-- ۵. ایجاد جدول آکادمی‌ها در صورت عدم وجود (همگام با workspaces)
CREATE TABLE IF NOT EXISTS `academies` LIKE `workspaces`;

-- ۶. اضافه کردن نمونه تکلیف پیش‌فرض جهت تست سیستم
INSERT INTO `homeworks` (`workspace_id`, `advisor_id`, `student_id`, `title`, `description`, `subject`, `due_date`, `status`, `student_note`)
SELECT 1, 3, 5, 'حل ۵۰ تست زمان‌دار زیست گفتار ۲ فصل گوارش', 'تست‌های زوج کتاب منبع اول + تحلیل تک تک گزینه‌ها', 'زیست‌شناسی', '۱۴۰۵/۰۸/۱۰', 'completed', 'تمام تست‌ها در ۷۵ دقیقه حل شد با درصد ۸۴٪.'
WHERE NOT EXISTS (SELECT id FROM `homeworks` WHERE `student_id` = 5 LIMIT 1);
