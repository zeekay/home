/**
 * useSounds Hook
 *
 * React hook for playing system sounds with respect to System Preferences.
 * Integrates with useSystemPreferences for volume and enabled state.
 */

import { useCallback, useEffect, useRef } from 'react';
import { soundManager, playSound as playSoundDirect, SoundType } from '@/lib/sounds';
import { useSystemPreferences } from './useSystemPreferences';

export interface UseSoundsReturn {
  // Core playback
  play: (type: SoundType) => void;
  playAlert: (name?: string) => void;

  // Convenience methods
  click: () => void;
  menuClick: () => void;
  buttonClick: () => void;
  toggle: () => void;
  notification: () => void;
  error: () => void;
  warning: () => void;
  screenshot: () => void;
  trashEmpty: () => void;
  volumeChange: () => void;
  windowMinimize: () => void;
  windowZoom: () => void;
  windowClose: () => void;
  dockBounce: () => void;
  startup: () => void;

  // State
  isEnabled: boolean;
  volume: number;
}

export function useSounds(): UseSoundsReturn {
  const { sound, accessibility } = useSystemPreferences();
  const lastVolumeRef = useRef(sound.outputVolume);

  // Sync sound manager with preferences
  useEffect(() => {
    const effectiveVolume = sound.outputMuted ? 0 : sound.outputVolume;
    soundManager.setVolume(effectiveVolume);
  }, [sound.outputVolume, sound.outputMuted]);

  // Enable/disable based on preferences
  useEffect(() => {
    soundManager.setEnabled(sound.playFeedback);
  }, [sound.playFeedback]);

  // Check if sounds should play (respects DND, reduce motion, etc.)
  const shouldPlay = useCallback(() => {
    if (!sound.playFeedback) return false;
    if (sound.outputMuted) return false;
    // Could add reduce motion check here if desired
    return true;
  }, [sound.playFeedback, sound.outputMuted]);

  // Play sound with preference checks
  const play = useCallback((type: SoundType) => {
    if (!shouldPlay()) return;
    soundManager.play(type);
  }, [shouldPlay]);

  // Play named alert sound
  const playAlert = useCallback((name?: string) => {
    if (!shouldPlay()) return;
    if (name) {
      soundManager.playAlert(name);
    } else {
      soundManager.playAlert(sound.alertSound);
    }
  }, [shouldPlay, sound.alertSound]);

  // Convenience methods
  const click = useCallback(() => play('click'), [play]);
  const menuClick = useCallback(() => play('menuClick'), [play]);
  const buttonClick = useCallback(() => play('buttonClick'), [play]);
  const toggle = useCallback(() => play('toggle'), [play]);
  const notification = useCallback(() => {
    if (!shouldPlay()) return;
    soundManager.playAlert(sound.alertSound);
  }, [shouldPlay, sound.alertSound]);
  const error = useCallback(() => play('error'), [play]);
  const warning = useCallback(() => play('warning'), [play]);
  const screenshot = useCallback(() => play('screenshot'), [play]);
  const trashEmpty = useCallback(() => play('trashEmpty'), [play]);

  const volumeChange = useCallback(() => {
    // Only play if feedback enabled and volume actually changed
    if (!sound.playFeedback) return;
    if (sound.outputVolume !== lastVolumeRef.current) {
      lastVolumeRef.current = sound.outputVolume;
      soundManager.playVolumeChange();
    }
  }, [sound.playFeedback, sound.outputVolume]);

  const windowMinimize = useCallback(() => play('windowMinimize'), [play]);
  const windowZoom = useCallback(() => play('windowZoom'), [play]);
  const windowClose = useCallback(() => play('windowClose'), [play]);
  const dockBounce = useCallback(() => play('dockBounce'), [play]);

  const startup = useCallback(() => {
    if (!sound.playStartupSound) return;
    soundManager.play('startup');
  }, [sound.playStartupSound]);

  return {
    play,
    playAlert,
    click,
    menuClick,
    buttonClick,
    toggle,
    notification,
    error,
    warning,
    screenshot,
    trashEmpty,
    volumeChange,
    windowMinimize,
    windowZoom,
    windowClose,
    dockBounce,
    startup,
    isEnabled: sound.playFeedback && !sound.outputMuted,
    volume: sound.outputMuted ? 0 : sound.outputVolume,
  };
}

export default useSounds;
