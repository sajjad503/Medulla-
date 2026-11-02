#!/bin/bash
# ==============================================================
# اسکریپت ارسال خودکار برنچ‌های مدولا (main و php-edition) به گیت‌هاب
# سازگار با نسخه ویندوز ۷ و هاست اشتراکی
# ==============================================================

if [ -z "$1" ]; then
    echo "❌ خطا: لطفاً آدرس مخزن گیت‌هاب خود را وارد کنید."
    echo "مثال استفاده:"
    echo "  bash scripts/push_to_github.sh https://github.com/USERNAME/medulla.git"
    exit 1
fi

REPO_URL=$1

# بررسی و ایجاد ریپوزیتوری گیت در صورت لزوم
if [ ! -d ".git" ]; then
    echo "⚙️ در حال راه‌اندازی اولیه Git..."
    git init -b main
    git config user.name "Sajjad Hamedi"
    git config user.email "sajjad.s27.2004@gmail.com"
fi

# افزودن فایل‌های فشرده به gitignore جهت جلوگیری از سنگین شدن مخزن
if ! grep -q "*.zip" .gitignore 2>/dev/null; then
    echo "*.zip" >> .gitignore
fi

echo "📦 در حال ثبت تغییرات روی برنچ main..."
git checkout -B main
git add .
git commit -m "feat: main branch with complete Medulla platform and Windows 7 compatibility" 2>/dev/null || true

echo "🌿 در حال آماده‌سازی برنچ اختصاصی php-edition..."
git checkout -B php-edition
git add .
git commit -m "feat(php-edition): dedicated PHP & Windows 7 edition with native launchers and router" 2>/dev/null || true

echo "🔗 اتصال به مخزن گیت‌هاب: $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "🚀 در حال ارسال برنچ main به گیت‌هاب..."
git push -u origin main --force

echo "🚀 در حال ارسال برنچ اختصاصی php-edition به گیت‌هاب..."
git push -u origin php-edition --force

echo ""
echo "================================================================"
echo "✅ هر دو برنچ با موفقیت در گیت‌هاب بارگذاری شدند!"
echo "📍 برنچ اصلی: main"
echo "📍 برنچ اختصاصی PHP و نسخه ویندوز ۷: php-edition"
echo "================================================================"
