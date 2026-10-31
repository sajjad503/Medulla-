import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle, ChevronDown, ChevronUp, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import api from './api';

interface GracePeriodBannerProps {
  graceRemainingSeconds: number;
  graceUntil?: string;
  studentFee?: number;
  lastPayment?: any;
  onRefreshStatus?: () => void;
}

export default function GracePeriodBanner({
  graceRemainingSeconds,
  graceUntil,
  studentFee = 490000,
  lastPayment,
  onRefreshStatus
}: GracePeriodBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(graceRemainingSeconds || 86400);
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (graceUntil) {
      const diff = Math.max(0, Math.floor((new Date(graceUntil).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    } else {
      setSecondsLeft(graceRemainingSeconds);
    }
  }, [graceRemainingSeconds, graceUntil]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshStatus) await onRefreshStatus();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <aside aria-label="وضعیت اشتراک موقت" style={{
      background: 'linear-gradient(90deg, #1B3366 0%, #0C1D3F 50%, #2A1F05 100%)',
      borderBottom: '2px solid rgba(230, 194, 135, 0.6)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      color: '#fff',
      padding: '8px 16px',
      direction: 'rtl',
      fontSize: '12px',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        
        {/* متن و آیکون هشدار طلایی */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(230, 194, 135, 0.2)',
            color: '#E6C287',
            border: '1px solid #E6C287',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={16} />
          </div>
          <div>
            <span style={{ fontWeight: '900', color: '#E6C287', marginLeft: '6px' }}>
              دسترسی موقت ۲۴ ساعته فعال است
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              رسید کارت به کارت شما ثبت شده و در انتظار تایید مدیریت پلتفرم (Founder) است. کلیه امکانات تا اتمام این مهلت به صورت نامحدود در دسترس شماست.
            </span>
          </div>
        </div>

        {/* تایمر معکوس و دکمه‌ها */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(230, 194, 135, 0.4)',
            borderRadius: '10px',
            padding: '4px 12px'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>مهلت موقت:</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: '900',
              color: '#E6C287',
              letterSpacing: '1px',
              direction: 'ltr'
            }}>
              {formattedTime}
            </span>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              padding: '5px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetails ? 'بستن جزئیات' : 'اطلاعات فیش'}
          </button>

          <button
            onClick={handleManualRefresh}
            title="بررسی وضعیت تایید توسط مدیر"
            style={{
              background: 'transparent',
              border: '1px solid rgba(230, 194, 135, 0.4)',
              color: '#E6C287',
              padding: '5px 8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
            بررسی تایید
          </button>
        </div>
      </div>

      {/* پنل بازشونده جزئیات فیش */}
      {showDetails && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <div>
            <strong>شماره کارت واریزی: </strong>
            <span style={{ fontFamily: 'monospace', color: '#E6C287' }}>۶۲۱۹-۸۶۱۴-۰۸۰۵-۲۴۵۳</span> (سجاد حامدی)
          </div>
          <div>
            <strong>مبلغ: </strong>
            <span>{Number(studentFee).toLocaleString('fa-IR')} تومان</span>
          </div>
          <div>
            <strong>کد پیگیری: </strong>
            <span style={{ fontFamily: 'monospace', color: '#10B981' }}>{lastPayment?.tracking_code || 'ثبت شده'}</span>
          </div>
          <div>
            <strong>وضعیت در کارتابل مدیر: </strong>
            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>در صف بررسی مدیریت کل (Founder)</span>
          </div>
        </div>
      )}
    </aside>
  );
}
