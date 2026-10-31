import React, { useState } from 'react';
import { 
  ArrowRight, Phone, Mic, Edit, Target, 
  LayoutDashboard, CalendarDays, ClipboardList, FileQuestion, Award, X
} from 'lucide-react';
import { VoiceRecorderWidget, showVoiceToast } from './VoiceComponents';

import AdvisorStudentOverview from './AdvisorStudentOverview';
import AdvisorStudentPlan from './AdvisorStudentPlan';
import AdvisorStudentReport from './AdvisorStudentReport';
import AdvisorStudentExams from './AdvisorStudentExams';
import AdvisorStudentReportCards from './AdvisorStudentReportCards';

interface StudentProfile360Props {
  studentName?: string;
  studentId?: number;
  onBack?: () => void;
}

export default function StudentProfile360({ studentName = 'یاشا', studentId = 5, onBack }: StudentProfile360Props) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'report' | 'exams' | 'reportcards'>('dashboard');
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  return (
    <div className="profile-360-wrapper">
      
      {/* داک جانبی / ناوبری پرونده ۳۶۰ */}
      <aside className="no-print profile-360-aside">
        {onBack && (
          <button onClick={onBack} className="dark-tooltip profile-back-btn" style={{
            background: 'rgba(230, 194, 135, 0.1)', border: '1px solid rgba(230, 194, 135, 0.35)',
            color: '#E6C287', width: '44px', height: '44px', borderRadius: '12px',
            display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
          }}>
            <ArrowRight size={20} />
            <span className="tooltip-box">بازگشت</span>
          </button>
        )}

        {[
          { id: 'dashboard', label: 'نمای ۳۶۰', icon: LayoutDashboard },
          { id: 'plan', label: 'برنامه‌ریزی', icon: CalendarDays },
          { id: 'report', label: 'گزارش‌کار', icon: ClipboardList },
          { id: 'exams', label: 'طراحی آزمون', icon: FileQuestion },
          { id: 'reportcards', label: 'کارنامه', icon: Award }
        ].map(item => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} onClick={() => setActiveTab(item.id as any)} className="profile-tab-item" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              cursor: 'pointer', position: 'relative',
              color: isActive ? '#E6C287' : 'rgba(253, 251, 247, 0.5)', transition: 'all 0.25s ease'
            }}>
              {isActive && <div className="profile-tab-indicator" />}
              <div style={{
                padding: '10px', borderRadius: '12px',
                background: isActive ? 'linear-gradient(180deg, rgba(230, 194, 135, 0.2) 0%, transparent 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(230, 194, 135, 0.4)' : '1px solid transparent'
              }}>
                <IconComp size={22} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: isActive ? '900' : '400' }}>{item.label}</span>
            </div>
          );
        })}
      </aside>

      {/* بخش اصلی محتوا */}
      <div className="custom-scrollbar profile-360-content">
        
        {/* هدر پرونده ۳۶۰ درجه */}
        <div className="no-print bento-card" style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: '25px', flexWrap: 'wrap', gap: '15px',
          background: 'linear-gradient(90deg, rgba(230, 194, 135, 0.08) 0%, rgba(253, 251, 247, 0.9) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', direction: 'ltr' }}>
              <div className="dark-tooltip" style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0C1D3F', border: '3px solid #FDFBF7', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#E6C287', fontWeight: '900', fontSize: '15px', boxShadow: '0 4px 12px rgba(12,29,63,0.15)' }}>
                {studentName.charAt(0)}
                <span className="tooltip-box">دانش‌آموز: {studentName}</span>
              </div>
              <div className="dark-tooltip" style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#C5A880', border: '3px solid #FDFBF7', marginLeft: '-12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#0C1D3F', fontWeight: '900', fontSize: '11px' }}>
                M
                <span className="tooltip-box">مشاور مدولا</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, color: '#0C1D3F', fontSize: '24px', fontWeight: '900' }}>
                  پرونده ۳۶۰ درجه {studentName}
                </h2>
                <span className="pill-badge">
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }}></span>
                  فعال و آنلاین
                </span>
                <span className="pill-badge" style={{ borderColor: '#C5A880' }}>
                  <Target size={13} color="#C5A880" />
                  <span className="mono-num" style={{ color: '#0C1D3F' }}>145</span> روز تا کنکور
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(12, 29, 63, 0.6)' }}>پیشرفت برنامه هفتگی:</span>
                <div style={{ width: '160px', height: '5px', background: 'rgba(12, 29, 63, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: '#0C1D3F' }}></div>
                </div>
                <span className="mono-num" style={{ fontSize: '12px', color: '#0C1D3F' }}>78%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => showVoiceToast('شماره تماس والدین: ۰۹۱۲۰۰۰۰۰۹۹', 'info')} className="pill-badge" style={{ cursor: 'pointer' }}>
              <Phone size={14} /> تماس والدین
            </button>
            <button onClick={() => setActiveTab('plan')} className="pill-badge" style={{ cursor: 'pointer' }}>
              <Edit size={14} /> تنظیم برنامه
            </button>
            <button onClick={() => setShowVoiceModal(true)} className="gold-glow-btn" style={{ padding: '8px 18px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mic size={15} /> ارسال ویس تحلیلی
            </button>
          </div>
        </div>

        {showVoiceModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(12, 29, 63, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
              <VoiceRecorderWidget
                studentName={studentName}
                title={`ارسال ویس تحلیلی پرونده به ${studentName}`}
                onSendVoice={(result) => {
                  try {
                    localStorage.setItem('mentora_advisor_voice', JSON.stringify({
                      url: result.audioUrl,
                      duration: result.durationSec,
                      text: 'ویس تحلیلی جدید مشاور ثبت شده در پرونده ۳۶۰ درجه',
                      date: 'امروز'
                    }));
                  } catch (_) {}
                  setShowVoiceModal(false);
                }}
                onCancel={() => setShowVoiceModal(false)}
              />
            </div>
          </div>
        )}

        {/* ۵ بخش پرونده */}
        {activeTab === 'dashboard' && <AdvisorStudentOverview studentName={studentName} studentId={studentId} onNavigateToPlan={() => setActiveTab('plan')} />}
        {activeTab === 'plan' && <AdvisorStudentPlan studentName={studentName} studentId={studentId} />}
        {activeTab === 'report' && <AdvisorStudentReport studentName={studentName} studentId={studentId} />}
        {activeTab === 'exams' && <AdvisorStudentExams studentName={studentName} studentId={studentId} />}
        {activeTab === 'reportcards' && <AdvisorStudentReportCards studentName={studentName} studentId={studentId} />}

      </div>
    </div>
  );
}
