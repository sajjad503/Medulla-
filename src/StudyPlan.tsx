import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Clock, Loader2, Target, CheckSquare, Square, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Filter, BookOpen,
  Calendar, Layers, Sun, Sunset, Moon, Award, Table
} from 'lucide-react';
import api from './api';
import WeeklyPlanTableView from './WeeklyPlanTableView';

const DEFAULT_WEEKLY_PLAN = {
  start_date: '۱۴۰۵/۰۸/۰۱',
  end_date: '۱۴۰۵/۰۸/۰۷',
  plan_data: {
    'شنبه': [
      { id: 'sat-1', shift: 'morning', title: 'زیست‌شناسی دهم - فصل گوارش و جذب مواد', duration: 90, tests: 40, description: 'مطالعه خط به خط متن کتاب + حل ۴۰ تست آموزشی از منبع اول', isDone: true, subject: 'زیست' },
      { id: 'sat-2', shift: 'afternoon', title: 'شیمی یازدهم - استوکیومتری و سینتیک', duration: 75, tests: 25, description: 'مرور فرمول‌های فرار و بازده درصدی + حل ۲۵ تست زمان‌دار', isDone: true, subject: 'شیمی' },
      { id: 'sat-3', shift: 'evening', title: 'ریاضیات جامع - مشتق و کاربرد مشتق', duration: 90, tests: 30, description: 'حل تست‌های کنکور داخل و خارج ۹۸ تا ۱۴۰۲ + بررسی دام‌های تستی', isDone: false, subject: 'ریاضی' },
      { id: 'sat-4', shift: 'night', title: 'کپسول شبانه - ریدینگ زبان و آرایه ادبی', duration: 45, tests: 15, description: 'یک درک مطلب زبان انگلیسی + ۱۰ تست آرایه کنکور', isDone: false, subject: 'عمومی' }
    ],
    'یکشنبه': [
      { id: 'sun-1', shift: 'morning', title: 'فیزیک دوازدهم - حرکت‌شناسی و شتاب ثابت', duration: 90, tests: 35, description: 'خلاصه‌نویسی نمودارهای مکان-زمان و سرعت-زمان + ۳۵ تست', isDone: true, subject: 'فیزیک' },
      { id: 'sun-2', shift: 'afternoon', title: 'زیست دوازدهم - رونویسی و پروتئین‌سازی', duration: 90, tests: 45, description: 'بررسی تصاویر و شکل‌های کلیدی فصل ژنتیک + تست‌های ترکیبی', isDone: false, subject: 'زیست' },
      { id: 'sun-3', shift: 'evening', title: 'شیمی دوازدهم - اسیدها و بازها و pH', duration: 75, tests: 25, description: 'حل مسائل لگاریتم و ثابت تفکیک اسیدی', isDone: false, subject: 'شیمی' },
      { id: 'sun-4', shift: 'night', title: 'مرور کپسولی لغات ادبیات و زبان', duration: 40, tests: 20, description: 'مرور فلش‌کارت‌های لغات ستاره‌دار', isDone: false, subject: 'عمومی' }
    ],
    'دوشنبه': [
      { id: 'mon-1', shift: 'morning', title: 'شیمی دهم - ساختار اتم و جدول تناوبی', duration: 75, tests: 30, description: 'حل تست‌های مضرب ۳ و رسم ساختارهای لوویس', isDone: false, subject: 'شیمی' },
      { id: 'mon-2', shift: 'afternoon', title: 'ریاضیات - مثلثات و معادلات مثلثاتی', duration: 90, tests: 35, description: 'رفع اشکال تست‌های غلط آزمون قلم‌چی و ماز', isDone: false, subject: 'ریاضی' },
      { id: 'mon-3', shift: 'evening', title: 'زیست دهم - تبادلات گازی و تنفس', duration: 80, tests: 35, description: 'تست‌های ترکیبی هموگلوبین و حجم‌های تنفسی', isDone: false, subject: 'زیست' }
    ],
    'سه‌شنبه': [
      { id: 'tue-1', shift: 'morning', title: 'زیست‌شناسی دهم - گردش مواد در بدن انسان', duration: 90, tests: 40, description: 'ترکیب نوار قلب با دریچه‌ها و فشار خون لنفاوی', isDone: false, subject: 'زیست' },
      { id: 'tue-2', shift: 'afternoon', title: 'فیزیک یازدهم - الکتریسیته ساکن و خازن', duration: 85, tests: 30, description: 'مسائل اتصال خازن‌ها و میدان الکتریکی یکنواخت', isDone: false, subject: 'فیزیک' },
      { id: 'tue-3', shift: 'evening', title: 'زمین‌شناسی - کانی‌ها و منابع معدنی', duration: 60, tests: 25, description: 'حفظ جدول نام کانی‌ها و کاربرد صنعتی', isDone: false, subject: 'زمین' }
    ],
    'چهارشنبه': [
      { id: 'wed-1', shift: 'morning', title: 'فیزیک دوازدهم - نوسان و امواج مکانیکی', duration: 90, tests: 35, description: 'فرمول‌های بسامد زاویه‌ای و دوره تناوب آونگ و فنر', isDone: false, subject: 'فیزیک' },
      { id: 'wed-2', shift: 'afternoon', title: 'شیمی دهم - محلول‌ها و غلظت مولار', duration: 75, tests: 30, description: 'تمرین تست‌های درصد جرمی و انحلال‌پذیری نمک‌ها', isDone: false, subject: 'شیمی' },
      { id: 'wed-3', shift: 'evening', title: 'ریاضیات - هندسه تحلیلی و مقاطع مخروطی', duration: 80, tests: 25, description: 'دایره و بیضی + فرمول‌های فاصله نقطه از خط', isDone: false, subject: 'ریاضی' }
    ],
    'پنجشنبه': [
      { id: 'thu-1', shift: 'morning', title: 'شبیه‌سازی آزمونک زمان‌دار جامع پایه', duration: 90, tests: 50, description: 'حل آزمون ۵۰ سوالی زمان‌دار با پاسخبرگ جهت آمادگی جمعه', isDone: false, subject: 'تست زمان‌دار' },
      { id: 'thu-2', shift: 'afternoon', title: 'تحلیل آزمونک و رفع اشکال تست‌های نزده', duration: 75, tests: 0, description: 'یادداشت نکات مهم در دفترچه خودآموز', isDone: false, subject: 'تحلیل' },
      { id: 'thu-3', shift: 'evening', title: 'مرور کپسول‌های شبانه و فرمول‌های کلیدی هفته', duration: 60, tests: 20, description: 'مرور سبک خلاصه‌های هفته و خواب زودهنگام قبل از ۲۲:۳۰', isDone: false, subject: 'مرور' }
    ],
    'جمعه': [
      { id: 'fri-1', shift: 'morning', title: 'شرکت در آزمون آزمایشی ماز / قلم‌چی', duration: 210, tests: 110, description: 'اجرای دقیق استراتژی زمان‌های نقصانی و مدیریت دفترچه', isDone: false, subject: 'آزمون اصلی' },
      { id: 'fri-2', shift: 'afternoon', title: 'تحلیل تک تک سوالات و محاسبه درصدها', duration: 120, tests: 0, description: 'ثبت درصدهای کارنامه در پنل مدولا و استخراج نقاط ضعف', isDone: false, subject: 'تحلیل' },
      { id: 'fri-3', shift: 'night', title: 'ارسال گزارش‌کار جامع هفته به مشاور', duration: 30, tests: 0, description: 'ارسال مجموع ساعت و تست هفته و دریافت بازخورد مشاور', isDone: false, subject: 'مشاوره' }
    ]
  }
};

