/**
 * ZOSApp Component
 *
 * Base wrapper component for zOS applications. Provides standard window
 * chrome, lifecycle management, and SDK context.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import ZWindow from '@/components/ZWindow';
import { AppManifest, WindowType, AppContext } from '../types';
import { useApp } from '../hooks/useApp';
import { useNotifications } from '../hooks/useNotifications';
import { useStorage } from '../hooks/useStorage';
import { useFileSystem } from '../hooks/useFileSystem';
import { useClipboard } from '../hooks/useClipboard';
import { useKeyboard } from '../hooks/useKeyboard';

// ============================================================================
// SDK Context
// ============================================================================

interface ZOSSDKContext {
  app: AppContext;
  notifications: ReturnType<typeof useNotifications>;
  storage: ReturnType<typeof useStorage>;
  fs: ReturnType<typeof useFileSystem>;
  clipboard: ReturnType<typeof useClipboard>;
  keyboard: ReturnType<typeof useKeyboard>;
}

const SDKContext = createContext<ZOSSDKContext | null>(null);

/**
 * useSDK - Access all SDK functionality from within a ZOSApp
 *
 * @example
 * ```tsx
 * function MyAppContent() {
 *   const { app, notifications, fs } = useSDK();
 *
 *   const handleSave = async () => {
 *     await fs.writeFile('/documents/file.txt', 'content');
 *     notifications.show({ title: 'Saved!' });
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useSDK(): ZOSSDKContext {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within a ZOSApp component');
  }
  return context;
}

// ============================================================================
// ZOSApp Component
// ============================================================================

interface ZOSAppProps {
  /** App manifest defining metadata and capabilities */
  manifest: AppManifest;

  /** App content */
  children: ReactNode;

  /** Close callback */
  onClose: () => void;

  /** Focus callback */
  onFocus?: () => void;

  /** Custom title bar controls */
  customControls?: ReactNode;

  /** Additional class names for the window */
  className?: string;
}

/**
 * ZOSApp - Base wrapper for building zOS applications
 *
 * Provides:
 * - Standard macOS-style window chrome
 * - App lifecycle management
 * - SDK context with all hooks pre-initialized
 *
 * @example
 * ```tsx
 * const manifest: AppManifest = {
 *   identifier: 'ai.hanzo.myapp',
 *   name: 'My App',
 *   version: '1.0.0',
 *   window: {
 *     defaultSize: { width: 600, height: 400 },
 *     resizable: true,
 *   }
 * };
 *
 * function MyApp({ onClose }) {
 *   return (
 *     <ZOSApp manifest={manifest} onClose={onClose}>
 *       <MyAppContent />
 *     </ZOSApp>
 *   );
 * }
 * ```
 */
export function ZOSApp({
  manifest,
  children,
  onClose,
  onFocus,
  customControls,
  className,
}: ZOSAppProps): JSX.Element {
  // Initialize all SDK hooks
  const app = useApp({ manifest, onClose, onFocus });
  const notifications = useNotifications();
  const storage = useStorage({ namespace: manifest.identifier });
  const fs = useFileSystem();
  const clipboard = useClipboard();
  const keyboard = useKeyboard();

  // Memoize SDK context
  const sdkContext = useMemo<ZOSSDKContext>(() => ({
    app,
    notifications,
    storage,
    fs,
    clipboard,
    keyboard,
  }), [app, notifications, storage, fs, clipboard, keyboard]);

  // Get window configuration from manifest
  const windowConfig = manifest.window || {};
  const windowType = (windowConfig.type || 'default') as WindowType;
  const defaultSize = windowConfig.defaultSize || { width: 700, height: 500 };
  const defaultPosition = windowConfig.defaultPosition;
  const resizable = windowConfig.resizable !== false;

  return (
    <SDKContext.Provider value={sdkContext}>
      <ZWindow
        title={manifest.name}
        onClose={onClose}
        onFocus={onFocus}
        initialSize={defaultSize}
        initialPosition={defaultPosition}
        windowType={windowType}
        resizable={resizable}
        customControls={customControls}
        className={className}
      >
        {children}
      </ZWindow>
    </SDKContext.Provider>
  );
}

export default ZOSApp;
