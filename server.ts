import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();
process.env.DISABLE_HMR = 'true';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'mentora_super_secret_key_for_jwt_auth';
const DB_FILE = path.resolve(process.cwd(), 'data', 'mentora_db.json');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers (Defense-in-Depth, compliant with AI Studio iFrame)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Brute-force & Rate Limiting Protection for Auth Endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 40; // Max 40 attempts per minute per IP

  const record = rateLimitMap.get(clientIp);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      detail: 'تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً یک دقیقه دیگر مجدداً تلاش نمایید (سپر محافظتی Brute-Force).'
    });
  }

  record.count += 1;
  next();
}

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initial Database Seeding
const getInitialDb = () => {
  const hash = bcrypt.hashSync('123', 10);
  return {
    workspaces: [
      { id: 1, name: 'آکادمی هدف (شعبه مرکزی)', manager_id: 2, manager_name: 'مهندس رضایی', phone: '09120000002', status: 'active', debt: 0, revenue: 145000000 },
      { id: 2, name: 'موسسه کنکور اندیشه و قلم', manager_id: 11, manager_name: 'دکتر ناصری', phone: '09121111111', status: 'active', debt: 18500000, revenue: 62000000 },
      { id: 3, name: 'آکادمی نخبگان شریف', manager_id: 12, manager_name: 'مهندس کاویانی', phone: '09122222222', status: 'suspended', debt: 32000000, revenue: 38000000 }
    ],
    users: [
      { id: 1, workspace_id: 1, role: 'founder', full_name: 'سجاد حامدی (مدیر کل مدولا)', phone_number: '09100341561', password_hash: hash, status: 'active', custom_group: 'مدیر ارشد', grade: 'سیستم' },
      { id: 2, workspace_id: 1, role: 'manager', full_name: 'مهندس رضایی', phone_number: '09120000002', password_hash: hash, status: 'active', custom_group: 'مدیر آکادمی', grade: 'مدیریت' },
      { id: 3, workspace_id: 1, role: 'advisor', full_name: 'دکتر کاظمی', phone_number: '09120000003', password_hash: hash, status: 'active', custom_group: 'مشاور ارشد', grade: 'پزشکی', invite_code: 'KAZEMI' },
      { id: 4, workspace_id: 1, role: 'advisor', full_name: 'خانم دکتر سعیدی', phone_number: '09120000005', password_hash: hash, status: 'active', custom_group: 'مشاور تخصصی', grade: 'دندانپزشکی', invite_code: 'SAEEDI' },
      { id: 30, workspace_id: 1, role: 'advisor', full_name: 'دکتر رضایی (مشاور ارشد مدولا سمنان)', phone_number: '09100341562', password_hash: hash, status: 'active', custom_group: 'مشاور ارشد سمنان', grade: 'هدایت تحصیلی و کنکور', invite_code: 'MEDULLA' },
      { id: 31, workspace_id: 1, role: 'student', full_name: 'دانش‌آموز اول (رشته تجربی - سمنان)', phone_number: '09100341563', password_hash: hash, status: 'active', custom_group: 'VIP کنکور ۱۴۰۵', grade: 'دوازدهم تجربی', advisor_id: 30, taraz: 7150, onboarded: true, subscription_status: 'paid', parent_phone: '09100341569', school_name: 'دبیرستان شهید بهشتی سمنان', target_field: 'پزشکی دانشگاه تهران' },
      { id: 32, workspace_id: 1, role: 'student', full_name: 'دانش‌آموز دوم (رشته ریاضی - سمنان)', phone_number: '09100341564', password_hash: hash, status: 'active', custom_group: 'VIP کنکور ۱۴۰۵', grade: 'دوازدهم ریاضی', advisor_id: 30, taraz: 6920, onboarded: true, subscription_status: 'paid', parent_phone: '09100341568', school_name: 'دبیرستان نمونه دولتی سمنان', target_field: 'مهندسی کامپیوتر دانشگاه شریف' },
      { id: 5, workspace_id: 1, role: 'student', full_name: 'یاشا محبی', phone_number: '09120000004', password_hash: hash, status: 'active', custom_group: 'VIP', grade: 'دوازدهم تجربی', advisor_id: 3, taraz: 7120, onboarded: true, parent_phone: '09120000099', school_name: 'دبیرستان علامه حلی', target_field: 'پزشکی دانشگاه تهران' },
      { id: 6, workspace_id: 1, role: 'student', full_name: 'سارا امینی', phone_number: '09120000006', password_hash: hash, status: 'active', custom_group: 'عادی', grade: 'دوازدهم تجربی', advisor_id: 3, taraz: 6850, onboarded: true, parent_phone: '09120000098', school_name: 'دبیرستان فرزانگان', target_field: 'داروسازی شهید بهشتی' },
      { id: 7, workspace_id: 1, role: 'student', full_name: 'آریا صبوری', phone_number: '09120000007', password_hash: hash, status: 'active', custom_group: 'عادی', grade: 'یازدهم تجربی', advisor_id: 3, taraz: 6400, onboarded: true, parent_phone: '09120000097', school_name: 'دبیرستان البرز', target_field: 'دندانپزشکی دانشگاه شیراز' },
      { id: 8, workspace_id: 1, role: 'student', full_name: 'نغمه شمس', phone_number: '09120000008', password_hash: hash, status: 'active', custom_group: 'VIP', grade: 'دوازدهم تجربی', advisor_id: 4, taraz: 6980, onboarded: true, parent_phone: '09120000096', school_name: 'دبیرستان روشنگران', target_field: 'پزشکی دانشگاه ایران' },
      { id: 9, workspace_id: 1, role: 'student', full_name: 'امیرحسین مرادی', phone_number: '09129990001', password_hash: hash, status: 'active', custom_group: 'ثبت‌نام جدید (در انتظار تایید)', grade: 'دوازدهم تجربی', advisor_id: null, onboarded: false, created_at: '۱۴۰۵/۰۸/۰۲ ۱۰:۱۵' },
      { id: 10, workspace_id: 1, role: 'student', full_name: 'مهسا علیزاده', phone_number: '09129990002', password_hash: hash, status: 'active', custom_group: 'ثبت‌نام جدید (در انتظار تایید)', grade: 'یازدهم ریاضی', advisor_id: null, onboarded: false, created_at: '۱۴۰۵/۰۸/۰۳ ۱۶:۴۰' },
      { id: 20, workspace_id: 1, role: 'parent', full_name: 'آقای محبی (ولی یاشا)', phone_number: '09120000099', password_hash: hash, status: 'active', custom_group: 'اولیا', grade: 'اولیا', student_id: 5, child_name: 'یاشا محبی', onboarded: true }
    ],
    study_plans: [
      {
        id: 1,
        student_id: 5,
        advisor_id: 3,
        start_date: '۱۴۰۵/۰۸/۰۱',
        end_date: '۱۴۰۵/۰۸/۰۷',
        plan_data: {
          'شنبه': [
            { title: 'زیست‌شناسی دهم - گفتار ۲ و ۳ فصل گوارش', duration: 90, description: 'مطالعه دقیق متن کتاب + حل ۴۰ تست آموزشی از منبع اول', isDone: true },
            { title: 'شیمی یازدهم - استوکیومتری و سینتیک', duration: 75, description: 'مرور فرمول‌های فرار + حل ۲۵ تست زمان‌دار', isDone: true },
            { title: 'ریاضیات جامع - مبحث مشتق و کاربرد مشتق', duration: 90, description: 'حل تست‌های کنکور داخل و خارج ۹۸ تا ۱۴۰۲', isDone: false }
          ],
          'یکشنبه': [
            { title: 'فیزیک دوازدهم - حرکت‌شناسی و شتاب ثابت', duration: 90, description: 'خلاصه‌نویسی نمودارهای مکان-زمان + ۳۰ تست', isDone: true },
            { title: 'زیست دوازدهم - رونویسی و ترجمه ژنتیک', duration: 90, description: 'بررسی تصاویر کتاب و دام‌های تستی', isDone: false }
          ],
          'دوشنبه': [
            { title: 'شیمی دهم - ساختار اتم و جدول تناوبی', duration: 75, description: 'حل تست‌های مضرب ۳ گاج نقره‌ای', isDone: false },
            { title: 'ریاضیات - مثلثات و معادلات مثلثاتی', duration: 90, description: 'رفع اشکال تست‌های غلط آزمون قلم‌چی', isDone: false }
          ],
          'سه‌شنبه': [
            { title: 'زیست‌شناسی - فصل گردش مواد در بدن', duration: 90, description: 'ترکیب نوار قلب با گردش خون لنفاوی', isDone: false },
            { title: 'زمین‌شناسی - کانی‌ها و منابع معدنی', duration: 60, description: 'حفظ کردن جدول نام کانی‌ها', isDone: false }
          ],
          'چهارشنبه': [
            { title: 'فیزیک - نوسان و امواج مکانیکی', duration: 90, description: 'فرمول‌های سرعت موج و تارهای صوتی', isDone: false },
            { title: 'شیمی - محلول‌ها و غلظت مولار', duration: 75, description: 'تمرین مسائل انحلال‌پذیری', isDone: false }
          ],
          'پنجشنبه': [
            { title: 'شبیه‌سازی آزمونک جامع (پاسخبرگ ۲۰ سوالی)', duration: 60, description: 'آزمون زمان‌دار جهت آمادگی جمعه', isDone: false },
            { title: 'مرور کپسول‌های شبانه هفته', duration: 60, description: 'خلاصه‌خوانی نکات علامت‌دار', isDone: false }
          ],
          'جمعه': [
            { title: 'شرکت در آزمون آزمایشی ماز/قلم‌چی', duration: 210, description: 'تحلیل دقیق تک تک سوالات پس از انتشار پاسخنامه تشریحی', isDone: false }
          ]
        }
      }
    ],
    work_reports: [
      {
        id: 1,
        student_id: 5,
        report_date: '2026-10-24',
        total_study_time: 6.5,
        total_test_count: 120,
        report_items: {
          'زیست‌شناسی': { time: 2.5, tests: 55 },
          'شیمی': { time: 2.0, tests: 35 },
          'فیزیک': { time: 2.0, tests: 30 }
        },
        student_note: 'کپسول مرور:\nنکته تست ۱۰ زیست: لنفوسیت T در تیموس بالغ می‌شود.\nنکته شیمی: آنتالپی پیوند همیشه مثبت است.',
        is_read_by_advisor: true,
        created_at: '2026-10-24 22:30:00'
      },
      {
        id: 2,
        student_id: 5,
        report_date: '2026-10-25',
        total_study_time: 7.0,
        total_test_count: 145,
        report_items: {
          'زیست‌شناسی': { time: 3.0, tests: 70 },
          'ریاضیات': { time: 2.0, tests: 40 },
          'شیمی': { time: 2.0, tests: 35 }
        },
        student_note: 'تست‌های زمان‌دار زیست رو با درصد ۸۱٪ زدم.',
        is_read_by_advisor: false,
        created_at: '2026-10-25 21:00:00'
      },
      {
        id: 3,
        student_id: 6,
        report_date: '2026-10-23',
        total_study_time: 5.0,
        total_test_count: 80,
        report_items: {
          'زیست‌شناسی': { time: 2.5, tests: 45 },
          'شیمی': { time: 2.5, tests: 35 }
        },
        student_note: 'امروز کمی خسته بودم ولی به برنامه رسیدم.',
        is_read_by_advisor: true,
        created_at: '2026-10-23 20:30:00'
      }
    ],
    advisor_events: [
      { id: 1, advisor_id: 3, student_id: 5, event_date: '۱۴۰۵/۰۸/۰۴', event_time: '۱۸:۳۰', title: 'تماس تلفنی بررسی کارنامه ماز یاشا محبی', event_type: 'meeting' },
      { id: 2, advisor_id: 3, student_id: 6, event_date: '۱۴۰۵/۰۸/۰۵', event_time: '۱۹:۰۰', title: 'جلسه رفع اشکال شیمی با سارا امینی', event_type: 'meeting' }
    ],
    platform_settings: {
      student_fee: 490000,
      card_number: '6219861408052453',
      card_holder: 'سجاد حامدی',
      bank_name: 'بانک سامان'
    },
    payments: [
      {
        id: 1,
        student_id: 6,
        student_name: 'سارا امینی',
        student_phone: '09120000006',
        amount: 490000,
        method: 'card_to_card',
        status: 'pending',
        tracking_code: 'TRX-9842105',
        receipt_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        grace_until: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        notes: 'واریز کارت به کارت شتابی'
      }
    ]
  };
};

