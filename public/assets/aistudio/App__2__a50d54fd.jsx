import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import MentoraLogo from './MentoraLogo';
import { 
  LayoutDashboard, CalendarDays, CheckCircle, 
  FileText, Award, ClipboardList, FileQuestion, Power, LogOut, Loader2, Upload
} from 'lucide-react';

// =========================================================
// ایمپورت کردن تمام صفحات به صورت Lazy (برای سرعت بیشتر)
// =========================================================
const Login = lazy(() => import('./Login'));
const FounderDashboard = lazy(() => import('./FounderDashboard')); // اضافه شدن پنل مالک
const ManagerDashboard = lazy(() => import('./ManagerDashboard')); // اصلاح نام پنل مدیر آموزشگاه
const AdvisorDashboard = lazy(() => import('./AdvisorDashboard'));

// پنل‌های مربوط به دانش‌آموز
const Dashboard = lazy(() => import('./Dashboard'));
const StudyPlan = lazy(() => import('./StudyPlan'));
const WorkReport = lazy(() => import('./WorkReport'));
const AnswerSheet = lazy(() => import('./AnswerSheet'));
const Exams = lazy(() => import('./Exams'));
const ReportCard = lazy(() => import('./ReportCard'));
const FocusMode = lazy(() => import('./FocusMode'));
const FloatingToolkit = lazy(() => import('./FloatingToolkit'));

const FallbackLoader = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0C1D3F' }}>
    <Loader2 size={40} color="#E6C287" className="spin-animation" style={{ marginBottom: '15px' }} />
    <span style={{ color: '#E6C287', fontWeight: 'bold', letterSpacing: '2px' }}>MENTORA...</span>
  </div>
);

