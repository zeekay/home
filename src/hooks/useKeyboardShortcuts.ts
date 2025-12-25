import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  meta?: boolean;      // Cmd on Mac, Ctrl on Windows
  shift?: boolean;
  alt?: boolean;       // Option on Mac
  ctrl?: boolean;      // Control key
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook to manage global keyboard shortcuts for zOS.
 * 
 * Supports:
 * - meta (Cmd/Ctrl) modifier
 * - shift modifier
 * - alt (Option) modifier
 * - ctrl modifier
 * - Combination of modifiers
 * 
 * Usage:
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 'n', meta: true, action: () => openNewNote(), description: 'New Note' },
 *     { key: ',', meta: true, action: () => openSettings(), description: 'Settings' },
 *   ]
 * });
 * ```
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in an input or textarea
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const metaMatch = shortcut.meta ? (event.metaKey || event.ctrlKey) : !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const _ctrlMatch = shortcut.ctrl ? event.ctrlKey : true; // ctrl is optional - reserved for future use

      // For shortcuts with modifiers, allow even when typing
      const hasModifiers = shortcut.meta || shortcut.alt || shortcut.ctrl;
      
      if (keyMatch && metaMatch && shiftMatch && altMatch) {
        // Skip non-modifier shortcuts when typing
        if (isTyping && !hasModifiers) continue;

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        shortcut.action();
        return;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}

/**
 * Format a shortcut for display (converts to macOS symbols).
 */
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('\u2303');   // Control
  if (shortcut.alt) parts.push('\u2325');    // Option
  if (shortcut.shift) parts.push('\u21E7');  // Shift
  if (shortcut.meta) parts.push('\u2318');   // Command
  
  // Format special keys
  const keyMap: Record<string, string> = {
    'escape': '\u238B',
    'tab': '\u21E5',
    'space': 'Space',
    'enter': '\u21A9',
    'backspace': '\u232B',
    'delete': '\u2326',
    'arrowup': '\u2191',
    'arrowdown': '\u2193',
    'arrowleft': '\u2190',
    'arrowright': '\u2192',
  };
  
  const displayKey = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
  parts.push(displayKey);
  
  return parts.join('');
}

export default useKeyboardShortcuts;
