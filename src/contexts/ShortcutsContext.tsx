import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';

// Action types available in shortcuts
export type ActionType =
  | 'openApp'
  | 'openUrl'
  | 'createNote'
  | 'sendMessage'
  | 'showNotification'
  | 'runCommand'
  | 'setFocusMode'
  | 'playPauseMusic'
  | 'getWeather'
  | 'wait'
  | 'showDialog';

// Trigger types
export type TriggerType =
  | 'keyboard'
  | 'menuBar'
  | 'scheduled'
  | 'appEvent';

export interface ShortcutAction {
  id: string;
  type: ActionType;
  label: string;
  params: Record<string, string | number | boolean>;
  position: { x: number; y: number };
}

export interface ShortcutTrigger {
  type: TriggerType;
  value: string; // keyboard combo, cron expression, or app name
  event?: 'open' | 'close'; // for appEvent trigger
}

export interface Shortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  actions: ShortcutAction[];
  connections: { from: string; to: string }[];
  trigger?: ShortcutTrigger;
  createdAt: number;
  updatedAt: number;
  enabled: boolean;
}

export interface ActionDefinition {
  type: ActionType;
  label: string;
  icon: string;
  description: string;
  params: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    options?: string[];
    default?: string | number | boolean;
    required?: boolean;
  }[];
}

// Built-in action definitions
export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    type: 'openApp',
    label: 'Open App',
    icon: 'app-window',
    description: 'Launch an application',
    params: [
      {
        key: 'appId',
        label: 'Application',
        type: 'select',
        options: ['finder', 'safari', 'terminal', 'notes', 'music', 'calendar', 'mail', 'photos', 'messages', 'calculator', 'weather'],
        required: true,
      },
    ],
  },
  {
    type: 'openUrl',
    label: 'Open URL in Safari',
    icon: 'globe',
    description: 'Open a URL in Safari',
    params: [
      { key: 'url', label: 'URL', type: 'text', required: true, default: 'https://' },
    ],
  },
  {
    type: 'createNote',
    label: 'Create Note',
    icon: 'sticky-note',
    description: 'Create a new note',
    params: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'text', default: '' },
    ],
  },
  {
    type: 'sendMessage',
    label: 'Send Message',
    icon: 'message-circle',
    description: 'Send a message',
    params: [
      { key: 'recipient', label: 'To', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'text', required: true },
    ],
  },
  {
    type: 'showNotification',
    label: 'Show Notification',
    icon: 'bell',
    description: 'Display a notification',
    params: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Body', type: 'text', default: '' },
    ],
  },
  {
    type: 'runCommand',
    label: 'Run Terminal Command',
    icon: 'terminal',
    description: 'Execute a shell command',
    params: [
      { key: 'command', label: 'Command', type: 'text', required: true },
    ],
  },
  {
    type: 'setFocusMode',
    label: 'Set Focus Mode',
    icon: 'moon',
    description: 'Enable or disable focus mode',
    params: [
      {
        key: 'mode',
        label: 'Mode',
        type: 'select',
        options: ['Do Not Disturb', 'Work', 'Personal', 'Sleep', 'Off'],
        required: true,
      },
    ],
  },
  {
    type: 'playPauseMusic',
    label: 'Play/Pause Music',
    icon: 'music',
    description: 'Toggle music playback',
    params: [
      {
        key: 'action',
        label: 'Action',
        type: 'select',
        options: ['toggle', 'play', 'pause', 'next', 'previous'],
        default: 'toggle',
      },
    ],
  },
  {
    type: 'getWeather',
    label: 'Get Weather',
    icon: 'cloud-sun',
    description: 'Get current weather conditions',
    params: [
      { key: 'location', label: 'Location', type: 'text', default: 'current' },
    ],
  },
  {
    type: 'wait',
    label: 'Wait / Delay',
    icon: 'clock',
    description: 'Pause execution for a duration',
    params: [
      { key: 'seconds', label: 'Seconds', type: 'number', required: true, default: 1 },
    ],
  },
  {
    type: 'showDialog',
    label: 'Show Dialog',
    icon: 'message-square',
    description: 'Display an alert dialog',
    params: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'text', required: true },
      { key: 'buttons', label: 'Buttons', type: 'text', default: 'OK' },
    ],
  },
];

