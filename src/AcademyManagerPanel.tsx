import React, { useState } from 'react';
import { 
  Search, Users, Wallet, Settings, Megaphone, Bell, 
  ArrowRightLeft, FileText, Download, Building, Plug, 
  Link as LinkIcon, BarChart3, Target, Plus, Cloud, LogOut
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

interface AcademyManagerPanelProps {
  onLogout?: () => void;
}

export default function AcademyManagerPanel({ onLogout }: AcademyManagerPanelProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'network' | 'finance' | 'operations' | 'settings'>('search');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const cashFlowData = [
    { day: 'هفته ۱', revenue: 12000000 },
    { day: 'هفته ۲', revenue: 25000000 },
    { day: 'هفته ۳', revenue: 8000000 },
    { day: 'هفته ۴ (پیش‌بینی)', revenue: 35000000 },
  ];

  const advisorsData = [
    { id: 'm1', name: 'مهندس احمدی (ارشد)', studentsCount: 45, churnRate: 5, loyalty: 92, commissionPercent: 70 },
    { id: 'm2', name: 'خانم رضایی', studentsCount: 28, churnRate: 15, loyalty: 78, commissionPercent: 50 },
  ];

  const financialAlarms = [
    { id: 1, student: 'یاشا محبی', advisor: 'احمدی', daysLeft: 2, amount: '۲,۵۰۰,۰۰۰' },
    { id: 2, student: 'سارا امینی', advisor: 'رضایی', daysLeft: 0, amount: '۱,۸۰۰,۰۰۰' },
  ];

  const handleBroadcast = () => {
    alert('📢 پیام برودکست شما با موفقیت به ۱۲۸ دانش‌آموز، ۴۵ والد و ۱۲ مشاور ارسال شد (SMS + Push Notification).');
  };

  const handleGeneratePaymentLink = (student: string) => {
    alert(`🔗 لینک درگاه پرداخت اختصاصی برای تمدید قرارداد «${student}» ساخته و در کلیپ‌بورد کپی شد.`);
  };

  const handleAssignTask = () => {
    alert('✅ تسک جدید (مثلاً: جلسه حضوری فردا) با موفقیت در تایم‌لاین مشاور مربوطه ثبت و آلارم آن فعال شد.');
  };

  const handleUnifiedExport = () => {
    alert('📥 خروجی یکپارچه (شامل تمام تاریخچه، برنامه‌ها و گزارش کارها) در قالب فایل اکسل در حال دانلود است...');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FDFBF7',
      backgroundImage: 'radial-gradient(rgba(12, 29, 63, 0.04) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      direction: 'rtl',
      paddingBottom: '120px', 
      fontFamily: 'inherit'
    }}>
      
      <div className="no-print" style={{
        position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(12, 29, 63, 0.85)', backdropFilter: 'blur(20px)',
        borderRadius: '24px', padding: '12px 24px', display: 'flex', gap: '15px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 9999, alignItems: 'center'
      }}>
        {[
          { id: 'search', icon: Search, label: 'جستجوی هوشمند' },
          { id: 'network', icon: Users, label: 'مشاوران و شاگردان' },
          { id: 'finance', icon: Wallet, label: 'صندوق و پورسانت' },
          { id: 'operations', icon: Megaphone, label: 'عملیات و آزمون' },
          { id: 'settings', icon: Settings, label: 'تنظیمات آکادمی' }
        ].map(item => {
          const IconC = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className="dark-tooltip"
              title={item.label}
              style={{
                background: isActive ? 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)' : 'transparent',
                border: 'none', color: isActive ? '#0C1D3F' : 'rgba(253, 251, 247, 0.7)',
                width: '45px', height: '45px', borderRadius: '14px', display: 'flex', 
                justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 4px 15px rgba(230, 194, 135, 0.3)' : 'none'
              }}
            >
              <IconC size={20} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
        
        <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>
        
        {onLogout && (
          <button
            onClick={onLogout}
            title="خروج از سیستم"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444',
              width: '45px', height: '45px', borderRadius: '14px', display: 'flex', 
              justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      <div className="custom-scrollbar" style={{ padding: '40px 50px' }}>
        
        {activeTab === 'search' && (
          <div style={{ height: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '45px' }}>
              <h1 style={{ fontSize: '46px', fontWeight: '900', color: '#0C1D3F', letterSpacing: '3px', margin: '0 0 10px 0' }}>MEDULLA</h1>
              <p style={{ fontSize: '16px', color: 'rgba(12, 29, 63, 0.6)', fontWeight: 'bold', margin: 0 }}>دستیار هوشمند مدیریت کل آکادمی</p>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '650px' }}>
              <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#C5A880' }}>
                <Search size={24} />
              </div>
              <input 
                type="text" 
                value={globalSearchQuery}
                onChange={e => setGlobalSearchQuery(e.target.value)}
                placeholder="نام مشاور، دانش‌آموز یا کدملی را جستجو کنید..." 
                style={{
                  width: '100%', padding: '22px 55px 22px 24px', borderRadius: '16px',
                  border: '2px solid rgba(12, 29, 63, 0.1)', background: '#FFFFFF',
                  fontSize: '16px', fontWeight: 'bold', color: '#0C1D3F', outline: 'none',
                  boxShadow: '0 10px 30px rgba(12, 29, 63, 0.05)', transition: 'all 0.3s ease'
                }}
              />

              {globalSearchQuery && (
                <div className="bento-card" style={{ position: 'absolute', top: '110%', width: '100%', zIndex: 10, padding: '15px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid rgba(12, 29, 63, 0.05)', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Users size={20} color="#0C1D3F" /> <strong style={{ fontSize: '15px' }}>{globalSearchQuery}</strong> <span style={{ fontSize: '13px', color: 'gray' }}>(دانش‌آموز)</span></div>
                    <span className="pill-badge" style={{ padding: '6px 12px' }}>ورود به پرونده</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Target size={20} color="#C5A880" /> <strong style={{ fontSize: '15px' }}>{globalSearchQuery}</strong> <span style={{ fontSize: '13px', color: 'gray' }}>(مشاور آکادمی)</span></div>
                    <span className="pill-badge" style={{ padding: '6px 12px' }}>پنل اختصاصی</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: '#0C1D3F', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
              <Wallet size={26} color="#C5A880" /> خزانه‌داری و پیش‌بینی مالی آکادمی
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '30px' }}>
              <div className="bento-card" style={{ borderRight: '4px solid #10B981', padding: '25px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(12, 29, 63, 0.7)', fontWeight: 'bold' }}>مجموع واریزی‌های امروز</span>
                <div className="mono-num" style={{ fontSize: '32px', color: '#10B981', marginTop: '12px', fontWeight: '900' }}>۸,۵۰۰,۰۰۰ <span style={{ fontSize: '14px', color: '#0C1D3F', fontFamily: 'inherit' }}>تومان</span></div>
              </div>
              <div className="bento-card" style={{ borderRight: '4px solid #C5A880', padding: '25px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(12, 29, 63, 0.7)', fontWeight: 'bold' }}>مجموع واریزی‌های ماه</span>
                <div className="mono-num" style={{ fontSize: '32px', color: '#C5A880', marginTop: '12px', fontWeight: '900' }}>۱۴۵,۰۰۰,۰۰۰ <span style={{ fontSize: '14px', color: '#0C1D3F', fontFamily: 'inherit' }}>تومان</span></div>
              </div>
              <div className="bento-card" style={{ borderRight: '4px solid #0C1D3F', padding: '25px' }}>
                <span style={{ fontSize: '14px', color: 'rgba(12, 29, 63, 0.7)', fontWeight: 'bold' }}>تراکنش‌های موفق این ماه</span>
                <div className="mono-num" style={{ fontSize: '32px', color: '#0C1D3F', marginTop: '12px', fontWeight: '900' }}>128 <span style={{ fontSize: '14px', color: 'rgba(12, 29, 63, 0.6)', fontFamily: 'inherit' }}>تراکنش</span></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '30px' }}>
              <div className="bento-card" style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '16px' }}>پیش‌بینی جریان نقدینگی (Cash Flow ماه آینده)</span>
                  <span className="pill-badge">تخمین بر اساس سررسیدها</span>
                </div>
                <div style={{ height: '260px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(12, 29, 63, 0.08)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: '#0C1D3F', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                      <Tooltip contentStyle={{ background: '#0C1D3F', color: '#FDFBF7', border: 'none', borderRadius: '8px', padding: '10px 15px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0C1D3F" strokeWidth={3} fillOpacity={1} fill="#C5A880" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bento-card" style={{ borderTop: '4px solid #EF4444', padding: '25px' }}>
                <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
                  <Bell size={20} color="#EF4444" /> آلارم سررسید مالی
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {financialAlarms.map(alarm => (
                    <div key={alarm.id} style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '14px', color: '#0C1D3F' }}>{alarm.student} <span style={{ fontWeight: 'normal', color: 'gray', fontSize: '12px' }}>(مشاور: {alarm.advisor})</span></strong>
                        <span className="pill-badge" style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>{alarm.daysLeft === 0 ? 'امروز' : `${alarm.daysLeft} روز مانده`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono-num" style={{ fontSize: '14px', color: '#0C1D3F', fontWeight: 'bold' }}>{alarm.amount} تومان</span>
                        <button onClick={() => handleGeneratePaymentLink(alarm.student)} className="gold-glow-btn" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LinkIcon size={14} /> ارسال لینک پرداخت
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#0C1D3F', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
                <Users size={26} color="#C5A880" /> دپارتمان مشاوران و منابع انسانی
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="pill-badge" style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '13px' }}><Plus size={16} style={{ marginLeft: '6px' }}/> تعریف مشاور جدید</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
              {advisorsData.map(adv => (
                <div key={adv.id} className="bento-card" style={{ borderTop: `4px solid ${adv.loyalty > 85 ? '#10B981' : '#F59E0B'}`, padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '18px' }}>{adv.name}</span>
                    <button onClick={handleUnifiedExport} className="dark-tooltip" style={{ background: 'rgba(12, 29, 63, 0.05)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#0C1D3F' }}>
                      <Download size={18} />
                      <span className="tooltip-box">خروجی کل شاگردان</span>
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', padding: '15px', background: 'rgba(12, 29, 63, 0.02)', borderRadius: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(12, 29, 63, 0.6)', fontSize: '12px', marginBottom: '5px' }}>شاگردان فعال</div>
                      <div className="mono-num" style={{ fontSize: '22px', color: '#0C1D3F', fontWeight: 'bold' }}>{adv.studentsCount}</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(12, 29, 63, 0.1)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(12, 29, 63, 0.6)', fontSize: '12px', marginBottom: '5px' }}>وفاداری مشتری</div>
                      <div className="mono-num" style={{ fontSize: '22px', color: '#10B981', fontWeight: 'bold' }}>{adv.loyalty}%</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(12, 29, 63, 0.1)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'rgba(12, 29, 63, 0.6)', fontSize: '12px', marginBottom: '5px' }}>قیف ریزش</div>
                      <div className="mono-num" style={{ fontSize: '22px', color: '#EF4444', fontWeight: 'bold' }}>{adv.churnRate}%</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="pill-badge" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', background: 'rgba(12, 29, 63, 0.04)', padding: '10px' }}>
                      <Search size={16} style={{ marginLeft: '6px' }}/> لیست شاگردان
                    </button>
                    <button className="pill-badge" style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', borderColor: 'rgba(197, 168, 128, 0.5)', color: '#0C1D3F', background: 'rgba(197, 168, 128, 0.1)', padding: '10px' }}>
                      <ArrowRightLeft size={16} color="#C5A880" style={{ marginLeft: '6px' }} /> انتقال سریع
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: '#0C1D3F', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
              <Megaphone size={26} color="#C5A880" /> مرکز عملیات، ارتباطات و آزمون‌ها
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginBottom: '25px' }}>
              <div className="bento-card" style={{ padding: '25px' }}>
                <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Megaphone size={20} color="#C5A880" /> پیام‌رسانی گروهی (Broadcast)
                </div>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <select className="input-box" style={{ flex: 1, padding: '12px', borderRadius: '10px' }}>
                    <option>گیرندگان: تمام دانش‌آموزان</option>
                    <option>گیرندگان: تمام والدین</option>
                    <option>گیرندگان: تمام مشاوران</option>
                  </select>
                </div>
                <textarea className="input-box custom-scrollbar" placeholder="متن پیام خود را اینجا بنویسید..." rows={4} style={{ marginBottom: '20px', resize: 'none', borderRadius: '10px', padding: '15px' }}></textarea>
                <button onClick={handleBroadcast} className="gold-glow-btn" style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                  <Megaphone size={18} /> ارسال فوری پیام
                </button>
              </div>

              <div className="bento-card" style={{ background: '#0C1D3F', color: '#FDFBF7', padding: '25px' }}>
                <div style={{ fontWeight: '900', color: '#E6C287', fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={20} color="#E6C287" /> ایجاد تسک سازمانی
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(253, 251, 247, 0.7)', marginBottom: '20px' }}>تسک ایجاد شده مستقیماً در داشبورد مشاور پین خواهد شد.</p>
                <select className="input-box" style={{ width: '100%', padding: '12px', marginBottom: '15px', background: 'rgba(253, 251, 247, 0.05)', color: '#E6C287', border: '1px solid rgba(230, 194, 135, 0.3)', borderRadius: '10px' }}>
                  <option>انتخاب مشاور (مثلاً: دکتر کاظمی)</option>
                </select>
                <input type="text" placeholder="عنوان تسک (مثال: بررسی پرونده مالی یاشا)" className="input-box" style={{ width: '100%', padding: '12px', marginBottom: '20px', background: 'rgba(253, 251, 247, 0.05)', color: '#FDFBF7', border: '1px solid rgba(230, 194, 135, 0.3)', borderRadius: '10px' }} />
                <button onClick={handleAssignTask} className="pill-badge" style={{ width: '100%', justifyContent: 'center', padding: '14px', background: '#E6C287', color: '#0C1D3F', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                  ثبت تسک و ارسال نوتیفیکیشن
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: '#0C1D3F', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
              <Settings size={26} color="#C5A880" /> زیرساخت و دسترسی‌ها
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
              <div className="bento-card" style={{ padding: '25px' }}>
                <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building size={20} color="#C5A880" /> مدیریت شعب
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px 15px', border: '1px solid rgba(12, 29, 63, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(12, 29, 63, 0.02)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>شعبه مرکزی (پسرانه)</span>
                    <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'none', fontSize: '12px' }}>فعال</span>
                  </div>
                  <div style={{ padding: '12px 15px', border: '1px solid rgba(12, 29, 63, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(12, 29, 63, 0.02)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>شعبه دوم (دخترانه)</span>
                    <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'none', fontSize: '12px' }}>فعال</span>
                  </div>
                </div>
              </div>

              <div className="bento-card" style={{ padding: '25px' }}>
                <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Plug size={20} color="#C5A880" /> اتصال به سرویس‌های خارجی
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px dashed rgba(12, 29, 63, 0.1)' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>سرویس پیامک (کاوه‌نگار)</span>
                    <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'none', fontSize: '12px' }}>متصل است ✅</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0C1D3F' }}>درگاه پرداخت (زرین‌پال)</span>
                    <span className="pill-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: 'none', fontSize: '12px' }}>متصل است ✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
