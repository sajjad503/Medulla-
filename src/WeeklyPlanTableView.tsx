import React, { useState } from 'react';
import { 
  CheckSquare, Square, Clock, Target, Calendar, Download, 
  Printer, Filter, BookOpen, Sparkles, CheckCircle2, ChevronDown 
} from 'lucide-react';

export interface PlanTask {
  id?: string | number;
  title: string;
  shift?: 'morning' | 'afternoon' | 'evening' | 'night' | string;
  duration: number; // in minutes
  tests?: number;
  description?: string;
  isDone?: boolean;
  subject?: string;
}

export interface WeeklyPlanTableViewProps {
  planData?: Record<string, PlanTask[]>;
  startDate?: string;
  endDate?: string;
  studentName?: string;
  advisorName?: string;
  readOnly?: boolean;
  onToggleTask?: (day: string, taskIdOrIndex: any) => void;
  showExportButtons?: boolean;
  compact?: boolean;
}

const DAYS_OF_WEEK = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const SHIFT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  morning: { label: 'صبح', color: '#B45309', bg: 'rgba(245, 158, 11, 0.1)' },
  afternoon: { label: 'ظهر', color: '#1D4ED8', bg: 'rgba(59, 130, 246, 0.1)' },
  evening: { label: 'عصر', color: '#7E22CE', bg: 'rgba(168, 85, 247, 0.1)' },
  night: { label: 'شب (کپسول)', color: '#0F766E', bg: 'rgba(20, 184, 166, 0.1)' }
};

const DEFAULT_PLAN_DATA: Record<string, PlanTask[]> = {
  'شنبه': [
    { title: 'زیست‌شناسی دهم - فصل گوارش و جذب مواد', shift: 'morning', duration: 90, tests: 40, description: 'مطالعه دقیق کتاب + ۴۰ تست آموزشی', isDone: true, subject: 'زیست' },
    { title: 'شیمی یازدهم - استوکیومتری و سینتیک', shift: 'afternoon', duration: 75, tests: 25, description: 'مرور فرمول‌های فرار + ۲۵ تست زمان‌دار', isDone: true, subject: 'شیمی' },
    { title: 'ریاضیات جامع - مبحث مشتق و کاربرد مشتق', shift: 'evening', duration: 90, tests: 30, description: 'حل تست‌های کنکور داخل و خارج ۹۸ تا ۱۴۰۲', isDone: false, subject: 'ریاضی' },
    { title: 'کپسول شبانه - ریدینگ زبان و آرایه ادبی', shift: 'night', duration: 45, tests: 15, description: 'یک درک مطلب زبان انگلیسی + ۱۰ تست آرایه کنکور', isDone: false, subject: 'عمومی' }
  ],
  'یکشنبه': [
    { title: 'فیزیک دوازدهم - حرکت‌شناسی و شتاب ثابت', shift: 'morning', duration: 90, tests: 35, description: 'خلاصه‌نویسی نمودارهای مکان-زمان و سرعت-زمان', isDone: true, subject: 'فیزیک' },
    { title: 'زیست دوازدهم - رونویسی و پروتئین‌سازی', shift: 'afternoon', duration: 90, tests: 45, description: 'بررسی تصاویر و شکل‌های کلیدی فصل ژنتیک', isDone: false, subject: 'زیست' },
    { title: 'شیمی دوازدهم - اسیدها و بازها و pH', shift: 'evening', duration: 75, tests: 25, description: 'حل مسائل لگاریتم و ثابت تفکیک اسیدی', isDone: false, subject: 'شیمی' },
    { title: 'مرور کپسولی لغات ادبیات و زبان', shift: 'night', duration: 40, tests: 20, description: 'مرور فلش‌کارت‌های لغات ستاره‌دار', isDone: false, subject: 'عمومی' }
  ],
  'دوشنبه': [
    { title: 'شیمی دهم - ساختار اتم و جدول تناوبی', shift: 'morning', duration: 75, tests: 30, description: 'حل تست‌های مضرب ۳ و رسم ساختارهای لوویس', isDone: false, subject: 'شیمی' },
    { title: 'ریاضیات - مثلثات و معادلات مثلثاتی', shift: 'afternoon', duration: 90, tests: 35, description: 'رفع اشکال تست‌های غلط آزمون قلم‌چی و ماز', isDone: false, subject: 'ریاضی' },
    { title: 'زیست دهم - تبادلات گازی و تنفس', shift: 'evening', duration: 80, tests: 35, description: 'تست‌های ترکیبی هموگلوبین و حجم‌های تنفسی', isDone: false, subject: 'زیست' }
  ],
  'سه‌شنبه': [
    { title: 'زیست‌شناسی دهم - گردش مواد در بدن انسان', shift: 'morning', duration: 90, tests: 40, description: 'ترکیب نوار قلب با دریچه‌ها و فشار خون لنفاوی', isDone: false, subject: 'زیست' },
    { title: 'فیزیک یازدهم - الکتریسیته ساکن و خازن', shift: 'afternoon', duration: 85, tests: 30, description: 'مسائل اتصال خازن‌ها و میدان الکتریکی یکنواخت', isDone: false, subject: 'فیزیک' },
    { title: 'زمین‌شناسی - کانی‌ها و منابع معدنی', shift: 'evening', duration: 60, tests: 25, description: 'حفظ جدول نام کانی‌ها و کاربرد صنعتی', isDone: false, subject: 'زمین' }
  ],
  'چهارشنبه': [
    { title: 'فیزیک دوازدهم - نوسان و امواج مکانیکی', shift: 'morning', duration: 90, tests: 35, description: 'فرمول‌های بسامد زاویه‌ای و دوره تناوب آونگ و فنر', isDone: false, subject: 'فیزیک' },
    { title: 'شیمی دهم - محلول‌ها و غلظت مولار', shift: 'afternoon', duration: 75, tests: 30, description: 'تمرین تست‌های درصد جرمی و انحلال‌پذیری نمک‌ها', isDone: false, subject: 'شیمی' },
    { title: 'ریاضیات - هندسه تحلیلی و مقاطع مخروطی', shift: 'evening', duration: 80, tests: 25, description: 'دایره و بیضی + فرمول‌های فاصله نقطه از خط', isDone: false, subject: 'ریاضی' }
  ],
  'پنجشنبه': [
    { title: 'شبیه‌سازی آزمونک زمان‌دار جامع پایه', shift: 'morning', duration: 90, tests: 50, description: 'حل آزمون ۵۰ سوالی زمان‌دار با پاسخبرگ', isDone: false, subject: 'تست زمان‌دار' },
    { title: 'تحلیل آزمونک و رفع اشکال تست‌های نزده', shift: 'afternoon', duration: 75, tests: 0, description: 'یادداشت نکات مهم در دفترچه خودآموز', isDone: false, subject: 'تحلیل' },
    { title: 'مرور کپسول‌های شبانه و فرمول‌های کلیدی', shift: 'evening', duration: 60, tests: 20, description: 'مرور سبک خلاصه‌های هفته', isDone: false, subject: 'مرور' }
  ],
  'جمعه': [
    { title: 'شرکت در آزمون آزمایشی ماز / قلم‌چی', shift: 'morning', duration: 210, tests: 110, description: 'اجرای دقیق استراتژی زمان‌های نقصانی', isDone: false, subject: 'آزمون اصلی' },
    { title: 'تحلیل سوالات و محاسبه درصدها', shift: 'afternoon', duration: 120, tests: 0, description: 'ثبت درصدهای کارنامه در پنل مدولا', isDone: false, subject: 'تحلیل' },
    { title: 'ارسال گزارش‌کار جامع هفته به مشاور', shift: 'night', duration: 30, tests: 0, description: 'ارسال مجموع ساعت و تست هفته', isDone: false, subject: 'مشاوره' }
  ]
};

export default function WeeklyPlanTableView({
  planData,
  startDate = '۱۴۰۵/۰۸/۰۱',
  endDate = '۱۴۰۵/۰۸/۰۷',
  studentName = 'یاشا محبی',
  advisorName = 'دکتر کاظمی',
  readOnly = false,
  onToggleTask,
  showExportButtons = true,
  compact = false
}: WeeklyPlanTableViewProps) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('همه');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('همه');

  const effectivePlan = (planData && Object.keys(planData).length > 0) ? planData : DEFAULT_PLAN_DATA;

  // Calculate totals
  const allTasks: { day: string; task: PlanTask; index: number }[] = [];
  DAYS_OF_WEEK.forEach(day => {
    const tasks = effectivePlan[day] || [];
    tasks.forEach((t, idx) => {
      allTasks.push({ day, task: t, index: idx });
    });
  });

  const totalMinutes = allTasks.reduce((sum, item) => sum + (Number(item.task.duration) || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const totalTests = allTasks.reduce((sum, item) => sum + (Number(item.task.tests) || 0), 0);
  const completedCount = allTasks.filter(item => item.task.isDone).length;
  const completionPercentage = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  // Filter tasks
  const filteredTasks = allTasks.filter(item => {
    const matchDay = selectedDayFilter === 'همه' || item.day === selectedDayFilter;
    const matchSubject = selectedSubjectFilter === 'همه' || 
      (item.task.subject && item.task.subject.includes(selectedSubjectFilter)) ||
      item.task.title.includes(selectedSubjectFilter);
    return matchDay && matchSubject;
  });

  // Export to CSV
  const handleExportCSV = () => {
    let csv = 'روز هفته,پارت,عنوان درس و مبحث,مدت زمان (دقیقه),تعداد تست,وضعیت انجام,توضیحات و تکالیف\n';
    allTasks.forEach(item => {
      const shiftStr = item.task.shift ? (SHIFT_LABELS[item.task.shift]?.label || item.task.shift) : `پارت ${item.index + 1}`;
      const statusStr = item.task.isDone ? 'انجام شده' : 'انجام نشده';
      const cleanDesc = (item.task.description || '').replace(/,/g, '،').replace(/\n/g, ' ');
      csv += `${item.day},${shiftStr},${item.task.title},${item.task.duration},${item.task.tests || 0},${statusStr},"${cleanDesc}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `برنامه_هفتگی_${studentName.replace(/\s+/g, '_')}_${startDate.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable table view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mentora-weekly-plan-table-container" style={{ direction: 'rtl', width: '100%' }}>
      
      {/* Header bar with summary & exports */}
      {!compact && (
        <div style={{
          background: 'var(--bg-main, #f8fafc)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '900', color: 'var(--primary, #0C1D3F)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={18} color="var(--gold, #C5A880)" />
                جدول برنامه مطالعاتی هفتگی ({startDate} تا {endDate})
              </span>
              <span className="pill-badge" style={{ fontSize: '11px', background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark, #8C6D3F)', border: '1px solid var(--gold, #C5A880)' }}>
                مشاور: {advisorName}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', marginTop: '4px' }}>
              دانش‌آموز: <strong>{studentName}</strong> | کل زمان هدف: <strong className="mono-num" style={{ color: 'var(--primary, #0C1D3F)' }}>{totalHours} ساعت</strong> ({totalMinutes} دقیقه) | تست هدف: <strong className="mono-num" style={{ color: 'var(--gold-dark, #8C6D3F)' }}>{totalTests} تست</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Progress indicator */}
            <div style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '10px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} color="#10B981" />
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>پیشرفت: </span>
                <strong style={{ color: '#10B981' }} className="mono-num">{completionPercentage}٪</strong>
                <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '10px' }}> ({completedCount} از {allTasks.length} پارت)</span>
              </div>
            </div>

            {showExportButtons && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="btn"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid #10B981',
                    color: '#10B981',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="دانلود جدول به فرمت اکسل / CSV"
                >
                  <Download size={14} />
                  <span>خروجی اکسل</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="btn"
                  style={{
                    background: 'var(--primary, #0C1D3F)',
                    border: '1px solid var(--gold, #C5A880)',
                    color: 'var(--gold, #C5A880)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  title="چاپ و پرینت جدول هفتگی"
                >
                  <Printer size={14} />
                  <span>چاپ جدول</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '12px'
      }}>
        {/* Day buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted, #64748b)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> فیلتر روز:
          </span>
          <button
            onClick={() => setSelectedDayFilter('همه')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              border: selectedDayFilter === 'همه' ? '1px solid var(--primary, #0C1D3F)' : '1px solid var(--border-color, #e2e8f0)',
              background: selectedDayFilter === 'همه' ? 'var(--primary, #0C1D3F)' : 'var(--bg-card, #ffffff)',
              color: selectedDayFilter === 'همه' ? 'var(--gold, #C5A880)' : 'var(--text-main, #334155)',
              cursor: 'pointer'
            }}
          >
            کل هفته
          </button>
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDayFilter(day)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: selectedDayFilter === day ? '1px solid var(--primary, #0C1D3F)' : '1px solid var(--border-color, #e2e8f0)',
                background: selectedDayFilter === day ? 'var(--primary, #0C1D3F)' : 'var(--bg-card, #ffffff)',
                color: selectedDayFilter === day ? 'var(--gold, #C5A880)' : 'var(--text-main, #334155)',
                cursor: 'pointer'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Subject filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>درس:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #334155)',
              border: '1px solid var(--border-color, #e2e8f0)',
              cursor: 'pointer'
            }}
          >
            <option value="همه">همه دروس</option>
            <option value="زیست">زیست‌شناسی</option>
            <option value="شیمی">شیمی</option>
            <option value="ریاضی">ریاضیات</option>
            <option value="فیزیک">فیزیک</option>
            <option value="زمین">زمین‌شناسی</option>
            <option value="عمومی">عمومی / کپسول</option>
          </select>
        </div>
      </div>

      {/* Main Tabular View */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '14px',
        border: '1.5px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        background: 'var(--bg-card, #ffffff)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          textAlign: 'right'
        }}>
          <thead>
            <tr style={{
              background: 'linear-gradient(90deg, #0C1D3F 0%, #1B3366 100%)',
              color: '#ffffff',
              borderBottom: '2px solid var(--gold, #C5A880)'
            }}>
              <th style={{ padding: '12px 14px', width: '90px', textAlign: 'center', fontWeight: '900' }}>روز</th>
              <th style={{ padding: '12px 14px', width: '90px', textAlign: 'center', fontWeight: '900' }}>پارت</th>
              <th style={{ padding: '12px 14px', minWidth: '180px', fontWeight: '900' }}>عنوان مبحث و درس</th>
              <th style={{ padding: '12px 14px', width: '100px', textAlign: 'center', fontWeight: '900' }}>مدت زمان</th>
              <th style={{ padding: '12px 14px', width: '90px', textAlign: 'center', fontWeight: '900' }}>تست هدف</th>
              <th style={{ padding: '12px 14px', minWidth: '220px', fontWeight: '900' }}>تکالیف و دستورالعمل مشاور</th>
              <th style={{ padding: '12px 14px', width: '100px', textAlign: 'center', fontWeight: '900' }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
                  پارت مطالعاتی با فیلتر انتخاب شده یافت نشد.
                </td>
              </tr>
            ) : (
              filteredTasks.map((item, idx) => {
                const shiftInfo = item.task.shift ? SHIFT_LABELS[item.task.shift] : null;
                const isCompleted = !!item.task.isDone;

                return (
                  <tr
                    key={item.task.id || `${item.day}-${idx}`}
                    style={{
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : (idx % 2 === 0 ? 'transparent' : 'rgba(12, 29, 63, 0.015)'),
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* روز هفته */}
                    <td style={{
                      padding: '12px 14px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'var(--primary, #0C1D3F)',
                      borderLeft: '1px solid var(--border-color, #e2e8f0)'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(12, 29, 63, 0.06)',
                        fontSize: '11px'
                      }}>
                        {item.day}
                      </span>
                    </td>

                    {/* شیفت / پارت */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {shiftInfo ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: shiftInfo.color,
                          background: shiftInfo.bg,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          {shiftInfo.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                          پارت {item.index + 1}
                        </span>
                      )}
                    </td>

                    {/* درس و مبحث */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '13px',
                          color: isCompleted ? 'var(--text-muted, #64748b)' : 'var(--primary, #0C1D3F)',
                          textDecoration: isCompleted ? 'line-through' : 'none'
                        }}>
                          {item.task.title}
                        </span>
                        {item.task.subject && (
                          <span style={{
                            fontSize: '10px',
                            background: 'rgba(230,194,135,0.2)',
                            color: 'var(--gold-dark, #8C6D3F)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            {item.task.subject}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* مدت زمان */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 'bold',
                        color: 'var(--gold-dark, #8C6D3F)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }} className="mono-num">
                        <Clock size={12} />
                        {item.task.duration} د
                      </span>
                    </td>

                    {/* تست هدف */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {(item.task.tests || 0) > 0 ? (
                        <span style={{
                          fontWeight: 'bold',
                          color: '#1D4ED8',
                          background: 'rgba(59, 130, 246, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px'
                        }} className="mono-num">
                          <Target size={11} />
                          {item.task.tests} تست
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11px' }}>-</span>
                      )}
                    </td>

                    {/* توضیحات و تکالیف */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-main, #334155)',
                        lineHeight: '1.6',
                        opacity: isCompleted ? 0.75 : 1
                      }}>
                        {item.task.description || 'مطالعه و حل تست طبق سرچشمه تستی مشاور'}
                      </div>
                    </td>

                    {/* وضعیت انجام */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {readOnly ? (
                        isCompleted ? (
                          <span style={{
                            fontSize: '11px',
                            color: '#10B981',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <CheckCircle2 size={12} /> انجام شد
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--text-muted, #94a3b8)',
                            background: 'rgba(0,0,0,0.04)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 'bold'
                          }}>
                            در انتظار
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleTask && onToggleTask(item.day, item.task.id || item.index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          title={isCompleted ? 'علامت‌گذاری به عنوان انجام‌نشده' : 'علامت‌گذاری به عنوان انجام‌شده'}
                        >
                          {isCompleted ? (
                            <>
                              <CheckSquare size={18} color="#10B981" />
                              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>تکمیل</span>
                            </>
                          ) : (
                            <>
                              <Square size={18} color="var(--border-color, #cbd5e1)" />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>اقدام</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer hint */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 4px',
        fontSize: '11px',
        color: 'var(--text-muted, #64748b)'
      }}>
        <span>💡 وضعیت انجام تسک‌ها به‌صورت خودکار در پرونده نظارتی مدیر و پنل مشاور به‌روزرسانی می‌شود.</span>
        <span>سامانه هوشمند مدولا © ۱۴۰۵</span>
      </div>

    </div>
  );
}
