import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Clock, CheckCircle, AlertCircle, 
  Trash2, BookOpen, Calendar, Loader2, XCircle
} from 'lucide-react';
import api from './api';

interface AdvisorStudentHomeworksProps {
  student: any;
}

export default function AdvisorStudentHomeworks({ student }: AdvisorStudentHomeworksProps) {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Homework Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('زیست‌شناسی');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('fa-IR');
  });
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHomeworks();
  }, [student?.id]);

  const fetchHomeworks = async () => {
    if (!student?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/records/homeworks?student_id=${student.id}`);
      setHomeworks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setHomeworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('لطفاً عنوان تکلیف را وارد کنید.');

    setSaving(true);
    try {
      const res = await api.post('/records/homeworks', {
        student_id: student.id,
        title: title.trim(),
        subject,
        due_date: dueDate,
        description: description.trim()
      });
      alert(res.data.message || 'تکلیف با موفقیت برای دانش‌آموز ثبت گردید.');
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchHomeworks();
    } catch (err: any) {
      alert(err.response?.data?.detail || err.response?.data?.message || 'خطا در ثبت تکلیف.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await api.post('/records/homeworks/toggle', { id });
      setHomeworks(prev => prev.map(h => h.id === id ? { ...h, status: res.data.status } : h));
    } catch (err) {
      alert('خطا در تغییر وضعیت تکلیف.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('آیا از حذف این تکلیف اطمینان دارید؟')) return;
    try {
      await api.post('/records/homeworks/delete', { id });
      setHomeworks(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      alert('خطا در حذف تکلیف.');
    }
  };

  const totalCount = homeworks.length;
  const completedCount = homeworks.filter(h => h.status === 'completed').length;
  const pendingCount = totalCount - completedCount;
  const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out', direction: 'rtl' }}>
      
      {/* هدر بخش تکالیف */}
      <div className="bento-card" style={{ marginBottom: '20px', borderRight: '4px solid #8B5CF6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main, #0C1D3F)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={20} color="#8B5CF6" />
              مدیریت تکالیف و تمرین‌های درسی: {student.name}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, gray)' }}>
              تعریف تسک‌های مطالعاتی، تمرین‌های تست‌زنی و پیگیری آنلاین وضعیت انجام تکالیف توسط دانش‌آموز.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pill-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', borderColor: '#10B981', fontSize: '12px' }}>
              نرخ انجام: {rate}٪
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="gold-glow-btn"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>تعریف تکلیف جدید</span>
            </button>
          </div>
        </div>

        {/* کارت‌های آماری */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(12,29,63,0.03)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>کل تکالیف</span>
            <div className="mono-num" style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>{totalCount}</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#10B981' }}>انجام‌شده</span>
            <div className="mono-num" style={{ fontSize: '20px', fontWeight: '900', color: '#10B981' }}>{completedCount}</div>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#D97706' }}>در انتظار انجام</span>
            <div className="mono-num" style={{ fontSize: '20px', fontWeight: '900', color: '#D97706' }}>{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* جدول و لیست تکالیف */}
      <div className="bento-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin-animation" style={{ margin: '0 auto 10px auto' }} />
            <span>در حال بارگذاری تکالیف...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(12, 29, 63, 0.05)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>عنوان تکلیف</th>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>درس</th>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>مهلت تحویل</th>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>وضعیت</th>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>توضیحات مشاور</th>
                  <th style={{ padding: '12px', color: 'var(--text-main)' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {homeworks.map(hw => {
                  const isDone = hw.status === 'completed';
                  return (
                    <tr key={hw.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {hw.title}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="pill-badge" style={{ background: 'rgba(197, 168, 128, 0.15)', color: 'var(--text-main)' }}>
                          {hw.subject}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }} className="mono-num">
                        {hw.due_date || '---'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          onClick={() => handleToggle(hw.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            background: isDone ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                            color: isDone ? '#10B981' : '#D97706',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="کلیک برای تغییر وضعیت دستی"
                        >
                          {isDone ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {isDone ? 'انجام شد' : 'در انتظار'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px', textAlign: 'right' }}>
                        {hw.description || '---'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleDelete(hw.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="حذف تکلیف"
                        >
                          <Trash2 size={12} />
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {homeworks.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', color: 'var(--text-muted)' }}>
                      هنوز تکلیفی برای «{student.name}» ثبت نشده است. با دکمه بالا تکلیف جدید ایجاد کنید.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودال تعریف تکلیف جدید */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 18, 41, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, direction: 'rtl', padding: '16px' }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '460px', animation: 'fadeIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main, #0C1D3F)', fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="#8B5CF6" />
                تعریف تکلیف جدید برای {student.name}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  عنوان تکلیف / تمرین:
                </label>
                <input
                  type="text"
                  placeholder="مثال: ۵۰ تست زمان‌دار از ژنتیک جمعیت"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    درس مربوطه:
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
                  >
                    <option value="زیست‌شناسی">زیست‌شناسی</option>
                    <option value="شیمی">شیمی</option>
                    <option value="فیزیک">فیزیک</option>
                    <option value="ریاضیات">ریاضیات</option>
                    <option value="زمین‌شناسی">زمین‌شناسی</option>
                    <option value="ادبیات">ادبیات</option>
                    <option value="عربی">عربی</option>
                    <option value="دینی">دینی</option>
                    <option value="زبان انگلیسی">زبان انگلیسی</option>
                    <option value="عمومی و مهارتی">عمومی و مهارتی</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                    مهلت تحویل (تاریخ):
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', direction: 'ltr' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  جزئیات و دستورالعمل حل تمرین:
                </label>
                <textarea
                  rows={3}
                  placeholder="منبع تست، شماره سوالات، یا نحوه بررسی پاسخنامه تشریحی را بنویسید..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)' }}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gold-glow-btn"
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <Loader2 size={16} className="spin-animation" /> : 'ثبت و ارسال به دانش‌آموز'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