function App() {
  const [userRole, setUserRole] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('mentora_token');
    if (token) {
      const decodedPayload = parseJwt(token);
      if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
        setUserRole(decodedPayload.role);
        setIsOnboarded(true); 
      } else {
        localStorage.removeItem('mentora_token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mentora_token');
    setUserRole(null);
    setIsOnboarded(false); 
  };

  return (
    <Suspense fallback={<FallbackLoader />}>
      {!userRole ? (
        <Login onLogin={(role) => setUserRole(role)} />
        
      ) : userRole === 'founder' ? (
        /* ================= پنل مالک پلتفرم (شخص شما) ================= */
        <FounderDashboard onLogout={handleLogout} />
        
      ) : userRole === 'manager' ? (
        /* ================= پنل مدیر آموزشگاه ================= */
        <ManagerDashboard onLogout={handleLogout} />
        
      ) : userRole === 'advisor' ? (
        /* ================= پنل مشاور ================= */
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
          <header style={{ padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <MentoraLogo style={{ width: '45px', height: '45px', filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
               <h1 style={{ color: 'var(--gold)', margin: 0, fontSize: '24px', letterSpacing: '4px', fontWeight: '900' }}>MENTORA</h1>
               <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginLeft: '10px', paddingLeft: '15px', borderLeft: '2px solid var(--border-color)' }}>پنل مشاور</span>
             </div>
             <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
               <LogOut size={16} /> خروج از سیستم
             </button>
          </header>
          <main style={{ flex: 1, padding: '20px 30px' }}>
            <AdvisorDashboard />
          </main>
        </div>
        
      ) : (
        /* ================= پنل دانش‌آموز ================= */
        <div className="app-container" style={{ flexDirection: 'column' }}>
          {isFocusMode && <FocusMode onExit={() => setIsFocusMode(false)} />}
          
          {/* فرم Onboarding دانش‌آموز */}
          {!isOnboarded && (
            <div className="onboarding-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="bento-card custom-scrollbar" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', background: '#FDFBF7', padding: '30px', borderRadius: '20px' }}>
                <h2 style={{ color: '#0C1D3F', textAlign: 'center', marginBottom: '25px', fontSize: '24px', fontWeight: '900' }}>
                  تکمیل پرونده مشاوره منتورا <CheckCircle size={24} color="#10B981" style={{ verticalAlign: 'middle' }} />
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                  <input type="text" className="input-box" placeholder="شماره موبایل دانش‌آموز" />
                  <input type="text" className="input-box" placeholder="شماره موبایل والد (پدر/مادر)" />
                  <input type="text" className="input-box" placeholder="نام مدرسه" />
                  <select className="input-box">
                    <option value="">انتخاب پایه تحصیلی...</option>
                    <option value="10">دهم</option><option value="11">یازدهم</option><option value="12">دوازدهم</option><option value="pusht">فارغ‌التحصیل (پشت کنکوری)</option>
                  </select>
                  <select className="input-box" style={{ gridColumn: '1 / -1' }}>
                    <option value="">انتخاب رشته تحصیلی...</option>
                    <option value="tajrobi">علوم تجربی</option><option value="riazi">ریاضی فیزیک</option><option value="ensani">علوم انسانی</option><option value="honar">هنر / زبان</option>
                  </select>
                </div>

                <div style={{ background: 'rgba(12, 29, 63, 0.04)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(12, 29, 63, 0.1)', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '15px', color: '#0C1D3F', fontWeight: '900', margin: '0 0 15px 0' }}>آزمون‌های شخصیت‌شناسی (الزامی)</h3>
                  <p style={{ fontSize: '12px', color: 'gray', marginBottom: '15px' }}>لطفاً نتایج تست‌های زیر را در قالب عکس یا PDF برای بررسی مشاور آپلود کنید:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['تست MBTI (شخصیت)', 'تست هالند (استعدادیابی)', 'تست نئو (NEO)'].map((test, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(12, 29, 63, 0.1)' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F' }}>{test}</span>
                        <label className="pill-badge" style={{ cursor: 'pointer', background: 'rgba(230, 194, 135, 0.2)', color: '#C5A880', border: 'none' }}>
                          <Upload size={14} style={{ marginLeft: '5px' }} /> انتخاب فایل
                          <input type="file" style={{ display: 'none' }} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="gold-glow-btn" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px' }} onClick={() => setIsOnboarded(true)}>
                  ثبت اطلاعات و ورود به دنیای منتورا
                </button>
              </div>
            </div>
          )}

          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <MentoraLogo style={{ width: '45px', height: '45px' }} />
              <h1 style={{ color: 'var(--primary)', fontSize: '24px', letterSpacing: '4px', margin: 0, fontWeight: '900' }}>MENTORA</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsFocusMode(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Power size={18} color="var(--gold)" /> ورود به حالت تمرکز
              </button>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer' }}>
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <nav className="mac-dock">
            <div className={"dock-item " + (activeTab === 'dashboard' ? 'active' : '')} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={20} /> داشبورد</div>
            <div className={"dock-item " + (activeTab === 'plan' ? 'active' : '')} onClick={() => setActiveTab('plan')}><CalendarDays size={20} /> برنامه</div> 
            <div className={"dock-item " + (activeTab === 'workreport' ? 'active' : '')} onClick={() => setActiveTab('workreport')}><ClipboardList size={20} /> گزارش</div>
            <div className={"dock-item " + (activeTab === 'answersheet' ? 'active' : '')} onClick={() => setActiveTab('answersheet')}><FileText size={20} /> پاسخبرگ</div>
            <div className={"dock-item " + (activeTab === 'exams' ? 'active' : '')} onClick={() => setActiveTab('exams')}><FileQuestion size={20} /> آزمون</div>
            <div className={"dock-item " + (activeTab === 'reports' ? 'active' : '')} onClick={() => setActiveTab('reports')}><Award size={20} /> کارنامه</div>
          </nav>
          
          <main className="workspace" style={{ paddingTop: '10px' }}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'plan' && <StudyPlan />}
            {activeTab === 'workreport' && <WorkReport />}
            {activeTab === 'answersheet' && <AnswerSheet />}
            {activeTab === 'exams' && <Exams />}
            {activeTab === 'reports' && <ReportCard />}
          </main>
          
          <FloatingToolkit />
        </div>
      )}
    </Suspense>
  );
}

export default App;