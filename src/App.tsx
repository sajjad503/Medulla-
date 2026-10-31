import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import MentoraLogo from './MentoraLogo';
import api from './api';
import { 
  LayoutDashboard, CalendarDays, CheckCircle, 
  FileText, Award, ClipboardList, FileQuestion, Power, LogOut, Loader2, Upload,
  Shield, Building, UserCheck, GraduationCap, ChevronDown, Edit, Link, Sparkles,
  Sun, Moon, Users, HeartHandshake, Clock, CreditCard
} from 'lucide-react';

import Login from './Login';
import FounderDashboard from './FounderDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdvisorDashboard from './AdvisorDashboard';
import ParentDashboard from './ParentDashboard';

import Dashboard from './Dashboard';
import StudyPlan from './StudyPlan';
import WorkReport from './WorkReport';
import AnswerSheet from './AnswerSheet';
import Exams from './Exams';
import ReportCard from './ReportCard';
import FocusMode from './FocusMode';
import FloatingToolkit from './FloatingToolkit';
import { VoiceToastContainer } from './VoiceComponents';
import StudentOnboardingModal from './StudentOnboardingModal';
import NotificationCenter from './NotificationCenter';
import StudentPaywall from './StudentPaywall';
import GracePeriodBanner from './GracePeriodBanner';
import { PWAInstallButton } from './PWAInstallButton';
import LandingPage from './LandingPage';
import OfflineStatusBanner from './OfflineStatusBanner';

const FallbackLoader = () => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0C1D3F' }}>
    <Loader2 size={40} color="#E6C287" className="spin-animation" style={{ marginBottom: '15px' }} />
    <span style={{ color: '#E6C287', fontWeight: 'bold', letterSpacing: '2px' }}>MEDULLA...</span>
  </div>
);