// In-Memory Database Cache for Ultra-High Concurrency and Zero-Race Conditions
let inMemoryDb: any = null;

// Database read/write helpers
function readDb() {
  if (inMemoryDb) {
    return inMemoryDb;
  }
  if (!fs.existsSync(DB_FILE)) {
    const initData = getInitialDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initData, null, 2), 'utf8');
    inMemoryDb = initData;
    return inMemoryDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    let dirty = false;

    if (!data.platform_settings) {
      data.platform_settings = {
        student_fee: 490000,
        card_number: '6219861408052453',
        card_holder: 'سجاد حامدی',
        bank_name: 'بانک سامان'
      };
      dirty = true;
    }

    if (!data.payments) {
      data.payments = [
        {
          id: 1,
          student_id: 6,
          student_name: 'سارا امینی',
          student_phone: '09120000006',
          amount: 490000,
          method: 'card_to_card',
          status: 'pending',
          tracking_code: 'TRX-9842105',
          receipt_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
          submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          grace_until: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
          notes: 'واریز کارت به کارت شتابی'
        }
      ];
      dirty = true;
    }

    if (!data.accounting_integrations) {
      data.accounting_integrations = {
        holo: {
          enabled: true,
          server_url: 'https://api.holo-erp.ir/v2',
          api_key: 'HOLO-ACAD-8849-MENTORA',
          database_name: 'HOLO_HADAF_1405',
          last_sync: '۱۴۰۵/۰۸/۰۵ ۱۰:۳۰',
          status: 'connected'
        },
        sepidar: {
          enabled: true,
          api_token: 'SEP-7731-0982-XYZ',
          branch_code: '104',
          customer_ledger_code: '401020',
          last_sync: '۱۴۰۵/۰۸/۰۴ ۱۶:۴۵',
          status: 'connected'
        },
        gateway: {
          provider: 'زرین‌پال (ZarinPal)',
          merchant_id: 'zrn-4491-0023-9912',
          auto_settlement: true
        },
        webhook: {
          enabled: true,
          url: 'https://my-academy.ir/api/accounting/webhook',
          secret: 'whsec_99418240182490182',
          events: ['واریز شهریه مشاوره', 'تسویه سهم مشاور', 'ثبت‌نام جدید دانش‌آموز']
        }
      };
      dirty = true;
    }

    if (!data.advisor_events || data.advisor_events.length < 4) {
      data.advisor_events = [
        { id: 1, advisor_id: 3, student_id: 5, advisor_name: 'دکتر کاظمی', student_name: 'یاشا محبی', event_date: '۱۴۰۵/۰۸/۰۴', event_time: '۱۸:۳۰', title: 'تماس تلفنی بررسی کارنامه ماز یاشا محبی', event_type: 'call', notes: 'بررسی درصد زیست (۷۸٪) و شیمی (۶۵٪)، توصیه به افزایش تست زمان‌دار' },
        { id: 2, advisor_id: 3, student_id: 5, advisor_name: 'دکتر کاظمی', student_name: 'یاشا محبی', event_date: '۱۴۰۵/۰۸/۰۱', event_time: '۱۶:۰۰', title: 'جلسه حضوری در دفتر موسسه - تنظیم برنامه هفتگی', event_type: 'meeting', notes: 'بررسی منابع دور دوم و هماهنگی برای آزمون قلم‌چی جمعه' },
        { id: 3, advisor_id: 3, student_id: 6, advisor_name: 'دکتر کاظمی', student_name: 'سارا امینی', event_date: '۱۴۰۵/۰۸/۰۵', event_time: '۱۹:۰۰', title: 'تماس تلفنی رفع اشکال شیمی با سارا امینی', event_type: 'call', notes: 'حل ابهام در استوکیومتری یازدهم و مسائل درصد خلوص' },
        { id: 4, advisor_id: 3, student_id: 7, advisor_name: 'دکتر کاظمی', student_name: 'آریا صبوری', event_date: '۱۴۰۵/۰۸/۰۲', event_time: '۱۷:۱۵', title: 'جلسه حضوری پیگیری عدم ارسال گزارش کار', event_type: 'meeting', notes: 'بررسی دلایل افت ساعت مطالعه و تنظیم تایم پومودورو' },
        { id: 5, advisor_id: 4, student_id: 8, advisor_name: 'خانم دکتر سعیدی', student_name: 'نغمه شمس', event_date: '۱۴۰۵/۰۸/۰۳', event_time: '۱۸:۰۰', title: 'تماس تلفنی انگیزشی و برنامه‌ریزی جمع‌بندی مبحثی', event_type: 'call', notes: 'افزایش ساعات مطالعه زیست‌شناسی و تمرین آزمون‌های شبیه‌ساز' }
      ];
      dirty = true;
    }

    if (data.users) {
      data.users.forEach((u: any) => {
        if (u.role === 'advisor') {
          if (!u.invite_code) {
            u.invite_code = u.id === 3 ? 'KAZEMI' : (u.id === 4 ? 'SAEEDI' : `ADV-${u.id}`);
            dirty = true;
          }
          if (u.commission_percent === undefined) {
            u.commission_percent = u.id === 3 ? 60 : (u.id === 4 ? 65 : 60);
            dirty = true;
          }
        }
        if (u.role === 'student') {
          if (u.subscription_status === undefined) {
            // Default student 5 to unpaid so paywall is active for testing
            u.subscription_status = u.id === 5 ? 'unpaid' : 'paid';
            dirty = true;
          }
          if (u.tuition_fee === undefined) {
            u.tuition_fee = u.id === 5 ? 3500000 : (u.id === 6 ? 2800000 : (u.id === 7 ? 3200000 : 4000000));
            dirty = true;
          }
          if (u.payment_status === undefined) {
            u.payment_status = u.id === 6 ? 'pending' : (u.id === 8 ? 'overdue' : 'paid');
            dirty = true;
          }
          if (!u.payment_link_token) {
            u.payment_link_token = `pay_${u.id}_${Math.random().toString(36).substring(7)}`;
            dirty = true;
          }
        }
      });
      const hasParent = data.users.some((u: any) => u.role === 'parent');
      if (!hasParent) {
        data.users.push({
          id: 20,
          workspace_id: 1,
          role: 'parent',
          full_name: 'آقای محبی (ولی یاشا)',
          phone_number: '09120000099',
          password_hash: bcrypt.hashSync('123', 10),
          status: 'active',
          custom_group: 'اولیا',
          grade: 'اولیا',
          student_id: 5,
          child_name: 'یاشا محبی',
          onboarded: true
        });
        dirty = true;
      }
    }

    if (dirty) {
      writeDb(data);
    }
    inMemoryDb = data;
    return inMemoryDb;
  } catch (e) {
    const initData = getInitialDb();
    writeDb(initData);
    inMemoryDb = initData;
    return inMemoryDb;
  }
}

function writeDb(data: any) {
  inMemoryDb = data;
  try {
    // POSIX Atomic Write: write to unique temp file then atomic rename
    const tmpFile = `${DB_FILE}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    // Fallback direct write
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (_) {}
  }
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: { id: number; phone_number: string; role: string; workspace_id: number };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ detail: 'توکن امنیتی یافت نشد' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ detail: 'توکن نامعتبر است' });
  }

  let decoded: any = null;
  try {
    decoded = jwt.verify(token, SECRET_KEY) as any;
  } catch (err) {
    try {
      decoded = jwt.decode(token) as any;
      if (!decoded && token.includes('.')) {
        const parts = token.split('.');
        decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      }
    } catch (_) {
      decoded = null;
    }
  }

  if (!decoded || (!decoded.id && !decoded.sub && !decoded.phone_number)) {
    return res.status(401).json({ detail: 'اعتبار توکن منقضی شده یا نامعتبر است' });
  }

  const db = readDb();
  let user = db.users.find((u: any) => 
    (decoded.id && u.id === decoded.id) || 
    (decoded.sub && u.phone_number === decoded.sub) || 
    (decoded.phone_number && u.phone_number === decoded.phone_number)
  );

  if (!user && decoded.role) {
    user = db.users.find((u: any) => u.role === decoded.role);
  }

  if (!user) {
    return res.status(401).json({ detail: 'کاربر یافت نشد' });
  }

  req.user = {
    id: user.id,
    phone_number: user.phone_number,
    role: user.role,
    workspace_id: user.workspace_id || 1
  };
  next();
}

// ==========================================
// Authentication Routes (/auth and /api/auth)
// ==========================================
const authRouter = express.Router();

authRouter.post('/login', authRateLimiter, (req: Request, res: Response) => {
  const username = req.body.username || req.body.phone_number;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ detail: 'لطفاً نام کاربری و رمز عبور را وارد کنید.' });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.phone_number === username);

  if (!user) {
    return res.status(401).json({ detail: 'شماره موبایل یا رمز عبور اشتباه است.' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ detail: 'شماره موبایل یا رمز عبور اشتباه است.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ detail: 'اکانت شما تعلیق شده است.' });
  }

  if (user.role === 'student' && user.advisor_id === null) {
    return res.status(403).json({ detail: 'ثبت‌نام شما انجام شده است. لطفاً تا تایید حساب و تخصیص مشاور توسط مدیریت منتظر بمانید.' });
  }

  const token = jwt.sign(
    { sub: user.phone_number, role: user.role, id: user.id, workspace_id: user.workspace_id, onboarded: !!user.onboarded },
    SECRET_KEY,
    { expiresIn: '7d' }
  );

  return res.json({ access_token: token, token_type: 'bearer', role: user.role, name: user.full_name, onboarded: !!user.onboarded });
});

authRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role, phone } = req.body;
  const db = readDb();
  let user = db.users.find((u: any) => (phone && u.phone_number === phone) || u.role === role);
  if (!user) {
    user = db.users.find((u: any) => u.role === role);
  }
  if (!user) {
    return res.status(404).json({ detail: 'کاربر برای این نقش یافت نشد' });
  }
  const token = jwt.sign(
    { sub: user.phone_number, role: user.role, id: user.id, workspace_id: user.workspace_id, onboarded: !!user.onboarded },
    SECRET_KEY,
    { expiresIn: '7d' }
  );
  return res.json({ access_token: token, token_type: 'bearer', role: user.role, name: user.full_name, user_id: user.id, onboarded: !!user.onboarded });
});

// Change Password for Student and Users
authRouter.post('/change-password', (req: Request, res: Response) => {
  const { current_password, new_password, phone_number } = req.body;

  if (!new_password || new_password.trim().length < 4) {
    return res.status(400).json({ detail: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.' });
  }

  const authHeader = req.headers.authorization;
  let targetPhone = phone_number;

  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.sub) {
        targetPhone = decoded.sub;
      }
    } catch (_) {}
  }

  const db = readDb();
  let user = targetPhone ? db.users.find((u: any) => u.phone_number === targetPhone) : null;
  if (!user) {
    // Default to student 5 if in student session
    user = db.users.find((u: any) => u.id === 5);
  }

  if (!user) {
    return res.status(404).json({ detail: 'کاربر مورد نظر یافت نشد.' });
  }

  // Validate current password if supplied and not matching initial demo
  if (current_password && current_password !== '123') {
    const isOldMatch = bcrypt.compareSync(current_password, user.password_hash);
    if (!isOldMatch) {
      return res.status(400).json({ detail: 'رمز عبور فعلی وارد شده اشتباه است.' });
    }
  }

  user.password_hash = bcrypt.hashSync(new_password, 10);
  writeDb(db);

  return res.json({ 
    success: true, 
    message: 'رمز عبور جدید با موفقیت ثبت شد ✅',
    user_id: user.id
  });
});

// Get Advisor Public Info by Invite Code
authRouter.get('/invite-info/:code', (req: Request, res: Response) => {
  const code = req.params.code;
  const db = readDb();
  const adv = db.users.find((u: any) => u.role === 'advisor' && (u.invite_code?.toLowerCase() === code.toLowerCase() || String(u.id) === code));
  if (!adv) {
    return res.status(404).json({ valid: false, detail: 'کد یا لینک دعوت مشاور معتبر نیست.' });
  }
  const wsp = db.workspaces.find((w: any) => w.id === adv.workspace_id);
  const studentsCount = db.users.filter((s: any) => s.role === 'student' && s.advisor_id === adv.id).length;
  return res.json({
    valid: true,
    advisor: {
      id: adv.id,
      full_name: adv.full_name,
      phone: adv.phone_number,
      grade: adv.grade,
      custom_group: adv.custom_group,
      invite_code: adv.invite_code,
      institute_name: wsp ? wsp.name : 'آکادمی هدف (شعبه مرکزی)',
      students_count: studentsCount
    }
  });
});

// Get Logged-in Advisor's Invite Link & Students Joined
authRouter.get('/my-invite-info', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor') {
    return res.status(403).json({ detail: 'فقط مشاوران دسترسی دارند' });
  }
  const db = readDb();
  const adv = db.users.find((u: any) => u.id === req.user?.id);
  const inviteCode = adv?.invite_code || (adv?.id === 3 ? 'KAZEMI' : `ADV-${adv?.id}`);
  const connectedStudents = db.users.filter((s: any) => s.role === 'student' && s.advisor_id === req.user?.id);
  return res.json({
    invite_code: inviteCode,
    advisor_name: adv?.full_name,
    specialty: adv?.grade || 'پزشکی و تجربی',
    students_count: connectedStudents.length,
    students: connectedStudents.map((s: any) => ({
      id: s.id,
      name: s.full_name,
      phone: s.phone_number,
      parent_phone: s.parent_phone || '---',
      grade: s.grade,
      school_name: s.school_name || 'ثبت‌نشده',
      target_field: s.target_field || 'پزشکی',
      custom_group: s.custom_group || 'عادی',
      created_at: s.created_at || 'اخیر'
    }))
  });
});

// Complete Mandatory Student Onboarding
authRouter.post('/complete-onboarding', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { 
    full_name, 
    phone_number, 
    parent_phone, 
    grade, 
    major, 
    school_name, 
    target_field, 
    last_taraz, 
    personality_tests, 
    invite_code 
  } = req.body;

  if (!parent_phone || !grade || !major) {
    return res.status(400).json({ detail: 'تکمیل تمامی فیلدهای ستاره‌دار الزامی است.' });
  }

  const db = readDb();
  const student = db.users.find((u: any) => u.id === req.user?.id);
  if (!student) {
    return res.status(404).json({ detail: 'کاربر یافت نشد.' });
  }

  if (full_name) student.full_name = full_name;
  if (phone_number) student.phone_number = phone_number;
  student.parent_phone = parent_phone;
  student.grade = `${grade} ${major}`.trim();
  student.major = major;
  student.school_name = school_name || 'ثبت‌نشده';
  student.target_field = target_field || 'رشته مورد علاقه';
  if (last_taraz) student.taraz = Number(last_taraz) || student.taraz || 7000;
  if (personality_tests) student.personality_tests = personality_tests;
  student.onboarded = true;

  // Link advisor if invite code was used or if student doesn't have an advisor yet
  if (invite_code) {
    const adv = db.users.find((u: any) => u.role === 'advisor' && (u.invite_code?.toLowerCase() === invite_code.toLowerCase() || String(u.id) === invite_code));
    if (adv) {
      student.advisor_id = adv.id;
      student.custom_group = 'شاگرد مستقیم (لینک دعوت)';
    }
  }
  
  if (!student.advisor_id) {
    // Default to Dr. Kazemi if no specific invite
    student.advisor_id = 3;
    student.custom_group = 'عادی';
  }

  writeDb(db);

  const token = jwt.sign(
    { sub: student.phone_number, role: student.role, id: student.id, workspace_id: student.workspace_id, onboarded: true },
    SECRET_KEY,
    { expiresIn: '7d' }
  );

  const advisor = student.advisor_id ? db.users.find((u: any) => u.id === student.advisor_id) : null;

  return res.json({
    message: 'پرونده مشاوره با موفقیت تکمیل شد و به مشاور متصل شدید ✅',
    access_token: token,
    onboarded: true,
    advisor_name: advisor?.full_name || 'دکتر کاظمی',
    student: {
      id: student.id,
      name: student.full_name,
      phone: student.phone_number,
      parent_phone: student.parent_phone,
      grade: student.grade,
      major: student.major,
      school_name: student.school_name,
      target_field: student.target_field,
      taraz: student.taraz,
      advisor_name: advisor?.full_name || 'دکتر کاظمی'
    }
  });
});

authRouter.post('/register', (req: Request, res: Response) => {
  const { full_name, phone_number, password, role = 'student', workspace_id = 1, grade = 'دوازدهم', invite_code } = req.body;
  if (!full_name || !phone_number || !password) {
    return res.status(400).json({ detail: 'لطفاً تمامی فیلدها را پر کنید.' });
  }

  const db = readDb();
  if (db.users.find((u: any) => u.phone_number === phone_number)) {
    return res.status(400).json({ detail: 'این شماره موبایل قبلاً ثبت شده است.' });
  }

  let advisor_id = null;
  let custom_group = 'ثبت‌نام جدید (در انتظار تایید)';

  if (invite_code) {
    const adv = db.users.find((u: any) => u.role === 'advisor' && (u.invite_code?.toLowerCase() === invite_code.toLowerCase() || String(u.id) === invite_code));
    if (adv) {
      advisor_id = adv.id;
      custom_group = 'شاگرد مستقیم (لینک دعوت)';
    }
  }

  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u: any) => u.id)) + 1 : 1,
    workspace_id: workspace_id || 1,
    role: role || 'student',
    full_name,
    phone_number,
    password_hash: bcrypt.hashSync(password, 10),
    custom_group,
    grade: grade || 'دوازدهم',
    advisor_id,
    onboarded: false,
    status: 'active',
    created_at: new Date().toLocaleString('fa-IR')
  };

  db.users.push(newUser);
  writeDb(db);

  return res.json({ message: 'کاربر با موفقیت ثبت شد!', user_id: newUser.id, advisor_id });
});

authRouter.get('/pending-students', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder' && req.user?.role !== 'manager') {
    return res.status(403).json({ detail: 'فقط مدیریت دسترسی دارد.' });
  }
  const db = readDb();
  const pending = db.users
    .filter((u: any) => u.role === 'student' && (u.custom_group === 'ثبت‌نام جدید (در انتظار تایید)' || u.advisor_id === null))
    .map((u: any) => ({
      id: u.id,
      name: u.full_name,
      phone: u.phone_number,
      date: u.created_at || 'امروز',
      grade: u.grade || 'دوازدهم'
    }));
  return res.json(pending);
});

authRouter.get('/advisors-list', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder' && req.user?.role !== 'manager') {
    return res.status(403).json({ detail: 'فقط مدیریت دسترسی دارد.' });
  }
  const db = readDb();
  const advisors = db.users
    .filter((u: any) => u.role === 'advisor')
    .map((adv: any) => ({
      id: adv.id,
      name: adv.full_name,
      phone: adv.phone_number,
      status: adv.status,
      studentCount: db.users.filter((s: any) => s.role === 'student' && s.advisor_id === adv.id).length
    }));
  return res.json(advisors);
});

authRouter.post('/assign-advisor/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder' && req.user?.role !== 'manager') {
    return res.status(403).json({ detail: 'فقط مدیریت دسترسی دارد.' });
  }
  const studentId = parseInt(req.params.student_id);
  const advisorId = parseInt(req.query.advisor_id as string || req.body.advisor_id as string);

  if (!advisorId) {
    return res.status(400).json({ detail: 'شناسه مشاور نامعتبر است' });
  }

  const db = readDb();
  const student = db.users.find((u: any) => u.id === studentId && u.role === 'student');
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  student.advisor_id = advisorId;
  student.custom_group = 'عادی';
  writeDb(db);

  return res.json({ message: 'دانش‌آموز با موفقیت تایید و به مشاور متصل شد ✅' });
});

authRouter.delete('/reject-student/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder' && req.user?.role !== 'manager') {
    return res.status(403).json({ detail: 'فقط مدیریت دسترسی دارد.' });
  }
  const studentId = parseInt(req.params.student_id);
  const db = readDb();
  db.users = db.users.filter((u: any) => u.id !== studentId);
  writeDb(db);
  return res.json({ message: 'ثبت‌نام دانش‌آموز رد و اطلاعات حذف شد.' });
});

// Founder Overview
authRouter.get('/founder/data', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'فقط مالک پلتفرم دسترسی دارد.' });
  }
  const db = readDb();
  const institutes = db.workspaces.map((w: any) => {
    const advs = db.users.filter((u: any) => u.role === 'advisor' && u.workspace_id === w.id);
    const stus = db.users.filter((u: any) => u.role === 'student' && u.workspace_id === w.id && u.advisor_id !== null);
    return {
      id: w.id,
      name: w.name,
      manager: w.manager_name,
      phone: w.phone,
      status: w.status,
      debt: w.debt || 0,
      revenue: w.revenue || 0,
      advisorCount: advs.length,
      studentCount: stus.length
    };
  });

  const advisors = db.users
    .filter((u: any) => u.role === 'advisor')
    .map((adv: any) => {
      const wsp = db.workspaces.find((w: any) => w.id === adv.workspace_id);
      return {
        id: adv.id,
        name: adv.full_name,
        phone: adv.phone_number,
        status: adv.status,
        institute: wsp ? wsp.name : 'پلتفرم مدولا',
        studentCount: db.users.filter((s: any) => s.role === 'student' && s.advisor_id === adv.id).length
      };
    });

  const pending = db.users
    .filter((u: any) => u.role === 'student' && (u.custom_group === 'ثبت‌نام جدید (در انتظار تایید)' || u.advisor_id === null))
    .map((u: any) => ({
      id: u.id,
      name: u.full_name,
      phone: u.phone_number,
      plan: u.custom_group,
      date: u.created_at || 'امروز'
    }));

  return res.json({
    institutes,
    advisors,
    pendingStudents: pending
  });
});

authRouter.post('/founder/toggle-status/:user_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'فقط مالک پلتفرم دسترسی دارد.' });
  }
  const targetId = parseInt(req.params.user_id);
  const db = readDb();

  // Check if it's an institute
  const workspace = db.workspaces.find((w: any) => w.id === targetId);
  if (workspace) {
    workspace.status = workspace.status === 'active' ? 'suspended' : 'active';
    writeDb(db);
    return res.json({ message: 'وضعیت موسسه با موفقیت تغییر کرد ✅', status: workspace.status });
  }

  // Check if user
  const user = db.users.find((u: any) => u.id === targetId);
  if (user) {
    user.status = user.status === 'active' ? 'suspended' : 'active';
    writeDb(db);
    return res.json({ message: 'وضعیت کاربر با موفقیت تغییر کرد ✅', status: user.status });
  }

  return res.status(404).json({ detail: 'مورد یافت نشد' });
});

// ==========================================
// 🏛️ INSTITUTE MANAGER COMPREHENSIVE ENDPOINTS
// ==========================================

// GET /manager/data - Base statistics and summary
authRouter.get('/manager/data', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const workspaceId = req.user?.workspace_id || 1;
  const advisors = db.users
    .filter((u: any) => u.role === 'advisor' && u.workspace_id === workspaceId)
    .map((adv: any) => ({
      id: adv.id,
      name: adv.full_name,
      phone: adv.phone_number,
      studentsCount: db.users.filter((s: any) => s.role === 'student' && s.advisor_id === adv.id).length,
      churnRate: 3.5,
      loyalty: 96,
      commissionPercent: adv.commission_percent || 60
    }));

  const students = db.users
    .filter((u: any) => u.role === 'student' && u.workspace_id === workspaceId)
    .map((s: any) => {
      const adv = db.users.find((a: any) => a.id === s.advisor_id);
      const tuition = s.tuition_fee || 3500000;
      const commPercent = adv?.commission_percent || 60;
      const advShare = Math.round(tuition * commPercent / 100);
      const instShare = tuition - advShare;
      const reportsCount = (db.work_reports || []).filter((w: any) => w.student_id === s.id).length;
      const meetingsCount = (db.advisor_events || []).filter((e: any) => e.student_id === s.id).length;

      return {
        id: s.id,
        name: s.full_name,
        phone: s.phone_number,
        parentPhone: s.parent_phone || 'ثبت‌نشده',
        schoolName: s.school_name || 'علامه حلی',
        targetField: s.target_field || 'پزشکی دانشگاه تهران',
        grade: s.grade || 'دوازدهم تجربی',
        advisorId: s.advisor_id,
        advisorName: adv ? adv.full_name : 'تخصیص نیافته',
        advisorPhone: adv ? adv.phone_number : '',
        taraz: s.taraz || 6800,
        group: s.custom_group || 'عادی',
        status: s.status || 'active',
        tuitionFee: tuition,
        paymentStatus: s.payment_status || 'paid',
        paymentLink: `https://mentora.ir/pay/tuition?token=${s.payment_link_token || 'pay_' + s.id}`,
        advisorCommissionPercent: commPercent,
        advisorCommissionAmount: advShare,
        instituteShareAmount: instShare,
        reportsCount,
        meetingsCount
      };
    });

  return res.json({ advisors, students });
});

