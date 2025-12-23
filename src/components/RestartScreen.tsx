import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RestartScreenProps {
  onComplete: () => void;
  mode?: 'restart' | 'shutdown';
}

const RestartScreen: React.FC<RestartScreenProps> = ({ onComplete, mode = 'restart' }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'shutdown' | 'off' | 'boot'>('shutdown');

  useEffect(() => {
    if (mode === 'shutdown') {
      // Just fade to black and stay there
      const timer = setTimeout(() => {
        setPhase('off');
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Restart sequence
    // Phase 1: Shutdown (fade out, 0-30%)
    // Phase 2: Off (black screen, brief pause)
    // Phase 3: Boot (logo + progress bar, 30-100%)

    const totalDuration = 4000; // 4 seconds total
    const startTime = Date.now();

    const animationFrame = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 30) {
        setPhase('shutdown');
      } else if (newProgress < 35) {
        setPhase('off');
      } else {
        setPhase('boot');
      }

      if (newProgress < 100) {
        requestAnimationFrame(animationFrame);
      } else {
        // Complete - show lock screen
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    requestAnimationFrame(animationFrame);
  }, [mode, onComplete]);

  // Handle click to "wake" from shutdown
  const handleWake = () => {
    if (mode === 'shutdown' && phase === 'off') {
      onComplete();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-all duration-700",
        phase === 'shutdown' ? 'bg-black/80' : 'bg-black',
        mode === 'shutdown' && phase === 'off' && 'cursor-pointer'
      )}
      onClick={handleWake}
    >
      {/* Shutdown state - show nothing */}
      {mode === 'shutdown' && phase === 'off' && (
        <div className="text-white/20 text-sm animate-pulse">
          Click or press any key to wake
        </div>
      )}

      {/* Restart - boot phase with logo and progress */}
      {mode === 'restart' && phase === 'boot' && (
        <div className="flex flex-col items-center gap-8">
          {/* Z Logo */}
          <div className="relative">
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 text-white"
              fill="currentColor"
            >
              <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
            </svg>
            {/* Glow effect */}
            <div className="absolute inset-0 blur-xl opacity-30">
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-24 text-white"
                fill="currentColor"
              >
                <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
              </svg>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${Math.max(0, ((progress - 35) / 65) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Off phase - just black */}
      {phase === 'off' && mode === 'restart' && (
        <div className="w-24 h-24" /> {/* Placeholder to maintain layout */}
      )}
    </div>
  );
};

export default RestartScreen;
