# نسخه قدیمی و بایگانی‌شده بک‌اند پایتون (Python / FastAPI)
## Medulla Platform - Legacy Python Backend (Archived)

> ⚠️ **توجه مهم:** این نسخه دیگر توسعه داده نمی‌شود و به‌روزرسانی نخواهد شد. تمامی قابلیت‌های جدید، امنیت، اتصال به دیتابیس و ارتباط پنل‌ها به پلتفرم اصلی **PHP + MySQL** منتقل شده است.
> 
> اگر قصد استقرار نسخه جدید و فعال سایت مدولا را دارید، از پوشه اصلی پروژه و بک‌اند **PHP** در پوشه `api/` یا `backend-php/` استفاده کنید.

---

### محتویات این پوشه (مخصوص کسانی که تمایل به استفاده از نسخه پایتون دارند):
- `main.py`: سرور اصلی FastAPI
- `database.py`: اتصال به پایگاه داده
- `security.py`: توابع احراز هویت با JWT
- `schemas.py`: مدل‌های داده‌ای Pydantic
- `routers/`: روت‌های سیستم مشاوره و امور تحصیلی
- `requirements.txt`: نیازمندی‌های پایتون (`pip install -r requirements.txt`)
- `liara.json`: پیکربندی استقرار پایتون در لیارا

### نحوه اجرای نسخه پایتون:
```bash
python -m venv venv
source venv/bin/activate  # در ویندوز: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
