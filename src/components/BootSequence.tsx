import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface BootSequenceProps {
  onComplete: () => void;
  skipDelay?: number;
}

const bootLines = [
  { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', delay: 0, class: 'text-purple-500' },
  { text: '', delay: 100 },
  { text: '  ███████╗ ██████╗ ███████╗', delay: 150, class: 'text-cyan-400' },
  { text: '  ╚══███╔╝██╔═══██╗██╔════╝', delay: 200, class: 'text-cyan-400' },
  { text: '    ███╔╝ ██║   ██║███████╗', delay: 250, class: 'text-cyan-400' },
  { text: '   ███╔╝  ██║   ██║╚════██║', delay: 300, class: 'text-cyan-400' },
  { text: '  ███████╗╚██████╔╝███████║', delay: 350, class: 'text-cyan-400' },
  { text: '  ╚══════╝ ╚═════╝ ╚══════╝  v4.2.0', delay: 400, class: 'text-cyan-400' },
  { text: '', delay: 450 },
  { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', delay: 500, class: 'text-purple-500' },
  { text: '', delay: 550 },
  { text: '[    0.000000] zOS kernel initializing...', delay: 600, class: 'text-gray-500' },
  { text: '[    0.001337] Loading quantum-safe cryptography modules', delay: 750, class: 'text-gray-500' },
  { text: '[    0.002048] Initializing neural interface...', delay: 900, class: 'text-gray-500' },
  { text: '[    0.003141] Mounting /dev/mind', delay: 1050, class: 'text-green-500' },
  { text: '[    0.004096] AI subsystems online', delay: 1200, class: 'text-green-500' },
  { text: '', delay: 1350 },
  { text: ':: Authenticating...', delay: 1400, class: 'text-blue-400' },
  { text: '   User: z@zeekay.ai', delay: 1550, class: 'text-white' },
  { text: '   Access: GRANTED', delay: 1700, class: 'text-green-400' },
  { text: '', delay: 1850 },
  { text: ':: Loading environment...', delay: 1900, class: 'text-blue-400' },
  { text: '   ◦◦◦ ellipsis.sh loaded', delay: 2050, class: 'text-gray-400' },
  { text: '   🥷 hanzo.ai connected', delay: 2200, class: 'text-purple-400' },
  { text: '   ▼ lux.network synced', delay: 2350, class: 'text-amber-400' },
  { text: '   🧬 zoo.ngo online', delay: 2500, class: 'text-green-400' },
  { text: '', delay: 2650 },
  { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓', delay: 2700, class: 'text-purple-500' },
  { text: '', delay: 2750 },
  { text: 'Welcome, Zach. System ready.', delay: 2800, class: 'text-cyan-300 font-bold' },
  { text: '', delay: 3000 },
];

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, skipDelay = 3500 }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Show lines progressively
  useEffect(() => {
    if (visibleLines < bootLines.length) {
      const nextLine = bootLines[visibleLines];
      const delay = visibleLines === 0 ? 100 : nextLine.delay - (bootLines[visibleLines - 1]?.delay || 0);

      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, Math.max(delay, 50));

      return () => clearTimeout(timer);
    } else {
      // Mark as complete when all lines are shown
      setIsComplete(true);
    }
  }, [visibleLines]);

  // Allow click/key to skip - but ONLY proceed when complete or explicitly skipping
  const handleSkip = useCallback(() => {
    if (isComplete || visibleLines >= bootLines.length) {
      setIsExiting(true);
      setTimeout(onComplete, 300);
    }
  }, [onComplete, isComplete, visibleLines]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only allow skip when boot sequence is complete
      if (isComplete) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip, isComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[99999] bg-black flex items-center justify-center transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100',
        isComplete ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={isComplete ? handleSkip : undefined}
    >
      <div className="w-full max-w-2xl px-8 font-mono text-sm">
        <div className="space-y-0">
          {bootLines.slice(0, visibleLines).map((line, index) => (
            <div
              key={index}
              className={cn(
                'whitespace-pre leading-relaxed',
                line.class || 'text-gray-300'
              )}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
          {visibleLines < bootLines.length && (
            <div className="text-gray-300">
              <span className={cn(
                'inline-block w-2 h-4 bg-gray-300 ml-0.5',
                cursorVisible ? 'opacity-100' : 'opacity-0'
              )} />
            </div>
          )}
        </div>

        {isComplete && (
          <div className={cn(
            "mt-8 text-center text-xs transition-all duration-300",
            cursorVisible ? "text-cyan-400 scale-105" : "text-gray-600 scale-100"
          )}>
            ▶ Press any key or click to continue ◀
          </div>
        )}
      </div>
    </div>
  );
};

export default BootSequence;
