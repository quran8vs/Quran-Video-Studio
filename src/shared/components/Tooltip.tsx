import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Tooltip({ content, children, position = 'bottom', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`
          absolute z-[200] px-2.5 py-1.5 text-[10px] font-bold tracking-wide uppercase text-zinc-200 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150
          ${position === 'top' ? 'bottom-full mb-2' : ''}
          ${position === 'bottom' ? 'top-full mt-2' : ''}
          ${position === 'left' ? 'right-full mr-2' : ''}
          ${position === 'right' ? 'left-full ml-2' : ''}
        `}>
          {content}
          {/* Arrow */}
          <div className={`
            absolute w-2 h-2 bg-[#18181b] border-white/10 rotate-45
            ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b' : ''}
            ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t' : ''}
            ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t' : ''}
            ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b' : ''}
          `}></div>
        </div>
      )}
    </div>
  );
}
