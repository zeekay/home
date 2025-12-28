import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';

// App categories for filtering
export type AppCategory = 'productivity' | 'entertainment' | 'communication' | 'utility' | 'system';

// App categorization
export const APP_CATEGORIES: Record<string, AppCategory> = {
  // Productivity
  finder: 'productivity',
  terminal: 'productivity',
  textedit: 'productivity',
  notes: 'productivity',
  calendar: 'productivity',
  mail: 'productivity',
  xcode: 'productivity',
  
  // Entertainment
  music: 'entertainment',
  photos: 'entertainment',
  videos: 'entertainment',
  
  // Communication
  socials: 'communication',
  facetime: 'communication',
  messages: 'communication',
  
  // Utility
  calculator: 'utility',
  weather: 'utility',
  clock: 'utility',
  safari: 'utility',
  
  // System/Special
  settings: 'system',
  hanzo: 'system',
  lux: 'system',
  zoo: 'system',
  appstore: 'system',
  github: 'system',
  stats: 'system',
};

// Focus mode configuration
export interface FocusModeConfig {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  allowedApps: string[]; // Specific apps to allow (empty = use categories)
  allowedCategories: AppCategory[]; // Categories to allow
  blockedApps: string[]; // Specific apps to block
  silenceNotifications: boolean;
  wallpaper?: string; // Optional wallpaper URL
  menuBarTint?: string; // Optional menu bar color
  shareStatus: boolean; // Share focus status with Messages
  schedule?: FocusSchedule; // Optional time-based schedule
}

