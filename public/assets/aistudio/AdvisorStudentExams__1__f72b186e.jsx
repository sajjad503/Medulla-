import React, { useState, useEffect } from 'react';
import { 
  FileQuestion, Plus, Trash2, Image, Clock, 
  Upload, FileText, Cpu, Play, Award, Check, X, RefreshCw, Download, Users, Share2 
} from 'lucide-react';

function AdvisorStudentExams({ studentName = 'یاشا' }) {
  const [examMode, setExamMode] = useState('quiz');

  const allStudentsList = [
    { id: 1, name: 'یاشا', grade: 'دوازدهم', group: 'VIP' },
    { id: 2, name: 'سارا', grade: 'دوازدهم', group: 'عادی' },
    { id: 3, name: 'مبینا', grade: 'دوازدهم', group: 'عادی' },
    { id: 4, name: 'کیمیا', grade: 'دوازدهم', group: 'عادی' },
    { id: 5, name: 'آریا', grade: 'یازدهم', group: 'عادی' },
    { id: 6, name: 'نغمه', grade: 'یازدهم', group: 'VIP' },
    { id: 7, name: 'سینا', grade: 'دوازدهم', group: 'عادی' },
  ];

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([1]);

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const selectAllStudents = () => {
    if (selectedStudentIds.length === allStudentsList.length) setSelectedStudentIds([1]);
    else setSelectedStudentIds(allStudentsList.map(s => s.id));
  };

  // =========================================================
  // استیت‌های بخش کوییز
  // =========================================================
  const [quizTitle, setQuizTitle] = useState('کوییز تعاملی زیست‌شناسی (فصل گوارش)');
  const [quizTimerMinutes, setQuizTimerMinutes] = useState(15);
  const [isQuizPreviewMode, setIsQuizPreviewMode] = useState(false);
  const [quizPreviewFinished, setQuizPreviewFinished] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(15 * 60);
  const [studentQuizAnswers, setStudentQuizAnswers] = useState({});

  const [quizQuestions, setQuizQuestions] = useState([
    {
      id: 1,
      text: 'کدام گزینه در مورد ساختار بافتی لوله گوارش انسان کاملاً صحیح است؟',
      imageUrl: null,
      options: [
        'لایه زیرمخاط در تمام بخش‌ها دارای غدد ترشح‌کننده موسین است.',
        'بافت پوششی مخاط در مری از نوع سنگفرشی چندلایه است.',
        'ماهیچه‌های حلقوی همیشه بیرونی‌تر از ماهیچه‌های طولی قرار دارند.',
        'صفاق تنها بخش شکمی مری را می‌پوشاند.'
      ],
      correctOption: 1
    },
    {
      id: 2,
      text: 'در شکل مقابل، آنزیم ترشح‌شده از بخش مشخص‌شده کدام پیوند را آبکافت می‌کند؟',
      imageUrl: null,
      options: [
        'پیوند پپتیدی در محیط اسیدی معده',
        'پیوند استری در دوازدهه',
        'پیوند گلیکوزیدی نشاسته در دهان',
        'پیوند فسفودی‌استر در روده باریک'
      ],
      correctOption: 0
    }
  ]);

  // =========================================================
  // استیت‌های بخش PDF
  // =========================================================
  const [compExamRunning, setCompExamRunning] = useState(false);
  const [compExamFinished, setCompExamFinished] = useState(false);
  const [compDurationMinutes, setCompDurationMinutes] = useState(60);
  const [compTimeLeft, setCompTimeLeft] = useState(60 * 60);

  useEffect(() => {
    let timer;
    if (isQuizPreviewMode && !quizPreviewFinished && quizTimeLeft > 0) {
      timer = setInterval(() => setQuizTimeLeft(prev => prev - 1), 1000);
    } else if (isQuizPreviewMode && !quizPreviewFinished && quizTimeLeft === 0) {
      setQuizPreviewFinished(true);
      alert('⏰ زمان کوییز به پایان رسید! آزمون قفل و نتایج محاسبه شد.');
    }
    return () => clearInterval(timer);
  }, [isQuizPreviewMode, quizPreviewFinished, quizTimeLeft]);

  useEffect(() => {
    let timer;
    if (compExamRunning && !compExamFinished && compTimeLeft > 0) {
      timer = setInterval(() => setCompTimeLeft(prev => prev - 1), 1000);
    } else if (compExamRunning && !compExamFinished && compTimeLeft === 0) {
      setCompExamRunning(false);
      setCompExamFinished(true);
      alert('⏰ زمان آزمون جامع به پایان رسید! پاسخبرگ به صورت خودکار بسته و تصحیح شد.');
    }
    return () => clearInterval(timer);
  }, [compExamRunning, compExamFinished, compTimeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const addQuizQuestion = () => {
    if (quizQuestions.length >= 20) return alert('حداکثر تعداد سوالات ۲۰ سوال است.');
    setQuizQuestions([...quizQuestions, { id: Date.now(), text: '', imageUrl: null, options: ['', '', '', ''], correctOption: 0 }]);
  };

  const updateQuizQuestionText = (id, text) => {
    setQuizQuestions(quizQuestions.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateQuizOptionText = (qId, optIdx, val) => {
    setQuizQuestions(quizQuestions.map(q => {
      if (q.id !== qId) return q;
      const updatedOpts = [...q.options];
      updatedOpts[optIdx] = val;
      return { ...q, options: updatedOpts };
    }));
  };

  const setCorrectQuizOption = (qId, optIdx) => {
    setQuizQuestions(quizQuestions.map(q => q.id === qId ? { ...q, correctOption: optIdx } : q));
  };

  const handleQuestionImageUpload = (qId, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setQuizQuestions(quizQuestions.map(q => q.id === qId ? { ...q, imageUrl: url } : q));
  };

  const removeQuizQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id));
  };

  const [compExamTitle, setCompExamTitle] = useState('آزمون جامع شماره ۱ منتورا (پایه دوازدهم)');
  const [questionPdfFile, setQuestionPdfFile] = useState(null); // اضافه شدن استیت برای سوالات
  const [answerKeyPdfFile, setAnswerKeyPdfFile] = useState(null);
  const [isScanningKey, setIsScanningKey] = useState(false);

  const examSubjectsConfig = [
    { name: 'زیست‌شناسی', startQ: 1, endQ: 5 },
    { name: 'شیمی', startQ: 6, endQ: 10 },
    { name: 'ریاضی و فیزیک', startQ: 11, endQ: 15 }
  ];
  const totalCompQuestions = 15;

  const [scannedAnswerKey, setScannedAnswerKey] = useState({
    1: 2, 2: 4, 3: 1, 4: 3, 5: 2, 6: 1, 7: 3, 8: 2, 9: 4, 10: 1, 11: 3, 12: 2, 13: 4, 14: 1, 15: 2
  });

  const [studentBubbleSheet, setStudentBubbleSheet] = useState({
    1: 2, 2: 4, 3: 2, 4: 3, 5: null, 6: 1, 7: 3, 8: 1, 9: 4, 10: 1, 11: 3, 12: null, 13: 4, 14: 2, 15: 2
  });

  const handleUploadAnswerKeyAndScan = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnswerKeyPdfFile(file.name);
    setIsScanningKey(true);
    setTimeout(() => {
      const autoDetectedKey = {};
      for (let i = 1; i <= totalCompQuestions; i++) autoDetectedKey[i] = ((i * 2) % 4) + 1;
      setScannedAnswerKey(autoDetectedKey);
      setIsScanningKey(false);
    }, 1200);
  };

  const calculateSubjectStats = (startQ, endQ) => {
    let correct = 0, wrong = 0, blank = 0;
    const count = endQ - startQ + 1;
    for (let q = startQ; q <= endQ; q++) {
      const studentAns = studentBubbleSheet[q];
      const keyAns = scannedAnswerKey[q];
      if (!studentAns) blank++;
      else if (studentAns === keyAns) correct++;
      else wrong++;
    }
    const rawPercent = (((correct * 3) - wrong) / (count * 3)) * 100;
    return { correct, wrong, blank, finalPercent: Math.max(-33.3, Number(rawPercent.toFixed(1))) };
  };

  const handlePublishToSelectedStudents = () => {
    const selectedNames = allStudentsList
      .filter(s => selectedStudentIds.includes(s.id))
      .map(s => s.name)
      .join('، ');
    const activeTitle = examMode === 'quiz' ? quizTitle : compExamTitle;
    alert(`✅ آزمون «${activeTitle}» با موفقیت برای (${selectedStudentIds.length} دانش‌آموز: ${selectedNames}) فعال و ارسال شد!`);
    setShowAssignModal(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="bento-card" style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileQuestion size={22} color="#C5A880" />
          <div>
            <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>مرکز طراحی و اختصاص آزمون ({studentName})</h3>
            <span style={{ fontSize: '11px', color: 'rgba(12, 29, 63, 0.6)' }}>آزمون را طراحی کنید و با یک کلیک برای شاگردان فعال نمایید</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setExamMode('quiz')} className="pill-badge" style={{ background: examMode === 'quiz' ? '#0C1D3F' : 'transparent', color: examMode === 'quiz' ? '#E6C287' : '#0C1D3F' }}>
            ۱. کوییز تعاملی
          </button>
          <button onClick={() => setExamMode('comprehensive')} className="pill-badge" style={{ background: examMode === 'comprehensive' ? '#0C1D3F' : 'transparent', color: examMode === 'comprehensive' ? '#E6C287' : '#0C1D3F' }}>
            ۲. آزمون جامع (PDF)
          </button>
          <button onClick={() => setShowAssignModal(true)} className="gold-glow-btn" style={{ padding: '9px 18px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} /> فعال‌سازی 다그룹
          </button>
        </div>
      </div>

      {/* ======================= حالت 코이즈 ======================= */}
      {examMode === 'quiz' && (
        <div>
          <div className="bento-card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '900', fontSize: '13px', color: '#0C1D3F' }}>عنوان کوییز:</span>
              <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.25)', background: 'transparent', color: '#0C1D3F', fontSize: '13px', fontWeight: 'bold', width: '250px', outline: 'none' }} />
              <span style={{ fontWeight: '900', fontSize: '13px', color: '#0C1D3F', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={16} color="#C5A880" /> زمان (دقیقه):</span>
              <input type="number" value={quizTimerMinutes} onChange={(e) => { const val = Number(e.target.value) || 1; setQuizTimerMinutes(val); setQuizTimeLeft(val * 60); }} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.25)', width: '70px', textAlign: 'center', fontWeight: '900', color: '#0C1D3F' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setIsQuizPreviewMode(!isQuizPreviewMode); setQuizPreviewFinished(false); setQuizTimeLeft(quizTimerMinutes * 60); setStudentQuizAnswers({}); }} className="pill-badge" style={{ padding: '8px 16px', cursor: 'pointer', background: isQuizPreviewMode ? '#0C1D3F' : 'transparent', color: isQuizPreviewMode ? '#E6C287' : '#0C1D3F' }}>
                <Play size={14} /> {isQuizPreviewMode ? 'بازگشت به حالت طراحی' : 'پیش‌نمایش تعاملی'}
              </button>
            </div>
          </div>

          {isQuizPreviewMode ? (
            <div className="bento-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#0C1D3F', color: '#FDFBF7', borderRadius: '6px', marginBottom: '20px' }}>
                <span style={{ fontWeight: '900', color: '#E6C287', fontSize: '15px' }}>{quizTitle}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span className="mono-num" style={{ fontSize: '18px', color: quizPreviewFinished ? 'gray' : '#E6C287', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={18} /> {formatTimer(quizTimeLeft)}
                  </span>
                  {!quizPreviewFinished && (
                    <button onClick={() => setQuizPreviewFinished(true)} style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      پایان آزمون
                    </button>
                  )}
                </div>
              </div>

              {quizQuestions.map((q, qIdx) => {
                const chosenOpt = studentQuizAnswers[q.id];

                return (
                  <div key={q.id} style={{ padding: '18px', border: '1px solid rgba(12, 29, 63, 0.15)', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '12px' }}>سوال {qIdx + 1}: {q.text}</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {q.options.map((optText, optIdx) => {
                        let bg = '#FDFBF7';
                        let borderCol = 'rgba(12, 29, 63, 0.2)';
                        let textColor = '#0C1D3F';

                        if (quizPreviewFinished) {
                          if (optIdx === q.correctOption) {
                            bg = 'rgba(16, 185, 129, 0.15)'; borderCol = '#10B981'; textColor = '#10B981';
                          } else if (optIdx === chosenOpt) {
                            bg = 'rgba(239, 68, 68, 0.15)'; borderCol = '#EF4444'; textColor = '#EF4444';
                          }
                        } else if (chosenOpt === optIdx) {
                          bg = '#0C1D3F'; borderCol = '#0C1D3F'; textColor = '#E6C287';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (!quizPreviewFinished) setStudentQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                            }}
                            style={{ padding: '10px 14px', borderRadius: '6px', border: `1px solid ${borderCol}`, background: bg, color: textColor, textAlign: 'right', fontWeight: 'bold', fontSize: '12px', cursor: quizPreviewFinished ? 'default' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <span>گزینه {optIdx + 1}: {optText}</span>
                            {quizPreviewFinished && optIdx === q.correctOption && <Check size={16} color="#10B981" />}
                            {quizPreviewFinished && optIdx === chosenOpt && optIdx !== q.correctOption && <X size={16} color="#EF4444" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {quizQuestions.map((q, index) => (
                <div key={q.id} className="bento-card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px' }}>سوال شماره <span className="mono-num" style={{ color: '#0C1D3F' }}>{index + 1}</span></span>
                    <button onClick={() => removeQuizQuestion(q.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(12, 29, 63, 0.45)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                  <textarea value={q.text} onChange={(e) => updateQuizQuestionText(q.id, e.target.value)} placeholder="صورت سوال را اینجا تایپ کنید..." rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.2)', background: 'rgba(12, 29, 63, 0.02)', color: '#0C1D3F', fontSize: '13px', outline: 'none', marginBottom: '12px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctOption === optIdx;
                      return (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', border: isCorrect ? '2px solid #0C1D3F' : '1px solid rgba(12, 29, 63, 0.15)', background: isCorrect ? 'rgba(230, 194, 135, 0.15)' : 'transparent' }}>
                          <button type="button" onClick={() => setCorrectQuizOption(q.id, optIdx)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #0C1D3F', background: isCorrect ? '#0C1D3F' : 'transparent', color: '#E6C287', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            {isCorrect && <Check size={14} />}
                          </button>
                          <input type="text" value={opt} onChange={(e) => updateQuizOptionText(q.id, optIdx, e.target.value)} placeholder={`متن گزینه ${optIdx + 1}...`} style={{ width: '100%', border: 'none', background: 'transparent', color: '#0C1D3F', fontSize: '12px', fontWeight: isCorrect ? '900' : 'normal', outline: 'none' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button onClick={addQuizQuestion} style={{ width: '100%', padding: '14px', background: 'rgba(230, 194, 135, 0.12)', border: '1px dashed #C5A880', borderRadius: '6px', color: '#0C1D3F', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Plus size={18} color="#C5A880" /> افزودن سوال چهارگزینه‌ای جدید</button>
            </div>
          )}
        </div>
      )}

      {/* ======================= حالت PDF ======================= */}
      {examMode === 'comprehensive' && (
        <div>
          {/* پنل تنظیمات اصلی شامل آپلود سوالات و پاسخنامه */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '22px' }}>
            
            {/* بخش آپلود دفترچه سوالات */}
            <div className="bento-card" style={{ background: 'linear-gradient(135deg, rgba(12, 29, 63, 0.05) 0%, transparent 100%)' }}>
              <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#C5A880" /> ۱. آپلود دفترچه سوالات (PDF)
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(12, 29, 63, 0.7)', marginBottom: '12px' }}>
                فایل سوالات را آپلود کنید تا در صفحه آزمون دانش‌آموز نمایش داده شود.
              </p>
              <label className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                <Upload size={16} /> انتخاب فایل سوالات
                <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && setQuestionPdfFile(e.target.files[0].name)} style={{ display: 'none' }} />
              </label>
              {questionPdfFile && (
                <div style={{ marginTop: '10px', fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                  ✅ فایل آماده است: {questionPdfFile}
                </div>
              )}
            </div>

            {/* بخش تنظیمات و پاسخنامه */}
            <div className="bento-card" style={{ background: 'linear-gradient(135deg, rgba(230, 194, 135, 0.1) 0%, #FDFBF7 100%)' }}>
              <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="#C5A880" /> ۲. تنظیمات و اسکنر پاسخنامه
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input type="text" value={compExamTitle} onChange={(e) => setCompExamTitle(e.target.value)} placeholder="عنوان آزمون..." style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.2)', fontSize: '12px', fontWeight: 'bold', color: '#0C1D3F', outline: 'none' }} />
                <input type="number" value={compDurationMinutes} onChange={(e) => { const mins = Number(e.target.value) || 10; setCompDurationMinutes(mins); setCompTimeLeft(mins * 60); }} placeholder="زمان (دقیقه)" style={{ width: '80px', padding: '8px', textAlign: 'center', borderRadius: '6px', border: '1px solid #0C1D3F', fontWeight: '900', outline: 'none' }} />
              </div>

              <label className="gold-glow-btn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', cursor: 'pointer' }}>
                <Upload size={16} /> آپلود پاسخنامه و اسکن خودکار کلید
                <input type="file" accept=".pdf,image/*" onChange={handleUploadAnswerKeyAndScan} style={{ display: 'none' }} />
              </label>

              {isScanningKey ? (
                <div style={{ padding: '10px', background: '#0C1D3F', color: '#E6C287', borderRadius: '6px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                  در حال اسکن نوری پاسخنامه...
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#0C1D3F', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>وضعیت کلید: <strong>{answerKeyPdfFile ? `اسکن شده از ${answerKeyPdfFile}` : 'کلید پیش‌فرض فعال'}</strong></span>
                  <span className="pill-badge">۱۵ سوال اسکن شد ✅</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
            <div className="bento-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0C1D3F', color: '#FDFBF7', borderRadius: '6px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontWeight: '900', color: '#E6C287', fontSize: '14px' }}>پاسخبرگ الکترونیکی و تایمر</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="mono-num" style={{ fontSize: '18px', color: '#E6C287' }}>{formatTimer(compTimeLeft)}</span>
                  {!compExamFinished ? (
                    <button onClick={() => { setCompExamRunning(false); setCompExamFinished(true); }} className="pill-badge" style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '6px 14px', cursor: 'pointer' }}>
                      پایان آزمون و تصحیح
                    </button>
                  ) : (
                    <button onClick={() => { setCompExamFinished(false); setCompTimeLeft(compDurationMinutes * 60); }} className="pill-badge" style={{ color: '#FDFBF7', borderColor: '#E6C287', padding: '6px 12px', cursor: 'pointer' }}>
                      <RefreshCw size={13} /> بازگشایی
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                {Array.from({ length: totalCompQuestions }).map((_, i) => {
                  const qNum = i + 1;
                  const studentChoice = studentBubbleSheet[qNum];
                  const keyChoice = scannedAnswerKey[qNum];

                  return (
                    <div key={qNum} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '900', fontSize: '12px', color: '#0C1D3F' }}>سوال {qNum}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4].map(opt => {
                          const isSelected = studentChoice === opt;
                          
                          let bg = 'transparent';
                          let col = '#0C1D3F';
                          
                          if (compExamFinished) {
                            if (keyChoice === opt) { bg = '#10B981'; col = '#fff'; }
                            else if (isSelected) { bg = '#EF4444'; col = '#fff'; }
                          } else if (isSelected) {
                            bg = '#0C1D3F'; col = '#E6C287';
                          }

                          return (
                            <button
                              key={opt}
                              disabled={compExamFinished}
                              onClick={() => setStudentBubbleSheet(prev => ({ ...prev, [qNum]: opt }))}
                              style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid rgba(12, 29, 63, 0.35)', background: bg, color: col, fontSize: '11px', fontWeight: 'bold', cursor: compExamFinished ? 'default' : 'pointer', padding: 0 }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* کارنامه (فقط بعد از اتمام آزمون پر می‌شود) */}
            <div className="bento-card" style={{ opacity: compExamFinished ? 1 : 0.4 }}>
              <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#C5A880" /> کارنامه و درصد هر درس
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {examSubjectsConfig.map(sub => {
                  const stats = compExamFinished ? calculateSubjectStats(sub.startQ, sub.endQ) : { finalPercent: '-', correct: '-', wrong: '-', blank: '-' };
                  return (
                    <div key={sub.name} style={{ padding: '14px', border: '1px solid rgba(12, 29, 63, 0.15)', borderRadius: '8px', background: compExamFinished ? '#fff' : 'rgba(12,29,63,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '14px' }}>{sub.name}</span>
                        <span className="mono-num" style={{ fontSize: '18px', color: '#0C1D3F' }}>{stats.finalPercent}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#10B981', fontWeight: 'bold' }}>✅ درست: {stats.correct}</span>
                        <span style={{ color: '#EF4444', fontWeight: 'bold' }}>❌ غلط: {stats.wrong}</span>
                        <span style={{ color: 'rgba(12, 29, 63, 0.6)', fontWeight: 'bold' }}>⚪ نزده: {stats.blank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12, 29, 63, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
          <div className="bento-card" style={{ width: '92%', maxWidth: '520px', padding: '25px', border: '1px solid #C5A880' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', marginBottom: '15px', borderBottom: '1px solid rgba(12, 29, 63, 0.12)' }}>
              <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>انتخاب دانش‌آموزان</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <button onClick={selectAllStudents} className="pill-badge" style={{ cursor: 'pointer', marginBottom: '15px' }}>
              {selectedStudentIds.length === allStudentsList.length ? 'لغو انتخاب همه' : 'انتخاب همه شاگردان'}
            </button>
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {allStudentsList.map(stu => {
                const isChecked = selectedStudentIds.includes(stu.id);
                return (
                  <div key={stu.id} onClick={() => toggleStudentSelection(stu.id)} style={{ padding: '10px 14px', borderRadius: '8px', border: isChecked ? '1px solid #0C1D3F' : '1px solid rgba(12, 29, 63, 0.12)', background: isChecked ? 'rgba(230, 194, 135, 0.16)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: '1px solid #0C1D3F', background: isChecked ? '#0C1D3F' : 'transparent', color: '#E6C287', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {isChecked && <Check size={14} />}
                      </div>
                      <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '13px' }}>{stu.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { alert('آزمون برای شاگردان ارسال شد!'); setShowAssignModal(false); }} className="gold-glow-btn" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>تایید و فعال‌سازی</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvisorStudentExams;
