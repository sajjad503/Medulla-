import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, Copy, Trash2, Printer, Save, Plus, Archive, CalendarDays, ChevronDown, FileText 
} from 'lucide-react';

// کامپوننت هوشمند Textarea که با هر مقدار متنی (تایپ یا بارگذاری) خودکار کش می‌آید
function AutoGrowTextarea({ value, onChange, placeholder, style, onFocus, onBlur }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      style={{
        ...style,
        overflow: 'hidden',
        resize: 'none',
        boxSizing: 'border-box'
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function AdvisorStudentPlan({ studentName = 'یاشا' }) {
  const shamsiMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

  // استیت‌های تقویم شمسی و انتخاب ماه/هفته
  const [selectedYear, setSelectedYear] = useState('۱۴۰۵');
  const [selectedMonth, setSelectedMonth] = useState('مهر');
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1); // هفته ۱ تا ۴
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // استیت انتخاب ماه برای خروجی PDF ماهانه (۴ جدول در ۱ فایل)
  const [pdfExportMonth, setPdfExportMonth] = useState('مهر');
  const [isMonthlyPrintMode, setIsMonthlyPrintMode] = useState(false);

  // پارت‌های مطالعاتی
  const [planParts, setPlanParts] = useState([
    { id: 1, name: 'پارت ۱ (صبح)' },
    { id: 2, name: 'پارت ۲ (ظهر)' },
    { id: 3, name: 'پارت ۳ (عصر)' },
    { id: 4, name: 'پارت ۴ (شب)' }
  ]);

  // ذخیره‌سازی برنامه‌ها به تفکیک کلیدِ «ماه-هفته» (تا پایان ماه هر ۴ هفته کنار هم باشند)
  const [allSchedules, setAllSchedules] = useState({
    'مهر-1': {
      '1-شنبه': 'زیست دهم - فصل ۱ (دیروز تا امروز)\nگفتار ۱ و ۲ کامل + ۴۰ تست آموزشی بدون زمان',
      '2-شنبه': 'شیمی یازدهم - فصل ۱\nمسائل استوکیومتری + ۲۵ تست مضرب ۲',
      'class-شنبه': 'کلاس فیزیک استاد رحمانی (ساعت ۱۶ الی ۱۸:۳۰)',
      '1-یکشنبه': 'ریاضی جامع - مبحث تابع\nمرور جزوه + حل ۳۰ تست کنکور سراسری'
    },
    'مهر-2': {
      '1-شنبه': 'زیست دهم - فصل ۲ (گوارش)\nتحلیل کامل شکل‌های کتاب درسی + ۵۰ تست',
      '2-دوشنبه': 'فیزیک دوازدهم - حرکت بر خط راست\nتست‌های سرعت ثابت و شتاب ثابت',
      'class-سه‌شنبه': 'کلاس زیست آنلاین (ساعت ۱۷ الی ۱۹)'
    },
    'مهر-3': {
      '1-شنبه': 'شیمی دهم - ساختار اتم و جدول تناوبی\nمرور نکات حفظی + ۳۵ تست',
      'class-پنجشنبه': 'آزمون آزمایشی جامع + تحلیل ویدیویی عصر'
    },
    'مهر-4': {
      '1-شنبه': 'جمع‌بندی مباحث مهرماه\nمرور خلاصه‌نویسی‌ها و تست‌های مارک‌دار',
      '2-جمعه': 'بررسی کارنامه آزمون و رفع اشکال مباحث ضعیف'
    }
  });

  // کلید هفته فعلی
  const currentScheduleKey = `${selectedMonth}-${selectedWeekIndex}`;
  const currentPlanCells = allSchedules[currentScheduleKey] || {};

  // محاسبه بازه تاریخ هفته بر اساس شماره هفته در ماه شمسی
  const getWeekDateRangeText = (monthName, weekIdx) => {
    const startDay = (weekIdx - 1) * 7 + 1;
    const endDay = Math.min(weekIdx * 7, 30);
    return `${startDay} ${monthName} تا ${endDay} ${monthName} ${selectedYear}`;
  };

  // تغییر متن داخل هر باکس
  const handleCellChange = (cellKey, value) => {
    setAllSchedules(prev => ({
      ...prev,
      [currentScheduleKey]: {
        ...(prev[currentScheduleKey] || {}),
        [cellKey]: value
      }
    }));
  };

  // انتخاب یک روز از داخل تقویم شمسی و پرش خودکار به هفته مربوطه
  const handleSelectDayFromShamsiCalendar = (dayNumber) => {
    const calculatedWeek = Math.min(Math.ceil(dayNumber / 7), 4);
    setSelectedWeekIndex(calculatedWeek);
    setShowCalendarModal(false);
  };

  const addPart = () => {
    const newId = planParts.length > 0 ? Math.max(...planParts.map(p => p.id)) + 1 : 1;
    setPlanParts([...planParts, { id: newId, name: `پارت ${newId}` }]);
  };

  const removePart = (id) => {
    setPlanParts(planParts.filter(part => part.id !== id));
  };

  const clearCurrentWeekPlan = () => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید برنامه «هفته ${selectedWeekIndex} ${selectedMonth}» را پاک کنید؟`)) {
      setAllSchedules(prev => ({
        ...prev,
        [currentScheduleKey]: {}
      }));
    }
  };

  const copySingleBox = (key) => {
    const text = currentPlanCells[key] || '';
    if (!text) {
      alert('این باکس خالی است!');
      return;
    }
    navigator.clipboard?.writeText(text);
    alert('محتوای این باکس کپی شد ✅');
  };

  const copyEntireWeekPlan = () => {
    let formatted = `برنامه مطالعاتی ${studentName} (${getWeekDateRangeText(selectedMonth, selectedWeekIndex)})\n-----------------------------------\n`;
    daysOfWeek.forEach(day => {
      formatted += `\n📌 ${day}:\n`;
      planParts.forEach(part => {
        const val = currentPlanCells[`${part.id}-${day}`];
        if (val) formatted += `  • ${part.name}: ${val}\n`;
      });
      if (currentPlanCells[`class-${day}`]) {
        formatted += `  🎓 کلاس: ${currentPlanCells[`class-${day}`]}\n`;
      }
    });
    navigator.clipboard?.writeText(formatted);
    alert('کل برنامه این هفته کپی شد ✅');
  };

  // چاپ / ذخیره PDF تک هفته فعلی
  const exportSingleWeekPDF = () => {
    setIsMonthlyPrintMode(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // چاپ / ذخیره PDF کل ماه (۴ جدولِ ۴ هفته زیر هم در یک PDF)
  const exportMonthlyFourTablesPDF = () => {
    setIsMonthlyPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // رندرکننده یک جدول هفتگی (قابل استفاده هم برای نمای تکی و هم برای نمای ۴ جدوله ماهانه)
  const renderScheduleTable = (monthName, weekIdx, isReadOnly = false) => {
    const key = `${monthName}-${weekIdx}`;
    const cellsData = allSchedules[key] || {};

    return (
      <div key={key} className="bento-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <div style={{ padding: '14px 20px', background: '#0C1D3F', color: '#FDFBF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '900', fontSize: '14px', color: '#E6C287' }}>
            برنامه مطالعاتی {studentName} — هفته {weekIdx} {monthName}
          </span>
          <span className="mono-num" style={{ fontSize: '12px', color: '#FDFBF7' }}>
            {getWeekDateRangeText(monthName, weekIdx)}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px', textAlign: 'center', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: 'rgba(12, 29, 63, 0.04)', borderBottom: '1px solid rgba(12, 29, 63, 0.15)' }}>
                <th style={{ padding: '12px', width: '120px', color: '#0C1D3F', fontWeight: '900', fontSize: '12px', borderLeft: '1px solid rgba(12, 29, 63, 0.1)' }}>پارت / روز</th>
                {daysOfWeek.map(day => (
                  <th key={day} style={{ padding: '12px', color: '#0C1D3F', fontWeight: '900', fontSize: '13px', borderLeft: '1px solid rgba(12, 29, 63, 0.08)' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planParts.map((part) => (
                <tr key={part.id} style={{ borderBottom: '1px solid rgba(12, 29, 63, 0.1)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#0C1D3F', fontSize: '12px', background: 'rgba(12, 29, 63, 0.02)', borderLeft: '1px solid rgba(12, 29, 63, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{part.name}</span>
                      {!isReadOnly && (
                        <button 
                          onClick={() => removePart(part.id)} 
                          className="no-print"
                          title="حذف پارت"
                          style={{ background: 'transparent', border: 'none', color: 'rgba(12, 29, 63, 0.4)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                  {daysOfWeek.map(day => {
                    const cellKey = `${part.id}-${day}`;
                    return (
                      <td key={day} style={{ padding: '8px', verticalAlign: 'top', borderLeft: '1px solid rgba(12, 29, 63, 0.08)', position: 'relative' }}>
                        {!isReadOnly && (
                          <button
                            onClick={() => copySingleBox(cellKey)}
                            className="no-print"
                            title="کپی این باکس"
                            style={{ position: 'absolute', left: '5px', top: '5px', background: 'transparent', border: 'none', color: 'rgba(12, 29, 63, 0.25)', cursor: 'pointer', padding: '2px' }}
                          >
                            <Copy size={11} />
                          </button>
                        )}
                        <AutoGrowTextarea
                          value={cellsData[cellKey] || ''}
                          onChange={(e) => !isReadOnly && handleCellChange(cellKey, e.target.value)}
                          placeholder={isReadOnly ? '—' : 'ثبت مبحث...'}
                          style={{
                            width: '100%',
                            minHeight: '55px',
                            background: 'transparent',
                            border: '1px solid transparent',
                            borderRadius: '4px',
                            padding: '6px',
                            color: '#0C1D3F',
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            lineHeight: '1.65',
                            outline: 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                          onFocus={(e) => { if (!isReadOnly) { e.target.style.border = '1px solid #C5A880'; e.target.style.background = 'rgba(230, 194, 135, 0.06)'; } }}
                          onBlur={(e) => { if (!isReadOnly) { e.target.style.border = '1px solid transparent'; e.target.style.background = 'transparent'; } }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* سطر ویژه کلاس‌های آموزشی */}
              <tr style={{ background: '#0C1D3F' }}>
                <td style={{ padding: '12px', fontWeight: '900', color: '#E6C287', fontSize: '12px', borderLeft: '1px solid rgba(230, 194, 135, 0.2)' }}>
                  کلاس‌های آموزشی 🎓
                </td>
                {daysOfWeek.map(day => {
                  const classKey = `class-${day}`;
                  return (
                    <td key={day} style={{ padding: '8px', verticalAlign: 'top', borderLeft: '1px solid rgba(230, 194, 135, 0.15)' }}>
                      <AutoGrowTextarea
                        value={cellsData[classKey] || ''}
                        onChange={(e) => !isReadOnly && handleCellChange(classKey, e.target.value)}
                        placeholder={isReadOnly ? '—' : 'ساعت و نام کلاس...'}
                        style={{
                          width: '100%',
                          minHeight: '48px',
                          background: 'rgba(253, 251, 247, 0.05)',
                          border: '1px dashed rgba(230, 194, 135, 0.35)',
                          borderRadius: '4px',
                          padding: '6px',
                          color: '#E6C287',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          lineHeight: '1.6',
                          outline: 'none',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* ۱. نوار ابزار تقویم شمسی و مدیریت برنامه هفتگی */}
      <div className="no-print bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        
        {/* انتخابگر هفته با تقویم شمسی */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', position: 'relative' }}>
          <button 
            onClick={() => setShowCalendarModal(!showCalendarModal)}
            className="gold-glow-btn"
            style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={16} />
            انتخاب هفته از تقویم شمسی: هفته {selectedWeekIndex} {selectedMonth} ({getWeekDateRangeText(selectedMonth, selectedWeekIndex)})
            <ChevronDown size={15} />
          </button>

          {/* دکمه‌های پرش سریع بین ۴ هفته ماه */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4].map(w => (
              <button
                key={w}
                onClick={() => { setSelectedWeekIndex(w); setIsMonthlyPrintMode(false); }}
                className="pill-badge"
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  background: selectedWeekIndex === w && !isMonthlyPrintMode ? '#0C1D3F' : 'transparent',
                  color: selectedWeekIndex === w && !isMonthlyPrintMode ? '#E6C287' : '#0C1D3F'
                }}
              >
                هفته {w}
              </button>
            ))}
          </div>

          {/* پاپ‌آپ تقویم شمسی برای انتخاب هر روز/هفته */}
          {showCalendarModal && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '340px',
              background: '#FDFBF7',
              border: '1px solid #0C1D3F',
              borderRadius: '10px',
              padding: '16px',
              zIndex: 999,
              boxShadow: '0 20px 40px rgba(12, 29, 63, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(12, 29, 63, 0.1)' }}>
                <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '13px' }}>تقویم شمسی {selectedYear}</span>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #C5A880', background: '#0C1D3F', color: '#E6C287', fontSize: '12px', fontWeight: 'bold' }}
                >
                  {shamsiMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <p style={{ fontSize: '11px', color: 'rgba(12, 29, 63, 0.6)', margin: '0 0 10px 0' }}>
                روی هر روز کلیک کنید تا کلِ آن هفته برای برنامه‌ریزی باز شود:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#C5A880', marginBottom: '6px' }}>
                {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const weekOfThisDay = Math.min(Math.ceil(dayNum / 7), 4);
                  const isSelectedWeek = weekOfThisDay === selectedWeekIndex;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => handleSelectDayFromShamsiCalendar(dayNum)}
                      style={{
                        padding: '7px 0',
                        borderRadius: '6px',
                        border: isSelectedWeek ? '1px solid #C5A880' : '1px solid rgba(12, 29, 63, 0.1)',
                        background: isSelectedWeek ? '#0C1D3F' : 'transparent',
                        color: isSelectedWeek ? '#E6C287' : '#0C1D3F',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* دکمه‌های عملیاتی هفته جاری */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={copyEntireWeekPlan} className="pill-badge" style={{ padding: '8px 12px', cursor: 'pointer' }}>
            <Copy size={14} /> کپی برنامه هفته
          </button>
          <button onClick={clearCurrentWeekPlan} className="pill-badge" style={{ padding: '8px 12px', cursor: 'pointer' }}>
            <Trash2 size={14} /> پاک کردن هفته
          </button>
          <button onClick={exportSingleWeekPDF} className="pill-badge" style={{ padding: '8px 12px', cursor: 'pointer' }}>
            <Printer size={14} /> PDF این هفته
          </button>
          <button onClick={() => alert(`برنامه هفته ${selectedWeekIndex} ${selectedMonth} در دیتابیس ذخیره شد ✅`)} className="gold-glow-btn" style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> ذخیره و ارسال
          </button>
        </div>
      </div>

      {/* ۲. باکس ویژه خروجی ماهانه (۴ جدول در ۱ فایل PDF با انتخاب ۱۲ ماه سال) */}
      <div className="no-print bento-card" style={{ marginBottom: '20px', background: 'linear-gradient(90deg, rgba(12, 29, 63, 0.04) 0%, rgba(230, 194, 135, 0.12) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <FileText size={20} color="#0C1D3F" />
          <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '13px' }}>
            خروجی جامع ماهانه (هر ۴ جدولِ ماه در یک فایل PDF):
          </span>
          <select
            value={pdfExportMonth}
            onChange={(e) => { setPdfExportMonth(e.target.value); setSelectedMonth(e.target.value); }}
            style={{
              padding: '7px 14px',
              borderRadius: '50px',
              border: '1px solid #0C1D3F',
              background: '#FDFBF7',
              color: '#0C1D3F',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {shamsiMonths.map(m => (
              <option key={m} value={m}>ماه {m} {selectedYear}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsMonthlyPrintMode(!isMonthlyPrintMode)}
            className="pill-badge"
            style={{ padding: '8px 14px', cursor: 'pointer', background: isMonthlyPrintMode ? '#0C1D3F' : 'transparent', color: isMonthlyPrintMode ? '#E6C287' : '#0C1D3F' }}
          >
            {isMonthlyPrintMode ? 'بازگشت به نمای تک‌هفته' : `پیش‌نمایش ۴ جدول ماه ${pdfExportMonth}`}
          </button>
          <button
            onClick={exportMonthlyFourTablesPDF}
            className="gold-glow-btn"
            style={{ padding: '8px 18px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} /> دانلود PDF چهار جدول ماه {pdfExportMonth}
          </button>
        </div>
      </div>

      {/* ۳. ناحیه جدول برنامه‌ریزی (تک‌هفته یا ۴ هفته یکجا برای PDF ماهانه) */}
      <div id="printable-plan-area">
        {isMonthlyPrintMode ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '12px', borderBottom: '2px solid #0C1D3F' }}>
              <h2 style={{ margin: 0, color: '#0C1D3F', fontWeight: '900' }}>پکیج کامل برنامه مطالعاتی ماه {pdfExportMonth} {selectedYear} — {studentName}</h2>
            </div>
            {[1, 2, 3, 4].map(wIdx => renderScheduleTable(pdfExportMonth, wIdx, false))}
          </div>
        ) : (
          renderScheduleTable(selectedMonth, selectedWeekIndex, false)
        )}
      </div>

      {/* دکمه افزودن پارت جدید */}
      <button 
        onClick={addPart} 
        className="no-print" 
        style={{ 
          width: '100%', 
          padding: '12px', 
          background: 'rgba(230, 194, 135, 0.1)', 
          border: '1px dashed #C5A880', 
          borderRadius: '6px', 
          color: '#0C1D3F', 
          fontWeight: '900', 
          fontSize: '13px', 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '25px'
        }}
      >
        <Plus size={18} color="#C5A880" /> افزودن پارت مطالعاتی جدید به جدول
      </button>

    </div>
  );
}

export default AdvisorStudentPlan;