// Pre-made shortcuts gallery
export const GALLERY_SHORTCUTS: Omit<Shortcut, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Morning Routine',
    description: 'Open apps and show weather for your morning',
    icon: 'sunrise',
    color: '#FF9500',
    enabled: true,
    actions: [
      { id: 'a1', type: 'openApp', label: 'Open Calendar', params: { appId: 'calendar' }, position: { x: 100, y: 50 } },
      { id: 'a2', type: 'getWeather', label: 'Get Weather', params: { location: 'current' }, position: { x: 100, y: 150 } },
      { id: 'a3', type: 'openApp', label: 'Open Mail', params: { appId: 'mail' }, position: { x: 100, y: 250 } },
    ],
    connections: [{ from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' }],
    trigger: { type: 'scheduled', value: '0 7 * * *' },
  },
  {
    name: 'Quick Note',
    description: 'Create a new note instantly',
    icon: 'edit-3',
    color: '#FFCC00',
    enabled: true,
    actions: [
      { id: 'a1', type: 'createNote', label: 'Create Note', params: { title: 'Quick Note', content: '' }, position: { x: 100, y: 100 } },
    ],
    connections: [],
    trigger: { type: 'keyboard', value: 'Cmd+Shift+N' },
  },
  {
    name: 'Focus Mode',
    description: 'Enable DND and close distracting apps',
    icon: 'moon',
    color: '#5856D6',
    enabled: true,
    actions: [
      { id: 'a1', type: 'setFocusMode', label: 'Enable DND', params: { mode: 'Do Not Disturb' }, position: { x: 100, y: 50 } },
      { id: 'a2', type: 'showNotification', label: 'Notify', params: { title: 'Focus Mode', body: 'Focus mode enabled' }, position: { x: 100, y: 150 } },
    ],
    connections: [{ from: 'a1', to: 'a2' }],
    trigger: { type: 'keyboard', value: 'Cmd+Shift+F' },
  },
  {
    name: 'Launch Dev Environment',
    description: 'Open terminal and start dev server',
    icon: 'code',
    color: '#34C759',
    enabled: true,
    actions: [
      { id: 'a1', type: 'openApp', label: 'Open Terminal', params: { appId: 'terminal' }, position: { x: 100, y: 50 } },
      { id: 'a2', type: 'wait', label: 'Wait', params: { seconds: 1 }, position: { x: 100, y: 150 } },
      { id: 'a3', type: 'runCommand', label: 'Run Dev', params: { command: 'npm run dev' }, position: { x: 100, y: 250 } },
    ],
    connections: [{ from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' }],
    trigger: { type: 'keyboard', value: 'Cmd+Shift+D' },
  },
  {
    name: 'Music Break',
    description: 'Play music and set a timer',
    icon: 'headphones',
    color: '#FF2D55',
    enabled: true,
    actions: [
      { id: 'a1', type: 'playPauseMusic', label: 'Play Music', params: { action: 'play' }, position: { x: 100, y: 50 } },
      { id: 'a2', type: 'wait', label: 'Wait 5 min', params: { seconds: 300 }, position: { x: 100, y: 150 } },
      { id: 'a3', type: 'playPauseMusic', label: 'Pause', params: { action: 'pause' }, position: { x: 100, y: 250 } },
      { id: 'a4', type: 'showNotification', label: 'Break Over', params: { title: 'Break Over', body: 'Time to get back to work!' }, position: { x: 100, y: 350 } },
    ],
    connections: [{ from: 'a1', to: 'a2' }, { from: 'a2', to: 'a3' }, { from: 'a3', to: 'a4' }],
  },
  {
    name: 'Share to Social',
    description: 'Open Safari to share content',
    icon: 'share',
    color: '#007AFF',
    enabled: true,
    actions: [
      { id: 'a1', type: 'openUrl', label: 'Open X', params: { url: 'https://x.com/compose/tweet' }, position: { x: 100, y: 100 } },
    ],
    connections: [],
    trigger: { type: 'keyboard', value: 'Cmd+Shift+S' },
  },
];

const STORAGE_KEY = 'zos-shortcuts';

interface ShortcutsContextType {
  shortcuts: Shortcut[];
  createShortcut: (shortcut: Omit<Shortcut, 'id' | 'createdAt' | 'updatedAt'>) => Shortcut;
  updateShortcut: (id: string, updates: Partial<Shortcut>) => void;
  deleteShortcut: (id: string) => void;
  duplicateShortcut: (id: string) => Shortcut | null;
  runShortcut: (id: string) => Promise<void>;
  importShortcut: (json: string) => Shortcut | null;
  exportShortcut: (id: string) => string | null;
  addFromGallery: (index: number) => Shortcut;
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export const ShortcutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logger.error('Failed to load shortcuts:', e);
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
    } catch (e) {
      logger.error('Failed to save shortcuts:', e);
    }
  }, [shortcuts]);

  const createShortcut = useCallback((shortcut: Omit<Shortcut, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newShortcut: Shortcut = {
      ...shortcut,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setShortcuts(prev => [newShortcut, ...prev]);
    return newShortcut;
  }, []);

  const updateShortcut = useCallback((id: string, updates: Partial<Shortcut>) => {
    setShortcuts(prev => prev.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
    ));
  }, []);

  const deleteShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  const duplicateShortcut = useCallback((id: string) => {
    const original = shortcuts.find(s => s.id === id);
    if (!original) return null;

    const now = Date.now();
    const duplicate: Shortcut = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      // Generate new IDs for actions
      actions: original.actions.map(a => ({ ...a, id: generateId() })),
    };
    // Update connection references
    const idMap = new Map<string, string>();
    original.actions.forEach((a, i) => {
      idMap.set(a.id, duplicate.actions[i].id);
    });
    duplicate.connections = original.connections.map(c => ({
      from: idMap.get(c.from) || c.from,
      to: idMap.get(c.to) || c.to,
    }));

    setShortcuts(prev => [duplicate, ...prev]);
    return duplicate;
  }, [shortcuts]);

  const runShortcut = useCallback(async (id: string) => {
    const shortcut = shortcuts.find(s => s.id === id);
    if (!shortcut || !shortcut.enabled) return;

    logger.info(`Running shortcut: ${shortcut.name}`);

    // Build execution order from connections (topological sort)
    const executed = new Set<string>();
    const actionMap = new Map(shortcut.actions.map(a => [a.id, a]));

    // Find start nodes (no incoming connections)
    const hasIncoming = new Set(shortcut.connections.map(c => c.to));
    const startNodes = shortcut.actions.filter(a => !hasIncoming.has(a.id));

    const executeAction = async (action: ShortcutAction) => {
      if (executed.has(action.id)) return;
      executed.add(action.id);

      logger.info(`Executing action: ${action.type}`, action.params);

      // Simulate action execution
      switch (action.type) {
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, (action.params.seconds as number) * 1000));
          break;
        case 'showNotification':
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(action.params.title as string, { body: action.params.body as string });
          }
          break;
        case 'showDialog':
          alert(`${action.params.title}\n\n${action.params.message}`);
          break;
        // Other actions would integrate with the actual zOS window manager
        default:
          // Placeholder for app integration
          break;
      }

      // Execute next actions
      const nextConnections = shortcut.connections.filter(c => c.from === action.id);
      for (const conn of nextConnections) {
        const nextAction = actionMap.get(conn.to);
        if (nextAction) {
          await executeAction(nextAction);
        }
      }
    };

    // Execute from all start nodes
    for (const startNode of startNodes) {
      await executeAction(startNode);
    }

    // Execute any orphaned actions
    for (const action of shortcut.actions) {
      if (!executed.has(action.id)) {
        await executeAction(action);
      }
    }
  }, [shortcuts]);

  const importShortcut = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      // Validate basic structure
      if (!parsed.name || !parsed.actions) {
        throw new Error('Invalid shortcut format');
      }
      const now = Date.now();
      const imported: Shortcut = {
        ...parsed,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        // Regenerate action IDs
        actions: parsed.actions.map((a: ShortcutAction) => ({ ...a, id: generateId() })),
      };
      setShortcuts(prev => [imported, ...prev]);
      return imported;
    } catch (e) {
      logger.error('Failed to import shortcut:', e);
      return null;
    }
  }, []);

  const exportShortcut = useCallback((id: string) => {
    const shortcut = shortcuts.find(s => s.id === id);
    if (!shortcut) return null;

    const exportData = {
      name: shortcut.name,
      description: shortcut.description,
      icon: shortcut.icon,
      color: shortcut.color,
      actions: shortcut.actions,
      connections: shortcut.connections,
      trigger: shortcut.trigger,
      enabled: shortcut.enabled,
    };
    return JSON.stringify(exportData, null, 2);
  }, [shortcuts]);

  const addFromGallery = useCallback((index: number) => {
    const template = GALLERY_SHORTCUTS[index];
    if (!template) throw new Error('Invalid gallery index');
    return createShortcut(template);
  }, [createShortcut]);

  return (
    <ShortcutsContext.Provider value={{
      shortcuts,
      createShortcut,
      updateShortcut,
      deleteShortcut,
      duplicateShortcut,
      runShortcut,
      importShortcut,
      exportShortcut,
      addFromGallery,
    }}>
      {children}
    </ShortcutsContext.Provider>
  );
};

export const useShortcuts = (): ShortcutsContextType => {
  const context = useContext(ShortcutsContext);
  if (!context) {
    throw new Error('useShortcuts must be used within a ShortcutsProvider');
  }
  return context;
};
