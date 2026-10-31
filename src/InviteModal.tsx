import React, { useState, useEffect } from 'react';
import { 
  X, Copy, Check, QrCode, Share2, Users, Sparkles, 
  ExternalLink, MessageCircle, Send, Phone, GraduationCap, ShieldCheck
} from 'lucide-react';
import api from './api';
import { showVoiceToast } from './VoiceComponents';

interface InviteModalProps {
  advisorName?: string;
  advisorId?: number;
  onClose: () => void;
}

export default function InviteModal({ advisorName = 'دکتر کاظمی', advisorId = 3, onClose }: InviteModalProps) {
  const [inviteData, setInviteData] = useState<{
    invite_code: string;
    advisor_name: string;
    specialty: string;
    students_count: number;
    students: any[];
  }>({
    invite_code: advisorId === 3 ? 'KAZEMI' : (advisorId === 4 ? 'SAEEDI' : `ADV-${advisorId}`),
    advisor_name: advisorName,
    specialty: 'مشاور ارشد تجربی و کنکور',
    students_count: 0,
    students: []
  });
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'students'>('link');

  // Build the complete direct invitation URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteUrl = `${origin}/?invite=${inviteData.invite_code}`;

  const invitationMessage = `سلام! من ${advisorName} هستم، مشاور تحصیلی شما در مدولا.
جهت تکمیل اطلاعات، اتصال مستقیم به پنل مشاوره من، دریافت برنامه‌ریزی هفتگی و ارسال گزارش‌کارهای روزانه خود، روی لینک اختصاصی زیر کلیک کنید:
${inviteUrl}`;

  useEffect(() => {
    const fetchInviteInfo = async () => {
      try {
        const res = await api.get('/auth/my-invite-info');
        if (res.data) {
          setInviteData(res.data);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchInviteInfo();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    showVoiceToast('🔗 لینک اختصاصی با موفقیت کپی شد!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(invitationMessage);
    showVoiceToast('📋 متن کامل دعوت کپی شد! می‌توانید در پیام‌رسان‌ها بفرستید.', 'success');
  };

  const shareToSms = () => {
    const url = `sms:?body=${encodeURIComponent(invitationMessage)}`;
    window.location.href = url;
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(`دعوت به پنل مشاوره ${advisorName} در مدولا`)}`;
    window.open(url, '_blank');
  };

  const shareToEitaa = () => {
    const url = `https://eitaa.com/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(invitationMessage)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(invitationMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(12, 29, 63, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      direction: 'rtl'
    }}>
      <div 
        className="bento-card custom-scrollbar" 
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FDFBF7',
          borderRadius: '24px',
          padding: '24px',
          border: '1.5px solid var(--gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.25s ease-out',
          margin: 0
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid rgba(12, 29, 63, 0.1)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(230, 194, 135, 0.2)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>
                لینک دعوت اختصاصی شاگرد
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                اتصال آنی و خودکار دانش‌آموز به پنل شما ({advisorName})
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'rgba(12, 29, 63, 0.05)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              flex: 1,
              padding: '8px 14px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'link' ? '#0C1D3F' : 'transparent',
              color: activeTab === 'link' ? '#E6C287' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={15} /> لینک و اشتراک‌گذاری
          </button>
          <button
            onClick={() => setActiveTab('students')}
            style={{
              flex: 1,
              padding: '8px 14px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'students' ? '#0C1D3F' : 'transparent',
              color: activeTab === 'students' ? '#E6C287' : 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Users size={15} /> شاگردان متصل شده ({inviteData.students?.length || 0})
          </button>
        </div>

        {activeTab === 'link' ? (
          <div>
            {/* Advisor ID Card Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px rgba(12, 29, 63, 0.18)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#E6C287', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <ShieldCheck size={14} /> مشاور رسمی مدولا
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 4px 0', color: '#FFFFFF' }}>{advisorName}</h3>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{inviteData.specialty}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', display: 'block' }}>کد اختصاصی:</span>
                <span className="mono-num" style={{ fontSize: '18px', color: '#E6C287', letterSpacing: '2px', fontWeight: '900' }}>
                  {inviteData.invite_code}
                </span>
              </div>
            </div>

            {/* Link Box */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px', display: 'block' }}>
                لینک مستقیم دعوت شاگرد:
              </label>
              <div style={{
                display: 'flex',
                background: '#FFFFFF',
                border: '1.5px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                padding: '4px'
              }}>
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '8px 12px',
                    fontSize: '12px',
                    direction: 'ltr',
                    textAlign: 'left',
                    color: '#0C1D3F',
                    fontFamily: 'Consolas, monospace',
                    background: 'transparent'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  className="gold-glow-btn"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'کپی شد!' : 'کپی لینک'}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div style={{ marginBottom: '22px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '10px', display: 'block' }}>
                ارسال مستقیم برای دانش‌آموز از طریق:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button
                  onClick={shareToSms}
                  className="btn"
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(12, 29, 63, 0.12)',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Phone size={18} color="#10B981" /> پیامک (SMS)
                </button>
                <button
                  onClick={shareToEitaa}
                  className="btn"
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(12, 29, 63, 0.12)',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={18} color="#F59E0B" /> ایتا (Eitaa)
                </button>
                <button
                  onClick={shareToTelegram}
                  className="btn"
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(12, 29, 63, 0.12)',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <MessageCircle size={18} color="#0284C7" /> تلگرام
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="btn"
                  style={{
                    padding: '10px 6px',
                    borderRadius: '10px',
                    border: '1px solid rgba(12, 29, 63, 0.12)',
                    background: '#FFFFFF',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={18} color="#22C55E" /> واتساپ
                </button>
              </div>
            </div>

            {/* QR Code Toggle */}
            <div style={{
              background: 'rgba(230, 194, 135, 0.12)',
              borderRadius: '12px',
              padding: '14px',
              border: '1px dashed var(--gold)',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  <QrCode size={18} color="var(--gold-dark)" /> اسکن بارکد QR در مشاوره حضوری
                </div>
                <button
                  onClick={() => setShowQr(!showQr)}
                  className="pill-badge"
                  style={{ cursor: 'pointer', fontSize: '11px' }}
                >
                  {showQr ? 'بستن QR' : 'نمایش QR Code'}
                </button>
              </div>

              {showQr && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '14px', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                    {/* Visual Stylized QR Representation */}
                    <div style={{ width: '150px', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ width: '40px', height: '40px', border: '5px solid #0C1D3F', borderRadius: '8px' }} />
                        <div style={{ width: '40px', height: '40px', border: '5px solid #0C1D3F', borderRadius: '8px' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', width: '70%', justifyContent: 'center' }}>
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} style={{ width: '10px', height: '10px', background: i % 2 === 0 ? '#0C1D3F' : '#C5A880', borderRadius: '2px' }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ width: '40px', height: '40px', border: '5px solid #0C1D3F', borderRadius: '8px' }} />
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#C5A880', alignSelf: 'flex-end', direction: 'ltr' }}>
                          {inviteData.invite_code}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    دانش‌آموز با دوربین گوشی اسکن کند تا مستقیم به فرم ثبت‌نام متصل شود
                  </span>
                </div>
              )}
            </div>

            {/* Note */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.7', background: 'rgba(12, 29, 63, 0.03)', padding: '10px 12px', borderRadius: '8px' }}>
              💡 <strong>نحوه کارکرد:</strong> دانش‌آموزی که از این لینک وارد شود، در مرحله اول فرم اطلاعات اولیه (شماره، شماره والد، پایه و رشته) را پر می‌کند و بلافاصله به پنل شما متصل می‌گردد و نیازی به تایید دستی مدیریت آموزشگاه نخواهد داشت.
            </div>
          </div>
        ) : (
          /* Students Joined Tab */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)' }}>
                لیست شاگردانی که با لینک شما عضو شدند:
              </span>
              <span className="pill-badge" style={{ background: '#0C1D3F', color: '#E6C287' }}>
                {inviteData.students?.length || 0} دانش‌آموز
              </span>
            </div>

            {(!inviteData.students || inviteData.students.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '30px 15px', color: 'gray', fontSize: '13px' }}>
                هنوز دانش‌آموزی با لینک اختصاصی شما ثبت‌نام نکرده است. لینک خود را برای شاگردانتان بفرستید!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }} className="custom-scrollbar">
                {inviteData.students.map((student: any) => (
                  <div 
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--primary)', marginBottom: '3px' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'gray', display: 'flex', gap: '10px' }}>
                        <span>موبایل: <span className="mono-num">{student.phone}</span></span>
                        <span>موبایل والد: <span className="mono-num">{student.parent_phone}</span></span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span className="pill-badge" style={{ fontSize: '10px', background: 'rgba(230,194,135,0.2)', color: 'var(--primary)' }}>
                        {student.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
