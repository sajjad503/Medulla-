import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TrendingUp, Activity, Sparkles, Award, ArrowUpRight, BarChart2, CheckCircle2 } from 'lucide-react';

export interface ExamRecord {
  id: number | string;
  title: string;
  date: string;
  source: string;
  taraz: number;
  rank: number;
  subjects?: {
    name: string;
    percent: number;
  }[];
}

interface D3ExamTrendChartProps {
  exams: ExamRecord[];
  onSelectExam?: (id: number | string) => void;
  selectedExamId?: number | string;
}

type MetricType = 'taraz' | 'زیست‌شناسی' | 'شیمی' | 'فیزیک' | 'ریاضیات' | 'all_subjects';

export default function D3ExamTrendChart({
  exams,
  onSelectExam,
  selectedExamId
}: D3ExamTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('taraz');
  const [hoveredPoint, setHoveredPoint] = useState<{
    exam: ExamRecord;
    value: number;
    prevDiff: number | null;
    x: number;
    y: number;
    label: string;
  } | null>(null);

  // ResizeObserver for zero-lag responsive SVG without layout thrashing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          // Debounce / limit unnecessary renders
          setContainerWidth(Math.floor(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sort exams chronologically for the trend
  const chronologicalData = useMemo(() => {
    return [...exams].sort((a, b) => Number(a.id) - Number(b.id));
  }, [exams]);

  // Height and margins
  const height = 280;
  const margin = { top: 30, right: 35, bottom: 45, left: 55 };
  const innerWidth = Math.max(containerWidth - margin.left - margin.right, 200);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 120);

  // Stats calculation (memoized for fast speed)
  const stats = useMemo(() => {
    if (chronologicalData.length === 0) return { max: 0, min: 0, avg: 0, growth: 0, latest: 0 };
    
    const getVal = (ex: ExamRecord): number => {
      if (selectedMetric === 'taraz') return ex.taraz;
      const sub = ex.subjects?.find(s => s.name === selectedMetric);
      return sub ? sub.percent : 0;
    };

    const values = chronologicalData.map(getVal);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const first = values[0] || 0;
    const latest = values[values.length - 1] || 0;
    const growth = latest - first;

    return { max, min, avg, growth, latest };
  }, [chronologicalData, selectedMetric]);

  // D3 Scales and Shapes memoized
  const chartData = useMemo(() => {
    if (chronologicalData.length === 0) return null;

    // X Scale: Point scale along categories (exams)
    const xScale = d3.scalePoint<string>()
      .domain(chronologicalData.map(d => String(d.id)))
      .range([0, innerWidth])
      .padding(0.3);

    // Helper to get value
    const getValue = (ex: ExamRecord, metric: MetricType) => {
      if (metric === 'taraz') return ex.taraz;
      const sub = ex.subjects?.find(s => s.name === metric);
      return sub ? sub.percent : 0;
    };

    // Determine Y Domain
    let yDomain: [number, number] = [0, 100];
    if (selectedMetric === 'taraz') {
      const allTaraz = chronologicalData.map(d => d.taraz);
      const minVal = Math.min(...allTaraz);
      const maxVal = Math.max(...allTaraz);
      const padBottom = Math.floor(minVal * 0.92);
      const padTop = Math.ceil(maxVal * 1.05);
      yDomain = [Math.max(4000, padBottom), padTop];
    } else if (selectedMetric === 'all_subjects') {
      yDomain = [0, 100];
    } else {
      const vals = chronologicalData.map(d => getValue(d, selectedMetric));
      const minVal = Math.min(...vals);
      const maxVal = Math.max(...vals);
      yDomain = [Math.max(0, Math.floor(minVal - 10)), Math.min(100, Math.ceil(maxVal + 10))];
    }

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0])
      .nice();

    // D3 Line Generator
    const lineGenerator = d3.line<ExamRecord>()
      .x(d => xScale(String(d.id)) || 0)
      .y(d => yScale(getValue(d, selectedMetric)))
      .curve(d3.curveMonotoneX);

    // D3 Area Generator for smooth gradient under curve
    const areaGenerator = d3.area<ExamRecord>()
      .x(d => xScale(String(d.id)) || 0)
      .y0(innerHeight)
      .y1(d => yScale(getValue(d, selectedMetric)))
      .curve(d3.curveMonotoneX);

    // Generate Path Strings
    const linePath = lineGenerator(chronologicalData) || '';
    const areaPath = areaGenerator(chronologicalData) || '';

    // Multi-subject lines for 'all_subjects' view
    const subjectColors: Record<string, string> = {
      'زیست‌شناسی': '#10b981',
      'شیمی': '#e6c287',
      'فیزیک': '#3b82f6',
      'ریاضیات': '#ec4899',
      'زمین‌شناسی': '#8b5cf6'
    };

    const multiSubjectLines = selectedMetric === 'all_subjects' ? Object.keys(subjectColors).map(subName => {
      const subLineGen = d3.line<ExamRecord>()
        .x(d => xScale(String(d.id)) || 0)
        .y(d => {
          const s = d.subjects?.find(item => item.name === subName);
          return yScale(s ? s.percent : 0);
        })
        .curve(d3.curveMonotoneX);

      return {
        name: subName,
        color: subjectColors[subName],
        path: subLineGen(chronologicalData) || '',
        points: chronologicalData.map(d => {
          const s = d.subjects?.find(item => item.name === subName);
          const val = s ? s.percent : 0;
          return {
            exam: d,
            x: xScale(String(d.id)) || 0,
            y: yScale(val),
            val
          };
        })
      };
    }) : [];

    // Ticks for Y Axis
    const yTicks = yScale.ticks(5);

    // Points for single metric
    const points = chronologicalData.map((d, index) => {
      const val = getValue(d, selectedMetric);
      const prevVal = index > 0 ? getValue(chronologicalData[index - 1], selectedMetric) : null;
      const prevDiff = prevVal !== null ? val - prevVal : null;
      return {
        exam: d,
        x: xScale(String(d.id)) || 0,
        y: yScale(val),
        val,
        prevDiff
      };
    });

    return {
      xScale,
      yScale,
      linePath,
      areaPath,
      points,
      yTicks,
      multiSubjectLines
    };
  }, [chronologicalData, innerWidth, innerHeight, selectedMetric]);

  const metricLabel = selectedMetric === 'taraz' 
    ? 'تراز کل' 
    : selectedMetric === 'all_subjects' 
    ? 'مقایسه تمام دروس' 
    : `درصد ${selectedMetric}`;

  const unit = selectedMetric === 'taraz' ? 'نمره تراز' : '٪';

  return (
    <div className="panel" style={{ border: '1.5px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
      
      {/* هدر ماژول D3 با فیلتر سریع متریک‌ها */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0c1d3f',
            boxShadow: '0 4px 12px rgba(230, 194, 135, 0.3)'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--primary)' }}>
                نمودار هوشمند روند رشد در آزمون‌ها (D3.js)
              </h3>
              <span className="pill-badge" style={{ fontSize: '10px', background: 'rgba(230,194,135,0.15)', color: 'var(--gold-dark)', border: '1px solid rgba(230,194,135,0.3)' }}>
                پردازش آنی بدون افت فریم
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              ترسیم برداری روند تراز و درصدهای کسب‌شده در ۵ آزمون اخیر با محاسبات منحنی سه‌بعدی
            </p>
          </div>
        </div>

        {/* فیلتر متریک با دکمه‌های پرسرعت */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-main)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          gap: '4px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedMetric('taraz')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              background: selectedMetric === 'taraz' ? 'var(--primary)' : 'transparent',
              color: selectedMetric === 'taraz' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            تراز کل
          </button>
          <button
            onClick={() => setSelectedMetric('all_subjects')}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              background: selectedMetric === 'all_subjects' ? 'var(--primary)' : 'transparent',
              color: selectedMetric === 'all_subjects' ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            همه دروس
          </button>
          {(['زیست‌شناسی', 'شیمی', 'فیزیک', 'ریاضیات'] as MetricType[]).map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedMetric(subj)}
              style={{
                padding: '6px 10px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
                background: selectedMetric === subj ? 'var(--gold-dark)' : 'transparent',
                color: selectedMetric === subj ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* نوارهای خلاصه آماری روند رشد (KPI Stats) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'var(--bg-main)',
          padding: '10px 14px',
          borderRadius: '10px',
          borderRight: '3px solid var(--primary)'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>آخرین نمره ({metricLabel})</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
            {stats.latest} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-main)',
          padding: '10px 14px',
          borderRadius: '10px',
          borderRight: '3px solid var(--success)'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>میزان تغییر از آزمون اول</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '900',
            color: stats.growth >= 0 ? 'var(--success)' : 'var(--danger)',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {stats.growth >= 0 ? `+${stats.growth}` : stats.growth}
            <span style={{ fontSize: '11px', fontWeight: 'normal' }}>{unit}</span>
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-main)',
          padding: '10px 14px',
          borderRadius: '10px',
          borderRight: '3px solid var(--gold)'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>بالاترین رکورد کسب‌شده</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--gold-dark)', marginTop: '2px' }}>
            {stats.max} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-main)',
          padding: '10px 14px',
          borderRadius: '10px',
          borderRight: '3px solid #8b5cf6'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>میانگین عملکرد کل آزمون‌ها</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#6d28d9', marginTop: '2px' }}>
            {stats.avg} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--text-muted)' }}>{unit}</span>
          </div>
        </div>
      </div>

      {/* بدنه نمودار D3 رندرشده با SVG خالص و شتاب‌دهی سخت‌افزاری */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          position: 'relative', 
          background: 'var(--bg-main)', 
          borderRadius: '14px', 
          padding: '10px 0',
          border: '1px solid var(--border-color)',
          touchAction: 'manipulation'
        }}
      >
        {chartData && (
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${containerWidth} ${height}`}
            style={{ overflow: 'visible', display: 'block' }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* گرادینت زیر منحنی با D3 */}
              <linearGradient id="d3-area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e6c287" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#0c1d3f" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0c1d3f" stopOpacity="0.0" />
              </linearGradient>

              {/* سایه درخشان خط منحنی */}
              <filter id="d3-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#e6c287" floodOpacity="0.4" />
              </filter>
            </defs>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {/* خطوط راهنمای افقی (Grid Lines) */}
              {chartData.yTicks.map((tick, i) => {
                const yPos = chartData.yScale(tick);
                return (
                  <g key={i}>
                    <line
                      x1={0}
                      x2={innerWidth}
                      y1={yPos}
                      y2={yPos}
                      stroke="var(--border-color)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                    <text
                      x={-12}
                      y={yPos + 4}
                      fill="var(--text-muted)"
                      fontSize="11"
                      textAnchor="end"
                      fontFamily="inherit"
                      fontWeight="600"
                    >
                      {selectedMetric === 'taraz' ? tick : `${tick}٪`}
                    </text>
                  </g>
                );
              })}

              {/* خط افقی میانگین عملکرد (Benchmark Line) */}
              {selectedMetric !== 'all_subjects' && (
                <g>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={chartData.yScale(stats.avg)}
                    y2={chartData.yScale(stats.avg)}
                    stroke="rgba(139, 92, 246, 0.45)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={innerWidth - 6}
                    y={chartData.yScale(stats.avg) - 6}
                    fill="#8b5cf6"
                    fontSize="10"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    میانگین: {stats.avg}
                  </text>
                </g>
              )}

              {/* مساحت پرشده زیر منحنی (D3 Area) */}
              {selectedMetric !== 'all_subjects' && (
                <path
                  d={chartData.areaPath}
                  fill="url(#d3-area-gradient)"
                  pointerEvents="none"
                />
              )}

              {/* خط اصلی منحنی یا خطوط چندگانه (D3 Paths) */}
              {selectedMetric === 'all_subjects' ? (
                chartData.multiSubjectLines.map(line => (
                  <path
                    key={line.name}
                    d={line.path}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))
              ) : (
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#d3-line-glow)"
                />
              )}

              {/* خط راهنمای عمودی هنگام هاور (Crosshair) */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  x2={hoveredPoint.x}
                  y1={0}
                  y2={innerHeight}
                  stroke="var(--gold-dark)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* نقاط داده تکی و نشانگرهای تعاملی */}
              {selectedMetric === 'all_subjects' ? (
                chartData.multiSubjectLines.map(line => 
                  line.points.map((pt, pIdx) => (
                    <circle
                      key={`${line.name}-${pIdx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill={line.color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  ))
                )
              ) : (
                chartData.points.map((pt, index) => {
                  const isSelected = selectedExamId === pt.exam.id;
                  const isHovered = hoveredPoint?.exam.id === pt.exam.id;
                  const isLast = index === chartData.points.length - 1;

                  return (
                    <g 
                      key={pt.exam.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectExam && onSelectExam(pt.exam.id)}
                      onMouseEnter={() => {
                        setHoveredPoint({
                          exam: pt.exam,
                          value: pt.val,
                          prevDiff: pt.prevDiff,
                          x: pt.x,
                          y: pt.y,
                          label: metricLabel
                        });
                      }}
                    >
                      {/* حلقه انیمیشنی برای آخرین آزمون یا آزمون انتخاب شده */}
                      {(isLast || isSelected) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="11"
                          fill="none"
                          stroke={isSelected ? 'var(--primary)' : 'var(--gold)'}
                          strokeWidth="2"
                          opacity="0.6"
                        />
                      )}

                      {/* نقطه اصلی */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 7 : isSelected ? 6.5 : 5}
                        fill={isHovered ? '#fff' : isSelected ? 'var(--primary)' : 'var(--gold-dark)'}
                        stroke={isHovered ? 'var(--gold-dark)' : '#fff'}
                        strokeWidth="2.5"
                        style={{ transition: 'r 0.15s ease' }}
                      />

                      {/* برچسب عدد بالای هر نقطه */}
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        fill="var(--primary)"
                        fontSize="11"
                        fontWeight="800"
                      >
                        {selectedMetric === 'taraz' ? pt.val : `${pt.val}٪`}
                      </text>

                      {/* برچسب محور افقی (نام و تاریخ آزمون) */}
                      <text
                        x={pt.x}
                        y={innerHeight + 20}
                        textAnchor="middle"
                        fill={isSelected ? 'var(--primary)' : 'var(--text-muted)'}
                        fontSize="11"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {pt.exam.title.replace('آزمون', '').trim()}
                      </text>

                      <text
                        x={pt.x}
                        y={innerHeight + 34}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="10"
                        opacity="0.8"
                      >
                        {pt.exam.date}
                      </text>
                    </g>
                  );
                })
              )}
            </g>
          </svg>
        )}

        {/* تول‌تیپ تعاملی با موقعیت هوشمند */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(Math.max(hoveredPoint.x + margin.left - 90, 10), containerWidth - 210)}px`,
              top: `${Math.max(hoveredPoint.y + margin.top - 95, 10)}px`,
              background: '#0c1d3f',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              border: '1px solid var(--gold)',
              pointerEvents: 'none',
              zIndex: 30,
              minWidth: '180px',
              direction: 'rtl',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ fontWeight: 'bold', color: 'var(--gold)', marginBottom: '4px', fontSize: '13px' }}>
              {hoveredPoint.exam.title}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{hoveredPoint.label}:</span>
              <strong style={{ color: '#fff' }}>
                {hoveredPoint.value} {unit}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>رتبه کشوری:</span>
              <span style={{ color: 'var(--gold)' }}>{hoveredPoint.exam.rank}</span>
            </div>
            {hoveredPoint.prevDiff !== null && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '4px',
                marginTop: '4px',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                fontSize: '11px',
                color: hoveredPoint.prevDiff >= 0 ? '#10b981' : '#ef4444',
                fontWeight: 'bold'
              }}>
                <span>نسبت به آزمون قبل:</span>
                <span>{hoveredPoint.prevDiff >= 0 ? `+${hoveredPoint.prevDiff}` : hoveredPoint.prevDiff} {unit}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* راهنمای رنگ‌ها در نمای همه دروس */}
      {selectedMetric === 'all_subjects' && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          marginTop: '12px',
          padding: '8px 12px',
          background: 'var(--bg-main)',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
            زیست‌شناسی
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e6c287' }}></span>
            شیمی
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span>
            فیزیک
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }}></span>
            ریاضیات
          </span>
        </div>
      )}

      {/* پانویس راهنمای تعاملی */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <span>💡 با کلیک روی هر نقطه یا آزمون در نمودار، جزئیات کارنامه و تحلیل مشاور بروز می‌شود.</span>
        <span>منبع داده: کارنامه‌های ثبت‌شده</span>
      </div>

    </div>
  );
}
