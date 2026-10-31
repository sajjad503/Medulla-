import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, CloudRain, 
  Flame, Wind, Waves, Activity, Eye, Coffee, PowerOff
} from 'lucide-react';

function FocusMode({ onExit }) {
  const [minutes, setMinutes] = useState(25);
  const [customMin, setCustomMin] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(true); // برای انیمیشن ورود نرم
  
  const [showBreak, setShowBreak] = useState(false);
  const [currentBreak, setCurrentBreak] = useState(null);

  const [activeSound, setActiveSound] = useState(null);
  const audioCtxRef = useRef(null);

  const breakIdeas = [
    { title: 'قانون ۲۰-۲۰-۲۰ (استراحت چشم)', desc: 'به یک جسم در فاصله ۶ متری برای ۲۰ ثانیه خیره شو.', icon: <Eye size={40} color="var(--primary)" /> },
    { title: 'کشش گردن و شانه', desc: 'شونه‌هات رو بنداز پایین، گردنت رو به آرومی به چپ و راست خم کن.', icon: <Activity size={40} color="var(--warning)" /> },
    { title: 'نوشیدن آب', desc: 'یک لیوان آب بنوش و چند تا نفس عمیق بکش.', icon: <Coffee size={40} color="var(--success)" /> }
  ];

  // افکت ورود به صفحه (سیاه شدن نرم)
  useEffect(() => {
    setTimeout(() => setIsFadingIn(false), 800);
  }, []);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCurrentBreak(breakIdeas[Math.floor(Math.random() * breakIdeas.length)]);
      setShowBreak(true);
      playAlarm();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSetTime = (mins) => {
    if (!mins || mins <= 0) return;
    setIsRunning(false);
    setMinutes(mins);
    setTimeLeft(mins * 60);
    setShowBreak(false);
    setCustomMin('');
  };

  // فرمت زمان با فونت ثابت (Monospace)
  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const formattedM = m < 10 ? '0' + m : m;
    const formattedS = s < 10 ? '0' + s : s;
    return `${formattedM}:${formattedS}`;
  };

  const playAlarm = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) { console.error(e); }
  };

  // موتور صوتی پیشرفته برای تولید فرکانس‌ها و صداها
  const toggleSound = (soundType) => {
    if (activeSound === soundType) {
      if (audioCtxRef.current) audioCtxRef.current.close();
      setActiveSound(null);
      return;
    }
    if (audioCtxRef.current) audioCtxRef.current.close();
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (soundType === 'alpha') {
      // تولید فرکانس آلفا (Binaural Beats) با دو موج سینوسی
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 200; // گوش چپ
      osc2.frequency.value = 210; // گوش راست (اختلاف ۱۰ هرتز = موج آلفا)
      gain.gain.value = 0.1;
      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start();
      osc2.start();
    } else {
      // تولید نویز سفید برای باران، شومینه و اقیانوس
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1; 

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (soundType === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        gain.gain.value = 0.08;
      } else if (soundType === 'fire') {
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        gain.gain.value = 0.1;
      } else if (soundType === 'ocean') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.value = 0.05;
        // شبیه‌سازی موج با LFO
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // سرعت رفت و برگشت موج
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
      } else { // noise
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        gain.gain.value = 0.03;
      }

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
    }
    
    setActiveSound(soundType);
  };

  const handleExit = () => {
    if (audioCtxRef.current) audioCtxRef.current.close();
    onExit();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(circle at center, #0a1128 0%, #02040a 100%)', // پس‌زمینه عمیق‌تر
      zIndex: 99999, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', color: '#fff',
      opacity: isFadingIn ? 0 : 1, transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)' // انیمیشن ورود بسیار نرم
    }}>
      
      {/* دکمه خروج */}
      <button 
        onClick={handleExit}
        style={{
          position: 'absolute', top: '30px', left: '30px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '10px 20px',
          borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
          backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#fff'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        <PowerOff size={16} /> خروج از تمرکز
      </button>

      {/* پاپ‌آپ میکرو-بریک */}
      {showBreak && currentBreak && (
        <div style={{
          position: 'absolute', top: '20%', background: 'rgba(255,255,255,0.95)',
          color: '#000', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', zIndex: 10,
          animation: 'bounce 0.5s ease-out'
        }}>
          <div style={{ marginBottom: '15px' }}>{currentBreak.icon}</div>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>زنگ تفریح میکرو!</h3>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--gold-dark)' }}>{currentBreak.title}</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
            {currentBreak.desc}
          </p>
          <button 
            onClick={() => handleSetTime(minutes)} 
            className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            آماده‌ام برای پارت بعدی!
          </button>
        </div>
      )}

      {/* تایمر غول‌پیکر با فونت ثابت */}
      <div style={{ 
        fontFamily: "'Courier New', Courier, monospace", // جلوگیری از لرزش اعداد
        fontSize: '130px', fontWeight: 'bold', letterSpacing: '8px', 
        textShadow: isRunning ? '0 0 40px rgba(230, 194, 135, 0.4)' : '0 10px 30px rgba(0,0,0,0.5)', 
        marginBottom: '40px', opacity: showBreak ? 0.1 : 1, transition: 'all 0.5s ease',
        color: isRunning ? 'var(--gold)' : '#fff', userSelect: 'none'
      }}>
        {formatTime()}
      </div>

      {/* دکمه‌های کنترل تایمر */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '60px', opacity: showBreak ? 0.1 : 1, transition: '0.3s' }}>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? 'rgba(255,255,255,0.1)' : 'var(--gold)',
            color: isRunning ? '#fff' : '#000', border: isRunning ? '1px solid rgba(255,255,255,0.2)' : 'none', 
            padding: '16px 45px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease',
            boxShadow: isRunning ? 'none' : '0 10px 25px rgba(230, 194, 135, 0.3)'
          }}
        >
          {isRunning ? <><Pause size={24} /> توقف</> : <><Play size={24} /> شروع تمرکز عمیق</>}
        </button>
        <button 
          onClick={() => handleSetTime(minutes)}
          style={{
            background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
            padding: '16px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="ریست تایمر"
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* تنظیم زمان و پلی‌لیست متمرکز */}
      <div style={{ 
        display: 'flex', gap: '50px', background: 'rgba(255,255,255,0.02)', 
        padding: '25px 50px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)', flexWrap: 'wrap', justifyContent: 'center', opacity: showBreak ? 0.1 : 1, transition: '0.3s'
      }}>
        
        {/* پنل تنظیم زمان دستی و پیش‌فرض */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '3px' }}>تنظیم زمان مطالعه</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[25, 45, 60].map(m => (
              <button key={m} onClick={() => handleSetTime(m)} style={{
                background: minutes === m ? 'rgba(230, 194, 135, 0.15)' : 'transparent',
                color: minutes === m ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${minutes === m ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: '0.2s'
              }}>
                {m}m
              </button>
            ))}
            
            {/* ورودی زمان دستی */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '2px', marginLeft: '10px' }}>
              <input 
                type="number" placeholder="دستی" 
                value={customMin} onChange={(e) => setCustomMin(e.target.value)}
                style={{ width: '50px', background: 'transparent', border: 'none', color: '#fff', textAlign: 'center', outline: 'none', padding: '6px' }}
              />
              <button 
                onClick={() => handleSetTime(parseInt(customMin))}
                style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                ثبت
              </button>
            </div>
          </div>
        </div>

        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

        {/* پنل پلی‌لیست صوتی */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={14} /> پلی‌لیست ایزوله‌سازی ذهن
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { id: 'alpha', icon: <Activity size={18} />, label: 'فرکانس آلفا' },
              { id: 'ocean', icon: <Waves size={18} />, label: 'موج دریا' },
              { id: 'rain', icon: <CloudRain size={18} />, label: 'باران' },
              { id: 'fire', icon: <Flame size={18} />, label: 'شومینه' },
              { id: 'noise', icon: <Wind size={18} />, label: 'نویز سفید' }
            ].map(sound => (
              <button 
                key={sound.id} onClick={() => toggleSound(sound.id)} title={sound.label}
                style={{
                  background: activeSound === sound.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)', 
                  color: activeSound === sound.id ? '#000' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${activeSound === sound.id ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: activeSound === sound.id ? '0 0 15px rgba(230, 194, 135, 0.4)' : 'none'
                }}
              >
                {sound.icon}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FocusMode;