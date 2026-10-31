import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, User, Phone, GraduationCap, School, 
  Target, Award, BookOpen, AlertCircle, Sparkles, Upload, FileText, Check 
} from 'lucide-react';
import api from './api';
import MentoraLogo from './MentoraLogo';
import { showVoiceToast } from './VoiceComponents';

interface StudentOnboardingModalProps {
  initialPhone?: string;
  initialName?: string;
  onComplete: (data: any) => void;
}

export default function StudentOnboardingModal({ 
  initialPhone = '09120000004', 
  initialName = 'یاشا محبی', 
  onComplete 
}: StudentOnboardingModalProps) {
  const [fullName, setFullName] = useState(initialName);
  const [studentPhone, setStudentPhone] = useState(initialPhone);
  const [parentPhone, setParentPhone] = useState('');
  const [grade, setGrade] = useState('12');
  const [major, setMajor] = useState('tajrobi');
  const [schoolName, setSchoolName] = useState('');
  const [targetField, setTargetField] = useState('پزشکی دانشگاه تهران');
  const [lastTaraz, setLastTaraz] = useState('7120');

  // Personality tests status
  const [mbtiType, setMbtiType] = useState('INTJ');
  const [hollandType, setHollandType] = useState('تحقیقی - واقع‌گرا (IR)');
  const [neoUploaded, setNeoUploaded] = useState(false);

  // Invite linkage state
  const [inviteCode, setInviteCode] = useState('');
  const [invitedAdvisor, setInvitedAdvisor] = useState<any>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check URL or localStorage for invite code on mount
  useEffect(() => {
    let code = '';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      code = params.get('invite') || params.get('advisor') || '';
      if (!code) {
        code = localStorage.getItem('mentora_invite_code') || '';
      }
    }

    if (code) {
      setInviteCode(code);
      setIsLoadingInvite(true);
      api.get(`/auth/invite-info/${code}`)
        .then(res => {
          if (res.data?.valid && res.data.advisor) {
            setInvitedAdvisor(res.data.advisor);
            localStorage.setItem('mentora_invite_code', code);
          }
        })
        .catch(() => {
          // Fallback if network or code not found
        })
        .finally(() => {
          setIsLoadingInvite(false);
        });
    }
  }, []);

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/[\s-]/g, '');
    return /^09[0-9]{9}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    if (!studentPhone || !validatePhone(studentPhone)) {
      setErrorMsg('شماره موبایل دانش‌آموز نامعتبر است (باید ۱۱ رقم باشد و با ۰۹ شروع شود).');
      return;
    }

    if (!parentPhone || !validatePhone(parentPhone)) {
      setErrorMsg('شماره موبایل والد (پدر یا مادر) الزامی و باید ۱۱ رقم باشد.');
      return;
    }

    if (studentPhone === parentPhone) {
      setErrorMsg('شماره موبایل والد نمی‌تواند با شماره موبایل خود دانش‌آموز یکی باشد!');
      return;
    }

    if (!schoolName.trim()) {
      setErrorMsg('لطفاً نام مدرسه یا دبیرستان خود را وارد کنید.');
      return;
    }

    if (!targetField.trim()) {
      setErrorMsg('لطفاً رشته و دانشگاه هدف خود را مشخص کنید.');
      return;
    }

    const gradeLabels: Record<string, string> = {
      '10': 'دهم',
      '11': 'یازدهم',
      '12': 'دوازدهم',
      'pusht': 'فارغ‌التحصیل (پشت کنکور)'
    };

    const majorLabels: Record<string, string> = {
      'tajrobi': 'علوم تجربی',
      'riazi': 'ریاضی فیزیک',
      'ensani': 'علوم انسانی',
      'honar': 'هنر / زبان تخصصی'
    };

    setSubmitting(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        phone_number: studentPhone.trim(),
        parent_phone: parentPhone.trim(),
        grade: gradeLabels[grade] || 'دوازدهم',
        major: majorLabels[major] || 'علوم تجربی',
        school_name: schoolName.trim(),
        target_field: targetField.trim(),
        last_taraz: lastTaraz || '7000',
        personality_tests: {
          mbti: mbtiType,
          holland: hollandType,
          neo_uploaded: neoUploaded
        },
        invite_code: inviteCode || (invitedAdvisor?.invite_code || '')
      };

      const res = await api.post('/auth/complete-onboarding', payload);

      if (res.data?.access_token) {
        localStorage.setItem('mentora_token', res.data.access_token);
      }

      // Mark locally as onboarded for this session
      localStorage.setItem('mentora_student_profile', JSON.stringify(res.data?.student || payload));
      localStorage.setItem('mentora_onboarded_status', 'true');
      localStorage.removeItem('mentora_invite_code');

      showVoiceToast('🎉 پرونده مشاوره با موفقیت تکمیل شد! به مدولا خوش آمدید.', 'success');
      onComplete(res.data?.student || payload);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'خطا در ثبت اطلاعات. لطفاً مجدداً تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="onboarding-overlay" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(12, 29, 63, 0.88)', 
        backdropFilter: 'blur(12px)', 
        zIndex: 99999, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '16px',
        direction: 'rtl'
      }}
    >
      <div 
        className="bento-card custom-scrollbar" 
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          background: '#FDFBF7', 
          padding: '30px 24px', 
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          border: '1.5px solid var(--gold)',
          animation: 'fadeIn 0.3s ease-out',
          margin: 0
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', margin: '0 auto 10px auto' }}>
            <MentoraLogo style={{ filter: 'drop-shadow(0 4px 10px rgba(230,194,135,0.4))' }} />
          </div>
          <h2 style={{ color: 'var(--primary)', fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0' }}>
            فرم ورود اولیه و پرونده مشاوره تحصیلی
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
            تکمیل تمامی فیلدها جهت تدوین دقیق برنامه هفتگی و اتصال به مشاور الزامی است
          </p>
        </div>

        {/* Invited Advisor Banner if arrived via link */}
        {invitedAdvisor && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(230, 194, 135, 0.2) 100%)',
            border: '1.5px solid #10B981',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#065F46', fontWeight: 'bold', display: 'block' }}>
                  اتصال مستقیم از طریق لینک دعوت مشاور:
                </span>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#0C1D3F' }}>
                  {invitedAdvisor.full_name} ({invitedAdvisor.grade || 'مشاور ارشد کنکور'})
                </span>
              </div>
            </div>
            <span className="pill-badge" style={{ background: '#10B981', color: '#fff', fontSize: '11px', border: 'none' }}>
              تایید اتصال آنی
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #EF4444',
            color: '#B91C1C',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Personal & Contact */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <User size={16} color="var(--gold-dark)" /> اطلاعات فردی و شماره‌های تماس الزامی
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  نام و نام خانوادگی دانش‌آموز: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="input-box" 
                  placeholder="مثال: یاشا محبی" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  شماره موبایل دانش‌آموز: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  className="input-box" 
                  placeholder="0912xxxxxxx" 
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  شماره موبایل والد (پدر / مادر): <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="tel" 
                  className="input-box" 
                  placeholder="0912xxxxxxx (جهت هماهنگی جلسات)" 
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  نام مدرسه یا دبیرستان: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="input-box" 
                  placeholder="مثال: دبیرستان علامه حلی، نمونه دولتی..." 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Educational Level & Major */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <GraduationCap size={16} color="var(--gold-dark)" /> پایه و رشته تحصیلی
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  پایه تحصیلی: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select 
                  className="input-box" 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <option value="10">پایه دهم</option>
                  <option value="11">پایه یازدهم</option>
                  <option value="12">پایه دوازدهم</option>
                  <option value="pusht">فارغ‌التحصیل (پشت کنکوری)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  رشته تحصیلی: <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select 
                  className="input-box" 
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <option value="tajrobi">علوم تجربی</option>
                  <option value="riazi">ریاضی فیزیک</option>
                  <option value="ensani">علوم انسانی</option>
                  <option value="honar">هنر / زبان تخصصی</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  رشته و دانشگاه رویایی (هدف اصلی): <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  className="input-box" 
                  placeholder="مثال: پزشکی دانشگاه تهران، مهندسی برق شریف..." 
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px', display: 'block' }}>
                  آخرین تراز آزمون آزمایشی (یا معدل):
                </label>
                <input 
                  type="number" 
                  className="input-box mono-num" 
                  placeholder="مثال: 7120" 
                  value={lastTaraz}
                  onChange={(e) => setLastTaraz(e.target.value)}
                  style={{ width: '100%', fontSize: '13px', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic / Personality assessments */}
          <div style={{ background: 'rgba(12, 29, 63, 0.04)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(12, 29, 63, 0.1)', marginBottom: '25px' }}>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Sparkles size={16} color="var(--gold-dark)" /> آزمون‌های شخصیت‌شناسی و روان‌شناختی (جهت تنظیم سبک مطالعه)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>تیپ شخصیتی MBTI:</span>
                <select 
                  className="input-box" 
                  value={mbtiType} 
                  onChange={(e) => setMbtiType(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                >
                  <option value="INTJ">INTJ (معمار / استراتژیست)</option>
                  <option value="INTP">INTP (متفکر / تحلیل‌گر)</option>
                  <option value="ENTJ">ENTJ (فرمانده / پیشرو)</option>
                  <option value="ENTP">ENTP (مبتکر / مجادله‌گر)</option>
                  <option value="INFJ">INFJ (حامی / الهام‌بخش)</option>
                  <option value="INFP">INFP (میانجی / آرمان‌گرا)</option>
                  <option value="ENFJ">ENFJ (قهرمان / رهبر کاریزماتیک)</option>
                  <option value="ENFP">ENFP (پیکارگر / پرانرژی)</option>
                  <option value="ISTJ">ISTJ (منطقی / عمل‌گرا و منظم)</option>
                  <option value="ISFJ">ISFJ (مدافع / مسئولیت‌پذیر)</option>
                  <option value="ESTJ">ESTJ (مجری / مدیر مقتدر)</option>
                  <option value="ESFJ">ESFJ (سفیر / اجتماعی و همدل)</option>
                </select>
              </div>

              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>استعدادسنجی شغلی هالند:</span>
                <select 
                  className="input-box" 
                  value={hollandType} 
                  onChange={(e) => setHollandType(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px' }}
                >
                  <option value="تحقیقی - واقع‌گرا (IR)">تحقیقی - واقع‌گرا (مناسب پزشکی و مهندسی)</option>
                  <option value="اجتماعی - متهور (SE)">اجتماعی - متهور (مناسب مدیریت و حقوق)</option>
                  <option value="هنری - ادراکی (A)">هنری و ادراکی (طراحی و زبان)</option>
                  <option value="قراردادی - منظم (C)">قراردادی - محاسباتی (اقتصاد و حسابداری)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button 
            type="submit" 
            disabled={submitting}
            className="gold-glow-btn" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '15px', 
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: submitting ? 'wait' : 'pointer'
            }}
          >
            {submitting ? 'در حال ثبت اطلاعات و اتصال به مشاور...' : 'ثبت قطعی اطلاعات و ورود به میز کار تحصیلی'}
            <CheckCircle2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
