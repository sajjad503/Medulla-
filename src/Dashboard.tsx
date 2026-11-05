import React, { useState, useEffect } from 'react';
import { 
  Target, Check, Moon, Coffee, Zap, MessageCircle, Volume2, PhoneCall, User, Award, Clock, BookOpen, CalendarDays, Loader2, CheckCircle2,
  AlertTriangle, ArrowLeft, Bell, Key, Lock, Play, HelpCircle, FileCheck, X, Sparkles, CheckSquare
} from 'lucide-react';
import { VoicePlayer, showVoiceToast } from './VoiceComponents';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import api from './api';

interface DashboardProps {
  onNavigateTab?: (tab: 'dashboard' | 'plan' | 'workreport' | 'answersheet' | 'exams' | 'reports') => void;
}

export default function Dashboard({ onNavigateTab }: DashboardProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<{ total_time: number; total_tests: number }>({ total_time: 0, total_tests: 0 });
  const [todayPlan, setTodayPlan] = useState<any[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const todayName = dayNames[new Date().getDay()];

  // Daily Test State (only for today)
  const todayDateKey = new Date().toISOString().slice(0, 10);
  const [showDailyTestModal, setShowDailyTestModal] = useState(false);
  const [dailyTestAnswers, setDailyTestAnswers] = useState<Record<number, number>>({});
  const [dailyTestSubmitted, setDailyTestSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(`mentora_daily_test_${todayDateKey}`) === 'completed';
  });
  const [dailyTestScore, setDailyTestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem(`mentora_daily_test_score_${todayDateKey}`) || '80', 10);
  });
  const [dailyTestTimer, setDailyTestTimer] = useState<number>(15 * 60);

  // Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [mood, setMood] = useState<'bad' | 'ok' | 'great' | null>(null);
  const [showMissingReportBanner, setShowMissingReportBanner] = useState<boolean>(() => {
    return localStorage.getItem('mentora_dismiss_yesterday_warning') !== 'true';
  });

  useEffect(() => {
    if (!sessionStorage.getItem('mentora_greeted')) {
      setShowMoodTracker(true);
    }
    fetchDashboardData();
  }, [todayName]);

  const [masteryData, setMasteryData] = useState<any[]>([
    { subject: 'زیست‌شناسی', mastery: 0, fullMark: 100 },
    { subject: 'شیمی', mastery: 0, fullMark: 100 },
    { subject: 'فیزیک', mastery: 0, fullMark: 100 },
    { subject: 'ریاضیات', mastery: 0, fullMark: 100 },
    { subject: 'زمین‌شناسی', mastery: 0, fullMark: 100 },
  ]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const profileRes = await api.get('/records/my-profile');
      if (profileRes.data?.profile) {
        setProfileData(profileRes.data.profile);
      }
      if (profileRes.data?.stats) {
        setStats(profileRes.data.stats);

        const subStats = profileRes.data.stats.subject_stats || {};
        const calcMastery = (name: string) => {
          const matched = Object.entries(subStats).find(([k]) => k.includes(name));
          if (!matched) return 0;
          const val: any = matched[1];
          return Math.min(100, Math.round((val.time * 15) + (val.tests * 0.4)));
        };

        setMasteryData([
          { subject: 'زیست‌شناسی', mastery: calcMastery('زیست'), fullMark: 100 },
          { subject: 'شیمی', mastery: calcMastery('شیمی'), fullMark: 100 },
          { subject: 'فیزیک', mastery: calcMastery('فیزیک'), fullMark: 100 },
          { subject: 'ریاضیات', mastery: calcMastery('ریاضی'), fullMark: 100 },
          { subject: 'زمین‌شناسی', mastery: calcMastery('زمین'), fullMark: 100 },
        ]);
      }

      const [planRes, hwRes] = await Promise.all([
        api.get('/records/my-plan').catch(() => ({ data: {} })),
        api.get('/records/homeworks').catch(() => ({ data: [] }))
      ]);

      if (planRes.data && planRes.data.plan_data) {
        setTodayPlan(planRes.data.plan_data[todayName] || []);
      } else {
        setTodayPlan([]);
      }

      setHomeworks(Array.isArray(hwRes.data) ? hwRes.data : []);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error("Error fetching dashboard data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHomework = async (id: number) => {
    try {
      const res = await api.post('/records/homeworks/toggle', { id });
      setHomeworks(prev => prev.map(h => h.id === id ? { ...h, status: res.data.status } : h));
    } catch (err) {
      alert('خطا در به‌روزرسانی وضعیت تکلیف');
    }
  };

  const handleMoodSubmit = () => {
    if (mood) {
      sessionStorage.setItem('mentora_greeted', 'true');
      setShowMoodTracker(false);
    } else {
      alert('لطفاً اول وضعیت امروزت رو انتخاب کن!');
    }
  };

  const [advisorVoice, setAdvisorVoice] = useState<{ url?: string; duration?: number; text?: string; date?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('mentora_advisor_voice');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const dailyTestQuestions = [
    {
      id: 1,
      question: 'در دستگاه گوارش انسان، کدام سلول معده مسئول ترشح فاکتور داخلی (ضروری برای جذب ویتامین B12) است؟',
      options: ['سلول‌های حاشیه‌ای (کناری / پریتال)', 'سلول‌های اصلی (پپتیک)', 'سلول‌های موکوزی گردن', 'سلول‌های درون‌ریز G (ترشح‌کننده گاسترین)'],
      correctIndex: 0,
      analysis: 'سلول‌های حاشیه‌ای علاوه بر اسید کلریدریک (HCl)، فاکتور داخلی را نیز ترشح می‌کنند که برای جذب ویتامین B12 در روده باریک حیاتی است.'
    },
    {
      id: 2,
      question: 'در ساختار نوار قلب (ECG) طبیعی انسان، کمپلکس موج‌های QRS نشان‌دهنده کدام رویداد الکتریکی قلب است؟',
      options: ['دپلاریزاسیون (پیام انقباض) بطن‌ها', 'دپلاریزاسیون دهلیزها', 'رپپلاریزاسیون بطن‌ها', 'سیستول مکانیکی دهلیزها'],
      correctIndex: 0,
      analysis: 'موج QRS نشان‌دهنده انتشار پیام الکتریکی دپلاریزاسیون در بطن‌هاست که بلافاصله به انقباض بطنی منتهی می‌شود.'
    },
    {
      id: 3,
      question: 'در فرآیند رونویسی ژنتیک یوکاریوتی، توالی «راه‌انداز» (Promoter) چه ویژگی دارد؟',
      options: ['محل شناسایی و اتصال رنا بسپاراز است ولی خود رونویسی نمی‌شود', 'به عنوان نخستین کدون به mRNA رونویسی می‌شود', 'در انتهای ژن به عنوان علامت پایان قرار دارد', 'توسط ریبوزوم‌ها ترجمه می‌شود'],
      correctIndex: 0,
      analysis: 'راه‌انداز توالی تنظیمی ویژه در دنا است که آنزیم رنا بسپاراز به آن می‌نشیند، ولی خود توالی راه‌انداز در رونوشت mRNA رونوشت نمی‌شود.'
    },
    {
      id: 4,
      question: 'در محلول یک مولار استیک اسید با درصد یونش ۲.۵٪ در دمای ۲۵ درجه، غلظت یون هیدرونیوم چقدر است؟',
      options: ['۰.۰۲۵ مولار', '۰.۲۵ مولار', '۰.۰۰۲۵ مولار', '۲.۵ مولار'],
      correctIndex: 0,
      analysis: 'غلظت یون هیدرونیوم برابر است با غلظت اولیه اسید ضرب‌در درجه یونش: [H3O+] = 1 * 0.025 = 0.025 M.'
    },
    {
      id: 5,
      question: 'در حرکت با شتاب ثابت بر روی خط راست، شیب نمودار «سرعت - زمان» نشان‌دهنده کدام کمیت فیزیکی است؟',
      options: ['شتاب لحظه‌ای متحرک', 'مکان اولیه متحرک', 'جابه‌جایی متحرک', 'تندی متوسط'],
      correctIndex: 0,
      analysis: 'شیب خط مماس بر نمودار سرعت - زمان در هر لحظه، برابر با شتاب متحرک (a = dv/dt) است.'
    }
  ];

  // Daily test timer countdown
  useEffect(() => {
    let t: any = null;
    if (showDailyTestModal && !dailyTestSubmitted && dailyTestTimer > 0) {
      t = setInterval(() => {
        setDailyTestTimer(prev => {
          if (prev <= 1) {
            handleDailyTestFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [showDailyTestModal, dailyTestSubmitted, dailyTestTimer]);

  const handleSelectDailyTestOption = (qId: number, optIdx: number) => {
    if (dailyTestSubmitted) return;
    setDailyTestAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleDailyTestFinish = () => {
    let correctCount = 0;
    dailyTestQuestions.forEach(q => {
      if (dailyTestAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    const percentage = Math.round((correctCount / dailyTestQuestions.length) * 100);
    setDailyTestScore(percentage);
    setDailyTestSubmitted(true);
    localStorage.setItem(`mentora_daily_test_${todayDateKey}`, 'completed');
    localStorage.setItem(`mentora_daily_test_score_${todayDateKey}`, String(percentage));
    showVoiceToast(`آفرین! تست روزانه ${todayName} با درصد ${percentage}٪ ثبت شد 🎯`, 'success');
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('رمز عبور جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('رمز عبور جدید و تکرار آن یکسان نیستند.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        phone_number: profileData?.phone_number || '09120000004'
      });
      if (res.data?.success) {
        setPasswordSuccess('رمز عبور شما با موفقیت تغییر یافت ✅');
        setTimeout(() => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'خطا در تغییر رمز عبور. لطفاً مجدداً تلاش کنید.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatTestTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const advisorSettings = {
    goal: 'قبولی کنکور سراسری 🩺',
    daysLeft: 145,
    nextMeeting: { date: 'چهارشنبه ۴ آبان', time: '۱۸:۳۰', type: 'تماس تلفنی' },
    advisorMessage: advisorVoice?.text || (profileData?.advisor_name ? `سلام ${profileData?.name?.split(' ')[0] || 'یاشا'} عزیز، برنامه این هفته شما توسط من آماده شده است. با تمرکز کامل روی تست‌های زمان‌دار و ثبت دقیق گزارش کار روزانه پیش برو.` : 'سلام! منتظر بررسی و پیام مشاور خود باشید.'),
    hasVoice: true
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} className="spin-animation" color="var(--gold)" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: 'var(--primary)' }}>در حال بارگذاری میز کار شما...</h3>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px', position: 'relative' }}>
      
      {showMoodTracker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(12, 29, 63, 0.9)', zIndex: 9999, display: 'flex',
          justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px',
            width: '90%', maxWidth: '450px', textAlign: 'center', border: '1px solid var(--gold)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'fadeIn 0.4s ease-out'
          }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>صبح بخیر {profileData?.name?.split(' ')[0] || 'یاشا'}! ☀️</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px' }}>
              قبل از شروع برنامه امروز، وضعیت انرژی و خوابت چطوره؟
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '15px', marginBottom: '30px' }}>
              <button 
                onClick={() => setMood('bad')}
                style={{ 
                  background: mood === 'bad' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
                  border: mood === 'bad' ? '2px solid var(--danger)' : '2px solid var(--border-color)',
                  padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', flex: 1
                }}
              >
                <Moon size={32} color={mood === 'bad' ? 'var(--danger)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>خسته / خواب‌آلود</div>
              </button>
              
              <button 
                onClick={() => setMood('ok')}
                style={{ 
                  background: mood === 'ok' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-main)', 
                  border: mood === 'ok' ? '2px solid var(--warning)' : '2px solid var(--border-color)',
                  padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', flex: 1
                }}
              >
                <Coffee size={32} color={mood === 'ok' ? 'var(--warning)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>معمولی / آروم</div>
              </button>

              <button 
                onClick={() => setMood('great')}
                style={{ 
                  background: mood === 'great' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-main)', 
                  border: mood === 'great' ? '2px solid var(--success)' : '2px solid var(--border-color)',
                  padding: '15px', borderRadius: '16px', cursor: 'pointer', transition: '0.2s', flex: 1
                }}
              >
                <Zap size={32} color={mood === 'great' ? 'var(--success)' : 'var(--text-muted)'} style={{ margin: '0 auto 10px auto' }} />
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>پرانرژی / بمب!</div>
              </button>
            </div>
            
            <button onClick={handleMoodSubmit} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
              <Check size={18} /> ثبت وضعیت و ورود به مدولا
            </button>
          </div>
        </div>
      )}

      {/* اخطار فوری عدم ارسال گزارش‌کار روز قبل با مهلت تا فردا ساعت ۴ عصر */}
      {showMissingReportBanner && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.05) 100%)',
          border: '1.5px solid #ef4444',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.12)',
          direction: 'rtl'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '900', color: '#b91c1c', fontSize: '14px' }}>
                  ⚠️ اخطار انضباطی: عدم ارسال گزارش‌کار روز گذشته
                </span>
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  مهلت: فردا ساعت ۱۶:۰۰ (۴ عصر)
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#7f1d1d', lineHeight: 1.6 }}>
                هنوز ساعات مطالعه و تست‌های دیروز را ثبت نکرده‌اید. لطفاً قبل از انقضای مهلت (فردا ساعت ۴ بعدازظهر)، گزارش خود را در بخش گزارش‌کار ثبت کنید تا اخطار غیبت به مشاور و پنل اولیا ارسال نشود.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('workreport')}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ثبت سریع گزارش روز قبل
                <ArrowLeft size={14} />
              </button>
            )}
            <button
              onClick={() => {
                setShowMissingReportBanner(false);
                localStorage.setItem('mentora_dismiss_yesterday_warning', 'true');
              }}
              style={{
                background: 'rgba(0,0,0,0.05)',
                color: '#6b7280',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              title="بستن این هشدار"
            >
              بعداً
            </button>
          </div>
        </div>
      )}

      {/* هدر شخصی‌سازی شده */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid var(--gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '50%', color: 'var(--gold)', border: '2px solid var(--gold)' }}>
            <User size={30} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '20px', fontWeight: '900' }}>
              سلام، {profileData?.name || 'یاشا محبی'}! ✋
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="pill-badge" style={{ fontSize: '11px', background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', border: 'none' }}>
                <Award size={12} style={{ verticalAlign: 'middle', marginLeft: '3px' }} />
                مشاور اختصاصی شما: {profileData?.advisor_name || 'دکتر کاظمی'}
              </span>
              <span className="pill-badge" style={{ fontSize: '11px' }}>{profileData?.grade || 'دوازدهم تجربی'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setPasswordError('');
            setPasswordSuccess('');
            setShowPasswordModal(true);
          }}
          style={{
            background: 'var(--bg-main)',
            color: 'var(--primary)',
            border: '1.5px solid var(--border-color)',
            padding: '9px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="تغییر رمز عبور ورود به پنل"
        >
          <Key size={15} color="var(--gold-dark)" />
          تغییر رمز عبور
        </button>
      </div>

      {/* تابلوی آرزوها و شمارش معکوس کنکور */}
      <div style={{ 
        position: 'relative', width: '100%', height: '200px', borderRadius: '20px', 
        overflow: 'hidden', marginBottom: '25px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0c1d3f 0%, #1b3366 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
        }}>
          <div style={{ zIndex: 1, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(230, 194, 135, 0.2)', backdropFilter: 'blur(5px)', padding: '6px 15px', borderRadius: '20px', fontSize: '12px', color: 'var(--gold)', marginBottom: '12px', border: '1px solid rgba(230, 194, 135, 0.3)' }}>
              هدف تعیین‌شده با مشاور: {advisorSettings.goal}
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '2px', margin: '0 0 8px 0', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
              {advisorSettings.daysLeft} <span style={{ fontSize: '18px', fontWeight: 'normal', color: 'rgba(255,255,255,0.7)' }}>روز مانده تا کنکور سراسری</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>ماشین زمان مدولا در حال تیک‌تاک است...</p>
          </div>
        </div>
      </div>

      {/* کارت‌های آماری لایو از دیتابیس */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="bento-card" style={{ borderRight: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
            <Clock size={16} /> مجموع ساعت مطالعه ثبت‌شده شما
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '10px' }}>
            {stats.total_time} <span style={{ fontSize: '12px', color: 'gray' }}>ساعت</span>
          </div>
        </div>
        
        <div className="bento-card" style={{ borderRight: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
            <Target size={16} /> مجموع تست‌های حل‌شده
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--success)', marginTop: '10px' }}>
            {stats.total_tests} <span style={{ fontSize: '12px', color: 'gray' }}>تست</span>
          </div>
        </div>
      </div>

      {/* بخش اختصاصی آزمون تمرینی روزانه - فقط برای امروز */}
      <div className="bento-card" style={{
        marginBottom: '25px',
        background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.1) 0%, rgba(12, 29, 63, 0.05) 100%)',
        border: '1.5px solid var(--gold)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
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
            boxShadow: '0 6px 16px rgba(12, 29, 63, 0.2)',
            border: '1.5px solid var(--gold)'
          }}>
            <FileCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '17px', fontWeight: '900' }}>
                آزمون تمرینی روزانه ({todayName})
              </h3>
              <span className="pill-badge" style={{ background: 'var(--primary)', color: 'var(--gold)', fontSize: '10px', fontWeight: 'bold' }}>
                فقط مخصوص امروز ⏳
              </span>
              {dailyTestSubmitted && (
                <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', fontSize: '11px', fontWeight: 'bold' }}>
                  کارنامه ثبت شد: {dailyTestScore}٪ ✅
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6' }}>
              کوییز ۵ سوالی زمان‌دار استاندار کنکور (زیست، شیمی، فیزیک) - مهلت پاسخگویی: تا پایان امشب
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDailyTestModal(true)}
          style={{
            background: dailyTestSubmitted ? 'var(--bg-panel)' : 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
            color: dailyTestSubmitted ? 'var(--primary)' : '#0C1D3F',
            border: dailyTestSubmitted ? '1.5px solid var(--gold)' : 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: dailyTestSubmitted ? 'none' : '0 6px 18px rgba(230, 194, 135, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          {dailyTestSubmitted ? (
            <><HelpCircle size={16} /> مشاهده پاسخ تشریحی و تحلیل تست امروز</>
          ) : (
            <><Play size={16} /> شروع آزمون تمرینی امروز ({todayName})</>
          )}
        </button>
      </div>

      {/* بخش تکالیف و فعالیت‌های درسی تعیین‌شده توسط مشاور */}
      <div className="bento-card" style={{ marginBottom: '25px', borderRight: '4px solid var(--gold)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--primary)', color: 'var(--gold)', padding: '8px', borderRadius: '10px' }}>
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900' }}>
                تکالیف و تمرین‌های تعیین‌شده توسط مشاور
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, gray)' }}>
                مشاور شما این تمرین‌ها را برای تثبیت یادگیری تعیین کرده است. پس از اتمام، روی دکمه «انجام شد» بزنید.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="pill-badge" style={{ background: 'rgba(197,168,128,0.15)', color: 'var(--text-main)', fontSize: '11px' }}>
              کل تکالیف: {homeworks.length}
            </span>
            <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '11px' }}>
              انجام‌شده: {homeworks.filter(h => h.status === 'completed').length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {homeworks.map(hw => {
            const isDone = hw.status === 'completed';
            return (
              <div
                key={hw.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: isDone ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-color)',
                  background: isDone ? 'rgba(16,185,129,0.04)' : 'var(--bg-main)',
                  flexWrap: 'wrap',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 260px' }}>
                  <button
                    onClick={() => handleToggleHomework(hw.id)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      border: isDone ? 'none' : '2px solid var(--border-color)',
                      background: isDone ? '#10B981' : 'transparent',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title={isDone ? 'بازگردانی به حالت در انتظار' : 'تیک زدن به عنوان انجام شد'}
                  >
                    {isDone && <Check size={16} />}
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: isDone ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {hw.title}
                      </span>
                      <span className="pill-badge" style={{ fontSize: '10px', background: 'rgba(197,168,128,0.15)', color: 'var(--gold-dark)', borderColor: 'transparent' }}>
                        {hw.subject || 'عمومی'}
                      </span>
                    </div>
                    {hw.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        {hw.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    مهلت: {hw.due_date || 'امروز'}
                  </span>

                  <button
                    onClick={() => handleToggleHomework(hw.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: isDone ? '1px solid #10B981' : '1px solid var(--gold)',
                      background: isDone ? 'rgba(16,185,129,0.1)' : 'var(--primary)',
                      color: isDone ? '#10B981' : 'var(--gold)'
                    }}
                  >
                    {isDone ? 'انجام شد ✓' : 'علامت‌گذاری انجام'}
                  </button>
                </div>
              </div>
            );
          })}

          {homeworks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              در حال حاضر تکلیف فعالی برای شما ثبت نشده است. پس از ارائه تمرین جدید توسط مشاور، در اینجا نمایش داده خواهد شد.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* رادار تسلط دروس */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--primary)" /> رادار تسلط دروس
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            این نمودار بر اساس درصدهای کارنامه‌های شما آپدیت می‌شود و نقاط قوت و ضعف را نشان می‌دهد.
          </p>
          
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={masteryData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--primary)', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--gold)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Radar 
                  name="میزان تسلط" 
                  dataKey="mastery" 
                  stroke="var(--gold-dark)" 
                  fill="var(--gold)" 
                  fillOpacity={0.4} 
                  isAnimationActive={true}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* برنامه امروز و ارتباط با مشاور */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="panel" style={{ margin: 0, border: '2px solid var(--gold-dark)' }}>
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: 'var(--primary)' }}>
                <CalendarDays size={20} color="var(--gold-dark)" /> برنامه مطالعاتی امروز ({todayName})
              </span>
            </div>

            {todayPlan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={36} color="var(--border-color)" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>برای امروز باکس مطالعه‌ای تعریف نشده است. به تب «برنامه» مراجعه کنید.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1.5px solid var(--border-color)', color: 'var(--primary)' }}>
                      <th style={{ padding: '8px 10px', width: '55px', textAlign: 'center' }}>پارت</th>
                      <th style={{ padding: '8px 10px' }}>درس و مبحث</th>
                      <th style={{ padding: '8px 10px', width: '80px', textAlign: 'center' }}>مدت</th>
                      <th style={{ padding: '8px 10px', width: '65px', textAlign: 'center' }}>تست</th>
                      <th style={{ padding: '8px 10px', width: '75px', textAlign: 'center' }}>وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayPlan.map((task: any, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', background: task.isDone ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '11px' }}>
                          {task.shift ? (task.shift === 'morning' ? 'صبح' : task.shift === 'afternoon' ? 'ظهر' : task.shift === 'evening' ? 'عصر' : 'شب') : `${index + 1}`}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 'bold', color: task.isDone ? 'var(--text-muted)' : 'var(--primary)', textDecoration: task.isDone ? 'line-through' : 'none' }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--gold-dark)', fontWeight: 'bold' }} className="mono-num">
                          {task.duration} د
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#1D4ED8', fontWeight: 'bold' }} className="mono-num">
                          {task.tests > 0 ? `${task.tests}` : '-'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          {task.isDone ? (
                            <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 'bold' }}>✓ تکمیل</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>○ در انتظار</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={18} color="var(--gold-dark)" /> قرار جلسه بعدی با مشاور
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-main)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
              <div style={{ background: 'var(--gold-ghost)', padding: '10px', borderRadius: '10px' }}>
                <PhoneCall size={24} color="var(--gold-dark)" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>{advisorSettings.nextMeeting.date}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  ساعت <span className="mono-num" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>{advisorSettings.nextMeeting.time}</span> ({advisorSettings.nextMeeting.type})
                </div>
              </div>
            </div>
          </div>

          <div className="panel" style={{ margin: 0, background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.12) 0%, transparent 100%)', border: '1px solid var(--gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={18} color="var(--primary)" /> پیام جدید مشاور ({profileData?.advisor_name || 'دکتر کاظمی'})
              </span>
              <span className="pill-badge" style={{ background: '#0C1D3F', color: '#E6C287', fontSize: '10px' }}>
                {advisorVoice?.date || 'امروز'}
              </span>
            </div>

            <p style={{ fontSize: '12px', lineHeight: '1.8', color: 'var(--text-main)', margin: '0 0 14px 0', padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', fontStyle: 'italic' }}>
              "{advisorSettings.advisorMessage}"
            </p>

            <VoicePlayer 
              audioUrl={advisorVoice?.url}
              durationSec={advisorVoice?.duration || 28}
              label={advisorVoice ? 'ویس ارسالی جدید مشاور' : 'ویس راهنمای هفتگی مشاور'}
              speechText={advisorSettings.advisorMessage}
            />
          </div>

        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => showVoiceToast('🚨 پینگ اضطراری به پنل مشاور شما ارسال شد! مشاور به زودی وضعیتت رو چک می‌کنه.', 'info')}
          style={{
            background: 'var(--danger)', color: '#fff', border: 'none', padding: '14px 28px',
            borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.35)', transition: '0.3s'
          }}
        >
          <PhoneCall size={18} /> در فضای مجازی غرق شدم! (ارسال پینگ اضطراری به مشاور)
        </button>
      </div>

      {/* مدال تعاملی آزمون تمرینی روزانه */}
      {showDailyTestModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-panel)',
            border: '2px solid var(--gold)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            direction: 'rtl'
          }}>
            {/* سربرگ آزمون روزانه */}
            <div style={{
              background: 'var(--primary)',
              color: '#fff',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={22} color="var(--gold)" />
                <span style={{ fontWeight: '900', fontSize: '16px', color: 'var(--gold)' }}>
                  آزمون تمرینی روزانه ({todayName})
                </span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                  ۵ سوال تستی استاندارد
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!dailyTestSubmitted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(230, 194, 135, 0.2)', padding: '4px 10px', borderRadius: '8px', color: 'var(--gold)', fontWeight: 'bold', fontSize: '13px' }}>
                    <Clock size={14} />
                    <span className="mono-num">{formatTestTimer(dailyTestTimer)}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowDailyTestModal(false)}
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* بدنه سوالات آزمون */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {dailyTestSubmitted && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px' }}>آزمون با موفقیت ثبت شد!</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>پاسخ‌های صحیح با کادر سبز و پاسخنامه تشریحی در زیر هر تست مشخص شده است.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }} className="mono-num">
                    نمره: {dailyTestScore}٪
                  </div>
                </div>
              )}

              {dailyTestQuestions.map((q, qIndex) => {
                const userSelected = dailyTestAnswers[q.id];
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <div key={q.id} style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                      <span style={{
                        background: 'var(--primary)',
                        color: 'var(--gold)',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {qIndex + 1}
                      </span>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', lineHeight: '1.8' }}>
                        {q.question}
                      </p>
                    </div>

                    {/* گزینه‌ها */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userSelected === oIdx;
                        let optBg = 'var(--bg-panel)';
                        let optBorder = '1px solid var(--border-color)';
                        let optColor = 'var(--text-main)';

                        if (dailyTestSubmitted) {
                          if (oIdx === q.correctIndex) {
                            optBg = 'rgba(16, 185, 129, 0.15)';
                            optBorder = '1.5px solid #10b981';
                            optColor = '#065f46';
                          } else if (isChosen && oIdx !== q.correctIndex) {
                            optBg = 'rgba(239, 68, 68, 0.15)';
                            optBorder = '1.5px solid #ef4444';
                            optColor = '#991b1b';
                          }
                        } else if (isChosen) {
                          optBg = 'rgba(230, 194, 135, 0.2)';
                          optBorder = '1.5px solid var(--gold)';
                          optColor = 'var(--primary)';
                        }

                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectDailyTestOption(q.id, oIdx)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: optBg,
                              border: optBorder,
                              color: optColor,
                              fontSize: '13px',
                              cursor: dailyTestSubmitted ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span style={{ fontWeight: 'bold', fontSize: '12px', opacity: 0.7 }}>
                              ({oIdx + 1})
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* تحلیل و پاسخ تشریحی بعد از ثبت */}
                    {dailyTestSubmitted && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--hover-bg)',
                        borderRight: '3px solid var(--gold)',
                        fontSize: '12px',
                        color: 'var(--text-main)',
                        lineHeight: '1.7'
                      }}>
                        <strong style={{ color: 'var(--gold-dark)' }}>💡 پاسخ تشریحی مشاور:</strong> {q.analysis}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* فوتر دکمه ثبت آزمون */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-main)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {dailyTestSubmitted ? 'آزمون امروز پایان یافته است.' : `پاسخ داده شده: ${Object.keys(dailyTestAnswers).length} از ${dailyTestQuestions.length}`}
              </span>

              {!dailyTestSubmitted ? (
                <button
                  onClick={handleDailyTestFinish}
                  style={{
                    background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
                    color: '#0C1D3F',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} /> ثبت پاسخبرگ و صدور کارنامه
                </button>
              ) : (
                <button
                  onClick={() => setShowDailyTestModal(false)}
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  بستن آزمون
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مدال تغییر رمز عبور دانش‌آموز */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-panel)',
            border: '2px solid var(--gold)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '440px',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            direction: 'rtl',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '17px', fontWeight: '900' }}>
                    تغییر رمز عبور دانش‌آموز
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    حساب کاربری: {profileData?.name || 'یاشا محبی'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {passwordError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px' }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#065f46', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', fontWeight: 'bold' }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '6px' }}>
                  رمز عبور فعلی:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="رمز عبور فعلی (پیش‌فرض: 123)"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 38px 11px 12px', borderRadius: '10px',
                      border: '1.5px solid var(--border-color)', background: 'var(--bg-main)',
                      color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '6px' }}>
                  رمز عبور جدید:
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="رمز عبور جدید (حداقل ۴ کاراکتر)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 38px 11px 12px', borderRadius: '10px',
                      border: '1.5px solid var(--border-color)', background: 'var(--bg-main)',
                      color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '6px' }}>
                  تکرار رمز عبور جدید:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="تکرار رمز عبور جدید"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 38px 11px 12px', borderRadius: '10px',
                      border: '1.5px solid var(--border-color)', background: 'var(--bg-main)',
                      color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
                  color: '#0C1D3F',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px'
                }}
              >
                {passwordLoading ? <Loader2 size={16} className="spin-animation" /> : <><Check size={16} /> ذخیره و تغییر رمز عبور</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
