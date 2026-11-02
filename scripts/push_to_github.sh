#!/bin/bash
# ==============================================================
# اسکریپت ارسال خودکار برنچ‌های مدولا (main و php-edition) به گیت‌هاب
# ==============================================================

if [ -z "$1" ]; then
    echo "❌ خطا: لطفاً آدرس مخزن گیت‌هاب خود را وارد کنید."
    echo "مثال استفاده:"
    echo "  bash scripts/push_to_github.sh https://github.com/USERNAME/medulla.git"
    exit 1
fi

REPO_URL=$1

echo "🔗 اتصال به مخزن گیت‌هاب: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "🚀 در حال ارسال برنچ main..."
git push -u origin main

echo "🚀 در حال ارسال برنچ اختصاصی php-edition..."
git push -u origin php-edition

echo "✅ هر دو برنچ با موفقیت در گیت‌هاب بارگذاری شدند!"
echo "📍 برنچ اصلی شامل هر دو پلتفرم (پایتون قدیمی و پایه جدید): main"
echo "📍 برنچ اختصاصی و خالص پلتفرم PHP آماده اجرا: php-edition"
