/**
 * zOS Desktop Settings Hook
 *
 * Extends @hanzo/ui/desktop's useDesktopSettings with zOS-specific
 * settings like customBgUrl, dockMagnificationSize, and fontSize.
 */

import { useState, useEffect, useCallback } from 'react';
import { useDesktopSettings as useBaseDesktopSettings } from '@hanzo/ui/desktop';
import { logger } from '@/lib/logger';
import type { ColorScheme, DockPosition } from '@hanzo/ui/desktop';

// Re-export types
export type { ColorScheme, DockPosition };
export type FontSize = 'small' | 'medium' | 'large';

// Extended storage keys for zOS-specific settings
const ZOS_STORAGE_KEYS = {
  customBgUrl: 'zos-customBgUrl',
  dockMagnificationSize: 'zos-dockMagnificationSize',
  fontSize: 'zos-fontSize',
} as const;

function getStorageValue<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;

    if (typeof defaultValue === 'number') {
      return parseInt(stored, 10) as T;
    }
    return stored as T;
  } catch {
    return defaultValue;
  }
}

function setStorageValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    logger.error(`Failed to save ${key} to localStorage:`, e);
  }
}

export interface ZOSDesktopSettings {
  // From base
  theme: string;
  colorScheme: ColorScheme;
  dockPosition: DockPosition;
  dockSize: number;
  dockMagnification: boolean;
  dockAutoHide: boolean;
  windowTransparency: number;

  // zOS-specific extensions
  customBgUrl: string;
  dockMagnificationSize: number;
  fontSize: FontSize;
}

export interface ZOSDesktopSettingsActions {
  // From base
  setTheme: (theme: string) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setDockPosition: (position: DockPosition) => void;
  setDockSize: (size: number) => void;
  setDockMagnification: (enabled: boolean) => void;
  setDockAutoHide: (enabled: boolean) => void;
  setWindowTransparency: (value: number) => void;
  toggleDarkMode: () => void;

  // zOS-specific extensions
  setCustomBgUrl: (url: string) => void;
  setDockMagnificationSize: (size: number) => void;
  setFontSize: (size: FontSize) => void;
}

export function useZOSDesktopSettings(): ZOSDesktopSettings & ZOSDesktopSettingsActions {
  const base = useBaseDesktopSettings();

  // zOS-specific state
  const [customBgUrl, setCustomBgUrlState] = useState(() =>
    getStorageValue(ZOS_STORAGE_KEYS.customBgUrl, '')
  );
  const [dockMagnificationSize, setDockMagnificationSizeState] = useState(() =>
    getStorageValue(ZOS_STORAGE_KEYS.dockMagnificationSize, 128)
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(() =>
    getStorageValue(ZOS_STORAGE_KEYS.fontSize, 'medium') as FontSize
  );

  // Persist zOS-specific settings
  useEffect(() => {
    setStorageValue(ZOS_STORAGE_KEYS.customBgUrl, customBgUrl);
  }, [customBgUrl]);

  useEffect(() => {
    setStorageValue(ZOS_STORAGE_KEYS.dockMagnificationSize, dockMagnificationSize);
  }, [dockMagnificationSize]);

  useEffect(() => {
    setStorageValue(ZOS_STORAGE_KEYS.fontSize, fontSize);
  }, [fontSize]);

  // Action creators
  const setCustomBgUrl = useCallback((value: string) => {
    setCustomBgUrlState(value);
  }, []);

  const setDockMagnificationSize = useCallback((value: number) => {
    setDockMagnificationSizeState(value);
  }, []);

  const setFontSize = useCallback((value: FontSize) => {
    setFontSizeState(value);
  }, []);

  return {
    // Base settings
    theme: base.theme,
    colorScheme: base.colorScheme,
    dockPosition: base.dockPosition,
    dockSize: base.dockSize,
    dockMagnification: base.dockMagnification,
    dockAutoHide: base.dockAutoHide,
    windowTransparency: base.windowTransparency,

    // zOS extensions
    customBgUrl,
    dockMagnificationSize,
    fontSize,

    // Base actions
    setTheme: base.setTheme,
    setColorScheme: base.setColorScheme,
    setDockPosition: base.setDockPosition,
    setDockSize: base.setDockSize,
    setDockMagnification: base.setDockMagnification,
    setDockAutoHide: base.setDockAutoHide,
    setWindowTransparency: base.setWindowTransparency,
    toggleDarkMode: base.toggleDarkMode,

    // zOS-specific actions
    setCustomBgUrl,
    setDockMagnificationSize,
    setFontSize,
  };
}