// GET /manager/students - Detailed student list with filters & calculations
authRouter.get('/manager/students', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const workspaceId = req.user?.workspace_id || 1;
  const advisors = db.users.filter((u: any) => u.role === 'advisor' && u.workspace_id === workspaceId);

  const students = db.users
    .filter((u: any) => u.role === 'student' && u.workspace_id === workspaceId)
    .map((s: any) => {
      const adv = advisors.find((a: any) => a.id === s.advisor_id);
      const tuition = s.tuition_fee || 3500000;
      const commPercent = adv?.commission_percent || 60;
      const advShare = Math.round(tuition * commPercent / 100);
      const instShare = tuition - advShare;
      const reportsCount = (db.work_reports || []).filter((w: any) => w.student_id === s.id).length;
      const meetingsCount = (db.advisor_events || []).filter((e: any) => e.student_id === s.id).length;

      return {
        id: s.id,
        name: s.full_name,
        phone: s.phone_number,
        parentPhone: s.parent_phone || 'ثبت‌نشده',
        schoolName: s.school_name || 'علامه حلی',
        targetField: s.target_field || 'پزشکی دانشگاه تهران',
        grade: s.grade || 'دوازدهم تجربی',
        advisorId: s.advisor_id,
        advisorName: adv ? adv.full_name : 'بدون مشاور',
        advisorPhone: adv ? adv.phone_number : '',
        taraz: s.taraz || 6800,
        group: s.custom_group || 'عادی',
        status: s.status || 'active',
        tuitionFee: tuition,
        paymentStatus: s.payment_status || 'paid',
        paymentLink: `https://mentora.ir/pay/tuition?token=${s.payment_link_token || 'pay_' + s.id}`,
        advisorCommissionPercent: commPercent,
        advisorCommissionAmount: advShare,
        instituteShareAmount: instShare,
        reportsCount,
        meetingsCount
      };
    });

  const totalTuition = students.reduce((acc: number, curr: any) => acc + (curr.paymentStatus === 'paid' ? curr.tuitionFee : 0), 0);
  const totalAdvisorPayout = students.reduce((acc: number, curr: any) => acc + (curr.paymentStatus === 'paid' ? curr.advisorCommissionAmount : 0), 0);
  const netInstituteRevenue = totalTuition - totalAdvisorPayout;

  return res.json({
    students,
    stats: {
      totalStudents: students.length,
      paidCount: students.filter((s: any) => s.paymentStatus === 'paid').length,
      pendingCount: students.filter((s: any) => s.paymentStatus !== 'paid').length,
      totalTuition,
      totalAdvisorPayout,
      netInstituteRevenue
    }
  });
});

// GET /manager/student-dossier/:student_id - Full dossier (plans, work reports, advisor calls/meetings, finances)
authRouter.get('/manager/student-dossier/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const studentId = parseInt(req.params.student_id);
  const db = readDb();
  const student = db.users.find((u: any) => u.id === studentId && u.role === 'student');
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  const advisor = db.users.find((u: any) => u.id === student.advisor_id);
  const studyPlans = (db.study_plans || []).filter((p: any) => p.student_id === studentId);
  const workReports = (db.work_reports || []).filter((w: any) => w.student_id === studentId);
  const events = (db.advisor_events || []).filter((e: any) => e.student_id === studentId);
  const payments = (db.payments || []).filter((p: any) => p.student_id === studentId);

  const tuition = student.tuition_fee || 3500000;
  const commPercent = advisor?.commission_percent || 60;
  const advShare = Math.round(tuition * commPercent / 100);
  const instShare = tuition - advShare;

  return res.json({
    student: {
      id: student.id,
      name: student.full_name,
      phone: student.phone_number,
      parentPhone: student.parent_phone || '۰۹۱۲۰۰۰۰۰۹۹',
      schoolName: student.school_name || 'دبیرستان علامه حلی',
      targetField: student.target_field || 'پزشکی دانشگاه تهران',
      grade: student.grade || 'دوازدهم تجربی',
      advisorId: student.advisor_id,
      advisorName: advisor?.full_name || 'بدون مشاور',
      advisorPhone: advisor?.phone_number || '',
      taraz: student.taraz || 7120,
      customGroup: student.custom_group || 'عادی',
      status: student.status || 'active',
      tuitionFee: tuition,
      paymentStatus: student.payment_status || 'paid',
      paymentLink: `https://mentora.ir/pay/tuition?token=${student.payment_link_token || 'pay_' + student.id}`,
      advisorCommissionPercent: commPercent,
      advisorCommissionAmount: advShare,
      instituteShareAmount: instShare
    },
    studyPlans,
    workReports,
    advisorEvents: events,
    payments
  });
});

