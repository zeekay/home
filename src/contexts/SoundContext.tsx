/**
 * SoundContext
 *
 * Provides system-wide sound functionality and visual haptic feedback.
 * Integrates with NotificationContext for notification sounds.
 */

import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { soundManager, SoundType, playSound as playSoundDirect } from '@/lib/sounds';
import { useSystemPreferences } from '@/hooks/useSystemPreferences';

// ============================================================================
// Types
// ============================================================================

interface SoundContextType {
  // Playback
  play: (type: SoundType) => void;
  playAlert: (name?: string) => void;

  // Quick access
  click: () => void;
  menuClick: () => void;
  notification: () => void;
  error: () => void;
  screenshot: () => void;
  startup: () => void;

  // State
  isEnabled: boolean;
  volume: number;
}

interface HapticPulse {
  id: number;
  x: number;
  y: number;
  type: SoundType;
}

// ============================================================================
// Context
// ============================================================================

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// ============================================================================
// Haptic Visual Feedback Component
// ============================================================================

const HapticFeedback: React.FC = () => {
  const [pulses, setPulses] = useState<HapticPulse[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const handleSoundPlayed = (e: CustomEvent<{ type: SoundType; duration: number }>) => {
      // Get mouse position for feedback location
      const mouseX = (window as any).__lastMouseX ?? window.innerWidth / 2;
      const mouseY = (window as any).__lastMouseY ?? window.innerHeight / 2;

      const pulse: HapticPulse = {
        id: nextId,
        x: mouseX,
        y: mouseY,
        type: e.detail.type,
      };

      setPulses(prev => [...prev, pulse]);
      setNextId(prev => prev + 1);

      // Remove pulse after animation
      setTimeout(() => {
        setPulses(prev => prev.filter(p => p.id !== pulse.id));
      }, 300);
    };

    // Track mouse position
    const trackMouse = (e: MouseEvent) => {
      (window as any).__lastMouseX = e.clientX;
      (window as any).__lastMouseY = e.clientY;
    };

    window.addEventListener('zos:sound-played', handleSoundPlayed as EventListener);
    window.addEventListener('mousemove', trackMouse);

    return () => {
      window.removeEventListener('zos:sound-played', handleSoundPlayed as EventListener);
      window.removeEventListener('mousemove', trackMouse);
    };
  }, [nextId]);

  if (pulses.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]" aria-hidden>
      {pulses.map(pulse => (
        <div
          key={pulse.id}
          className="absolute animate-haptic-pulse"
          style={{
            left: pulse.x,
            top: pulse.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
        </div>
      ))}

      <style>{`
        @keyframes haptic-pulse {
          0% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
        .animate-haptic-pulse {
          animation: haptic-pulse 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Provider
// ============================================================================

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { sound } = useSystemPreferences();

  // Sync manager with preferences
  useEffect(() => {
    const effectiveVolume = sound.outputMuted ? 0 : sound.outputVolume;
    soundManager.setVolume(effectiveVolume);
    soundManager.setEnabled(sound.playFeedback);
  }, [sound.outputVolume, sound.outputMuted, sound.playFeedback]);

  // Listen for notification events
  useEffect(() => {
    const handleNotification = () => {
      if (sound.playFeedback && !sound.outputMuted) {
        soundManager.playAlert(sound.alertSound);
      }
    };

    window.addEventListener('zos:notification', handleNotification);
    return () => window.removeEventListener('zos:notification', handleNotification);
  }, [sound.playFeedback, sound.outputMuted, sound.alertSound]);

  // Playback methods
  const shouldPlay = useCallback(() => {
    return sound.playFeedback && !sound.outputMuted;
  }, [sound.playFeedback, sound.outputMuted]);

  const play = useCallback((type: SoundType) => {
    if (!shouldPlay()) return;
    soundManager.play(type);
  }, [shouldPlay]);

  const playAlert = useCallback((name?: string) => {
    if (!shouldPlay()) return;
    soundManager.playAlert(name || sound.alertSound);
  }, [shouldPlay, sound.alertSound]);

  const click = useCallback(() => play('click'), [play]);
  const menuClick = useCallback(() => play('menuClick'), [play]);
  const notification = useCallback(() => playAlert(sound.alertSound), [playAlert, sound.alertSound]);
  const error = useCallback(() => play('error'), [play]);
  const screenshot = useCallback(() => play('screenshot'), [play]);

  const startup = useCallback(() => {
    if (sound.playStartupSound && !sound.outputMuted) {
      soundManager.play('startup');
    }
  }, [sound.playStartupSound, sound.outputMuted]);

  const value: SoundContextType = {
    play,
    playAlert,
    click,
    menuClick,
    notification,
    error,
    screenshot,
    startup,
    isEnabled: sound.playFeedback && !sound.outputMuted,
    volume: sound.outputMuted ? 0 : sound.outputVolume,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
      <HapticFeedback />
    </SoundContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useSound(): SoundContextType {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}

export default SoundContext;
