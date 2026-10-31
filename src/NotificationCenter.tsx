import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, Trash2, Calendar, Award, AlertTriangle, 
  MessageCircle, ClipboardList, CheckCircle2, ChevronLeft, 
  Volume2, Clock, Sparkles, Filter, X
} from 'lucide-react';
import { showVoiceToast } from './VoiceComponents';

export interface NotificationItem {
  id: string;
  type: 'advisor_message' | 'missing_report' | 'new_plan' | 'new_exam' | 'system';
  title: string;
  message: string;
  timestamp: string;
  date: string;
  isRead: boolean;
  priority: 'high' | 'normal' | 'urgent';
  targetTab?: 'dashboard' | 'plan' | 'workreport' | 'answersheet' | 'exams' | 'reports';
  actionLabel?: string;
  deadline?: string;
}

interface NotificationCenterProps {
  onNavigateTab: (tab: 'dashboard' | 'plan' | 'workreport' | 'answersheet' | 'exams' | 'reports') => void;
  advisorName?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'missing_report',
    title: '⚠️ اخطار عدم ارسال گزارش‌کار روز گذشته',
    message: 'گزارش مطالعه روز گذشته هنوز ثبت نشده است! مهلت ارسال نهایی تا فردا ساعت ۱۶:۰۰ (۴ عصر) است؛ پس از این ساعت اخطار به پنل والد ارسال می‌شود.',
    timestamp: 'امروز ۱۶:۰۰',
    date: 'امروز',
    isRead: false,
    priority: 'urgent',
    targetTab: 'workreport',
    actionLabel: 'ثبت سریع گزارش‌کار',
    deadline: 'مهلت: فردا ساعت ۴ عصر'
  },
  {
    id: 'notif-2',
    type: 'new_plan',
    title: '📅 دریافت برنامه راهبردی جدید هفته',
    message: 'برنامه درسی هفتگی جدید (۱ تا ۷ آبان) توسط مشاور شما تنظیم و بر روی میز کار قرار گرفت. پارت‌های تست زمان‌دار مشخص شده است.',
    timestamp: '۲ ساعت پیش',
    date: 'امروز',
    isRead: false,
    priority: 'high',
    targetTab: 'plan',
    actionLabel: 'مشاهده برنامه درسی'
  },
  {
    id: 'notif-3',
    type: 'advisor_message',
    title: '🎙️ پیام صوتی و متنی جدید مشاور',
    message: 'دکتر کاظمی: «یاشا عزیز، در درس زیست و شیمی رشد تراز عالی داشتی، برای ریاضی تست‌های مشتق رو از منبع دوم حتماً حل کن.»',
    timestamp: 'امروز ۱۰:۳۰',
    date: 'امروز',
    isRead: false,
    priority: 'normal',
    targetTab: 'dashboard',
    actionLabel: 'گوش دادن به ویس و پیام'
  },
  {
    id: 'notif-4',
    type: 'new_exam',
    title: '📊 نمرات و کارنامه جدید آزمون ماز',
    message: 'کارنامه آزمون مرحله‌ای ۲ آبان منتشر شد. تراز کل: ۷۱۲۰ | رتبه کشوری: ۲۱۵ | درصد زیست‌شناسی: ۸۱٪.',
    timestamp: 'دیروز ۱۸:۱۵',
    date: 'دیروز',
    isRead: true,
    priority: 'normal',
    targetTab: 'reports',
    actionLabel: 'مشاهده تحلیل کارنامه'
  }
];

export default function NotificationCenter({ onNavigateTab, advisorName = 'دکتر کاظمی' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('mentora_notifications_v2');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'advisor' | 'report' | 'exam'>('all');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mentora_notifications_v2', JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showVoiceToast('تمامی اعلان‌ها خوانده شدند ✅', 'info');
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id);
    if (item.targetTab) {
      onNavigateTab(item.targetTab);
      setIsOpen(false);
    }
  };

  // Add sample notification to test system
  const handleAddSampleNotification = () => {
    const sample: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'advisor_message',
      title: `⚡ پیام فوری از مشاور (${advisorName})`,
      message: 'بررسی گزارش کار دیروز انجام شد؛ سرعت مطالعه شما ۲۰٪ بهبود یافته است.',
      timestamp: 'همین الان',
      date: 'امروز',
      isRead: false,
      priority: 'high',
      targetTab: 'dashboard',
      actionLabel: 'مشاهده پیام'
    };
    setNotifications(prev => [sample, ...prev]);
    playChime();
    showVoiceToast('🔔 اعلان جدیدی از مشاور دریافت شد!', 'info');
  };

  // Filtered list
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'advisor') return n.type === 'advisor_message';
    if (activeFilter === 'report') return n.type === 'missing_report' || n.type === 'new_plan';
    if (activeFilter === 'exam') return n.type === 'new_exam';
    return true;
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            playChime();
          }
        }}
        className="pill-badge"
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px 12px',
          background: unreadCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(12, 29, 63, 0.05)',
          borderColor: unreadCount > 0 ? '#EF4444' : 'var(--border-color)',
          color: unreadCount > 0 ? '#EF4444' : 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
        title="مرکز اعلان‌ها و هشدارهای تحصیلی"
      >
        <Bell size={16} className={unreadCount > 0 ? 'bell-ring-animation' : ''} />
        <span style={{ fontSize: '11px', fontWeight: 'bold' }} className="hide-on-mobile">
          اعلان‌ها
        </span>
        {unreadCount > 0 && (
          <span 
            className="mono-num" 
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '50px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: '900',
              lineHeight: '1',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: 0,
          width: 'min(380px, calc(100vw - 24px))',
          background: 'var(--bg-panel)',
          borderRadius: '18px',
          border: '1.5px solid var(--gold)',
          boxShadow: '0 20px 50px rgba(12, 29, 63, 0.25)',
          zIndex: 100000,
          direction: 'rtl',
          animation: 'fadeIn 0.2s ease-out',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0C1D3F 0%, #1B3366 100%)',
            color: '#FFFFFF',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="#E6C287" />
              <span style={{ fontWeight: '900', fontSize: '14px', color: '#FFFFFF' }}>
                مرکز اعلان‌های دانش‌آموز
              </span>
              {unreadCount > 0 && (
                <span className="pill-badge" style={{ background: '#EF4444', color: '#FFFFFF', border: 'none', padding: '2px 7px', fontSize: '10px' }}>
                  {unreadCount} جدید
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#E6C287',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="خواندن همه"
                >
                  <Check size={12} /> خواندن همه
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            gap: '4px',
            padding: '8px 12px',
            background: 'rgba(12, 29, 63, 0.03)',
            borderBottom: '1px solid rgba(12, 29, 63, 0.08)',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '50px',
                border: 'none',
                background: activeFilter === 'all' ? '#0C1D3F' : 'transparent',
                color: activeFilter === 'all' ? '#E6C287' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              همه ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('report')}
              style={{
                padding: '4px 10px',
                borderRadius: '50px',
                border: 'none',
                background: activeFilter === 'report' ? '#0C1D3F' : 'transparent',
                color: activeFilter === 'report' ? '#E6C287' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              برنامه و گزارش
            </button>
            <button
              onClick={() => setActiveFilter('advisor')}
              style={{
                padding: '4px 10px',
                borderRadius: '50px',
                border: 'none',
                background: activeFilter === 'advisor' ? '#0C1D3F' : 'transparent',
                color: activeFilter === 'advisor' ? '#E6C287' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              پیام‌های مشاور
            </button>
            <button
              onClick={() => setActiveFilter('exam')}
              style={{
                padding: '4px 10px',
                borderRadius: '50px',
                border: 'none',
                background: activeFilter === 'exam' ? '#0C1D3F' : 'transparent',
                color: activeFilter === 'exam' ? '#E6C287' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              نمرات آزمون
            </button>
          </div>

          {/* List Area */}
          <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px' }} className="custom-scrollbar">
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'gray', fontSize: '12px' }}>
                اعلان جدیدی در این دسته‌بندی وجود ندارد ✨
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredNotifications.map(item => {
                  const isUrgent = item.priority === 'urgent';
                  const isHigh = item.priority === 'high';

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: !item.isRead 
                          ? (isUrgent ? 'rgba(239, 68, 68, 0.08)' : 'rgba(230, 194, 135, 0.15)') 
                          : 'var(--bg-main)',
                        border: !item.isRead 
                          ? (isUrgent ? '1.5px solid #EF4444' : '1px solid var(--gold)') 
                          : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.type === 'missing_report' && <AlertTriangle size={15} color="#EF4444" />}
                          {item.type === 'new_plan' && <Calendar size={15} color="#10B981" />}
                          {item.type === 'advisor_message' && <Volume2 size={15} color="#C5A880" />}
                          {item.type === 'new_exam' && <Award size={15} color="#6366F1" />}
                          
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '900',
                            color: isUrgent ? '#B91C1C' : 'var(--primary)'
                          }}>
                            {item.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!item.isRead && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isUrgent ? '#EF4444' : '#10B981', display: 'inline-block' }} />
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(item.id, e)}
                            style={{ background: 'transparent', border: 'none', color: 'gray', cursor: 'pointer', padding: '2px' }}
                            title="حذف این اعلان"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Message Body */}
                      <p style={{
                        fontSize: '11px',
                        lineHeight: '1.7',
                        color: 'var(--text-main)',
                        margin: '0 0 8px 0'
                      }}>
                        {item.message}
                      </p>

                      {/* Footer Info & Action */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} /> {item.timestamp}
                          </span>
                          {item.deadline && (
                            <span style={{ color: '#EF4444', fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                              {item.deadline}
                            </span>
                          )}
                        </div>

                        {item.actionLabel && (
                          <span style={{
                            color: isUrgent ? '#EF4444' : 'var(--primary)',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {item.actionLabel} <ChevronLeft size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer toolbar */}
          <div style={{
            padding: '8px 12px',
            background: 'rgba(12, 29, 63, 0.04)',
            borderTop: '1px solid rgba(12, 29, 63, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={handleAddSampleNotification}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold-dark)',
                fontSize: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={12} /> ارسال اعلان آزمایشی مشاور
            </button>

            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              سیستم هوشمند مدولا
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
