import React, { useState, useEffect } from 'react';
import { 
  FileText, Save, RefreshCw, Timer, Play, Pause, RotateCcw, 
  BellRing, Trash2, X
} from 'lucide-react';

function AnswerSheet() {
  const [answers, setAnswers] = useState({});
  
  // استیت مربوط به نمایش مودال اختصاصی پاک کردن فرم
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- استیت‌های مربوط به تایمر تست زمان‌دار ---
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const boxes = Array.from({ length: 10 }, (_, boxIndex) => {
    return Array.from({ length: 10 }, (_, qIndex) => boxIndex * 10 + qIndex + 1);
  });

  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      [0, 0.35, 0.7, 1.05].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.25);
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsTimeUp(true);
      playAlarmSound();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSetTime = (mins) => {
    setIsRunning(false);
    setIsTimeUp(false);
    setTimerMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formattedMins = mins < 10 ? '0' + mins : mins;
    const formattedSecs = secs < 10 ? '0' + secs : secs;
    return formattedMins + ':' + formattedSecs;
  };

  const handleOptionSelect = (questionNum, optionNum) => {
    setAnswers(prev => ({
      ...prev,
      [questionNum]: optionNum
    }));
  };

  // تابعی که دکمه تایید نهایی در مودال آن را صدا می‌زند
  const executeClearForm = () => {
    setAnswers({});
    setIsTimeUp(false);
    setShowConfirmModal(false); // بستن مودال بعد از پاک کردن
  };

  return (
    <div className="panel" style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative' }}>
      
      {/* ---------------- مودال اختصاصی پاک کردن فرم ---------------- */}
      {showConfirmModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(12, 29, 63, 0.85)', zIndex: 9999, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' 
        }}>
          <div style={{ 
            background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px', 
            width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--gold)', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-out' 
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '50%' }}>
                <Trash2 size={36} color="var(--danger)" />
              </div>
            </div><h3 style={{ color: 'var(--primary)', marginBottom: '10px', fontSize: '20px' }}>پاک کردن پاسخبرگ</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px', lineHeight: '1.6' }}>
              آیا مطمئن هستید که می‌خواهید کل پاسخ‌های این فرم را پاک کنید؟ این کار قابل بازگشت نیست و تمام تست‌های زده شده حذف می‌شوند.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="btn" 
                style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '12px' }}
              >
                <X size={18} /> انصراف
              </button>
              <button 
                onClick={executeClearForm} 
                className="btn" 
                style={{ flex: 1, background: 'var(--danger)', color: '#fff', border: 'none', padding: '12px' }}
              >
                <Trash2 size={18} /> بله، پاک شود
              </button>
            </div>
            
          </div>
        </div>
      )}
      {/* ---------------- پایان مودال ---------------- */}


      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={24} color="var(--primary)" /> پاسخبرگ دیجیتال و تست زمان‌دار
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* به جای پاک کردن مستقیم، حالا فقط مودال را باز می‌کنیم */}
          <button 
            onClick={() => setShowConfirmModal(true)} 
            className="btn" 
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 15px', fontSize: '13px', color: 'var(--text-muted)' }}
          >
            <RefreshCw size={16} /> پاک کردن فرم
          </button>
          
          <button 
            className="btn btn-primary" 
            style={{ padding: '8px 15px', fontSize: '13px' }}
            onClick={() => alert('پاسخ‌های شما موقتاً در سیستم ثبت شد.')}
          >
            <Save size={16} /> ثبت پاسخ‌ها
          </button>
        </div>
      </div>

      <div style={{ 
        background: isTimeUp ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
        border: isTimeUp ? '2px solid var(--danger)' : '1px solid var(--border-color)', 
        padding: '20px', 
        borderRadius: '15px', 
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        transition: 'all 0.3s ease'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>
            <Timer size={20} color="var(--gold-dark)" /> زمان تست:
          </div>

          {[10, 15, 20, 30, 45].map(mins => (
            <button
              key={mins}
              onClick={() => handleSetTime(mins)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: timerMinutes === mins ? 'var(--gold)' : 'var(--bg-panel)',
                color: timerMinutes === mins ? '#000' : 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {mins} دقیقه
            </button>
          ))}<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="number"
            min="1"
            max="180"
            value={timerMinutes}
            onChange={(e) => handleSetTime(Number(e.target.value))}
            style={{ width: '55px', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', outline: 'none', background: 'var(--bg-panel)' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>دقیقه دستی</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          letterSpacing: '2px', 
          color: isTimeUp ? 'var(--danger)' : (isRunning ? 'var(--primary)' : 'var(--text-muted)'),
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isTimeUp && <BellRing size={28} color="var(--danger)" style={{ animation: 'bounce 0.5s infinite' }} />}
          {formatTime()}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => { setIsTimeUp(false); setIsRunning(!isRunning); }}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            {isRunning ? <><Pause size={16} /> توقف</> : <><Play size={16} /> شروع آزمون</>}
          </button>
          <button 
            onClick={() => handleSetTime(timerMinutes)}
            className="btn"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '8px 12px' }}
            title="تنظیم مجدد"
          >
            <RotateCcw size={16} color="var(--text-main)" />
          </button>
        </div>
      </div>

    </div>

    <div style={{ background: 'var(--bg-main)', padding: '25px', borderRadius: '15px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', direction: 'ltr' }}>
        
        {boxes.map((box, idx) => (
          <div key={idx} style={{ direction: 'rtl', background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '2px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ width: '35px' }}></span>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1, 2, 3, 4].map(num => (
                  <span key={num} style={{ width: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold' }}>
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {box.map(q => (
                <div key={q} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)', width: '35px', fontSize: '14px', textAlign: 'right' }}>
                    {q}-
                  </span>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[1, 2, 3, 4].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect(q, opt)}
                        style={{width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: answers[q] === opt ? 'none' : '2px solid var(--border-color)',
                        background: answers[q] === opt ? 'var(--primary)' : 'var(--bg-main)',
                        color: answers[q] === opt ? '#fff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        transform: answers[q] === opt ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: answers[q] === opt ? '0 4px 10px rgba(12, 29, 63, 0.3)' : 'none'
                      }}
                    >
                      {!answers[q] && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--border-color)' }}></span>}
                    </button>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      ))}

    </div>
  </div>

</div>
);
}

export default AnswerSheet;