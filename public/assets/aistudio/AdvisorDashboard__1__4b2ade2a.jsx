import React, { useState, useRef, useMemo, Suspense, lazy, useEffect } from 'react';
import { 
  AlertTriangle, Users, Target, Search, ChevronRight, 
  BarChart3, UserX, Flame, CreditCard, FileText, Layers, Video, 
  CalendarClock, MessageCircle, X, Settings, Plus, Phone, ExternalLink, CheckCircle, ArrowRight,
  Calendar, Key, Megaphone, Send, Clock, Trash2, Edit2, Loader2
} from 'lucide-react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// 🔴 اتصال به سرور بک‌اند (FastAPI) از طریق تنظیمات اکسیوس که ساختیم
import api from './api'; 

const AdvisorStudentOverview = lazy(() => import('./AdvisorStudentOverview'));
const AdvisorStudentPlan = lazy(() => import('./AdvisorStudentPlan'));
const AdvisorStudentReport = lazy(() => import('./AdvisorStudentReport'));
const AdvisorStudentReportCards = lazy(() => import('./AdvisorStudentReportCards'));
const AdvisorStudentExams = lazy(() => import('./AdvisorStudentExams'));

function AdvisorDashboard() {
  // ==========================================
  // استیت‌های مربوط به داده‌های سرور
  // ==========================================
  const [studentsData, setStudentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('all');
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('overview');
  
  const [showUrgentModal, setShowUrgentModal] = useState(false);
  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChangeGroupModal, setShowChangeGroupModal] = useState(false);
  
  const [activeMainTab, setActiveMainTab] = useState('dashboard');
  
  const [studentToChangeGroup, setStudentToChangeGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');

  // استیت‌های تقویم کاری و ساعت دایره‌ای
  const [advisorEvents, setAdvisorEvents] = useState([]);
  const [newEventDateObj, setNewEventDateObj] = useState(null);
  const [newEventDateStr, setNewEventDateStr] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockMode, setClockMode] = useState('hour');
  const [clockHour, setClockHour] = useState(12);
  const [clockMinute, setClockMinute] = useState(0);
  const [clockAmPm, setClockAmPm] = useState('AM');
  const [finalSelectedTime, setFinalSelectedTime] = useState('');

  const [selectedBroadcastStudents, setSelectedBroadcastStudents] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const studentTableRef = useRef(null); 

  // ==========================================
  // 🔴 دریافت اطلاعات زنده از بک‌اند (FastAPI)
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // درخواست به بک‌اند (کد پایتونی که ساختیم) برای گرفتن لیست شاگردان
        const res = await api.get('/records/my-students');
        setStudentsData(res.data);
      } catch (error) {
        console.error("خطا در دریافت اطلاعات شاگردان:", error);
        setErrorMsg('ارتباط با سرور برقرار نشد. لطفاً وضعیت اینترنت و لاگین خود را بررسی کنید.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // فیلترها
  const urgentCalls = useMemo(() => studentsData.filter(s => s.lastReportDays >= 2), [studentsData]);
  const unreadReports = useMemo(() => studentsData.filter(s => s.unreadReport), [studentsData]);
  const uniqueGroups = useMemo(() => [...new Set(studentsData.map(s => s.customGroup || 'عادی'))], [studentsData]);

  const filteredStudents = useMemo(() => {
    return studentsData.filter(s => {
      const sGroup = s.customGroup || 'عادی';
      const matchesSearch = (s.name || '').includes(searchQuery);
      const matchesGroup = activeGroupFilter === 'all' || sGroup === activeGroupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, activeGroupFilter, studentsData]);

  // هندلرها
  const handleEnterProfile = (student) => {
    setSelectedStudent(student);
    setActiveProfileTab('overview');
    setShowUrgentModal(false);
    setShowUnreadModal(false);
  };

  const handleChangeGroupSubmit = () => {
    if (studentToChangeGroup && newGroupName.trim()) {
      // اینجا در آینده می‌توانید یک درخواست API بفرستید تا در دیتابیس هم آپدیت شود
      setStudentsData(prev => prev.map(s => 
        s.id === studentToChangeGroup.id ? { ...s, customGroup: newGroupName.trim() } : s
      ));
      setShowChangeGroupModal(false);
      setNewGroupName('');
    }
  };

  const handleScheduleMeeting = (studentName, dateStr, timeStr, typeStr) => {
    setAdvisorEvents(prev => [...prev, {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      title: `جلسه/تماس با ${studentName} (${typeStr})`,
      type: 'meeting'
    }]);
    alert(`تایم جلسه با ${studentName} در تقویم کاری شما ثبت شد.`);
  };

  const handleAddEvent = () => {
    if (newEventDateStr && finalSelectedTime && newEventTitle) {
      setAdvisorEvents([...advisorEvents, {
        id: Date.now(),
        date: newEventDateStr,
        time: finalSelectedTime,
        title: newEventTitle,
        type: 'task'
      }]);
      setNewEventDateObj(null);
      setNewEventDateStr('');
      setFinalSelectedTime('');
      setNewEventTitle('');
    } else {
      alert('لطفاً تاریخ، ساعت و عنوان کار را مشخص کنید.');
    }
  };

  const handleRemoveEvent = (id) => {
    setAdvisorEvents(advisorEvents.filter(e => e.id !== id));
  };

  const handleBroadcastSubmit = (type) => {
    if (selectedBroadcastStudents.length === 0) {
      alert('لطفاً حداقل یک دانش‌آموز را انتخاب کنید.');
      return;
    }
    if (type === 'text' && !broadcastMessage.trim()) {
      alert('متن پیام خالی است!');
      return;
    }
    alert(`${type === 'text' ? 'پیام متنی' : 'ویس'} با موفقیت به ${selectedBroadcastStudents.length} دانش‌آموز ارسال شد.`);
    setBroadcastMessage('');
    setSelectedBroadcastStudents([]);
    setActiveMainTab('dashboard');
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
    const formattedHour = clockHour === 12 && clockAmPm === 'AM' ? 0 
                        : clockHour !== 12 && clockAmPm === 'PM' ? clockHour + 12 
                        : clockHour;
    
    const displayH = String(clockHour).padStart(2, '0');
    const displayM = String(clockMinute).padStart(2, '0');
    
    setFinalSelectedTime(`${displayH}:${displayM} ${clockAmPm}`);
    setShowClockModal(false);
  };

  const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
  const modalStyle = { background: '#FDFBF7', padding: '25px', borderRadius: '20px', width: '90%', maxWidth: '500px', border: '1px solid #C5A880', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'fadeIn 0.3s ease-out' };

  // ==========================================
  // حالت لودینگ در هنگام دریافت دیتا
  // ==========================================
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#C5A880' }}>
        <Loader2 size={40} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '15px', color: '#0C1D3F' }}>در حال دریافت اطلاعات از سرور...</h3>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="bento-card" style={{ border: '1px solid #EF4444', textAlign: 'center' }}>
          <AlertTriangle size={40} color="#EF4444" style={{ margin: '0 auto 15px auto' }} />
          <h3 style={{ color: '#0C1D3F' }}>{errorMsg}</h3>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '15px' }}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setSelectedStudent(null)} className="pill-badge" style={{ padding: '8px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderColor: 'transparent' }}>
              <ArrowRight size={18} /> بازگشت
            </button>
            <div>
              <h2 style={{ margin: 0, color: '#0C1D3F', fontSize: '18px', fontWeight: '900' }}>پرونده ۳۶۰ درجه: {selectedStudent.name}</h2>
              <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'bold' }}>{selectedStudent.customGroup || 'عادی'}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: 'نمای کلی (رادار)', icon: <Target size={14}/> },
              { id: 'plan', label: 'برنامه مطالعاتی', icon: <CalendarClock size={14}/> },
              { id: 'report', label: 'گزارش کارها', icon: <FileText size={14}/> },
              { id: 'reportCards', label: 'کارنامه‌ها', icon: <BarChart3 size={14}/> },
              { id: 'exams', label: 'آزمون‌ساز', icon: <Layers size={14}/> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id)}
                className={activeProfileTab === tab.id ? 'gold-glow-btn' : 'pill-badge'}
                style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ paddingBottom: '50px' }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', color: 'gray' }}>در حال بارگذاری پرونده...</div>}>
            {activeProfileTab === 'overview' && <AdvisorStudentOverview studentName={selectedStudent.name} onNavigateToPlan={() => setActiveProfileTab('plan')} onScheduleMeeting={(d, t, ty) => handleScheduleMeeting(selectedStudent.name, d, t, ty)} />}
            {activeProfileTab === 'plan' && <AdvisorStudentPlan studentName={selectedStudent.name} />}
            {activeProfileTab === 'report' && <AdvisorStudentReport studentName={selectedStudent.name} />}
            {activeProfileTab === 'reportCards' && <AdvisorStudentReportCards studentName={selectedStudent.name} />}
            {activeProfileTab === 'exams' && <AdvisorStudentExams studentName={selectedStudent.name} />}
          </Suspense>
        </div>
      </div>
    );
  }

  // گروه‌بندی ایونت‌ها بر اساس تاریخ
  const groupedEvents = advisorEvents.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedEvents).sort();

  if (activeMainTab === 'calendar') {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#0C1D3F', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={24} color="#C5A880"/> تقویم کاری مشاور
          </h2>
          <button onClick={() => setActiveMainTab('dashboard')} className="pill-badge" style={{ cursor: 'pointer' }}>
            بازگشت به داشبورد
          </button>
        </div>

        <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '5px' }}>انتخاب تاریخ:</label>
            <DatePicker
              calendar={persian} locale={persian_fa}
              value={newEventDateObj}
              onChange={(d) => { setNewEventDateObj(d); setNewEventDateStr(d ? d.format("YYYY/MM/DD") : ''); }}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '13px' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '5px' }}>ساعت:</label>
            <div 
              onClick={() => setShowClockModal(true)}
              className="input-box mono-num"
              style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', background: '#fff', direction: 'ltr' }}
            >
              {finalSelectedTime ? finalSelectedTime : <span style={{ direction: 'rtl', fontFamily: 'var(--font-primary)' }}>انتخاب ساعت...</span>}
              <Clock size={16} color="#C5A880" />
            </div>
          </div>
          
          <div style={{ flex: 2, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', color: 'gray', display: 'block', marginBottom: '5px' }}>عنوان کار/جلسه:</label>
            <input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="مثال: بررسی کارنامه یاشا..." className="input-box" style={{ padding: '8px', width: '100%' }} />
          </div>
          
          <button onClick={handleAddEvent} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', gap: '8px' }}>
            <Plus size={16}/> افزودن به تقویم
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          {sortedDates.map(date => {
            const dayEvents = groupedEvents[date].sort((a, b) => a.time.localeCompare(b.time));
            return (
              <div key={date} className="bento-card" style={{ margin: 0, background: 'rgba(12,29,63,0.02)' }}>
                <h3 style={{ color: '#0C1D3F', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarClock size={16} color="#C5A880"/> {date}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayEvents.map(ev => (
                    <div key={ev.id} style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid rgba(12,29,63,0.1)', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-dark)', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <Clock size={12}/> <span className="mono-num" style={{ direction: 'ltr' }}>{ev.time}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#0C1D3F', fontWeight: 'bold' }}>{ev.title}</div>
                      <button onClick={() => handleRemoveEvent(ev.id)} style={{ position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {sortedDates.length === 0 && <div style={{ color: 'gray', padding: '20px' }}>رویدادی در تقویم ثبت نشده است.</div>}
        </div>

        {/* Modal ساعت دایره‌ای */}
        {showClockModal && (
          <div style={overlayStyle}>
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

  if (activeMainTab === 'broadcast') {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#0C1D3F', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Megaphone size={24} color="#C5A880"/> ارسال پیام گروهی (Broadcast)
          </h2>
          <button onClick={() => setActiveMainTab('dashboard')} className="pill-badge" style={{ cursor: 'pointer' }}>
            بازگشت به داشبورد
          </button>
        </div>

        <div className="bento-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F', marginBottom: '10px' }}>انتخاب گیرندگان:</div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(12,29,63,0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', background: 'rgba(12,29,63,0.02)' }}>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
              <input type="checkbox" onChange={(e) => setSelectedBroadcastStudents(e.target.checked ? studentsData.map(s => s.id) : [])} checked={selectedBroadcastStudents.length === studentsData.length && studentsData.length > 0} style={{ marginLeft: '10px' }}/>
              انتخاب همه دانش‌آموزان
            </label>
            <hr style={{ borderTop: '1px solid rgba(12,29,63,0.1)', margin: '10px 0' }}/>
            {studentsData.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer', fontSize: '13px', color: 'gray' }}>
                <input type="checkbox" checked={selectedBroadcastStudents.includes(s.id)} onChange={(e) => {
                  if (e.target.checked) setSelectedBroadcastStudents([...selectedBroadcastStudents, s.id]);
                  else setSelectedBroadcastStudents(selectedBroadcastStudents.filter(id => id !== s.id));
                }} style={{ marginLeft: '10px' }}/>
                {s.name || 'بدون نام'} <span style={{ color: 'gray', marginRight: '8px', fontSize: '11px' }}>({s.customGroup || 'عادی'})</span>
              </label>
            ))}
          </div>

          <textarea 
            placeholder="پیام یا لینک فایل خود را بنویسید..." 
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
            className="input-box custom-scrollbar" 
            style={{ width: '100%', minHeight: '120px', marginBottom: '20px', resize: 'vertical' }}
          />
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => handleBroadcastSubmit('text')} className="btn btn-primary" style={{ flex: 1, padding: '14px', display: 'flex', justifyContent: 'center', gap: '8px' }}><Send size={18}/> ارسال متن</button>
            <button onClick={() => handleBroadcastSubmit('voice')} className="gold-glow-btn" style={{ flex: 1, padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}><Mic size={18}/> ضبط و ارسال ویس</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px' }} className="custom-scrollbar">
      
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveMainTab('calendar')} className="btn btn-primary" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Calendar size={18} /> تقویم کاری
        </button>
        <button onClick={() => setActiveMainTab('broadcast')} className="gold-glow-btn" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <Megaphone size={18} /> ارسال برودکست
        </button>
        <button onClick={() => setShowPasswordModal(true)} className="pill-badge" style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginLeft: 'auto' }}>
          <Key size={18} /> تغییر رمز عبور
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="bento-card" onClick={() => studentTableRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ borderRight: '4px solid #0C1D3F', cursor: 'pointer', padding: '15px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}><Users size={16} /> کل شاگردان من</div>
          <div className="mono-num" style={{ fontSize: '26px', color: '#0C1D3F', marginTop: '8px' }}>{studentsData.length}</div>
        </div>
        <div className="bento-card" onClick={() => setShowUnreadModal(true)} style={{ borderRight: '4px solid #C5A880', cursor: 'pointer', padding: '15px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '12px', fontWeight: 'bold' }}><MessageCircle size={16} /> گزارش‌های نخوانده</div>
          <div className="mono-num" style={{ fontSize: '26px', color: '#C5A880', marginTop: '8px' }}>{unreadReports.length}</div>
        </div>
        <div className="bento-card" onClick={() => setShowUrgentModal(true)} style={{ background: 'rgba(239, 68, 68, 0.05)', borderRight: '4px solid #EF4444', cursor: 'pointer', padding: '15px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontSize: '12px', fontWeight: 'bold' }}><AlertTriangle size={16} /> نیازمند تماس فوری (۲ روز)</div>
          <div className="mono-num" style={{ fontSize: '26px', color: '#EF4444', marginTop: '8px' }}>{urgentCalls.length}</div>
        </div>
      </div>

      <div className="bento-card" ref={studentTableRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#C5A880" /> مدیریت شاگردان
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveGroupFilter('all')} className="pill-badge" style={{ cursor: 'pointer', background: activeGroupFilter === 'all' ? '#0C1D3F' : 'transparent', color: activeGroupFilter === 'all' ? '#E6C287' : 'gray' }}>همه</button>
              {uniqueGroups.map(grp => (
                <button key={grp} onClick={() => setActiveGroupFilter(grp)} className="pill-badge" style={{ cursor: 'pointer', background: activeGroupFilter === grp ? '#0C1D3F' : 'transparent', color: activeGroupFilter === grp ? '#E6C287' : 'gray' }}>{grp}</button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
             <Search size={16} color="gray" style={{ position: 'absolute', right: '12px', top: '10px' }} />
             <input type="text" placeholder="جستجوی نام..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-box" style={{ padding: '8px 35px 8px 12px', borderRadius: '50px', width: '180px' }} />
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
              <th style={{ padding: '15px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
              <th style={{ padding: '15px', color: '#0C1D3F' }}>گروه اختصاصی</th>
              <th style={{ padding: '15px', color: '#0C1D3F' }}>آخرین تراز</th>
              <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{student.name}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="pill-badge" style={{ borderColor: '#C5A880', color: '#0C1D3F' }}>{student.customGroup || 'عادی'}</span>
                    <button onClick={() => { setStudentToChangeGroup(student); setNewGroupName(student.customGroup || 'عادی'); setShowChangeGroupModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'gray' }} title="تغییر گروه"><Edit2 size={12}/></button>
                  </div>
                </td>
                <td style={{ padding: '15px', fontWeight: '900' }} className="mono-num">{student.taraz || 0}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleEnterProfile(student)} className="btn btn-primary" style={{ padding: '6px 15px', fontSize: '11px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    ورود به پرونده ۳۶۰ <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '20px', color: 'gray' }}>دانش‌آموزی یافت نشد.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========== Modals ========== */}
      
      {showUrgentModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#EF4444', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle size={20} /> نیازمند تماس فوری</h3>
              <button onClick={() => setShowUrgentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {urgentCalls.length === 0 ? <div style={{ textAlign: 'center', color: '#10B981', padding: '20px' }}>مورد اورژانسی وجود ندارد.</div> : 
                urgentCalls.map(student => (
                  <div key={student.id} onClick={() => handleEnterProfile(student)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0C1D3F' }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: '#EF4444' }}>{student.lastReportDays} روز گزارش نداده است</div>
                    </div>
                    <ArrowRight size={16} color="#EF4444" />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {showUnreadModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#C5A880', display: 'flex', alignItems: 'center', gap: '10px' }}><MessageCircle size={20} /> گزارش‌های نخوانده</h3>
              <button onClick={() => setShowUnreadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {unreadReports.length === 0 ? <div style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>همه گزارش‌ها خوانده شده است.</div> : 
                unreadReports.map(student => (
                  <div key={student.id} onClick={() => handleEnterProfile(student)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(230, 194, 135, 0.1)', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(197, 168, 128, 0.3)' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0C1D3F' }}>{student.name}</div>
                      <div style={{ fontSize: '11px', color: '#C5A880' }}>گزارش کار جدید</div>
                    </div>
                    <ArrowRight size={16} color="#C5A880" />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {showChangeGroupModal && (
        <div style={overlayStyle}>
          <div style={{...modalStyle, maxWidth: '350px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>تغییر گروه {studentToChangeGroup?.name}</h3>
              <button onClick={() => setShowChangeGroupModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <input type="text" placeholder="نام گروه جدید (مثال: دوازدهمی‌ها)..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="input-box" style={{ width: '100%', marginBottom: '20px' }} />
            <button onClick={handleChangeGroupSubmit} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>ذخیره تغییرات</button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={overlayStyle}>
          <div style={{...modalStyle, maxWidth: '350px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', color: '#0C1D3F', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}><Key size={18} color="#C5A880"/> تغییر رمز عبور</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <input type="password" placeholder="رمز عبور فعلی" className="input-box" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="password" placeholder="رمز عبور جدید" className="input-box" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="password" placeholder="تکرار رمز عبور جدید" className="input-box" style={{ width: '100%', marginBottom: '20px' }} />
            <button onClick={() => { alert('رمز عبور با موفقیت تغییر کرد.'); setShowPasswordModal(false); }} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>ثبت رمز جدید</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdvisorDashboard;