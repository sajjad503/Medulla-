import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, Trash2, Save, Printer, Calendar, CheckCircle2, 
  Sparkles, Coffee, BookOpen, GraduationCap, Moon, 
  HelpCircle, ChevronLeft, ChevronRight, MessageSquare, AlertCircle, Loader2
} from 'lucide-react';
import api from './api';

export interface TimeBlock {
  id: string;
  startTime: string; // "07:30"
  endTime: string;   // "09:00"
  category: 'meal' | 'class' | 'test' | 'study' | 'sleep_rest' | 'personal_commute';
  title: string;
  durationMinutes: number;
}

export interface DailyPlannerProps {
  studentId?: number;
  studentName?: string;
  readOnly?: boolean;
  isAdvisorView?: boolean;
}

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  meal: { label: 'وعده غذایی (ناهار / صبحانه / شام)', icon: '🍽️', color: '#D97706', bg: 'rgba(245, 158, 11, 0.12)' },
  class: { label: 'کلاس درس / مدرسه / ویدیو آموزشی', icon: '🏫', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  test: { label: 'تست‌زنی و حل تمرین زمان‌دار', icon: '📝', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)' },
  study: { label: 'مطالعه متنی و تشریحی کتاب', icon: '📚', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
  sleep_rest: { label: 'خواب و استراحت میان‌پارت', icon: '😴', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.12)' },
  personal_commute: { label: 'کارهای شخصی و رفت‌وآمد', icon: '🚗', color: '#4B5563', bg: 'rgba(75, 85, 99, 0.12)' }
};

export default function DailyPlanner({
  studentId,
  studentName = 'یاشا محبی',
  readOnly = false,
  isAdvisorView = false
}: DailyPlannerProps) {
  const [selectedDate, setSelectedDate] = useState('امروز');
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [advisorReview, setAdvisorReview] = useState('');
  const [newAdvisorReview, setNewAdvisorReview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // New Block Form State
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [category, setCategory] = useState<TimeBlock['category']>('study');
  const [blockTitle, setBlockTitle] = useState('');

  useEffect(() => {
    fetchPlannerData();
  }, [studentId, selectedDate]);

  const fetchPlannerData = async () => {
    setIsLoading(true);
    try {
      let url = '/records/daily-planner';
      if (studentId) {
        url = `/records/student-daily-planner/${studentId}?date=${encodeURIComponent(selectedDate)}`;
      } else {
        url = `/records/daily-planner?date=${encodeURIComponent(selectedDate)}`;
      }
      const res = await api.get(url);
      if (res.data?.blocks) {
        setBlocks(res.data.blocks);
        setAdvisorReview(res.data.advisor_review || '');
        setNewAdvisorReview(res.data.advisor_review || '');
      }
    } catch (err) {
      console.warn('Could not load daily planner, using defaults');
      setBlocks([
        { id: '1', startTime: '06:30', endTime: '07:15', category: 'meal', title: 'صبحانه مقوی و آماده‌سازی روزانه', durationMinutes: 45 },
        { id: '2', startTime: '07:30', endTime: '10:30', category: 'class', title: 'کلاس آنلاین زیست‌شناسی (مبحث گوارش و گردش مواد)', durationMinutes: 180 },
        { id: '3', startTime: '10:45', endTime: '12:15', category: 'study', title: 'مطالعه تشریحی متن کتاب و نکته‌برداری', durationMinutes: 90 },
        { id: '4', startTime: '12:15', endTime: '13:30', category: 'meal', title: 'ناهار و استراحت نیمروزی', durationMinutes: 75 },
        { id: '5', startTime: '13:30', endTime: '15:30', category: 'test', title: 'حل ۵۰ تست زمان‌دار شیمی و زیست', durationMinutes: 120 },
        { id: '6', startTime: '15:45', endTime: '17:15', category: 'class', title: 'کلاس فیزیک مدرسه / ویدیو آموزشی', durationMinutes: 90 },
        { id: '7', startTime: '17:30', endTime: '19:00', category: 'test', title: 'تست‌زنی فیزیک شتاب ثابت', durationMinutes: 90 },
        { id: '8', startTime: '19:00', endTime: '20:00', category: 'personal_commute', title: 'استراحت و شام با خانواده', durationMinutes: 60 },
        { id: '9', startTime: '20:00', endTime: '22:00', category: 'study', title: 'مرور کپسولی فرمول‌ها و خلاصه‌ها', durationMinutes: 120 },
        { id: '10', startTime: '22:30', endTime: '06:30', category: 'sleep_rest', title: 'خواب شبانه استاندارد', durationMinutes: 480 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMinutes = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let totalM = (eh * 60 + em) - (sh * 60 + sm);
      if (totalM < 0) totalM += 24 * 60; // overnight
      return totalM || 60;
    } catch {
      return 60;
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return alert('لطفاً عنوان فعالیت را وارد کنید.');

    const dur = calculateMinutes(startTime, endTime);
    const newBlock: TimeBlock = {
      id: String(Date.now()),
      startTime,
      endTime,
      category,
      title: blockTitle.trim(),
      durationMinutes: dur
    };

    setBlocks(prev => [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setBlockTitle('');
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  // Computations
  const summaryByCategory = {
    meal: 0,
    class: 0,
    test: 0,
    study: 0,
    sleep_rest: 0,
    personal_commute: 0
  };

  blocks.forEach(b => {
    if (summaryByCategory[b.category] !== undefined) {
      summaryByCategory[b.category] += b.durationMinutes;
    }
  });

  const mealHours = Math.round((summaryByCategory.meal / 60) * 10) / 10;
  const classHours = Math.round((summaryByCategory.class / 60) * 10) / 10;
  const testHours = Math.round((summaryByCategory.test / 60) * 10) / 10;
  const studyHours = Math.round((summaryByCategory.study / 60) * 10) / 10;
  const sleepRestHours = Math.round((summaryByCategory.sleep_rest / 60) * 10) / 10;
  const personalHours = Math.round((summaryByCategory.personal_commute / 60) * 10) / 10;
  const totalStudyAndTestHours = Math.round((testHours + studyHours) * 10) / 10;
  const totalTrackedHours = Math.round(((summaryByCategory.meal + summaryByCategory.class + summaryByCategory.test + summaryByCategory.study + summaryByCategory.sleep_rest + summaryByCategory.personal_commute) / 60) * 10) / 10;

  const handleSavePlanner = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const payload = {
        date: selectedDate,
        blocks,
        summary: {
          mealHours,
          classHours,
          testHours,
          studyHours,
          sleepRestHours,
          personalHours,
          totalProductiveHours: totalStudyAndTestHours
        }
      };
      await api.post('/records/daily-planner', payload);
      setSaveSuccessMsg('پلنر ۲۴ ساعته روز با موفقیت ذخیره شد و برای مشاور بروزرسانی گردید ✅');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('خطا در ذخیره پلنر.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdvisorReview = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      await api.post('/records/daily-planner-review', {
        student_id: studentId,
        date: selectedDate,
        review: newAdvisorReview
      });
      setAdvisorReview(newAdvisorReview);
      alert('بازخورد شما با موفقیت برای دانش‌آموز ثبت گردید ✅');
    } catch (err) {
      alert('خطا در ثبت بازخورد مشاور.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--gold)' }}>
        <Loader2 size={36} className="spin-animation" style={{ marginBottom: '12px' }} />
        <h4 style={{ color: 'var(--primary)' }}>در حال بارگذاری پلنر روزانه ۲۴ ساعته...</h4>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl', animation: 'fadeIn 0.3s ease-out', maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header Bar */}
      <div className="bento-card" style={{
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(12, 29, 63, 0.05) 0%, rgba(230, 194, 135, 0.15) 100%)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'var(--primary)',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(12, 29, 63, 0.25)',
            border: '2px solid var(--gold)'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '20px', fontWeight: '900' }}>
                پلنر زمانی روزانه ۲۴ ساعته
              </h2>
              <span className="pill-badge" style={{ background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', border: '1px solid var(--gold)', fontSize: '11px', fontWeight: 'bold' }}>
                تفکیک ناهار، کلاس، تست و مطالعه
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              {isAdvisorView ? `بررسی مدیریت زمان و بازه‌های روزانه «${studentName}»` : 'ثبت دقیق ساعت به ساعت زمان برای محاسبه کل ساعت کلاس، ناهار، تست و مطالعه'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Date Switcher */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['امروز', 'دیروز', 'شنبه', 'یکشنبه', 'دوشنبه'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  background: selectedDate === d ? 'var(--primary)' : 'transparent',
                  color: selectedDate === d ? 'var(--gold)' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '9px 16px',
              borderRadius: '9px',
              border: '1px solid var(--primary)',
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: 'bold',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>چاپ پلنر</span>
          </button>

          {!readOnly && !isAdvisorView && (
            <button
              type="button"
              onClick={handleSavePlanner}
              disabled={isSaving}
              style={{
                padding: '9px 20px',
                borderRadius: '9px',
                border: '1px solid var(--gold)',
                background: 'var(--primary)',
                color: 'var(--gold)',
                fontWeight: '900',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(12, 29, 63, 0.2)'
              }}
            >
              <Save size={16} />
              <span>{isSaving ? 'در حال ذخیره...' : 'ذخیره پلنر'}</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          {saveSuccessMsg}
        </div>
      )}

      {/* =========================================================
          بخش کلیدی: کارنامه و جدول خلاصه تفکیک ساعات روز
      ========================================================= */}
      <div className="bento-card" style={{ marginBottom: '24px', borderRight: '5px solid var(--gold)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--gold-dark)" />
              کارنامه توزیع زمانی ۲۴ ساعته ({selectedDate})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              تفکیک مستقل از گزارش‌کار برای اشراف کامل بر ساعات روزانه
            </span>
          </div>

          <div style={{
            background: 'rgba(230,194,135,0.18)',
            border: '1px solid var(--gold)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 'bold',
            color: 'var(--primary)'
          }}>
            ساعت مفید مطالعه و تست: <span className="mono-num" style={{ fontSize: '16px', color: '#059669' }}>{totalStudyAndTestHours} ساعت</span>
          </div>
        </div>

        {/* کارت‌های خلاصه ۶ گانه */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#D97706' }}>🍽️ ناهار و وعده‌ها</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#D97706' }}>
              {mealHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>صبحانه، ناهار و شام</div>
          </div>

          <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563EB' }}>🏫 کلاس و آموزش</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#2563EB' }}>
              {classHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>مدرسه و کلاس آنلاین</div>
          </div>

          <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7C3AED' }}>📝 تست‌زنی و تمرین</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#7C3AED' }}>
              {testHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>حل تست و آزمونک</div>
          </div>

          <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>📚 مطالعه تشریحی</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#059669' }}>
              {studyHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>متن کتاب و خلاصه</div>
          </div>

          <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0284C7' }}>😴 خواب و استراحت</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#0284C7' }}>
              {sleepRestHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>خواب شب و استراحت</div>
          </div>

          <div style={{ background: 'rgba(75, 85, 99, 0.08)', border: '1px solid rgba(75, 85, 99, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4B5563' }}>🚗 متفرقه و شخصی</span>
            </div>
            <div className="mono-num" style={{ fontSize: '24px', fontWeight: '900', color: '#4B5563' }}>
              {personalHours} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ساعت</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>رفت‌وآمد و امور فردی</div>
          </div>

        </div>

        {/* نوار توزیع درصدی ۲۴ ساعته */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>
            <span>توزیع ۲۴ ساعته روز:</span>
            <span>کل زمان رصد شده: {totalTrackedHours} ساعت از ۲۴ ساعت</span>
          </div>
          <div style={{
            height: '14px',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            background: 'var(--border-color)'
          }}>
            <div style={{ width: `${(mealHours / 24) * 100}%`, background: '#D97706' }} title={`ناهار و وعده‌ها: ${mealHours} ساعت`} />
            <div style={{ width: `${(classHours / 24) * 100}%`, background: '#2563EB' }} title={`کلاس و آموزش: ${classHours} ساعت`} />
            <div style={{ width: `${(testHours / 24) * 100}%`, background: '#7C3AED' }} title={`تست‌زنی: ${testHours} ساعت`} />
            <div style={{ width: `${(studyHours / 24) * 100}%`, background: '#059669' }} title={`مطالعه تشریحی: ${studyHours} ساعت`} />
            <div style={{ width: `${(sleepRestHours / 24) * 100}%`, background: '#0284C7' }} title={`خواب و استراحت: ${sleepRestHours} ساعت`} />
            <div style={{ width: `${(personalHours / 24) * 100}%`, background: '#4B5563' }} title={`متفرقه: ${personalHours} ساعت`} />
          </div>
        </div>
      </div>

      {/* =========================================================
          فرم افزودن بازه زمانی جدید (فقط برای دانش‌آموز)
      ========================================================= */}
      {!readOnly && !isAdvisorView && (
        <div className="bento-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 14px 0', color: 'var(--primary)', fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--gold-dark)" />
            افزودن بازه زمانی جدید به پلنر امروز
          </h3>

          <form onSubmit={handleAddBlock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                از ساعت:
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  direction: 'ltr',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                تا ساعت:
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  direction: 'ltr',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                نوع فعالیت:
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                <option value="meal">🍽️ ناهار و وعده‌های غذایی</option>
                <option value="class">🏫 کلاس درس و آموزش آنلاین</option>
                <option value="test">📝 تست‌زنی و حل تمرین</option>
                <option value="study">📚 مطالعه تشریحی متن کتاب</option>
                <option value="sleep_rest">😴 خواب و استراحت</option>
                <option value="personal_commute">🚗 کارهای شخصی و متفرقه</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                شرح فعالیت (مثلاً: کلاس آنلاین زیست، ناهار با خانواده، ۵۰ تست شیمی):
              </label>
              <input
                type="text"
                placeholder="عنوان دقیق فعالیت را بنویسید..."
                value={blockTitle}
                onChange={(e) => setBlockTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'var(--gold)',
                  fontWeight: '900',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> ثبت بازه زمانی
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================
          لیست تایم‌لاین بازه‌های ۲۴ ساعته
      ========================================================= */}
      <div className="bento-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', fontSize: '16px', fontWeight: '900' }}>
          تایم‌لاین بازه‌های زمانی ثبت‌شده ({blocks.length} بازه)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {blocks.map((block, idx) => {
            const cat = CATEGORY_INFO[block.category] || CATEGORY_INFO.study;
            const hours = Math.round((block.durationMinutes / 60) * 10) / 10;

            return (
              <div
                key={block.id || idx}
                style={{
                  background: 'var(--bg-main)',
                  border: `1.5px solid ${cat.color}40`,
                  borderRadius: '12px',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    background: cat.bg,
                    color: cat.color,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {block.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      از ساعت <strong className="mono-num">{block.startTime}</strong> تا <strong className="mono-num">{block.endTime}</strong> ({hours} ساعت - {block.durationMinutes} دقیقه)
                    </div>
                  </div>
                </div>

                {!readOnly && !isAdvisorView && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(block.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                    title="حذف این بازه"
                  >
                    <Trash2 size={13} />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            );
          })}

          {blocks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              هنوز بازه زمانی برای این روز ثبت نشده است. بازه‌های ساعت به ساعت را از فرم بالا وارد نمایید.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          بخش تحلیل و بازخورد مشاور روی پلنر روزانه
      ========================================================= */}
      <div className="bento-card" style={{ border: '2px solid var(--gold)' }}>
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--gold-dark)" />
          تحلیل و ارزیابی مشاور تخصصی روی زمان‌بندی روزانه
        </h3>

        {advisorReview && (
          <div style={{
            background: 'rgba(230, 194, 135, 0.15)',
            border: '1px solid var(--gold)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '13px',
            lineHeight: '1.8',
            color: 'var(--primary)',
            marginBottom: isAdvisorView ? '16px' : 0
          }}>
            <strong>توصیه مشاور: </strong>
            {advisorReview}
          </div>
        )}

        {isAdvisorView && (
          <div style={{ marginTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px' }}>
              ثبت یا ویرایش نظر مشاور درباره مدیریت ساعات دانش‌آموز:
            </label>
            <textarea
              rows={3}
              value={newAdvisorReview}
              onChange={(e) => setNewAdvisorReview(e.target.value)}
              placeholder="مثلاً: ساعت اختصاص‌یافته به ناهار مناسب است اما زمان کلاس‌ها زیاد بوده و نیاز به افزایش پارت‌های تست‌زنی فردی است..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '13px',
                marginBottom: '10px'
              }}
            />
            <button
              type="button"
              onClick={handleSaveAdvisorReview}
              disabled={isSaving}
              style={{
                background: 'var(--primary)',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'در حال ثبت...' : 'ثبت بازخورد مشاور برای شاگرد'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
