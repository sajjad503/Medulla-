import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Calculator, ClipboardList } from 'lucide-react';

const SHAMSI_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const DAYS_OF_WEEK = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const SUBJECTS_LIST = ['زیست‌شناسی', 'شیمی', 'ریاضی', 'فیزیک', 'زمین‌شناسی'];

// دیتای فیک
const MOCK_WEEKLY_REPORT = {
  'شنبه': { date: '۱۵ مهر ۱۴۰۵', note: 'تمرکزم عالی بود.', subjects: { 'زیست‌شناسی': { study: 3.5, test: 85, topic: 'فصل ۲' } } },
  'یکشنبه': { date: '۱۶ مهر ۱۴۰۵', note: 'تست زمان‌دار زدم.', subjects: { 'شیمی': { study: 2.0, test: 40, topic: 'لوویس' }, 'زیست‌شناسی': { study: 2.0, test: 50, topic: 'مرور' } } }
};

function AdvisorStudentReport({ studentName }) {
  const [selectedDayNum, setSelectedDayNum] = useState(16);
  const [selectedMonth, setSelectedMonth] = useState('مهر');
  const [showShamsiPicker, setShowShamsiPicker] = useState(false);
  const [filterBySpecificDate, setFilterBySpecificDate] = useState(false);

  const getDayTotals = useCallback((dayName) => {
    const dayObj = MOCK_WEEKLY_REPORT[dayName]?.subjects || {};
    let studySum = 0, testSum = 0;
    SUBJECTS_LIST.forEach(sub => {
      studySum += dayObj[sub]?.study || 0;
      testSum += dayObj[sub]?.test || 0;
    });
    return { studySum, testSum };
  }, []);

  const getSubjectWeeklyTotals = useCallback((subjectName) => {
    let studySum = 0, testSum = 0;
    DAYS_OF_WEEK.forEach(day => {
      const cell = MOCK_WEEKLY_REPORT[day]?.subjects?.[subjectName];
      studySum += cell?.study || 0;
      testSum += cell?.test || 0;
    });
    return { studySum, testSum };
  }, []);

  const grandTotal = useMemo(() => {
    return DAYS_OF_WEEK.reduce((acc, day) => {
      const { studySum, testSum } = getDayTotals(day);
      return { study: acc.study + studySum, test: acc.test + testSum };
    }, { study: 0, test: 0 });
  }, [getDayTotals]);

  const handleSelectHistoricalDate = (dayNum) => {
    setSelectedDayNum(dayNum);
    setFilterBySpecificDate(true);
    setShowShamsiPicker(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '15px', fontWeight: '900', display: 'flex', gap: '10px' }}>
          <ClipboardList size={20} color="#C5A880" /> ماتریس هفتگی گزارش کار ({studentName})
        </h3>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {filterBySpecificDate && (
            <button onClick={() => setFilterBySpecificDate(false)} className="pill-badge" style={{ padding: '8px 14px', cursor: 'pointer' }}>نمایش کل هفته</button>
          )}
          <button onClick={() => setShowShamsiPicker(!showShamsiPicker)} className="gold-glow-btn" style={{ padding: '8px 18px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={15} /> جستجوی تاریخ در تقویم ({selectedDayNum} {selectedMonth})
          </button>
        </div>

        {/* تقویم شمسی */}
        {showShamsiPicker && (
          <div style={{ position: 'absolute', top: '110%', left: '20px', width: '330px', background: '#FDFBF7', border: '1px solid #0C1D3F', borderRadius: '10px', padding: '16px', zIndex: 999, boxShadow: '0 20px 40px rgba(12, 29, 63, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(12, 29, 63, 0.1)' }}>
              <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '13px' }}>انتخاب روز</span>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #C5A880', background: '#0C1D3F', color: '#E6C287', fontSize: '12px', fontWeight: 'bold' }}>
                {SHAMSI_MONTHS.map(m => <option key={m} value={m}>{m} ۱۴۰۵</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const d = i + 1;
                const active = d === selectedDayNum && filterBySpecificDate;
                return (
                  <button key={d} onClick={() => handleSelectHistoricalDate(d)} style={{ padding: '7px 0', borderRadius: '6px', border: active ? '1px solid #C5A880' : '1px solid rgba(12, 29, 63, 0.12)', background: active ? '#0C1D3F' : 'transparent', color: active ? '#E6C287' : '#0C1D3F', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>{d}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', background: '#0C1D3F', color: '#E6C287', fontWeight: '900', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>عملکرد هفتگی به تفکیک درس</span>
          <span className="mono-num" style={{ fontSize: '12px', color: '#FDFBF7' }}>مجموع هفته: {grandTotal.study}h | {grandTotal.test}T</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.05)', borderBottom: '2px solid rgba(12, 29, 63, 0.15)' }}>
                <th style={{ padding: '14px', fontSize: '12px', borderLeft: '1px solid rgba(12,29,63,0.1)' }}>درس / روز</th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} style={{ padding: '12px', fontSize: '12px', borderLeft: '1px solid rgba(12,29,63,0.08)' }}>{day}</th>
                ))}
                {/* ستون جدید: جمع کل برای تک درس */}
                <th style={{ padding: '14px', background: 'rgba(230,194,135,0.2)', color: '#0C1D3F', fontWeight: '900', fontSize: '12px' }}>جمع کل درس</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS_LIST.map((subject) => {
                const subTotals = getSubjectWeeklyTotals(subject);
                return (
                  <tr key={subject} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.08)' }}>
                    <td style={{ padding: '14px', fontWeight: '900', fontSize: '13px', background: 'rgba(12,29,63,0.02)', borderLeft: '1px solid rgba(12,29,63,0.1)' }}>{subject}</td>
                    {DAYS_OF_WEEK.map(day => {
                      const entry = MOCK_WEEKLY_REPORT[day]?.subjects?.[subject] || { study: 0, test: 0 };
                      const isFiltered = filterBySpecificDate && DAYS_OF_WEEK[(selectedDayNum - 1) % 7] !== day;
                      return (
                        <td key={day} style={{ padding: '10px', borderLeft: '1px solid rgba(12,29,63,0.06)', opacity: isFiltered ? 0.3 : 1 }}>
                           {entry.study > 0 ? (
                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                               <span style={{ fontSize: '11px', fontWeight: 'bold' }}><span className="mono-num">{entry.study}</span> ساعت</span>
                               <span className="pill-badge" style={{ padding: '2px 6px', fontSize: '10px' }}><span className="mono-num">{entry.test}</span> تست</span>
                             </div>
                           ) : '—'}
                        </td>
                      );
                    })}
                    {/* ستون جمع کل درس */}
                    <td style={{ padding: '12px', background: 'rgba(230,194,135,0.12)', fontWeight: '900' }}>
                      <div style={{ fontSize: '12px', color: '#0C1D3F' }}><span className="mono-num" style={{ fontSize: '14px' }}>{subTotals.studySum}</span> ساعت</div>
                      <div style={{ fontSize: '11px', color: '#C5A880', marginTop: '4px' }}><span className="mono-num" style={{ fontSize: '13px' }}>{subTotals.testSum}</span> تست</div>
                    </td>
                  </tr>
                );
              })}
              
              {/* سطر آخر جمع روزانه */}
              <tr style={{ background: '#0C1D3F', color: '#FDFBF7' }}>
                <td style={{ padding: '14px', fontWeight: '900', fontSize: '12px', borderLeft: '1px solid rgba(230,194,135,0.2)' }}><Calculator size={15} style={{ verticalAlign: 'middle' }}/> جمع کل روز</td>
                {DAYS_OF_WEEK.map(day => {
                  const dayTotals = getDayTotals(day);
                  const isFiltered = filterBySpecificDate && DAYS_OF_WEEK[(selectedDayNum - 1) % 7] !== day;
                  return (
                    <td key={day} style={{ padding: '14px 8px', borderLeft: '1px solid rgba(230,194,135,0.15)', opacity: isFiltered ? 0.3 : 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}><span className="mono-num" style={{ color: '#E6C287', fontSize: '14px' }}>{dayTotals.studySum}</span> h</div>
                      <div style={{ fontSize: '11px', color: 'gray', marginTop: '4px' }}><span className="mono-num" style={{ color: '#E6C287', fontSize: '13px' }}>{dayTotals.testSum}</span> T</div>
                    </td>
                  );
                })}
                <td style={{ background: '#C5A880', color: '#0C1D3F', fontWeight: '900', padding: '14px' }}>
                  <div style={{ fontSize: '13px' }}>{grandTotal.study} h</div>
                  <div style={{ fontSize: '12px' }}>{grandTotal.test} T</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdvisorStudentReport;