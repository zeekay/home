import React, { createContext, useContext, useCallback, useEffect, useRef, useMemo, ReactNode } from 'react';

/**
 * GlobalShortcutsContext - Centralized keyboard shortcut management for zOS
 *
 * Provides:
 * - System-wide shortcut registration
 * - Shortcut formatting for menu display
 * - Conflict detection
 * - Priority-based handling (app shortcuts override global)
 */

// Modifier keys
export type ModifierKey = 'meta' | 'ctrl' | 'alt' | 'shift';

// Shortcut definition
export interface ShortcutDefinition {
  id: string;
  key: string;
  modifiers: ModifierKey[];
  action: () => void;
  description: string;
  category: 'global' | 'app' | 'window' | 'edit' | 'view' | 'file' | 'help';
  enabled?: boolean;
  priority?: number; // Higher priority = handled first
  preventDefault?: boolean;
  allowInInput?: boolean; // Allow shortcut even when focused on input fields
}

// Formatted shortcut for display
export interface FormattedShortcut {
  id: string;
  display: string; // e.g., "⌘Q"
  description: string;
  category: string;
}

// macOS modifier symbols
const MODIFIER_SYMBOLS: Record<ModifierKey, string> = {
  ctrl: '\u2303',   // Control (^)
  alt: '\u2325',    // Option (⌥)
  shift: '\u21E7',  // Shift (⇧)
  meta: '\u2318',   // Command (⌘)
};

// Special key symbols
const KEY_SYMBOLS: Record<string, string> = {
  escape: '\u238B',      // ⎋
  tab: '\u21E5',         // ⇥
  space: 'Space',
  enter: '\u21A9',       // ↩
  return: '\u21A9',
  backspace: '\u232B',   // ⌫
  delete: '\u2326',      // ⌦
  arrowup: '\u2191',     // ↑
  arrowdown: '\u2193',   // ↓
  arrowleft: '\u2190',   // ←
  arrowright: '\u2192',  // →
  home: '\u2196',        // ↖
  end: '\u2198',         // ↘
  pageup: '\u21DE',      // ⇞
  pagedown: '\u21DF',    // ⇟
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  '[': '[',
  ']': ']',
  '`': '`',
  '-': '-',
  '=': '+',
  ',': ',',
  '.': '.',
  '/': '/',
  '\\': '\\',
  '?': '?',
  '3': '3',
  '4': '4',
  '5': '5',
};

// Format a shortcut for display
export function formatShortcutDisplay(modifiers: ModifierKey[], key: string): string {
  const parts: string[] = [];

  // Order: Ctrl, Alt/Option, Shift, Command (standard macOS order)
  const order: ModifierKey[] = ['ctrl', 'alt', 'shift', 'meta'];

  for (const mod of order) {
    if (modifiers.includes(mod)) {
      parts.push(MODIFIER_SYMBOLS[mod]);
    }
  }

  // Format the key
  const keyLower = key.toLowerCase();
  const displayKey = KEY_SYMBOLS[keyLower] || key.toUpperCase();
  parts.push(displayKey);

  return parts.join('');
}

// Parse a shortcut string like "Cmd+Shift+N" into modifiers and key
export function parseShortcutString(shortcut: string): { modifiers: ModifierKey[]; key: string } {
  const parts = shortcut.toLowerCase().split('+').map(p => p.trim());
  const key = parts[parts.length - 1];
  const modifiers: ModifierKey[] = [];

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part === 'cmd' || part === 'meta' || part === 'command' || part === '\u2318') {
      modifiers.push('meta');
    } else if (part === 'ctrl' || part === 'control' || part === '\u2303') {
      modifiers.push('ctrl');
    } else if (part === 'alt' || part === 'option' || part === '\u2325') {
      modifiers.push('alt');
    } else if (part === 'shift' || part === '\u21e7') {
      modifiers.push('shift');
    }
  }

  return { modifiers, key };
}

