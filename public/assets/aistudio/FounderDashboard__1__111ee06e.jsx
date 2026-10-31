import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Building, DollarSign, UserPlus, 
  Ban, CheckCircle, ArrowRight, X, TrendingUp, Search, Eye, Loader2
} from 'lucide-react';
import api from './api';

function FounderDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('finances');
  
  // استیت‌های دیتای زنده از سرور
  const [institutes, setInstitutes] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // مودال‌ها
  const [assignModal, setAssignModal] = useState({ show: false, student: null });
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  
  const [viewInstitute, setViewInstitute] = useState(null);
  const [viewAdvisor, setViewAdvisor] = useState(null);

  // دریافت دیتا هنگام لود شدن صفحه
  useEffect(() => {
    fetchFounderData();
  }, []);

  const fetchFounderData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const response = await api.get('/auth/founder/data');
      
      setInstitutes(response.data.institutes);
      setAdvisors(response.data.advisors);
      setPendingStudents(response.data.pendingStudents);
    } catch (error) {
      console.error(error);
      setErrorMsg('خطا در دریافت اطلاعات کلان پلتفرم. دسترسی خود را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  // هندلر تعلیق / فعال‌سازی اکانت‌ها در دیتابیس
  const toggleSuspend = async (type, id) => {
    const confirmMsg = 'آیا از تغییر وضعیت این اکانت مطمئن هستید؟ (تعلیق باعث قطع دسترسی کاربر می‌شود)';
    if (window.confirm(confirmMsg)) {
      try {
        await api.post(`/auth/founder/toggle-status/${id}`);
        // آپدیت کردن ظاهر (UI) بدون نیاز به رفرش کل صفحه
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

  // هندلر تایید دانش‌آموز جدید
  const handleApproveStudent = async () => {
    if (!selectedAdvisorId) return alert('لطفاً مشاور را انتخاب کنید.');
    
    try {
      // استفاده از همان API تخصیص مشاور که در Manager نوشتیم
      await api.post(`/auth/assign-advisor/${assignModal.student.id}?advisor_id=${selectedAdvisorId}`);
      alert(`دانش‌آموز با موفقیت تایید و به پلتفرم متصل شد.`);
      
      setPendingStudents(prev => prev.filter(s => s.id !== assignModal.student.id));
      setAssignModal({ show: false, student: null });
      setSelectedAdvisorId('');
    } catch (err) {
      alert('خطا در ارتباط با سرور هنگام تخصیص.');
    }
  };

  const totalSystemRevenue = 145000000; // این عدد را در آینده می‌توانیم داینامیک کنیم
  const totalSystemDebt = institutes.reduce((acc, curr) => acc + (curr.debt || 0), 0);

  const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh', color: '#C5A880' }}>
        <Loader2 size={40} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
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
            <h2 style={{ margin: 0, color: '#0C1D3F', fontSize: '22px', fontWeight: '900', letterSpacing: '1px' }}>مرکز فرماندهی منتورا (Founder)</h2>
            <span style={{ fontSize: '12px', color: 'gray', fontWeight: 'bold' }}>دسترسی فوق‌مدیریتی به جریان مالی، موسسات و مشاوران</span>
          </div>
        </div>
        <button onClick={onLogout} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none' }}>
          خروج امن <ArrowRight size={16} style={{ marginLeft: '5px' }} />
        </button>
      </div>

      {/* کارت‌های آماری کلان */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray', fontSize: '13px', fontWeight: 'bold' }}><UserPlus size={16} /> ثبت‌نام‌های جدید</div>
          <div className="mono-num" style={{ fontSize: '28px', color: '#3B82F6', marginTop: '10px' }}>{pendingStudents.length}</div>
        </div>
      </div>

      {/* تب‌های مدیریت کلان */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(12,29,63,0.1)', paddingBottom: '15px', flexWrap: 'wrap' }}>
        {[
          { id: 'finances', label: 'جریان مالی و مطالبات', icon: <DollarSign size={16}/> },
          { id: 'institutes', label: 'مدیریت موسسات (آکادمی‌ها)', icon: <Building size={16}/> },
          { id: 'advisors', label: 'پایگاه مشاوران', icon: <Users size={16}/> },
          { id: 'students', label: `تایید دانش‌آموزان (${pendingStudents.length})`, icon: <UserPlus size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className="btn" 
            style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', border: 'none', background: activeTab === tab.id ? '#0C1D3F' : 'transparent', color: activeTab === tab.id ? '#E6C287' : 'gray', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          تب ۱: جریان مالی
      ========================================================= */}
      {activeTab === 'finances' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 15px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>وضعیت مالی و بدهی موسسات</h3>
          <p style={{ fontSize: '13px', color: 'gray', marginBottom: '20px' }}>در صورت عدم پرداخت، می‌توانید با یک کلیک کل دسترسی موسسه و مشاورانش را تعلیق کنید.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>نام موسسه / شخص</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>بدهی (تومان)</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>وضعیت اکانت</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات سریع</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map(inst => (
                <tr key={inst.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                  <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{inst.name}</td>
                  <td style={{ padding: '15px', color: inst.debt > 0 ? '#EF4444' : '#10B981' }} className="mono-num">
                    {inst.debt > 0 ? inst.debt.toLocaleString() : 'تسویه شده'}
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
              {institutes.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', color: 'gray' }}>هیچ مدیر/موسسه‌ای ثبت نشده است.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          تب ۲: مدیریت موسسات
      ========================================================= */}
      {activeTab === 'institutes' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>موسسات و آکادمی‌های تحت قرارداد</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>نام موسسه</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>تیم مشاوران</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>کل شاگردان</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {institutes.map(inst => (
                <tr key={inst.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)', opacity: inst.status === 'suspended' ? 0.6 : 1 }}>
                  <td style={{ padding: '15px', fontWeight: '900', color: '#0C1D3F' }}>{inst.name}</td>
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
      )}

      {/* =========================================================
          تب ۳: پایگاه مشاوران
      ========================================================= */}
      {activeTab === 'advisors' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>مدیریت تمامی مشاوران پلتفرم</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>نام مشاور</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>موسسه وابسته‌</th>
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
      )}

      {/* =========================================================
          تب ۴: تایید دانش‌آموزان جدید
      ========================================================= */}
      {activeTab === 'students' && (
        <div className="bento-card">
          <h3 style={{ margin: '0 0 20px 0', color: '#0C1D3F', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} color="#C5A880" /> ثبت‌نام‌های جدید در کل سیستم
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>نام دانش‌آموز</th>
                <th style={{ padding: '15px', color: '#0C1D3F' }}>موبایل</th>
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
      )}

      {/* =========================================================
          مودال‌ها (پاپ‌آپ‌ها)
      ========================================================= */}

      {assignModal.show && (
        <div style={overlayStyle}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '400px', animation: 'fadeIn 0.3s ease-out' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(12,29,63,0.03)', borderRadius: '8px' }}>
                <span style={{ color: 'gray', fontSize: '13px' }}>مدیر موسسه:</span>
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
            </div>
          </div>
        </div>
      )}

      {viewAdvisor && (
        <div style={overlayStyle}>
          <div className="bento-card" style={{ width: '90%', maxWidth: '400px', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '18px', fontWeight: '900' }}><Users size={20} style={{verticalAlign:'middle', color:'#C5A880'}}/> آمار عملکرد {viewAdvisor.name}</h3>
              <button onClick={() => setViewAdvisor(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="gray"/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

    </div>
  );
}

export default FounderDashboard;