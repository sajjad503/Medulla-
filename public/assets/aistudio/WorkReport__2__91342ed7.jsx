import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, Send, Calculator, BookOpen, 
  CalendarDays, Moon, CheckCircle2, Target, 
  Archive, History, X, Info, GraduationCap, Loader2
} from 'lucide-react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import api from './api';

function WorkReport() {
  const [major, setMajor] = useState('science'); 
  
  const [selectedDateObj, setSelectedDateObj] = useState(null); 
  const [selectedDayName, setSelectedDayName] = useState(''); 
  const [selectedDateStr, setSelectedDateStr] = useState(''); 
  
  const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  const [draftData, setDraftData] = useState({});
  const [submittedData, setSubmittedData] = useState({});
  
  const [currentCapsules, setCurrentCapsules] = useState(['', '', '']);
  const [capsuleArchive, setCapsuleArchive] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // استیت‌های مربوط به ارتباط با سرور
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const getSubjects = () => {
    let subjects = [];
    if (major === 'science') subjects = ['زیست‌شناسی', 'شیمی', 'فیزیک', 'ریاضیات', 'زمین‌شناسی'];
    else if (major === 'math') subjects = ['حسابان', 'هندسه', 'گسسته و آمار', 'فیزیک', 'شیمی'];
    else if (major === 'humanities') subjects = ['ریاضی و آمار', 'اقتصاد', 'علوم و فنون', 'عربی تخصصی', 'تاریخ و جغرافیا', 'جامعه‌شناسی', 'فلسفه و منطق', 'روان‌شناسی'];
    return subjects.concat(['ادبیات فارسی', 'عربی عمومی', 'دین و زندگی', 'زبان انگلیسی']);
  };

  const currentSubjects = getSubjects();

  const handleDateChange = (date) => {
    setSelectedDateObj(date);
    if (date) {
      setSelectedDayName(date.format("dddd")); 
      setSelectedDateStr(date.format("YYYY/MM/DD"));
      setSuccessMsg('');
    } else {
      setSelectedDayName('');
      setSelectedDateStr('');
    }
  };

  const handleDraftInput = (subject, field, value) => {
    if (!selectedDayName) return;
    const key = `${subject}-${selectedDayName}`;
    const numValue = parseFloat(value) || 0;
    
    setDraftData(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { time: 0, test: 0 }), [field]: numValue }
    }));
  };

  const handleCapsuleChange = (index, value) => {
    const newCapsules = [...currentCapsules];
    newCapsules[index] = value;
    setCurrentCapsules(newCapsules);
  };

  const totals = useMemo(() => {
    let studyTotal = 0;
    let testTotal = 0;
    currentSubjects.forEach(sub => {
      const key = `${sub}-${selectedDayName}`;
      studyTotal += Number(draftData[key]?.time || 0);
      testTotal += Number(draftData[key]?.test || 0);
    });
    return { studyTotal, testTotal };
  }, [draftData, currentSubjects, selectedDayName]);

  const submitToAdvisor = async () => {
    if (!selectedDateObj) {
      return alert('لطفاً ابتدا از تقویم، تاریخ گزارش را انتخاب کنید!');
    }
    if (totals.studyTotal === 0) {
      return alert('برای ارسال گزارش، باید حداقل زمان مطالعه یک درس را وارد کنید.');
    }

    setIsLoading(true);
    setSuccessMsg('');

    try {
      const jsDate = selectedDateObj.toDate(); 
      const backendDate = `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, '0')}-${String(jsDate.getDate()).padStart(2, '0')}`;

      const reportItems = {};
      currentSubjects.forEach(sub => {
        const key = `${sub}-${selectedDayName}`;
        if (draftData[key] && (draftData[key].time > 0 || draftData[key].test > 0)) {
          reportItems[sub] = { 
            time: Number(draftData[key].time) / 60,
            tests: Number(draftData[key].test) 
          };
        }
      });

      const validNotes = currentCapsules.filter(c => c.trim() !== '');
      const finalNote = validNotes.length > 0 ? "کپسول مرور:\n" + validNotes.join('\n') : '';

      await api.post('/records/daily-report', {
        report_date: backendDate, 
        total_study_time: Number(totals.studyTotal) / 60 || 0,
        total_test_count: Number(totals.testTotal) || 0,
        report_items: reportItems,
        student_note: finalNote
      });

      setSubmittedData(prev => ({ ...prev, ...draftData }));

      if (validNotes.length > 0) {
        setCapsuleArchive(prev => [
          { date: selectedDateStr, day: selectedDayName, notes: [...currentCapsules] },
          ...prev
        ]);
      }

      setSuccessMsg(`گزارش روز ${selectedDayName} با موفقیت در سیستم ثبت شد و برای مشاور ارسال گردید ✅`);
      setCurrentCapsules(['', '', '']);
      
    } catch (error) {
      console.error(error);
      alert('خطا در ارتباط با سرور. مطمئن شوید سرور پایتون در حال اجرا است.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyTotalTime = (day) => {
    let totalMinutes = 0;
    currentSubjects.forEach(subject => {
      const key = `${subject}-${day}`;
      if (submittedData[key] && submittedData[key].time) totalMinutes += submittedData[key].time;
    });
    return formatTime(totalMinutes);
  };

  const getSubjectTotalTime = (subject) => {
    let totalMinutes = 0;
    days.forEach(day => {
      const key = `${subject}-${day}`;
      if (submittedData[key] && submittedData[key].time) totalMinutes += submittedData[key].time;
    });
    return formatTime(totalMinutes);
  };

  const formatTime = (totalMins) => {
    if (totalMins === 0) return '۰';
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins} دقیقه`;
    return `${hours} ساعت و ${mins} دقیقه`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative', paddingBottom: '40px' }}>
      
      {showArchiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(12, 29, 63, 0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--gold)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <History size={24} color="var(--gold-dark)" /> آرشیو مرورهای شبانه شما
              </h3>
              <button onClick={() => setShowArchiveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
            </div>
            {capsuleArchive.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>هنوز هیچ مروری ثبت نکرده‌اید.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {capsuleArchive.map((archive, idx) => (
                  <div key={idx} style={{ background: 'rgba(230, 194, 135, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid var(--gold)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px', fontSize: '13px' }}>{archive.day} - {archive.date}</div>
                    <ul style={{ margin: 0, paddingRight: '20px', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.8' }}>
                      {archive.notes.map((note, i) => note.trim() !== '' && <li key={i}>{note}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="panel" style={{ border: '2px solid var(--gold)', marginBottom: '25px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: selectedDateStr ? '1px solid var(--border-color)' : 'none', paddingBottom: selectedDateStr ? '15px' : '0', marginBottom: selectedDateStr ? '20px' : '0' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
            <CalendarDays size={24} color="var(--primary)" /> ثبت گزارش کار روزانه
          </span>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--hover-bg)', padding: '8px 15px', borderRadius: '12px', border: '1px solid var(--gold)' }}>
              <GraduationCap size={18} color="var(--primary)" />
              <select 
                value={major} 
                onChange={(e) => { setMajor(e.target.value); setDraftData({}); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
              >
                <option value="science">علوم تجربی</option>
                <option value="math">ریاضی فیزیک</option>
                <option value="humanities">علوم انسانی</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--hover-bg)', padding: '8px 15px', borderRadius: '12px', border: '1px solid var(--gold)' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>انتخاب تاریخ:</span>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={selectedDateObj}
                onChange={handleDateChange}
                calendarPosition="bottom-right"
                placeholder="کلیک کنید..."
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', width: '120px', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {!selectedDateStr ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Info size={48} color="var(--border-color)" style={{ marginBottom: '15px' }} />
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>تاریخ را مشخص کنید</h3>
            <p style={{ fontSize: '14px' }}>برای پر کردن گزارش کار، ابتدا تقویم را باز کرده و روز مورد نظر را انتخاب کنید.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>فرم مطالعه: {selectedDayName} ({selectedDateStr})</h3>

            {successMsg && (
              <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={20} /> {successMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              {currentSubjects.map(subject => {
                const currentData = draftData[`${subject}-${selectedDayName}`] || { time: '', test: '' };
                return (
                  <div key={subject} style={{ background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} color="var(--gold-dark)" /> {subject}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input 
                        type="number" placeholder="زمان (دقیقه)" 
                        value={currentData.time || ''}
                        onChange={(e) => handleDraftInput(subject, 'time', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                      />
                      <input 
                        type="number" placeholder="تعداد تست" 
                        value={currentData.test || ''}
                        onChange={(e) => handleDraftInput(subject, 'test', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed var(--gold)', outline: 'none' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 400px', background: 'rgba(230, 194, 135, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gold-dark)' }}>
                {/* 🔴 اینجا اصلاح شد: justifyContent */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: 'var(--primary)' }}>
                    <Moon size={20} color="var(--gold-dark)" /> کپسول مرور شبانه (یادداشت مشاور)
                  </span>
                  <button onClick={() => setShowArchiveModal(true)} className="btn" style={{ background: 'var(--gold)', padding: '6px 12px', fontSize: '12px' }}>
                    <Archive size={14} /> مشاهده آرشیو
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[0, 1, 2].map(idx => (
                    <input 
                      key={idx} type="text" placeholder={`نکته طلایی ${idx + 1}...`}
                      value={currentCapsules[idx]}
                      onChange={(e) => handleCapsuleChange(idx, e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px dashed var(--gold)', outline: 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ fontSize: '13px', color: 'var(--primary)', background: 'var(--hover-bg)', padding: '10px 15px', borderRadius: '8px' }}>
                <Target size={16} color="var(--gold-dark)" style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                <strong>خلاصه امروز:</strong> {totals.studyTotal} دقیقه مطالعه | {totals.testTotal} تست
              </div>
              <button onClick={submitToAdvisor} disabled={isLoading} className="gold-glow-btn" style={{ padding: '14px 30px', fontSize: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} 
                {isLoading ? 'در حال ارتباط با سرور...' : 'ثبت قطعی در جدول و ارسال به مشاور'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={24} color="var(--primary)" /> جدول هفتگی عملکرد (نمای مشاور)
          </span>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
            این جدول بلافاصله پس از ثبت قطعی شما در بالا، آپدیت می‌شود و مشاورتان دقیقاً همین جدول را در پنل خود می‌بیند.
          </p>
        </div>

        <div style={{ overflowX: 'auto', border: '2px solid var(--border-color)', borderRadius: '12px', paddingBottom: '5px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px', textAlign: 'center', background: 'var(--bg-panel)' }}>
            <thead>
              <tr>
                <th style={{ background: 'var(--primary)', color: '#fff', padding: '15px' }}>نام درس</th>
                {days.map(day => (
                  <th key={day} style={{ background: 'var(--bg-main)', color: 'var(--primary)', padding: '15px', border: '1px solid var(--border-color)' }}>{day}</th>
                ))}
                <th style={{ background: 'var(--hover-bg)', color: 'var(--gold-dark)', padding: '15px' }}><Calculator size={16} /> جمع کل</th>
              </tr>
            </thead>
            <tbody>
              {currentSubjects.map(subject => (
                <tr key={subject}>
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{subject}</td>
                  {days.map(day => {
                    const data = submittedData[`${subject}-${day}`];
                    return (
                      <td key={day} style={{ border: '1px solid var(--border-color)', padding: '8px' }}>
                        {data && (data.time > 0 || data.test > 0) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                            {data.time > 0 && <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{data.time} دقیقه</span>}
                            {data.test > 0 && <span style={{ color: 'var(--text-muted)' }}>{data.test} تست</span>}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--border-color)' }}>-</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ border: '1px solid var(--border-color)', padding: '12px', background: 'var(--hover-bg)', fontWeight: 'bold' }}>
                    {getSubjectTotalTime(subject)}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ border: '1px solid var(--border-color)', padding: '15px', fontWeight: '900', color: '#fff', background: 'var(--primary)' }}>جمع کل روزانه</td>
                {days.map(day => (
                  <td key={day} style={{ border: '1px solid var(--border-color)', padding: '15px', background: 'var(--hover-bg)', fontWeight: '900', color: 'var(--danger)' }}>
                    {getDailyTotalTime(day)}
                  </td>
                ))}
                <td style={{ border: '1px solid var(--border-color)', padding: '15px', background: 'var(--gold)' }}>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorkReport;
