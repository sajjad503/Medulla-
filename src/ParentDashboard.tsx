import React, { useState, useEffect } from 'react';
import { 
  Users, Award, Calendar, Clock, BookOpen, CheckCircle2, AlertCircle, 
  PhoneCall, MessageSquare, TrendingUp, ShieldCheck, HeartHandshake,
  FileText, Check, ChevronLeft, Sparkles, AlertTriangle, Send, Loader2, Printer
} from 'lucide-react';
import api from './api';
import { VoicePlayer } from './VoiceComponents';
import WeeklyPlanTableView from './WeeklyPlanTableView';

interface ParentDashboardProps {
  onLogout?: () => void;
}

export default function ParentDashboard({ onLogout }: ParentDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [advisorMessages, setAdvisorMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'reports' | 'exams' | 'advisor'>('overview');
  const [requestCallSuccess, setRequestCallSuccess] = useState(false);
  const [showPrintPlanModal, setShowPrintPlanModal] = useState(false);

  useEffect(() => {
    fetchParentData();
    fetchAdvisorMessages();
  }, []);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/records/parent-overview');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching parent overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisorMessages = async () => {
    try {
      const res = await api.get('/records/parent-messages');
      setAdvisorMessages(res.data || []);
    } catch (err) {
      console.warn('Could not load advisor messages:', err);
    }
  };

  const handleRequestCall = async () => {
    try {
      await api.post('/records/events', {
        student_id: data?.student?.id || 5,
        title: `درخواست تماس تلفنی ولی ${data?.student?.name || 'یاشا محبی'} با مشاور`,
        event_type: 'call',
        event_date: new Date().toLocaleDateString('fa-IR'),
        event_time: 'ساعات عصر'
      });
    } catch (_) {}
    setRequestCallSuccess(true);
    setTimeout(() => setRequestCallSuccess(false), 5000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} className="spin-animation" color="var(--gold)" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: 'var(--primary)' }}>در حال بارگذاری پنل نظارت والدین...</h3>
      </div>
    );
  }

  const student = data?.student || {
    name: 'یاشا محبی',
    grade: 'دوازدهم تجربی',
    school_name: 'دبیرستان علامه حلی',
    target_field: 'پزشکی دانشگاه تهران',
    taraz: 7120,
    phone: '09120000004'
  };

  const advisor = data?.advisor || {
    name: 'دکتر کاظمی',
    phone: '09120000003',
    specialty: 'مشاور ارشد کنکور تجربی',
    next_meeting: 'چهارشنبه ۴ آبان - ساعت ۱۸:۳۰ (تماس تلفنی با اولیا)'
  };

  const metrics = data?.metrics || {
    today_study_hours: 6.5,
    weekly_study_hours: 42.5,
    weekly_tests_count: 320,
    attendance_rate: 96,
    plan_completion_rate: 88,
    recent_exam_score: 84.5
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', maxWidth: '1280px', margin: '0 auto', padding: '10px 15px 50px 15px', direction: 'rtl' }}>
      
      {/* هدر پرستیژ پنل اولیا */}
      <div className="bento-card" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(12, 29, 63, 0.04) 0%, rgba(230, 192, 135, 0.12) 100%)',
        border: '1.5px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary)',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(12, 29, 63, 0.25)',
            border: '2px solid var(--gold)'
          }}>
            <HeartHandshake size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '22px', fontWeight: '900' }}>
                سامانه پایش والدین مدولا
              </h2>
              <span className="pill-badge" style={{ background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', border: '1px solid var(--gold)', fontSize: '11px', fontWeight: 'bold' }}>
                <ShieldCheck size={12} style={{ verticalAlign: 'middle', marginLeft: '4px' }} />
                ناظر رسمی ولی دانش‌آموز
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              پرونده تحصیلی فرزند شما: <strong>{student.name}</strong> ({student.grade}) | هدف: <span style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>{student.target_field}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowPrintPlanModal(true)}
            className="gold-glow-btn"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="چاپ جدول برنامه هفتگی فرزند"
          >
            <Printer size={16} /> چاپ جدول برنامه
          </button>

          <button
            onClick={handleRequestCall}
            style={{
              background: 'var(--primary)',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(12, 29, 63, 0.2)'
            }}
          >
            <PhoneCall size={16} />
            درخواست تماس تلفنی با مشاور
          </button>
        </div>
      </div>

      {requestCallSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 'bold',
          fontSize: '13px'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          درخواست شما برای تماس تلفنی با {advisor.name} با اولویت بالا ثبت شد. مشاور در اسرع وقت با شماره شما تماس خواهد گرفت.
        </div>
      )}

      {/* ۴ کارت آماری کلیدی برای والدین */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div className="bento-card" style={{ borderRight: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>ساعت مطالعه امروز فرزند</span>
            <Clock size={18} color="#3b82f6" />
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '10px', fontWeight: 'bold' }}>
            {metrics.today_study_hours} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ساعت</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> مطابق برنامه هفتگی مشاور
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid var(--gold)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>مجموع مطالعه ۷ روز اخیر</span>
            <TrendingUp size={18} color="var(--gold-dark)" />
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '10px', fontWeight: 'bold' }}>
            {metrics.weekly_study_hours} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ساعت</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            پاسخگویی به <strong>{metrics.weekly_tests_count}</strong> تست تستی و تشریحی
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>شاخص انضباط و پایبندی به برنامه</span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#10b981', marginTop: '10px', fontWeight: 'bold' }}>
            {metrics.plan_completion_rate}٪
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            نرخ ارسال بموقع گزارش‌کار: <strong>{metrics.attendance_rate}٪</strong>
          </div>
        </div>

        <div className="bento-card" style={{ borderRight: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>تراز آخرین آزمون آزمایشی</span>
            <Award size={18} color="#8b5cf6" />
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '10px', fontWeight: 'bold' }}>
            {student.taraz} <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>(درصد {metrics.recent_exam_score}٪)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>
            رتبه تخمینی در منطقه ۱: حدود زیر ۳۰۰
          </div>
        </div>

      </div>

      {/* تب‌های جابجایی در پنل اولیا */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'وضعیت کلی و تحلیل مشاور', icon: <Sparkles size={16} /> },
          { id: 'advisor', label: `پیام‌ها و توصیه‌های مشاور (${advisorMessages.length})`, icon: <MessageSquare size={16} /> },
          { id: 'plan', label: 'جدول برنامه هفتگی فرزند', icon: <Calendar size={16} /> },
          { id: 'reports', label: 'ریز گزارش‌کار و ساعات مطالعه', icon: <FileText size={16} /> },
          { id: 'exams', label: 'کارنامه‌ها و تحلیل آزمون‌ها', icon: <Award size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: activeTab === tab.id ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* تب ۱: دید کلی و تحلیل مشاور */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* کارت پیام و ویس اختصاصی مشاور برای اولیا */}
          <div className="panel" style={{ margin: 0, border: '2px solid var(--gold-dark)' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Award size={20} color="var(--gold-dark)" />
                تحلیل وضعیت فرزند توسط مشاور ({advisor.name})
              </span>
              <span className="pill-badge" style={{ fontSize: '11px', background: 'rgba(230,194,135,0.2)' }}>
                تاریخ: {data?.advisor_feedback_for_parent?.date || '۱۴۰۵/۰۸/۰۲'}
              </span>
            </div>

            <p style={{
              fontSize: '13px',
              lineHeight: '1.9',
              color: 'var(--text-main)',
              background: 'var(--bg-main)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}>
              "{data?.advisor_feedback_for_parent?.text || 'با سلام خدمت اولیای گرامی، یاشا در هفته جاری روند پیوسته و بسیار مطلوبی در دروس زیست‌شناسی و شیمی داشته است. توصیه می‌شود در منزل استراحت کافی بعد از ساعت ۲۲ رعایت شود تا تمرکز صبحگاهی در آزمون‌های آزمایشی حفظ شود.'}"
            </p>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                ویس توضیحات هفتگی مشاور مخصوص اولیا:
              </span>
              <VoicePlayer 
                durationSec={35}
                label="پیام صوتی ارزیابی هفتگی مشاور"
                speechText={data?.advisor_feedback_for_parent?.text}
              />
            </div>

            <div style={{
              background: 'var(--hover-bg)',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px dashed var(--gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <PhoneCall size={22} color="var(--gold-dark)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  قرار جلسه تماس تلفنی آینده با مشاور:
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {advisor.next_meeting}
                </div>
              </div>
            </div>
          </div>

          {/* خلاصه تعهد و انضباط دانش‌آموز */}
          <div className="panel" style={{ margin: 0 }}>
            <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#10b981" />
              وضعیت پایبندی روزانه به ساعات تعیین‌شده
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {[
                { title: 'زیست‌شناسی دهم و دوازدهم', plan: 3.0, done: 3.0, status: 'تکمیل ۱۰۰٪' },
                { title: 'شیمی یازدهم (استوکیومتری)', plan: 2.5, done: 2.0, status: 'تکمیل ۸۰٪' },
                { title: 'ریاضیات و مثلثات', plan: 2.0, done: 1.5, status: 'تکمیل ۷۵٪' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      هدف برنامه: {item.plan} ساعت | انجام‌شده: <strong style={{ color: '#10b981' }}>{item.done} ساعت</strong>
                    </div>
                  </div>
                  <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', fontSize: '11px' }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 'bold', fontSize: '13px' }}>
                <BookOpen size={16} />
                توصیه مشاور به والدین برای این هفته:
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.7' }}>
                با توجه به نزدیک شدن به آزمون جامع ماز، محیط منزل در ساعات عصر آرام نگه داشته شود. لطفاً از پرسش‌های مکرر درباره رتبه خودداری شده و بر پایبندی به ساعات استراحت نظارت فرمایید.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* تب ۲: جدول رسمی برنامه هفتگی */}
      {activeTab === 'plan' && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <WeeklyPlanTableView
            studentName={student.name}
            advisorName={advisor.name}
            readOnly={true}
            showExportButtons={true}
          />
        </div>
      )}

      {/* تب ۳: ریز گزارش‌کارها */}
      {activeTab === 'reports' && (
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--primary)" />
              سوابق گزارش‌کارهای ثبت شده توسط دانش‌آموز ({student.name})
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              تعداد گزارش‌های ثبت‌شده: {data?.recent_reports?.length || 2} روز اخیر
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '15px' }}>
            {(data?.recent_reports || []).map((rep: any, idx: number) => (
              <div key={idx} style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--gold-dark)" />
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--primary)' }}>گزارش تاریخ: {rep.report_date}</span>
                    <span className="pill-badge" style={{ fontSize: '11px', background: rep.is_read_by_advisor ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: rep.is_read_by_advisor ? '#10b981' : '#ef4444' }}>
                      {rep.is_read_by_advisor ? 'تایید و بررسی شده توسط مشاور ✅' : 'در صف بررسی مشاور'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>
                    <span>مجموع مطالعه: <strong className="mono-num" style={{ color: 'var(--primary)' }}>{rep.total_study_time} ساعت</strong></span>
                    <span>مجموع تست: <strong className="mono-num" style={{ color: 'var(--gold-dark)' }}>{rep.total_test_count} تست</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  {rep.report_items && Object.entries(rep.report_items).map(([sub, val]: [string, any], sIdx: number) => (
                    <div key={sIdx} style={{
                      background: 'var(--bg-panel)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '12px'
                    }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{sub}: </span>
                      <span>{val.time} ساعت ({val.tests} تست)</span>
                    </div>
                  ))}
                </div>

                {rep.student_note && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px', marginTop: '6px' }}>
                    <strong>یادداشت فرزند برای مشاور:</strong> {rep.student_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* تب ۳: کارنامه‌ها و آزمون‌ها */}
      {activeTab === 'exams' && (
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--gold-dark)" />
            کارنامه آزمون‌های اخیر فرزند شما
          </div>

          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>عنوان آزمون</th>
                  <th style={{ padding: '12px' }}>تاریخ برگزاری</th>
                  <th style={{ padding: '12px' }}>درصد میانگین</th>
                  <th style={{ padding: '12px' }}>تراز کشوری</th>
                  <th style={{ padding: '12px' }}>ارزیابی مشاور</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recent_exams || []).map((ex: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 'bold', color: 'var(--primary)' }}>{ex.name}</td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{ex.date}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 'bold' }} className="mono-num">{ex.score}٪</td>
                    <td style={{ padding: '14px 12px', fontWeight: 'bold', color: 'var(--gold-dark)' }} className="mono-num">{ex.taraz}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' }}>
                        {ex.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تب ویژه: پیام‌ها و توصیه‌های مشاور به اولیا */}
      {activeTab === 'advisor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          <div className="panel" style={{ margin: 0, border: '2px solid var(--gold)' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <MessageSquare size={20} color="var(--gold-dark)" />
                پیام‌ها و توصیه‌های ابلاغ‌شده توسط مشاور تحصیلی
              </span>
              <span className="pill-badge" style={{ fontSize: '11px', background: 'rgba(230,194,135,0.2)' }}>
                {advisorMessages.length} پیام دریافت شده
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {advisorMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)' }}>{msg.title}</span>
                      <span className="pill-badge" style={{ fontSize: '10px', background: msg.urgency === 'urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: msg.urgency === 'urgent' ? '#ef4444' : '#10b981' }}>
                        {msg.urgency === 'urgent' ? 'فوری' : 'توصیه تحصیلی'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.date}</span>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.9', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                    {msg.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>ارسال‌کننده: <strong>{msg.advisor_name || advisor.name}</strong></span>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> ابلاغ رسمی به اولیا
                    </span>
                  </div>
                </div>
              ))}

              {advisorMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px' }}>
                  پیام جدیدی از مشاور در سامانه ثبت نشده است. کلیه توصیه‌ها به صورت هفتگی در اینجا درج می‌گردد.
                </div>
              )}
            </div>
          </div>

          <div className="panel" style={{ margin: 0 }}>
            <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={20} color="var(--gold-dark)" />
              مشخصات و زمان‌های پاسخگویی مشاور
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                  ک
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--primary)', fontSize: '14px' }}>{advisor.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{advisor.specialty}</p>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.8' }}>
                <div>📞 <strong>شماره مستقیم دفتر مشاوره:</strong> <span className="mono-num">{advisor.phone}</span></div>
                <div>⏰ <strong>ساعات پاسخگویی به اولیا:</strong> روزهای زوج از ساعت ۱۷:۰۰ الی ۲۰:۰۰</div>
                <div>📅 <strong>جلسه بعدی برنامه والدین:</strong> {advisor.next_meeting}</div>
              </div>

              <button
                type="button"
                onClick={handleRequestCall}
                style={{
                  background: 'var(--primary)',
                  color: 'var(--gold)',
                  border: '1px solid var(--gold)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                <PhoneCall size={16} /> ثبت درخواست تماس تلفنی در اولین زمان خالی
              </button>
            </div>
          </div>

        </div>
      )}

      {/* مودال پیش‌نمایش چاپ جدول برنامه */}
      {showPrintPlanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(12, 29, 63, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999
        }} onClick={() => setShowPrintPlanModal(false)}>
          <div
            className="bento-card"
            style={{ width: '92%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '18px', fontWeight: '900' }}>
                پیش‌نمایش چاپ برنامه هفتگی ({student.name})
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  پرینت مستقیم 🖨️
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPlanModal(false)}
                  style={{ background: 'transparent', border: '1px solid gray', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  بستن
                </button>
              </div>
            </div>
            <WeeklyPlanTableView
              studentName={student.name}
              advisorName={advisor.name}
              readOnly={true}
              showExportButtons={false}
            />
          </div>
        </div>
      )}

    </div>
  );
}