const DAYS_OF_WEEK = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export default function StudyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'daily' | 'weekly'>('table');
  
  // Current day selection
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const todayPersian = dayNames[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState<string>(todayPersian);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('همه');

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const fetchMyPlan = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/records/my-plan');
      if (response.data && response.data.plan_data && Object.keys(response.data.plan_data).length > 0) {
        setPlan(response.data);
      } else {
        // Fallback to rich default weekly plan
        setPlan(DEFAULT_WEEKLY_PLAN);
      }
    } catch (err) {
      setPlan(DEFAULT_WEEKLY_PLAN);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = (day: string, taskIdOrIndex: any) => {
    if (!plan || !plan.plan_data) return;
    const updated = { ...plan };
    const dayTasks = [...(updated.plan_data[day] || [])];
    
    if (typeof taskIdOrIndex === 'number') {
      dayTasks[taskIdOrIndex] = {
        ...dayTasks[taskIdOrIndex],
        isDone: !dayTasks[taskIdOrIndex].isDone
      };
    } else {
      const idx = dayTasks.findIndex(t => t.id === taskIdOrIndex);
      if (idx !== -1) {
        dayTasks[idx] = { ...dayTasks[idx], isDone: !dayTasks[idx].isDone };
      }
    }
    
    updated.plan_data = { ...updated.plan_data, [day]: dayTasks };
    setPlan(updated);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--gold-dark)' }}>
        <Loader2 size={40} className="spin-animation" color="var(--gold)" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: 'var(--primary)' }}>در حال بارگذاری برنامه هفتگی اختصاصی...</h3>
      </div>
    );
  }

  const activePlan = plan || DEFAULT_WEEKLY_PLAN;
  const planData = activePlan.plan_data || {};

  // Compute Weekly Metrics
  let totalTasks = 0;
  let completedTasks = 0;
  let totalMinutes = 0;
  let totalTests = 0;

  DAYS_OF_WEEK.forEach(d => {
    const list = planData[d] || [];
    list.forEach((t: any) => {
      totalTasks += 1;
      if (t.isDone) completedTasks += 1;
      totalMinutes += Number(t.duration || 0);
      totalTests += Number(t.tests || 0);
    });
  });

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const currentDayTasks = (planData[selectedDay] || []).filter((t: any) => {
    if (selectedSubjectFilter === 'همه') return true;
    return (t.subject || '').includes(selectedSubjectFilter) || (t.title || '').includes(selectedSubjectFilter);
  });

  const getShiftBadge = (shift: string) => {
    if (shift === 'morning') return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '6px' }}><Sun size={12} /> شیفت صبح</span>;
    if (shift === 'afternoon') return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', padding: '2px 8px', borderRadius: '6px' }}><Sunset size={12} /> شیفت بعدازظهر</span>;
    if (shift === 'evening') return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)', padding: '2px 8px', borderRadius: '6px' }}><Sunset size={12} /> شیفت عصر</span>;
    return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#ec4899', background: 'rgba(236, 72, 153, 0.12)', padding: '2px 8px', borderRadius: '6px' }}><Moon size={12} /> کپسول شب</span>;
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '40px', direction: 'rtl' }}>
      
      {/* هدر پرستیژ برنامه هفتگی */}
      <div className="bento-card" style={{
        marginBottom: '20px',
        borderBottom: '3px solid var(--gold)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'var(--primary)',
            padding: '14px',
            borderRadius: '16px',
            color: 'var(--gold)',
            boxShadow: '0 8px 20px rgba(12, 29, 63, 0.25)',
            border: '2px solid var(--gold)'
          }}>
            <CalendarDays size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '22px', fontWeight: '900' }}>
                برنامه مطالعاتی هفتگی مدولا
              </h2>
              <span className="pill-badge" style={{ background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', border: '1px solid var(--gold)', fontSize: '11px' }}>
                هفته جاری ({activePlan.start_date} الی {activePlan.end_date})
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              برنامه‌ریزی استراتژیک کنکور تنظیم‌شده بر اساس زمان‌های نقصانی و مرورهای پلکانی مشاور
            </p>
          </div>
        </div>

        {/* سوییچ نما: جدول، روزانه یا تقویم کل هفته */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? 'var(--gold)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Table size={14} />
            جدول رسمی هفتگی
          </button>
          <button
            onClick={() => setViewMode('daily')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'daily' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'daily' ? 'var(--gold)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={14} />
            نمای روزانه تفصیلی
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'weekly' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'weekly' ? 'var(--gold)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            کارت‌های هفتگی
          </button>
        </div>
      </div>

      {/* نوار شاخص‌های پیشرفت هفتگی */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        
        <div className="bento-card" style={{ padding: '16px', borderRight: '4px solid var(--gold)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>درصد تحقق برنامه هفته</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {completionPercent}٪
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {completedTasks} از {totalTasks} باکس
            </span>
          </div>
          {/* نوار پیشرفت */}
          <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${completionPercent}%`, height: '100%', background: 'linear-gradient(90deg, #E6C287 0%, #10b981 100%)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div className="bento-card" style={{ padding: '16px', borderRight: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>مجموع ساعات مطالعه هدف</span>
          <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '6px' }}>
            {totalHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
          </div>
          <span style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', display: 'block' }}>میانگین {Math.round((totalHours/7)*10)/10} ساعت در روز</span>
        </div>

        <div className="bento-card" style={{ padding: '16px', borderRight: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>مجموع تست‌های پیش‌بینی‌شده</span>
          <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>
            {totalTests} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>تست</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>شامل تست‌های آموزشی و زمان‌دار</span>
        </div>

        <div className="bento-card" style={{ padding: '16px', borderRight: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>آزمون جامع جمعه</span>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)', marginTop: '8px' }}>
            ماز / قلم‌چی پایه
          </div>
          <span style={{ fontSize: '11px', color: '#8b5cf6', marginTop: '4px', display: 'block' }}>مدت آزمون: ۳ ساعت و ۳۰ دقیقه</span>
        </div>

      </div>

      {/* ۰. جدول جامع رسمی هفتگی */}
      {viewMode === 'table' && (
        <div style={{ marginBottom: '30px' }}>
          <WeeklyPlanTableView
            planData={planData}
            startDate={activePlan.start_date}
            endDate={activePlan.end_date}
            studentName="یاشا محبی"
            advisorName="دکتر کاظمی"
            readOnly={false}
            onToggleTask={toggleTaskStatus}
            showExportButtons={true}
          />
        </div>
      )}

      {/* ۱. نمای روزانه تفصیلی */}
      {viewMode === 'daily' && (
        <div>
          {/* تب‌های روزهای هفته (شنبه تا جمعه) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {DAYS_OF_WEEK.map((day) => {
              const dayTasks = planData[day] || [];
              const dayDone = dayTasks.filter((t: any) => t.isDone).length;
              const isToday = day === todayPersian;
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    flex: '1 1 120px',
                    minWidth: '110px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-panel)',
                    color: isSelected ? 'var(--gold)' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 6px 18px rgba(12, 29, 63, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{day}</span>
                    {isToday && (
                      <span style={{
                        fontSize: '9px',
                        background: isSelected ? 'var(--gold)' : 'var(--primary)',
                        color: isSelected ? '#0C1D3F' : '#fff',
                        padding: '1px 5px',
                        borderRadius: '6px',
                        fontWeight: '900'
                      }}>
                        امروز
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>
                    {dayDone}/{dayTasks.length} پارت تکمیل
                  </span>
                </button>
              );
            })}
          </div>

          {/* فیلتر موضوعی دروس */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> فیلتر بر اساس درس:
            </span>
            {['همه', 'زیست', 'شیمی', 'فیزیک', 'ریاضی', 'عمومی'].map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubjectFilter(sub)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: selectedSubjectFilter === sub ? '1px solid var(--gold)' : '1px solid var(--border-color)',
                  background: selectedSubjectFilter === sub ? 'rgba(230,194,135,0.2)' : 'transparent',
                  color: selectedSubjectFilter === sub ? 'var(--gold-dark)' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* لیست باکس‌های مطالعه روز انتخاب‌شده */}
          <div className="panel" style={{ margin: 0 }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={20} color="var(--gold-dark)" />
                برنامه تفصیلی <strong>{selectedDay}</strong>
                {selectedDay === todayPersian && (
                  <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', fontSize: '11px' }}>
                    امروز
                  </span>
                )}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                برای علامت‌زدن کار تکمیل‌شده، روی باکس کلیک کنید
              </span>
            </div>

            {currentDayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <BookOpen size={40} color="var(--border-color)" style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '14px' }}>برای این روز با فیلتر انتخاب‌شده باکسی تعریف نشده است.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {currentDayTasks.map((task: any, index: number) => {
                  return (
                    <div
                      key={task.id || index}
                      onClick={() => toggleTaskStatus(selectedDay, task.id || index)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '14px',
                        border: task.isDone ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                        background: task.isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: task.isDone ? 'none' : '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {task.isDone ? (
                          <CheckSquare size={24} color="#10b981" />
                        ) : (
                          <Square size={24} color="var(--border-color)" />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontWeight: '900',
                              fontSize: '15px',
                              color: task.isDone ? 'var(--text-muted)' : 'var(--primary)',
                              textDecoration: task.isDone ? 'line-through' : 'none'
                            }}>
                              {task.title}
                            </span>
                            {task.shift && getShiftBadge(task.shift)}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {task.tests > 0 && (
                              <span style={{ fontSize: '12px', background: 'rgba(230,194,135,0.15)', color: 'var(--gold-dark)', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                <Target size={12} style={{ verticalAlign: 'middle', marginLeft: '3px' }} />
                                {task.tests} تست
                              </span>
                            )}
                            <span style={{ fontSize: '12px', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} className="mono-num">
                              <Clock size={13} /> {task.duration} دقیقه
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.7', opacity: task.isDone ? 0.7 : 0.95 }}>
                          {task.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ۲. نمای تقویم شبکه‌ای کل هفته */}
      {viewMode === 'weekly' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {DAYS_OF_WEEK.map((day) => {
            const dayTasks = planData[day] || [];
            const isToday = day === todayPersian;

            return (
              <div
                key={day}
                className="bento-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: isToday ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                  background: 'var(--bg-main)'
                }}
              >
                {/* سربرگ روز */}
                <div style={{
                  background: isToday ? 'var(--primary)' : 'var(--bg-panel)',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '900', fontSize: '15px', color: isToday ? 'var(--gold)' : 'var(--primary)' }}>
                      {day}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '10px', background: 'var(--gold)', color: '#0C1D3F', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        امروز
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    {dayTasks.length} پارت
                  </span>
                </div>

                {/* پارت‌های آن روز */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dayTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '15px 0' }}>
                      پارت مطالعاتی تعریف نشده است.
                    </div>
                  ) : (
                    dayTasks.map((task: any, idx: number) => (
                      <div
                        key={task.id || idx}
                        onClick={() => toggleTaskStatus(day, task.id || idx)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: task.isDone ? '1px solid #10b981' : '1px solid var(--border-color)',
                          background: task.isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-panel)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px'
                        }}
                      >
                        <div style={{ marginTop: '2px' }}>
                          {task.isDone ? <CheckSquare size={16} color="#10b981" /> : <Square size={16} color="var(--border-color)" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: task.isDone ? 'var(--text-muted)' : 'var(--primary)',
                              textDecoration: task.isDone ? 'line-through' : 'none'
                            }}>
                              {task.title}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--gold-dark)', fontWeight: 'bold' }}>
                              {task.duration}m
                            </span>
                          </div>
                          {task.tests > 0 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              🎯 {task.tests} تست
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
