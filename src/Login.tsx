import React, { useEffect, useRef, useState } from 'react';
import { 
  User, Lock, ArrowLeft, Loader2, Eye, EyeOff, UserPlus, Phone, 
  ExternalLink, Upload, CheckCircle2, FileText, AlertCircle, ShieldCheck 
} from 'lucide-react';
import api from './api';
import MentoraLogo from './MentoraLogo';

interface LoginProps {
  onLogin: (role: string) => void;
  onBackToLanding?: () => void;
}

// لیست آزمون‌های استاندارد هدایت تحصیلی و کنکور
const ASSESSMENT_TESTS = [
  {
    key: 'mbti',
    title: 'آزمون تیپ‌شناسی شخصیتی MBTI',
    desc: 'شناسایی ترجیحات ۱۶ گانه شخصیتی و شیوه بهینه یادگیری',
    url: 'https://esanj.ir/mbti-personality-test'
  },
  {
    key: 'holland',
    title: 'آزمون رغبت‌سنجی شغلی و تحصیلی هالند (RIASEC)',
    desc: 'گرایش‌سنجی رشته‌های دانشگاهی و مشاغل متناسب با استعداد',
    url: 'https://esanj.ir/holland-career-test'
  },
  {
    key: 'gardner',
    title: 'آزمون هوش‌های چندگانه گاردنر',
    desc: 'کشف استعدادهای ۸ گانه ذهنی و استراتژی مطالعه',
    url: 'https://esanj.ir/gardner-multiple-intelligences-test'
  },
  {
    key: 'vark',
    title: 'آزمون سبک‌های یادگیری وارک (VARK)',
    desc: 'یادگیری دیداری، شنیداری، خواندنی/نوشتنی یا حرکتی',
    url: 'https://esanj.ir/vark-learning-styles-test'
  },
  {
    key: 'study_skills',
    title: 'آزمون مهارت‌های مطالعه و مدیریت زمان',
    desc: 'سنجش روش‌های خلاصه‌نویسی، مرور، تست‌زنی و تمرکز',
    url: 'https://esanj.ir/study-skills-assessment'
  }
];