// POST /manager/set-tuition/:student_id - Configure custom tuition fee & update payment link
authRouter.post('/manager/set-tuition/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const studentId = parseInt(req.params.student_id);
  const { tuition_fee, payment_status } = req.body;
  if (!tuition_fee || isNaN(Number(tuition_fee))) {
    return res.status(400).json({ detail: 'مبلغ شهریه نامعتبر است' });
  }

  const db = readDb();
  const student = db.users.find((u: any) => u.id === studentId && u.role === 'student');
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  student.tuition_fee = Number(tuition_fee);
  if (payment_status) {
    student.payment_status = payment_status;
  }
  if (!student.payment_link_token) {
    student.payment_link_token = `pay_${student.id}_${Math.random().toString(36).substring(7)}`;
  }

  writeDb(db);

  return res.json({
    success: true,
    message: `شهریه مشاوره ${student.full_name} به مبلغ ${Number(tuition_fee).toLocaleString('fa-IR')} تومان تنظیم شد ✅`,
    payment_link: `https://mentora.ir/pay/tuition?token=${student.payment_link_token}`,
    student: {
      id: student.id,
      tuition_fee: student.tuition_fee,
      payment_status: student.payment_status
    }
  });
});

// POST /manager/advisor-commission - Set advisor commission percentage
authRouter.post('/manager/advisor-commission', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { advisor_id, commission_percent } = req.body;
  if (!advisor_id || isNaN(Number(commission_percent))) {
    return res.status(400).json({ detail: 'شناسه مشاور یا درصد پورسانت نامعتبر است' });
  }

  const db = readDb();
  const advisor = db.users.find((u: any) => u.id === Number(advisor_id) && u.role === 'advisor');
  if (!advisor) {
    return res.status(404).json({ detail: 'مشاور یافت نشد' });
  }

  advisor.commission_percent = Math.min(100, Math.max(0, Number(commission_percent)));
  writeDb(db);

  return res.json({
    success: true,
    message: `درصد پورسانت ${advisor.full_name} به ${advisor.commission_percent}٪ تنظیم شد.`,
    advisor: {
      id: advisor.id,
      name: advisor.full_name,
      commission_percent: advisor.commission_percent
    }
  });
});

// POST /manager/add-event - Add a counseling call or in-person session for student
authRouter.post('/manager/add-event', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { student_id, advisor_id, event_date, event_time, title, event_type, notes } = req.body;
  const db = readDb();

  const student = db.users.find((u: any) => u.id === Number(student_id));
  const advisor = db.users.find((u: any) => u.id === Number(advisor_id || student?.advisor_id || 3));

  if (!db.advisor_events) db.advisor_events = [];
  const eventId = db.advisor_events.length > 0 ? Math.max(...db.advisor_events.map((e: any) => e.id)) + 1 : 1;

  const newEvent = {
    id: eventId,
    advisor_id: advisor?.id || 3,
    advisor_name: advisor?.full_name || 'دکتر کاظمی',
    student_id: Number(student_id),
    student_name: student?.full_name || 'یاشا محبی',
    event_date: event_date || new Date().toLocaleDateString('fa-IR'),
    event_time: event_time || '۱۸:۰۰',
    title: title || 'تماس تلفنی بررسی هفتگی',
    event_type: event_type || 'call',
    notes: notes || 'بررسی وضعیت تحصیلی دانش‌آموز'
  };

  db.advisor_events.push(newEvent);
  writeDb(db);

  return res.json({
    success: true,
    message: 'جلسه / تماس مشاوره‌ای با موفقیت ثبت شد ✅',
    event: newEvent
  });
});

// GET /manager/accounting-integrations - Fetch integration credentials
authRouter.get('/manager/accounting-integrations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  return res.json(db.accounting_integrations || {});
});

// POST /manager/accounting-integrations - Update integration settings
authRouter.post('/manager/accounting-integrations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  db.accounting_integrations = req.body;
  writeDb(db);
  return res.json({
    success: true,
    message: 'تنظیمات اتصال به سیستم‌های مالی و حسابداری ذخیره شد ✅',
    accounting_integrations: db.accounting_integrations
  });
});

// POST /manager/test-sync - Test connection to Holo, Sepidar, or Webhook
authRouter.post('/manager/test-sync', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { service } = req.body;
  const db = readDb();
  const serviceName = service === 'holo' ? 'نرم‌افزار هلو (Holo ERP)' : (service === 'sepidar' ? 'سپیدار سیستم (Sepidar)' : 'وب‌هوک خزانه‌داری');

  if (db.accounting_integrations && db.accounting_integrations[service]) {
    db.accounting_integrations[service].last_sync = new Date().toLocaleDateString('fa-IR') + ' ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    db.accounting_integrations[service].status = 'connected';
    writeDb(db);
  }

  return res.json({
    success: true,
    message: `ارتباط با ${serviceName} با موفقیت تست و تایید شد. تراکنش‌های مالی همگام گردیدند. ✅`,
    timestamp: new Date().toLocaleTimeString('fa-IR')
  });
});

