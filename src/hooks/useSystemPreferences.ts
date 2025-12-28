/**
 * zOS System Preferences Hook
 *
 * Centralized localStorage-based settings for all System Preferences panels.
 * Each setting category is stored separately for efficiency.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

// General Settings
export interface GeneralSettings {
  appearance: 'light' | 'dark' | 'auto';
  accentColor: 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'graphite';
  highlightColor: 'accent' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'graphite';
  sidebarIconSize: 'small' | 'medium' | 'large';
  scrollBars: 'automatic' | 'always' | 'whenScrolling';
  clickScrollBar: 'jump' | 'page';
  defaultBrowser: string;
  recentItems: number;
  handoff: boolean;
}

// Desktop & Dock Settings
export interface DesktopDockSettings {
  wallpaper: string;
  wallpaperFit: 'fill' | 'fit' | 'stretch' | 'center' | 'tile';
  dockSize: number;
  dockMagnification: boolean;
  dockMagnificationSize: number;
  dockPosition: 'bottom' | 'left' | 'right';
  minimizeEffect: 'genie' | 'scale';
  minimizeToAppIcon: boolean;
  animateOpening: boolean;
  autoHideDock: boolean;
  showIndicators: boolean;
  showRecents: boolean;
  hotCorners: {
    topLeft: HotCornerAction;
    topRight: HotCornerAction;
    bottomLeft: HotCornerAction;
    bottomRight: HotCornerAction;
  };
}

export type HotCornerAction = 'none' | 'missionControl' | 'appWindows' | 'desktop' | 'notification' | 'launchpad' | 'lock' | 'sleep' | 'screensaver';

// Display Settings
export interface DisplaySettings {
  resolution: 'default' | 'scaled';
  scaledResolution: number; // 1-5 scale (1=larger text, 5=more space)
  brightness: number;
  autoAdjustBrightness: boolean;
  trueTone: boolean;
  nightShift: boolean;
  nightShiftSchedule: 'off' | 'sunset' | 'custom';
  nightShiftFrom: string;
  nightShiftTo: string;
  nightShiftWarmth: number;
}

// Sound Settings
export interface SoundSettings {
  outputVolume: number;
  outputMuted: boolean;
  outputDevice: string;
  inputVolume: number;
  inputDevice: string;
  alertSound: string;
  alertVolume: number;
  playFeedback: boolean;
  playStartupSound: boolean;
}

// Notification Settings
export interface NotificationAppSettings {
  appId: string;
  enabled: boolean;
  banners: boolean;
  sounds: boolean;
  badges: boolean;
  showInNotificationCenter: boolean;
  showOnLockScreen: boolean;
  grouping: 'automatic' | 'byApp' | 'off';
}

export interface NotificationSettings {
  showPreviews: 'always' | 'whenUnlocked' | 'never';
  doNotDisturb: boolean;
  dndSchedule: boolean;
  dndFrom: string;
  dndTo: string;
  dndAllowCalls: boolean;
  dndAllowRepeatedCalls: boolean;
  apps: NotificationAppSettings[];
}

// Focus Settings
export interface FocusMode {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  silenceNotifications: boolean;
  allowedApps: string[];
  allowedPeople: string[];
  schedule?: {
    enabled: boolean;
    days: number[];
    from: string;
    to: string;
  };
}

export interface FocusSettings {
  activeFocusId: string | null;
  shareAcrossDevices: boolean;
  focusModes: FocusMode[];
}

// Privacy & Security Settings
export interface PrivacySecuritySettings {
  locationServices: boolean;
  locationApps: { appId: string; access: 'never' | 'askNextTime' | 'whileUsing' | 'always' }[];
  contactsApps: string[];
  calendarsApps: string[];
  photosApps: string[];
  cameraApps: string[];
  microphoneApps: string[];
  shareAnalytics: boolean;
  shareWithAppDevelopers: boolean;
  filevaultEnabled: boolean;
  firewallEnabled: boolean;
  allowAppStoreApps: boolean;
}

// Users & Groups Settings
export interface UserSettings {
  currentUser: {
    name: string;
    fullName: string;
    avatar: string;
    isAdmin: boolean;
  };
  autoLogin: boolean;
  loginItems: { name: string; path: string; hidden: boolean }[];
  guestUserEnabled: boolean;
}

// Keyboard Settings
export interface KeyboardSettings {
  keyRepeatRate: number; // 1-10
  delayUntilRepeat: number; // 1-5
  capsLockAction: 'capsLock' | 'control' | 'option' | 'command' | 'escape' | 'none';
  fnKeyAction: 'specialFeatures' | 'fKeys';
  adjustBrightness: boolean;
  keyboardBacklight: boolean;
  backlightTimeout: number;
  inputSources: string[];
  currentInputSource: string;
  shortcuts: {
    category: string;
    shortcuts: { name: string; key: string; enabled: boolean }[];
  }[];
}

// Accessibility Settings
export interface AccessibilitySettings {
  zoom: boolean;
  zoomLevel: number;
  zoomStyle: 'fullscreen' | 'pip' | 'splitScreen';
  voiceOver: boolean;
  voiceOverRate: number;
  speakSelection: boolean;
  speakHoveredText: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  increaseContrast: boolean;
  differentiateWithoutColor: boolean;
  cursorSize: number;
  flashScreen: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
}

// Complete Settings State
export interface SystemPreferencesState {
  general: GeneralSettings;
  desktopDock: DesktopDockSettings;
  display: DisplaySettings;
  sound: SoundSettings;
  notifications: NotificationSettings;
  focus: FocusSettings;
  privacySecurity: PrivacySecuritySettings;
  users: UserSettings;
  keyboard: KeyboardSettings;
  accessibility: AccessibilitySettings;
}

// ============================================================================
// Default Values
// ============================================================================

const defaultGeneral: GeneralSettings = {
  appearance: 'auto',
  accentColor: 'blue',
  highlightColor: 'accent',
  sidebarIconSize: 'medium',
  scrollBars: 'automatic',
  clickScrollBar: 'page',
  defaultBrowser: 'Safari',
  recentItems: 10,
  handoff: true,
};

const defaultDesktopDock: DesktopDockSettings = {
  wallpaper: 'gradient',
  wallpaperFit: 'fill',
  dockSize: 64,
  dockMagnification: true,
  dockMagnificationSize: 128,
  dockPosition: 'bottom',
  minimizeEffect: 'genie',
  minimizeToAppIcon: false,
  animateOpening: true,
  autoHideDock: false,
  showIndicators: true,
  showRecents: true,
  hotCorners: {
    topLeft: 'none',
    topRight: 'none',
    bottomLeft: 'none',
    bottomRight: 'none',
  },
};

const defaultDisplay: DisplaySettings = {
  resolution: 'default',
  scaledResolution: 3,
  brightness: 100,
  autoAdjustBrightness: true,
  trueTone: true,
  nightShift: false,
  nightShiftSchedule: 'off',
  nightShiftFrom: '22:00',
  nightShiftTo: '07:00',
  nightShiftWarmth: 50,
};

const defaultSound: SoundSettings = {
  outputVolume: 75,
  outputMuted: false,
  outputDevice: 'Built-in Speakers',
  inputVolume: 50,
  inputDevice: 'Built-in Microphone',
  alertSound: 'Ping',
  alertVolume: 75,
  playFeedback: true,
  playStartupSound: true,
};

const defaultNotifications: NotificationSettings = {
  showPreviews: 'whenUnlocked',
  doNotDisturb: false,
  dndSchedule: false,
  dndFrom: '22:00',
  dndTo: '07:00',
  dndAllowCalls: true,
  dndAllowRepeatedCalls: true,
  apps: [
    { appId: 'calendar', enabled: true, banners: true, sounds: true, badges: true, showInNotificationCenter: true, showOnLockScreen: true, grouping: 'automatic' },
    { appId: 'messages', enabled: true, banners: true, sounds: true, badges: true, showInNotificationCenter: true, showOnLockScreen: true, grouping: 'automatic' },
    { appId: 'mail', enabled: true, banners: true, sounds: true, badges: true, showInNotificationCenter: true, showOnLockScreen: true, grouping: 'byApp' },
    { appId: 'finder', enabled: true, banners: true, sounds: false, badges: false, showInNotificationCenter: true, showOnLockScreen: false, grouping: 'automatic' },
    { appId: 'safari', enabled: true, banners: true, sounds: false, badges: true, showInNotificationCenter: true, showOnLockScreen: false, grouping: 'automatic' },
  ],
};

const defaultFocus: FocusSettings = {
  activeFocusId: null,
  shareAcrossDevices: true,
  focusModes: [
    { id: 'dnd', name: 'Do Not Disturb', icon: 'Moon', color: 'purple', enabled: true, silenceNotifications: true, allowedApps: [], allowedPeople: [] },
    { id: 'work', name: 'Work', icon: 'Briefcase', color: 'blue', enabled: true, silenceNotifications: false, allowedApps: ['mail', 'calendar', 'notes'], allowedPeople: [] },
    { id: 'personal', name: 'Personal', icon: 'User', color: 'green', enabled: true, silenceNotifications: false, allowedApps: ['messages', 'music', 'photos'], allowedPeople: [] },
    { id: 'sleep', name: 'Sleep', icon: 'Bed', color: 'indigo', enabled: true, silenceNotifications: true, allowedApps: ['clock'], allowedPeople: [] },
  ],
};

const defaultPrivacySecurity: PrivacySecuritySettings = {
  locationServices: true,
  locationApps: [],
  contactsApps: [],
  calendarsApps: [],
  photosApps: [],
  cameraApps: [],
  microphoneApps: [],
  shareAnalytics: false,
  shareWithAppDevelopers: false,
  filevaultEnabled: true,
  firewallEnabled: true,
  allowAppStoreApps: true,
};

const defaultUsers: UserSettings = {
  currentUser: {
    name: 'zak',
    fullName: 'Zach Kelling',
    avatar: '',
    isAdmin: true,
  },
  autoLogin: false,
  loginItems: [],
  guestUserEnabled: false,
};

const defaultKeyboard: KeyboardSettings = {
  keyRepeatRate: 7,
  delayUntilRepeat: 3,
  capsLockAction: 'capsLock',
  fnKeyAction: 'specialFeatures',
  adjustBrightness: true,
  keyboardBacklight: true,
  backlightTimeout: 30,
  inputSources: ['U.S.'],
  currentInputSource: 'U.S.',
  shortcuts: [
    {
      category: 'Screenshots',
      shortcuts: [
        { name: 'Save picture of screen', key: 'Cmd+Shift+3', enabled: true },
        { name: 'Save picture of selected area', key: 'Cmd+Shift+4', enabled: true },
        { name: 'Screenshot options', key: 'Cmd+Shift+5', enabled: true },
      ],
    },
    {
      category: 'Spotlight',
      shortcuts: [
        { name: 'Show Spotlight search', key: 'Cmd+Space', enabled: true },
        { name: 'Show Finder search', key: 'Cmd+Option+Space', enabled: true },
      ],
    },
    {
      category: 'App Shortcuts',
      shortcuts: [
        { name: 'Show Help menu', key: 'Cmd+Shift+/', enabled: true },
      ],
    },
  ],
};

const defaultAccessibility: AccessibilitySettings = {
  zoom: false,
  zoomLevel: 1.0,
  zoomStyle: 'fullscreen',
  voiceOver: false,
  voiceOverRate: 50,
  speakSelection: false,
  speakHoveredText: false,
  reduceMotion: false,
  reduceTransparency: false,
  increaseContrast: false,
  differentiateWithoutColor: false,
  cursorSize: 1.0,
  flashScreen: false,
  stickyKeys: false,
  slowKeys: false,
  mouseKeys: false,
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  general: 'zos-prefs-general',
  desktopDock: 'zos-prefs-desktop-dock',
  display: 'zos-prefs-display',
  sound: 'zos-prefs-sound',
  notifications: 'zos-prefs-notifications',
  focus: 'zos-prefs-focus',
  privacySecurity: 'zos-prefs-privacy-security',
  users: 'zos-prefs-users',
  keyboard: 'zos-prefs-keyboard',
  accessibility: 'zos-prefs-accessibility',
} as const;

// ============================================================================
// Storage Helpers
// ============================================================================

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...defaultValue, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export interface UseSystemPreferencesReturn {
  // Settings State
  general: GeneralSettings;
  desktopDock: DesktopDockSettings;
  display: DisplaySettings;
  sound: SoundSettings;
  notifications: NotificationSettings;
  focus: FocusSettings;
  privacySecurity: PrivacySecuritySettings;
  users: UserSettings;
  keyboard: KeyboardSettings;
  accessibility: AccessibilitySettings;

  // Update Functions
  updateGeneral: (updates: Partial<GeneralSettings>) => void;
  updateDesktopDock: (updates: Partial<DesktopDockSettings>) => void;
  updateDisplay: (updates: Partial<DisplaySettings>) => void;
  updateSound: (updates: Partial<SoundSettings>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  updateFocus: (updates: Partial<FocusSettings>) => void;
  updatePrivacySecurity: (updates: Partial<PrivacySecuritySettings>) => void;
  updateUsers: (updates: Partial<UserSettings>) => void;
  updateKeyboard: (updates: Partial<KeyboardSettings>) => void;
  updateAccessibility: (updates: Partial<AccessibilitySettings>) => void;

  // Utility Functions
  resetToDefaults: (category?: keyof SystemPreferencesState) => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

export function useSystemPreferences(): UseSystemPreferencesReturn {
  // ===================== State Initialization =====================
  const [general, setGeneral] = useState<GeneralSettings>(() =>
    loadFromStorage(STORAGE_KEYS.general, defaultGeneral)
  );
  const [desktopDock, setDesktopDock] = useState<DesktopDockSettings>(() =>
    loadFromStorage(STORAGE_KEYS.desktopDock, defaultDesktopDock)
  );
  const [display, setDisplay] = useState<DisplaySettings>(() =>
    loadFromStorage(STORAGE_KEYS.display, defaultDisplay)
  );
  const [sound, setSound] = useState<SoundSettings>(() =>
    loadFromStorage(STORAGE_KEYS.sound, defaultSound)
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    loadFromStorage(STORAGE_KEYS.notifications, defaultNotifications)
  );
  const [focus, setFocus] = useState<FocusSettings>(() =>
    loadFromStorage(STORAGE_KEYS.focus, defaultFocus)
  );
  const [privacySecurity, setPrivacySecurity] = useState<PrivacySecuritySettings>(() =>
    loadFromStorage(STORAGE_KEYS.privacySecurity, defaultPrivacySecurity)
  );
  const [users, setUsers] = useState<UserSettings>(() =>
    loadFromStorage(STORAGE_KEYS.users, defaultUsers)
  );
  const [keyboard, setKeyboard] = useState<KeyboardSettings>(() =>
    loadFromStorage(STORAGE_KEYS.keyboard, defaultKeyboard)
  );
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() =>
    loadFromStorage(STORAGE_KEYS.accessibility, defaultAccessibility)
  );

  // ===================== Persistence Effects =====================
  useEffect(() => { saveToStorage(STORAGE_KEYS.general, general); }, [general]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.desktopDock, desktopDock); }, [desktopDock]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.display, display); }, [display]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.sound, sound); }, [sound]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.notifications, notifications); }, [notifications]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.focus, focus); }, [focus]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.privacySecurity, privacySecurity); }, [privacySecurity]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.users, users); }, [users]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.keyboard, keyboard); }, [keyboard]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.accessibility, accessibility); }, [accessibility]);

  // ===================== Apply Effects =====================

  // Apply appearance mode
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (general.appearance === 'dark' || (general.appearance === 'auto' && prefersDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [general.appearance]);

  // Apply accent color
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', general.accentColor);
  }, [general.accentColor]);

  // Apply reduce motion
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', accessibility.reduceMotion);
  }, [accessibility.reduceMotion]);

  // Apply reduce transparency
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-transparency', accessibility.reduceTransparency);
  }, [accessibility.reduceTransparency]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', accessibility.increaseContrast);
  }, [accessibility.increaseContrast]);

  // ===================== Update Functions =====================
  const updateGeneral = useCallback((updates: Partial<GeneralSettings>) => {
    setGeneral(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDesktopDock = useCallback((updates: Partial<DesktopDockSettings>) => {
    setDesktopDock(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDisplay = useCallback((updates: Partial<DisplaySettings>) => {
    setDisplay(prev => ({ ...prev, ...updates }));
  }, []);

  const updateSound = useCallback((updates: Partial<SoundSettings>) => {
    setSound(prev => ({ ...prev, ...updates }));
  }, []);

  const updateNotifications = useCallback((updates: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...updates }));
  }, []);

  const updateFocus = useCallback((updates: Partial<FocusSettings>) => {
    setFocus(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePrivacySecurity = useCallback((updates: Partial<PrivacySecuritySettings>) => {
    setPrivacySecurity(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUsers = useCallback((updates: Partial<UserSettings>) => {
    setUsers(prev => ({ ...prev, ...updates }));
  }, []);

  const updateKeyboard = useCallback((updates: Partial<KeyboardSettings>) => {
    setKeyboard(prev => ({ ...prev, ...updates }));
  }, []);

  const updateAccessibility = useCallback((updates: Partial<AccessibilitySettings>) => {
    setAccessibility(prev => ({ ...prev, ...updates }));
  }, []);

  // ===================== Utility Functions =====================
  const resetToDefaults = useCallback((category?: keyof SystemPreferencesState) => {
    if (!category || category === 'general') setGeneral(defaultGeneral);
    if (!category || category === 'desktopDock') setDesktopDock(defaultDesktopDock);
    if (!category || category === 'display') setDisplay(defaultDisplay);
    if (!category || category === 'sound') setSound(defaultSound);
    if (!category || category === 'notifications') setNotifications(defaultNotifications);
    if (!category || category === 'focus') setFocus(defaultFocus);
    if (!category || category === 'privacySecurity') setPrivacySecurity(defaultPrivacySecurity);
    if (!category || category === 'users') setUsers(defaultUsers);
    if (!category || category === 'keyboard') setKeyboard(defaultKeyboard);
    if (!category || category === 'accessibility') setAccessibility(defaultAccessibility);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify({
      general,
      desktopDock,
      display,
      sound,
      notifications,
      focus,
      privacySecurity,
      users,
      keyboard,
      accessibility,
    }, null, 2);
  }, [general, desktopDock, display, sound, notifications, focus, privacySecurity, users, keyboard, accessibility]);

  const importSettings = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.general) setGeneral({ ...defaultGeneral, ...parsed.general });
      if (parsed.desktopDock) setDesktopDock({ ...defaultDesktopDock, ...parsed.desktopDock });
      if (parsed.display) setDisplay({ ...defaultDisplay, ...parsed.display });
      if (parsed.sound) setSound({ ...defaultSound, ...parsed.sound });
      if (parsed.notifications) setNotifications({ ...defaultNotifications, ...parsed.notifications });
      if (parsed.focus) setFocus({ ...defaultFocus, ...parsed.focus });
      if (parsed.privacySecurity) setPrivacySecurity({ ...defaultPrivacySecurity, ...parsed.privacySecurity });
      if (parsed.users) setUsers({ ...defaultUsers, ...parsed.users });
      if (parsed.keyboard) setKeyboard({ ...defaultKeyboard, ...parsed.keyboard });
      if (parsed.accessibility) setAccessibility({ ...defaultAccessibility, ...parsed.accessibility });
      return true;
    } catch (e) {
      console.error('Failed to import settings:', e);
      return false;
    }
  }, []);

  return {
    general,
    desktopDock,
    display,
    sound,
    notifications,
    focus,
    privacySecurity,
    users,
    keyboard,
    accessibility,
    updateGeneral,
    updateDesktopDock,
    updateDisplay,
    updateSound,
    updateNotifications,
    updateFocus,
    updatePrivacySecurity,
    updateUsers,
    updateKeyboard,
    updateAccessibility,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
}

export default useSystemPreferences;
