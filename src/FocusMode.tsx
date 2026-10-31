import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, 
  Flame, Wind, Waves, Activity, Eye, Coffee, PowerOff,
  Settings, Check, Sliders, Trees, Music, Sparkles, Bell
} from 'lucide-react';

interface FocusModeProps {
  onExit: () => void;
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export default function FocusMode({ onExit }: FocusModeProps) {
  // Pomodoro Settings
  const [workDuration, setWorkDuration] = useState(() => {
    return parseInt(localStorage.getItem('mentora_pomo_work') || '25', 10);
  });
  const [shortBreakDuration, setShortBreakDuration] = useState(() => {
    return parseInt(localStorage.getItem('mentora_pomo_short') || '5', 10);
  });
  const [longBreakDuration, setLongBreakDuration] = useState(() => {
    return parseInt(localStorage.getItem('mentora_pomo_long') || '15', 10);
  });
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);

  // Runtime State
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.4);

  // Micro Break Modal
  const [showBreakAlert, setShowBreakAlert] = useState(false);
  const [currentBreakIdea, setCurrentBreakIdea] = useState<any>(null);

  // Audio Context Ref
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  const breakIdeas = [
    { title: 'قانون ۲۰-۲۰-۲۰ (استراحت چشم)', desc: 'به یک جسم در فاصله ۶ متری برای ۲۰ ثانیه خیره شو تا عضلات چشمت ریلکس بشن.', icon: <Eye size={36} color="var(--gold)" /> },
    { title: 'کشش گردن و شانه', desc: 'شونه‌هات رو بنداز پایین، گردنت رو به آرومی به چپ و راست خم کن.', icon: <Activity size={36} color="#38bdf8" /> },
    { title: 'نوشیدن آب و تنفس عمیق', desc: 'یک لیوان آب خنک بنوش و ۴ شماره نفس بکش، ۴ شماره نگه دار، و ۴ شماره بازدم کن.', icon: <Coffee size={36} color="#4ade80" /> }
  ];

  useEffect(() => {
    const t = setTimeout(() => setIsFadingIn(false), 200);
    return () => clearTimeout(t);
  }, []);

  // Update timer on duration change if stopped
  useEffect(() => {
    if (!isRunning) {
      if (mode === 'work') setTimeLeft(workDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
      else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
    }
  }, [workDuration, shortBreakDuration, longBreakDuration, mode]);

  // Main countdown loop
  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Update gain node volume dynamically
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.setValueAtTime(soundVolume * 0.15, audioCtxRef.current.currentTime);
      } catch (_) {}
    }
  }, [soundVolume]);

  const handleTimerComplete = () => {
    playNotificationChime();
    setIsRunning(false);

    if (mode === 'work') {
      const nextCycle = currentCycle + 1;
      if (currentCycle % cyclesBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
      setCurrentCycle(nextCycle);
      setCurrentBreakIdea(breakIdeas[Math.floor(Math.random() * breakIdeas.length)]);
      setShowBreakAlert(true);
      if (autoStartBreaks) setIsRunning(true);
    } else {
      // Finished break, back to work
      setMode('work');
      setTimeLeft(workDuration * 60);
      setShowBreakAlert(false);
      if (autoStartBreaks) setIsRunning(true);
    }
  };

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    setShowBreakAlert(false);
    if (newMode === 'work') setTimeLeft(workDuration * 60);
    else if (newMode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (newMode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const resetCurrentTimer = () => {
    setIsRunning(false);
    if (mode === 'work') setTimeLeft(workDuration * 60);
    else if (mode === 'shortBreak') setTimeLeft(shortBreakDuration * 60);
    else if (mode === 'longBreak') setTimeLeft(longBreakDuration * 60);
  };

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const getTotalDurationForCurrentMode = () => {
    if (mode === 'work') return workDuration * 60;
    if (mode === 'shortBreak') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  const progressFraction = Math.max(0, Math.min(1, 1 - (timeLeft / getTotalDurationForCurrentMode())));

  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + (index * 0.12));
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + (index * 0.12) + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (index * 0.12) + 1.2);
        
        osc.start(ctx.currentTime + (index * 0.12));
        osc.stop(ctx.currentTime + (index * 0.12) + 1.3);
      });
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Ambient procedural sound synthesizer
  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (_) {}
      audioCtxRef.current = null;
    }
    soundNodesRef.current = [];
    setActiveSound(null);
  };

  const toggleSound = (soundType: string) => {
    if (activeSound === soundType) {
      stopAmbientSound();
      return;
    }
    stopAmbientSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(soundVolume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      if (soundType === 'alpha') {
        // Binaural 432Hz focus frequency
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        oscLeft.type = 'sine';
        oscRight.type = 'sine';
        oscLeft.frequency.value = 432;
        oscRight.frequency.value = 442; // 10Hz alpha difference

        oscLeft.connect(masterGain);
        oscRight.connect(masterGain);
        oscLeft.start();
        oscRight.start();
        soundNodesRef.current = [oscLeft, oscRight];
      } else {
        // High quality filtered noise synthesis for Rain, White Noise, Brown Noise, Waves, Fire, Forest
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (soundType === 'brown' || soundType === 'ocean') {
            // Brown / Pink integrated noise
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          } else {
            data[i] = white;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();

        if (soundType === 'rain') {
          // Rain: low-pass with subtle secondary resonant filter
          filter.type = 'lowpass';
          filter.frequency.value = 850;
          noise.connect(filter);
          filter.connect(masterGain);
        } else if (soundType === 'ocean') {
          // Ocean waves: LFO modulation
          filter.type = 'lowpass';
          filter.frequency.value = 500;

          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.15; // 6-7 second wave surge
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 350;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          lfo.start();

          noise.connect(filter);
          filter.connect(masterGain);
          soundNodesRef.current.push(lfo);
        } else if (soundType === 'fire') {
          // Fireplace crackle
          filter.type = 'bandpass';
          filter.frequency.value = 950;
          filter.Q.value = 2.0;
          noise.connect(filter);
          filter.connect(masterGain);
        } else if (soundType === 'forest') {
          // Forest wind & ambience
          filter.type = 'bandpass';
          filter.frequency.value = 1200;
          noise.connect(filter);
          filter.connect(masterGain);
        } else {
          // Soothing white noise
          filter.type = 'lowpass';
          filter.frequency.value = 2500;
          noise.connect(filter);
          filter.connect(masterGain);
        }

        noise.start();
        soundNodesRef.current.push(noise);
      }

      setActiveSound(soundType);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  };

  const handleExit = () => {
    stopAmbientSound();
    onExit();
  };

  const soundOptions = [
    { id: 'rain', label: 'باران بهاری', icon: <CloudRain size={18} /> },
    { id: 'white', label: 'نویز سفید', icon: <Wind size={18} /> },
    { id: 'brown', label: 'نویز قهوه‌ای عمیق', icon: <Sparkles size={18} /> },
    { id: 'ocean', label: 'امواج آرام دریا', icon: <Waves size={18} /> },
    { id: 'fire', label: 'شومینه آرام', icon: <Flame size={18} /> },
    { id: 'forest', label: 'طبیعت و جنگل', icon: <Trees size={18} /> },
    { id: 'alpha', label: 'امواج ۴۳۲Hz آلفا', icon: <Activity size={18} /> },
  ];

  // Circle dimensions for SVG progress ring
  const circleRadius = 140;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressFraction * circumference);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at center, #0a1329 0%, #030611 100%)',
      zIndex: 99999, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', color: '#fff',
      opacity: isFadingIn ? 0 : 1, transition: 'opacity 0.4s ease',
      direction: 'rtl'
    }}>
      
      {/* دکمه‌های کنترل بالا (خروج و تنظیمات) */}
      <div style={{
        position: 'absolute', top: '24px', left: '24px', right: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
      }}>
        <button 
          onClick={handleExit}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.8)',
            padding: '10px 20px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
        >
          <PowerOff size={16} /> خروج از حالت تمرکز
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: showSettings ? 'var(--gold)' : 'rgba(255,255,255,0.06)',
            color: showSettings ? '#0C1D3F' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '10px 18px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          <Settings size={16} />
          شخصی‌سازی پومودورو
        </button>
      </div>

      {/* مدال کشویی تنظیمات پومودورو */}
      {showSettings && (
        <div style={{
          position: 'absolute', top: '80px', left: '24px',
          background: 'rgba(12, 29, 63, 0.95)',
          border: '1px solid var(--gold)',
          borderRadius: '20px',
          padding: '24px',
          width: '320px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          zIndex: 50,
          backdropFilter: 'blur(15px)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--gold)', fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} /> تنظیمات تایمر پومودورو
            </h4>
            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.8)' }}>
                زمان پارت مطالعه (دقیقه):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[25, 45, 50, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setWorkDuration(m);
                      localStorage.setItem('mentora_pomo_work', String(m));
                    }}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '8px',
                      background: workDuration === m ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                      color: workDuration === m ? '#0C1D3F' : '#fff',
                      border: 'none', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.8)' }}>
                استراحت کوتاه (دقیقه):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[5, 10, 15].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setShortBreakDuration(m);
                      localStorage.setItem('mentora_pomo_short', String(m));
                    }}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '8px',
                      background: shortBreakDuration === m ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                      color: shortBreakDuration === m ? '#0C1D3F' : '#fff',
                      border: 'none', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.8)' }}>
                استراحت طولانی (دقیقه):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[15, 20, 30].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setLongBreakDuration(m);
                      localStorage.setItem('mentora_pomo_long', String(m));
                    }}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '8px',
                      background: longBreakDuration === m ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                      color: longBreakDuration === m ? '#0C1D3F' : '#fff',
                      border: 'none', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span>شروع خودکار استراحت‌ها</span>
              <input 
                type="checkbox" 
                checked={autoStartBreaks} 
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* مودهای پومودورو: کار / استراحت کوتاه / استراحت بلند */}
      <div style={{
        display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)',
        padding: '6px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '28px', backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => switchMode('work')}
          style={{
            background: mode === 'work' ? 'var(--gold)' : 'transparent',
            color: mode === 'work' ? '#0C1D3F' : 'rgba(255,255,255,0.7)',
            border: 'none', padding: '8px 20px', borderRadius: '40px',
            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          مطالعه و تمرکز ({workDuration}m)
        </button>

        <button
          onClick={() => switchMode('shortBreak')}
          style={{
            background: mode === 'shortBreak' ? '#38bdf8' : 'transparent',
            color: mode === 'shortBreak' ? '#0C1D3F' : 'rgba(255,255,255,0.7)',
            border: 'none', padding: '8px 18px', borderRadius: '40px',
            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          استراحت کوتاه ({shortBreakDuration}m)
        </button>

        <button
          onClick={() => switchMode('longBreak')}
          style={{
            background: mode === 'longBreak' ? '#4ade80' : 'transparent',
            color: mode === 'longBreak' ? '#0C1D3F' : 'rgba(255,255,255,0.7)',
            border: 'none', padding: '8px 18px', borderRadius: '40px',
            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          استراحت طولانی ({longBreakDuration}m)
        </button>
      </div>

      {/* دور پومودورو */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
          دور {currentCycle} از {cyclesBeforeLongBreak} پومودورو:
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4].map(c => {
            const isCompleted = ((currentCycle - 1) % cyclesBeforeLongBreak) >= c;
            const isCurrent = ((currentCycle - 1) % cyclesBeforeLongBreak) + 1 === c;
            return (
              <div
                key={c}
                style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: isCompleted ? 'var(--gold)' : isCurrent ? 'rgba(230, 194, 135, 0.4)' : 'rgba(255,255,255,0.15)',
                  border: isCurrent ? '2px solid var(--gold)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* حلقه پیشرفت زمان و تایمر بزرگ */}
      <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
        <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
          {/* پس‌زمینه حلقه */}
          <circle
            cx="160" cy="160" r={circleRadius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* حلقه متحرک پیشرفت */}
          <circle
            cx="160" cy="160" r={circleRadius}
            fill="none"
            stroke={mode === 'work' ? '#E6C287' : mode === 'shortBreak' ? '#38bdf8' : '#4ade80'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>

        <div style={{ textAlign: 'center', zIndex: 2 }}>
          <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '68px',
            fontWeight: 'bold',
            letterSpacing: '4px',
            color: mode === 'work' ? (isRunning ? '#E6C287' : '#fff') : '#38bdf8',
            textShadow: isRunning ? '0 0 30px rgba(230, 194, 135, 0.35)' : 'none',
            userSelect: 'none'
          }}>
            {formatTime()}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: 'bold' }}>
            {mode === 'work' ? 'تمرکز کامل و حذف عوامل حواس‌پرتی' : 'زنگ تنفس و شارژ مجدد ذهن'}
          </div>
        </div>
      </div>

      {/* کنترل‌های شروع / توقف / ریست */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '36px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          style={{
            background: isRunning ? 'rgba(255,255,255,0.1)' : 'var(--gold)',
            color: isRunning ? '#fff' : '#0C1D3F',
            border: isRunning ? '1px solid rgba(255,255,255,0.2)' : 'none', 
            padding: '16px 42px',
            borderRadius: '50px',
            fontSize: '17px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: isRunning ? 'none' : '0 10px 25px rgba(230, 194, 135, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {isRunning ? <><Pause size={22} /> توقف موقت</> : <><Play size={22} /> شروع تمرکز</>}
        </button>

        <button 
          onClick={resetCurrentTimer}
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '16px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.2s'
          }}
          title="شروع مجدد این پارت"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* پنل اصوات محیطی آرامش‌بخش */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        padding: '18px 28px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '720px',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={16} color="var(--gold)" />
            اصوات محیطی آرامش‌بخش و متمرکزکننده ذهن (Web Audio):
          </span>

          {/* اسلایدر تنظیم بلندی صدا */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ولوم:</span>
            <input 
              type="range" 
              min="0.05" 
              max="1" 
              step="0.05" 
              value={soundVolume}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              style={{ width: '80px', cursor: 'pointer', accentColor: 'var(--gold)' }}
            />
            {activeSound && (
              <button 
                onClick={stopAmbientSound}
                style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
              >
                قطع صدا
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {soundOptions.map(sound => {
            const isActive = activeSound === sound.id;
            return (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                style={{
                  background: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#0C1D3F' : 'rgba(255,255,255,0.7)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                  padding: '9px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 0 15px rgba(230, 194, 135, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {sound.icon}
                {sound.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* مدال زنگ تفریح و ایده استراحت */}
      {showBreakAlert && currentBreakIdea && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(12, 29, 63, 0.98)',
          border: '2px solid var(--gold)',
          borderRadius: '24px',
          padding: '30px',
          width: '90%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          zIndex: 999,
          backdropFilter: 'blur(20px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ marginBottom: '14px' }}>{currentBreakIdea.icon}</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--gold)', fontSize: '20px' }}>زنگ تفریح فعال شد! 🔔</h3>
          <h4 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '15px' }}>{currentBreakIdea.title}</h4>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', marginBottom: '24px' }}>
            {currentBreakIdea.desc}
          </p>
          <button 
            onClick={() => setShowBreakAlert(false)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
              color: '#0C1D3F',
              fontSize: '14px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            شروع استراحت و ریلکسیشن
          </button>
        </div>
      )}

    </div>
  );
}
