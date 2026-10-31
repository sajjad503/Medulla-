import React, { useState, useEffect } from 'react';
import { 
  Target, Check, Moon, Coffee, Zap, MessageCircle, Volume2, PhoneCall, X 
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

function Dashboard() {
  // کنترل نمایش پیام احوال‌پرسی فقط برای بار اول در نشست فعلی (Session)
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [mood, setMood] = useState(null);

  useEffect(() => {
    if (!sessionStorage.getItem('mentora_greeted')) {
      setShowMoodTracker(true);
    }
  }, []);

  const handleMoodSubmit = () => {
    if (mood) {
      sessionStorage.setItem('mentora_greeted', 'true');
      setShowMoodTracker(false);
    } else {
      alert('لطفاً اول وضعیت امروزت رو انتخاب کن!');
    }
  };

  // داده‌های دمو برای رادار تسلط
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
            <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>صبح بخیر یاشا! ☀️</h2>
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

        {/* ---------------- ۴. ارتباطات مشاور (پیام و تایم جلسه) ---------------- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* تایم جلسه بعدی */}
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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