// Context type
interface GlobalShortcutsContextType {
  // Register a shortcut
  register: (shortcut: ShortcutDefinition) => () => void;

  // Unregister by id
  unregister: (id: string) => void;

  // Get all registered shortcuts
  getShortcuts: () => ShortcutDefinition[];

  // Get formatted shortcuts for display
  getFormattedShortcuts: () => FormattedShortcut[];

  // Check if a shortcut combo is registered
  isRegistered: (modifiers: ModifierKey[], key: string) => boolean;

  // Format a shortcut for display
  formatShortcut: (modifiers: ModifierKey[], key: string) => string;

  // Temporarily disable all shortcuts (e.g., for modal dialogs)
  setEnabled: (enabled: boolean) => void;
}

const GlobalShortcutsContext = createContext<GlobalShortcutsContextType | undefined>(undefined);

// Provider component
export const GlobalShortcutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const shortcutsRef = useRef<Map<string, ShortcutDefinition>>(new Map());
  const enabledRef = useRef(true);

  // Check if event matches shortcut
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: ShortcutDefinition): boolean => {
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                     event.code.toLowerCase() === shortcut.key.toLowerCase() ||
                     event.code.toLowerCase() === `key${shortcut.key.toLowerCase()}`;

    if (!keyMatch) return false;

    const hasCtrl = shortcut.modifiers.includes('ctrl');
    const hasAlt = shortcut.modifiers.includes('alt');
    const hasShift = shortcut.modifiers.includes('shift');
    const hasMeta = shortcut.modifiers.includes('meta');

    // Exact modifier match
    return event.ctrlKey === hasCtrl &&
           event.altKey === hasAlt &&
           event.shiftKey === hasShift &&
           event.metaKey === hasMeta;
  }, []);

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return;

      // Check if we're in an input field
      const target = event.target as HTMLElement;
      const isInInput = target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable;

      // Get all shortcuts sorted by priority (higher first)
      const shortcuts = Array.from(shortcutsRef.current.values())
        .filter(s => s.enabled !== false)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      for (const shortcut of shortcuts) {
        // Skip if in input and shortcut doesn't allow it
        if (isInInput && !shortcut.allowInInput && !shortcut.modifiers.includes('meta')) {
          continue;
        }

        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          shortcut.action();
          return; // Only trigger first matching shortcut
        }
      }
    };

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [matchesShortcut]);

  // Register a shortcut
  const register = useCallback((shortcut: ShortcutDefinition): (() => void) => {
    shortcutsRef.current.set(shortcut.id, shortcut);

    return () => {
      shortcutsRef.current.delete(shortcut.id);
    };
  }, []);

  // Unregister by id
  const unregister = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
  }, []);

  // Get all shortcuts
  const getShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values());
  }, []);

  // Get formatted shortcuts
  const getFormattedShortcuts = useCallback(() => {
    return Array.from(shortcutsRef.current.values()).map(s => ({
      id: s.id,
      display: formatShortcutDisplay(s.modifiers, s.key),
      description: s.description,
      category: s.category,
    }));
  }, []);

  // Check if registered
  const isRegistered = useCallback((modifiers: ModifierKey[], key: string): boolean => {
    const shortcuts = Array.from(shortcutsRef.current.values());
    return shortcuts.some(s =>
      s.key.toLowerCase() === key.toLowerCase() &&
      s.modifiers.length === modifiers.length &&
      s.modifiers.every(m => modifiers.includes(m))
    );
  }, []);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const value = useMemo(() => ({
    register,
    unregister,
    getShortcuts,
    getFormattedShortcuts,
    isRegistered,
    formatShortcut: formatShortcutDisplay,
    setEnabled,
  }), [register, unregister, getShortcuts, getFormattedShortcuts, isRegistered, setEnabled]);

  return (
    <GlobalShortcutsContext.Provider value={value}>
      {children}
    </GlobalShortcutsContext.Provider>
  );
};

// Hook to use the context
export function useGlobalShortcuts(): GlobalShortcutsContextType {
  const context = useContext(GlobalShortcutsContext);
  if (!context) {
    throw new Error('useGlobalShortcuts must be used within a GlobalShortcutsProvider');
  }
  return context;
}

// Hook to register shortcuts
export function useRegisterShortcuts(shortcuts: ShortcutDefinition[]) {
  const { register } = useGlobalShortcuts();

  useEffect(() => {
    const unregisters = shortcuts.map(s => register(s));
    return () => unregisters.forEach(u => u());
  }, [shortcuts, register]);
}

// Pre-defined system shortcuts factory
export function createSystemShortcuts(handlers: {
  spotlight: () => void;
  appSwitcher: () => void;
  windowSwitcher: () => void;
  hideApp: () => void;
  minimizeWindow: () => void;
  closeWindow: () => void;
  quitApp: () => void;
  preferences: () => void;
  help: () => void;
  lockScreen: () => void;
  screenshot: () => void;
  screenshotSelection: () => void;
  screenshotToolbar: () => void;
  showDesktop: () => void;
  dashboard: () => void;
  newDocument: () => void;
  openFile: () => void;
  saveFile: () => void;
  saveAs: () => void;
  print: () => void;
  undo: () => void;
  redo: () => void;
  cut: () => void;
  copy: () => void;
  paste: () => void;
  selectAll: () => void;
  find: () => void;
  findNext: () => void;
  missionControl: () => void;
  forceQuit: () => void;
  clipboardManager: () => void;
  toggleFocusMode: () => void;
}): ShortcutDefinition[] {
  return [
    // ============================================
    // GLOBAL SHORTCUTS
    // ============================================
    {
      id: 'global:spotlight',
      key: 'Space',
      modifiers: ['meta'],
      action: handlers.spotlight,
      description: 'Spotlight Search',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:app-switcher',
      key: 'Tab',
      modifiers: ['meta'],
      action: handlers.appSwitcher,
      description: 'App Switcher',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:window-switcher',
      key: '`',
      modifiers: ['meta'],
      action: handlers.windowSwitcher,
      description: 'Switch Windows (Same App)',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:hide-app',
      key: 'h',
      modifiers: ['meta'],
      action: handlers.hideApp,
      description: 'Hide App',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:minimize',
      key: 'm',
      modifiers: ['meta'],
      action: handlers.minimizeWindow,
      description: 'Minimize Window',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:close-window',
      key: 'w',
      modifiers: ['meta'],
      action: handlers.closeWindow,
      description: 'Close Window',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:quit-app',
      key: 'q',
      modifiers: ['meta'],
      action: handlers.quitApp,
      description: 'Quit App',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:preferences',
      key: ',',
      modifiers: ['meta'],
      action: handlers.preferences,
      description: 'Preferences',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:help',
      key: '?',
      modifiers: ['meta', 'shift'],
      action: handlers.help,
      description: 'Help',
      category: 'global',
      priority: 80,
    },
    {
      id: 'global:lock-screen',
      key: 'q',
      modifiers: ['ctrl', 'meta'],
      action: handlers.lockScreen,
      description: 'Lock Screen',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:screenshot',
      key: '3',
      modifiers: ['meta', 'shift'],
      action: handlers.screenshot,
      description: 'Screenshot (Full Screen)',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:screenshot-selection',
      key: '4',
      modifiers: ['meta', 'shift'],
      action: handlers.screenshotSelection,
      description: 'Screenshot (Selection)',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:screenshot-toolbar',
      key: '5',
      modifiers: ['meta', 'shift'],
      action: handlers.screenshotToolbar,
      description: 'Screenshot Toolbar',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:show-desktop',
      key: 'F11',
      modifiers: [],
      action: handlers.showDesktop,
      description: 'Show Desktop',
      category: 'global',
      priority: 80,
    },
    {
      id: 'global:dashboard',
      key: 'F12',
      modifiers: [],
      action: handlers.dashboard,
      description: 'Dashboard/Widgets',
      category: 'global',
      priority: 80,
    },
    {
      id: 'global:mission-control',
      key: 'ArrowUp',
      modifiers: ['ctrl'],
      action: handlers.missionControl,
      description: 'Mission Control',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:mission-control-f3',
      key: 'F3',
      modifiers: [],
      action: handlers.missionControl,
      description: 'Mission Control',
      category: 'global',
      priority: 80,
    },
    {
      id: 'global:force-quit',
      key: 'Escape',
      modifiers: ['meta', 'alt'],
      action: handlers.forceQuit,
      description: 'Force Quit',
      category: 'global',
      priority: 100,
      allowInInput: true,
    },
    {
      id: 'global:clipboard-manager',
      key: 'v',
      modifiers: ['meta', 'shift'],
      action: handlers.clipboardManager,
      description: 'Clipboard Manager',
      category: 'global',
      priority: 90,
    },
    {
      id: 'global:focus-mode',
      key: 'd',
      modifiers: ['meta', 'shift'],
      action: handlers.toggleFocusMode,
      description: 'Toggle Focus Mode',
      category: 'global',
      priority: 90,
    },

    // ============================================
    // APP/FILE SHORTCUTS
    // ============================================
    {
      id: 'file:new',
      key: 'n',
      modifiers: ['meta'],
      action: handlers.newDocument,
      description: 'New Document/Window',
      category: 'file',
      priority: 80,
    },
    {
      id: 'file:open',
      key: 'o',
      modifiers: ['meta'],
      action: handlers.openFile,
      description: 'Open',
      category: 'file',
      priority: 80,
    },
    {
      id: 'file:save',
      key: 's',
      modifiers: ['meta'],
      action: handlers.saveFile,
      description: 'Save',
      category: 'file',
      priority: 80,
    },
    {
      id: 'file:save-as',
      key: 's',
      modifiers: ['meta', 'shift'],
      action: handlers.saveAs,
      description: 'Save As',
      category: 'file',
      priority: 80,
    },
    {
      id: 'file:print',
      key: 'p',
      modifiers: ['meta'],
      action: handlers.print,
      description: 'Print',
      category: 'file',
      priority: 80,
    },

    // ============================================
    // EDIT SHORTCUTS
    // ============================================
    {
      id: 'edit:undo',
      key: 'z',
      modifiers: ['meta'],
      action: handlers.undo,
      description: 'Undo',
      category: 'edit',
      priority: 70,
      preventDefault: false, // Let browser handle
    },
    {
      id: 'edit:redo',
      key: 'z',
      modifiers: ['meta', 'shift'],
      action: handlers.redo,
      description: 'Redo',
      category: 'edit',
      priority: 70,
      preventDefault: false,
    },
    {
      id: 'edit:cut',
      key: 'x',
      modifiers: ['meta'],
      action: handlers.cut,
      description: 'Cut',
      category: 'edit',
      priority: 70,
      preventDefault: false,
    },
    {
      id: 'edit:copy',
      key: 'c',
      modifiers: ['meta'],
      action: handlers.copy,
      description: 'Copy',
      category: 'edit',
      priority: 70,
      preventDefault: false,
    },
    {
      id: 'edit:paste',
      key: 'v',
      modifiers: ['meta'],
      action: handlers.paste,
      description: 'Paste',
      category: 'edit',
      priority: 70,
      preventDefault: false,
    },
    {
      id: 'edit:select-all',
      key: 'a',
      modifiers: ['meta'],
      action: handlers.selectAll,
      description: 'Select All',
      category: 'edit',
      priority: 70,
      preventDefault: false,
    },
    {
      id: 'edit:find',
      key: 'f',
      modifiers: ['meta'],
      action: handlers.find,
      description: 'Find',
      category: 'edit',
      priority: 70,
    },
    {
      id: 'edit:find-next',
      key: 'g',
      modifiers: ['meta'],
      action: handlers.findNext,
      description: 'Find Next',
      category: 'edit',
      priority: 70,
    },
  ];
}

export default GlobalShortcutsContext;
