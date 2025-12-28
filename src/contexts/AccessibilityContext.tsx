import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Accessibility settings interface
export interface AccessibilitySettings {
  // Zoom
  zoomLevel: number; // 1.0 = 100%, 0.5 = 50%, 2.0 = 200%
  
  // Visual
  highContrast: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  
  // Text
  textSize: 'small' | 'medium' | 'large' | 'xlarge';
  
  // VoiceOver simulation (basic aria support)
  voiceOverEnabled: boolean;
  
  // Color filters
  colorFilter: 'none' | 'grayscale' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface AccessibilityContextType extends AccessibilitySettings {
  // Zoom controls
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoomLevel: (level: number) => void;
  
  // Toggle functions
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  toggleReduceTransparency: () => void;
  toggleVoiceOver: () => void;
  
  // Setters
  setTextSize: (size: AccessibilitySettings['textSize']) => void;
  setColorFilter: (filter: AccessibilitySettings['colorFilter']) => void;
  
  // Reset all
  resetAll: () => void;
}

const STORAGE_KEY = 'zos-accessibility';

const defaultSettings: AccessibilitySettings = {
  zoomLevel: 1.0,
  highContrast: false,
  reduceMotion: false,
  reduceTransparency: false,
  textSize: 'medium',
  voiceOverEnabled: false,
  colorFilter: 'none',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Text size to CSS scale mapping
const textSizeScale: Record<AccessibilitySettings['textSize'], number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xlarge: 1.25,
};

// Color filter CSS values
const colorFilterCSS: Record<AccessibilitySettings['colorFilter'], string> = {
  none: 'none',
  grayscale: 'grayscale(100%)',
  protanopia: 'url("#protanopia")',
  deuteranopia: 'url("#deuteranopia")',
  tritanopia: 'url("#tritanopia")',
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors
    }
    return defaultSettings;
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply zoom level to document
  useEffect(() => {
    document.documentElement.style.setProperty('--zos-zoom', settings.zoomLevel.toString());
    document.documentElement.style.transform = `scale(${settings.zoomLevel})`;
    document.documentElement.style.transformOrigin = 'top left';
    document.documentElement.style.width = `${100 / settings.zoomLevel}%`;
    document.documentElement.style.height = `${100 / settings.zoomLevel}%`;
  }, [settings.zoomLevel]);

  // Apply high contrast mode
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  }, [settings.highContrast]);

  // Apply reduce motion preference
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    // Also set CSS custom property for conditional animations
    document.documentElement.style.setProperty(
      '--zos-motion-duration',
      settings.reduceMotion ? '0.01ms' : '1'
    );
  }, [settings.reduceMotion]);

  // Apply reduce transparency
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-transparency', settings.reduceTransparency);
  }, [settings.reduceTransparency]);

  // Apply text size
  useEffect(() => {
    const scale = textSizeScale[settings.textSize];
    document.documentElement.style.setProperty('--zos-text-scale', scale.toString());
    document.documentElement.style.fontSize = `${scale * 16}px`;
  }, [settings.textSize]);

  // Apply color filter
  useEffect(() => {
    const filter = colorFilterCSS[settings.colorFilter];
    document.documentElement.style.filter = filter;
  }, [settings.colorFilter]);

  // Apply VoiceOver mode (adds focus indicators)
  useEffect(() => {
    document.documentElement.classList.toggle('voiceover-enabled', settings.voiceOverEnabled);
  }, [settings.voiceOverEnabled]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 0.1, 3.0)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 0.1, 0.5)
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setSettings(prev => ({ ...prev, zoomLevel: 1.0 }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setSettings(prev => ({
      ...prev,
      zoomLevel: Math.max(0.5, Math.min(3.0, level))
    }));
  }, []);

  // Toggle functions
  const toggleHighContrast = useCallback(() => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  }, []);

  const toggleReduceTransparency = useCallback(() => {
    setSettings(prev => ({ ...prev, reduceTransparency: !prev.reduceTransparency }));
  }, []);

  const toggleVoiceOver = useCallback(() => {
    setSettings(prev => ({ ...prev, voiceOverEnabled: !prev.voiceOverEnabled }));
  }, []);

  // Setters
  const setTextSize = useCallback((size: AccessibilitySettings['textSize']) => {
    setSettings(prev => ({ ...prev, textSize: size }));
  }, []);

  const setColorFilter = useCallback((filter: AccessibilitySettings['colorFilter']) => {
    setSettings(prev => ({ ...prev, colorFilter: filter }));
  }, []);

  // Reset all
  const resetAll = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Keyboard shortcuts for zoom (Command/Ctrl + / -)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  const value: AccessibilityContextType = {
    ...settings,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    toggleHighContrast,
    toggleReduceMotion,
    toggleReduceTransparency,
    toggleVoiceOver,
    setTextSize,
    setColorFilter,
    resetAll,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* SVG filters for color blindness simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {/* Protanopia (red-blind) filter */}
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="
              0.567, 0.433, 0, 0, 0
              0.558, 0.442, 0, 0, 0
              0, 0.242, 0.758, 0, 0
              0, 0, 0, 1, 0
            "/>
          </filter>
          {/* Deuteranopia (green-blind) filter */}
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="
              0.625, 0.375, 0, 0, 0
              0.7, 0.3, 0, 0, 0
              0, 0.3, 0.7, 0, 0
              0, 0, 0, 1, 0
            "/>
          </filter>
          {/* Tritanopia (blue-blind) filter */}
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="
              0.95, 0.05, 0, 0, 0
              0, 0.433, 0.567, 0, 0
              0, 0.475, 0.525, 0, 0
              0, 0, 0, 1, 0
            "/>
          </filter>
        </defs>
      </svg>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

// Optional hook that returns default values if not within provider
export const useAccessibilitySafe = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      ...defaultSettings,
      zoomIn: () => {},
      zoomOut: () => {},
      resetZoom: () => {},
      setZoomLevel: () => {},
      toggleHighContrast: () => {},
      toggleReduceMotion: () => {},
      toggleReduceTransparency: () => {},
      toggleVoiceOver: () => {},
      setTextSize: () => {},
      setColorFilter: () => {},
      resetAll: () => {},
    };
  }
  return context;
};

export default AccessibilityContext;
