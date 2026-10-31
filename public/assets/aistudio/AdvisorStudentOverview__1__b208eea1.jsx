import React, { useState } from 'react';
import { Edit, Target, Layers, Bug, Mic, PhoneCall, Columns, Download, Lock, Plus, Trash2, Send, Clock, X } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

function AdvisorStudentOverview({ studentName, onNavigateToPlan, onScheduleMeeting }) {
  const [secretNote, setSecretNote] = useState("Warning: درگیر حواشی مدرسه است.\nAction: با مادرش صحبت شد تا گوشی ساعت ۲۲ تحویل گرفته شود.");
  const [showSandbox, setShowSandbox] = useState(false);
  const [compareName, setCompareName] = useState('نغمه');

  const [frogs, setFrogs] = useState([
    { id: 1, text: 'ژنتیک جمعیت (زیست دوازدهم)', delays: 2 },
    { id: 2, text: 'مسائل سینتیک (شیمی یازدهم)', delays: 3 }
  ]);
  const [newFrog, setNewFrog] = useState('');

  // استیت‌های تاریخ و ساعت جلسه
  const [nextMeetingDateObj, setNextMeetingDateObj] = useState(null);
  const [nextMeetingDateStr, setNextMeetingDateStr] = useState('');
  
  // استیت ساعت دایره‌ای در پروفایل
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockMode, setClockMode] = useState('hour');
  const [clockHour, setClockHour] = useState(12);
  const [clockMinute, setClockMinute] = useState(0);
  const [clockAmPm, setClockAmPm] = useState('AM');
  const [finalSelectedTime, setFinalSelectedTime] = useState('');

  const addFrog = () => {
    if (newFrog.trim()) {
      setFrogs([...frogs, { id: Date.now(), text: newFrog, delays: 0 }]);
      setNewFrog('');
    }
  };

  const removeFrog = (id) => {
    setFrogs(frogs.filter(f => f.id !== id));
  };

  // رندر ساعت دایره‌ای
  const renderClockNumbers = () => {
    const isHour = clockMode === 'hour';
    const items = isHour ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const radius = 95;
    return items.map((num, i) => {
      const angle = (i * 30) - 90; 
      const x = 125 + radius * Math.cos(angle * Math.PI / 180) - 15;
      const y = 125 + radius * Math.sin(angle * Math.PI / 180) - 15;
      const isSelected = isHour ? clockHour === num : clockMinute === num;

      return (
        <div 
          key={num}
          onClick={() => {
            if (isHour) { setClockHour(num); setClockMode('minute'); }
            else { setClockMinute(num); }
          }}
          style={{
            position: 'absolute', left: `${x}px`, top: `${y}px`,
            width: '30px', height: '30px', borderRadius: '50%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: isSelected ? '#C5A880' : 'transparent',
            color: isSelected ? '#0C1D3F' : '#FDFBF7',
            fontWeight: 'bold', fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s ease', zIndex: 2
          }}
        >
          {num === 0 ? '00' : num}
        </div>
      );
    });
  };

  const handleClockSubmit = () => {
    const displayH = String(clockHour === 12 && clockAmPm === 'AM' ? 0 : clockHour !== 12 && clockAmPm === 'PM' ? clockHour + 12 : clockHour).padStart(2, '0');
    const displayM = String(clockMinute).padStart(2, '0');
    setFinalSelectedTime(`${displayH}:${displayM} ${clockAmPm}`);
    setShowClockModal(false);
  };

  const handleScheduleClick = () => {
    if (nextMeetingDateStr && finalSelectedTime) {
      onScheduleMeeting(nextMeetingDateStr, finalSelectedTime, 'آنلاین/تلفنی');
    } else {
      alert('لطفاً هم تاریخ و هم ساعت را مشخص کنید.');
    }
  };

  const radarData = [
    { subject: 'زیست', score: 90, compareScore: 82 },
    { subject: 'شیمی', score: 85, compareScore: 78 },
    { subject: 'ریاضی', score: 45, compareScore: 70 },
    { subject: 'فیزیک', score: 60, compareScore: 75 },
    { subject: 'زمین', score: 75, compareScore: 60 },
  ];

  const weeklyLearningData = [
    { day: 'شنبه', study: 6.5, test: 3.0 },
    { day: 'یکشنبه', study: 5.0, test: 4.0 },
    { day: 'دوشنبه', study: 7.0, test: 2.5 },
    { day: 'سه‌شنبه', study: 4.5, test: 5.5 },
    { day: 'چهارشنبه', study: 6.0, test: 4.5 },
    { day: 'پنجشنبه', study: 8.0, test: 3.5 },
    { day: 'جمعه', study: 4.0, test: 6.0 },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      <div style={{ background: '#0C1D3F', borderRadius: '6px', padding: '18px 22px', marginBottom: '25px', border: '1px solid rgba(230, 194, 135, 0.4)', boxShadow: '0 12px 30px rgba(12, 29, 63, 0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="mono-num" style={{ fontSize: '12px', color: '#E6C287' }}>
            {' > '} SECRET_ADVISOR_NOTES (فقط قابل مشاهده و ویرایش توسط مشاور)
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(253, 251, 247, 0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Edit size={13} color="#E6C287" /> قابل ویرایش زنده
          </span>
        </div>
        <textarea value={secretNote} onChange={(e) => setSecretNote(e.target.value)} style={{ width: '100%', minHeight: '65px', background: 'rgba(253, 251, 247, 0.03)', border: '1px dashed rgba(230, 194, 135, 0.3)', borderRadius: '4px', padding: '10px', color: '#E6C287', fontSize: '13px', lineHeight: '1.8', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#C5A880" /> رادار نقاط ضعف و قوت
            </span>
            <span className="pill-badge">میانگین تسلط: <span className="mono-num" style={{ color: '#0C1D3F' }}>71%</span></span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="rgba(12, 29, 63, 0.12)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#0C1D3F', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={studentName} dataKey="score" stroke="#0C1D3F" strokeWidth={2} fill="#0C1D3F" fillOpacity={0.15} />
                {showSandbox && (
                  <Radar name={compareName} dataKey="compareScore" stroke="#C5A880" strokeWidth={2} fill="#C5A880" fillOpacity={0.25} />
                )}
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ background: '#0C1D3F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#C5A880" /> مقایسه روزانه مطالعه و تست‌زنی
            </span>
            <span className="pill-badge">هفته جاری</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyLearningData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(12, 29, 63, 0.08)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#0C1D3F', fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(12, 29, 63, 0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0C1D3F', color: '#FDFBF7', border: 'none', borderRadius: '6px', fontSize: '12px' }} cursor={{ fill: 'rgba(230, 194, 135, 0.12)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="study" name="ساعت مطالعه" fill="#0C1D3F" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="test" name="ساعت تست" fill="#C5A880" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bug size={17} color="#C5A880" /> مباحث فراری (تعیین توسط مشاور برای دوران جمع‌بندی)
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <input type="text" value={newFrog} onChange={(e) => setNewFrog(e.target.value)} placeholder="مبحث ضعیف جدید..." className="input-box" style={{ flex: 1, padding: '8px', fontSize: '12px' }} />
            <button onClick={addFrog} className="btn btn-primary" style={{ padding: '8px 12px' }}><Plus size={16}/></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }} className="custom-scrollbar">
            {frogs.map(f => (
              <div key={f.id} style={{ padding: '8px 12px', border: '1px solid rgba(12, 29, 63, 0.15)', borderRadius: '6px', background: 'rgba(12, 29, 63, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#0C1D3F', fontWeight: 'bold' }}>{f.text}</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="pill-badge" style={{ padding: '2px 6px', fontSize: '10px' }}><span className="mono-num" style={{ color: '#0C1D3F' }}>{f.delays}</span> تعویق</span>
                  <Trash2 size={14} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={() => removeFrog(f.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card" style={{ background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.12) 0%, transparent 100%)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mic size={17} color="#C5A880" /> ارسال پیام مستقیم به داشبورد دانش‌آموز
          </div>
          <textarea placeholder="پیام انگیزشیت رو اینجا بنویس..." className="input-box custom-scrollbar" style={{ flex: 1, minHeight: '60px', marginBottom: '15px', resize: 'none', fontSize: '12px' }}></textarea>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => alert('متن ارسال شد!')} className="btn btn-primary" style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '12px' }}><Send size={14}/> ارسال متن</button>
            <button onClick={() => alert('ویس ضبط و ارسال شد!')} className="gold-glow-btn" style={{ flex: 1, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '12px' }}><Mic size={14}/> ضبط و ارسال ویس</button>
          </div>
        </div>

        {/* باکس تنظیم جلسه با DatePicker و Clock Modal */}
        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneCall size={17} color="#C5A880" /> تنظیم جلسه/تماس بعدی
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'gray', marginBottom: '5px', display: 'block' }}>انتخاب تاریخ:</label>
              <DatePicker
                calendar={persian} locale={persian_fa}
                value={nextMeetingDateObj}
                onChange={(d) => { setNextMeetingDateObj(d); setNextMeetingDateStr(d ? d.format("YYYY/MM/DD") : ''); }}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '13px' }}
                placeholder="کلیک کنید..."
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '5px' }}>ساعت جلسه:</label>
              <div 
                onClick={() => setShowClockModal(true)}
                className="input-box mono-num"
                style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', background: '#fff', direction: 'ltr' }}
              >
                {finalSelectedTime ? finalSelectedTime : <span style={{ direction: 'rtl', fontFamily: 'var(--font-primary)' }}>انتخاب ساعت...</span>}
                <Clock size={16} color="#C5A880" />
              </div>
            </div>
            <button onClick={handleScheduleClick} className="pill-badge" style={{ justifyContent: 'center', padding: '10px', marginTop: '5px', background: '#0C1D3F', color: '#E6C287', cursor: 'pointer' }}>ثبت در تقویم مشاور</button>
          </div>
        </div>

      </div>

      <div className="bento-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Columns size={18} color="#0C1D3F" />
          <span style={{ fontWeight: '900', fontSize: '13px', color: '#0C1D3F' }}>آزمایشگاه مقایسه ۲ نفره (Sandbox):</span>
          <input 
            type="text" value={compareName} onChange={(e) => setCompareName(e.target.value)} placeholder="نام دانش‌آموز دوم..." 
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.2)', background: 'transparent', fontSize: '12px', color: '#0C1D3F', outline: 'none' }}
          />
          <button onClick={() => setShowSandbox(!showSandbox)} className="pill-badge" style={{ cursor: 'pointer', background: showSandbox ? '#0C1D3F' : 'transparent', color: showSandbox ? '#E6C287' : '#0C1D3F' }}>
            {showSandbox ? 'توقف مقایسه در رادار' : `مقایسه زنده با ${compareName}`}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => alert('فایل اکسل جامع دانش‌آموز آماده دانلود شد.')} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            <Download size={14} /> خروجی اکسل سفارشی
          </button>
          <button onClick={() => alert(`اکانت ${studentName} به صورت موقت قفل شد.`)} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer', borderColor: '#0C1D3F', background: 'rgba(12, 29, 63, 0.06)' }}>
            <Lock size={14} /> تعلیق موقت اکانت
          </button>
        </div>
      </div>

      {/* Modal ساعت دایره‌ای با فیکس LTR */}
      {showClockModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#0C1D3F', padding: '30px', borderRadius: '24px', width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative', animation: 'fadeIn 0.3s ease-out', direction: 'ltr' }}>
            
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#FDFBF7', marginBottom: '25px', display: 'flex', alignItems: 'baseline', gap: '5px', letterSpacing: '2px' }}>
              <span onClick={() => setClockMode('hour')} style={{ cursor: 'pointer', color: clockMode === 'hour' ? '#C5A880' : '#FDFBF7' }}>
                {String(clockHour).padStart(2, '0')}
              </span>
              :
              <span onClick={() => setClockMode('minute')} style={{ cursor: 'pointer', color: clockMode === 'minute' ? '#C5A880' : '#FDFBF7' }}>
                {String(clockMinute).padStart(2, '0')}
              </span>
            </div>

            <div style={{ width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(253,251,247,0.05)', position: 'relative', border: '2px solid rgba(197,168,128,0.2)' }}>
              <div style={{ position: 'absolute', width: '8px', height: '8px', background: '#C5A880', borderRadius: '50%', top: '121px', left: '121px', zIndex: 5 }}></div>
              <div style={{ position: 'absolute', width: '2px', height: '80px', background: '#C5A880', top: '45px', left: '124px', transformOrigin: 'bottom center', transform: `rotate(${clockMode === 'hour' ? (clockHour * 30) : (clockMinute * 6)}deg)`, zIndex: 1, opacity: 0.5 }}></div>
              {renderClockNumbers()}
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '25px', width: '100%' }}>
              <button onClick={() => setClockAmPm('AM')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: clockAmPm === 'AM' ? '#C5A880' : 'rgba(253,251,247,0.1)', color: clockAmPm === 'AM' ? '#0C1D3F' : '#FDFBF7', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>AM</button>
              <button onClick={() => setClockAmPm('PM')} style={{ flex: 1, padding: '10px', borderRadius: '12px', background: clockAmPm === 'PM' ? '#C5A880' : 'rgba(253,251,247,0.1)', color: clockAmPm === 'PM' ? '#0C1D3F' : '#FDFBF7', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>PM</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%', direction: 'rtl' }}>
              <button onClick={() => setShowClockModal(false)} style={{ flex: 1, background: 'transparent', color: '#FDFBF7', border: '1px solid rgba(253,251,247,0.3)', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}>انصراف</button>
              <button onClick={handleClockSubmit} style={{ flex: 1, background: '#10B981', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>تایید</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdvisorStudentOverview;