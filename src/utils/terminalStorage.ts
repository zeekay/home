// Terminal localStorage utilities for zOS
// Handles persistence of terminal state, profiles, and preferences

import {
  TerminalProfile,
  TerminalTab,
  TerminalPane,
  TerminalWindowState,
  DEFAULT_PROFILES
} from '@/types/terminal';

const STORAGE_KEYS = {
  PROFILES: 'zos-terminal-profiles',
  TABS: 'zos-terminal-tabs',
  PANES: 'zos-terminal-panes',
  ACTIVE_TAB: 'zos-terminal-active-tab',
  DEFAULT_PROFILE: 'zos-terminal-default-profile',
  PREFERENCES: 'zos-terminal-preferences',
  COMMAND_HISTORY: 'zos-terminal-history',
} as const;

// Terminal Preferences
export interface TerminalPreferences {
  // General
  confirmCloseMultipleTabs: boolean;
  showTabBar: boolean;
  tabBarPosition: 'top' | 'bottom';

  // Shell
  shellPath: string;
  loginShell: boolean;

  // Window
  initialRows: number;
  initialCols: number;
  scrollbackLines: number;

  // Bell
  bellStyle: 'none' | 'visual' | 'audio' | 'both';

  // Advanced
  openUrlOnClick: boolean;
  copyOnSelect: boolean;
  focusFollowsMouse: boolean;
}

export const DEFAULT_PREFERENCES: TerminalPreferences = {
  confirmCloseMultipleTabs: true,
  showTabBar: true,
  tabBarPosition: 'top',
  shellPath: '/bin/zsh',
  loginShell: true,
  initialRows: 24,
  initialCols: 80,
  scrollbackLines: 10000,
  bellStyle: 'visual',
  openUrlOnClick: true,
  copyOnSelect: false,
  focusFollowsMouse: false,
};

// Save and load profiles
export const saveProfiles = (profiles: TerminalProfile[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save terminal profiles:', error);
  }
};

export const loadProfiles = (): TerminalProfile[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load terminal profiles:', error);
  }
  return [...DEFAULT_PROFILES];
};

// Save and load tabs
export const saveTabs = (tabs: TerminalTab[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  } catch (error) {
    console.error('Failed to save terminal tabs:', error);
  }
};

export const loadTabs = (): TerminalTab[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TABS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load terminal tabs:', error);
  }
  return [];
};

// Save and load panes
export const savePanes = (panes: Record<string, TerminalPane>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PANES, JSON.stringify(panes));
  } catch (error) {
    console.error('Failed to save terminal panes:', error);
  }
};

export const loadPanes = (): Record<string, TerminalPane> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PANES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load terminal panes:', error);
  }
  return {};
};

// Save and load active tab
export const saveActiveTab = (tabId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
  } catch (error) {
    console.error('Failed to save active tab:', error);
  }
};

export const loadActiveTab = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
  } catch (error) {
    console.error('Failed to load active tab:', error);
  }
  return null;
};

// Save and load default profile
export const saveDefaultProfile = (profileId: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_PROFILE, profileId);
  } catch (error) {
    console.error('Failed to save default profile:', error);
  }
};

export const loadDefaultProfile = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.DEFAULT_PROFILE) || 'default';
  } catch (error) {
    console.error('Failed to load default profile:', error);
  }
  return 'default';
};

// Save and load preferences
export const savePreferences = (prefs: TerminalPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save terminal preferences:', error);
  }
};

export const loadPreferences = (): TerminalPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load terminal preferences:', error);
  }
  return { ...DEFAULT_PREFERENCES };
};

// Save and load command history
export const saveCommandHistory = (history: string[]): void => {
  try {
    // Keep only last 1000 commands
    const trimmed = history.slice(0, 1000);
    localStorage.setItem(STORAGE_KEYS.COMMAND_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save command history:', error);
  }
};

export const loadCommandHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMMAND_HISTORY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load command history:', error);
  }
  return [];
};

// Save entire terminal state
export const saveTerminalState = (state: TerminalWindowState): void => {
  saveProfiles(state.profiles);
  saveTabs(state.tabs);
  savePanes(state.panes);
  saveActiveTab(state.activeTabId);
  saveDefaultProfile(state.defaultProfileId);
};

// Load entire terminal state
export const loadTerminalState = (): TerminalWindowState => {
  const profiles = loadProfiles();
  const tabs = loadTabs();
  const panes = loadPanes();
  const activeTabId = loadActiveTab();
  const defaultProfileId = loadDefaultProfile();

  return {
    profiles,
    tabs,
    panes,
    activeTabId: activeTabId || (tabs[0]?.id ?? ''),
    defaultProfileId,
    sshConnections: [],
  };
};

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create a new tab
export const createNewTab = (profileId: string, title?: string): TerminalTab => {
  const id = generateId();
  return {
    id,
    title: title || 'zsh',
    sessionId: generateId(),
    profileId,
    isActive: true,
  };
};

// Create a new pane
export const createNewPane = (
  tabId: string,
  profileId: string,
  splitDirection?: 'horizontal' | 'vertical'
): TerminalPane => {
  return {
    id: generateId(),
    tabId,
    sessionId: generateId(),
    profileId,
    splitDirection,
    splitRatio: 50,
    isActive: true,
  };
};
