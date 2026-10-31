import React, { useState } from 'react';
import { 
  Lock, CreditCard, ShieldCheck, CheckCircle2, Clock, Upload, 
  Copy, Check, AlertCircle, ArrowLeft, Sparkles, Zap, ChevronLeft,
  FileCheck, Shield, ExternalLink, HelpCircle
} from 'lucide-react';
import api from './api';
import OnlineGatewayModal from './OnlineGatewayModal';

interface StudentPaywallProps {
  studentName?: string;
  studentFee?: number;
  cardNumber?: string;
  cardHolder?: string;
  bankName?: string;
  onUnlocked: (statusData: any) => void;
}

export default function StudentPaywall({
  studentName = 'یاشا محبی',
  studentFee = 490000,
  cardNumber = '6219861408052453',
  cardHolder = 'سجاد حامدی',
  bankName = 'بانک سامان',
  onUnlocked
}: StudentPaywallProps) {
  const [activeMethod, setActiveMethod] = useState<'card_to_card' | 'gateway'>('card_to_card');
  const [copied, setCopied] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Online gateway simulation states
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'initial' | 'processing' | 'success'>('initial');
  const [gatewayCardNum, setGatewayCardNum] = useState('۶۰۳۷-۹۹۷۵-****-۲۸۴۱');

  // Format card number with hyphens
  const formattedCardNumber = cardNumber.replace(/(\d{4})/g, '$1-').replace(/-$/, '');

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectSampleReceipt = () => {
    // Preset high quality sample receipt for testing
    setReceiptImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    if (!trackingCode) {
      setTrackingCode('TRX-' + Math.floor(1000000 + Math.random() * 9000000));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      if (!trackingCode) {
        setTrackingCode('REF-' + Math.floor(1000000 + Math.random() * 9000000));
      }
    }
  };

  // Submit Card-to-Card Receipt -> Immediately unlocks 24h grace!
  const handleSubmitReceipt = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/subscription/upload-receipt', {
        tracking_code: trackingCode,
        receipt_image: receiptImage,
        notes: notes
      });

      setSuccessMsg('رسید با موفقیت ثبت شد! دسترسی ۲۴ ساعته شما فوراً فعال گردید. ⏳');
      setTimeout(() => {
        onUnlocked(res.data);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'خطا در ثبت رسید. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process Online Gateway Payment -> Immediately unlocks 30 days!
  const handleGatewayPayment = async () => {
    setGatewayStep('processing');
    setErrorMsg('');
    try {
      // Simulate real bank latency
      await new Promise(r => setTimeout(r, 1400));
      const res = await api.post('/subscription/pay-gateway');
      setGatewayStep('success');
      setSuccessMsg('پرداخت اینترنتی موفق بود! اشتراک ۳۰ روزه شما فعال گردید. 🎉');
      setTimeout(() => {
        onUnlocked(res.data);
      }, 1400);
    } catch (err: any) {
      setGatewayStep('initial');
      setErrorMsg(err.response?.data?.detail || 'خطا در پردازش درگاه پرداخت.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(8, 18, 41, 0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      direction: 'rtl',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '820px',
        width: '100%',
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(197, 168, 128, 0.35)',
        overflow: 'hidden',
        animation: 'fadeIn 0.35s ease-out'
      }}>
        {/* نوار طلایی هدر */}
        <div style={{
          background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
          padding: '24px 30px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '2px solid rgba(230, 194, 135, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #E6C287 0%, #C5A880 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0C1D3F',
              boxShadow: '0 8px 20px rgba(230, 194, 135, 0.3)',
              flexShrink: 0
            }}>
              <Lock size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                  فعال‌سازی اشتراک پلتفرم مدولا
                </h2>
                <span style={{
                  background: 'rgba(230, 194, 135, 0.2)',
                  color: '#E6C287',
                  border: '1px solid rgba(230, 194, 135, 0.4)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  دسترسی محدود
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)' }}>
                دانش‌آموز گرامی <strong>{studentName}</strong>، برای بازگشایی پنل و استفاده از خدمات مشاوره، هزینه اشتراک مصوب را واریز نمایید.
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(230, 194, 135, 0.3)',
            borderRadius: '16px',
            padding: '10px 18px',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '11px', color: '#E6C287', fontWeight: 'bold' }}>تعرفه مصوب مدیریت</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
              {Number(studentFee).toLocaleString('fa-IR')} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>تومان</span>
            </div>
          </div>
        </div>

        {/* بدنه اصلی */}
        <div style={{ padding: '24px 30px' }}>
          
          {/* تب‌های انتخاب روش پرداخت */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            background: 'rgba(12, 29, 63, 0.04)',
            padding: '6px',
            borderRadius: '14px',
            border: '1px solid rgba(12, 29, 63, 0.08)'
          }}>
            <button
              onClick={() => setActiveMethod('card_to_card')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: activeMethod === 'card_to_card' ? '#0C1D3F' : 'transparent',
                color: activeMethod === 'card_to_card' ? '#E6C287' : 'var(--text-main, #333)',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeMethod === 'card_to_card' ? '0 4px 12px rgba(12, 29, 63, 0.2)' : 'none'
              }}
            >
              <CreditCard size={18} />
              انتقال کارت به کارت (با بازگشایی فوری ۲۴ ساعته)
            </button>

            <button
              onClick={() => setActiveMethod('gateway')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: activeMethod === 'gateway' ? '#0C1D3F' : 'transparent',
                color: activeMethod === 'gateway' ? '#E6C287' : 'var(--text-main, #333)',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: activeMethod === 'gateway' ? '0 4px 12px rgba(12, 29, 63, 0.2)' : 'none'
              }}
            >
              <Zap size={18} />
              درگاه پرداخت اینترنتی شتاب (آنلاین)
            </button>
          </div>

          {/* پیام‌های وضعیت */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid #10B981',
              color: '#10B981',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle2 size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================================
              روش ۱: کارت به کارت با قابلیت دسترسی فوری ۲۴ ساعته
          ======================================================== */}
          {activeMethod === 'card_to_card' && (
            <div>
              {/* کادر طلایی نویدبخش بازگشایی ۲۴ ساعته */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.15) 0%, rgba(197, 168, 128, 0.25) 100%)',
                border: '1.5px solid rgba(197, 168, 128, 0.5)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  background: '#0C1D3F',
                  color: '#E6C287',
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: '900', color: 'var(--text-main, #0C1D3F)', fontSize: '13px' }}>
                    دسترسی اضطراری ۲۴ ساعته آنی!
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #555)', marginTop: '2px', lineHeight: '1.6' }}>
                    به محض آپلود تصویر فیش یا ثبت کد پیگیری، <strong>پنل شما به صورت خودکار برای ۲۴ ساعت باز خواهد شد</strong> تا مدیریت پلتفرم فرصت بررسی و تایید نهایی را داشته باشد.
                  </div>
                </div>
              </div>

              {/* کارت بانکی لوکس مقصد */}
              <div style={{
                background: 'linear-gradient(135deg, #0C1D3F 0%, #152A56 50%, #081229 100%)',
                borderRadius: '20px',
                padding: '24px',
                color: '#fff',
                marginBottom: '24px',
                boxShadow: '0 12px 30px rgba(12, 29, 63, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(230, 194, 135, 0.3)'
              }}>
                {/* لوگوی تزئینی پس‌زمینه */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '-30px',
                  width: '180px',
                  height: '180px',
                  background: 'radial-gradient(circle, rgba(230, 194, 135, 0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#E6C287' }}>{bankName}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>• عضو شبکه شتاب</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#E6C287',
                    background: 'rgba(230, 194, 135, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    حساب رسمی پلتفرم مدولا
                  </span>
                </div>

                <div style={{ margin: '15px 0' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                    شماره کارت جهت واریز
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(230, 194, 135, 0.4)'
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '22px',
                      letterSpacing: '3px',
                      fontWeight: '900',
                      color: '#E6C287',
                      direction: 'ltr'
                    }}>
                      {formattedCardNumber}
                    </span>
                    <button
                      onClick={handleCopyCard}
                      style={{
                        background: copied ? '#10B981' : 'rgba(230, 194, 135, 0.25)',
                        border: 'none',
                        color: copied ? '#fff' : '#E6C287',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'کپی شد!' : 'کپی شماره کارت'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>نام دارنده حساب</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', marginTop: '3px' }}>
                      {cardHolder}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>مبلغ قابل پرداخت</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#E6C287', marginTop: '3px' }}>
                      {Number(studentFee).toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                </div>
              </div>

              {/* فرم بارگذاری فیش */}
              <div style={{
                background: 'var(--bg-main, #f8fafc)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--border-color, #e2e8f0)'
              }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '900', color: 'var(--text-main, #0C1D3F)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={16} color="#C5A880" />
                  اطلاعات رسید واریز را وارد نمایید
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-secondary, #555)' }}>
                      کد پیگیری یا شماره ارجاع بانکی:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ۸۴۹۲۰۱۵۴ یا شماره پیگیری تراکنش"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        background: 'var(--bg-card, #fff)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        direction: 'ltr',
                        textAlign: 'right'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-secondary, #555)' }}>
                      تصویر فیش بانکی:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{
                        flex: 1,
                        background: 'var(--bg-card, #fff)',
                        border: '1px dashed var(--gold, #C5A880)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--primary, #0C1D3F)'
                      }}>
                        <Upload size={14} />
                        {receiptImage ? 'تغییر تصویر رسید' : 'انتخاب فایل رسید'}
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>

                      <button
                        type="button"
                        onClick={handleSelectSampleReceipt}
                        title="برای راحتی تست سریع"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1px solid rgba(197, 168, 128, 0.4)',
                          background: 'rgba(230, 194, 135, 0.15)',
                          color: '#0C1D3F',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        نمونه فیش تست
                      </button>
                    </div>
                  </div>
                </div>

                {receiptImage && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={receiptImage}
                      alt="پیش‌نمایش رسید"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1, fontSize: '12px' }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>تصویر فیش بارگذاری شد ✅</span>
                      <div style={{ color: 'var(--text-secondary, #666)', fontSize: '11px' }}>آماده ارسال برای فعال‌سازی ۲۴ ساعته</div>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-secondary, #555)' }}>
                    توضیحات اختیاری دانش‌آموز:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: واریز از کارت بانک صادرات توسط پدر"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'var(--bg-card, #fff)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmitReceipt}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
                    color: '#E6C287',
                    border: '1px solid #C5A880',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: '15px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(12, 29, 63, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Zap size={18} color="#E6C287" />
                  {isSubmitting ? 'در حال ثبت رسید و بازگشایی پنل...' : 'ثبت فیش و بازگشایی فوری ۲۴ ساعته پنل'}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              روش ۲: درگاه پرداخت آنلاین شاپرک
          ======================================================== */}
          {activeMethod === 'gateway' && (
            <div style={{
              background: 'var(--bg-main, #f8fafc)',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid var(--border-color, #e2e8f0)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Zap size={32} />
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: 'var(--text-main, #0C1D3F)' }}>
                پرداخت اینترنتی از طریق کلیه کارت‌های شتاب
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'var(--text-secondary, #666)' }}>
                اتصال امن به درگاه پرداخت شاپرک با تایید آنی و فعال‌سازی مستقیم اشتراک ۳۰ روزه
              </p>

              <div style={{
                maxWidth: '400px',
                margin: '0 auto 24px auto',
                background: 'var(--bg-card, #fff)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border-color, #e2e8f0)',
                textAlign: 'right'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color, #eee)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary, #666)' }}>پذیرنده:</span>
                  <strong style={{ color: 'var(--text-main, #0C1D3F)' }}>سامانه مشاوره‌ای مدولا (Medulla)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color, #eee)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary, #666)' }}>دانش‌آموز:</span>
                  <strong>{studentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '14px', fontWeight: '900' }}>
                  <span>مبلغ قابل پرداخت:</span>
                  <span style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '16px' }}>
                    {Number(studentFee).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowGatewayModal(true)}
                disabled={gatewayStep === 'processing'}
                style={{
                  maxWidth: '400px',
                  width: '100%',
                  margin: '0 auto',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: '15px',
                  cursor: gatewayStep === 'processing' ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <CheckCircle2 size={18} />
                <span>ورود به درگاه پرداخت شاپرک و فعال‌سازی فوری</span>
              </button>
            </div>
          )}

          {/* مزایای اشتراک پلتفرم مدولا */}
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color, #eee)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              <CheckCircle2 size={14} color="#10B981" />
              برنامه هفتگی هوشمند و اختصاصی
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              <CheckCircle2 size={14} color="#10B981" />
              آزمون‌های کنکور با تایمر معکوس
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              <CheckCircle2 size={14} color="#10B981" />
              ارسال گزارش و ارتباط صوتی با مشاور
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary, #666)' }}>
              <CheckCircle2 size={14} color="#10B981" />
              کارنامه d3 و پنل اختصاصی اولیا
            </div>
          </div>

        </div>
      </div>

      {/* درگاه پرداخت اینترنتی آنلاین شاپرک */}
      <OnlineGatewayModal
        show={showGatewayModal}
        onClose={() => setShowGatewayModal(false)}
        tuitionAmount={studentFee}
        studentName={studentName}
        studentId={5}
        gatewayProvider="زرین‌پال (ZarinPal)"
        onPaymentSuccess={(data) => {
          setShowGatewayModal(false);
          onUnlocked(data);
        }}
      />
    </div>
  );
}
