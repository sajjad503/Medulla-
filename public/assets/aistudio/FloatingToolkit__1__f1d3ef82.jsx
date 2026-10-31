import React, { useState, useRef, useEffect } from 'react';
import { PenTool, X, Edit3, Layers, RotateCcw, Check, Type, MousePointer2 } from 'lucide-react';
import Draggable from 'react-draggable';

function FloatingToolkit() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scratchpad'); 
  const [inputMode, setInputMode] = useState('type'); // 'type' (تایپ) یا 'draw' (قلم)
  const [text, setText] = useState('');
  
  // استیت‌های مربوط به لایتنر
  const [flashcards] = useState([
    { id: 1, front: 'فرمول شتاب مرکزگرا', back: 'a = v² / r' },
    { id: 2, front: 'نقش شبکه آندوپلاسمی زبر', back: 'پروتئین‌سازی (به کمک ریبوزوم‌ها)' },
    { id: 3, front: 'معنی لغت: Loquacious', back: 'پرحرف، وراج' }
  ]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // رفرنس‌های مربوط به بوم نقاشی (Canvas)
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // تنظیمات اولیه بوم نقاشی هنگام باز شدن
  useEffect(() => {
    if (isOpen && activeTab === 'scratchpad' && inputMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      // دو برابر کردن رزولوشن برای جلوگیری از تاری در موبایل و آیپد
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      
      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.lineCap = "round";
      context.strokeStyle = "#e6c287"; // رنگ طلایی سایت
      context.lineWidth = 3;
      contextRef.current = context;
    }
  }, [isOpen, activeTab, inputMode]);

  // شروع رسم (موس یا لمس)
  const startDrawing = (e) => {
    e.preventDefault(); // جلوگیری از اسکرول شدن صفحه در موبایل
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // ادامه رسم
  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  // پایان رسم
  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  // محاسبه مختصات دقیق برای موس و تاچ
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  // پاک کردن بوم نقاشی
  const clearCanvas = () => {
    if (canvasRef.current && contextRef.current) {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
    setText('');
  };

  const nextCard = () => {
    setShowBack(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  return (
    // کامپوننت Draggable کل این بخش را قابل جابجایی می‌کند
    // ویژگی cancel باعث می‌شود وقتی روی بوم نقاشی یا دکمه‌ها دست می‌کشیم، کل پنل جابجا نشود
    <Draggable bounds="parent" cancel=".no-drag, .canvas-area">
      <div style={{ position: 'fixed', bottom: '100px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'move' }}>
        
        {isOpen && (
          <div className="no-drag" style={{
            width: '320px', background: 'var(--bg-panel)', borderRadius: '20px', 
            border: '1px solid var(--gold)', boxShadow: '0 15px 40px rgba(0,0,0,0.4)', 
            overflow: 'hidden', marginBottom: '15px', animation: 'fadeIn 0.2s ease-out',
            cursor: 'default'
          }}>
            <div style={{ display: 'flex', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setActiveTab('scratchpad')}
                style={{ flex: 1, padding: '12px', background: activeTab === 'scratchpad' ? 'var(--primary)' : 'transparent', color: activeTab === 'scratchpad' ? '#fff' : 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <Edit3 size={16} /> چرک‌نویس
              </button>
              <button 
                onClick={() => setActiveTab('leitner')}
                style={{ flex: 1, padding: '12px', background: activeTab === 'leitner' ? 'var(--gold-dark)' : 'transparent', color: activeTab === 'leitner' ? '#000' : 'var(--text-muted)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <Layers size={16} /> جعبه لایتنر
              </button>
            </div>

            <div style={{ padding: '15px', height: '290px', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'scratchpad' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <button onClick={() => setInputMode('type')} style={{ padding: '6px 10px', background: inputMode === 'type' ? 'var(--hover-bg)' : 'transparent', color: inputMode === 'type' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        <Type size={14} /> تایپ
                      </button>
                      <button onClick={() => setInputMode('draw')} style={{ padding: '6px 10px', background: inputMode === 'draw' ? 'var(--hover-bg)' : 'transparent', color: inputMode === 'draw' ? 'var(--primary)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        <MousePointer2 size={14} /> قلم/لمس
                      </button>
                    </div>
                    <button onClick={clearCanvas} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCcw size={14} /> پاک کردن
                    </button>
                  </div>

                  <div style={{ flex: 1, position: 'relative', border: '1px dashed var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-main)' }}>
                    {inputMode === 'type' ? (
                      <textarea 
                        placeholder="محاسبات سریع یا نکات مهم رو اینجا بنویس..."
                        value={text} onChange={(e) => setText(e.target.value)}
                        style={{ width: '100%', height: '100%', padding: '10px', resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.8', fontFamily: 'inherit' }}
                      />
                    ) : (
                      <canvas
                        className="canvas-area"
                        ref={canvasRef}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    کارت {currentCard + 1} از {flashcards.length}
                  </div>
                  <div 
                    onClick={() => setShowBack(!showBack)}
                    style={{ flex: 1, background: showBack ? 'var(--bg-main)' : 'rgba(230,194,135,0.1)', border: '1px dashed var(--gold)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center', cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold', fontSize: '15px' }}
                  >
                    {showBack ? flashcards[currentCard].back : flashcards[currentCard].front}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={nextCard} style={{ flex: 1, padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                      <RotateCcw size={18} /> (نیاز به مرور)
                    </button>
                    <button onClick={nextCard} style={{ flex: 1, padding: '10px', background: 'var(--success)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                      <Check size={18} /> (بلدم)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', background: isOpen ? 'var(--danger)' : 'var(--gold)',
            color: isOpen ? '#fff' : '#000', border: 'none', cursor: 'pointer', display: 'flex',
            justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            transition: 'background 0.2s', alignSelf: 'flex-end'
          }}
        >
          {isOpen ? <X size={26} /> : <PenTool size={26} />}
        </button>

      </div>
    </Draggable>
  );
}

export default FloatingToolkit;
