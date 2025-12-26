/**
 * useKeyboard Hook
 *
 * Provides keyboard shortcut management for zOS applications.
 */

import { useCallback, useEffect, useRef } from 'react';
import { KeyboardAPI, KeyboardOptions } from '../types';

interface RegisteredShortcut {
  shortcut: string;
  callback: () => void;
  options: KeyboardOptions;
}

/**
 * Parse a shortcut string into its components
 */
function parseShortcut(shortcut: string): { key: string; meta: boolean; ctrl: boolean; alt: boolean; shift: boolean } {
  const parts = shortcut.toLowerCase().split('+').map(p => p.trim());
  const key = parts[parts.length - 1];

  return {
    key,
    meta: parts.includes('cmd') || parts.includes('meta') || parts.includes('command'),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    alt: parts.includes('alt') || parts.includes('option'),
    shift: parts.includes('shift'),
  };
}

/**
 * Check if a keyboard event matches a shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ReturnType<typeof parseShortcut>): boolean {
  const key = event.key.toLowerCase();

  // Handle special keys
  const keyMatch =
    key === shortcut.key ||
    event.code.toLowerCase() === shortcut.key ||
    event.code.toLowerCase() === `key${shortcut.key}`;

  return (
    keyMatch &&
    event.metaKey === shortcut.meta &&
    event.ctrlKey === shortcut.ctrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift
  );
}

/**
 * useKeyboard - Register keyboard shortcuts for your app
 *
 * @example
 * ```tsx
 * const keyboard = useKeyboard();
 *
 * useEffect(() => {
 *   const unregister = keyboard.register('cmd+s', () => {
 *     saveDocument();
 *   }, { preventDefault: true, description: 'Save document' });
 *
 *   return unregister;
 * }, []);
 * ```
 */
export function useKeyboard(): KeyboardAPI {
  const shortcuts = useRef<Map<string, RegisteredShortcut>>(new Map());
  const isAppFocused = useRef(true);

  // Track app focus state
  useEffect(() => {
    const handleFocus = () => {
      isAppFocused.current = true;
    };

    const handleBlur = () => {
      isAppFocused.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields (unless overridden)
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' ||
                           target.tagName === 'TEXTAREA' ||
                           target.isContentEditable;

      shortcuts.current.forEach((registered) => {
        const parsed = parseShortcut(registered.shortcut);

        if (matchesShortcut(event, parsed)) {
          // Check focus requirement
          if (registered.options.whenFocused && !isAppFocused.current) {
            return;
          }

          // Skip if in input field (standard shortcuts like Cmd+C still work)
          if (isInputField && !event.metaKey && !event.ctrlKey) {
            return;
          }

          if (registered.options.preventDefault) {
            event.preventDefault();
          }

          registered.callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const register = useCallback((
    shortcut: string,
    callback: () => void,
    options: KeyboardOptions = {}
  ): (() => void) => {
    const id = `${shortcut}-${Date.now()}`;

    shortcuts.current.set(id, {
      shortcut,
      callback,
      options: {
        whenFocused: true,
        preventDefault: false,
        ...options,
      },
    });

    // Dispatch event for help menu registration
    if (options.description) {
      window.dispatchEvent(new CustomEvent('zos:keyboard-shortcut-register', {
        detail: { shortcut, description: options.description }
      }));
    }

    // Return unregister function
    return () => {
      shortcuts.current.delete(id);
    };
  }, []);

  const unregisterAll = useCallback((): void => {
    shortcuts.current.clear();
  }, []);

  return {
    register,
    unregisterAll,
  };
}

export default useKeyboard;
