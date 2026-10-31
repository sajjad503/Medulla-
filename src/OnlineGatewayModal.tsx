import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CreditCard, Lock, ArrowRight, CheckCircle2, 
  AlertCircle, RefreshCw, Clock, X, HelpCircle, ExternalLink, Zap
} from 'lucide-react';
import api from './api';

interface OnlineGatewayModalProps {
  show: boolean;
  onClose: () => void;
  tuitionAmount: number;
  studentName: string;
  studentId?: number;
  gatewayProvider?: string;
  onPaymentSuccess: (receiptData: any) => void;
}

export default function OnlineGatewayModal({
  show,
  onClose,
  tuitionAmount = 3500000,
  studentName = 'یاشا محبی',
  studentId = 5,
  gatewayProvider = 'زرین‌پال (ZarinPal)',
  onPaymentSuccess
}: OnlineGatewayModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('۰۸');
  const [expYear, setExpYear] = useState('۰۷');
  const [dynamicOtp, setDynamicOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('74921');
  
  // OTP countdown
  const [otpSent, setOtpSent] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    let timer: any;
    if (otpSent && otpSecondsLeft > 0) {
      timer = setInterval(() => {
        setOtpSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (otpSecondsLeft === 0) {
      setOtpSent(false);
      setOtpSecondsLeft(120);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpSecondsLeft]);

  if (!show) return null;

  const refreshCaptcha = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const handleSendOtp = () => {
    if (!cardNumber || cardNumber.replace(/\D/g, '').length < 16) {
      setErrorMsg('لطفاً شماره کارت ۱۶ رقمی معتبر را وارد کنید.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtpSecondsLeft(120);
    setDynamicOtp(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const detectBankName = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('603799')) return 'بانک ملی ایران';
    if (clean.startsWith('610433')) return 'بانک ملت';
    if (clean.startsWith('621986')) return 'بانک سامان';
    if (clean.startsWith('622106')) return 'بانک پارسیان';
    if (clean.startsWith('502229')) return 'بانک پاسارگاد';
    if (clean.startsWith('589210')) return 'بانک سپه';
    if (clean.startsWith('627412')) return 'بانک اقتصاد نوین';
    if (clean.startsWith('504706')) return 'بانک شهر';
    return clean.length >= 6 ? 'عضو شتاب' : '';
  };

  const formatCardInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1-').replace(/-$/, '');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 16) {
      setErrorMsg('شماره کارت باید ۱۶ رقم کامل باشد.');
      return;
    }
    if (!cvv2 || cvv2.length < 3) {
      setErrorMsg('لطفاً کد CVV2 را به درستی وارد کنید.');
      return;
    }
    if (!dynamicOtp) {
      setErrorMsg('لطفاً رمز پویا را وارد کنید یا دکمه دریافت رمز پویا را بزنید.');
      return;
    }
    if (captchaInput !== captchaCode) {
      setErrorMsg('کد امنیتی کپچا صحیح نمی‌باشد.');
      return;
    }

    setErrorMsg('');
    setStep('processing');
    setIsSubmitting(true);

    try {
      // Simulate real Shaparak authorization & register in backend
      const res = await api.post('/auth/manager/pay-tuition-online', {
        student_id: studentId,
        amount: tuitionAmount,
        card_pan: cleanCard.slice(0, 6) + '******' + cleanCard.slice(12),
        gateway_provider: gatewayProvider
      });

      setReceiptData(res.data);
      setStep('success');
      if (onPaymentSuccess) {
        onPaymentSuccess(res.data);
      }
    } catch (err: any) {
      setStep('form');
      setErrorMsg(err.response?.data?.detail || 'خطا در ارتباط با سوئیچ شاپرک یا بانک عامل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amountRials = tuitionAmount * 10;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(8, 18, 41, 0.88)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        direction: 'rtl'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر درگاه الکترونیک شاپرک */}
        <div style={{
          background: 'linear-gradient(135deg, #0C1D3F 0%, #172554 100%)',
          color: '#ffffff',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #C5A880'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(230, 194, 135, 0.2)',
              color: '#E6C287',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #C5A880'
            }}>
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '15px', color: '#fff' }}>درگاه پرداخت اینترنتی شاپرک</span>
                <span style={{ fontSize: '10px', background: '#10B981', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>امن SSL</span>
              </div>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                پذیرنده: آکادمی هدف مدولا | درگاه: {gatewayProvider}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* فاکتور مبلغ و پذیرنده */}
        <div style={{
          background: '#f8fafc',
          padding: '14px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>شهریه مشاوره دانش‌آموز: <strong>{studentName}</strong></div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>کد ترمینال: <span className="mono-num">9841029</span> | کد پذیرنده: <span className="mono-num">29401824</span></div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#0C1D3F' }} className="mono-num">
              {Number(tuitionAmount).toLocaleString('fa-IR')} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>تومان</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }} className="mono-num">
              {Number(amountRials).toLocaleString('fa-IR')} ریال
            </div>
          </div>
        </div>

        {/* بدنه فرم پرداخت یا نتیجه */}
        <div style={{ padding: '24px' }}>
          
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <RefreshCw size={42} className="spin-animation" color="#0C1D3F" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#0C1D3F', fontSize: '17px' }}>در حال ارتباط با سوئیچ شاپرک و کسر شهریه...</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>لطفاً منتظر بمانید و صفحه را نبندید.</p>
            </div>
          )}

          {step === 'success' && receiptData && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                border: '2px solid #10B981'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ color: '#10B981', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900' }}>
                پرداخت اینترنتی با موفقیت تایید شد! 🎉
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                شهریه مشاوره برای <strong>{studentName}</strong> تسویه گردید و پرونده ایشان بلافاصله فعال شد.
              </p>

              {/* رسید رسمی */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '12px',
                textAlign: 'right',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>شماره مرجع تراکنش (RRN):</span>
                  <strong className="mono-num" style={{ color: '#0C1D3F' }}>{receiptData.rrn || '9841029410'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>کد رهگیری شاپرک:</span>
                  <strong className="mono-num" style={{ color: '#0C1D3F' }}>{receiptData.tracking_code || 'SHP-7819204'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>مبلغ پرداختی:</span>
                  <strong className="mono-num" style={{ color: '#10B981' }}>{Number(tuitionAmount).toLocaleString('fa-IR')} تومان</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: '#64748b' }}>زمان تراکنش:</span>
                  <span className="mono-num">{receiptData.transaction_time || new Date().toLocaleTimeString('fa-IR')}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  background: '#0C1D3F',
                  color: '#E6C287'
                }}
              >
                تکمیل و بازگشت به سامانه
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {errorMsg && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* شماره کارت */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F' }}>
                    شماره کارت ۱۶ رقمی
                  </label>
                  {cardNumber && (
                    <span style={{ fontSize: '11px', color: '#1D4ED8', fontWeight: 'bold' }}>
                      {detectBankName(cardNumber)}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                    placeholder="xxxx-xxxx-xxxx-xxxx"
                    className="mono-num"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '16px',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      direction: 'ltr',
                      boxSizing: 'border-box'
                    }}
                    maxLength={19}
                  />
                  <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', right: '14px', top: '14px' }} />
                </div>
              </div>

              {/* CVV2 و تاریخ انقضا */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', display: 'block', marginBottom: '6px' }}>
                    کد شناسایی دوم (CVV2)
                  </label>
                  <input
                    type="password"
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="3 یا 4 رقم"
                    className="mono-num"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      textAlign: 'center',
                      direction: 'ltr',
                      boxSizing: 'border-box'
                    }}
                    maxLength={4}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', display: 'block', marginBottom: '6px' }}>
                    تاریخ انقضا (ماه / سال)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="ماه"
                      className="mono-num"
                      style={{
                        width: '50%',
                        padding: '12px 8px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        direction: 'ltr',
                        boxSizing: 'border-box'
                      }}
                      maxLength={2}
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="سال"
                      className="mono-num"
                      style={{
                        width: '50%',
                        padding: '12px 8px',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        textAlign: 'center',
                        direction: 'ltr',
                        boxSizing: 'border-box'
                      }}
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>

              {/* رمز دوم پویا */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', display: 'block', marginBottom: '6px' }}>
                  رمز اینترنتی (پویا)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="password"
                    value={dynamicOtp}
                    onChange={(e) => setDynamicOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="رمز دریافتی پیامکی"
                    className="mono-num"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      textAlign: 'center',
                      direction: 'ltr'
                    }}
                    maxLength={8}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSent}
                    style={{
                      padding: '10px 16px',
                      background: otpSent ? '#f1f5f9' : '#0C1D3F',
                      color: otpSent ? '#94a3b8' : '#E6C287',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: otpSent ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {otpSent ? (
                      <>
                        <Clock size={14} />
                        <span>{otpSecondsLeft} ثانیه</span>
                      </>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>دریافت رمز پویا</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* کد امنیتی کپچا */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', display: 'block', marginBottom: '6px' }}>
                  کد امنیتی
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.slice(0, 5))}
                    placeholder="کد مقابل را وارد کنید"
                    className="mono-num"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '14px',
                      textAlign: 'center',
                      direction: 'ltr'
                    }}
                    maxLength={5}
                  />
                  <div
                    onClick={refreshCaptcha}
                    style={{
                      padding: '8px 16px',
                      background: '#e2e8f0',
                      borderRadius: '10px',
                      fontWeight: '900',
                      letterSpacing: '4px',
                      fontSize: '16px',
                      color: '#1e293b',
                      userSelect: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    title="برای تغییر کد کلیک کنید"
                  >
                    <span className="mono-num">{captchaCode}</span>
                    <RefreshCw size={13} color="#64748b" />
                  </div>
                </div>
              </div>

              {/* دکمه‌های اقدام */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>پرداخت آنلاین {Number(tuitionAmount).toLocaleString('fa-IR')} تومان</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  انصراف
                </button>
              </div>

              <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                🔒 کلیه تراکنش‌ها با استاندارد امنیتی شاپرک و نظارت بانک مرکزی جمهوری اسلامی ایران پردازش می‌گردد.
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
