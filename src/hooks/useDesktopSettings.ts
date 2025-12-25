import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

// Debounce helper - batches rapid updates
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

// Storage keys
const STORAGE_KEYS = {
  theme: 'zos-theme',
  customBgUrl: 'zos-customBgUrl',
  colorScheme: 'zos-colorScheme',
  windowTransparency: 'zos-windowTransparency',
  fontSize: 'zos-fontSize',
  dockPosition: 'zos-dockPosition',
  dockSize: 'zos-dockSize',
  dockMagnification: 'zos-dockMagnification',
  dockMagnificationSize: 'zos-dockMagnificationSize',
  dockAutoHide: 'zos-dockAutoHide',
} as const;

// Types
export type ColorScheme = 'dark' | 'light' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
export type DockPosition = 'bottom' | 'left' | 'right';

export interface DesktopSettings {
  // Background settings
  theme: string;
  customBgUrl: string;
  
  // Appearance settings
  colorScheme: ColorScheme;
  windowTransparency: number;
  fontSize: FontSize;
  
  // Dock settings
  dockPosition: DockPosition;
  dockSize: number;
  dockMagnification: boolean;
  dockMagnificationSize: number;
  dockAutoHide: boolean;
}

export interface DesktopSettingsActions {
  // Background actions
  setTheme: (theme: string) => void;
  setCustomBgUrl: (url: string) => void;
  
  // Appearance actions
  setColorScheme: (scheme: ColorScheme) => void;
  toggleDarkMode: () => void;
  setWindowTransparency: (value: number) => void;
  setFontSize: (size: FontSize) => void;
  
  // Dock actions
  setDockPosition: (position: DockPosition) => void;
  setDockSize: (size: number) => void;
  setDockMagnification: (enabled: boolean) => void;
  setDockMagnificationSize: (size: number) => void;
  setDockAutoHide: (enabled: boolean) => void;
}

// Clamp a number between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Helper to safely get from localStorage with type-safe parsing
function getStorageValue<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;

    // Handle different types
    if (typeof defaultValue === 'number') {
      const parsed = parseInt(stored, 10);
      // Return default if NaN
      return (Number.isNaN(parsed) ? defaultValue : parsed) as T;
    }
    if (typeof defaultValue === 'boolean') {
      return (stored === 'true') as T;
    }
    return stored as T;
  } catch {
    return defaultValue;
  }
}

// Helper to safely set to localStorage
function setStorageValue(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    logger.error(`Failed to save ${key} to localStorage:`, e);
  }
}

