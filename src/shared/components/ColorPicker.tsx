import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Hash, X } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#ffffff', '#e4e4e7', '#a1a1aa', '#52525b', '#27272a', '#18181b', '#000000',
  '#fef08a', '#facc15', '#eab308', '#ca8a04',
  '#ccfbf1', '#2dd4bf', '#10b981', '#059669',
  '#00b140', // Chroma Green
  '#bfdbfe', '#60a5fa', '#3b82f6', '#8b5cf6', '#a855f7',
  '#fca5a5', '#f87171', '#ef4444', '#fb923c'
];

export default function ColorPicker({ color, onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState(color);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputVal(color);
  }, [color]);

  // Handle outside click and scroll to close
  useEffect(() => {
    if (!isOpen) return;

    function handleInteraction(event: Event) {
       // Close on scroll (simplest way to handle floating elements detaching)
       if (event.type === 'scroll') {
           setIsOpen(false);
           return;
       }

       // Close on click outside
       if (
        event instanceof MouseEvent &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleInteraction);
    window.addEventListener("scroll", handleInteraction, true);
    window.addEventListener("resize", () => setIsOpen(false));

    return () => {
        document.removeEventListener("mousedown", handleInteraction);
        window.removeEventListener("scroll", handleInteraction, true);
        window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  const toggleOpen = () => {
      if (!isOpen && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          const popoverWidth = 280;
          const popoverHeight = 320;

          let top = rect.bottom + 8;
          let left = rect.left;

          // Vertical flip
          if (top + popoverHeight > window.innerHeight) {
              top = rect.top - popoverHeight - 8;
          }

          // Horizontal flip/shift for RTL/Right sidebar
          if (left + popoverWidth > window.innerWidth - 20) {
              left = rect.right - popoverWidth;
          }

          // Ensure it's not off-screen to the left either
          if (left < 10) left = 10;

          setPosition({ top, left });
      }
      setIsOpen(!isOpen);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className={`w-8 h-8 rounded-full border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95 ring-2 ring-transparent hover:ring-white/10 focus:outline-none overflow-hidden relative ${className}`}
        style={{ backgroundColor: color }}
        aria-label="Open color picker"
      >
        <div className="absolute inset-0 shadow-[inset_0_0_4px_rgba(0,0,0,0.2)]"></div>
      </button>

      {isOpen && createPortal(
        <div
            ref={popoverRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-[9999] w-[280px] bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-lg border border-white/10 shadow-inner" style={{ backgroundColor: color }} />
                <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-lg px-3 h-9 focus-within:border-studio-accent transition-colors">
                    <Hash className="w-3.5 h-3.5 text-zinc-500 mr-2" />
                    <input
                        type="text"
                        value={inputVal.replace('#', '')}
                        onChange={(e) => handleHexChange({ ...e, target: { ...e.target, value: '#' + e.target.value } })}
                        className="w-full bg-transparent text-sm font-mono text-white outline-none uppercase"
                        maxLength={6}
                    />
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-2 mb-4">
                {PRESET_COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => {
                            onChange(c);
                            setIsOpen(false);
                        }}
                        className={`w-8 h-8 rounded-lg cursor-pointer transition-all hover:scale-110 hover:shadow-lg relative group border border-white/5 ${color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]' : ''}`}
                        style={{ backgroundColor: c }}
                        title={c}
                    >
                         {color.toLowerCase() === c.toLowerCase() && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className={`w-4 h-4 shadow-sm ${['#ffffff', '#e4e4e7', '#fef08a', '#ccfbf1', '#bfdbfe'].includes(c) ? 'text-black' : 'text-white'}`} />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Gradient Spectrum Button */}
             <div className="relative group rounded-lg overflow-hidden h-9 cursor-pointer ring-1 ring-white/10 hover:ring-white/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] group-hover:backdrop-blur-none transition-all">
                     <span className="text-xs font-bold text-white shadow-sm flex items-center gap-2">
                        Custom Spectrum
                     </span>
                </div>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
             </div>
        </div>,
        document.body
      )}
    </>
  );
}
