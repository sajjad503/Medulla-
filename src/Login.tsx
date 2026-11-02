import React, { useEffect, useRef, useState } from 'react';
import { User, Lock, ArrowLeft, Loader2, Eye, EyeOff, UserPlus, Phone, Shield, Building, Award, GraduationCap, ShieldCheck, HeartHandshake } from 'lucide-react';
import api from './api';
import MentoraLogo from './MentoraLogo';

interface LoginProps {
  onLogin: (role: string) => void;
  onBackToLanding?: () => void;
}

export default function Login({ onLogin, onBackToLanding }: LoginProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login States
  const [loginUsername, setLoginUsername] = useState('09910746198');
  const [loginPassword, setLoginPassword] = useState('123');
  
  // Register States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [invitedAdvisor, setInvitedAdvisor] = useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const staticStars = Array.from({ length: 300 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      opacity: Math.random()
    }));

    const galaxyParticles: any[] = [];
    const particleCount = 1500;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const colors = ['#ffffff', '#E6C287', '#8bb4fa', '#cba6f7'];

    for (let i = 0; i < particleCount; i++) {
      const armIndex = i % 3;
      const angleOffset = (Math.PI * 2 / 3) * armIndex;
      const distance = Math.random() * (canvas.width > 800 ? 550 : 350);
      const angle = distance * 0.02 + angleOffset + (Math.random() * 0.5); 
      
      galaxyParticles.push({
        distance: distance,
        angle: angle,
        size: Math.random() * 1.5 + 0.2,
        speed: 0.0015 + (Math.random() * 0.001),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random()
      });
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      staticStars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.opacity += (Math.random() - 0.5) * 0.05;
        if(star.opacity > 1) star.opacity = 1;
        if(star.opacity < 0.1) star.opacity = 0.1;
      });

      galaxyParticles.forEach(p => {
        p.angle -= p.speed; 
        
        const x = centerX + Math.cos(p.angle) * p.distance;
        const y = centerY + Math.sin(p.angle) * p.distance * 0.35;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    const timer = setTimeout(() => setShowForm(true), 600);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('invite') || params.get('advisor') || localStorage.getItem('mentora_invite_code') || '';
      if (code) {
        setInviteCode(code);
        api.get(`/auth/invite-info/${code}`)
          .then(res => {
            if (res.data?.valid && res.data.advisor) {
              setInvitedAdvisor(res.data.advisor);
              setAuthMode('register'); // Switch to register automatically for invited new students
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent, customPhone?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const phone = customPhone || loginUsername;
    const pass = customPass || loginPassword;

    if(!phone || !pass) {
      setError('لطفاً شماره موبایل و رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/auth/login', {
        username: phone,
        password: pass
      });

      const token = response.data.access_token;
      localStorage.setItem('mentora_token', token);

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(window.atob(payloadBase64));
      
      onLogin(decodedPayload.role);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      } else if (err.response && err.response.status === 403) {
        setError(err.response.data?.detail || 'اکانت شما در حال حاضر تعلیق یا در انتظار تایید است.');
      } else {
        setError('ارتباط با سرور برقرار نشد. وضعیت سرور را بررسی کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!regFullName || !regPhone || !regPassword) {
      setError('لطفاً تمامی فیلدها را پر کنید.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.post('/auth/register', {
        workspace_id: 1,
        role: 'student', 
        full_name: regFullName,
        phone_number: regPhone,
        password: regPassword,
        custom_group: invitedAdvisor ? 'شاگرد مستقیم (لینک دعوت)' : 'ثبت‌نام جدید (در انتظار تایید)',
        grade: 'دوازدهم تجربی',
        invite_code: inviteCode || (invitedAdvisor?.invite_code || '')
      });

      if (invitedAdvisor) {
        setSuccessMsg(`ثبت‌نام با موفقیت انجام شد و مستقیماً به ${invitedAdvisor.full_name} متصل شدید!`);
      } else {
        setSuccessMsg('ثبت‌نام با موفقیت انجام شد! حساب شما آماده ورود و تکمیل پرونده است.');
      }

      setLoginUsername(regPhone);
      setLoginPassword(regPassword);
      setRegFullName('');
      setRegPhone('');
      setRegPassword('');
      setTimeout(() => setAuthMode('login'), 2200);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data?.detail || 'این شماره موبایل قبلاً ثبت شده است.');
      } else {
        setError('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (phone: string, roleTitle: string) => {
    setLoginUsername(phone);
    setLoginPassword('123');
    handleLoginSubmit(undefined, phone, '123');
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000000' }}>
      
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

      <div 
        style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2,
          opacity: showForm ? 1 : 0,
          transform: showForm ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showForm ? 'auto' : 'none',
          direction: 'rtl',
          padding: '20px'
        }}
      >
        <div 
          className="bento-card"
          style={{ 
            width: '100%', maxWidth: '420px', 
            background: 'rgba(253, 251, 247, 0.94)',
            backdropFilter: 'blur(25px)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(230, 194, 135, 0.15)',
            padding: '30px 25px',
            textAlign: 'center',
            borderRadius: '20px',
            maxHeight: '94vh',
            overflowY: 'auto'
          }}
        >
          {onBackToLanding && (
            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={onBackToLanding}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0C1D3F',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.75
                }}
              >
                <span>← صفحه معرفی مدولا</span>
              </button>
            </div>
          )}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px' }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))' }} />
              </div>
            </div>
            <h1 style={{ color: '#0C1D3F', fontSize: '26px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>
              MEDULLA
            </h1>
            <p style={{ color: 'rgba(12, 29, 63, 0.65)', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
              پلتفرم جامع مدیریت و مشاوره تحصیلی مدولا
            </p>
            {invitedAdvisor && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid #10B981',
                borderRadius: '10px',
                padding: '8px 12px',
                marginTop: '10px',
                fontSize: '11px',
                color: '#065F46',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={15} color="#10B981" />
                <span>لینک دعوت مستقیم: <strong>{invitedAdvisor.full_name}</strong></span>
              </div>
            )}
          </div>

          {/* تب‌های جابجایی بین ورود و ثبت‌نام */}
          <div style={{ display: 'flex', background: 'rgba(12, 29, 63, 0.05)', borderRadius: '10px', padding: '4px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'login' ? '#0C1D3F' : 'transparent',
                color: authMode === 'login' ? '#E6C287' : '#0C1D3F'
              }}
            >
              ورود به سیستم
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'register' ? '#0C1D3F' : 'transparent',
                color: authMode === 'register' ? '#E6C287' : '#0C1D3F'
              }}
            >
              ثبت‌نام دانش‌آموز جدید
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px', border: '1px solid rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px', border: '1px solid rgba(16,185,129,0.3)' }}>
              {successMsg}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#0C1D3F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#0C1D3F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="رمز عبور"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 42px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', opacity: 0.6 }}
                >
                  {showPassword ? <EyeOff size={16} color="#0C1D3F" /> : <Eye size={16} color="#0C1D3F" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="gold-glow-btn"
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
                  color: '#0C1D3F', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : <><ArrowLeft size={16} /> ورود به پنل کاربری</>}
              </button>

              {/* دکمه‌های ورود سریع تستی برای تست هر ۴ بخش درخواستی کاربر */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed rgba(12,29,63,0.15)' }}>
                <span style={{ fontSize: '11px', color: 'rgba(12,29,63,0.6)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  ورود سریع آزمایشی (بدون نیاز به تایپ):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09910746198', 'مدیریت کل')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #0C1D3F', background: '#0C1D3F', color: '#E6C287', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <Shield size={12} /> مدیر کل و صاحب پلتفرم (09910746198)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09120000002', 'مدیر مؤسسه')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #C5A880', background: 'rgba(230,194,135,0.2)', color: '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <Building size={12} /> مدیر مؤسسات / آکادمی (09120000002)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09120000003', 'مشاور ارشد')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #C5A880', background: 'rgba(230,194,135,0.1)', color: '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <Award size={12} /> مشاور ارشد (09120000003)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09120000004', 'دانش‌آموز ۱ تجربی')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid rgba(12,29,63,0.2)', background: '#fff', color: '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <GraduationCap size={12} /> دانش‌آموز ۱ (09120000004)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09100341564', 'دانش‌آموز ۲ ریاضی')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid rgba(12,29,63,0.2)', background: '#fff', color: '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <GraduationCap size={12} /> دانش‌آموز ۲ (09100341564)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('09120000099', 'اولیا (والدین)')}
                    style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid var(--gold)', background: 'rgba(230,194,135,0.25)', color: '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  >
                    <HeartHandshake size={13} color="#C5A880" /> پنل اولیا (09120000099)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <UserPlus size={18} color="#0C1D3F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="نام و نام خانوادگی دانش‌آموز"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#0C1D3F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#0C1D3F" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="تعیین رمز عبور"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 42px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', opacity: 0.6 }}
                >
                  {showPassword ? <EyeOff size={16} color="#0C1D3F" /> : <Eye size={16} color="#0C1D3F" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: '#0C1D3F', color: '#E6C287', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : 'ثبت نام دانش‌آموز'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
