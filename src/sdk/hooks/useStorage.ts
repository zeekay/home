/**
 * useStorage Hook
 *
 * Provides persistent storage capabilities for zOS applications.
 */

import { useCallback, useMemo } from 'react';
import { StorageAPI, StorageOptions } from '../types';

const DEFAULT_OPTIONS: StorageOptions = {
  type: 'local',
  namespace: 'zos-app',
};

/**
 * useStorage - Persistent key-value storage for your app
 *
 * @example
 * ```tsx
 * const storage = useStorage<UserPreferences>({
 *   namespace: 'ai.hanzo.myapp',
 *   type: 'local'
 * });
 *
 * // Save preferences
 * storage.set('theme', 'dark');
 *
 * // Load preferences
 * const theme = storage.get('theme');
 * ```
 */
export function useStorage<T = unknown>(
  options: Partial<StorageOptions> = {}
): StorageAPI<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const prefix = `zos:${opts.namespace}:`;

  // Get the appropriate storage backend
  const storage = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    switch (opts.type) {
      case 'session':
        return window.sessionStorage;
      case 'sync':
        // For now, sync storage uses localStorage
        // Future: integrate with cloud sync
        return window.localStorage;
      case 'local':
      default:
        return window.localStorage;
    }
  }, [opts.type]);

  const get = useCallback((key: string): T | null => {
    if (!storage) return null;
    try {
      const item = storage.getItem(`${prefix}${key}`);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }, [storage, prefix]);

  const set = useCallback((key: string, value: T): void => {
    if (!storage) return;
    try {
      storage.setItem(`${prefix}${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('[zOS Storage] Failed to save:', e);
    }
  }, [storage, prefix]);

  const remove = useCallback((key: string): void => {
    if (!storage) return;
    storage.removeItem(`${prefix}${key}`);
  }, [storage, prefix]);

  const clear = useCallback((): void => {
    if (!storage) return;
    // Only clear items with our namespace prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }, [storage, prefix]);

  const keys = useCallback((): string[] => {
    if (!storage) return [];
    const result: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) {
        result.push(key.slice(prefix.length));
      }
    }
    return result;
  }, [storage, prefix]);

  const has = useCallback((key: string): boolean => {
    if (!storage) return false;
    return storage.getItem(`${prefix}${key}`) !== null;
  }, [storage, prefix]);

  return {
    get,
    set,
    remove,
    clear,
    keys,
    has,
  };
}

export default useStorage;
