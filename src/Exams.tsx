import React, { useState } from 'react';
import { 
  FileQuestion, FileText, Play, CheckCircle2, 
  CheckSquare, BookOpen, Timer, Save, Award, Download, X,
  Clock, Zap, Check, AlertCircle
} from 'lucide-react';
import ExamCountdownTimer from './ExamCountdownTimer';

export default function Exams() {
  const [examType, setExamType] = useState<'quiz' | 'pdf'>('quiz');
  
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [activePdfExam, setActivePdfExam] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [completedExams, setCompletedExams] = useState<{ quizzes: number[]; pdfs: number[] }>({
    quizzes: [],
    pdfs: []
  });

  const demoQuizzes = [
    { 
      id: 1, 
      title: 'کوییز زیست‌شناسی - فصل ۱ (گوارش و بافت)', 
      questionsCount: 15, 
      time: 15, 
      subject: 'زیست‌شناسی' 
    },
    { 
      id: 2, 
      title: 'کوییز سرعتی زمان‌دار (تست عملکرد تایمر معکوس و ثبت خودکار)', 
      questionsCount: 5, 
      time: 1, 
      subject: 'شیمی و زیست' 
    }
  ];

  const demoPdfExams = [
    { 
      id: 1, 
      title: 'آزمون جامع ماز - مرحله ۳ (شبیه‌ساز کنکور)', 
      questionsCount: 50, 
      time: 150, 
      pdfSize: '4.2 MB' 
    },
    { 
      id: 2, 
      title: 'آزمون شبیه‌ساز سرعتی ۲۰ دقیقه‌ای (ثبت خودکار پاسخبرگ)', 
      questionsCount: 50, 
      time: 2, 
      pdfSize: '1.8 MB' 
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false); 

  const [pdfAnswers, setPdfAnswers] = useState<Record<number, number>>({});
  const [isPdfFinished, setIsPdfFinished] = useState(false); 
  const [pdfStats, setPdfStats] = useState<any>(null); 
  
  const pdfQuestions = Array.from({ length: 50 }, (_, i) => i + 1);
  const quizCorrectOption = 0; 

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setIsQuizFinished(false);
    setQuizAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleStartPdfExam = (exam: any) => {
    setActivePdfExam(exam);
    setIsPdfFinished(false);
    setPdfAnswers({});
    setPdfStats(null);
  };

  const handleQuizOption = (qIndex: number, optIndex: number) => {
    if (!isQuizFinished) {
      setQuizAnswers({ ...quizAnswers, [qIndex]: optIndex });
    }
  };

  const handlePdfOption = (qNum: number, optNum: number) => {
    if (!isPdfFinished) {
      setPdfAnswers({ ...pdfAnswers, [qNum]: optNum });
    }
  };

  const handleFinishQuiz = () => {
    if (isQuizFinished) return;
    setIsQuizFinished(true);
    if (activeQuiz) {
      setCompletedExams(prev => ({ 
        ...prev, 
        quizzes: prev.quizzes.includes(activeQuiz.id) ? prev.quizzes : [...prev.quizzes, activeQuiz.id] 
      }));
    }
    showToast('✅ کوییز با موفقیت ثبت شد و پاسخبرگ نهایی گردید.');
  };

  const handleFinishPdf = () => {
    if (isPdfFinished) return;
    setIsPdfFinished(true);
    let correct = 0, wrong = 0, unanswered = 0;
    
    pdfQuestions.forEach(q => {
      const ans = pdfAnswers[q];
      if (!ans) unanswered++;
      else if (ans === ((q % 4) + 1)) correct++; 
      else wrong++;
    });
    
    const percent = (((correct * 3) - wrong) / (pdfQuestions.length * 3)) * 100;
    setPdfStats({ correct, wrong, unanswered, percent: Math.max(-33.3, percent).toFixed(1) });
    if (activePdfExam) {
      setCompletedExams(prev => ({ 
        ...prev, 
        pdfs: prev.pdfs.includes(activePdfExam.id) ? prev.pdfs : [...prev.pdfs, activePdfExam.id] 
      }));
    }
    showToast('✅ آزمون به پایان رسید! پاسخبرگ قفل و کارنامه آزمون صادر شد.');
  };

  const renderListView = () => (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div className="panel" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileQuestion size={28} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0 }}>مرکز سنجش و آزمون 📝</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>شرکت در کوییزهای تعاملی و آزمون‌های جامع مشاور</span>
            </div>
          </div>
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '6px' }}>
            <button onClick={() => setExamType('quiz')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: examType === 'quiz' ? 'var(--primary)' : 'transparent', color: examType === 'quiz' ? '#fff' : 'var(--text-muted)' }}>کوییزهای تعاملی</button>
            <button onClick={() => setExamType('pdf')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', background: examType === 'pdf' ? 'var(--primary)' : 'transparent', color: examType === 'pdf' ? '#fff' : 'var(--text-muted)' }}>آزمون‌های جامع (PDF)</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {examType === 'quiz' && demoQuizzes.map(quiz => {
          const isDone = completedExams.quizzes.includes(quiz.id);
          return (
            <div key={quiz.id} className="panel" style={{ margin: 0, padding: '20px', border: '1px solid var(--border-color)', opacity: isDone ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ background: 'rgba(230,194,135,0.2)', color: 'var(--gold-dark)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{quiz.subject}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}><CheckSquare size={14} style={{verticalAlign: 'middle'}}/> {quiz.questionsCount} سوال</span>
              </div>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '15px' }}>{quiz.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-main)' }}><Timer size={16} color="var(--primary)" style={{verticalAlign: 'middle'}}/> {quiz.time} دقیقه</div>
                <button 
                  onClick={() => !isDone && handleStartQuiz(quiz)} 
                  disabled={isDone}
                  className="btn btn-primary" 
                  style={{ padding: '8px 15px', fontSize: '13px', background: isDone ? 'var(--text-muted)' : 'var(--primary)', cursor: isDone ? 'not-allowed' : 'pointer' }}
                >
                  {isDone ? 'انجام شده' : <><Play size={14} style={{verticalAlign: 'middle'}}/> شروع کوییز</>}
                </button>
              </div>
            </div>
          );
        })}
        {examType === 'pdf' && demoPdfExams.map(exam => {
          const isDone = completedExams.pdfs.includes(exam.id);
          return (
            <div key={exam.id} className="panel" style={{ margin: 0, padding: '20px', border: '1px solid var(--gold)', background: 'var(--hover-bg)', opacity: isDone ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}><FileText size={12} style={{verticalAlign: 'middle'}}/> آزمون PDF</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>حجم: {exam.pdfSize}</span>
              </div>
              <h3 style={{ fontSize: '16px', color: 'var(--primary)', marginBottom: '15px' }}>{exam.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><Timer size={14} style={{verticalAlign: 'middle'}}/> {exam.time} دقیقه</span>
                  <span><CheckCircle2 size={14} style={{verticalAlign: 'middle'}}/> {exam.questionsCount} سوال</span>
                </div>
                <button 
                  onClick={() => !isDone && handleStartPdfExam(exam)} 
                  disabled={isDone}
                  className="btn btn-gold" 
                  style={{ padding: '8px 15px', fontSize: '13px', background: isDone ? 'var(--text-muted)' : 'var(--gold)', color: isDone ? '#fff' : '#000', cursor: isDone ? 'not-allowed' : 'pointer' }}
                >
                  {isDone ? 'انجام شده' : <><Play size={14} style={{verticalAlign: 'middle'}}/> شروع آزمون</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderQuizView = () => (
    <div className="panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span style={{ fontSize: '18px', display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>{activeQuiz.title}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>سوال {currentQuestionIndex + 1} از {activeQuiz.questionsCount}</span>
        </div>
        <div>
          <ExamCountdownTimer
            totalSeconds={activeQuiz.time * 60}
            isFinished={isQuizFinished}
            onTimeUp={handleFinishQuiz}
            onManualSubmit={handleFinishQuiz}
            examTitle={activeQuiz.title}
            autoSubmitNoticeText="زمان کوییز شما به پایان رسید! تمام پاسخ‌های این کوییز به صورت خودکار ثبت و قفل گردید."
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)', marginBottom: '25px', opacity: isQuizFinished ? 0.9 : 1 }}>
        <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '15px' }}>
          {currentQuestionIndex + 1}. در فرآیند گوارش انسان، کدام آنزیم نقش اصلی را در هضم پروتئین‌های پیچیده در محیط اسیدی ایفا می‌کند؟
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['پپسین (Pepsin)', 'آمیلاز (Amylase)', 'لیپاز (Lipase)', 'تریپسین (Trypsin)'].map((opt, idx) => {
            let bg = 'var(--bg-panel)';
            let border = '1px solid var(--border-color)';
            let color = 'var(--text-main)';

            if (isQuizFinished) {
              if (idx === quizCorrectOption) {
                bg = 'rgba(16, 185, 129, 0.15)'; border = '2px solid #10B981'; color = '#10B981';
              } else if (quizAnswers[currentQuestionIndex] === idx && idx !== quizCorrectOption) {
                bg = 'rgba(239, 68, 68, 0.15)'; border = '2px solid #EF4444'; color = '#EF4444';
              }
            } else {
              if (quizAnswers[currentQuestionIndex] === idx) {
                bg = 'var(--hover-bg)'; border = '2px solid var(--primary)'; color = 'var(--primary)';
              }
            }

            return (
              <div 
                key={idx}
                onClick={() => handleQuizOption(currentQuestionIndex, idx)}
                style={{
                  padding: '12px 15px', borderRadius: '10px',
                  border: border, background: bg, color: color,
                  cursor: isQuizFinished ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s'
                }}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  background: isQuizFinished ? 'transparent' : (quizAnswers[currentQuestionIndex] === idx ? 'var(--primary)' : 'var(--bg-main)'), 
                  color: isQuizFinished ? color : (quizAnswers[currentQuestionIndex] === idx ? '#fff' : 'transparent'),
                  display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold',
                  border: isQuizFinished ? 'none' : '1px solid var(--border-color)'
                }}>
                  {isQuizFinished && idx === quizCorrectOption && <CheckCircle2 size={18} color="#10B981"/>}
                  {isQuizFinished && quizAnswers[currentQuestionIndex] === idx && idx !== quizCorrectOption && <X size={18} color="#EF4444"/>}
                  {!isQuizFinished && quizAnswers[currentQuestionIndex] === idx && <CheckCircle2 size={16} />}
                </div>
                <span style={{ fontSize: '14px', fontWeight: quizAnswers[currentQuestionIndex] === idx ? 'bold' : 'normal' }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isQuizFinished ? (
          <button className="btn" onClick={() => setActiveQuiz(null)} style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '10px 20px', fontWeight: 'bold' }}>
            بازگشت به لیست آزمون‌ها
          </button>
        ) : (
          <span style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 'bold' }}>⚠️ تا پایان آزمون پاسخ‌ها ذخیره خواهد شد.</span>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '10px 20px' }}>
            سوال قبلی
          </button>
          <button className="btn btn-primary" onClick={() => setCurrentQuestionIndex(prev => prev + 1)} style={{ padding: '10px 20px' }}>
            سوال بعدی
          </button>
        </div>
      </div>
    </div>
  );

  const renderPdfView = () => (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="panel" style={{ padding: '15px 25px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', display: 'block' }}>{activePdfExam.title}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isPdfFinished ? 'آزمون پایان یافت. کارنامه شما صادر شد.' : 'سوالات را از فایل خوانده و در پاسخبرگ وارد کنید.'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <ExamCountdownTimer
            totalSeconds={activePdfExam.time * 60}
            isFinished={isPdfFinished}
            onTimeUp={handleFinishPdf}
            onManualSubmit={handleFinishPdf}
            examTitle={activePdfExam.title}
            autoSubmitNoticeText="زمان آزمون جامع به پایان رسید! پاسخبرگ آزمون شما به صورت خودکار ثبت و قفل گردید و کارنامه اولیه صادر شد."
          />
          {isPdfFinished && (
            <button className="btn" onClick={() => setActivePdfExam(null)} style={{ padding: '8px 15px', fontSize: '13px', background: 'var(--primary)', border: 'none', color: '#fff', cursor: 'pointer' }}>
              بازگشت به لیست آزمون‌ها
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {isPdfFinished && pdfStats ? (
          <div className="panel" style={{ flex: '2 1 500px', margin: 0, border: '2px solid var(--gold)', background: 'var(--hover-bg)' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Award size={48} color="var(--gold-dark)" style={{ marginBottom: '15px' }} />
              <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '20px' }}>کارنامه اولیه شما آماده است</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>درصد کل</div>
                  <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{pdfStats.percent}%</div>
                </div>
                <div style={{ background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>تعداد درست</div>
                  <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{pdfStats.correct}</div>
                </div>
                <div style={{ background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>تعداد غلط</div>
                  <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>{pdfStats.wrong}</div>
                </div>
                <div style={{ background: 'var(--bg-panel)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>نزده</div>
                  <div className="mono-num" style={{ fontSize: '24px', fontWeight: 'bold', color: 'gray' }}>{pdfStats.unanswered}</div>
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.8' }}>
                پاسخبرگ شما قفل شد و نتایج برای مشاور ارسال گردید. تحلیل صوتی مشاور در تب «کارنامه‌ها» قرار خواهد گرفت.
              </p>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ flex: '2 1 500px', margin: 0, padding: 0, overflow: 'hidden', height: '70vh', border: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 15px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={16} /> نمایشگر دفترچه سوالات</div>
              <button onClick={() => showToast('دانلود فایل PDF سوالات آزمون آغاز شد...')} className="pill-badge" style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={12} /> دانلود PDF
              </button>
            </div>
            <div style={{ flex: 1, background: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>
              <FileText size={64} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p style={{ fontWeight: 'bold', color: '#0C1D3F' }}>دفترچه آزمون جامع مدولا (ماز مرحله ۳)</p>
              <span style={{ fontSize: '12px', color: 'gray' }}>۵۰ سوال چهارگزینه‌ای دروس اختصاصی کنکور تجربی</span>
            </div>
          </div>
        )}

        <div className="panel" style={{ flex: '1 1 300px', margin: 0, padding: '15px', height: '70vh', overflowY: 'auto', border: '2px solid var(--gold)', background: 'var(--bg-main)', opacity: isPdfFinished ? 0.6 : 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px', textAlign: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px' }}>
            پاسخبرگ آزمون جامع {isPdfFinished ? '(قفل شده)' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pdfQuestions.map(q => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px', width: '25px' }}>{q}-</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4].map(opt => (
                    <button
                      key={opt}
                      disabled={isPdfFinished}
                      onClick={() => handlePdfOption(q, opt)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        border: pdfAnswers[q] === opt ? 'none' : '1px solid var(--border-color)',
                        background: pdfAnswers[q] === opt ? 'var(--primary)' : 'var(--bg-main)',
                        color: pdfAnswers[q] === opt ? '#fff' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isPdfFinished ? 'default' : 'pointer', transition: 'all 0.1s ease',
                      }}
                    >
                      {pdfAnswers[q] === opt && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {!activeQuiz && !activePdfExam && renderListView()}
      {activeQuiz && renderQuizView()}
      {activePdfExam && renderPdfView()}

      {/* اعلان‌های ملایم درون‌برنامه‌ای (جایگزین window.alert) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '1.5px solid var(--gold)',
          fontSize: '13px',
          fontWeight: 'bold',
          zIndex: 99999,
          direction: 'rtl',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
