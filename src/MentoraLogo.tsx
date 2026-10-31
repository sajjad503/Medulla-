import React from 'react';

interface MentoraLogoProps {
  style?: React.CSSProperties;
  className?: string;
  rounded?: boolean;
}

export default function MentoraLogo({ style, className, rounded = true }: MentoraLogoProps) {
  return (
    <div 
      className={`medulla-logo-container ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: rounded ? '50%' : '10px',
        border: '1.5px solid rgba(197, 168, 128, 0.5)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
        background: '#FAF7F2',
        position: 'relative',
        ...style
      }}
      title="مدولا | Medulla"
    >
      <img 
        src="/medulla-logo.jpg" 
        alt="لوگوی مدولا | Medulla"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          transform: 'scale(1.08)'
        }} 
      />
    </div>
  );
}

export { MentoraLogo as MedullaLogo };
