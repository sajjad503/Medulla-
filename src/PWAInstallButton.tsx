import React, { useState } from 'react';
import { Download, Smartphone, Laptop, Share, PlusSquare, X, CheckCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running standalone, do not clutter the header
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="pill-badge"
        style={{
          cursor: 'pointer',
          padding: '6px 12px',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.25) 0%, rgba(197, 168, 128, 0.15) 100%)',
          borderColor: 'var(--gold, #C5A880)',
          color: 'var(--primary, #0C1D3F)',
          fontWeight: '900',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(230, 194, 135, 0.2)'
        }}
        title="نصب نسخه وب‌اپلیکیشن (PWA) روی گوشی یا رایانه"
      >
        <Download size={13} color="var(--gold, #C5A880)" />
        <span>نصب میانبر اپ</span>
      </button>

      {/* مودال راهنمای نصب جامع برای انواع سیستم‌عامل‌ها و مرورگرها */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8, 18, 41, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '16px',
            direction: 'rtl'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-card, #ffffff)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              border: '1px solid rgba(230, 194, 135, 0.4)',
              animation: 'fadeIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر مودال */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0C1D3F 0%, #152A56 100%)',
                  color: '#E6C287',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #C5A880'
                }}>
                  <Download size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-main, #0C1D3F)' }}>
                    نصب میانبر اپلیکیشن مدولا
                  </h3>
                  <span style={{ fontSize: '11px', color: 'gray' }}>دسترسی سریع و بدون نیاز به دانلود از استور</span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'gray' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* بخش ۱: راهنمای آیفون / آیپد (iOS Safari) */}
            {isIOS ? (
              <div style={{ background: 'rgba(12, 29, 63, 0.04)', padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0C1D3F', marginBottom: '10px' }}>
                  <Smartphone size={16} color="#C5A880" />
                  راهنمای نصب در آیفون و آیپد (سافاری):
                </div>
                <ol style={{ margin: 0, paddingRight: '20px', fontSize: '12px', lineHeight: '1.9', color: '#334155' }}>
                  <li>در نوار پایین یا بالای مرورگر سافاری، روی آیکون <strong>اشتراک‌گذاری (Share <Share size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong> ضربه بزنید.</li>
                  <li>منو را به پایین بکشید و گزینه <strong>Add to Home Screen (افزودن به صفحه اصلی <PlusSquare size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong> را انتخاب کنید.</li>
                  <li>در بالای صفحه روی <strong>Add</strong> بزنید. آیکون مدولا به صفحه گوشی شما اضافه خواهد شد.</li>
                </ol>
              </div>
            ) : (
              /* بخش ۲: راهنمای اندروید و دسکتاپ (Chrome / Edge) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(12, 29, 63, 0.04)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0C1D3F', marginBottom: '6px' }}>
                    <Smartphone size={16} color="#10B981" />
                    در گوشی‌های اندروید (Chrome):
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.7', color: '#475569' }}>
                    روی منوی ۳ نقطه (<strong style={{ letterSpacing: '1px' }}>⋮</strong>) بالای مرورگر کروم بزنید و گزینه <strong>«نصب برنامه» (Install app)</strong> یا <strong>«افزودن به صفحه اصلی»</strong> را انتخاب فرمایید.
                  </p>
                </div>

                <div style={{ background: 'rgba(12, 29, 63, 0.04)', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '13px', color: '#0C1D3F', marginBottom: '6px' }}>
                    <Laptop size={16} color="#3B82F6" />
                    در کامپیوتر و لپ‌تاپ (Chrome / Edge):
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.7', color: '#475569' }}>
                    در نوار آدرس مرورگر (سمت راست یا چپ URL)، روی آیکون <strong>نصب رایانه (<Download size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong> کلیک کنید تا مدولا مثل یک نرم‌افزار دسکتاپ مستقل اجرا شود.
                  </p>
                </div>
              </div>
            )}

            {/* مزایای میانبر وب‌اپ */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.12) 0%, rgba(197, 168, 128, 0.2) 100%)',
              borderRadius: '10px',
              fontSize: '11px',
              color: '#0C1D3F',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              <span>⚡️ اجرای تمام‌صفحه و سریع</span>
              <span>📱 دسترسی مستقیم از صفحه خانگی</span>
              <span>🔒 امن و خودکار بروزرسان</span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="gold-glow-btn"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;