export interface FocusSchedule {
  enabled: boolean;
  days: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface FocusModeContextType {
  // Current state
  activeMode: FocusModeConfig | null;
  modes: FocusModeConfig[];
  
  // Mode management
  activateMode: (modeId: string | null) => void;
  createMode: (config: Omit<FocusModeConfig, 'id'>) => FocusModeConfig;
  updateMode: (id: string, updates: Partial<Omit<FocusModeConfig, 'id'>>) => void;
  deleteMode: (id: string) => void;
  
  // App visibility
  isAppAllowed: (appId: string) => boolean;
  getVisibleDockApps: (allApps: string[]) => string[];
  
  // Notification control
  shouldSilenceNotifications: () => boolean;
  
  // Status sharing
  getFocusStatus: () => { active: boolean; modeName: string | null };
  
  // UI helpers
  getMenuBarStyle: () => { backgroundColor?: string } | null;
  getCurrentWallpaper: () => string | null;
}

// Built-in focus modes
const DEFAULT_MODES: FocusModeConfig[] = [
  {
    id: 'work',
    name: 'Work',
    icon: 'Briefcase',
    color: 'bg-blue-500',
    allowedApps: [],
    allowedCategories: ['productivity', 'utility', 'system'],
    blockedApps: ['music', 'photos', 'videos'],
    silenceNotifications: false,
    shareStatus: true,
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'User',
    color: 'bg-green-500',
    allowedApps: [],
    allowedCategories: ['entertainment', 'communication', 'utility', 'system'],
    blockedApps: ['xcode', 'terminal'],
    silenceNotifications: false,
    shareStatus: true,
  },
  {
    id: 'dnd',
    name: 'Do Not Disturb',
    icon: 'Moon',
    color: 'bg-purple-500',
    allowedApps: [],
    allowedCategories: ['productivity', 'entertainment', 'communication', 'utility', 'system'],
    blockedApps: [],
    silenceNotifications: true,
    shareStatus: true,
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: 'BedDouble',
    color: 'bg-indigo-500',
    allowedApps: ['clock', 'music'],
    allowedCategories: [],
    blockedApps: [],
    silenceNotifications: true,
    shareStatus: true,
  },
];

const STORAGE_KEY = 'zos-focus-modes';
const ACTIVE_MODE_KEY = 'zos-focus-active';

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export const FocusModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load modes from localStorage
  const [modes, setModes] = useState<FocusModeConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure built-in modes exist
        const savedIds = new Set(parsed.map((m: FocusModeConfig) => m.id));
        const merged = [...parsed];
        DEFAULT_MODES.forEach((mode) => {
          if (!savedIds.has(mode.id)) {
            merged.push(mode);
          }
        });
        return merged;
      }
    } catch (e) {
      logger.error('Failed to parse focus modes:', e);
    }
    return DEFAULT_MODES;
  });

  // Load active mode from localStorage
  const [activeMode, setActiveMode] = useState<FocusModeConfig | null>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_MODE_KEY);
      if (savedId) {
        const mode = modes.find(m => m.id === savedId);
        return mode || null;
      }
    } catch (e) {
      logger.error('Failed to load active focus mode:', e);
    }
    return null;
  });

  // Persist modes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modes));
  }, [modes]);

  // Persist active mode to localStorage
  useEffect(() => {
    if (activeMode) {
      localStorage.setItem(ACTIVE_MODE_KEY, activeMode.id);
    } else {
      localStorage.removeItem(ACTIVE_MODE_KEY);
    }
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('zos:focus-mode-change', {
      detail: { mode: activeMode }
    }));
  }, [activeMode]);

  // Check schedules periodically
  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date();
      const day = now.getDay();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const mode of modes) {
        if (mode.schedule?.enabled) {
          const { days, startTime, endTime } = mode.schedule;
          const inDay = days.includes(day);
          const inTime = time >= startTime && time < endTime;

          if (inDay && inTime && activeMode?.id !== mode.id) {
            setActiveMode(mode);
            return;
          }
          
          if (activeMode?.id === mode.id && (!inDay || !inTime)) {
            setActiveMode(null);
            return;
          }
        }
      }
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [modes, activeMode]);

  const activateMode = useCallback((modeId: string | null) => {
    if (!modeId) {
      setActiveMode(null);
      return;
    }
    const mode = modes.find(m => m.id === modeId);
    setActiveMode(mode || null);
  }, [modes]);

  const createMode = useCallback((config: Omit<FocusModeConfig, 'id'>): FocusModeConfig => {
    const newMode: FocusModeConfig = {
      ...config,
      id: `custom-${Date.now()}`,
    };
    setModes(prev => [...prev, newMode]);
    return newMode;
  }, []);

  const updateMode = useCallback((id: string, updates: Partial<Omit<FocusModeConfig, 'id'>>) => {
    setModes(prev => prev.map(mode => 
      mode.id === id ? { ...mode, ...updates } : mode
    ));
    
    // Update active mode if it's being modified
    if (activeMode?.id === id) {
      setActiveMode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeMode]);

  const deleteMode = useCallback((id: string) => {
    // Prevent deleting built-in modes
    if (DEFAULT_MODES.some(m => m.id === id)) {
      logger.warn('Cannot delete built-in focus mode:', id);
      return;
    }
    
    setModes(prev => prev.filter(mode => mode.id !== id));
    
    // Deactivate if deleted mode was active
    if (activeMode?.id === id) {
      setActiveMode(null);
    }
  }, [activeMode]);

  const isAppAllowed = useCallback((appId: string): boolean => {
    if (!activeMode) return true;

    // Check if explicitly blocked
    if (activeMode.blockedApps.includes(appId)) {
      return false;
    }

    // Check if explicitly allowed
    if (activeMode.allowedApps.length > 0) {
      return activeMode.allowedApps.includes(appId);
    }

    // Check category
    const category = APP_CATEGORIES[appId];
    if (!category) return true; // Unknown apps are allowed
    
    return activeMode.allowedCategories.includes(category);
  }, [activeMode]);

  const getVisibleDockApps = useCallback((allApps: string[]): string[] => {
    if (!activeMode) return allApps;
    return allApps.filter(appId => isAppAllowed(appId));
  }, [activeMode, isAppAllowed]);

  const shouldSilenceNotifications = useCallback((): boolean => {
    return activeMode?.silenceNotifications ?? false;
  }, [activeMode]);

  const getFocusStatus = useCallback(() => {
    return {
      active: !!activeMode,
      modeName: activeMode?.shareStatus ? activeMode.name : null,
    };
  }, [activeMode]);

  const getMenuBarStyle = useCallback(() => {
    if (!activeMode?.menuBarTint) return null;
    return { backgroundColor: activeMode.menuBarTint };
  }, [activeMode]);

  const getCurrentWallpaper = useCallback(() => {
    return activeMode?.wallpaper ?? null;
  }, [activeMode]);

  return (
    <FocusModeContext.Provider value={{
      activeMode,
      modes,
      activateMode,
      createMode,
      updateMode,
      deleteMode,
      isAppAllowed,
      getVisibleDockApps,
      shouldSilenceNotifications,
      getFocusStatus,
      getMenuBarStyle,
      getCurrentWallpaper,
    }}>
      {children}
    </FocusModeContext.Provider>
  );
};

// Default context for graceful degradation
const defaultContext: FocusModeContextType = {
  activeMode: null,
  modes: DEFAULT_MODES,
  activateMode: () => {},
  createMode: (config) => ({ ...config, id: 'default' }),
  updateMode: () => {},
  deleteMode: () => {},
  isAppAllowed: () => true,
  getVisibleDockApps: (apps) => apps,
  shouldSilenceNotifications: () => false,
  getFocusStatus: () => ({ active: false, modeName: null }),
  getMenuBarStyle: () => null,
  getCurrentWallpaper: () => null,
};

export const useFocusMode = (): FocusModeContextType => {
  const context = useContext(FocusModeContext);
  return context ?? defaultContext;
};
