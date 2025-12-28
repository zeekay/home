import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BootSequenceProps {
  onComplete: () => void;
  skipDelay?: number;
  mode?: 'classic' | 'modern'; // classic = text, modern = Apple-style
}

// Apple-style startup chime using Web Audio API
const playStartupChime = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Create the classic Mac chime (F major chord)
    const frequencies = [349.23, 440, 523.25, 698.46]; // F4, A4, C5, F5
    const duration = 1.2;
    
    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      // Staggered attack for richness
      const startTime = now + (i * 0.02);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15 - (i * 0.02), startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch {
    // Audio not available, fail silently
  }
};

// Boot tips/quotes
const bootTips = [
  "Simplicity is the ultimate sophistication.",
  "The best interface is no interface.",
  "Design is not just what it looks like, design is how it works.",
  "Innovation distinguishes between a leader and a follower.",
  "Stay hungry. Stay foolish.",
  "Think different.",
  "The journey is the reward.",
  "Focus and simplicity.",
  "Details matter, it's worth waiting to get it right.",
  "Technology is nothing. What's important is faith in people.",
];

const getRandomTip = (): string => {
  return bootTips[Math.floor(Math.random() * bootTips.length)];
};

// Classic boot lines (terminal style)
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

// Apple logo SVG component
const AppleLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.2-2.12-9.98-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.27 2.13-9.52 3.24-12.77 3.35-4.93.21-9.84-1.96-14.73-6.52-3.13-2.73-7.05-7.41-11.77-14.04-5.05-7.13-9.2-15.4-12.46-24.84-3.49-10.2-5.24-20.07-5.24-29.62 0-10.94 2.36-20.38 7.09-28.3 3.72-6.36 8.67-11.38 14.87-15.07 6.2-3.69 12.9-5.57 20.12-5.69 3.91 0 9.05 1.21 15.43 3.59 6.36 2.39 10.45 3.6 12.25 3.6 1.35 0 5.92-1.41 13.67-4.24 7.33-2.62 13.52-3.71 18.59-3.28 13.74 1.11 24.06 6.53 30.91 16.31-12.28 7.45-18.36 17.88-18.22 31.26.13 10.43 3.9 19.11 11.28 26.01 3.36 3.19 7.11 5.66 11.28 7.41-.91 2.63-1.86 5.14-2.87 7.55zM119.11 7.24c0 8.18-2.99 15.82-8.94 22.89-7.19 8.4-15.89 13.25-25.32 12.49-.12-.99-.19-2.03-.19-3.12 0-7.85 3.42-16.25 9.49-23.11 3.03-3.47 6.88-6.35 11.55-8.64 4.65-2.26 9.05-3.51 13.18-3.75.12 1.09.18 2.18.18 3.24z"/>
  </svg>
);

// Z Logo for modern boot
const ZLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

const BootSequence: React.FC<BootSequenceProps> = ({ 
  onComplete, 
  mode = 'modern' 
}) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bootTip] = useState(() => getRandomTip());
  const [logoOpacity, setLogoOpacity] = useState(0);
  const chimePlayedRef = useRef(false);

  // Play chime on mount (modern mode)
  useEffect(() => {
    if (mode === 'modern' && !chimePlayedRef.current) {
      chimePlayedRef.current = true;
      // Small delay before chime
      const timer = setTimeout(() => {
        playStartupChime();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Logo fade in (modern mode)
  useEffect(() => {
    if (mode === 'modern') {
      const timer = setTimeout(() => {
        setLogoOpacity(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  // Progress bar animation (modern mode)
  useEffect(() => {
    if (mode === 'modern') {
      const duration = 2500; // 2.5 seconds
      const interval = 16; // ~60fps
      const steps = duration / interval;
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        // Ease-out cubic for natural feel
        const t = step / steps;
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(eased * 100);
        
        if (step >= steps) {
          clearInterval(timer);
          setIsComplete(true);
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [mode]);

  // Cursor blink effect (classic mode)
  useEffect(() => {
    if (mode === 'classic') {
      const cursorInterval = setInterval(() => {
        setCursorVisible(prev => !prev);
      }, 530);
      return () => clearInterval(cursorInterval);
    }
  }, [mode]);

  // Show lines progressively (classic mode)
  useEffect(() => {
    if (mode === 'classic') {
      if (visibleLines < bootLines.length) {
        const nextLine = bootLines[visibleLines];
        const delay = visibleLines === 0 ? 100 : nextLine.delay - (bootLines[visibleLines - 1]?.delay || 0);

        const timer = setTimeout(() => {
          setVisibleLines(prev => prev + 1);
        }, Math.max(delay, 50));

        return () => clearTimeout(timer);
      } else {
        setIsComplete(true);
      }
    }
  }, [visibleLines, mode]);

  // Auto-complete after delay (modern mode)
  useEffect(() => {
    if (mode === 'modern' && isComplete) {
      const timer = setTimeout(() => {
        handleSkip();
      }, 1000); // 1 second after progress completes
      return () => clearTimeout(timer);
    }
  }, [isComplete, mode]);

  // Allow click/key to skip
  const handleSkip = useCallback(() => {
    if (isComplete || (mode === 'classic' && visibleLines >= bootLines.length)) {
      setIsExiting(true);
      setTimeout(onComplete, 500); // Longer fade for smoother transition
    }
  }, [onComplete, isComplete, visibleLines, mode]);

  useEffect(() => {
    const handleKeyDown = (_e: KeyboardEvent) => {
      if (isComplete) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip, isComplete]);

  // Modern Apple-style boot
  if (mode === 'modern') {
    return (
      <div
        className={cn(
          'fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center',
          'transition-opacity duration-500 ease-out',
          isExiting ? 'opacity-0' : 'opacity-100',
          isComplete ? 'cursor-pointer' : 'cursor-default'
        )}
        onClick={isComplete ? handleSkip : undefined}
        role="status"
        aria-label="System starting up"
      >
        {/* Logo with fade-in */}
        <div 
          className="transition-opacity duration-1000 ease-out"
          style={{ opacity: logoOpacity }}
        >
          <ZLogo className="w-20 h-20 text-white/90 mb-8" />
        </div>

        {/* Progress bar container */}
        <div 
          className="w-48 h-1 bg-white/20 rounded-full overflow-hidden transition-opacity duration-500"
          style={{ opacity: logoOpacity }}
        >
          {/* Progress bar fill */}
          <div 
            className="h-full bg-white/80 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Boot tip */}
        <div 
          className={cn(
            "absolute bottom-12 text-center text-white/40 text-sm italic max-w-md px-4",
            "transition-opacity duration-1000 delay-500"
          )}
          style={{ opacity: logoOpacity * 0.8 }}
        >
          "{bootTip}"
        </div>

        {/* Skip hint */}
        {isComplete && (
          <div 
            className={cn(
              "absolute bottom-6 text-center text-xs text-white/30",
              "animate-pulse"
            )}
          >
            Press any key or click to continue
          </div>
        )}
      </div>
    );
  }

  // Classic terminal-style boot
  return (
    <div
      className={cn(
        'fixed inset-0 z-[99999] bg-black flex items-center justify-center',
        'transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100',
        isComplete ? 'cursor-pointer' : 'cursor-default'
      )}
      onClick={isComplete ? handleSkip : undefined}
      role="status"
      aria-label="System booting"
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
            Press any key or click to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default BootSequence;