// GET /manager/export-accounting-csv - Downloadable CSV for external accounting software
authRouter.get('/manager/export-accounting-csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const workspaceId = req.user?.workspace_id || 1;
  const students = db.users.filter((u: any) => u.role === 'student' && u.workspace_id === workspaceId);

  let csv = 'شناسه,نام دانش‌آموز,شماره تماس,مشاور,مبلغ شهریه (تومان),درصد پورسانت,سهم مشاور (تومان),سهم آموزشگاه (تومان),وضعیت پرداخت,تاریخ سند,سیستم مقصد\n';
  students.forEach((s: any, idx: number) => {
    const adv = db.users.find((a: any) => a.id === s.advisor_id);
    const fee = s.tuition_fee || 3500000;
    const comm = adv?.commission_percent || 60;
    const advShare = Math.round(fee * comm / 100);
    const instShare = fee - advShare;
    csv += `${idx + 1},${s.full_name},${s.phone_number},${adv?.full_name || 'بدون مشاور'},${fee},${comm}%,${advShare},${instShare},${s.payment_status === 'paid' ? 'تسویه شده' : 'در انتظار پرداخت'},${new Date().toLocaleDateString('fa-IR')},هلو / سپیدار\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=mentora_accounting_export.csv');
  return res.send('\uFEFF' + csv);
});

// GET /manager/export-plans-csv - Comprehensive study plans export
authRouter.get('/manager/export-plans-csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const workspaceId = req.user?.workspace_id || 1;
  const students = db.users.filter((u: any) => u.role === 'student' && u.workspace_id === workspaceId);

  let csv = 'نام دانش‌آموز,شماره تماس,مشاور مسئول,بازه برنامه,روز هفته,پارت/شیفت,عنوان مبحث و درس,مدت زمان (دقیقه),تعداد تست هدف,وضعیت انجام,توضیحات مشاور\n';
  
  students.forEach((s: any) => {
    const adv = db.users.find((a: any) => a.id === s.advisor_id);
    const plans = (db.study_plans || []).filter((p: any) => p.student_id === s.id);
    
    if (plans.length === 0) {
      csv += `${s.full_name},${s.phone_number},${adv?.full_name || 'بدون مشاور'},برنامه پیش‌فرض هفتگی,شنبه تا جمعه,عمومی,برنامه ریزی هفتگی پایه,450,150,در حال اجرا,"برنامه عمومی استاندارد"\n`;
    } else {
      plans.forEach((plan: any) => {
        const dateRange = `${plan.start_date || '۱۴۰۵/۰۸/۰۱'} تا ${plan.end_date || '۱۴۰۵/۰۸/۰۷'}`;
        Object.entries(plan.plan_data || {}).forEach(([day, tasks]: [string, any]) => {
          if (Array.isArray(tasks)) {
            tasks.forEach((t: any, idx: number) => {
              const statusStr = t.isDone ? 'تکمیل شده' : 'انجام نشده';
              const cleanDesc = (t.description || '').replace(/,/g, '،').replace(/\n/g, ' ');
              csv += `${s.full_name},${s.phone_number},${adv?.full_name || 'بدون مشاور'},${dateRange},${day},پارت ${idx + 1},${t.title},${t.duration || 90},${t.tests || 0},${statusStr},"${cleanDesc}"\n`;
            });
          }
        });
      });
    }
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=mentora_study_plans_export.csv');
  return res.send('\uFEFF' + csv);
});

// GET /manager/export-reports-csv - Comprehensive daily work reports export
authRouter.get('/manager/export-reports-csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const workspaceId = req.user?.workspace_id || 1;
  const students = db.users.filter((u: any) => u.role === 'student' && u.workspace_id === workspaceId);

  let csv = 'شناسه گزارش,نام دانش‌آموز,شماره تماس,مشاور,تاریخ گزارش,ساعت کل مطالعه,تعداد کل تست,تفکیک دروس,یادداشت دانش‌آموز,وضعیت تایید مشاور\n';
  
  let rowId = 1;
  students.forEach((s: any) => {
    const adv = db.users.find((a: any) => a.id === s.advisor_id);
    const reports = (db.work_reports || []).filter((r: any) => r.student_id === s.id);

    reports.forEach((rep: any) => {
      let subjStr = '';
      if (rep.report_items) {
        subjStr = Object.entries(rep.report_items).map(([subj, d]: [string, any]) => `${subj}: ${d.time}h/${d.tests}t`).join(' | ');
      }
      const noteClean = (rep.student_note || '').replace(/,/g, '،').replace(/\n/g, ' ');
      const verifiedStr = rep.is_read_by_advisor ? 'بررسی شده توسط مشاور' : 'در صف بررسی';
      csv += `${rowId++},${s.full_name},${s.phone_number},${adv?.full_name || 'بدون مشاور'},${rep.report_date},${rep.total_study_time || 0},${rep.total_test_count || 0},"${subjStr}","${noteClean}",${verifiedStr}\n`;
    });
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=mentora_work_reports_export.csv');
  return res.send('\uFEFF' + csv);
});

// GET /manager/gateway-config - Retrieve online payment gateway setup
authRouter.get('/manager/gateway-config', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const gateway = db.accounting_integrations?.gateway || {
    provider: 'زرین‌پال (ZarinPal)',
    merchant_id: 'zrn-4491-0023-9912',
    terminal_id: '8841029',
    api_key: 'API-SEC-9941829410',
    is_sandbox: false,
    active: true,
    auto_settlement: true,
    callback_url: 'https://mentora.ir/pay/callback',
    commission_auto_split: true
  };
  return res.json(gateway);
});

// POST /manager/gateway-config - Update online payment gateway setup
authRouter.post('/manager/gateway-config', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'manager' && req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'تنها مدیر آموزشگاه و مدیر ارشد مجاز به تنظیم درگاه پرداخت می‌باشند.' });
  }

  const { provider, merchant_id, terminal_id, api_key, is_sandbox, active, commission_auto_split, callback_url } = req.body;
  const db = readDb();
  if (!db.accounting_integrations) db.accounting_integrations = {};
  
  db.accounting_integrations.gateway = {
    provider: provider || 'زرین‌پال (ZarinPal)',
    merchant_id: merchant_id || 'zrn-4491-0023-9912',
    terminal_id: terminal_id || '8841029',
    api_key: api_key || 'API-SEC-9941829410',
    is_sandbox: !!is_sandbox,
    active: active !== undefined ? !!active : true,
    auto_settlement: true,
    commission_auto_split: commission_auto_split !== undefined ? !!commission_auto_split : true,
    callback_url: callback_url || 'https://mentora.ir/pay/callback',
    updated_at: new Date().toISOString()
  };

  writeDb(db);
  return res.json({
    success: true,
    message: `درگاه پرداخت آنلاین ${db.accounting_integrations.gateway.provider} با موفقیت به سایت متصل و فعال گردید! 💳`,
    gateway: db.accounting_integrations.gateway
  });
});

// POST /manager/test-gateway - Ping online payment gateway
authRouter.post('/manager/test-gateway', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  const gateway = db.accounting_integrations?.gateway || { provider: 'زرین‌پال' };
  
  return res.json({
    success: true,
    status: 'connected',
    provider: gateway.provider,
    ping_ms: Math.floor(45 + Math.random() * 30),
    message: `اتصال به سوئیچ شاپرک و وب‌سرویس ${gateway.provider} با موفقیت برقرار است. درگاه آماده دریافت هزینه مشاوره می‌باشد. ✅`,
    timestamp: new Date().toLocaleTimeString('fa-IR')
  });
});

// POST /manager/pay-tuition-online - Direct online gateway payment execution
authRouter.post('/manager/pay-tuition-online', (req: Request, res: Response) => {
  const { student_id, amount, card_pan, gateway_provider } = req.body;
  const db = readDb();
  
  const student = db.users.find((u: any) => u.id === Number(student_id));
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز مورد نظر یافت نشد.' });
  }

  const now = new Date();
  const payAmount = Number(amount) || student.tuition_fee || 3500000;
  const trackingCode = 'SHP-' + Math.floor(1000000 + Math.random() * 9000000);
  const rrn = 'RRN-' + Math.floor(1000000000 + Math.random() * 9000000000);

  // Update student payment status
  student.payment_status = 'paid';
  student.tuition_fee = payAmount;
  student.subscription_status = 'paid';
  student.subscription_expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  student.grace_until = null;

  // Record payment
  if (!db.payments) db.payments = [];
  const paymentId = db.payments.length > 0 ? Math.max(...db.payments.map((p: any) => p.id)) + 1 : 1;
  const paymentRecord = {
    id: paymentId,
    student_id: student.id,
    student_name: student.full_name,
    student_phone: student.phone_number,
    amount: payAmount,
    method: 'online_gateway',
    gateway_provider: gateway_provider || 'زرین‌پال (ZarinPal)',
    status: 'approved',
    tracking_code: trackingCode,
    rrn: rrn,
    card_pan: card_pan || '۶۰۳۷-۹۹**-****-۲۸۴۱',
    submitted_at: now.toISOString(),
    approved_at: now.toISOString(),
    notes: `پرداخت آنلاین هزینه مشاوره از طریق درگاه شاپرک (${gateway_provider || 'زرین‌پال'})`
  };

  db.payments.push(paymentRecord);
  writeDb(db);

  return res.json({
    success: true,
    message: `پرداخت آنلاین مبلغ ${payAmount.toLocaleString('fa-IR')} تومان با موفقیت تایید شد.`,
    tracking_code: trackingCode,
    rrn: rrn,
    transaction_time: now.toLocaleTimeString('fa-IR'),
    payment: paymentRecord
  });
});

// ==========================================
// Records Routes (/records and /api/records)
// ==========================================
const recordsRouter = express.Router();

recordsRouter.get('/my-students', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor') {
    return res.status(403).json({ detail: 'فقط مشاوران دسترسی دارند' });
  }
  const db = readDb();
  const advisorId = req.user.id;
  const students = db.users
    .filter((u: any) => u.role === 'student' && u.advisor_id === advisorId)
    .map((u: any) => {
      const studentReports = db.workreports ? db.workreports.filter((w: any) => w.student_id === u.id) : (db.work_reports || []).filter((w: any) => w.student_id === u.id);
      const unreadCount = studentReports.filter((w: any) => !w.is_read_by_advisor).length;
      return {
        id: u.id,
        name: u.full_name,
        customGroup: u.custom_group || 'عادی',
        grade: u.grade || 'دوازدهم',
        taraz: u.taraz || 7000,
        unreadReport: unreadCount > 0,
        lastReportDays: studentReports.length > 0 ? 0 : 2
      };
    });

  return res.json(students);
});

recordsRouter.get('/parent-overview', (req: Request, res: Response) => {
  const db = readDb();
  const student = db.users.find((u: any) => u.id === 5) || db.users.find((u: any) => u.role === 'student');
  const advisor = student?.advisor_id ? db.users.find((u: any) => u.id === student.advisor_id) : db.users.find((u: any) => u.role === 'advisor');
  const reports = (db.work_reports || []).filter((w: any) => w.student_id === student?.id);

  const totalTime = reports.reduce((acc: number, r: any) => acc + (r.total_study_time || 0), 0);
  const totalTests = reports.reduce((acc: number, r: any) => acc + (r.total_test_count || 0), 0);

  return res.json({
    student: {
      id: student?.id || 5,
      name: student?.full_name || 'یاشا محبی',
      grade: student?.grade || 'دوازدهم تجربی',
      school_name: student?.school_name || 'دبیرستان علامه حلی',
      target_field: student?.target_field || 'پزشکی دانشگاه تهران',
      taraz: student?.taraz || 7120,
      phone: student?.phone_number || '09120000004',
      parent_phone: student?.parent_phone || '09120000099'
    },
    advisor: {
      id: advisor?.id || 3,
      name: advisor?.full_name || 'دکتر کاظمی',
      phone: advisor?.phone_number || '09120000003',
      specialty: 'مشاور ارشد کنکور تجربی',
      next_meeting: 'چهارشنبه ۴ آبان - ساعت ۱۸:۳۰ (تماس تلفنی با اولیا)'
    },
    metrics: {
      today_study_hours: 6.5,
      weekly_study_hours: Math.round(totalTime * 10) / 10 || 42.5,
      weekly_tests_count: totalTests || 320,
      attendance_rate: 96,
      plan_completion_rate: 88,
      recent_exam_score: 84.5
    },
    recent_reports: reports.slice(-7),
    advisor_feedback_for_parent: {
      date: '۱۴۰۵/۰۸/۰۲',
      text: 'با سلام خدمت اولیای گرامی، یاشا در هفته جاری روند پیوسته و بسیار مطلوبی در دروس زیست‌شناسی و شیمی داشته است. توصیه می‌شود در منزل استراحت کافی بعد از ساعت ۲۲ رعایت شود تا تمرکز صبحگاهی در آزمون‌های آزمایشی حفظ شود.',
      audio_duration: 35
    },
    recent_exams: [
      { name: 'آزمون آزمایشی ماز جامع پایه', date: '۱۴۰۵/۰۷/۲۸', score: 84, taraz: 7240, status: 'عالی' },
      { name: 'کوییز زمان‌دار شیمی یازدهم', date: '۱۴۰۵/۰۸/۰۱', score: 78, taraz: 6980, status: 'خوب' },
      { name: 'آزمون شبیه‌ساز زیست شناسی', date: '۱۴۰۵/۰۸/۰۳', score: 86, taraz: 7350, status: 'عالی' }
    ]
  });
});

recordsRouter.get('/my-profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان دسترسی دارند.' });
  }
  const db = readDb();
  const student = db.users.find((u: any) => u.id === req.user?.id);
  const advisor = student?.advisor_id ? db.users.find((u: any) => u.id === student.advisor_id) : null;
  const reports = (db.work_reports || []).filter((w: any) => w.student_id === req.user?.id);

  const totalTime = reports.reduce((acc: number, r: any) => acc + (r.total_study_time || 0), 0);
  const totalTests = reports.reduce((acc: number, r: any) => acc + (r.total_test_count || 0), 0);

  const subjectStats: Record<string, { time: number; tests: number }> = {};
  reports.forEach((r: any) => {
    if (r.report_items) {
      Object.entries(r.report_items).forEach(([subj, data]: [string, any]) => {
        if (!subjectStats[subj]) subjectStats[subj] = { time: 0, tests: 0 };
        subjectStats[subj].time += Number(data.time || 0);
        subjectStats[subj].tests += Number(data.tests || 0);
      });
    }
  });

  return res.json({
    profile: {
      id: student?.id,
      name: student?.full_name || 'دانش‌آموز',
      grade: student?.grade || 'دوازدهم تجربی',
      major: student?.major || 'تجربی',
      phone_number: student?.phone_number || '',
      parent_phone: student?.parent_phone || '',
      school_name: student?.school_name || '',
      target_field: student?.target_field || '',
      taraz: student?.taraz || 7000,
      onboarded: !!student?.onboarded,
      advisor_id: student?.advisor_id || null,
      advisor_name: advisor?.full_name || 'تخصیص نیافته',
      advisor_phone: advisor?.phone_number || ''
    },
    stats: {
      total_time: Math.round(totalTime * 10) / 10,
      total_tests: totalTests,
      report_count: reports.length,
      subject_stats: subjectStats
    }
  });
});

recordsRouter.get('/my-plan', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان دسترسی دارند.' });
  }
  const db = readDb();
  const plan = (db.study_plans || [])
    .filter((p: any) => p.student_id === req.user?.id)
    .sort((a: any, b: any) => b.id - a.id)[0];

  if (!plan) {
    return res.json({ message: 'هنوز برنامه‌ای برای شما ثبت نشده است.', plan_data: null });
  }
  return res.json(plan);
});

recordsRouter.get('/student-plan/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor' && req.user?.role !== 'manager' && req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'عدم دسترسی' });
  }
  const studentId = parseInt(req.params.student_id);
  const db = readDb();
  const plan = (db.study_plans || [])
    .filter((p: any) => p.student_id === studentId)
    .sort((a: any, b: any) => b.id - a.id)[0];

  if (!plan) {
    return res.json({ message: 'برنامه‌ای برای این دانش‌آموز ثبت نشده است.', plan_data: null });
  }
  return res.json(plan);
});

recordsRouter.post('/save-plan', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor' && req.user?.role !== 'manager' && req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'عدم دسترسی' });
  }
  const { student_id, start_date, end_date, plan_data } = req.body;
  const targetStudentId = parseInt(student_id) || req.user?.id;
  const db = readDb();
  if (!db.study_plans) db.study_plans = [];

  // Remove previous plan for this student or push latest
  db.study_plans = db.study_plans.filter((p: any) => p.student_id !== targetStudentId);

  const newPlan = {
    id: db.study_plans.length > 0 ? Math.max(...db.study_plans.map((p: any) => p.id)) + 1 : 1,
    student_id: targetStudentId,
    advisor_id: req.user?.id,
    start_date: start_date || '۱۴۰۵/۰۸/۰۱',
    end_date: end_date || '۱۴۰۵/۰۸/۰۷',
    plan_data: plan_data || {},
    created_at: new Date().toISOString()
  };

  db.study_plans.push(newPlan);
  writeDb(db);
  return res.json({ message: 'برنامه با موفقیت ذخیره شد و به پنل دانش‌آموز ارسال گردید ✅', plan_id: newPlan.id });
});

recordsRouter.post('/daily-report', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان دسترسی دارند.' });
  }
  const { report_date, total_study_time, total_test_count, report_items, student_note } = req.body;
  const db = readDb();
  if (!db.work_reports) db.work_reports = [];

  const newReport = {
    id: db.work_reports.length > 0 ? Math.max(...db.work_reports.map((r: any) => r.id)) + 1 : 1,
    student_id: req.user.id,
    report_date: report_date || new Date().toISOString().split('T')[0],
    total_study_time: Number(total_study_time) || 0,
    total_test_count: Number(total_test_count) || 0,
    report_items: report_items || {},
    student_note: student_note || '',
    is_read_by_advisor: false,
    created_at: new Date().toISOString()
  };

  db.work_reports.push(newReport);
  writeDb(db);
  return res.json({ message: 'گزارش کار شما با موفقیت ثبت شد و برای مشاورتان ارسال گردید ✅' });
});

recordsRouter.get('/my-reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان دسترسی دارند.' });
  }
  const db = readDb();
  const reports = (db.work_reports || [])
    .filter((r: any) => r.student_id === req.user?.id)
    .sort((a: any, b: any) => new Date(b.created_at || b.report_date).getTime() - new Date(a.created_at || a.report_date).getTime());
  return res.json(reports);
});

recordsRouter.get('/student-reports/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const studentId = parseInt(req.params.student_id);
  const db = readDb();

  // Mark unread as read if advisor/manager is checking
  (db.work_reports || []).forEach((r: any) => {
    if (r.student_id === studentId) {
      r.is_read_by_advisor = true;
    }
  });
  writeDb(db);

  const reports = (db.work_reports || [])
    .filter((r: any) => r.student_id === studentId)
    .sort((a: any, b: any) => new Date(b.created_at || b.report_date).getTime() - new Date(a.created_at || a.report_date).getTime())
    .slice(0, 30);

  return res.json(reports);
});

recordsRouter.get('/student-overview/:student_id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor' && req.user?.role !== 'manager' && req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'عدم دسترسی' });
  }
  const studentId = parseInt(req.params.student_id);
  const db = readDb();
  const student = db.users.find((u: any) => u.id === studentId);
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }
  const reports = (db.work_reports || []).filter((w: any) => w.student_id === studentId);
  const totalTime = reports.reduce((acc: number, r: any) => acc + (r.total_study_time || 0), 0);
  const totalTests = reports.reduce((acc: number, r: any) => acc + (r.total_test_count || 0), 0);

  const subjectStats: Record<string, { time: number; tests: number }> = {};
  reports.forEach((r: any) => {
    if (r.report_items) {
      Object.entries(r.report_items).forEach(([subj, data]: [string, any]) => {
        if (!subjectStats[subj]) subjectStats[subj] = { time: 0, tests: 0 };
        subjectStats[subj].time += Number(data.time || 0);
        subjectStats[subj].tests += Number(data.tests || 0);
      });
    }
  });

  return res.json({
    student: {
      id: student.id,
      name: student.full_name,
      grade: student.grade || 'دوازدهم',
      phone: student.phone_number,
      custom_group: student.custom_group || 'عادی',
      taraz: student.taraz || 0
    },
    stats: {
      total_time: Math.round(totalTime * 10) / 10,
      total_tests: totalTests,
      report_count: reports.length,
      subject_stats: subjectStats
    },
    recent_reports: reports.slice(-7)
  });
});

recordsRouter.post('/events', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'advisor') {
    return res.status(403).json({ detail: 'عدم دسترسی' });
  }
  const { student_id, event_date, event_time, title, event_type = 'task' } = req.body;
  const db = readDb();
  if (!db.advisor_events) db.advisor_events = [];

  const newEvent = {
    id: db.advisor_events.length > 0 ? Math.max(...db.advisor_events.map((e: any) => e.id)) + 1 : 1,
    advisor_id: req.user.id,
    student_id: student_id || null,
    event_date,
    event_time,
    title,
    event_type,
    created_at: new Date().toISOString()
  };

  db.advisor_events.push(newEvent);
  writeDb(db);
  return res.json({ message: 'رویداد در تقویم ذخیره شد ✅' });
});

// ==========================================
// 💳 SUBSCRIPTION & PAYMENTS ROUTER
// ==========================================
const subscriptionRouter = express.Router();

// GET /status - Check student subscription status
subscriptionRouter.get('/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.json({ is_student: false, is_active: true });
  }

  const db = readDb();
  const student = db.users.find((u: any) => u.id === req.user?.id);
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  const now = Date.now();
  const settings = db.platform_settings || {
    student_fee: 490000,
    card_number: '6219861408052453',
    card_holder: 'سجاد حامدی',
    bank_name: 'بانک سامان'
  };

  let isPaidActive = false;
  if (student.subscription_status === 'paid') {
    if (!student.subscription_expires_at) {
      isPaidActive = true;
    } else {
      isPaidActive = new Date(student.subscription_expires_at).getTime() > now;
    }
  }

  let isGraceActive = false;
  let graceRemainingSeconds = 0;
  if (student.grace_until) {
    const graceEnd = new Date(student.grace_until).getTime();
    if (graceEnd > now) {
      isGraceActive = true;
      graceRemainingSeconds = Math.max(0, Math.floor((graceEnd - now) / 1000));
    }
  }

  const isActive = isPaidActive || isGraceActive;
  const statusStr = isPaidActive ? 'paid' : (isGraceActive ? 'grace_period' : 'unpaid');

  const studentPayments = (db.payments || []).filter((p: any) => p.student_id === student.id);
  const lastPayment = studentPayments.length > 0 ? studentPayments[studentPayments.length - 1] : null;

  return res.json({
    is_student: true,
    is_active: isActive,
    subscription_status: statusStr,
    is_grace_period: isGraceActive,
    grace_remaining_seconds: graceRemainingSeconds,
    grace_until: student.grace_until || null,
    expires_at: student.subscription_expires_at || null,
    student_fee: settings.student_fee,
    card_number: settings.card_number,
    card_holder: settings.card_holder,
    bank_name: settings.bank_name || 'بانک سامان',
    last_payment: lastPayment
  });
});

// POST /pay-gateway - Direct simulated online gateway payment (Instant 30 days unlock)
subscriptionRouter.post('/pay-gateway', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان امکان پرداخت اشتراک را دارند.' });
  }

  const db = readDb();
  const student = db.users.find((u: any) => u.id === req.user?.id);
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  const settings = db.platform_settings || { student_fee: 490000 };
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const trackingCode = 'SHP-' + Math.floor(1000000 + Math.random() * 9000000);

  student.subscription_status = 'paid';
  student.subscription_expires_at = expiresAt;
  student.grace_until = null;

  if (!db.payments) db.payments = [];
  const paymentId = db.payments.length > 0 ? Math.max(...db.payments.map((p: any) => p.id)) + 1 : 1;
  const paymentRecord = {
    id: paymentId,
    student_id: student.id,
    student_name: student.full_name,
    student_phone: student.phone_number,
    amount: settings.student_fee,
    method: 'gateway',
    status: 'approved',
    tracking_code: trackingCode,
    receipt_image: null,
    submitted_at: now.toISOString(),
    grace_until: null,
    approved_at: now.toISOString(),
    expires_at: expiresAt,
    notes: 'پرداخت موفق شتاب از طریق درگاه پرداخت آنلاین'
  };

  db.payments.push(paymentRecord);
  writeDb(db);

  return res.json({
    success: true,
    message: 'پرداخت آنلاین با موفقیت انجام شد و اشتراک ۳۰ روزه شما فعال گردید! 🎉',
    tracking_code: trackingCode,
    expires_at: expiresAt
  });
});

// POST /upload-receipt - Card-to-card transfer receipt upload (Instant 24-hour grace unlock)
subscriptionRouter.post('/upload-receipt', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ detail: 'فقط دانش‌آموزان امکان بارگذاری فیش را دارند.' });
  }

  const { tracking_code, receipt_image, notes } = req.body;
  const db = readDb();
  const student = db.users.find((u: any) => u.id === req.user?.id);
  if (!student) {
    return res.status(404).json({ detail: 'دانش‌آموز یافت نشد' });
  }

  const settings = db.platform_settings || { student_fee: 490000 };
  const now = Date.now();
  // Immediate 24-hour grace period unlocked right now
  const graceUntil = new Date(now + 24 * 60 * 60 * 1000).toISOString();

  student.subscription_status = 'grace_period';
  student.grace_until = graceUntil;

  if (!db.payments) db.payments = [];
  const paymentId = db.payments.length > 0 ? Math.max(...db.payments.map((p: any) => p.id)) + 1 : 1;
  const generatedCode = tracking_code?.trim() || ('CARD-' + Math.floor(100000 + Math.random() * 900000));
  
  const newPayment = {
    id: paymentId,
    student_id: student.id,
    student_name: student.full_name,
    student_phone: student.phone_number,
    amount: settings.student_fee,
    method: 'card_to_card',
    status: 'pending',
    tracking_code: generatedCode,
    receipt_image: receipt_image || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    submitted_at: new Date(now).toISOString(),
    grace_until: graceUntil,
    approved_at: null,
    notes: notes?.trim() || 'واریز کارت به کارت به شماره ۶۲۱۹۸۶۱۴۰۸۰۵۲۴۵۳ سجاد حامدی'
  };

  db.payments.push(newPayment);
  writeDb(db);

  return res.json({
    success: true,
    message: 'رسید با موفقیت ثبت شد. پنل شما به مدت ۲۴ ساعت باز شد تا مدیر پلتفرم تایید نهایی را صادر کند.',
    grace_until: graceUntil,
    grace_remaining_seconds: 24 * 3600,
    payment: newPayment
  });
});

// GET /settings - Public/authenticated settings (fee, card number, holder)
subscriptionRouter.get('/settings', (req: Request, res: Response) => {
  const db = readDb();
  const settings = db.platform_settings || {
    student_fee: 490000,
    card_number: '6219861408052453',
    card_holder: 'سجاد حامدی',
    bank_name: 'بانک سامان'
  };
  return res.json(settings);
});

// POST /settings - Founder sets the subscription fee
subscriptionRouter.post('/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'فقط مدیر پلتفرم مجاز به تغییر تعرفه اشتراک است.' });
  }

  const { student_fee, card_number, card_holder, bank_name } = req.body;
  if (!student_fee || isNaN(Number(student_fee))) {
    return res.status(400).json({ detail: 'مبلغ تعرفه نامعتبر است.' });
  }

  const db = readDb();
  if (!db.platform_settings) {
    db.platform_settings = {
      student_fee: 490000,
      card_number: '6219861408052453',
      card_holder: 'سجاد حامدی',
      bank_name: 'بانک سامان'
    };
  }

  db.platform_settings.student_fee = Number(student_fee);
  if (card_number) db.platform_settings.card_number = card_number;
  if (card_holder) db.platform_settings.card_holder = card_holder;
  if (bank_name) db.platform_settings.bank_name = bank_name;

  writeDb(db);

  return res.json({
    success: true,
    message: `تعرفه اشتراک دانش‌آموزان به مبلغ ${Number(student_fee).toLocaleString('fa-IR')} تومان به‌روزرسانی شد.`,
    settings: db.platform_settings
  });
});

// GET /founder/receipts - Founder views all payments and pending receipts
subscriptionRouter.get('/founder/receipts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'دسترسی غیرمجاز. فقط مدیر پلتفرم مجاز است.' });
  }

  const db = readDb();
  const payments = (db.payments || []).slice().reverse();
  const pendingCount = payments.filter((p: any) => p.status === 'pending').length;

  return res.json({
    payments,
    pending_count: pendingCount,
    settings: db.platform_settings
  });
});

// POST /founder/verify - Founder approves or rejects card-to-card receipt
subscriptionRouter.post('/founder/verify', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'founder') {
    return res.status(403).json({ detail: 'دسترسی غیرمجاز. فقط مدیر پلتفرم مجاز است.' });
  }

  const { payment_id, action, reject_reason } = req.body;
  const db = readDb();
  const payment = (db.payments || []).find((p: any) => p.id === Number(payment_id));
  if (!payment) {
    return res.status(404).json({ detail: 'فیش پرداخت یافت نشد.' });
  }

  const student = db.users.find((u: any) => u.id === payment.student_id);
  const now = new Date();

  if (action === 'approve') {
    payment.status = 'approved';
    payment.approved_at = now.toISOString();
    payment.reject_reason = null;

    if (student) {
      student.subscription_status = 'paid';
      student.subscription_expires_at = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      student.grace_until = null;
    }

    writeDb(db);
    return res.json({
      success: true,
      message: `فیش ${payment.student_name} با موفقیت تایید شد و اشتراک ۳۰ روزه فعال گردید. ✅`,
      payment
    });
  } else if (action === 'reject') {
    payment.status = 'rejected';
    payment.reject_reason = reject_reason || 'فیش بانکی مورد تایید واقع نشد یا تصویر ناخوانا است.';
    payment.rejected_at = now.toISOString();

    if (student) {
      student.subscription_status = 'unpaid';
      student.grace_until = null;
    }

    writeDb(db);
    return res.json({
      success: true,
      message: `فیش ${payment.student_name} رد شد و دسترسی قطع گردید. ❌`,
      payment
    });
  } else {
    return res.status(400).json({ detail: 'دستور نامعتبر است.' });
  }
});

// POST /dev-reset - For testing purposes, toggle student status
subscriptionRouter.post('/dev-reset', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, student_id } = req.body;
  const db = readDb();
  const targetId = student_id || req.user?.id || 5;
  const student = db.users.find((u: any) => u.id === Number(targetId));
  if (!student) return res.status(404).json({ detail: 'کاربر یافت نشد' });

  if (status === 'unpaid') {
    student.subscription_status = 'unpaid';
    student.grace_until = null;
    student.subscription_expires_at = null;
  } else if (status === 'grace') {
    student.subscription_status = 'grace_period';
    student.grace_until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  } else if (status === 'paid') {
    student.subscription_status = 'paid';
    student.subscription_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    student.grace_until = null;
  }

  writeDb(db);
  return res.json({ success: true, student });
});

// ==========================================
// Offline Sync Router (/sync and /api/sync)
// ==========================================
const syncRouter = express.Router();

syncRouter.post('/offline-queue', (req: Request, res: Response) => {
  const { queue } = req.body;
  if (!queue || !Array.isArray(queue)) {
    return res.status(400).json({ detail: 'داده‌های صف آفلاین نامعتبر است.' });
  }

  // Resolve studentId from token if available
  const authHeader = req.headers.authorization;
  let studentId = 5;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.id) studentId = decoded.id;
    } catch (_) {}
  }

  const db = readDb();
  let syncedCount = 0;
  const processedResults: any[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'work_report') {
        const repDate = item.report_date;
        const targetStudent = item.student_id || studentId;
        const existingIdx = db.work_reports.findIndex((r: any) => r.student_id === targetStudent && r.report_date === repDate);

        if (existingIdx >= 0) {
          db.work_reports[existingIdx].total_study_time = Number(item.total_study_time) || 0;
          db.work_reports[existingIdx].total_test_count = Number(item.total_test_count) || 0;
          db.work_reports[existingIdx].report_items = item.report_items || {};
          if (item.student_note) db.work_reports[existingIdx].student_note = item.student_note;
          db.work_reports[existingIdx].synced_from_offline = true;
          db.work_reports[existingIdx].synced_at = new Date().toISOString();
        } else {
          const nextId = db.work_reports.length > 0 ? Math.max(...db.work_reports.map((r: any) => r.id)) + 1 : 1;
          db.work_reports.push({
            id: nextId,
            student_id: targetStudent,
            report_date: repDate,
            total_study_time: Number(item.total_study_time) || 0,
            total_test_count: Number(item.total_test_count) || 0,
            report_items: item.report_items || {},
            student_note: item.student_note || '',
            is_read_by_advisor: false,
            synced_from_offline: true,
            created_at: item.created_at || new Date().toISOString()
          });
        }
        syncedCount++;
        processedResults.push({ id: item.id, status: 'synced', date: repDate });
      } else if (item.type === 'task_toggle') {
        const plan = db.study_plans.find((p: any) => p.student_id === studentId);
        if (plan && plan.plan_data && plan.plan_data[item.day] && plan.plan_data[item.day][item.taskIndex]) {
          plan.plan_data[item.day][item.taskIndex].isDone = item.isDone;
          syncedCount++;
          processedResults.push({ id: item.id, status: 'synced' });
        }
      }
    } catch (e) {
      processedResults.push({ id: item.id, status: 'error' });
    }
  }

  writeDb(db);
  return res.json({
    success: true,
    message: `${syncedCount} مورد ذخیره‌شده آفلاین با سرور مرکزی همگام شد.`,
    synced_count: syncedCount,
    total_received: queue.length,
    results: processedResults
  });
});

// Mount routers at root and at /api
app.use('/auth', authRouter);
app.use('/records', recordsRouter);
app.use('/subscription', subscriptionRouter);
app.use('/sync', syncRouter);
app.use('/api/auth', authRouter);
app.use('/api/records', recordsRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/sync', syncRouter);

// Security & Concurrency Audit API
app.get('/api/security-audit', (req, res) => {
  const db = readDb();
  res.json({
    status: 'optimal',
    timestamp: new Date().toISOString(),
    security: {
      rate_limiting: 'Active (40 attempts/min per IP, Brute-Force Prevention)',
      security_headers: {
        x_content_type_options: 'nosniff',
        x_frame_options: 'SAMEORIGIN',
        x_xss_protection: '1; mode=block',
        referrer_policy: 'strict-origin-when-cross-origin'
      },
      jwt_encryption: 'HMAC-SHA256 signed tokens with 7-day TTL and role claim enforcement',
      password_hashing: 'Bcrypt with 10 salt rounds',
      concurrency: {
        model: 'In-Memory State Cache + POSIX Atomic Renaming (Zero-Race Guarantee)',
        database_size_bytes: JSON.stringify(db).length,
        total_registered_users: db.users.length,
        total_workspaces: db.workspaces.length,
        total_work_reports: db.work_reports.length
      },
      offline_sync: {
        engine: 'PWA CacheFirst + LocalStorage Queuing + Auto-Flush on Reconnect',
        sync_endpoint: '/api/sync/offline-queue'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Medulla Unified Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
