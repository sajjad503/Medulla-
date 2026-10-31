import React from 'react';

export default function MentoraLogo({ style, className }) {
  return (
    <svg 
      viewBox="0 0 660 550" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    >
      <defs>
        {/* فیلتر سایه برای ایجاد عمق ملایم */}
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(230,194,135,0.25)" />
        </filter>
      </defs>

      <g filter="url(#logo-shadow)">
        {/* بازوی سمت راست (سرمه‌ای) */}
        <polygon points="400,200 430,200 530,400 500,400" fill="#0c1d3f" />
        <polygon points="430,200 460,200 560,400 530,400" fill="#1b3366" />
        
        {/* بازوی سمت چپ (سرمه‌ای) */}
        <polygon points="100,400 130,400 230,200 200,200" fill="#0c1d3f" />
        <polygon points="130,400 160,400 230,260 230,200" fill="#1b3366" />
        
        {/* اتصال میانی بازوها (سرمه‌ای) */}
        <polygon points="230,200 230,260 300,400 330,400" fill="#0c1d3f" />
        <polygon points="230,200 260,200 360,400 330,400" fill="#1b3366" />
        
        {/* بدنه فلش صعودی (طلایی) */}
        <polygon points="300,400 330,400 450,160 426,148" fill="#e6c287" />
        <polygon points="330,400 360,400 474,172 450,160" fill="#c5a880" />
        
        {/* نوک فلش (طلایی) */}
        <polygon points="411,140.5 450,160 485,90" fill="#e6c287" />
        <polygon points="450,160 489,179.5 485,90" fill="#c5a880" />
      </g>
    </svg>
  );
}
