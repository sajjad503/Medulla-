import React, { useEffect, useRef, useState } from 'react';
import { User, Lock, ArrowLeft, Loader2, Eye, EyeOff, UserPlus, Phone } from 'lucide-react';
import axios from 'axios';
import MentoraLogo from './MentoraLogo'; 

function Login({ onLogin }) {
  const canvasRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Login States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register States
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const staticStars = Array.from({ length: 300 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      opacity: Math.random()
    }));

    const galaxyParticles = [];
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
    const timer = setTimeout(() => setShowForm(true), 1200);
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if(!loginUsername || !loginPassword) {
      setError('لطفاً شماره موبایل و رمز عبور را وارد کنید.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginUsername); 
      formData.append('password', loginPassword);

      const response = await axios.post('http://127.0.0.1:8000/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;
      localStorage.setItem('mentora_token', token);

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(window.atob(payloadBase64));
      
      onLogin(decodedPayload.role);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('نام کاربری یا رمز عبور اشتباه است.');
      } else if (err.response && err.response.status === 403) {
        setError('اکانت شما در حال حاضر تعلیق/تایید نشده است.');
      } else {
        setError('ارتباط با سرور برقرار نشد. بررسی کنید بک‌اند روشن باشد.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if(!regFullName || !regPhone || !regPassword) {
      setError('لطفاً تمامی فیلدها را پر کنید.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await axios.post('http://127.0.0.1:8000/auth/register', {
        workspace_id: 1,
        role: 'student', 
        full_name: regFullName,
        phone_number: regPhone,
        password: regPassword,
        custom_group: 'ثبت‌نام جدید (در انتظار تایید)',
        grade: 'نامشخص'
      });

      setSuccessMsg('ثبت‌نام موفقیت‌آمیز بود. منتظر تایید مدیر باشید.');
      // فرم ثبت‌نام پاک شده و به حالت لاگین برمی‌گردد
      setRegFullName('');
      setRegPhone('');
      setRegPassword('');
      setTimeout(() => setAuthMode('login'), 2000);

    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError('این شماره موبایل قبلاً ثبت شده است.');
      } else {
        setError('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
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
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: showForm ? 'auto' : 'none',
          direction: 'rtl'
        }}
      >
        <div 
          className="bento-card"
          style={{ 
            width: '90%', maxWidth: '380px', 
            background: 'rgba(253, 251, 247, 0.92)',
            backdropFilter: 'blur(25px)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(230, 194, 135, 0.1)',
            padding: '35px 30px',
            textAlign: 'center',
            borderRadius: '16px'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <MentoraLogo style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))' }} />
            </div>
            <h1 style={{ color: '#0C1D3F', fontSize: '28px', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>
              MENTORA
            </h1>
            <p style={{ color: 'rgba(12, 29, 63, 0.6)', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>
              پلتفرم جامع مدیریت و برنامه‌ریزی
            </p>
          </div>

          {/* تب‌های جابجایی بین ورود و ثبت‌نام */}
          <div style={{ display: 'flex', background: 'rgba(12, 29, 63, 0.05)', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'login' ? '#0C1D3F' : 'transparent',
                color: authMode === 'login' ? '#E6C287' : '#0C1D3F'
              }}
            >
              ورود
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 'bold', transition: '0.3s',
                background: authMode === 'register' ? '#0C1D3F' : 'transparent',
                color: authMode === 'register' ? '#E6C287' : '#0C1D3F'
              }}
            >
              ثبت‌نام دانش‌آموز
            </button>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
              {successMsg}
            </div>
          )}

          {authMode === 'login' ? (
            /* =================== فرم لاگین =================== */
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#0C1D3F" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 45px 14px 15px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#0C1D3F" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="رمز عبور"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 45px 14px 45px', borderRadius: '8px',
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
                  {showPassword ? <EyeOff size={18} color="#0C1D3F" /> : <Eye size={18} color="#0C1D3F" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="gold-glow-btn"
                style={{
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
                  color: '#0C1D3F', fontSize: '15px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : <><ArrowLeft size={18} /> ورود به پنل کاربری</>}
              </button>
            </form>
          ) : (
            /* =================== فرم ثبت‌نام =================== */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <UserPlus size={18} color="#0C1D3F" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="نام و نام خانوادگی دانش‌آموز"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 45px 14px 15px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Phone size={18} color="#0C1D3F" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="شماره موبایل"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 45px 14px 15px', borderRadius: '8px',
                    border: '1.5px solid rgba(12, 29, 63, 0.15)', background: '#FFFFFF',
                    color: '#0C1D3F', fontSize: '14px', fontWeight: 'bold', outline: 'none', transition: '0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#C5A880'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(12, 29, 63, 0.15)'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#0C1D3F" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="تعیین رمز عبور"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 45px 14px 45px', borderRadius: '8px',
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
                  {showPassword ? <EyeOff size={18} color="#0C1D3F" /> : <Eye size={18} color="#0C1D3F" />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                  background: '#0C1D3F', color: '#E6C287', fontSize: '15px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : 'ثبت‌نام'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;