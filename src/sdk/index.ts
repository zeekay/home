/**
 * zOS SDK
 *
 * The official SDK for building zOS applications. Provides components,
 * hooks, and utilities for creating native-feeling apps that integrate
 * seamlessly with the zOS desktop environment.
 *
 * @example
 * ```tsx
 * import { ZOSApp, useSDK, AppManifest } from '@/sdk';
 *
 * const manifest: AppManifest = {
 *   identifier: 'ai.hanzo.myapp',
 *   name: 'My App',
 *   version: '1.0.0',
 * };
 *
 * function MyApp({ onClose }) {
 *   return (
 *     <ZOSApp manifest={manifest} onClose={onClose}>
 *       <MyAppContent />
 *     </ZOSApp>
 *   );
 * }
 *
 * function MyAppContent() {
 *   const { notifications, storage } = useSDK();
 *
 *   const handleSave = () => {
 *     storage.set('lastSaved', Date.now());
 *     notifications.show({ title: 'Saved!' });
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // App Manifest
  AppManifest,
  AppIcon,
  AppCategory,
  AppPermission,
  AppDependency,
  WindowConfig,
  WindowType,

  // API Types
  NotificationOptions,
  NotificationAction,
  FileEntry,
  FileDialogOptions,
  FileFilter,
  StorageOptions,
  ClipboardData,
  KeyboardOptions,

  // Hook Return Types
  AppContext,
  NotificationAPI,
  StorageAPI,
  FileSystemAPI,
  ClipboardAPI,
  KeyboardAPI,

  // Events
  AppLifecycleEvent,
  WindowEvent,
  SystemEvent,
} from './types';

// ============================================================================
// Components
// ============================================================================

export { ZOSApp, useSDK } from './components';

// ============================================================================
// Hooks
// ============================================================================

export {
  useApp,
  useNotifications,
  useStorage,
  useFileSystem,
  useClipboard,
  useKeyboard,
} from './hooks';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Create a new app manifest with defaults
 */
export function createManifest(
  partial: Partial<import('./types').AppManifest> & Pick<import('./types').AppManifest, 'identifier' | 'name'>
): import('./types').AppManifest {
  return {
    version: '1.0.0',
    category: 'other',
    permissions: [],
    dependencies: [],
    window: {
      type: 'default',
      defaultSize: { width: 700, height: 500 },
      resizable: true,
      showInDock: true,
      multipleInstances: false,
      background: 'blur',
    },
    main: 'index.tsx',
    ...partial,
  };
}

/**
 * Version information
 */
export const SDK_VERSION = '1.0.0';

/**
 * Minimum zOS version required
 */
export const MIN_ZOS_VERSION = '1.0.0';
