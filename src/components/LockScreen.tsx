import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
  userName?: string;
  userAvatar?: string;
}

const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  userName = 'Zach Kelling',
  userAvatar = '/profile-photo.png'
}) => {
  const [password, setPassword] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Accept any password for demo purposes
    if (password.length > 0) {
      setIsUnlocking(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99998] flex flex-col items-center justify-center transition-opacity duration-500",
        isUnlocking ? "opacity-0" : "opacity-100"
      )}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-3xl" />

      {/* Time display */}
      <div className="relative z-10 text-center mb-12">
        <div className="text-8xl font-light text-white/95 tracking-tight">
          {formatTime(currentTime)}
        </div>
        <div className="text-2xl font-light text-white/70 mt-2">
          {formatDate(currentTime)}
        </div>
      </div>

      {/* User profile and login */}
      <div className={cn(
        "relative z-10 flex flex-col items-center",
        isShaking && "animate-shake"
      )}>
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl mb-4">
          <img
            src={userAvatar}
            alt={userName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient with initial
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-3xl font-semibold text-white">Z</span>
          </div>
        </div>

        {/* User name */}
        <div className="text-xl font-medium text-white/90 mb-4">
          {userName}
        </div>

        {/* Password input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className={cn(
                "w-64 px-4 py-2.5 rounded-full text-center text-white placeholder-white/40",
                "bg-white/10 backdrop-blur-sm border border-white/20",
                "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30",
                "transition-all duration-200"
              )}
              autoComplete="off"
            />
            {password.length > 0 && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}
          </div>

          {/* Hint text */}
          <div className="text-xs text-white/40 text-center mt-3">
            Enter any password to unlock
          </div>
        </form>

        {/* Touch ID hint */}
        <div className="flex items-center gap-2 mt-6 text-white/40 text-sm">
          <Lock className="w-4 h-4" />
          <span>Touch ID or Enter Password</span>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LockScreen;
