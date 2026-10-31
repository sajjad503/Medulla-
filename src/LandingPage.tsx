import React, { useState } from 'react';
import MentoraLogo from './MentoraLogo';
import { 
  GraduationCap, UserCheck, HeartHandshake, Building, 
  ShieldCheck, WifiOff, RefreshCw, BarChart3, Clock, 
  CreditCard, ChevronRight, CheckCircle2, Sparkles, 
  ArrowLeft, Download, Award, FileSpreadsheet, Lock, 
  Layers, Headphones, Eye, ArrowUpRight, HelpCircle, ChevronDown, ChevronUp,
  Phone, MapPin, Navigation, ExternalLink
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface LandingPageProps {
  onGoToLogin: () => void;
  onQuickRoleLogin?: (role: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage({ onGoToLogin, onQuickRoleLogin, isDarkMode, onToggleTheme }: LandingPageProps) {
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'advisor' | 'parent' | 'manager'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const roleData = {
    student: {
      title: 'پنل اختصاصی دانش‌آموز کنکوری',
      subtitle: 'همه‌چیز برای مطالعه هوشمند، تمرکز عمیق و انضباط تحصیلی',
      color: '#3B82F6',
      badge: 'دانش‌آموز',
      features: [
        'جدول برنامه هفتگی تفکیک‌شده بر اساس روز، شیفت و مباحث هدف',
        'ثبت و ارسال گزارش‌کار روزانه با تفکیک زمان و تست به همراه کپسول مرور',
        'حالت تمرکز عمیق (Focus Mode) و تایمر پومودورو با صداهای باران و نویز سفید',
        'کارکرد ۱۰۰٪ آفلاین: مطالعه و ثبت گزارش بدون نیاز به اینترنت و بارگذاری خودکار',
        'پاسخبرگ تستی مجازی، آزمونک آنلاین و تحلیل کارنامه با نمودارهای d3',
        'سامانه پرداخت شهریه متصل به درگاه شاپرک با مهلت ۲۴ ساعته کارت به کارت'
      ],
      quickRole: 'student'
    },
    advisor: {
      title: 'پنل مشاور ارشد و تخصصی',
      subtitle: 'مدیریت حرفه‌ای شاگردان، برنامه‌ریزی هدفمند و نظارت کیفی',
      color: '#10B981',
      badge: 'مشاور',
      features: [
        'لینک دعوت اختصاصی جهت اتصال مستقیم و خودکار دانش‌آموز به مشاور',
        'میز کار جامع دانش‌آموزان با نمایش تراز، وضعیت گزارش‌کار و هشدار عدم ارسال',
        'تنظیم و ابلاغ برنامه مطالعاتی هفتگی به تفکیک روزها و ساعات هدف',
        'ارزیابی و تحلیل کیفی گزارش‌کارها با بازخورد صوتی و متنی',
        'تقویم و لاگ جلسات حضوری و تماس‌های تلفنی با دانش‌آموز و خانواده',
        'محاسبه دقیق سهم مشاوره و درآمد به صورت درصدی و خودکار'
      ],
      quickRole: 'advisor'
    },
    parent: {
      title: 'سامانه پایش هوشمند والدین',
      subtitle: 'نظارت نامحسوس و مطمئن بر پیشرفت تحصیلی و ساعات مطالعه فرزند',
      color: '#F59E0B',
      badge: 'والدین',
      features: [
        'مشاهده بلادرنگ ساعات مطالعه، تعداد تست‌ها و درصد رضایت فرزند',
        'دسترسی به جدول کامل برنامه هفتگی ابلاغ‌شده توسط مشاور',
        'نمودارهای تصویری روند رشد تراز و کارنامه آزمون‌های آزمایشی',
        'مشاهده بازخوردها و توصیه‌های مشاور تخصصی جهت همراهی در خانواده',
        'حفظ استقلال و آرامش روانی دانش‌آموز بدون نیاز به پیگیری‌های فرسایشی',
        'امکان پرینت و خروجی گزارش وضعیت تحصیلی فرزند'
      ],
      quickRole: 'parent'
    },
    manager: {
      title: 'میز کار مدیریت جامع آکادمی و شعب',
      subtitle: 'اشراف ۳۶۰ درجه بر آموزشگاه، مشاوران، دانش‌آموزان و امور مالی',
      color: '#8B5CF6',
      badge: 'مدیر آکادمی',
      features: [
        'پرونده جامع ۳۶۰ درجه کلیه دانش‌آموزان و مشاوران با جستجوی پیشرفته',
        'خروجی فایل اکسل (CSV با فرمت UTF-8) از تمام برنامه‌ها و گزارش‌کارهای کل موسسه',
        'تنظیم درگاه پرداخت آنلاین شاپرک (زرین‌پال، سامان، ملت، سداد، زیبال و...) با تست پینگ',
        'سیستم تسهیم خودکار سهم مشاور و تعیین شهریه ماهانه برای هر دانش‌آموز',
        'اتصال مستقیم به نرم‌افزارهای مدیریت مالی و حسابداری (هلو، سپیدار و وب‌هوک)',
        'تایید فیش‌های کارت به کارت و مدیریت مهلت ۲۴ ساعته فعال‌سازی پنل'
      ],
      quickRole: 'manager'
    }
  };

  const workflowSteps = [
    {
      num: '۰۱',
      title: 'ورود یا ثبت‌نام با لینک اختصاصی مشاور',
      desc: 'دانش‌آموز می‌تواند مستقیماً یا با لینک معرف مشاور ثبت‌نام کند و مشخصات اولیه خود را وارد نماید.'
    },
    {
      num: '۰۲',
      title: 'تکمیل پرونده ۳۶۰ درجه و تعیین هدف',
      desc: 'اطلاعات پایه، رشته، مدرسه، تراز فعلی و رشته هدف توسط دانش‌آموز و مشاور تعیین و تایید می‌شود.'
    },
    {
      num: '۰۳',
      title: 'دریافت برنامه هفتگی جدولی هوشمند',
      desc: 'برنامه هفتگی با ستون‌های مشخص روز، پارت، مبحث، زمان هدف و تکالیف مشاور ابلاغ می‌گردد.'
    },
    {
      num: '۰۴',
      title: 'مطالعه عمیق با پومودورو (آنلاین یا آفلاین)',
      desc: 'با حالت تمرکز، نویز سفید و تایمر پومودورو مطالعه انجام می‌شود؛ حتی در زمان قطعی کامل اینترنت!'
    },
    {
      num: '۰۵',
      title: 'ارسال خودکار گزارش‌کار و تحلیل d3',
      desc: 'گزارش‌کار به صورت آنی (یا پس از آنلاین شدن) بارگذاری شده و نمودارهای d3 و والدین به‌روزرسانی می‌شوند.'
    }
  ];

  const faqs = [
    {
      q: 'آیا پلتفرم بدون اتصال اینترنت (کاملاً آفلاین) کار می‌کند؟',
      a: 'بله! مدولا بر پایه استاندارد مدرن PWA طراحی شده است. دانش‌آموزان می‌توانند حتی بدون دسترسی به اینترنت وارد سایت شده، از تایمر پومودورو و صداهای آرام‌بخش استفاده کنند و گزارش‌کار خود را ثبت نمایند. به محض اتصال مجدد به اینترنت، سیستم تمام داده‌ها را به صورت خودکار و بدون نیاز به اقدام کاربر با سرور مرکزی همگام می‌کند.'
    },
    {
      q: 'روش اتصال دانش‌آموز به مشاور خاص چگونه است؟',
      a: 'هر مشاور در پنل خود دارای یک لینک دعوت یکتا (مانند medulla.ir?invite=KAZEMI) است. دانش‌آموز با باز کردن این لینک و ثبت مشخصات، به طور خودکار به پنل همان مشاور متصل شده و نیاز به تایید مجدد نخواهد داشت.'
    },
    {
      q: 'درگاه پرداخت شاپرک و نحوه تسویه شهریه چگونه کار می‌کند؟',
      a: 'مدیر آکادمی می‌تواند درگاه‌های آنلاین معتبر شاپرک (زرین‌پال، سامان، ملت، زیبال و...) را پیکربندی کند. دانش‌آموزان می‌توانند شهریه را آنلاین واریز کرده یا فیش کارت به کارت را بارگذاری کنند. در صورت کارت به کارت، بلافاصله یک مهلت دسترسی موقت ۲۴ ساعته فعال می‌شود تا مدیر فرصت تایید نهایی فیش را داشته باشد.'
    },
    {
      q: 'آیا امکان خروجی اکسل و ارتباط با حسابداری وجود دارد؟',
      a: 'بله. مدیر آموزشگاه می‌تواند با یک کلیک از کلیه برنامه‌های هفتگی و تمامی گزارش‌کارهای ثبت‌شده خروجی کامل اکسل (UTF-8 با ساپورت فارسی) دریافت کند. همچنین وب‌هوک و ماژول اتصال به نرم‌افزارهای هلو و سپیدار تعبیه شده است.'
    }
  ];

  return (
    <div className="landing-container" style={{
      minHeight: '100vh',
      background: 'var(--bg-main, #0A1128)',
      color: 'var(--text-main, #F1F5F9)',
      direction: 'rtl',
      fontFamily: 'inherit',
      overflowX: 'hidden'
    }}>
      {/* Top Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(12, 29, 63, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(197, 168, 128, 0.2)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '38px', height: '38px', flexShrink: 0 }}>
            <MentoraLogo style={{ filter: 'drop-shadow(0 2px 8px rgba(197,168,128,0.4))' }} />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2px', color: '#E6C287' }}>MEDULLA</span>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginTop: '-2px' }}>سامانه جامع هدایت تحصیلی و مدیریت آکادمی</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', fontWeight: '600' }}>
          <a href="#features" style={{ color: '#E2E8F0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#E6C287'} onMouseLeave={e => e.currentTarget.style.color = '#E2E8F0'}>قابلیت‌های ۴ پنل</a>
          <a href="#workflow" style={{ color: '#E2E8F0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#E6C287'} onMouseLeave={e => e.currentTarget.style.color = '#E2E8F0'}>روش کار گام‌به‌گام</a>
          <a href="#offline-security" style={{ color: '#E2E8F0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#E6C287'} onMouseLeave={e => e.currentTarget.style.color = '#E2E8F0'}>کارکرد آفلاین و امنیت</a>
          <a href="#semnan-branch" style={{ color: '#E6C287', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FDE6B8'} onMouseLeave={e => e.currentTarget.style.color = '#E6C287'}>مرکز سمنان و تماس</a>
          <a href="#faq" style={{ color: '#E2E8F0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#E6C287'} onMouseLeave={e => e.currentTarget.style.color = '#E2E8F0'}>سوالات متداول</a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PWAInstallButton />
          <button
            onClick={onToggleTheme}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(197,168,128,0.3)',
              color: '#E6C287',
              padding: '8px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="تغییر تم"
          >
            {isDarkMode ? '☀️ روز' : '🌙 شب'}
          </button>

          <button
            onClick={onGoToLogin}
            style={{
              background: 'linear-gradient(135deg, #C5A880 0%, #E6C287 100%)',
              color: '#0C1D3F',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '10px',
              fontWeight: '900',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: '0 4px 15px rgba(230,194,135,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Lock size={15} />
            <span>ورود به سامانه</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '70px 24px 60px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(27, 51, 102, 0.4) 0%, rgba(12, 29, 63, 0) 70%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(197, 168, 128, 0.15)',
            border: '1px solid rgba(197, 168, 128, 0.4)',
            color: '#E6C287',
            padding: '6px 16px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            <Sparkles size={14} color="#E6C287" />
            <span>نسل نوین EdTech و هدایت تحصیلی یکپارچه در ایران</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: '900',
            lineHeight: '1.3',
            color: '#FFFFFF',
            margin: '0 0 20px',
            letterSpacing: '-0.5px'
          }}>
            پلتفرم یکپارچه مشاوره کنکور و مدیریت هوشمند آکادمی‌ها
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: '#CBD5E1',
            lineHeight: '1.8',
            maxWidth: '780px',
            margin: '0 auto 32px'
          }}>
            مدولا حلقه‌ی اتصال زنده و بدون نقص میان <strong>دانش‌آموز</strong>، <strong>مشاور تخصصی</strong>، <strong>والدین</strong> و <strong>مدیریت آموزشگاه</strong> است. برنامه‌ریزی هفتگی جدولی، ارسال آفلاین گزارش‌کار، تایمر تمرکز پومودورو، کارنامه پیشرفته d3 و درگاه پرداخت شاپرک.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button
              onClick={onGoToLogin}
              style={{
                background: 'linear-gradient(135deg, #C5A880 0%, #E6C287 100%)',
                color: '#0C1D3F',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(230,194,135,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span>ورود مستقیم به پنل کاربری</span>
              <ArrowLeft size={18} />
            </button>

            <a
              href="#features"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>بررسی امکانات ۴ پنل</span>
              <ChevronDown size={16} />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{ background: 'rgba(12, 29, 63, 0.6)', border: '1px solid rgba(197,168,128,0.2)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#E6C287' }}>۱۰۰٪</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>کارکرد آفلاین با همگام‌سازی ابری</div>
            </div>
            <div style={{ background: 'rgba(12, 29, 63, 0.6)', border: '1px solid rgba(197,168,128,0.2)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#10B981' }}>۴ پنل</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>دانش‌آموز، مشاور، والدین، مدیر</div>
            </div>
            <div style={{ background: 'rgba(12, 29, 63, 0.6)', border: '1px solid rgba(197,168,128,0.2)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#38BDF8' }}>شاپرک</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>اتصال ۶ درگاه بانکی معتبر شتاب</div>
            </div>
            <div style={{ background: 'rgba(12, 29, 63, 0.6)', border: '1px solid rgba(197,168,128,0.2)', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#C084FC' }}>d3.js</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>تحلیل پیشرفته تراز و عملکرد آزمون</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Features & The 4 Roles */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 12px' }}>
            این پلتفرم چه کارهایی را انجام می‌دهد؟
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
            مدولا برای هر یک از بازیگران حوزه آموزش یک فضای کاری تخصصی و به هم پیوسته ایجاد کرده است:
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {[
            { id: 'student', label: '۱. پنل دانش‌آموز', icon: <GraduationCap size={18} /> },
            { id: 'advisor', label: '۲. پنل مشاور تخصصی', icon: <UserCheck size={18} /> },
            { id: 'parent', label: '۳. سامانه پایش والدین', icon: <HeartHandshake size={18} /> },
            { id: 'manager', label: '۴. پنل مدیر آکادمی', icon: <Building size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveRoleTab(tab.id as any)}
              style={{
                background: activeRoleTab === tab.id ? 'linear-gradient(135deg, #0C1D3F 0%, #1E3A8A 100%)' : 'rgba(255,255,255,0.05)',
                color: activeRoleTab === tab.id ? '#E6C287' : '#94A3B8',
                border: activeRoleTab === tab.id ? '2px solid #C5A880' : '1px solid rgba(255,255,255,0.1)',
                padding: '12px 22px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeRoleTab === tab.id ? '0 4px 20px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Role Content Card */}
        {(() => {
          const current = roleData[activeRoleTab];
          return (
            <div style={{
              background: 'linear-gradient(145deg, rgba(12, 29, 63, 0.7) 0%, rgba(18, 38, 77, 0.9) 100%)',
              border: '1px solid rgba(197, 168, 128, 0.3)',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(197, 168, 128, 0.2)',
                  color: '#E6C287',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '12px'
                }}>
                  {current.badge}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 8px' }}>
                  {current.title}
                </h3>
                <p style={{ color: '#CBD5E1', fontSize: '14px', marginBottom: '24px', lineHeight: '1.7' }}>
                  {current.subtitle}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {current.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: '1.6' }}>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (onQuickRoleLogin) onQuickRoleLogin(current.quickRole);
                      else onGoToLogin();
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #C5A880 0%, #E6C287 100%)',
                      color: '#0C1D3F',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>ورود به {current.badge}</span>
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>

              {/* Visual Role Preview Card */}
              <div style={{
                background: 'rgba(8, 18, 38, 0.85)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E6C287' }}>ویژگی‌های شاخص این پنل</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>سیستم آنلاین / آفلاین</span>
                </div>

                {activeRoleTab === 'student' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #3B82F6' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#93C5FD' }}>جدول برنامه هفتگی اختصاصی</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>نمایش پارت‌ها، ساعات مطالعه و تست‌های هدف به تفکیک شنبه تا جمعه</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #10B981' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#86EFAC' }}>ارسال گزارش‌کار با صف آفلاین</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>ثبت آنی گزارش بدون اینترنت، با ارسال خودکار پس از اتصال مجدد شبکه</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #F59E0B' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FDE68A' }}>تایمر پومودورو و صدای باران</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>شخصی‌سازی تایم استراحت، صدای پیانو و تنفس ریلکسیشن</div>
                    </div>
                  </div>
                )}

                {activeRoleTab === 'advisor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #10B981' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#86EFAC' }}>لینک اختصاصی دعوت شاگرد</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>اتصال بدون واسطه دانش‌آموز جدید با لینک ویژه هر مشاور</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #38BDF8' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#BAE6FD' }}>ثبت و مدیریت برنامه‌های هفتگی</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>تنظیم زمان‌های هدف، دستورالعمل پارت‌ها و اصلاح برنامه‌ها</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #EC4899' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FBCFE8' }}>تحلیل گزارش‌کار و بازخورد صوتی</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>ارسال پیامک و نوتیفیکیشن هشدار عدم ارسال تا ساعت ۴ عصر فردا</div>
                    </div>
                  </div>
                )}

                {activeRoleTab === 'parent' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #F59E0B' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FDE68A' }}>پایش لحظه‌ای مطالعه فرزند</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>نمایش ساعات درس، تعداد تست‌ها و روند تراز آزمون‌ها بدون ایجاد اضطراب</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #3B82F6' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#93C5FD' }}>جدول برنامه هفتگی فرزند</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>مشاهده پارت‌های مطالعاتی روزانه و میزان تحقق اهداف درسی</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #10B981' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#86EFAC' }}>هماهنگی و نظرات مشاور</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>مشاهده یادداشت‌های تخصصی و خروجی قابل چاپ پرونده</div>
                    </div>
                  </div>
                )}

                {activeRoleTab === 'manager' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #8B5CF6' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#DDD6FE' }}>خروجی اکسل و گزارشات تجمیعی</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>دانلود فایل اکسل برنامه‌ها و گزارش‌کارهای کل دانش‌آموزان به صورت یکپارچه</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #E6C287' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#FEF08A' }}>اتصال ۶ درگاه بانکی شاپرک</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>پیکربندی زرین‌پال، سامان، ملت، سداد و تسهیم خودکار سهم مشاور</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', borderRight: '3px solid #38BDF8' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#BAE6FD' }}>یکپارچه‌سازی هلو و سپیدار</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>اتصال نرم‌افزارهای مالی، صدور فاکتور و ثبت بستانکاری مشاور</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Section 2: Step-by-Step Workflow */}
      <section id="workflow" style={{
        padding: '80px 24px',
        background: 'rgba(12, 29, 63, 0.4)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 12px' }}>
              روش کار مدولا چگونه است؟ (قدم به قدم)
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '15px' }}>
              یک فرآیند ۵ مرحله‌ای روان و مهندسی‌شده از بدو ثبت‌نام تا موفقیت در کنکور سراسری:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(12, 29, 63, 0.7)',
                  border: '1px solid rgba(197, 168, 128, 0.2)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  fontSize: '50px',
                  fontWeight: '900',
                  color: 'rgba(197, 168, 128, 0.08)',
                  userSelect: 'none'
                }}>
                  {step.num}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(197, 168, 128, 0.2)',
                  color: '#E6C287',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '14px'
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#FFFFFF', margin: '0 0 8px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: '1.7', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Offline-First & Security & High Concurrency */}
      <section id="offline-security" style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 12px' }}>
            امنیت داده‌ها، مقاومت همزمانی و کارکرد ۱۰۰٪ آفلاین
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '15px' }}>
            پلتفرمی که حتی در زمان قطعی کامل اینترنت، کارکرد دانش‌آموز را متوقف نمی‌کند:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(12, 29, 63, 0.8) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '28px',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <WifiOff size={24} color="#10B981" />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>معماری Offline-First</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.8' }}>
              دانش‌آموز می‌تواند در کتابخانه، سالن مطالعه یا مناطق با آنتن‌دهی ضعیف وارد سامانه شده، برنامه را مرور کند، پومودورو را استارت بزند و گزارش‌کار روزانه خود را ثبت نماید. تمام اطلاعات در حافظه محلی ذخیره شده و به محض اتصال به شبکه، خودکار ارسال می‌شود.
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(12, 29, 63, 0.8) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '28px',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <ShieldCheck size={24} color="#3B82F6" />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', margin: 0 }}>تست امنیتی و همزمانی بالا</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: '1.8' }}>
              مجهز به سپر محافظتی ضد بروت‌فورس (Rate Limiting ۴۰ درخواست در دقیقه)، هدرهای امنیتی ضد جعل داده، سیستم کش مقیم در حافظه با نگارش اتمیک (POSIX Atomic Rename) برای جلوگیری از تداخل حتی با هزاران کاربر همزمان.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: FAQ Accordion */}
      <section id="faq" style={{
        padding: '70px 24px',
        maxWidth: '850px',
        margin: '0 auto',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 10px' }}>
            پرسش‌های متداول شما
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '14px' }}>پاسخ به سوالات رایج دانش‌آموزان، مشاوران و موسسات</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(12, 29, 63, 0.6)',
                border: '1px solid rgba(197, 168, 128, 0.2)',
                borderRadius: '14px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '18px 20px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} color="#E6C287" /> : <ChevronDown size={18} color="#94A3B8" />}
              </button>
              {openFaq === idx && (
                <div style={{
                  padding: '0 20px 20px',
                  color: '#CBD5E1',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '14px'
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* بخش مرکز مشاوره سمنان، ساعات کاری، تماس و نقشه گوگل (Local SEO) */}
      <section id="semnan-branch" style={{
        padding: '70px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: '1px solid rgba(197, 168, 128, 0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(230, 194, 135, 0.15)',
            color: '#E6C287',
            border: '1px solid rgba(230, 194, 135, 0.35)',
            padding: '6px 16px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '14px'
          }}>
            <MapPin size={15} color="#E6C287" />
            <span>قطب مشاوره تحصیلی و هدایت کنکور استان سمنان</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '900', color: '#FFFFFF', margin: '0 0 12px' }}>
            مرکز مشاوره تخصصی و دفتر مرکزی سمنان
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '15px', maxWidth: '720px', margin: '0 auto' }}>
            پذیرش حضوری دانش‌آموزان و اولیای گرامی در سمنان جهت تعیین سطح، آزمون‌های شبیه‌ساز، انتخاب رشته و پایش تحصیلی به همراه پشتیبانی تلفنی سراسری.
          </p>
        </div>

        {/* 2-Column Grid: Contact/Hours + Google Map */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: '28px',
          alignItems: 'stretch'
        }}>
          {/* Card 1: Hours & Phone Numbers */}
          <div style={{
            background: 'rgba(12, 29, 63, 0.75)',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            borderRadius: '20px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
          }}>
            <div>
              {/* Badge: Live Working Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#E6C287" />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#FFFFFF' }}>
                    ساعات کاری و پذیرش رسمی
                  </h3>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                  مرکز هم‌اکنون فعال و پاسخگوست
                </span>
              </div>

              {/* Hours Table / List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '13px' }}>شنبه تا چهارشنبه:</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>مشاوره حضوری، برنامه‌ریزی درسی و ثبت گزارش‌کار</span>
                  </div>
                  <span className="mono-num" style={{ color: '#E6C287', fontWeight: '900', fontSize: '14px', direction: 'ltr' }}>
                    08:00 - 21:00
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '13px' }}>پنجشنبه‌ها:</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>رفع اشکال هفتگی و تحلیل آزمونک‌های شبیه‌ساز</span>
                  </div>
                  <span className="mono-num" style={{ color: '#E6C287', fontWeight: '900', fontSize: '14px', direction: 'ltr' }}>
                    08:00 - 18:00
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: '13px' }}>جمعه‌ها:</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>برگزاری آزمون شبیه‌ساز کنکور و پشتیبانی تحلیلی</span>
                  </div>
                  <span className="mono-num" style={{ color: '#E6C287', fontWeight: '900', fontSize: '14px', direction: 'ltr' }}>
                    10:00 - 14:00
                  </span>
                </div>
              </div>

              {/* Contact Information & Phone Numbers */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#FFFFFF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} color="#E6C287" />
                  شماره‌های تماس پشتیبانی اختصاصی سمنان
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                  <a
                    href="tel:02333345678"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(230, 194, 135, 0.1)',
                      border: '1px solid rgba(230, 194, 135, 0.3)',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#FFFFFF',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(230, 194, 135, 0.2)';
                      e.currentTarget.style.borderColor = '#E6C287';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(230, 194, 135, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(230, 194, 135, 0.3)';
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#E6C287', color: '#0C1D3F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#CBD5E1', display: 'block' }}>خط ثابت دفتر سمنان:</span>
                      <strong className="mono-num" style={{ fontSize: '14px', color: '#E6C287', direction: 'ltr', display: 'inline-block' }}>
                        ۰۲۳-۳۳۳۴۵۶۷۸
                      </strong>
                    </div>
                  </a>

                  <a
                    href="tel:09120000003"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#FFFFFF',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                      e.currentTarget.style.borderColor = '#3B82F6';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#3B82F6', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Headphones size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#CBD5E1', display: 'block' }}>خط مستقیم کشیک مشاوران:</span>
                      <strong className="mono-num" style={{ fontSize: '14px', color: '#93C5FD', direction: 'ltr', display: 'inline-block' }}>
                        ۰۹۱۲-۰۰۰-۰۰۰۳
                      </strong>
                    </div>
                  </a>
                </div>

                {/* Address block */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#CBD5E1', lineHeight: '1.7' }}>
                  <MapPin size={16} color="#E6C287" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>
                    <strong>نشانی حضوری:</strong> سمنان، بلوار قدس، نبش خیابان نهم، مجتمع آموزشی مدولا، طبقه ۳ (کد پستی: ۳۵۱۳۸۱۲۳۴۵)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Interactive Google Map */}
          <div style={{
            background: 'rgba(12, 29, 63, 0.75)',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(197, 168, 128, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(10, 20, 45, 0.6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={17} color="#E6C287" />
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#FFFFFF' }}>
                  موقعیت مکانی روی نقشه سمنان (بلوار قدس)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                مختصات: 35.5769, 53.3953
              </span>
            </div>

            {/* Embedded Google Map */}
            <div style={{ flex: 1, minHeight: '260px', position: 'relative', width: '100%', background: '#0a1128' }}>
              <iframe
                title="موقعیت آکادمی مدولا در سمنان"
                src="https://maps.google.com/maps?q=35.5769,53.3953&hl=fa&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '280px', width: '100%', display: 'block', filter: isDarkMode ? 'contrast(0.9) brightness(0.9)' : 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            {/* Navigation action buttons */}
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid rgba(197, 168, 128, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              background: 'rgba(10, 20, 45, 0.6)'
            }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: 'auto' }}>
                مسیریابی هوشمند:
              </span>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=35.5769,53.3953"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(230, 194, 135, 0.15)',
                  color: '#E6C287',
                  border: '1px solid rgba(230, 194, 135, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(230, 194, 135, 0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(230, 194, 135, 0.15)'}
              >
                <Navigation size={13} />
                <span>گوگل مپ (Google Maps)</span>
              </a>
              <a
                href="https://nshn.ir/?lat=35.5769&lng=53.3953"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#93C5FD',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
              >
                <ExternalLink size={13} />
                <span>مسیریابی با نشان</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#071026',
        borderTop: '1px solid rgba(197, 168, 128, 0.2)',
        padding: '50px 24px 30px',
        color: '#94A3B8',
        fontSize: '13px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '30px', height: '30px' }}>
                <MentoraLogo />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#E6C287' }}>MEDULLA</span>
            </div>
            <p style={{ lineHeight: '1.7', fontSize: '12px', color: '#64748B' }}>
              مرکز تخصصی مشاوره و برنامه‌ریزی کنکور، هدایت تحصیلی و نظارت هوشمند اولیا و دانش‌آموزان در استان سمنان و سراسر ایران.
            </p>
            <div style={{ fontSize: '11px', color: '#E6C287', marginTop: '10px', lineHeight: '1.8' }}>
              📍 دفتر مرکزی سمنان: بلوار قدس، نبش خیابان نهم، مجتمع مدولا | تلفن: ۳۳۳۴۵۶۷۸-۰۲۳
            </div>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold', marginBottom: '14px' }}>دسترسی سریع</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none' }}>امکانات ۴ پنل</a></li>
              <li><a href="#workflow" style={{ color: '#94A3B8', textDecoration: 'none' }}>روش کار گام‌به‌گام</a></li>
              <li><a href="#offline-security" style={{ color: '#94A3B8', textDecoration: 'none' }}>قابلیت‌های آفلاین</a></li>
              <li><a href="#faq" style={{ color: '#94A3B8', textDecoration: 'none' }}>پرسش‌های متداول</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold', marginBottom: '14px' }}>شروع به کار</h4>
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.7', marginBottom: '12px' }}>
              جهت ورود به پنل آزمایشی، مشاهده برنامه مطالعاتی یا تست درگاه پرداخت وارد شوید:
            </p>
            <button
              onClick={onGoToLogin}
              style={{
                background: 'linear-gradient(135deg, #C5A880 0%, #E6C287 100%)',
                color: '#0C1D3F',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '900',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>ورود به سامانه مدولا</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', fontSize: '11px', color: '#475569' }}>
          تمامی حقوق مادی و معنوی متعلق به پلتفرم مدولا (Medulla) می‌باشد © ۱۴۰۵
        </div>
      </footer>
    </div>
  );
}