export default function App() {
  const [userRole, setUserRole] = useState<string | null>(null); 
  const [unauthView, setUnauthView] = useState<'landing' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'workreport' | 'answersheet' | 'exams' | 'reports'>('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [inviteNotice, setInviteNotice] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Student Subscription & Paywall State
  const [subscriptionState, setSubscriptionState] = useState<{
    isLoading: boolean;
    isActive: boolean;
    status: 'paid' | 'grace_period' | 'unpaid';
    isGracePeriod: boolean;
    graceRemainingSeconds: number;
    graceUntil?: string;
    studentFee: number;
    cardNumber: string;
    cardHolder: string;
    bankName: string;
    lastPayment?: any;
  }>({
    isLoading: true,
    isActive: true,
    status: 'paid',
    isGracePeriod: false,
    graceRemainingSeconds: 0,
    studentFee: 490000,
    cardNumber: '6219861408052453',
    cardHolder: 'سجاد حامدی',
    bankName: 'بانک سامان'
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mentora_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('mentora_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('mentora_theme', 'light');
      }
    } catch (_) {}
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const parseJwt = (token: string) => {
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
    // Check URL parameters for direct advisor invitation
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteParam = urlParams.get('invite') || urlParams.get('advisor');
      if (inviteParam) {
        localStorage.setItem('mentora_invite_code', inviteParam);
        api.get(`/auth/invite-info/${inviteParam}`)
          .then(res => {
            if (res.data?.valid && res.data.advisor) {
              setInviteNotice(res.data.advisor);
            }
          })
          .catch(() => {});
      }
    } catch (_) {}

    const checkSubscriptionStatus = async () => {
      const token = localStorage.getItem('mentora_token');
      if (!token) {
        setSubscriptionState(prev => ({ ...prev, isLoading: false, isActive: true }));
        return;
      }
      try {
        const res = await api.get('/subscription/status');
        if (res.data?.is_student) {
          setSubscriptionState({
            isLoading: false,
            isActive: Boolean(res.data.is_active),
            status: res.data.subscription_status,
            isGracePeriod: Boolean(res.data.is_grace_period),
            graceRemainingSeconds: res.data.grace_remaining_seconds || 0,
            graceUntil: res.data.grace_until,
            studentFee: res.data.student_fee || 490000,
            cardNumber: res.data.card_number || '6219861408052453',
            cardHolder: res.data.card_holder || 'سجاد حامدی',
            bankName: res.data.bank_name || 'بانک سامان',
            lastPayment: res.data.last_payment
          });
        } else {
          setSubscriptionState(prev => ({ ...prev, isLoading: false, isActive: true }));
        }
      } catch (err) {
        console.warn('Subscription check skipped or offline:', err);
        setSubscriptionState(prev => ({ ...prev, isLoading: false, isActive: true }));
      }
    };

    const checkToken = () => {
      const token = localStorage.getItem('mentora_token');
      if (token) {
        const decodedPayload = parseJwt(token);
        if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
          setUserRole(decodedPayload.role);
          if (decodedPayload.role === 'student') {
            const hasLocal = localStorage.getItem('mentora_onboarded_status') === 'true';
            setIsOnboarded(Boolean(decodedPayload.onboarded || hasLocal));
            checkSubscriptionStatus();
          } else {
            setIsOnboarded(true);
          }
        } else {
          localStorage.removeItem('mentora_token');
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };

    checkToken();

    const handleAuthChange = () => {
      checkToken();
    };
    window.addEventListener('mentora_auth_change', handleAuthChange);
    return () => window.removeEventListener('mentora_auth_change', handleAuthChange);
  }, []);

  const checkSubscriptionStatus = async () => {
    const token = localStorage.getItem('mentora_token');
    if (!token) return;
    try {
      const res = await api.get('/subscription/status');
      if (res.data?.is_student) {
        setSubscriptionState({
          isLoading: false,
          isActive: Boolean(res.data.is_active),
          status: res.data.subscription_status,
          isGracePeriod: Boolean(res.data.is_grace_period),
          graceRemainingSeconds: res.data.grace_remaining_seconds || 0,
          graceUntil: res.data.grace_until,
          studentFee: res.data.student_fee || 490000,
          cardNumber: res.data.card_number || '6219861408052453',
          cardHolder: res.data.card_holder || 'سجاد حامدی',
          bankName: res.data.bank_name || 'بانک سامان',
          lastPayment: res.data.last_payment
        });
      } else {
        setSubscriptionState(prev => ({ ...prev, isLoading: false, isActive: true }));
      }
    } catch (err) {
      console.warn('Could not refresh subscription status:', err);
      setSubscriptionState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const testSetSubscriptionStatus = async (status: 'unpaid' | 'grace' | 'paid') => {
    try {
      await api.post('/subscription/dev-reset', { status, student_id: 5 });
      await checkSubscriptionStatus();
    } catch (err) {
      console.warn(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mentora_token');
    localStorage.removeItem('mentora_onboarded_status');
    setUserRole(null);
    setUnauthView('landing');
  };

  const handleLandingQuickRole = (role: string) => {
    const phoneMap: Record<string, string> = {
      founder: '09100341561',
      advisor: '09100341562',
      student: '09100341563',
      parent: '09120000099',
      manager: '09120000002'
    };
    switchRoleTo(role, phoneMap[role] || '09100341561');
  };

  const switchRoleTo = async (newRole: string, phone: string) => {
    try {
      const res = await api.post('/auth/switch-role', { role: newRole, phone });
      if (res.data?.access_token) {
        localStorage.setItem('mentora_token', res.data.access_token);
        setUserRole(newRole);
        if (newRole === 'student') {
          const hasLocal = localStorage.getItem('mentora_onboarded_status') === 'true';
          setIsOnboarded(Boolean(res.data.onboarded || hasLocal));
          checkSubscriptionStatus();
        } else {
          setIsOnboarded(true);
        }
        setShowRoleSwitcher(false);
        return;
      }
    } catch (_) {
      try {
        const res = await api.post('/auth/login', { username: phone, password: '123' });
        if (res.data?.access_token) {
          localStorage.setItem('mentora_token', res.data.access_token);
          setUserRole(newRole);
          if (newRole === 'student') {
            const hasLocal = localStorage.getItem('mentora_onboarded_status') === 'true';
            setIsOnboarded(Boolean(res.data.onboarded || hasLocal));
            checkSubscriptionStatus();
          } else {
            setIsOnboarded(true);
          }
          setShowRoleSwitcher(false);
          return;
        }
      } catch (err) {
        console.error('Error switching role:', err);
      }
    }
  };

  // Reusable Theme Toggle Button
  const renderThemeToggleButton = () => (
    <button
      onClick={toggleDarkMode}
      className="pill-badge"
      style={{
        cursor: 'pointer',
        padding: '7px 14px',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: isDarkMode ? 'rgba(230,194,135,0.18)' : 'rgba(12,29,63,0.08)',
        borderColor: isDarkMode ? 'var(--gold)' : 'var(--border-color)',
        color: isDarkMode ? 'var(--gold)' : 'var(--primary)',
        transition: 'all 0.25s ease'
      }}
      title={isDarkMode ? 'تغییر به حالت روز (روشن)' : 'تغییر به حالت شب (تیره)'}
    >
      {isDarkMode ? <Sun size={14} color="#E6C287" /> : <Moon size={14} color="#0C1D3F" />}
      <span className="hide-on-mobile" style={{ fontWeight: 'bold' }}>
        {isDarkMode ? 'تم شب' : 'تم روز'}
      </span>
    </button>
  );

  // Common quick role selector bar
  const renderRoleSwitcherButton = () => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
        className="pill-badge"
        style={{ cursor: 'pointer', background: 'rgba(230,194,135,0.15)', borderColor: '#C5A880', color: 'var(--primary)', padding: '6px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <span>نقش: <strong>{userRole === 'founder' ? 'مدیریت کل' : userRole === 'manager' ? 'مدیریت موسسه' : userRole === 'advisor' ? 'مشاور' : userRole === 'parent' ? 'اولیا (والدین)' : 'دانش‌آموز'}</strong></span>
        <ChevronDown size={14} />
      </button>

      {showRoleSwitcher && (
        <div style={{
          position: 'absolute', top: '115%', left: 0, background: 'var(--bg-panel)', border: '1px solid var(--gold)',
          borderRadius: '12px', padding: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          zIndex: 10000, width: '250px', display: 'flex', flexDirection: 'column', gap: '6px', direction: 'rtl'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 8px', fontWeight: 'bold' }}>تغییر سریع سطح دسترسی:</span>
          
          <button 
            onClick={() => switchRoleTo('founder', '09100341561')} 
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: userRole === 'founder' ? 'var(--primary)' : 'transparent', color: userRole === 'founder' ? 'var(--gold)' : 'var(--text-main)', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Shield size={14} color="#C5A880" /> ۱. مدیریت کل (09100341561)
          </button>

          <button 
            onClick={() => switchRoleTo('advisor', '09100341562')} 
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: userRole === 'advisor' ? 'var(--primary)' : 'transparent', color: userRole === 'advisor' ? 'var(--gold)' : 'var(--text-main)', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserCheck size={14} color="#C5A880" /> ۲. پنل مشاور ارشد (09100341562)
          </button>

          <button 
            onClick={() => switchRoleTo('student', '09100341563')} 
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: userRole === 'student' ? 'var(--primary)' : 'transparent', color: userRole === 'student' ? 'var(--gold)' : 'var(--text-main)', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <GraduationCap size={14} color="#C5A880" /> ۳. دانش‌آموز ۱ تجربی (09100341563)
          </button>

          <button 
            onClick={() => switchRoleTo('student', '09100341564')} 
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <GraduationCap size={14} color="#C5A880" /> ۴. دانش‌آموز ۲ ریاضی (09100341564)
          </button>

          <button 
            onClick={() => switchRoleTo('parent', '09120000099')} 
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: userRole === 'parent' ? 'var(--primary)' : 'transparent', color: userRole === 'parent' ? 'var(--gold)' : 'var(--text-main)', cursor: 'pointer', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <HeartHandshake size={14} color="#C5A880" /> ۵. پنل اولیا (ناظر تحصیلی)
          </button>

          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(230,194,135,0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>تست وضعیت اشتراک دانش‌آموز:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => testSetSubscriptionStatus('unpaid')}
                style={{ flex: 1, padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #EF4444', background: subscriptionState.status === 'unpaid' ? '#EF4444' : 'transparent', color: subscriptionState.status === 'unpaid' ? '#fff' : '#EF4444', cursor: 'pointer', fontWeight: 'bold' }}
                title="تست قفل پرداخت‌نشده (Paywall)"
              >
                قفل (پرداخت‌نشده)
              </button>
              <button
                onClick={() => testSetSubscriptionStatus('grace')}
                style={{ flex: 1, padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #F59E0B', background: subscriptionState.status === 'grace_period' ? '#F59E0B' : 'transparent', color: subscriptionState.status === 'grace_period' ? '#fff' : '#D97706', cursor: 'pointer', fontWeight: 'bold' }}
                title="تست دسترسی اضطراری ۲۴ ساعته"
              >
                مهلت ۲۴h
              </button>
              <button
                onClick={() => testSetSubscriptionStatus('paid')}
                style={{ flex: 1, padding: '4px 6px', fontSize: '10px', borderRadius: '6px', border: '1px solid #10B981', background: subscriptionState.status === 'paid' ? '#10B981' : 'transparent', color: subscriptionState.status === 'paid' ? '#fff' : '#10B981', cursor: 'pointer', fontWeight: 'bold' }}
                title="تست اشتراک کامل ۳۰ روزه"
              >
                فعال ۳۰d
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Suspense fallback={<FallbackLoader />}>
      {!userRole ? (
        unauthView === 'landing' ? (
          <LandingPage
            onGoToLogin={() => setUnauthView('login')}
            onQuickRoleLogin={handleLandingQuickRole}
            isDarkMode={isDarkMode}
            onToggleTheme={toggleDarkMode}
          />
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PWAInstallButton />
              {renderThemeToggleButton()}
            </div>
            <Login 
              onLogin={(role) => setUserRole(role)} 
              onBackToLanding={() => setUnauthView('landing')}
            />
          </div>
        )
      ) : userRole === 'founder' ? (
        /* ================= ۱. پنل مالک پلتفرم (مدیریت کل - وضعیت مالی موسسات) ================= */
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
          <header className="app-header">
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
              </div>
              <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '22px', letterSpacing: '3px', fontWeight: '900' }}>MEDULLA</h1>
              <span className="brand-role" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', paddingRight: '12px', borderRight: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="#C5A880" /> مدیریت کل پلتفرم (Founder)
              </span>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PWAInstallButton />
              {renderThemeToggleButton()}
              {renderRoleSwitcherButton()}
              <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <LogOut size={16} /> <span className="hide-on-mobile">خروج</span>
              </button>
            </div>
          </header>
          <main className="app-main">
            <FounderDashboard onLogout={handleLogout} />
          </main>
        </div>
        
      ) : userRole === 'manager' ? (
        /* ================= ۲. پنل مدیر آموزشگاه (مدیریت به مشاور و دانش‌آموزهای آن موسسه) ================= */
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
          <header className="app-header">
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
              </div>
              <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '22px', letterSpacing: '3px', fontWeight: '900' }}>MEDULLA</h1>
              <span className="brand-role" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', paddingRight: '12px', borderRight: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} color="#C5A880" /> مدیریت موسسه (آکادمی هدف)
              </span>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PWAInstallButton />
              {renderThemeToggleButton()}
              {renderRoleSwitcherButton()}
              <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <LogOut size={16} /> <span className="hide-on-mobile">خروج</span>
              </button>
            </div>
          </header>
          <main className="app-main">
            <ManagerDashboard onLogout={handleLogout} />
          </main>
        </div>
        
      ) : userRole === 'advisor' ? (
        /* ================= ۳. پنل مشاور (مشاور به دانش‌آموز) ================= */
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
          <header className="app-header">
             <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                 <MentoraLogo style={{ filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
               </div>
               <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '22px', letterSpacing: '3px', fontWeight: '900' }}>MEDULLA</h1>
               <span className="brand-role" style={{ color: 'var(--primary)', fontWeight: 'bold', paddingRight: '12px', borderRight: '2px solid var(--border-color)', fontSize: '13px' }}>
                 پنل مشاور (دکتر کاظمی)
               </span>
             </div>
             <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <PWAInstallButton />
               {renderThemeToggleButton()}
               {renderRoleSwitcherButton()}
               <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                 <LogOut size={16} /> <span className="hide-on-mobile">خروج</span>
               </button>
             </div>
          </header>
          <main className="app-main">
            <AdvisorDashboard />
          </main>
        </div>

      ) : userRole === 'parent' ? (
        /* ================= ۴. پنل اختصاصی والدین ================= */
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
          <header className="app-header">
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
              </div>
              <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '22px', letterSpacing: '3px', fontWeight: '900' }}>MEDULLA</h1>
              <span className="brand-role" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', paddingRight: '12px', borderRight: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HeartHandshake size={16} color="#C5A880" /> سامانه پایش والدین (ولی یاشا محبی)
              </span>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PWAInstallButton />
              {renderThemeToggleButton()}
              {renderRoleSwitcherButton()}
              <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                <LogOut size={16} /> <span className="hide-on-mobile">خروج</span>
              </button>
            </div>
          </header>
          <main className="app-main">
            <ParentDashboard onLogout={handleLogout} />
          </main>
        </div>
        
      ) : (
        /* ================= ۵. پنل دانش‌آموز ================= */
        <div className="app-container" style={{ flexDirection: 'column' }}>
          {isFocusMode && <FocusMode onExit={() => setIsFocusMode(false)} />}
          
          {/* قفل پرداخت اشتراک (Paywall) در صورت عدم پرداخت و عدم وجود مهلت ۲۴ ساعته فعال */}
          {!subscriptionState.isActive && (
            <StudentPaywall
              studentName={studentProfile?.name || 'یاشا محبی'}
              studentFee={subscriptionState.studentFee}
              cardNumber={subscriptionState.cardNumber}
              cardHolder={subscriptionState.cardHolder}
              bankName={subscriptionState.bankName}
              onUnlocked={() => checkSubscriptionStatus()}
            />
          )}

          {/* بنر موقت ۲۴ ساعته برای فیش‌های در انتظار تایید مدیر */}
          {subscriptionState.isGracePeriod && (
            <GracePeriodBanner
              graceRemainingSeconds={subscriptionState.graceRemainingSeconds}
              graceUntil={subscriptionState.graceUntil}
              studentFee={subscriptionState.studentFee}
              lastPayment={subscriptionState.lastPayment}
              onRefreshStatus={checkSubscriptionStatus}
            />
          )}

          {!isOnboarded && (
            <StudentOnboardingModal
              initialName={studentProfile?.name || 'یاشا محبی'}
              initialPhone={studentProfile?.phone || '09120000004'}
              onComplete={(data) => {
                setIsOnboarded(true);
                setStudentProfile(data);
              }}
            />
          )}

          {inviteNotice && (
            <div style={{
              background: 'linear-gradient(90deg, #0C1D3F 0%, #1B3366 100%)',
              color: '#E6C287',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              direction: 'rtl'
            }}>
              <Sparkles size={15} color="#E6C287" />
              <span>شما با لینک اختصاصی <strong>{inviteNotice.full_name} ({inviteNotice.grade || 'مشاور'})</strong> وارد شده‌اید و مستقیماً به پنل ایشان متصل می‌شوید.</span>
            </div>
          )}

          <header className="app-header">
            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                <MentoraLogo style={{ filter: 'drop-shadow(0px 4px 8px rgba(230,194,135,0.3))' }} />
              </div>
              <h1 style={{ color: 'var(--primary)', fontSize: '22px', letterSpacing: '3px', margin: 0, fontWeight: '900' }}>MEDULLA</h1>
              <span className="brand-role" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px', paddingRight: '12px', borderRight: '2px solid var(--border-color)' }}>
                پنل دانش‌آموز ({studentProfile?.name || 'یاشا محبی'})
              </span>
            </div>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PWAInstallButton />
              {renderThemeToggleButton()}
              
              {/* نشان وضعیت اشتراک */}
              {subscriptionState.status === 'paid' ? (
                <span className="pill-badge" style={{ cursor: 'default', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(16,185,129,0.15)', borderColor: '#10B981', color: '#10B981' }} title="اشتراک معتبر ۳۰ روزه">
                  <CheckCircle size={13} /> اشتراک فعال
                </span>
              ) : subscriptionState.status === 'grace_period' ? (
                <span className="pill-badge" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(245,158,11,0.15)', borderColor: '#F59E0B', color: '#D97706' }} title="دسترسی موقت ۲۴ ساعته تا تایید نهایی مدیر">
                  <Clock size={13} /> مهلت ۲۴h فعال
                </span>
              ) : null}

              <button 
                onClick={() => setIsOnboarded(false)} 
                className="pill-badge" 
                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(230,194,135,0.2)', borderColor: 'var(--gold)' }}
                title="ویرایش یا مشاهده اطلاعات پرونده مشاوره"
              >
                <Edit size={13} color="var(--primary)" /> پرونده من
              </button>
              <NotificationCenter 
                onNavigateTab={(tab) => setActiveTab(tab)} 
                advisorName="دکتر کاظمی" 
              />
              {renderRoleSwitcherButton()}
              <button onClick={() => setIsFocusMode(true)} className="btn-focus" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                <Power size={16} color="var(--gold)" /> <span className="btn-focus-text">ورود به حالت تمرکز</span>
              </button>
              <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} />
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
          
          <main className="workspace" style={{ paddingTop: '15px' }}>
            {activeTab === 'dashboard' && <Dashboard onNavigateTab={(tab) => setActiveTab(tab)} />}
            {activeTab === 'plan' && <StudyPlan />}
            {activeTab === 'workreport' && <WorkReport />}
            {activeTab === 'answersheet' && <AnswerSheet />}
            {activeTab === 'exams' && <Exams />}
            {activeTab === 'reports' && <ReportCard />}
          </main>
          
          <FloatingToolkit />
        </div>
      )}
      <OfflineStatusBanner />
      <VoiceToastContainer />
    </Suspense>
  );
}