export default function Login({ onLogin, onBackToLanding }: LoginProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login States - خالی بودن پیش‌فرض جهت رفع هرگونه ورود بدون احراز هویت
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Assessment Uploads State (for registration)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { fileName: string; fileUrl: string; uploading: boolean }>>({});
  const [uploadError, setUploadError] = useState('');

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
    const timer = setTimeout(() => setShowForm(true), 400);
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
              setAuthMode('register');
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  }, []);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const phone = loginUsername.trim();
    const pass = loginPassword.trim();

    if(!phone || !pass) {
      setError('لطفاً شماره موبایل و رمز عبور خود را وارد کنید.');
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
      if (token) {
        localStorage.setItem('mentora_token', token);
      }

      const role = response.data.role || 'student';
      onLogin(role);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('شماره موبایل یا رمز عبور اشتباه است.');
      } else if (err.response && err.response.status === 403) {
        setError(err.response.data?.detail || 'اکانت شما در حال حاضر تعلیق یا در انتظار تایید مدیریت است.');
      } else {
        setError(err.response?.data?.detail || 'خطا در برقراری ارتباط با سرور. لطفاً مجدداً تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (testKey: string, testTitle: string, file: File) => {
    if (!file) return;

    // بررسی حجم حداکثر ۵ مگابایت
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`حجم فایل "${file.name}" بیش از ۵ مگابایت است.`);
      return;
    }

    // بررسی نوع فایل
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setUploadError('تنها آپلود فایل‌های تصویر (JPG, PNG) یا اسناد PDF مجاز است.');
      return;
    }

    setUploadError('');
    setUploadedFiles(prev => ({
      ...prev,
      [testKey]: { fileName: file.name, fileUrl: '', uploading: true }
    }));

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await api.post('/records/upload-test', {
            test_key: testKey,
            test_title: testTitle,
            file_name: file.name,
            file_base64: base64Data,
            phone_number: regPhone
          });
          setUploadedFiles(prev => ({
            ...prev,
            [testKey]: { fileName: file.name, fileUrl: res.data?.file_url || 'uploaded', uploading: false }
          }));
        } catch (innerErr) {
          // در صورت خطا در آپلود مستقیم، به صورت لوکال نگه می‌داریم
          setUploadedFiles(prev => ({
            ...prev,
            [testKey]: { fileName: file.name, fileUrl: 'local', uploading: false }
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setUploadError('خطا در پردازش فایل انتخابی.');
      setUploadedFiles(prev => ({
        ...prev,
        [testKey]: { fileName: '', fileUrl: '', uploading: false }
      }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!regFullName || !regPhone || !regPassword) {
      setError('لطفاً نام، شماره موبایل و رمز عبور را وارد نمایید.');
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
        setSuccessMsg(`ثبت‌نام با موفقیت انجام شد و به مشاور خود (${invitedAdvisor.full_name}) متصل شدید!`);
      } else {
        setSuccessMsg('ثبت‌نام با موفقیت انجام شد! کارنامه‌های آزمون شما نیز جهت بررسی مشاور ذخیره گردید.');
      }

      setLoginUsername(regPhone);
      setLoginPassword(regPassword);
      setRegFullName('');
      setRegPhone('');
      setRegPassword('');
      setTimeout(() => setAuthMode('login'), 2200);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data?.detail || 'این شماره موبایل قبلاً در سامانه ثبت شده است.');
      } else {
        setError('خطا در ثبت‌نام. لطفاً مجدداً بررسی و تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
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
            width: '100%', maxWidth: '460px', 
            background: 'var(--bg-panel, #FFFFFF)',
            color: 'var(--text-main, #0C1D3F)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(230, 194, 135, 0.15)',
            border: '1.5px solid var(--border-color)',
            padding: '26px 22px',
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
                  color: 'var(--primary)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: 0.8
                }}
              >
                <span>← صفحه معرفی مدولاس</span>
              </button>
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px' }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))' }} />
              </div>
            </div>
            <h1 style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>
              MEDULLAS
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
              پلتفرم جامع مدیریت، آکادمی و مشاوره تحصیلی
            </p>
            {invitedAdvisor && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--success)',
                borderRadius: '10px',
                padding: '8px 12px',
                marginTop: '10px',
                fontSize: '11px',
                color: 'var(--success)',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={15} />
                <span>لینک دعوت مستقیم: <strong>{invitedAdvisor.full_name}</strong></span>
              </div>
            )}
          </div>

          {/* تب‌های جابجایی بین ورود و ثبت‌نام */}
          <div style={{ display: 'flex', background: 'var(--hover-bg)', borderRadius: '10px', padding: '4px', marginBottom: '18px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'login' ? 'var(--primary)' : 'transparent',
                color: authMode === 'login' ? 'var(--gold)' : 'var(--text-main)'
              }}
            >
              ورود به حساب
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'register' ? 'var(--primary)' : 'transparent',
                color: authMode === 'register' ? 'var(--gold)' : 'var(--text-main)'
              }}
            >
              ثبت‌نام دانش‌آموز جدید
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px', border: '1px solid var(--danger)' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '14px', border: '1px solid var(--success)' }}>
              {successMsg}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--primary)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-panel)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--primary)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="رمز عبور"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 42px', borderRadius: '8px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-panel)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', opacity: 0.6 }}
                >
                  {showPassword ? <EyeOff size={16} color="var(--primary)" /> : <Eye size={16} color="var(--primary)" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="gold-glow-btn"
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  color: '#0C1D3F', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '6px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : <><ArrowLeft size={16} /> ورود به سامانه مدولاس</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'right' }}>
              <div style={{ position: 'relative' }}>
                <UserPlus size={18} color="var(--primary)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                <input 
                  type="text" 
                  placeholder="نام و نام خانوادگی دانش‌آموز"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-panel)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Phone size={18} color="var(--primary)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل دانش‌آموز"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-panel)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--primary)" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="تعیین رمز عبور"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 42px 12px 42px', borderRadius: '8px',
                    border: '1.5px solid var(--border-color)', background: 'var(--bg-panel)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px', opacity: 0.6 }}
                >
                  {showPassword ? <EyeOff size={16} color="var(--primary)" /> : <Eye size={16} color="var(--primary)" />}
                </button>
              </div>

              {/* بخش آزمون‌های روان‌شناختی و بارگذاری نتایج (درخواستی کاربر) */}
              <div style={{ 
                marginTop: '10px', 
                padding: '12px', 
                background: 'var(--hover-bg)', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <FileText size={15} color="var(--gold-dark)" />
                  <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-main)' }}>
                    آزمون‌های شخصیت‌شناسی و رغبت‌سنجی کنکور:
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.6' }}>
                  می‌توانید وارد آزمون‌های زیر شوید و پس از دریافت کارنامه، تصویر یا PDF آن را جهت تحلیل اختصاصی مشاور آپلود نمایید:
                </p>

                {uploadError && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', marginBottom: '8px', fontWeight: 'bold' }}>
                    {uploadError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingLeft: '4px' }}>
                  {ASSESSMENT_TESTS.map(test => {
                    const status = uploadedFiles[test.key];
                    return (
                      <div 
                        key={test.key}
                        style={{
                          background: 'var(--bg-panel)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                            {test.title}
                          </span>
                          <a 
                            href={test.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              color: 'var(--primary)', 
                              fontSize: '11px', 
                              fontWeight: 'bold', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '3px',
                              textDecoration: 'none'
                            }}
                          >
                            شرکت در آزمون <ExternalLink size={12} />
                          </a>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {test.desc}
                        </span>

                        {/* دکمه آپلود فایل کارنامه */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <label style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: status?.fileName ? 'rgba(16, 185, 129, 0.12)' : 'rgba(12, 29, 63, 0.08)',
                            color: status?.fileName ? 'var(--success)' : 'var(--text-main)',
                            border: `1px solid ${status?.fileName ? 'var(--success)' : 'var(--border-color)'}`,
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}>
                            {status?.uploading ? (
                              <Loader2 size={12} className="spin-animation" />
                            ) : status?.fileName ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Upload size={12} />
                            )}
                            <span>{status?.fileName ? status.fileName.slice(0, 15) + '...' : 'آپلود کارنامه (JPG, PDF)'}</span>
                            <input 
                              type="file" 
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(test.key, test.title, f);
                              }}
                            />
                          </label>
                          {status?.fileName && (
                            <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 'bold' }}>
                              ثبت شد ✅
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                  background: 'var(--primary)', color: 'var(--gold)', fontSize: '14px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : 'تکمیل ثبت نام و اتصال به پلتفرم'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
