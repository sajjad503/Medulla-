import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building, DollarSign, UserPlus, 
  Ban, CheckCircle, ArrowRight, X, TrendingUp, Eye, Loader2,
  CreditCard, Clock, Check, CheckCircle2, AlertCircle, Edit3,
  ExternalLink, ZoomIn, Download
} from 'lucide-react';
import api from './api';

interface FounderDashboardProps {
  onLogout: () => void;
}

export default function FounderDashboard({ onLogout }: FounderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'finances' | 'institutes' | 'advisors' | 'students' | 'subscriptions'>('subscriptions');
  
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  
  // Subscription & Fee Management States
  const [platformSettings, setPlatformSettings] = useState<any>({
    student_fee: 490000,
    card_number: '6219861408052453',
    card_holder: 'سجاد حامدی',
    bank_name: 'بانک سامان'
  });
  const [newFeeInput, setNewFeeInput] = useState('490000');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);
  const [feeUpdateSuccess, setFeeUpdateSuccess] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingReceiptsCount, setPendingReceiptsCount] = useState(0);
  const [viewReceiptModal, setViewReceiptModal] = useState<any>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [assignModal, setAssignModal] = useState<{ show: boolean; student: any }>({ show: false, student: null });
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  
  const [viewInstitute, setViewInstitute] = useState<any>(null);
  const [viewAdvisor, setViewAdvisor] = useState<any>(null);

  useEffect(() => {
    fetchFounderData();
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const res = await api.get('/subscription/founder/receipts');
      setPayments(res.data.payments || []);
      setPendingReceiptsCount(res.data.pending_count || 0);
      if (res.data.settings) {
        setPlatformSettings(res.data.settings);
        setNewFeeInput(String(res.data.settings.student_fee || 490000));
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    }
  };

  const fetchFounderData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await api.get('/auth/founder/data');
      
      setInstitutes(response.data.institutes || []);
      setAdvisors(response.data.advisors || []);
      setPendingStudents(response.data.pendingStudents || []);
    } catch (error) {
      console.error(error);
      setErrorMsg('خطا در دریافت اطلاعات کلان پلتفرم. دسترسی خود را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    const feeNum = Number(newFeeInput.replace(/[^\d]/g, ''));
    if (!feeNum || feeNum < 10000) {
      return alert('لطفاً یک مبلغ معتبر به تومان وارد نمایید.');
    }
    setIsUpdatingFee(true);
    setFeeUpdateSuccess('');
    try {
      const res = await api.post('/subscription/settings', { student_fee: feeNum });
      setPlatformSettings(res.data.settings);
      setFeeUpdateSuccess('تعرفه اشتراک با موفقیت در کل سامانه به‌روزرسانی شد ✅');
      setTimeout(() => setFeeUpdateSuccess(''), 3500);
    } catch (err) {
      alert('خطا در ذخیره تعرفه.');
    } finally {
      setIsUpdatingFee(false);
    }
  };

  const handleVerifyReceipt = async (paymentId: number, action: 'approve' | 'reject') => {
    const actionLabel = action === 'approve' ? 'تایید فیش و فعال‌سازی اشتراک ۳۰ روزه' : 'رد فیش و مسدودسازی دسترسی دانش‌آموز';
    if (!window.confirm(`آیا از ${actionLabel} اطمینان دارید؟`)) return;

    setVerifyingId(paymentId);
    try {
      const res = await api.post('/subscription/founder/verify', {
        payment_id: paymentId,
        action
      });
      alert(res.data.message);
      fetchSubscriptionData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'خطا در ثبت دستور.');
    } finally {
      setVerifyingId(null);
    }
  };

  const toggleSuspend = async (type: string, id: number) => {
    const confirmMsg = 'آیا از تغییر وضعیت این اکانت مطمئن هستید؟ (تعلیق باعث قطع موقت دسترسی کاربر می‌شود)';
    if (window.confirm(confirmMsg)) {
      try {
        await api.post(`/auth/founder/toggle-status/${id}`);
        if (type === 'institute') {
          setInstitutes(prev => prev.map(inst => inst.id === id ? { ...inst, status: inst.status === 'active' ? 'suspended' : 'active' } : inst));
        } else if (type === 'advisor') {
          setAdvisors(prev => prev.map(adv => adv.id === id ? { ...adv, status: adv.status === 'active' ? 'suspended' : 'active' } : adv));
        }
      } catch (err) {
        alert('خطا در تغییر وضعیت اکانت. لطفاً دوباره تلاش کنید.');
      }
    }
  };

  const handleApproveStudent = async () => {
    if (!selectedAdvisorId) return alert('لطفاً مشاور را انتخاب کنید.');
    
    try {
      await api.post(`/auth/assign-advisor/${assignModal.student.id}?advisor_id=${selectedAdvisorId}`);
      alert(`دانش‌آموز با موفقیت تایید و به مشاور متصل شد.`);
      
      setPendingStudents(prev => prev.filter(s => s.id !== assignModal.student.id));
      setAssignModal({ show: false, student: null });
      setSelectedAdvisorId('');
    } catch (err) {
      alert('خطا در ارتباط با سرور هنگام تخصیص.');
    }
  };

  const totalSystemRevenue = 145000000;
  const totalSystemDebt = institutes.reduce((acc, curr) => acc + (curr.debt || 0), 0);

  const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#C5A880' }}>
        <Loader2 size={40} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '15px', color: '#0C1D3F' }}>در حال بارگذاری مرکز فرماندهی...</h3>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="bento-card" style={{ border: '1px solid #EF4444', textAlign: 'center' }}>
          <h3 style={{ color: '#0C1D3F' }}>{errorMsg}</h3>
          <button onClick={fetchFounderData} className="btn btn-primary" style={{ marginTop: '15px' }}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px' }} className="custom-scrollbar">
      
      {/* هدر پنل مالک */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid #C5A880', background: 'linear-gradient(90deg, rgba(12,29,63,0.05) 0%, rgba(230,194,135,0.15) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#0C1D3F', padding: '12px', borderRadius: '12px', color: '#E6C287', boxShadow: '0 4px 15px rgba(12,29,63,0.3)' }}>
            <Shield size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0C1D3F', fontSize: '22px', fontWeight: '900', letterSpacing: '1px' }}>مرکز فرماندهی مدولا (Founder)</h2>
            <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'bold' }}>دسترسی فوق‌مدیریتی به جریان مالی، موسسات و مشاوران</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="/liara-mymedulla-backend.zip"
            download="liara-mymedulla-backend.zip"
            className="pill-badge"
            style={{
              padding: '8px 14px',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
              color: '#E6C287',
              border: '1px solid #E6C287',
              fontWeight: '900',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(12, 29, 63, 0.4)',
              cursor: 'pointer'
            }}
            title="فایل زیپ اختصاصی برای استقرار در پلتفرم لیارا (پورت ۸۰۰۰ - mymedulla-backend)"
          >
            <Download size={14} color="#E6C287" /> پکیج استقرار لیارا (پورت ۸۰۰۰)
          </a>

          <a
            href="/elementor-medulla-template.json"
            download="elementor-medulla-template.json"
            className="pill-badge"
            style={{
              padding: '8px 14px',
              textDecoration: 'none',
              background: 'rgba(230,194,135,0.2)',
              color: '#0C1D3F',
              border: '1px solid #C5A880',
              fontWeight: '900',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="فایل JSON آماده برای درون‌ریزی در المنتور وردپرس"
          >
            <ExternalLink size={14} color="#0C1D3F" /> قالب آماده المنتور (JSON)
          </a>

          <button onClick={onLogout} className="pill-badge" style={{ padding: '8px 14px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', fontSize: '11px' }}>
            خروج امن <ArrowRight size={14} style={{ marginLeft: '5px' }} />
          </button>
        </div>
      </div>

      {/* کارت‌های آماری کلان */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div className="bento-card" style={{ borderRight: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><DollarSign size={16} /> درآمد کل سیستم (تومان)</div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#10B981', marginTop: '10px' }}>{totalSystemRevenue.toLocaleString()}</div>
        </div>
        <div className="bento-card" style={{ borderRight: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><TrendingUp size={16} /> مطالبات پرداخت‌نشده (تومان)</div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#F59E0B', marginTop: '10px' }}>{totalSystemDebt.toLocaleString()}</div>
        </div>
        <div className="bento-card" style={{ borderRight: '4px solid #0C1D3F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><Building size={16} /> موسسات فعال</div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#0C1D3F', marginTop: '10px' }}>{institutes.filter(i=>i.status==='active').length}</div>
        </div>
        <div className="bento-card" style={{ borderRight: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><UserPlus size={16} /> ثبت‌نام‌های جدید در صف</div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#3B82F6', marginTop: '10px' }}>{pendingStudents.length}</div>
        </div>
      </div>

      {/* تب‌های مدیریت کلان */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '15px', flexWrap: 'wrap' }}>
        {[
          { 
            id: 'subscriptions', 
            label: `تعرفه و تایید فیش‌های اشتراک`, 
            badge: pendingReceiptsCount > 0 ? pendingReceiptsCount : null,
            icon: <CreditCard size={16}/> 
          },
          { id: 'finances', label: 'جریان مالی و مطالبات موسسات', icon: <DollarSign size={16}/> },
          { id: 'institutes', label: 'مدیریت موسسات (آکادمی‌ها)', icon: <Building size={16}/> },
          { id: 'advisors', label: 'پایگاه مشاوران', icon: <Users size={16}/> },
          { id: 'students', label: `تایید دانش‌آموزان (${pendingStudents.length})`, icon: <UserPlus size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
            className="btn" 
            style={{ 
              padding: '10px 18px', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '13px', 
              border: 'none', 
              background: activeTab === tab.id ? '#0C1D3F' : 'transparent', 
              color: activeTab === tab.id ? '#E6C287' : 'gray', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              position: 'relative'
            }}
          >
            {tab.icon} {tab.label}
            {tab.badge && (
              <span style={{
                background: '#EF4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: '900',
                marginRight: '4px'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* =========================================================
          تب ویژه: تعیین تعرفه اشتراک و کارتابل تایید فیش‌های کارت به کارت
      ========================================================= */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* کارت اول: تعیین هزینه پلتفرم و اطلاعات حساب کارت به کارت */}
          <div className="bento-card" style={{ borderRight: '4px solid #C5A880' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: '#0C1D3F', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color="#C5A880" />
                  تنظیم شهریه و حساب کارت به کارت پلتفرم
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'gray' }}>
                  مبلغ تعیین‌شده در اینجا، بلافاصله به عنوان هزینه اشتراک ماهانه کلیه دانش‌آموزان در قفل ورود (Paywall) اعمال می‌شود.
                </p>
              </div>

              <div style={{
                background: 'rgba(230, 194, 135, 0.15)',
                border: '1px solid rgba(197, 168, 128, 0.4)',
                borderRadius: '12px',
                padding: '8px 16px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '11px', color: '#0C1D3F', fontWeight: 'bold' }}>تعرفه فعلی پلتفرم</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0C1D3F', fontFamily: 'monospace' }}>
                  {Number(platformSettings.student_fee).toLocaleString('fa-IR')} <span style={{ fontSize: '11px' }}>تومان</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'center' }}>
              {/* فرم تغییر مبلغ تعرفه */}
              <div style={{ background: 'rgba(12,29,63,0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(12,29,63,0.08)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F', marginBottom: '8px' }}>
                  مبلغ شهریه اشتراک ماهانه دانش‌آموز (تومان):
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    value={newFeeInput}
                    onChange={(e) => setNewFeeInput(e.target.value)}
                    placeholder="مثال: 490000"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      direction: 'ltr',
                      textAlign: 'right'
                    }}
                  />
                  <button
                    onClick={handleUpdateFee}
                    disabled={isUpdatingFee}
                    style={{
                      background: '#0C1D3F',
                      color: '#E6C287',
                      border: '1px solid #C5A880',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: '13px',
                      cursor: isUpdatingFee ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={16} />
                    {isUpdatingFee ? 'در حال ذخیره...' : 'ذخیره تعرفه'}
                  </button>
                </div>

                {feeUpdateSuccess && (
                  <div style={{ color: '#10B981', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>
                    {feeUpdateSuccess}
                  </div>
                )}

                {/* دکمه‌های پیش‌فرض سریع */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {[390000, 490000, 590000, 690000].map(fee => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setNewFeeInput(String(fee))}
                      style={{
                        background: 'rgba(230, 194, 135, 0.2)',
                        border: '1px solid rgba(197, 168, 128, 0.4)',
                        color: '#0C1D3F',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {fee.toLocaleString('fa-IR')} تومان
                    </button>
                  ))}
                </div>
              </div>

              {/* نمایش مشخصات حساب رسمی کارت به کارت */}
              <div style={{
                background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
                color: '#fff',
                padding: '18px 22px',
                borderRadius: '16px',
                border: '1px solid rgba(230, 194, 135, 0.4)',
                boxShadow: '0 8px 20px rgba(12, 29, 63, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#E6C287', fontWeight: 'bold' }}>حساب رسمی واریز کارت به کارت</span>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{platformSettings.bank_name || 'بانک سامان'}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>شماره کارت مصوب سامانه:</div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: '900',
                  color: '#E6C287',
                  letterSpacing: '2px',
                  direction: 'ltr',
                  marginBottom: '10px'
                }}>
                  ۶۲۱۹-۸۶۱۴-۰۸۰۵-۲۴۵۳
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                  <span>نام صاحب حساب:</span>
                  <strong style={{ color: '#fff' }}>{platformSettings.card_holder || 'سجاد حامدی'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* کارت دوم: کارتابل فیش‌های کارت به کارت در انتظار تایید */}
          <div className="bento-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#F59E0B" />
                  کارتابل فیش‌های واریزی در انتظار بررسی
                  <span style={{
                    background: pendingReceiptsCount > 0 ? '#EF4444' : '#10B981',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 10px',
                    fontSize: '12px'
                  }}>
                    {pendingReceiptsCount} فیش در صف
                  </span>
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'gray' }}>
                  دانش‌آموزان به محض آپلود فیش، به مدت ۲۴ ساعت دسترسی موقت دارند تا شما فیش را تایید یا رد فرمایید.
                </p>
              </div>

              <button
                onClick={fetchSubscriptionData}
                className="btn"
                style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#fff' }}
              >
                بروزرسانی لیست فیش‌ها
              </button>
            </div>

            {/* لیست فیش‌های در انتظار */}
            {payments.filter(p => p.status === 'pending').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'gray', background: 'rgba(12,29,63,0.02)', borderRadius: '12px' }}>
                <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', color: '#0C1D3F' }}>هیچ فیشی در انتظار تایید نیست</h4>
                <p style={{ margin: 0, fontSize: '12px' }}>کلیه واریزی‌های ارسالی دانش‌آموزان بررسی و تعیین تکلیف شده‌اند.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {payments.filter(p => p.status === 'pending').map(payment => {
                  const now = Date.now();
                  const graceEnd = payment.grace_until ? new Date(payment.grace_until).getTime() : 0;
                  const remainingHours = graceEnd > now ? Math.round((graceEnd - now) / (1000 * 60 * 60)) : 0;

                  return (
                    <div
                      key={payment.id}
                      style={{
                        background: '#fff',
                        border: '1.5px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '16px',
                        padding: '18px',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        {/* هدر کارت فیش */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: '#0C1D3F' }}>
                              {payment.student_name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'gray', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>
                              {payment.student_phone}
                            </div>
                          </div>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#D97706',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            دسترسی موقت ۲۴ ساعته فعال
                          </span>
                        </div>

                        {/* اطلاعات پرداخت */}
                        <div style={{ background: 'rgba(12,29,63,0.03)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'gray' }}>مبلغ واریزی:</span>
                            <strong style={{ color: '#0C1D3F' }}>{Number(payment.amount).toLocaleString('fa-IR')} تومان</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'gray' }}>کد پیگیری:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#0C1D3F' }}>{payment.tracking_code}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'gray' }}>زمان ارسال:</span>
                            <span>{new Date(payment.submitted_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706', fontWeight: 'bold' }}>
                            <span>مهلت دسترسی اضطراری:</span>
                            <span>{remainingHours > 0 ? `${remainingHours} ساعت باقیمانده` : 'منقضی شده'}</span>
                          </div>
                        </div>

                        {/* تصویر رسید */}
                        {payment.receipt_image && (
                          <div style={{ marginTop: '12px' }}>
                            <button
                              type="button"
                              onClick={() => setViewReceiptModal(payment)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                background: 'rgba(230, 194, 135, 0.15)',
                                border: '1px dashed #C5A880',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#0C1D3F'
                              }}
                            >
                              <ZoomIn size={15} color="#C5A880" />
                              مشاهده تصویر فیش ارسالی دانش‌آموز
                            </button>
                          </div>
                        )}

                        {payment.notes && (
                          <div style={{ fontSize: '11px', color: 'gray', marginTop: '8px', fontStyle: 'italic' }}>
                            یادداشت: {payment.notes}
                          </div>
                        )}
                      </div>

                      {/* دکمه‌های تایید و رد */}
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(12,29,63,0.08)', paddingTop: '12px' }}>
                        <button
                          onClick={() => handleVerifyReceipt(payment.id, 'approve')}
                          disabled={verifyingId === payment.id}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: '#10B981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: verifyingId === payment.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle2 size={16} />
                          تایید فیش (تمدید ۳۰ روزه)
                        </button>

                        <button
                          onClick={() => handleVerifyReceipt(payment.id, 'reject')}
                          disabled={verifyingId === payment.id}
                          style={{
                            padding: '10px 14px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            border: '1px solid #EF4444',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: verifyingId === payment.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={16} />
                          رد فیش
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* کارت سوم: آرشیو کلیه تراکنش‌ها */}
          <div className="bento-card">
            <h3 style={{ margin: '0 0 16px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>
              آرشیو و تاریخچه پرداخت‌های پلتفرم
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>دانش‌آموز</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>مبلغ</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>روش پرداخت</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>کد پیگیری</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>تاریخ</th>
                    <th style={{ padding: '12px', color: '#0C1D3F' }}>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#0C1D3F' }}>{p.student_name}</td>
                      <td style={{ padding: '12px' }} className="mono-num">{Number(p.amount).toLocaleString('fa-IR')} تومان</td>
                      <td style={{ padding: '12px' }}>
                        {p.method === 'gateway' ? (
                          <span style={{ color: '#10B981', fontWeight: 'bold' }}>درگاه مستقیم آنلاین</span>
                        ) : (
                          <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>کارت به کارت</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{p.tracking_code}</td>
                      <td style={{ padding: '12px', fontSize: '11px', color: 'gray' }}>
                        {new Date(p.submitted_at).toLocaleDateString('fa-IR')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: p.status === 'approved' ? 'rgba(16,185,129,0.1)' : (p.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'),
                          color: p.status === 'approved' ? '#10B981' : (p.status === 'pending' ? '#D97706' : '#EF4444')
                        }}>
                          {p.status === 'approved' ? 'تایید شده (فعال)' : (p.status === 'pending' ? 'در انتظار بررسی' : 'رد شده')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', color: 'gray' }}>هیچ پرداختی ثبت نشده است.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          تب ۱: جریان مالی
      ========================================================= */}
      {activeTab === 'finances' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>وضعیت مالی و بدهی موسسات</h3>
          <p style={{ fontSize: '13px', color: 'gray', marginBottom: '20px' }}>در صورت عدم پرداخت شهریه پلتفرم، می‌توانید با یک کلیک دسترسی موسسه و مشاورانش را تعلیق کنید.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>نام موسسه / شخص</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>بدهی به پلتفرم (تومان)</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>گردش مالی ماهانه</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>وضعیت اکانت</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات سریع</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map(inst => (
                  <tr key={inst.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                    <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{inst.name}</td>
                    <td style={{ padding: '15px', color: inst.debt > 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }} className="mono-num">
                      {inst.debt > 0 ? inst.debt.toLocaleString() : 'تسویه شده'}
                    </td>
                    <td style={{ padding: '15px' }} className="mono-num">
                      {(inst.revenue || 0).toLocaleString()} تومان
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span className="pill-badge" style={{ background: inst.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: inst.status === 'active' ? '#10B981' : '#EF4444', borderColor: 'transparent' }}>
                        {inst.status === 'active' ? 'فعال' : 'تعلیق شده'}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button onClick={() => toggleSuspend('institute', inst.id)} className="btn" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', background: inst.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: inst.status === 'active' ? '#EF4444' : '#10B981', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Ban size={14} /> {inst.status === 'active' ? 'مسدودسازی دسترسی' : 'رفع مسدودی'}
                      </button>
                    </td>
                  </tr>
                ))}
                {institutes.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', color: 'gray' }}>هیچ موسسه‌ای ثبت نشده است.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          تب ۲: مدیریت موسسات
      ========================================================= */}
      {activeTab === 'institutes' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>موسسات و آکادمی‌های تحت قرارداد</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>نام موسسه</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>مدیر مسئول</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>تیم مشاوران</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>کل شاگردان</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {institutes.map(inst => (
                  <tr key={inst.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)', opacity: inst.status === 'suspended' ? 0.6 : 1 }}>
                    <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{inst.name}</td>
                    <td style={{ padding: '15px', color: 'gray' }}>{inst.manager}</td>
                    <td style={{ padding: '15px' }} className="mono-num">{inst.advisorCount} نفر</td>
                    <td style={{ padding: '15px' }} className="mono-num">{inst.studentCount} نفر</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => setViewInstitute(inst)} className="pill-badge" style={{ padding: '6px 12px', cursor: 'pointer', borderColor: '#0C1D3F', color: '#0C1D3F' }}>
                          <Eye size={14} /> آمار دقیق
                        </button>
                        <button onClick={() => toggleSuspend('institute', inst.id)} className="pill-badge" style={{ padding: '6px 12px', cursor: 'pointer', background: inst.status === 'active' ? 'transparent' : '#EF4444', color: inst.status === 'active' ? '#EF4444' : '#fff', borderColor: '#EF4444' }}>
                          <Ban size={14} /> {inst.status === 'active' ? 'تعلیق موسسه' : 'رفع تعلیق'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          تب ۳: پایگاه مشاوران
      ========================================================= */}
      {activeTab === 'advisors' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>مدیریت تمامی مشاوران پلتفرم</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>نام مشاور</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>موسسه وابسته</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>تعداد شاگرد</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {advisors.map(adv => (
                  <tr key={adv.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)', opacity: adv.status === 'suspended' ? 0.6 : 1 }}>
                    <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{adv.name}</td>
                    <td style={{ padding: '15px', color: 'gray' }}>{adv.institute}</td>
                    <td style={{ padding: '15px' }} className="mono-num">{adv.studentCount}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => setViewAdvisor(adv)} className="pill-badge" style={{ padding: '6px 12px', cursor: 'pointer', borderColor: '#0C1D3F', color: '#0C1D3F' }}>
                          <Eye size={14} /> جزئیات مشاور
                        </button>
                        <button onClick={() => toggleSuspend('advisor', adv.id)} className="pill-badge" style={{ padding: '6px 12px', cursor: 'pointer', background: adv.status === 'active' ? 'transparent' : '#EF4444', color: adv.status === 'active' ? '#EF4444' : '#fff', borderColor: '#EF4444' }}>
                          <Ban size={14} /> {adv.status === 'active' ? 'تعلیق اکانت' : 'رفع تعلیق'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          تب ۴: تایید دانش‌آموزان جدید
      ========================================================= */}
      {activeTab === 'students' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#C5A880" /> ثبت‌نام‌های جدید در کل سیستم
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>شماره موبایل</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>تاریخ</th>
                  <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات (تایید و تخصیص)</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map(student => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                    <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{student.name}</td>
                    <td style={{ padding: '15px', letterSpacing: '1px' }} className="mono-num">{student.phone}</td>
                    <td style={{ padding: '15px', color: 'gray' }} className="mono-num">{student.date}</td>
                    <td style={{ padding: '15px' }}>
                      <button onClick={() => setAssignModal({ show: true, student })} className="gold-glow-btn" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle size={14} /> اتصال به مشاور
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingStudents.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '30px', color: 'gray' }}>دانش‌آموز جدیدی در صف تایید نیست.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          مودال‌ها
      ========================================================= */}

      {assignModal.show && (
        <div style={overlayStyle}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '420px', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '10px' }}>تخصیص مشاور به {assignModal.student?.name}</h3>
            <p style={{ fontSize: '13px', color: 'gray', marginBottom: '15px' }}>این دانش‌آموز را به کدام مشاور در سیستم متصل می‌کنید؟</p>
            <select 
              className="input-box" 
              value={selectedAdvisorId} 
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
            >
              <option value="">-- لیست کل مشاوران پلتفرم --</option>
              {advisors.filter(a => a.status === 'active').map(adv => (
                <option key={adv.id} value={adv.id}>{adv.name} ({adv.institute}) - {adv.studentCount} شاگرد</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAssignModal({ show: false, student: null })} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid gray', color: 'gray', padding: '10px', borderRadius: '8px' }}>انصراف</button>
              <button onClick={handleApproveStudent} className="gold-glow-btn" style={{ flex: 2, padding: '10px', borderRadius: '8px' }}>تایید و اتصال</button>
            </div>
          </div>
        </div>
      )}

      {viewInstitute && (
        <div style={overlayStyle}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '500px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '18px', fontWeight: '900' }}><Building size={20} style={{verticalAlign:'middle', color:'#C5A880'}}/> ریزآمار {viewInstitute.name}</h3>
              <button onClick={() => setViewInstitute(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="gray"/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(12,29,63,0.03)', borderRadius: '8px' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>مدیر مسئول موسسه:</span>
                <span style={{ fontWeight: 'bold', color: '#0C1D3F' }}>{viewInstitute.manager}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(12,29,63,0.03)', borderRadius: '8px' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>تعداد مشاوران فعال:</span>
                <span style={{ fontWeight: 'bold', color: '#0C1D3F' }} className="mono-num">{viewInstitute.advisorCount} نفر</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(12,29,63,0.03)', borderRadius: '8px' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>کل دانش‌آموزان مجموعه:</span>
                <span style={{ fontWeight: 'bold', color: '#0C1D3F' }} className="mono-num">{viewInstitute.studentCount} نفر</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(12,29,63,0.03)', borderRadius: '8px' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>میزان بدهی / مطالبات:</span>
                <span style={{ fontWeight: 'bold', color: viewInstitute.debt > 0 ? '#EF4444' : '#10B981' }} className="mono-num">{viewInstitute.debt.toLocaleString()} تومان</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewAdvisor && (
        <div style={overlayStyle}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '420px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '18px', fontWeight: '900' }}><Users size={20} style={{verticalAlign:'middle', color:'#C5A880'}}/> آمار عملکرد {viewAdvisor.name}</h3>
              <button onClick={() => setViewAdvisor(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="gray"/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(12,29,63,0.1)' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>وابستگی سازمانی:</span>
                <span style={{ fontWeight: 'bold', color: '#0C1D3F', fontSize: '13px' }}>{viewAdvisor.institute}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(12,29,63,0.1)' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>دانش‌آموزان تحت نظر:</span>
                <span style={{ fontWeight: 'bold', color: '#0C1D3F', fontSize: '14px' }} className="mono-num">{viewAdvisor.studentCount} شاگرد</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid rgba(12,29,63,0.1)' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>وضعیت اکانت مشاور:</span>
                <span style={{ fontWeight: 'bold', color: viewAdvisor.status === 'active' ? '#10B981' : '#EF4444', fontSize: '13px' }}>
                  {viewAdvisor.status === 'active' ? 'فعال' : 'تعلیق شده'}
                </span>
              </div>
            </div>
            <button onClick={() => toggleSuspend('advisor', viewAdvisor.id)} className="btn" style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '8px', background: viewAdvisor.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: viewAdvisor.status === 'active' ? '#EF4444' : '#10B981', border: 'none', fontWeight: 'bold' }}>
              {viewAdvisor.status === 'active' ? 'مسدود کردن موقت این مشاور' : 'رفع مسدودی و بازگشایی'}
            </button>
          </div>
        </div>
      )}

      {/* مودال بزرگنمایی فیش کارت به کارت */}
      {viewReceiptModal && (
        <div style={overlayStyle} onClick={() => setViewReceiptModal(null)}>
          <div 
            className="bento-card" 
            style={{ width: '90%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.25s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '17px', fontWeight: '900' }}>
                  فیش واریزی {viewReceiptModal.student_name}
                </h3>
                <span style={{ fontSize: '12px', color: 'gray' }}>
                  کد پیگیری: <strong style={{ fontFamily: 'monospace' }}>{viewReceiptModal.tracking_code}</strong>
                </span>
              </div>
              <button onClick={() => setViewReceiptModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="gray" />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src={viewReceiptModal.receipt_image}
                alt="تصویر فیش"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              />
            </div>

            <div style={{ background: 'rgba(12,29,63,0.03)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'gray' }}>مبلغ واریزی:</span>
                <strong>{Number(viewReceiptModal.amount).toLocaleString('fa-IR')} تومان</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'gray' }}>شماره تماس دانش‌آموز:</span>
                <span style={{ fontFamily: 'monospace' }}>{viewReceiptModal.student_phone}</span>
              </div>
              {viewReceiptModal.notes && (
                <div style={{ borderTop: '1px solid rgba(12,29,63,0.08)', paddingTop: '6px', color: 'gray', fontSize: '12px' }}>
                  یادداشت دانش‌آموز: {viewReceiptModal.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  handleVerifyReceipt(viewReceiptModal.id, 'approve');
                  setViewReceiptModal(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10B981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={16} />
                تایید فیش (فعال‌سازی ۳۰ روزه)
              </button>

              <button
                onClick={() => {
                  handleVerifyReceipt(viewReceiptModal.id, 'reject');
                  setViewReceiptModal(null);
                }}
                style={{
                  padding: '12px 18px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  border: '1px solid #EF4444',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <X size={16} />
                رد فیش
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
