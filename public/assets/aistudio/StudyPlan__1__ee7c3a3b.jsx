import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Clock, BookOpen, AlertCircle, Loader2, Target, CheckSquare, Square } from 'lucide-react';
import api from './api';

function StudyPlan() {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // روزهای هفته برای نمایش در رابط کاربری
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  useEffect(() => {
    fetchMyPlan();
  }, []);

  const fetchMyPlan = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/records/my-plan');
      
      if (response.data && response.data.plan_data) {
        setPlan(response.data);
      } else {
        // اگر در دیتابیس برنامه‌ای نبود، حالت خالی نمایش داده شود
        setPlan(null);
      }
    } catch (err) {
      console.error(err);
      setError('خطا در دریافت برنامه مطالعاتی. لطفاً اینترنت خود را بررسی کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = (day, taskIndex) => {
    // در یک سیستم واقعی اینجا یک درخواست به بک‌اند می‌فرستیم تا تیک خوردن تسک در دیتابیس هم ذخیره شود
    // فعلاً برای تجربه کاربری دانش‌آموز، در استیت فرانت‌اند تغییر را اعمال می‌کنیم
    const updatedPlan = { ...plan };
    const task = updatedPlan.plan_data[day][taskIndex];
    task.isDone = !task.isDone;
    setPlan(updatedPlan);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--gold-dark)' }}>
        <Loader2 size={40} className="animate-spin" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: 'var(--primary)' }}>در حال دریافت برنامه از سرور...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bento-card" style={{ border: '1px solid var(--danger)', textAlign: 'center', margin: '20px' }}>
        <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
        <button onClick={fetchMyPlan} className="btn btn-primary" style={{ marginTop: '15px' }}>تلاش مجدد</button>
      </div>
    );
  }

  // نمای وقتی که مشاور هنوز برنامه‌ای نچیده است
  if (!plan) {
    return (
      <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div className="bento-card" style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border-color)' }}>
          <CalendarDays size={64} color="var(--border-color)" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>برنامه‌ای یافت نشد!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px auto', lineHeight: '1.8' }}>
            مشاور شما هنوز برنامه مطالعاتی این هفته را در سیستم ثبت نکرده است. به محض ثبت، برنامه به صورت خودکار در اینجا نمایان خواهد شد.
          </p>
        </div>
      </div>
    );
  }

  // نمای اصلی تقویم برنامه‌ریزی
  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', paddingBottom: '40px' }}>
      
      {/* هدر برنامه */}
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '3px solid var(--gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px', color: 'var(--gold)' }}>
            <Target size={28} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '20px', fontWeight: '900' }}>برنامه مطالعاتی هفته جاری</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
              بازه زمانی: {plan.start_date || 'نامشخص'} الی {plan.end_date || 'نامشخص'}
            </span>
          </div>
        </div>
        <div style={{ background: 'var(--hover-bg)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold' }}>مشاور شما این برنامه را تنظیم کرده است</span>
        </div>
      </div>

      {/* تقویم هفتگی */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {daysOfWeek.map((day) => {
          const dayTasks = plan.plan_data[day] || [];
          
          return (
            <div key={day} className="bento-card" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--primary)', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{day}</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px' }}>{dayTasks.length} باکس مطالعه</span>
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dayTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '13px' }}>
                    باکس مطالعه‌ای برای این روز تعریف نشده است.
                  </div>
                ) : (
                  dayTasks.map((task, index) => (
                    <div 
                      key={index}
                      onClick={() => toggleTaskStatus(day, index)}
                      style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', 
                        borderRadius: '10px', border: '1px solid var(--border-color)', 
                        background: task.isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-panel)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        opacity: task.isDone ? 0.7 : 1
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {task.isDone ? <CheckSquare size={20} color="var(--success)" /> : <Square size={20} color="var(--border-color)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 'bold', color: task.isDone ? 'var(--text-muted)' : 'var(--primary)', fontSize: '14px', textDecoration: task.isDone ? 'line-through' : 'none' }}>
                            {task.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                            <Clock size={12} /> {task.duration} دقیقه
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.6' }}>
                          {task.description}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default StudyPlan;