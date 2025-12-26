/**
 * useApp Hook
 *
 * Provides app lifecycle management and window control for zOS applications.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContext, AppManifest } from '../types';

interface UseAppOptions {
  /** App manifest */
  manifest: AppManifest;

  /** Callback when window should close */
  onClose?: () => void;

  /** Callback when window is focused */
  onFocus?: () => void;

  /** Callback when window is blurred */
  onBlur?: () => void;
}

/**
 * useApp - Primary hook for zOS app lifecycle management
 *
 * @example
 * ```tsx
 * const app = useApp({
 *   manifest: {
 *     identifier: 'ai.hanzo.myapp',
 *     name: 'My App',
 *     version: '1.0.0'
 *   },
 *   onClose: () => console.log('App closed')
 * });
 *
 * return (
 *   <button onClick={app.minimize}>Minimize</button>
 * );
 * ```
 */
export function useApp(options: UseAppOptions): AppContext {
  const { manifest, onClose, onFocus, onBlur } = options;

  // Window state
  const [isActive, setIsActive] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTiled, setIsTiled] = useState<'left' | 'right' | null>(null);

  // Handle focus events
  useEffect(() => {
    const handleFocus = () => {
      setIsActive(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsActive(false);
      onBlur?.();
    };

    // Listen for custom zOS events
    const handleZOSFocus = (e: CustomEvent) => {
      if (e.detail?.app === manifest.identifier) {
        handleFocus();
      }
    };

    const handleZOSBlur = (e: CustomEvent) => {
      if (e.detail?.app === manifest.identifier) {
        handleBlur();
      }
    };

    window.addEventListener('zos:app-focus', handleZOSFocus as EventListener);
    window.addEventListener('zos:app-blur', handleZOSBlur as EventListener);

    return () => {
      window.removeEventListener('zos:app-focus', handleZOSFocus as EventListener);
      window.removeEventListener('zos:app-blur', handleZOSBlur as EventListener);
    };
  }, [manifest.identifier, onFocus, onBlur]);

  // Window control methods
  const close = useCallback(() => {
    window.dispatchEvent(new CustomEvent('zos:app-close', {
      detail: { app: manifest.identifier }
    }));
    onClose?.();
  }, [manifest.identifier, onClose]);

  const minimize = useCallback(() => {
    setIsMinimized(true);
    setIsMaximized(false);
    setIsTiled(null);
    window.dispatchEvent(new CustomEvent('zos:hide-app', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier]);

  const maximize = useCallback(() => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
    setIsTiled(null);
    window.dispatchEvent(new CustomEvent('zos:window-zoom', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier, isMaximized]);

  const focus = useCallback(() => {
    setIsActive(true);
    setIsMinimized(false);
    window.dispatchEvent(new CustomEvent('zos:app-activate', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier]);

  const tileLeft = useCallback(() => {
    setIsTiled('left');
    setIsMaximized(false);
    setIsMinimized(false);
    window.dispatchEvent(new CustomEvent('zos:window-left', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier]);

  const tileRight = useCallback(() => {
    setIsTiled('right');
    setIsMaximized(false);
    setIsMinimized(false);
    window.dispatchEvent(new CustomEvent('zos:window-right', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier]);

  const restore = useCallback(() => {
    setIsMinimized(false);
    setIsMaximized(false);
    setIsTiled(null);
    window.dispatchEvent(new CustomEvent('zos:window-restore', {
      detail: { app: manifest.identifier }
    }));
  }, [manifest.identifier]);

  // Memoize window state object
  const windowState = useMemo(() => ({
    isMinimized,
    isMaximized,
    isTiled,
  }), [isMinimized, isMaximized, isTiled]);

  return {
    manifest,
    isActive,
    window: windowState,
    close,
    minimize,
    maximize,
    focus,
    tileLeft,
    tileRight,
    restore,
  };
}

export default useApp;