export function useDesktopSettings(): DesktopSettings & DesktopSettingsActions {
  // Background settings
  const [theme, setThemeState] = useState(() => 
    getStorageValue(STORAGE_KEYS.theme, 'wireframe')
  );
  const [customBgUrl, setCustomBgUrlState] = useState(() => 
    getStorageValue(STORAGE_KEYS.customBgUrl, '')
  );
  
  // Appearance settings
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => 
    getStorageValue(STORAGE_KEYS.colorScheme, 'dark') as ColorScheme
  );
  const [windowTransparency, setWindowTransparencyState] = useState(() => 
    getStorageValue(STORAGE_KEYS.windowTransparency, 20)
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(() => 
    getStorageValue(STORAGE_KEYS.fontSize, 'medium') as FontSize
  );
  
  // Dock settings
  const [dockPosition, setDockPositionState] = useState<DockPosition>(() => 
    getStorageValue(STORAGE_KEYS.dockPosition, 'bottom') as DockPosition
  );
  const [dockSize, setDockSizeState] = useState(() => 
    getStorageValue(STORAGE_KEYS.dockSize, 44)
  );
  const [dockMagnification, setDockMagnificationState] = useState(() => 
    getStorageValue(STORAGE_KEYS.dockMagnification, true)
  );
  const [dockMagnificationSize, setDockMagnificationSizeState] = useState(() => 
    getStorageValue(STORAGE_KEYS.dockMagnificationSize, 88)
  );
  const [dockAutoHide, setDockAutoHideState] = useState(() => 
    getStorageValue(STORAGE_KEYS.dockAutoHide, false)
  );

  // Track previous values to only persist changes
  const prevValuesRef = useRef<Record<string, unknown>>({});
  
  // Create the actual persist function
  const persistSettings = useCallback(() => {
    const currentValues: Record<string, unknown> = {
      [STORAGE_KEYS.theme]: theme,
      [STORAGE_KEYS.customBgUrl]: customBgUrl,
      [STORAGE_KEYS.colorScheme]: colorScheme,
      [STORAGE_KEYS.windowTransparency]: windowTransparency,
      [STORAGE_KEYS.fontSize]: fontSize,
      [STORAGE_KEYS.dockPosition]: dockPosition,
      [STORAGE_KEYS.dockSize]: dockSize,
      [STORAGE_KEYS.dockMagnification]: dockMagnification,
      [STORAGE_KEYS.dockMagnificationSize]: dockMagnificationSize,
      [STORAGE_KEYS.dockAutoHide]: dockAutoHide,
    };
    
    // Only persist values that have changed
    Object.entries(currentValues).forEach(([key, value]) => {
      if (prevValuesRef.current[key] !== value) {
        setStorageValue(key, value);
        prevValuesRef.current[key] = value;
      }
    });
  }, [
    theme,
    customBgUrl,
    colorScheme,
    windowTransparency,
    fontSize,
    dockPosition,
    dockSize,
    dockMagnification,
    dockMagnificationSize,
    dockAutoHide,
  ]);
  
  // Debounced persist - batches rapid changes (e.g., slider dragging)
  const debouncedPersist = useDebouncedCallback(persistSettings, 300);
  
  // Persist settings on change with debouncing
  useEffect(() => {
    // Skip initial mount - values already in localStorage
    if (Object.keys(prevValuesRef.current).length === 0) {
      // Initialize prev values on first render
      prevValuesRef.current = {
        [STORAGE_KEYS.theme]: theme,
        [STORAGE_KEYS.customBgUrl]: customBgUrl,
        [STORAGE_KEYS.colorScheme]: colorScheme,
        [STORAGE_KEYS.windowTransparency]: windowTransparency,
        [STORAGE_KEYS.fontSize]: fontSize,
        [STORAGE_KEYS.dockPosition]: dockPosition,
        [STORAGE_KEYS.dockSize]: dockSize,
        [STORAGE_KEYS.dockMagnification]: dockMagnification,
        [STORAGE_KEYS.dockMagnificationSize]: dockMagnificationSize,
        [STORAGE_KEYS.dockAutoHide]: dockAutoHide,
      };
      return;
    }
    
    debouncedPersist();
  }, [
    theme,
    customBgUrl,
    colorScheme,
    windowTransparency,
    fontSize,
    dockPosition,
    dockSize,
    dockMagnification,
    dockMagnificationSize,
    dockAutoHide,
    debouncedPersist,
  ]);

  // Action creators with persistence
  const setTheme = useCallback((value: string) => {
    setThemeState(value);
  }, []);
  
  const setCustomBgUrl = useCallback((value: string) => {
    setCustomBgUrlState(value);
  }, []);
  
  const setColorScheme = useCallback((value: ColorScheme) => {
    setColorSchemeState(value);
  }, []);
  
  const toggleDarkMode = useCallback(() => {
    setColorSchemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);
  
  const setWindowTransparency = useCallback((value: number) => {
    setWindowTransparencyState(clamp(value, 0, 100));
  }, []);
  
  const setFontSize = useCallback((value: FontSize) => {
    setFontSizeState(value);
  }, []);
  
  const setDockPosition = useCallback((value: DockPosition) => {
    setDockPositionState(value);
  }, []);
  
  const setDockSize = useCallback((value: number) => {
    setDockSizeState(clamp(value, 16, 256));
  }, []);
  
  const setDockMagnification = useCallback((value: boolean) => {
    setDockMagnificationState(value);
  }, []);
  
  const setDockMagnificationSize = useCallback((value: number) => {
    setDockMagnificationSizeState(clamp(value, 64, 512));
  }, []);
  
  const setDockAutoHide = useCallback((value: boolean) => {
    setDockAutoHideState(value);
  }, []);

  return {
    // State
    theme,
    customBgUrl,
    colorScheme,
    windowTransparency,
    fontSize,
    dockPosition,
    dockSize,
    dockMagnification,
    dockMagnificationSize,
    dockAutoHide,
    
    // Actions
    setTheme,
    setCustomBgUrl,
    setColorScheme,
    toggleDarkMode,
    setWindowTransparency,
    setFontSize,
    setDockPosition,
    setDockSize,
    setDockMagnification,
    setDockMagnificationSize,
    setDockAutoHide,
  };
}
