import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { getPendingOfflineCount, syncOfflineQueueToServer, initAutoOfflineSync } from './offlineSync';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(getPendingOfflineCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = (e: any) => {
      setPendingCount(e?.detail?.count ?? getPendingOfflineCount());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mentora_offline_sync_change', handleQueueChange);

    const cleanupAuto = initAutoOfflineSync((info) => {
      setPendingCount(info.remaining);
      setSyncToast(`${info.synced} مورد آفلاین با موفقیت به سرور ارسال و همگام‌سازی شد ✅`);
      setTimeout(() => setSyncToast(null), 5000);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mentora_offline_sync_change', handleQueueChange);
      cleanupAuto();
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert('اتصال اینترنت برقرار نیست. به محض اتصال، داده‌ها خودکار ارسال می‌شوند.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncOfflineQueueToServer();
      setPendingCount(res.failed);
      if (res.synced > 0) {
        setSyncToast(`${res.synced} مورد آفلاین با موفقیت همگام‌سازی شد ✅`);
        setTimeout(() => setSyncToast(null), 5000);
      } else {
        setSyncToast('تمامی اطلاعات قبلاً با سرور همگام شده‌اند.');
        setTimeout(() => setSyncToast(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !syncToast) {
    return null;
  }

  return (
    <>
      {/* Toast notification on successful sync */}
      {syncToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          fontSize: '13px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          direction: 'rtl'
        }}>
          <CheckCircle size={18} />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Offline or Pending Outbox Status Banner */}
      {(!isOnline || pendingCount > 0) && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          background: !isOnline 
            ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' 
            : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          direction: 'rtl',
          border: '1px solid rgba(255,255,255,0.2)',
          fontSize: '12px',
          backdropFilter: 'blur(8px)'
        }}>
          {!isOnline ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <WifiOff size={16} />
              <span><strong>حالت آفلاین فعال:</strong> فعالیت‌ها در حافظه دستگاه ذخیره می‌شوند.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={16} color="#86efac" />
              <span><strong>اتصال برقرار شد:</strong> {pendingCount} مورد در صف ارسال</span>
            </div>
          )}

          {pendingCount > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {pendingCount} مورد در انتظار
            </span>
          )}

          {isOnline && pendingCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              style={{
                background: '#ffffff',
                color: '#b45309',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'در حال ارسال...' : 'همگام‌سازی الان'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
