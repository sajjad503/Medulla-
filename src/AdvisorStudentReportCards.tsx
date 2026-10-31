import React, { useState } from 'react';
import { 
  Award, FileText, CheckCircle, Mic, Send, Download, 
  Layers, FileQuestion, Upload, Volume2, Square, Sparkles, 
  ArrowRight, Image as ImageIcon
} from 'lucide-react';
import { VoicePlayer, VoiceRecorderWidget, showVoiceToast } from './VoiceComponents';

interface AdvisorStudentReportCardsProps {
  studentName?: string;
  studentId?: number;
}

export default function AdvisorStudentReportCards({ studentName = 'یاشا', studentId = 5 }: AdvisorStudentReportCardsProps) {
  const [reportCategory, setReportCategory] = useState<'comprehensive' | 'quiz' | 'uploaded'>('comprehensive');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [recordingItemId, setRecordingItemId] = useState<string | null>(null);

  const [compReports, setCompReports] = useState([
    {
      id: 'comp-1', title: 'آزمون جامع شماره ۱ مدولا (مباحث مهرماه)', date: '۲۱ مهر ۱۴۰۵',
      taraz: 7180, rank: 3, totalScore: 68.4,
      subjects: [
        { name: 'زیست‌شناسی', percent: 78.5, correct: 36, wrong: 4, blank: 5 },
        { name: 'شیمی', percent: 69.2, correct: 25, wrong: 3, blank: 7 },
        { name: 'فیزیک', percent: 64.0, correct: 20, wrong: 2, blank: 8 },
        { name: 'ریاضی', percent: 52.0, correct: 16, wrong: 3, blank: 11 }
      ],
      advisorText: 'در زیست و شیمی عملکردت عالی بود؛ برای ریاضی حتماً تیپ‌بندی توابع رو این هفته در پارت اول صبح قرار می‌دیم.',
      advisorVoiceDuration: '01:45', hasVoice: true
    },
    {
      id: 'comp-2', title: 'آزمون جامع تعیین سطح آغازین مدولا', date: '۷ مهر ۱۴۰۵',
      taraz: 6690, rank: 8, totalScore: 59.0,
      subjects: [
        { name: 'زیست‌شناسی', percent: 66.0, correct: 31, wrong: 6, blank: 8 },
        { name: 'شیمی', percent: 60.5, correct: 22, wrong: 4, blank: 9 }
      ],
      advisorText: '', advisorVoiceDuration: null, hasVoice: false
    }
  ]);

  const [quizReports, setQuizReports] = useState([
    {
      id: 'quiz-1', title: 'کوییز تعاملی زیست دهم (فصل گوارش - ۱۵ سوال)', date: '۱۸ مهر ۱۴۰۵',
      timeSpent: '۱۱ دقیقه از ۱۵ دقیقه', scorePercent: 86.6, correctCount: 13, wrongCount: 2, totalQuestions: 15,
      wrongTopics: ['ساختار بافتی مری', 'جذب لیپیدها در پرز روده'],
      advisorText: 'سرعت عملت توی کوییز زیست فوق‌العاده بود. فقط شکل پرز روده رو دوباره از روی کتاب بررسی کن.',
      advisorVoiceDuration: '00:52', hasVoice: true
    }
  ]);

  const [uploadedReports, setUploadedReports] = useState([
    {
      id: 'up-1', title: 'کارنامه آزمون قلم‌چی — ۲۰ مهر ۱۴۰۵', date: '۲۰ مهر ۱۴۰۵', uploadDate: '۲۰ مهر ۱۴۰۵ - ساعت ۱۶:۳۰',
      fileType: 'PDF / تصویر کارنامه', fileName: 'Ghalamchi_20Mehr_Yasha.pdf', declaredTaraz: 7050,
      studentNote: 'استاد توی این آزمون وقت کم آوردم و ۱۰ تا سوال آخر ریاضی رو اصلاً نرسیدم ببینم.',
      advisorText: 'کارنامه‌ات رو کامل بررسی کردم. تکنیک ضربدر و منها رو برای آزمون بعدی روی دفترچه ریاضی اجرا می‌کنیم.',
      advisorVoiceDuration: '02:15', hasVoice: true
    }
  ]);

  const getActiveList = () => {
    if (reportCategory === 'comprehensive') return compReports;
    if (reportCategory === 'quiz') return quizReports;
    return uploadedReports;
  };

  const activeList = getActiveList();

  const handleCategoryChange = (cat: 'comprehensive' | 'quiz' | 'uploaded') => {
    setReportCategory(cat);
    setSelectedCard(null);
  };

  const updateFeedbackText = (category: string, itemId: string, newText: string) => {
    if (category === 'comprehensive') setCompReports(compReports.map(r => r.id === itemId ? { ...r, advisorText: newText } : r));
    else if (category === 'quiz') setQuizReports(quizReports.map(r => r.id === itemId ? { ...r, advisorText: newText } : r));
    else setUploadedReports(uploadedReports.map(r => r.id === itemId ? { ...r, advisorText: newText } : r));
  };

  const handleSaveRecordedVoice = (category: string, itemId: string, result: any) => {
    const applyVoice = (list: any[]) => list.map(r => r.id === itemId ? { 
      ...r, 
      hasVoice: true, 
      advisorVoiceDuration: result.formattedDuration,
      advisorVoiceUrl: result.audioUrl,
      advisorVoiceDurationSec: result.durationSec
    } : r);
    if (category === 'comprehensive') setCompReports(applyVoice(compReports));
    else if (category === 'quiz') setQuizReports(applyVoice(quizReports));
    else setUploadedReports(applyVoice(uploadedReports));
    setRecordingItemId(null);
  };

  const renderFeedbackBox = (item: any) => {
    const isRecording = recordingItemId === item.id;
    return (
      <div style={{ marginTop: '18px', padding: '16px', borderRadius: '8px', background: 'linear-gradient(90deg, rgba(12, 29, 63, 0.04) 0%, rgba(230, 194, 135, 0.12) 100%)', border: '1px solid rgba(197, 168, 128, 0.45)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#C5A880" /> میز تحلیل و صوت مشاور
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {item.hasVoice && !isRecording && (
              <VoicePlayer
                compact={true}
                audioUrl={item.advisorVoiceUrl}
                durationSec={item.advisorVoiceDurationSec || 55}
                label="ویس تحلیل کارنامه"
                speechText={item.advisorText || "تحلیل کارنامه دانش آموز"}
              />
            )}
            <button onClick={() => showVoiceToast('تکلیف جبرانی جدید برای این آزمون ثبت شد.', 'info')} className="pill-badge" style={{ cursor: 'pointer' }}>
              <CheckCircle size={14} /> تخصیص تکلیف
            </button>
            <button
              onClick={() => setRecordingItemId(isRecording ? null : item.id)}
              className={isRecording ? 'pill-badge' : 'gold-glow-btn'}
              style={{ padding: '7px 14px', borderRadius: '50px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: isRecording ? '#EF4444' : undefined, color: isRecording ? '#FFFFFF' : undefined, borderColor: isRecording ? '#EF4444' : undefined }}
            >
              {isRecording ? <><Square size={14} /> بستن ضبط</> : <><Mic size={14} /> {item.hasVoice ? 'ضبط مجدد ویس' : 'ضبط ویس'}</>}
            </button>
          </div>
        </div>

        {isRecording && (
          <div style={{ marginBottom: '14px' }}>
            <VoiceRecorderWidget
              studentName={studentName}
              title={`ضبط ویس تحلیلی برای ${item.title}`}
              onSendVoice={(result) => handleSaveRecordedVoice(reportCategory, item.id, result)}
              onCancel={() => setRecordingItemId(null)}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <textarea
            value={item.advisorText}
            onChange={(e) => updateFeedbackText(reportCategory, item.id, e.target.value)}
            placeholder={`تحلیل کتبی و نکات مشاوره‌ای خود را بنویسید...`}
            rows={3}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(12, 29, 63, 0.2)', background: '#FDFBF7', color: '#0C1D3F', fontSize: '12px', outline: 'none', resize: 'vertical' }}
          />
          <button onClick={() => showVoiceToast('تحلیل متنی با موفقیت ثبت شد ✅', 'success')} className="btn btn-primary" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> ثبت
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      
      <div className="bento-card" style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={22} color="#C5A880" />
          <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '16px', fontWeight: '900' }}>مرکز کارنامه‌های {studentName}</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => handleCategoryChange('comprehensive')} className="pill-badge" style={{ padding: '9px 16px', cursor: 'pointer', fontSize: '12px', background: reportCategory === 'comprehensive' ? '#0C1D3F' : 'transparent', color: reportCategory === 'comprehensive' ? '#E6C287' : '#0C1D3F' }}>
            <Layers size={14} /> آزمون‌های جامع
          </button>
          <button onClick={() => handleCategoryChange('quiz')} className="pill-badge" style={{ padding: '9px 16px', cursor: 'pointer', fontSize: '12px', background: reportCategory === 'quiz' ? '#0C1D3F' : 'transparent', color: reportCategory === 'quiz' ? '#E6C287' : '#0C1D3F' }}>
            <FileQuestion size={14} /> نتایج کوییزها
          </button>
          <button onClick={() => handleCategoryChange('uploaded')} className="pill-badge" style={{ padding: '9px 16px', cursor: 'pointer', fontSize: '12px', background: reportCategory === 'uploaded' ? '#0C1D3F' : 'transparent', color: reportCategory === 'uploaded' ? '#E6C287' : '#0C1D3F' }}>
            <Upload size={14} /> کارنامه‌های آپلودی دانش‌آموز
          </button>
        </div>
      </div>

      {!selectedCard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease-out' }}>
          {activeList.map((item: any) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedCard(item)} 
              className="bento-card" 
              style={{ cursor: 'pointer', transition: '0.2s', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0C1D3F', color: '#E6C287', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '900', color: '#0C1D3F', fontSize: '15px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'gray', marginTop: '4px' }}>تاریخ: <span className="mono-num">{item.date}</span></div>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                {item.taraz && <div style={{ fontWeight: '900', color: '#C5A880', fontSize: '15px' }}>تراز: <span className="mono-num">{item.taraz}</span></div>}
                {item.scorePercent && <div style={{ fontWeight: '900', color: '#C5A880', fontSize: '15px' }}>نمره: <span className="mono-num">{item.scorePercent}%</span></div>}
                {item.declaredTaraz && <div style={{ fontWeight: '900', color: '#C5A880', fontSize: '15px' }}>تراز ثبت‌شده: <span className="mono-num">{item.declaredTaraz}</span></div>}
              </div>
            </div>
          ))}
          {activeList.length === 0 && <div style={{ padding: '20px', color: 'gray', textAlign: 'center' }}>کارنامه‌ای یافت نشد.</div>}
        </div>
      )}

      {selectedCard && (
        <div className="bento-card" style={{ animation: 'fadeIn 0.3s ease-out', border: '1px solid var(--gold-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px dashed rgba(12,29,63,0.1)', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#0C1D3F', fontSize: '18px', fontWeight: '900' }}>جزئیات {selectedCard.title}</h3>
            <button onClick={() => setSelectedCard(null)} className="pill-badge" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowRight size={14} /> بازگشت به لیست
            </button>
          </div>

          {reportCategory === 'comprehensive' && (
            <div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', background: 'rgba(12,29,63,0.03)', padding: '15px', borderRadius: '10px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'gray' }}>تراز کل</div>
                  <div className="mono-num" style={{ fontSize: '20px', color: '#0C1D3F', fontWeight: 'bold' }}>{selectedCard.taraz}</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(12,29,63,0.03)', padding: '15px', borderRadius: '10px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'gray' }}>رتبه</div>
                  <div className="mono-num" style={{ fontSize: '20px', color: '#0C1D3F', fontWeight: 'bold' }}>#{selectedCard.rank}</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(12,29,63,0.03)', padding: '15px', borderRadius: '10px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'gray' }}>میانگین درصد</div>
                  <div className="mono-num" style={{ fontSize: '20px', color: '#0C1D3F', fontWeight: 'bold' }}>{selectedCard.totalScore}%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                {selectedCard.subjects?.map((sub: any) => (
                  <div key={sub.name} style={{ padding: '10px', border: '1px solid rgba(12, 29, 63, 0.1)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#0C1D3F' }}>
                      <span>{sub.name}</span><span>{sub.percent}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'gray' }}>
                      <span>درست: {sub.correct}</span><span>غلط: {sub.wrong}</span><span>نزده: {sub.blank}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportCategory === 'quiz' && (
            <div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <span className="pill-badge" style={{ background: '#0C1D3F', color: '#E6C287' }}>نمره: {selectedCard.scorePercent}%</span>
                <span className="pill-badge">صحیح: {selectedCard.correctCount} از {selectedCard.totalQuestions}</span>
                <span className="pill-badge">زمان صرف‌شده: {selectedCard.timeSpent}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#0C1D3F', marginBottom: '15px' }}>
                <strong>مباحث نیازمند مرور (سوالات غلط): </strong>
                {selectedCard.wrongTopics?.map((topic: string, i: number) => (
                  <span key={i} className="pill-badge" style={{ margin: '0 5px', fontSize: '11px' }}>{topic}</span>
                ))}
              </div>
            </div>
          )}

          {reportCategory === 'uploaded' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <span className="pill-badge" style={{ borderColor: '#C5A880', fontWeight: 'bold' }}>تراز ثبت‌شده: {selectedCard.declaredTaraz}</span>
                  <div style={{ fontSize: '11px', color: 'gray', marginTop: '8px' }}>فایل آپلودی: {selectedCard.fileName}</div>
                </div>
                <button onClick={() => alert('فایل کارنامه با موفقیت باز شد.')} className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '12px' }}><Download size={14}/> دانلود فایل اصلی</button>
              </div>

              <div style={{ background: '#e2e8f0', height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(12,29,63,0.1)' }}>
                 <ImageIcon size={48} color="gray" style={{ marginBottom: '10px' }} />
                 <p style={{ color: 'gray', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>پیش‌نمایش تصویر/PDF کارنامه</p>
                 <span style={{ fontSize: '11px', color: 'gray' }}>({selectedCard.fileName})</span>
              </div>

              <div style={{ padding: '12px', background: 'rgba(12, 29, 63, 0.03)', borderRight: '3px solid #0C1D3F', borderRadius: '4px', fontSize: '12px', color: '#0C1D3F', marginBottom: '15px' }}>
                <strong>توضیحات دانش‌آموز: </strong> "{selectedCard.studentNote}"
              </div>
            </div>
          )}

          {renderFeedbackBox(selectedCard)}
        </div>
      )}

    </div>
  );
}
