import React, { useState } from 'react';
import { Edit, Target, Layers, Bug, Mic, PhoneCall, Columns, Download, Lock, Plus, Trash2, Send, Clock, X, FileText, CheckCircle, ExternalLink, Eye, ShieldCheck } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import _DatePicker from "react-multi-date-picker";
const DatePicker: any = (_DatePicker as any)?.default?.default || (_DatePicker as any)?.default || _DatePicker;
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { VoiceRecorderWidget, VoicePlayer, showVoiceToast } from './VoiceComponents';

import api from './api';

interface AdvisorStudentOverviewProps {
  studentName?: string;
  studentId?: number;
  onNavigateToPlan?: () => void;
  onScheduleMeeting?: (date: string, time: string, type: string) => void;
}

export default function AdvisorStudentOverview({ studentName = 'یاشا', studentId = 5, onNavigateToPlan, onScheduleMeeting }: AdvisorStudentOverviewProps) {
  const [secretNote, setSecretNote] = useState("Warning: درگیر حواشی آزمون قلم‌چی بود.\nAction: با مادرش هماهنگ شد تا زمان خواب ساعت ۲۳ تثبیت شود و تست‌های محاسباتی ریاضی در پارت اول صبح قرار گیرد.");
  const [showSandbox, setShowSandbox] = useState(false);
  const [compareName, setCompareName] = useState('نغمه');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [directMessageText, setDirectMessageText] = useState('');
  const [sentVoice, setSentVoice] = useState<any>(null);

  const [studentStats, setStudentStats] = useState<{ total_time: number; total_tests: number; report_count: number }>({ total_time: 0, total_tests: 0, report_count: 0 });
  const [assessmentTests, setAssessmentTests] = useState<any[]>([]);
  const [selectedPreviewTest, setSelectedPreviewTest] = useState<any>(null);
  const [radarData, setRadarData] = useState<any[]>([
    { subject: 'زیست', score: 0, compareScore: 70 },
    { subject: 'شیمی', score: 0, compareScore: 65 },
    { subject: 'ریاضی', score: 0, compareScore: 60 },
    { subject: 'فیزیک', score: 0, compareScore: 65 },
    { subject: 'زمین', score: 0, compareScore: 50 },
  ]);
  const [weeklyLearningData, setWeeklyLearningData] = useState<any[]>([
    { day: 'شنبه', study: 0, test: 0 },
    { day: 'یکشنبه', study: 0, test: 0 },
    { day: 'دوشنبه', study: 0, test: 0 },
    { day: 'سه‌شنبه', study: 0, test: 0 },
    { day: 'چهارشنبه', study: 0, test: 0 },
    { day: 'پنجشنبه', study: 0, test: 0 },
    { day: 'جمعه', study: 0, test: 0 },
  ]);

  const [frogs, setFrogs] = useState([
    { id: 1, text: 'ژنتیک جمعیت (زیست دوازدهم)', delays: 2 },
    { id: 2, text: 'مسائل سینتیک و تعادل (شیمی یازدهم)', delays: 3 }
  ]);
  const [newFrog, setNewFrog] = useState('');

  const [nextMeetingDateObj, setNewMeetingDateObj] = useState<any>(null);
  const [nextMeetingDateStr, setNextMeetingDateStr] = useState('');
  
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockMode, setClockMode] = useState<'hour' | 'minute'>('hour');
  const [clockHour, setClockHour] = useState(12);
  const [clockMinute, setClockMinute] = useState(0);
  const [clockAmPm, setClockAmPm] = useState<'AM' | 'PM'>('PM');
  const [finalSelectedTime, setFinalSelectedTime] = useState('');

  React.useEffect(() => {
    fetchStudentOverview();
  }, [studentId]);

  const fetchStudentOverview = async () => {
    if (!studentId) return;
    try {
      const [res, testsRes] = await Promise.all([
        api.get(`/records/student-overview/${studentId}`).catch(() => ({ data: null })),
        api.get(`/records/student-tests/${studentId}`).catch(() => ({ data: [] }))
      ]);

      if (testsRes.data && Array.isArray(testsRes.data)) {
        setAssessmentTests(testsRes.data);
      }

      if (res.data) {
        setStudentStats(res.data.stats || { total_time: 0, total_tests: 0, report_count: 0 });

        const subStats = res.data.stats?.subject_stats || {};
        const calcScore = (name: string) => {
          const matched = Object.entries(subStats).find(([k]) => k.includes(name));
          if (!matched) return 0;
          const val: any = matched[1];
          return Math.min(100, Math.round((val.time * 15) + (val.tests * 0.4)));
        };

        setRadarData([
          { subject: 'زیست', score: calcScore('زیست'), compareScore: 75 },
          { subject: 'شیمی', score: calcScore('شیمی'), compareScore: 70 },
          { subject: 'ریاضی', score: calcScore('ریاضی'), compareScore: 60 },
          { subject: 'فیزیک', score: calcScore('فیزیک'), compareScore: 65 },
          { subject: 'زمین', score: calcScore('زمین'), compareScore: 50 },
        ]);

        const daysMap: Record<string, { study: number; test: number }> = {
          'شنبه': { study: 0, test: 0 },
          'یکشنبه': { study: 0, test: 0 },
          'دوشنبه': { study: 0, test: 0 },
          'سه‌شنبه': { study: 0, test: 0 },
          'چهارشنبه': { study: 0, test: 0 },
          'پنجشنبه': { study: 0, test: 0 },
          'جمعه': { study: 0, test: 0 },
        };
        const DAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
        (res.data.recent_reports || []).forEach((r: any) => {
          const d = new Date(r.report_date);
          const dName = DAYS[d.getDay()] || 'شنبه';
          if (daysMap[dName]) {
            daysMap[dName].study += Number(r.total_study_time || 0);
            daysMap[dName].test += Number(r.total_test_count || 0) / 10;
          }
        });

        setWeeklyLearningData([
          { day: 'شنبه', study: Math.round(daysMap['شنبه'].study * 10) / 10, test: Math.round(daysMap['شنبه'].test * 10) / 10 },
          { day: 'یکشنبه', study: Math.round(daysMap['یکشنبه'].study * 10) / 10, test: Math.round(daysMap['یکشنبه'].test * 10) / 10 },
          { day: 'دوشنبه', study: Math.round(daysMap['دوشنبه'].study * 10) / 10, test: Math.round(daysMap['دوشنبه'].test * 10) / 10 },
          { day: 'سه‌شنبه', study: Math.round(daysMap['سه‌شنبه'].study * 10) / 10, test: Math.round(daysMap['سه‌شنبه'].test * 10) / 10 },
          { day: 'چهارشنبه', study: Math.round(daysMap['چهارشنبه'].study * 10) / 10, test: Math.round(daysMap['چهارشنبه'].test * 10) / 10 },
          { day: 'پنجشنبه', study: Math.round(daysMap['پنجشنبه'].study * 10) / 10, test: Math.round(daysMap['پنجشنبه'].test * 10) / 10 },
          { day: 'جمعه', study: Math.round(daysMap['جمعه'].study * 10) / 10, test: Math.round(daysMap['جمعه'].test * 10) / 10 },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addFrog = () => {
    if (newFrog.trim()) {
      setFrogs([...frogs, { id: Date.now(), text: newFrog, delays: 0 }]);
      setNewFrog('');
    }
  };

  const removeFrog = (id: number) => {
    setFrogs(frogs.filter(f => f.id !== id));
  };

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
    const displayH = String(clockHour).padStart(2, '0');
    const displayM = String(clockMinute).padStart(2, '0');
    setFinalSelectedTime(`${displayH}:${displayM} ${clockAmPm}`);
    setShowClockModal(false);
  };

  const handleScheduleClick = () => {
    if (nextMeetingDateStr && finalSelectedTime) {
      if (onScheduleMeeting) {
        onScheduleMeeting(nextMeetingDateStr, finalSelectedTime, 'آنلاین/تلفنی');
      } else {
        alert('جلسه در تقویم ثبت شد.');
      }
    } else {
      alert('لطفاً هم تاریخ و هم ساعت را مشخص کنید.');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* یادداشت محرمانه مشاور */}
      <div style={{ background: '#0C1D3F', borderRadius: '10px', padding: '18px 22px', marginBottom: '25px', border: '1px solid rgba(230, 194, 135, 0.4)', boxShadow: '0 12px 30px rgba(12, 29, 63, 0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span className="mono-num" style={{ fontSize: '12px', color: '#E6C287' }}>
            {' > '} SECRET_ADVISOR_NOTES (فقط قابل مشاهده و ویرایش توسط مشاور)
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(253, 251, 247, 0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Edit size={13} color="#E6C287" /> قابل ویرایش زنده
          </span>
        </div>
        <textarea value={secretNote} onChange={(e) => setSecretNote(e.target.value)} style={{ width: '100%', minHeight: '65px', background: 'rgba(253, 251, 247, 0.03)', border: '1px dashed rgba(230, 194, 135, 0.3)', borderRadius: '6px', padding: '10px', color: '#E6C287', fontSize: '13px', lineHeight: '1.8', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#C5A880" /> رادار نقاط ضعف و قوت تسلط
            </span>
            <span className="pill-badge">میانگین تسلط: <span className="mono-num" style={{ color: '#0C1D3F' }}>75%</span></span>
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
            <Mic size={17} color="#C5A880" /> ارسال پیام و ویس مستقیم به داشبورد {studentName}
          </div>

          {showVoiceRecorder ? (
            <VoiceRecorderWidget
              studentName={studentName}
              title={`ضبط ویس تحلیلی برای ${studentName}`}
              onSendVoice={(result) => {
                setSentVoice(result);
                setShowVoiceRecorder(false);
                try {
                  localStorage.setItem('mentora_advisor_voice', JSON.stringify({
                    url: result.audioUrl,
                    duration: result.durationSec,
                    text: directMessageText || 'ویس جدید تحلیلی مشاور برای روند مطالعه شما',
                    date: 'امروز'
                  }));
                } catch (_) {}
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <>
              <textarea 
                value={directMessageText}
                onChange={(e) => setDirectMessageText(e.target.value)}
                placeholder="پیام یا نکات مشاوره‌ای رو اینجا بنویس..." 
                className="input-box custom-scrollbar" 
                style={{ flex: 1, minHeight: '60px', marginBottom: '15px', resize: 'none', fontSize: '12px' }}
              />

              {sentVoice && (
                <div style={{ marginBottom: '12px' }}>
                  <VoicePlayer
                    compact={true}
                    audioUrl={sentVoice.audioUrl}
                    durationSec={sentVoice.durationSec}
                    label="آخرین ویس ارسال شده به داشبورد"
                    speechText={directMessageText || "پیام مشاور به دانش آموز"}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => {
                    if (!directMessageText.trim()) {
                      showVoiceToast('لطفاً متن پیام را وارد کنید', 'error');
                      return;
                    }
                    try {
                      localStorage.setItem('mentora_advisor_voice', JSON.stringify({
                        text: directMessageText,
                        date: 'امروز'
                      }));
                    } catch (_) {}
                    showVoiceToast(`پیام متنی با موفقیت به داشبورد ${studentName} ارسال شد!`, 'success');
                    setDirectMessageText('');
                  }} 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <Send size={14}/> ارسال متن
                </button>
                <button 
                  onClick={() => setShowVoiceRecorder(true)} 
                  className="gold-glow-btn" 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '12px' }}
                >
                  <Mic size={14}/> ضبط و ارسال ویس
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bento-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneCall size={17} color="#C5A880" /> تنظیم جلسه/تماس بعدی با دانش‌آموز
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'gray', marginBottom: '5px', display: 'block' }}>انتخاب تاریخ:</label>
              <DatePicker
                calendar={persian} locale={persian_fa}
                value={nextMeetingDateObj}
                onChange={(d: any) => { setNewMeetingDateObj(d); setNextMeetingDateStr(d ? d.format("YYYY/MM/DD") : ''); }}
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
            <button onClick={handleScheduleClick} className="pill-badge" style={{ justifyContent: 'center', padding: '10px', marginTop: '5px', background: '#0C1D3F', color: '#E6C287', cursor: 'pointer' }}>ثبت در تقویم مشاور و ارسال به دانش‌آموز</button>
          </div>
        </div>

      </div>

      {/* بخش کارنامه‌ها و آزمون‌های روان‌شناختی آپلود شده توسط دانش‌آموز */}
      <div className="bento-card" style={{ marginBottom: '20px', borderRight: '4px solid #C5A880' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#C5A880" />
              نتایج آزمون‌های شخصیت‌شناسی و رغبت‌سنجی «{studentName}»
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted, gray)' }}>
              فایل‌ها و کارنامه‌های بارگذاری‌شده توسط دانش‌آموز جهت بررسی تیپ شخصیتی، سبک یادگیری و هدایت تحصیلی بهینه.
            </p>
          </div>
          <span className="pill-badge" style={{ background: 'rgba(197, 168, 128, 0.15)', color: 'var(--gold-dark)', fontSize: '11px' }}>
            {assessmentTests.length} فایل بارگذاری‌شده
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { key: 'mbti', name: 'آزمون تیپ‌شناسی MBTI', desc: 'بررسی درون‌گرایی/برون‌گرایی و ساختار ذهنی' },
            { key: 'holland', name: 'آزمون رغبت‌سنجی شغلی هالند', desc: 'جهت‌گیری تیپ شغلی و رشته‌های دانشگاهی' },
            { key: 'gardner', name: 'آزمون هوش‌های چندگانه گاردنر', desc: 'هوش منطقی، کلامی، فضایی و هیجانی' },
            { key: 'vark', name: 'آزمون سبک‌های یادگیری VARK', desc: 'یادگیری دیداری، شنیداری یا حرکتی' },
            { key: 'study_skills', name: 'آزمون مهارت‌های مطالعه', desc: 'ارزیابی مدیریت زمان و تکنیک‌های تست‌زنی' }
          ].map(testMeta => {
            const uploaded = assessmentTests.find(t => t.test_type === testMeta.key);
            return (
              <div
                key={testMeta.key}
                style={{
                  background: uploaded ? 'rgba(16, 185, 129, 0.04)' : 'rgba(12, 29, 63, 0.02)',
                  border: uploaded ? '1.5px solid rgba(16, 185, 129, 0.3)' : '1px dashed var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text-main, #0C1D3F)' }}>
                      {testMeta.name}
                    </span>
                    {uploaded ? (
                      <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: 'none', fontSize: '10px' }}>
                        ثبت شد ✓
                      </span>
                    ) : (
                      <span className="pill-badge" style={{ background: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF', border: 'none', fontSize: '10px' }}>
                        در انتظار
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted, gray)', lineHeight: '1.5' }}>
                    {testMeta.desc}
                  </p>
                </div>

                {uploaded ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }} className="mono-num">
                      {uploaded.file_name} ({uploaded.created_at?.slice(0, 10) || 'ثبت‌نام'})
                    </span>
                    <button
                      onClick={() => setSelectedPreviewTest(uploaded)}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--primary, #0C1D3F)',
                        color: 'var(--gold, #E6C287)',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px'
                      }}
                    >
                      <Eye size={12} />
                      مشاهده نتیجه آزمون
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '6px', background: 'rgba(0,0,0,0.02)', borderRadius: '6px' }}>
                    هنوز فایلی توسط دانش‌آموز آپلود نشده
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* مودال پیش‌نمایش فایل آزمون */}
      {selectedPreviewTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 18, 41, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, direction: 'rtl', padding: '20px' }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '16px', fontWeight: '900' }}>
                  کارنامه آزمون: {selectedPreviewTest.file_name}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>دانش‌آموز: {studentName}</span>
              </div>
              <button onClick={() => setSelectedPreviewTest(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', minHeight: '280px' }}>
              {selectedPreviewTest.file_data?.startsWith('data:image') || selectedPreviewTest.file_path?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img
                  src={selectedPreviewTest.file_data || selectedPreviewTest.file_path}
                  alt="کارنامه آزمون"
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-main)', fontWeight: 'bold' }}>
                    فایل کارنامه در قالب مستندات (PDF / سند متنی) بارگذاری شده است.
                  </p>
                  <a
                    href={selectedPreviewTest.file_data || selectedPreviewTest.file_path}
                    download={selectedPreviewTest.file_name}
                    className="gold-glow-btn"
                    style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> دانلود فایل PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
