import React, { useState, useMemo } from 'react';
import { 
  Award, FileUp, TrendingUp, CheckCircle2, XCircle, 
  MinusCircle, Play, Pause, Volume2, Calendar, 
  ListTodo, CheckSquare, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ReportCard() {
  const [subTab, setSubTab] = useState('exam');
  const [activeSource, setActiveSource] = useState('قلم‌چی'); // فیلتر موسسه آزمون
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(35);
  const [isProcessing, setIsProcessing] = useState(false);

  // دیتای کارنامه‌ها با مشخصه منبع (source) اضافه شده برای فیلتر نمودار
  const [exams, setExams] = useState([
    {
      id: 1,
      title: 'آزمون جامع قلم‌چی',
      source: 'قلم‌چی', // اضافه شده
      date: '۱۸ مهر ۱۴۰۵',
      taraz: 6850,
      rank: 420,
      correct: 72,
      wrong: 14,
      unanswered: 14,
      pdfName: 'Ghalamechi_18Mehr.pdf',
      advisorVoice: 'voice_18mehr.mp3',
      advisorText: 'یاشا عزیز، در درس زیست و شیمی رشد تراز بسیار عالی داشتی (زیست ۷۴٪). نقطه ضعف آزمون، بی‌دقتی‌های محاسباتی ریاضی بود که با ۸ غلط، تراز زیرگروه ۱ رو کشید پایین. حتماً تست‌های مروری ریاضی رو در پارت کلاس‌های شنبه و دوشنبه لحاظ کن.',
      advisorTasks: [
        { id: 1, text: 'تحلیل دقیق ۱۰ سوال غلط شیمی (دفترچه آزمون)', done: true },
        { id: 2, text: 'حل ۵۰ تست زمان‌دار مشتق و کاربرد مشتق از کتاب منبع دوم', done: false },
        { id: 3, text: 'ارسال خلاصه نکات ژنتیک تا دوشنبه ساعت ۲۰', done: false }
      ],
      subjects: [
        { name: 'زیست‌شناسی', percent: 74, correct: 28, wrong: 4, unanswered: 3, status: 'high' },
        { name: 'شیمی', percent: 68, correct: 22, wrong: 3, unanswered: 5, status: 'high' },
        { name: 'فیزیک', percent: 55, correct: 18, wrong: 5, unanswered: 7, status: 'medium' },
        { name: 'ریاضیات', percent: 42, correct: 14, wrong: 8, unanswered: 8, status: 'low' },
        { name: 'زمین‌شناسی', percent: 30, correct: 6, wrong: 2, unanswered: 12, status: 'low' }
      ]
    },
    {
      id: 2,
      title: 'آزمون مرحله‌ای ماز',
      source: 'ماز', // اضافه شده
      date: '۲ آبان ۱۴۰۵',
      taraz: 7120,
      rank: 215,
      correct: 80,
      wrong: 9,
      unanswered: 11,
      pdfName: 'Maze_2Aban.pdf',
      advisorVoice: 'voice_2aban.mp3',
      advisorText: 'فوق‌العاده بود! تعداد غلط‌ها از ۱۴ به ۹ رسید و ترازت از مرز ۷۱۰۰ رد شد. فرمول‌های فرار وایت‌برد شخصی به خوبی جواب داده.',
      advisorTasks: [
        { id: 1, text: 'تثبیت درصد فیزیک با تست‌های مضرب زوج فصل ۳', done: false }
      ],
      subjects: [
        { name: 'زیست‌شناسی', percent: 81, correct: 31, wrong: 2, unanswered: 2, status: 'high' },
        { name: 'شیمی', percent: 72, correct: 24, wrong: 2, unanswered: 4, status: 'high' },
        { name: 'فیزیک', percent: 66, correct: 21, wrong: 3, unanswered: 6, status: 'high' },
        { name: 'ریاضیات', percent: 58, correct: 18, wrong: 4, unanswered: 8, status: 'medium' },
        { name: 'زمین‌شناسی', percent: 45, correct: 9, wrong: 2, unanswered: 9, status: 'medium' }
      ]
    }
  ]);

  const [selectedExamId, setSelectedExamId] = useState(2);
  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  // فیلتر کردن دیتای نمودار فقط بر اساس موسسه انتخابی (تغییر جدید)
  const filteredGraphData = useMemo(() => {
    return exams.filter(item => item.source === activeSource);
  }, [exams, activeSource]);

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    setTimeout(() => {
      const newExam = {
        id: exams.length + 1,
        title: 'آزمون سنجش (جدید)',
        source: 'سنجش',
        date: 'امروز',
        taraz: 7280,
        rank: 180,
        correct: 84,
        wrong: 6,
        unanswered: 10,
        pdfName: file.name,
        advisorVoice: '',
        advisorText: 'کارنامه با موفقیت آپلود شد و در انتظار ثبت تحلیل صوتی توسط مشاور است.',
        advisorTasks: [
          { id: 1, text: 'مشخص کردن سوالات شک‌دار در پاسخبرگ آزمون', done: false }
        ],
        subjects: [
          { name: 'زیست‌شناسی', percent: 86, correct: 33, wrong: 1, unanswered: 1, status: 'high' },
          { name: 'شیمی', percent: 76, correct: 25, wrong: 2, unanswered: 3, status: 'high' },
          { name: 'فیزیک', percent: 70, correct: 22, wrong: 2, unanswered: 6, status: 'high' },
          { name: 'ریاضیات', percent: 64, correct: 20, wrong: 3, unanswered: 7, status: 'high' }
        ]
      };

      setExams([newExam, ...exams]);
      setSelectedExamId(newExam.id);
      setIsProcessing(false);
      alert('کارنامه با موفقیت اسکن شد! درصدها، تراز و مشخصات ذخیره گردید.');
    }, 2000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={28} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '20px', color: 'var(--primary)', margin: 0 }}>میز کارنامه و تحلیل عملکرد 📊</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>استخراج هوشمند درصدها، تراز و بازخورد مستقیم مشاور</span>
            </div>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '6px' }}>
            <button
              onClick={() => setSubTab('exam')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                background: subTab === 'exam' ? 'var(--primary)' : 'transparent',
                color: subTab === 'exam' ? '#fff' : 'var(--text-muted)',
                transition: '0.2s'
              }}
            >
              کارنامه آزمون‌های جامع
            </button>
            <button
              onClick={() => setSubTab('quiz')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                background: subTab === 'quiz' ? 'var(--primary)' : 'transparent',
                color: subTab === 'quiz' ? '#fff' : 'var(--text-muted)',
                transition: '0.2s'
              }}
            >
              کارنامه کوییزها و آزمونک‌ها
            </button>
          </div>

        </div>
      </div>

      {subTab === 'quiz' ? (
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FileText size={48} color="var(--gold-dark)" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>کارنامه آزمونک‌های هفتگی و کوییزها</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
            نتایج پاسخبرگ‌های دیجیتال ۱۰، ۲۰ و ۳۰ سوالی که در طول هفته ثبت می‌کنید در این بخش به عنوان تاریخچه کوییز ذخیره خواهند شد.
          </p>
          <div style={{ display: 'inline-flex', padding: '10px 20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border-color)', color: 'var(--text-main)', fontSize: '13px' }}>
            آخرین کوییز ثبت‌شده: مبحث سینتیک شیمی (درصد: ۸۵٪)
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '25px' }}>
            
            <div className="panel" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px dashed var(--gold-dark)', background: 'var(--bg-main)', textAlign: 'center' }}>
              <FileUp size={38} color="var(--primary)" style={{ marginBottom: '10px' }} />
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--primary)', marginBottom: '6px' }}>
                آپلود فایل PDF کارنامه آزمون
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                کارنامه قلم‌چی، ماز، سنجش یا گاج را بارگذاری کنید تا خودکار تحلیل شود
              </p>
              
              <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '10px 20px', fontSize: '13px' }}>
                {isProcessing ? 'در حال پردازش...' : 'انتخاب فایل PDF کارنامه'}
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handlePdfUpload} 
                  disabled={isProcessing}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            <div className="panel" style={{ margin: 0 }}>
              <div className="panel-header" style={{ marginBottom: '15px', paddingBottom: '10px' }}>
                <span>سابقه آزمون‌های آرشیو شده 🗄️</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {exams.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExamId(ex.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: selectedExamId === ex.id ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                      background: selectedExamId === ex.id ? 'var(--hover-bg)' : 'var(--bg-main)',
                      transition: '0.2s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--primary)' }}>{ex.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <Calendar size={13} /> {ex.date}
                        <span className="pill-badge" style={{ padding: '2px 6px', fontSize: '10px' }}>{ex.source}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '900', color: 'var(--gold-dark)', fontSize: '16px' }}>{ex.taraz}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>رتبه: {ex.rank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="grid-3" style={{ marginBottom: '25px' }}>
            <div className="stat-card" style={{ background: 'var(--bg-panel)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>تراز کل کارنامه</div>
              <div className="stat-value" style={{ color: 'var(--gold-dark)' }}>{currentExam.taraz}</div>
              <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'bold' }}>رتبه کشوری: {currentExam.rank}</span>
            </div>

            <div className="stat-card" style={{ background: 'var(--bg-panel)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>تست‌های درست آزمون</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{currentExam.correct}</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>پاسخ صحیح تثبیت‌شده</span>
            </div>

            <div className="stat-card" style={{ background: 'var(--bg-panel)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>تعداد غلط‌ها و بی‌دقتی‌ها</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{currentExam.wrong}</div>
              <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 'bold' }}>نزده: {currentExam.unanswered} سوال</span>
            </div>
          </div>

          <div className="panel" style={{ border: '2px solid var(--gold)', background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-main) 100%)' }}>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--gold-dark)" /> تحلیل و ارزیابی اختصاصی مشاور
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>اختصاصی برای: {currentExam.title}</span>
            </div>

            <div style={{ 
              background: 'var(--bg-panel)', padding: '16px 20px', borderRadius: '12px', 
              border: '1px solid var(--border-color)', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setIsPlayingVoice(!isPlayingVoice)} 
                className="btn btn-primary"
                style={{ width: '42px', height: '42px', borderRadius: '50%', padding: 0 }}
              >
                {isPlayingVoice ? <Pause size={18} /> : <Play size={18} style={{ marginRight: '-2px' }} />}
              </button>

              <div style={{ flexGrow: 1, minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-main)', marginBottom: '6px', fontWeight: 'bold' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Volume2 size={16} color="var(--gold-dark)" /> ویس ضبط‌شده مشاور</span>
                  <span>۰۲:۴۵ / ۰۵:۱۰</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: voiceProgress + '%', height: '100%', background: 'var(--gold-dark)' }}></div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '25px', background: 'var(--bg-panel)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--primary)', marginBottom: '8px' }}>
                یادداشت تحلیلی مشاور:
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.8', color: 'var(--text-main)', margin: 0 }}>
                {currentExam.advisorText}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--primary)', marginBottom: '12px' }}>
                <ListTodo size={18} color="var(--primary)" /> تکالیف جبرانی برای این آزمون:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentExam.advisorTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-panel)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {task.done ? <CheckSquare size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--warning)" />}
                    <span style={{ fontSize: '13px', color: task.done ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span>جدول درصدهای استخراج‌شده از کارنامه 📑</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', color: 'var(--primary)' }}>نام درس</th>
                    <th style={{ padding: '12px', color: 'var(--primary)' }}>درصد کسب‌شده</th>
                    <th style={{ padding: '12px', color: 'var(--success)' }}>تعداد درست</th>
                    <th style={{ padding: '12px', color: 'var(--danger)' }}>تعداد غلط</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>تعداد نزده</th>
                    <th style={{ padding: '12px', color: 'var(--primary)' }}>وضعیت تسلط</th>
                  </tr>
                </thead>
                <tbody>
                  {currentExam.subjects.map((sub, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{sub.name}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '15px' }}>{sub.percent}٪</td>
                      <td style={{ padding: '12px', color: 'var(--success)' }}>{sub.correct}</td>
                      <td style={{ padding: '12px', color: 'var(--danger)' }}>{sub.wrong}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{sub.unanswered}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: sub.status === 'high' ? 'rgba(16,185,129,0.1)' : sub.status === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: sub.status === 'high' ? 'var(--success)' : sub.status === 'medium' ? 'var(--warning)' : 'var(--danger)'
                        }}>
                          {sub.status === 'high' ? 'عالی و تثبیت' : sub.status === 'medium' ? 'نیازمند مرور' : 'هشدار مبحثی'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* تب‌های تفکیک موسسه آزمون برای نمودار */}
          <div className="panel">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--gold-dark)" /> نمودار صعودی تراز کل در طول زمان
              </span>
              
              <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)', gap: '6px' }}>
                {['قلم‌چی', 'ماز', 'سنجش'].map(source => (
                  <button
                    key={source}
                    onClick={() => setActiveSource(source)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px',
                      background: activeSource === source ? 'var(--gold-dark)' : 'transparent',
                      color: activeSource === source ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s'
                    }}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '220px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-main)', borderRadius: '12px' }}>
              {filteredGraphData.length > 0 ? (
                filteredGraphData.slice().reverse().map((ex) => {
                  const heightPercentage = Math.min(Math.max(((ex.taraz - 5500) / 2500) * 100, 20), 100);

                  return (
                    <div key={ex.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '80px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold-dark)' }}>{ex.taraz}</span>
                      <div style={{
                        width: '38px',
                        height: heightPercentage + '%',
                        background: 'linear-gradient(180deg, var(--gold) 0%, var(--primary) 100%)',
                        borderRadius: '8px 8px 0 0',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        transition: 'height 0.5s ease'
                      }}></div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>{ex.title.replace('آزمون', '')}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  هیچ آزمونی از {activeSource} ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default ReportCard;