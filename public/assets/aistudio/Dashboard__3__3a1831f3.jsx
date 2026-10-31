import React, { useState, useEffect } from 'react';
import { 
  Target, Check, Moon, Coffee, Zap, MessageCircle, Volume2, PhoneCall, X, User, Award, Clock, BookOpen, CalendarDays, Loader2, CheckCircle2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import api from './api';

function Dashboard() {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ time: 0, tests: 0 });
  const [todayPlan, setTodayPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // استخراج نام روز جاری به فارسی برای نمایش برنامه امروز
  const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const todayName = dayNames[new Date().getDay()];

  // کنترل نمایش پیام احوال‌پرسی فقط برای بار اول در نشست فعلی (Session)
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [mood, setMood] = useState(null);

  useEffect(() => {
    if (!sessionStorage.getItem('mentora_greeted')) {
      setShowMoodTracker(true);
    }
    fetchDashboardData();
  }, [todayName]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // ۱. دریافت اطلاعات پروفایل و آمار
      const profileRes = await api.get('/records/my-profile');
      setProfileData(profileRes.data.profile);
      setStats(profileRes.data.stats);

      // ۲. دریافت برنامه مطالعاتی و فیلتر کردن فقط برای امروز
      const planRes = await api.get('/records/my-plan');
      if (planRes.data && planRes.data.plan_data) {
        setTodayPlan(planRes.data.plan_data[todayName] || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
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

  // داده‌های دمو برای رادار تسلط (بعدا از دیتابیس میاد)
  const masteryData = [
    { subject: 'زیست‌شناسی', mastery: 85, fullMark: 100 },
    { subject: 'شیمی', mastery: 65, fullMark: 100 },
    { subject: 'فیزیک', mastery: 45, fullMark: 100 },
    { subject: 'ریاضیات', mastery: 30, fullMark: 100 },
    { subject: 'زمین‌شناسی', mastery: 90, fullMark: 100 },
  ];

  // داده‌های تنظیم شده توسط مشاور (داینامیک)
  const advisorSettings = {
    goal: 'دندان‌پزشکی دانشگاه تهران 🩺',
    daysLeft: 145,
    nextMeeting: { date: 'چهارشنبه ۲۸ مهر', time: '۱۸:۳۰', type: 'تماس تلفنی' },
    advisorMessage: 'سلام یاشا جان، تحلیل آزمون جمعه رو دیدم. این هفته تمرکزت رو بذار روی مرور زیست دهم و تست‌های زمان‌دار فیزیک.',
    hasVoice: true
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} className="animate-spin" color="var(--gold)" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: 'var(--primary)' }}>در حال بارگذاری میز کار شما...</h3>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px', position: 'relative' }}>
      
      {/* ---------------- ۱. دماسنج حال درونی (Mood Tracker Modal) ---------------- */}
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
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>صبح بخیر {profileData?.name?.split(' ')[0] || 'دوست عزیز'}! ☀️</h2>
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
              <Check size={18} /> ثبت وضعیت و ورود به منتورا
            </button>
          </div>
        </div>
      )}

      {/* هدر شخصی‌سازی شده اضافه شده از دیتابیس */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid var(--gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '50%', color: 'var(--gold)', border: '2px solid var(--gold)' }}>
            <User size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '22px', fontWeight: '900' }}>
              سلام، {profileData?.name || 'دانش‌آموز عزیز'}! ✋
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span className="pill-badge" style={{ fontSize: '11px', background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', border: 'none' }}>
                <Award size={12} style={{ verticalAlign: 'middle', marginLeft: '3px' }} />
                مشاور شما: {profileData?.advisor_name || 'در انتظار تخصیص'}
              </span>
              <span className="pill-badge" style={{ fontSize: '11px' }}>{profileData?.grade || 'پایه نامشخص'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- ۲. تابلوی آرزوها و ماشین زمان کنکور (داینامیک) ---------------- */}
      <div style={{ 
        position: 'relative', width: '100%', height: '220px', borderRadius: '24px', 
        overflow: 'hidden', marginBottom: '25px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0c1d3f 0%, #1b3366 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, transparent 20%, #000 150%)' }}></div>
          
          <div style={{ zIndex: 1, textAlign: 'center' }}>
            <div style={{ display: 'inline-block', background: 'rgba(230, 194, 135, 0.2)', backdropFilter: 'blur(5px)', padding: '6px 15px', borderRadius: '20px', fontSize: '13px', color: 'var(--gold)', marginBottom: '15px', border: '1px solid rgba(230, 194, 135, 0.3)' }}>
              هدف نهایی (تنظیم مشاور): {advisorSettings.goal}
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '2px', margin: '0 0 10px 0', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
              {advisorSettings.daysLeft} <span style={{ fontSize: '20px', fontWeight: 'normal', color: 'rgba(255,255,255,0.7)' }}>روز مانده تا کنکور</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>ماشین زمان منتورا در حال تیک‌تاک است...</p>
          </div>
        </div>
      </div>

      {/* کارت‌های آماری لایو از دیتابیس */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="bento-card" style={{ borderRight: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
            <Clock size={16} /> مجموع ساعت مطالعه شما
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--primary)', marginTop: '10px' }}>
            {stats.total_time} <span style={{ fontSize: '12px', color: 'gray' }}>ساعت</span>
          </div>
        </div>
        
        <div className="bento-card" style={{ borderRight: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
            <Target size={16} /> مجموع تست‌های زده شده
          </div>
          <div className="mono-num" style={{ fontSize: '28px', color: 'var(--success)', marginTop: '10px' }}>
            {stats.total_tests} <span style={{ fontSize: '12px', color: 'gray' }}>تست</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginBottom: '30px' }}>
        
        {/* ---------------- ۳. رادار تسلط (Mastery Radar) ---------------- */}
        <div className="panel" style={{ margin: 0 }}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--primary)" /> رادار تسلط دروس
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            این نمودار بر اساس درصدهای کارنامه‌های شما آپدیت می‌شود و نقاط ضعف (فرورفتگی‌ها) را نشان می‌دهد.
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

        {/* ---------------- ۴. ارتباطات مشاور و برنامه امروز ---------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
           {/* نمایش برنامه مخصوص امروز در داشبورد */}
          <div className="panel" style={{ margin: 0, border: '2px solid var(--gold-dark)' }}>
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--primary)' }}>
                <CalendarDays size={22} color="var(--gold-dark)" /> برنامه مطالعاتی امروز ({todayName})
              </span>
            </div>

            {todayPlan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '15px', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} color="var(--border-color)" style={{ marginBottom: '10px' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>برای امروز باکس مطالعه‌ای تعریف نشده است.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {todayPlan.map((task, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-panel)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ background: 'rgba(230,194,135,0.15)', padding: '8px', borderRadius: '10px', color: 'var(--gold-dark)' }}>
                      <BookOpen size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary)', fontSize: '14px' }}>{task.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-main)' }}>{task.description}</p>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--hover-bg)', padding: '6px 10px', borderRadius: '8px', border: '1px dashed var(--gold)' }}>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>زمان</span>
                      <span style={{ fontWeight: '900', color: 'var(--primary)' }} className="mono-num">{task.duration} <span style={{ fontSize: '10px' }}>دقیقه</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تایم جلسه بعدی */}
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={20} color="var(--gold-dark)" /> قرار جلسه/تماس بعدی با مشاور
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-main)', padding: '15px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <div style={{ background: 'var(--gold-ghost)', padding: '12px', borderRadius: '12px' }}>
                <PhoneCall size={28} color="var(--gold-dark)" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)', marginBottom: '5px' }}>{advisorSettings.nextMeeting.date}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  ساعت <span className="mono-num" style={{ color: 'var(--gold-dark)', fontWeight: 'bold' }}>{advisorSettings.nextMeeting.time}</span> ({advisorSettings.nextMeeting.type})
                </div>
              </div>
            </div>
          </div>

          {/* پیام و ویس اختصاصی مشاور */}
          <div className="panel" style={{ margin: 0, background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.1) 0%, transparent 100%)', border: '1px solid var(--gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={20} color="var(--primary)" /> پیام جدید از مشاور
              </span>
              {advisorSettings.hasVoice && (
                <button className="gold-glow-btn" style={{ padding: '6px 12px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <Volume2 size={14} /> پخش ویس مشاور
                </button>
              )}
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-main)', margin: 0, padding: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '10px', fontStyle: 'italic' }}>
              "{advisorSettings.advisorMessage}"
            </p>
          </div>

        </div>

      </div>

      {/* ---------------- ۵. دکمه قفل اضطراری (Panic Button) ---------------- */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => alert('پینگ اضطراری به پنل مشاور ارسال شد! مشاور به زودی وضعیت برنامه‌ات رو چک می‌کنه.')}
          style={{
            background: 'var(--danger)', color: '#fff', border: 'none', padding: '16px 30px',
            borderRadius: '50px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)', transition: '0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <PhoneCall size={20} /> در فضای مجازی غرق شدم! (ارسال پینگ به مشاور)
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
