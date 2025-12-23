import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Heart, Lightbulb, HelpCircle, Coffee, Zap, ChevronLeft, ChevronRight, Move, Maximize2 } from 'lucide-react';
import '@google/model-viewer/dist/model-viewer';

// Type declaration for model-viewer
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean;
          'camera-orbit'?: string;
          'camera-target'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'min-field-of-view'?: string;
          'max-field-of-view'?: string;
          'disable-zoom'?: boolean;
          'disable-pan'?: boolean;
          'disable-tap'?: boolean;
          'touch-action'?: string;
          'interaction-prompt'?: string;
          'interaction-prompt-style'?: string;
          autoplay?: boolean;
          loading?: string;
          'shadow-intensity'?: string;
          'exposure'?: string;
          'environment-image'?: string;
          'auto-rotate'?: boolean;
          'auto-rotate-delay'?: string;
          'rotation-per-second'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ZooAssistantWindowProps {
  onClose: () => void;
}

const ZOO_TIPS = [
  { text: "It looks like you're trying to revolutionize AI! Would you like help disrupting the status quo? 🚀", icon: Lightbulb },
  { text: "Did you know? Zoo Labs is building the future of decentralized AI. No VC overlords here! 🦊", icon: Sparkles },
  { text: "Pro tip: The best code is written at 3 AM with questionable amounts of caffeine ☕", icon: Coffee },
  { text: "I see you're on a macOS-inspired site. Bold choice. Thinking different about thinking different! 🍎", icon: Zap },
  { text: "Fun fact: I'm a decentralized assistant. My personality isn't owned by any corporation! 🎉", icon: Heart },
  { text: "Need help? Or just want to chat? I'm literally an AI, I have infinite patience! 💬", icon: HelpCircle },
  { text: "Zoo Labs: Where we take 'move fast and break things' literally. In a good way. Mostly. 🔬", icon: Sparkles },
  { text: "Roses are red, violets are blue, centralized AI is dead, decentralized FTW! 🌹", icon: Heart },
];

const STORAGE_KEY = 'zoo-assistant-position';
const DEFAULT_SIZE = { width: 200, height: 280 };
const MIN_SIZE = { width: 120, height: 160 };
const MAX_SIZE = { width: 400, height: 560 };

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const ZooAssistantWindow: React.FC<ZooAssistantWindowProps> = ({ onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  // Position and size state
  const [position, setPosition] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.position || { x: window.innerWidth - 250, y: window.innerHeight - 400 };
      }
    } catch (e) {}
    return { x: window.innerWidth - 250, y: window.innerHeight - 400 };
  });

  const [size, setSize] = useState<Size>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.size || DEFAULT_SIZE;
      }
    } catch (e) {}
    return DEFAULT_SIZE;
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMetaDragging, setIsMetaDragging] = useState(false); // Cmd+drag for desktop repositioning
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save position and size to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ position, size }));
  }, [position, size]);

  // Cycle through tips (only when bubble is visible)
  useEffect(() => {
    if (!showBubble) return;
    const interval = setInterval(() => {
      goToNextTip();
    }, 8000);
    return () => clearInterval(interval);
  }, [showBubble]);

  const goToNextTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % ZOO_TIPS.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev - 1 + ZOO_TIPS.length) % ZOO_TIPS.length);
      setIsAnimating(false);
    }, 300);
  };

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
  }, [position]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - size.height - 80, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  }, [isDragging, size]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height,
    };
    setIsResizing(true);
  }, [size]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStartRef.current.x;
    const deltaY = clientY - resizeStartRef.current.y;

    const newWidth = Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, resizeStartRef.current.width + deltaX));
    const newHeight = Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, resizeStartRef.current.height + deltaY));

    setSize({ width: newWidth, height: newHeight });
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
  }, []);

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Cmd+drag handler for desktop repositioning
  useEffect(() => {
    if (!isMetaDragging) return;

    const handleMetaDragMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height - 80, dragStartRef.current.posY + deltaY));
      setPosition({ x: newX, y: newY });
    };

    const handleMetaDragEnd = () => {
      setIsMetaDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMetaDragMove);
    window.addEventListener('mouseup', handleMetaDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleMetaDragMove);
      window.removeEventListener('mouseup', handleMetaDragEnd);
    };
  }, [isMetaDragging, size]);

  const CurrentIcon = ZOO_TIPS[currentTip].icon;

  return (
    <div
      ref={containerRef}
      className="fixed z-[15000] select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
      }}
    >
      {/* Speech Bubble - positioned to the left so it doesn't cover giraffe */}
      {showBubble && (
      <div
        className={`absolute right-full mr-3 top-0 w-[220px] sm:w-[260px] transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform -translate-x-2' : 'opacity-100'
        }`}
      >
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xl relative">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
              {ZOO_TIPS[currentTip].text}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <span className="text-[10px] sm:text-xs text-gray-400">Zoo Labs Assistant</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevTip(); }}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-gray-600" />
              </button>
              <div className="flex gap-0.5 sm:gap-1">
                {ZOO_TIPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${
                      i === currentTip ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); goToNextTip(); }}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Speech bubble pointer - pointing right towards giraffe */}
        <div className="absolute top-8 -right-2 w-4 h-4 bg-white transform rotate-45 shadow-lg" />
      </div>
      )}

      {/* The Zoo Animal (3D Giraffe) */}
      <div className="relative">
        {/* Drag handle */}
        <div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm cursor-move flex items-center gap-1 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <Move className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/80">drag</span>
        </div>

        {/* 3D Giraffe */}
        <div
          className="drop-shadow-2xl"
          style={{ width: size.width, height: size.height }}
        >
          <model-viewer
            src="/models/GIRAFFE_ADULT.glb"
            alt="Zoo Giraffe"
            camera-controls={!isMetaDragging}
            camera-orbit="0deg 65deg 12m"
            camera-target="0m 2.8m 0m"
            field-of-view="35deg"
            auto-rotate
            auto-rotate-delay="3000"
            rotation-per-second="15deg"
            touch-action={isMetaDragging ? "none" : "pan-y"}
            interaction-prompt="none"
            shadow-intensity="0"
            autoplay
            loading="eager"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              '--poster-color': 'transparent',
              cursor: isMetaDragging ? 'move' : 'grab',
            } as React.CSSProperties}
            onMouseDown={(e: React.MouseEvent) => {
              if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                setIsMetaDragging(true);
                dragStartRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  posX: position.x,
                  posY: position.y,
                };
              }
            }}
            onClick={() => {
              if (isMetaDragging) return;
              if (!showBubble) {
                setShowBubble(true);
              } else {
                goToNextTip();
              }
            }}
          />
        </div>

        {/* Resize handle */}
        <div
          className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center rounded-tl-lg bg-black/40 backdrop-blur-sm transition-opacity ${isResizing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <Maximize2 className="w-3 h-3 text-white/80 rotate-90" />
        </div>
      </div>

      {/* Click hint */}
      <p className="text-center text-white/40 text-[9px] sm:text-[10px] mt-1 sm:mt-2">
        {isDragging || isMetaDragging ? 'Release to place' : isResizing ? 'Release to resize' : showBubble ? '⌘+drag to move • Drag to rotate' : 'Click me to chat!'}
      </p>
    </div>
  );
};

export default ZooAssistantWindow;
