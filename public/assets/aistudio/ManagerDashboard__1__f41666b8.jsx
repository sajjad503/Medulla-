import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, UserCheck, UserPlus, Settings, 
  BarChart, ArrowRight, CheckCircle, XCircle, Search, Loader2 
} from 'lucide-react';
import api from './api';

function ManagerDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [assignModal, setAssignModal] = useState({ show: false, student: null });
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // دریافت اطلاعات پایه از سرور در زمان لود شدن
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      
      // اجرای همزمان دو درخواست به سرور برای سرعت بیشتر
      const [studentsRes, advisorsRes] = await Promise.all([
        api.get('/auth/pending-students'),
        api.get('/auth/advisors-list')
      ]);
      
      setPendingStudents(studentsRes.data);
      setAdvisors(advisorsRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('خطا در دریافت اطلاعات. بررسی کنید آیا با حساب "مدیر کل" وارد شده‌اید؟');
    } finally {
      setIsLoading(false);
    }
  };

  // تایید دانش‌آموز و ارسال به سرور
  const handleApproveAndAssign = async () => {
    if (!selectedAdvisor) {
      alert('لطفاً یک مشاور را انتخاب کنید.');
      return;
    }
    
    setActionLoading(true);
    try {
      await api.post(`/auth/assign-advisor/${assignModal.student.id}?advisor_id=${selectedAdvisor}`);
      
      alert(`دانش‌آموز ${assignModal.student.name} با موفقیت تایید شد.`);
      // حذف دانش‌آموز تایید شده از لیست انتظار (بدون نیاز به رفرش کل صفحه)
      setPendingStudents(prev => prev.filter(s => s.id !== assignModal.student.id));
      setAssignModal({ show: false, student: null });
      setSelectedAdvisor('');
    } catch (err) {
      alert('خطا در تخصیص مشاور. لطفاً دوباره تلاش کنید.');
    } finally {
      setActionLoading(false);
    }
  };

  // رد ثبت‌نام و ارسال به سرور
  const handleReject = async (studentName, id) => {
    if (window.confirm(`آیا از رد ثبت‌نام و حذف اکانت ${studentName} مطمئن هستید؟`)) {
      try {
        await api.delete(`/auth/reject-student/${id}`);
        setPendingStudents(prev => prev.filter(s => s.id !== id));
        alert('اکانت با موفقیت حذف شد.');
      } catch (err) {
        alert('خطا در حذف اکانت.');
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#C5A880' }}>
        <Loader2 size={40} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '15px', color: '#0C1D3F' }}>در حال ارتباط با هسته مرکزی آکادمی...</h3>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="bento-card" style={{ border: '1px solid #EF4444', textAlign: 'center' }}>
          <h3 style={{ color: '#0C1D3F' }}>{errorMsg}</h3>
          <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '15px' }}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out', paddingBottom: '40px' }} className="custom-scrollbar">
      
      {/* هدر پنل مدیریت */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid #C5A880' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: '#0C1D3F', padding: '10px', borderRadius: '12px', color: '#E6C287' }}>
            <Shield size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0C1D3F', fontSize: '20px', fontWeight: '900' }}>پنل مدیریت کل (Founder)</h2>
            <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'bold' }}>دسترسی کامل به تمام بخش‌های آکادمی منتورا</span>
          </div>
        </div>
        <button onClick={onLogout} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none' }}>
          خروج از سیستم <ArrowRight size={16} style={{ marginLeft: '5px' }} />
        </button>
      </div>

      {/* کارت‌های آماری */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div className="bento-card" style={{ borderRight: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><UserPlus size={16} /> در انتظار تایید</div>
          <div className="mono-num" style={{ fontSize: '30px', color: '#F59E0B', marginTop: '10px' }}>{pendingStudents.length}</div>
        </div>
        <div className="bento-card" style={{ borderRight: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><Users size={16} /> کل دانش‌آموزان ثبت‌شده</div>
          <div className="mono-num" style={{ fontSize: '30px', color: '#10B981', marginTop: '10px' }}>...</div>
        </div>
        <div className="bento-card" style={{ borderRight: '4px solid #0C1D3F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><UserCheck size={16} /> تیم مشاوران</div>
          <div className="mono-num" style={{ fontSize: '30px', color: '#0C1D3F', marginTop: '10px' }}>{advisors.length}</div>
        </div>
      </div>

      {/* تب‌های مدیریت */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '15px' }}>
        <button onClick={() => setActiveTab('pending')} className="btn" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', border: 'none', background: activeTab === 'pending' ? '#0C1D3F' : 'transparent', color: activeTab === 'pending' ? '#E6C287' : 'gray', cursor: 'pointer' }}>
          ثبت‌نام‌های جدید ({pendingStudents.length})
        </button>
        <button onClick={() => setActiveTab('advisors')} className="btn" style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', border: 'none', background: activeTab === 'advisors' ? '#0C1D3F' : 'transparent', color: activeTab === 'advisors' ? '#E6C287' : 'gray', cursor: 'pointer' }}>
          مدیریت مشاوران
        </button>
      </div>

      {/* محتوای تب: تایید ثبت‌نام‌ها */}
      {activeTab === 'pending' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#C5A880" /> بررسی و تخصیص دانش‌آموزان جدید
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>شماره موبایل</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>تاریخ ثبت‌نام</th>
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
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => setAssignModal({ show: true, student })} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle size={14} /> تایید و انتخاب مشاور
                      </button>
                      <button onClick={() => handleReject(student.name, student.id)} style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 12px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <XCircle size={14} /> رد کردن
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingStudents.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '30px', color: 'gray' }}>هیچ ثبت‌نام جدیدی در انتظار تایید نیست.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* پاپ‌آپ تخصیص به مشاور */}
      {assignModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '400px', animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '10px' }}>تخصیص مشاور به {assignModal.student?.name}</h3>
            <p style={{ fontSize: '13px', color: 'gray', marginBottom: '15px' }}>یک مشاور را از لیست زیر انتخاب کنید تا پنل دانش‌آموز فعال شود:</p>
            
            <select 
              className="input-box" 
              value={selectedAdvisor} 
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="">-- انتخاب مشاور --</option>
              {advisors.map(adv => (
                <option key={adv.id} value={adv.id}>{adv.name} (تعداد شاگرد: {adv.studentCount})</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAssignModal({ show: false, student: null })} className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid gray', color: 'gray', padding: '10px', borderRadius: '8px' }}>انصراف</button>
              <button 
                onClick={handleApproveAndAssign} 
                disabled={actionLoading}
                className="gold-glow-btn" 
                style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'تایید نهایی'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManagerDashboard;
