/**
 * zOS SDK Type Definitions
 *
 * Core types for building zOS applications. These define the structure
 * of app manifests, permissions, and API interfaces.
 */

// ============================================================================
// App Manifest Types
// ============================================================================

/**
 * App manifest structure - defines metadata and capabilities for a zOS app.
 * This should be in manifest.json at the root of your .app bundle.
 */
export interface AppManifest {
  /** Unique bundle identifier (e.g., "ai.hanzo.calculator") */
  identifier: string;

  /** Display name shown in UI */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Short description of the app */
  description?: string;

  /** Author/company name */
  author?: string;

  /** App icon configuration */
  icon?: AppIcon;

  /** Minimum zOS version required */
  minOSVersion?: string;

  /** App category for organization */
  category?: AppCategory;

  /** Permissions requested by the app */
  permissions?: AppPermission[];

  /** External dependencies */
  dependencies?: AppDependency[];

  /** Window configuration */
  window?: WindowConfig;

  /** Entry point file (default: "index.tsx") */
  main?: string;

  /** Custom app metadata */
  meta?: Record<string, unknown>;
}

/**
 * App icon configuration
 */
export interface AppIcon {
  /** SVG path or component name */
  type: 'svg' | 'component' | 'image';

  /** Source path or component reference */
  source: string;

  /** Background gradient (CSS gradient string) */
  background?: string;

  /** Rounded corner radius */
  borderRadius?: number;
}

/**
 * App categories
 */
export type AppCategory =
  | 'productivity'
  | 'development'
  | 'utilities'
  | 'entertainment'
  | 'communication'
  | 'finance'
  | 'system'
  | 'other';

/**
 * App permissions - capabilities the app requests
 */
export type AppPermission =
  | 'files.read'        // Read files from file system
  | 'files.write'       // Write files to file system
  | 'network'           // Make network requests
  | 'notifications'     // Show system notifications
  | 'clipboard'         // Access clipboard
  | 'camera'            // Access camera (future)
  | 'microphone'        // Access microphone (future)
  | 'location'          // Access location (future)
  | 'storage.local'     // Local storage access
  | 'storage.sync'      // Synced storage access
  | 'system.settings'   // Read/modify system settings
  | 'dock.pin'          // Pin to dock
  | 'menu.register'     // Register menu items
  | 'keyboard.global';  // Register global keyboard shortcuts

/**
 * External app dependency
 */
export interface AppDependency {
  /** Bundle identifier of dependency */
  identifier: string;

  /** Minimum version required */
  minVersion?: string;

  /** Is this a required or optional dependency */
  optional?: boolean;
}

/**
 * Window configuration for the app
 */
export interface WindowConfig {
  /** Window type/style */
  type?: WindowType;

  /** Default window size */
  defaultSize?: { width: number; height: number };

  /** Minimum window size */
  minSize?: { width: number; height: number };

  /** Maximum window size */
  maxSize?: { width: number; height: number };

  /** Default position (x, y from top-left) */
  defaultPosition?: { x: number; y: number };

  /** Is the window resizable */
  resizable?: boolean;

  /** Show in taskbar/dock when open */
  showInDock?: boolean;

  /** Allow multiple instances */
  multipleInstances?: boolean;

  /** Window background style */
  background?: 'solid' | 'blur' | 'transparent';
}

/**
 * Window style types
 */
export type WindowType =
  | 'default'    // Standard macOS-style window
  | 'terminal'   // Terminal-style (dark)
  | 'safari'     // Browser-style
  | 'itunes'     // Media player style
  | 'textpad'    // Text editor style
  | 'system'     // System dialog style
  | 'about';     // About dialog style

// ============================================================================
// API Types
// ============================================================================

/**
 * Notification options
 */
export interface NotificationOptions {
  /** Notification title */
  title: string;

  /** Notification body text */
  body?: string;

  /** Icon to display */
  icon?: string;

  /** Duration in milliseconds (0 = persistent) */
  duration?: number;

  /** Notification type/style */
  type?: 'info' | 'success' | 'warning' | 'error';

  /** Actions the user can take */
  actions?: NotificationAction[];

  /** Callback when notification is clicked */
  onClick?: () => void;
}

/**
 * Notification action button
 */
export interface NotificationAction {
  /** Action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Callback when action is clicked */
  onClick: () => void;
}

/**
 * File system entry
 */
export interface FileEntry {
  /** File/folder name */
  name: string;

  /** Full path */
  path: string;

  /** Is this a directory */
  isDirectory: boolean;

  /** File size in bytes (files only) */
  size?: number;

  /** MIME type (files only) */
  mimeType?: string;

  /** Created timestamp */
  created?: Date;

  /** Modified timestamp */
  modified?: Date;
}

/**
 * File open/save dialog options
 */
export interface FileDialogOptions {
  /** Dialog title */
  title?: string;

  /** Default directory */
  defaultPath?: string;

  /** Allowed file types */
  filters?: FileFilter[];

  /** Allow selecting multiple files */
  multiple?: boolean;

  /** Allow selecting directories */
  directory?: boolean;
}

/**
 * File type filter
 */
export interface FileFilter {
  /** Filter name (e.g., "Images") */
  name: string;

  /** File extensions (e.g., ["png", "jpg", "gif"]) */
  extensions: string[];
}

/**
 * Storage options
 */
export interface StorageOptions {
  /** Storage type */
  type: 'local' | 'session' | 'sync';

  /** Namespace for keys (defaults to app identifier) */
  namespace?: string;
}

/**
 * Clipboard data
 */
export interface ClipboardData {
  /** Plain text content */
  text?: string;

  /** HTML content */
  html?: string;

  /** Image data (base64) */
  image?: string;

  /** Files (for file copy operations) */
  files?: FileEntry[];
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * useApp hook return type
 */
export interface AppContext {
  /** App manifest */
  manifest: AppManifest;

  /** Whether app is active/focused */
  isActive: boolean;

  /** Window state */
  window: {
    isMinimized: boolean;
    isMaximized: boolean;
    isTiled: 'left' | 'right' | null;
  };

  /** Close the app window */
  close: () => void;

  /** Minimize the app window */
  minimize: () => void;

  /** Maximize the app window */
  maximize: () => void;

  /** Focus the app window */
  focus: () => void;

  /** Tile window left */
  tileLeft: () => void;

  /** Tile window right */
  tileRight: () => void;

  /** Restore from minimized/maximized/tiled */
  restore: () => void;
}

/**
 * useNotifications hook return type
 */
export interface NotificationAPI {
  /** Show a notification */
  show: (options: NotificationOptions) => string;

  /** Dismiss a notification by ID */
  dismiss: (id: string) => void;

  /** Dismiss all notifications */
  dismissAll: () => void;

  /** Request notification permission */
  requestPermission: () => Promise<boolean>;

  /** Check if notifications are permitted */
  hasPermission: boolean;
}

/**
 * useStorage hook return type
 */
export interface StorageAPI<T = unknown> {
  /** Get a value */
  get: (key: string) => T | null;

  /** Set a value */
  set: (key: string, value: T) => void;

  /** Remove a value */
  remove: (key: string) => void;

  /** Clear all values in namespace */
  clear: () => void;

  /** Get all keys in namespace */
  keys: () => string[];

  /** Check if key exists */
  has: (key: string) => boolean;
}

/**
 * useFileSystem hook return type
 */
export interface FileSystemAPI {
  /** Read file contents */
  readFile: (path: string) => Promise<string | ArrayBuffer>;

  /** Write file contents */
  writeFile: (path: string, content: string | ArrayBuffer) => Promise<void>;

  /** Delete a file */
  deleteFile: (path: string) => Promise<void>;

  /** List directory contents */
  listDirectory: (path: string) => Promise<FileEntry[]>;

  /** Create a directory */
  createDirectory: (path: string) => Promise<void>;

  /** Check if path exists */
  exists: (path: string) => Promise<boolean>;

  /** Get file info */
  stat: (path: string) => Promise<FileEntry | null>;

  /** Show open file dialog */
  showOpenDialog: (options?: FileDialogOptions) => Promise<FileEntry[] | null>;

  /** Show save file dialog */
  showSaveDialog: (options?: FileDialogOptions) => Promise<string | null>;
}

/**
 * useClipboard hook return type
 */
export interface ClipboardAPI {
  /** Read from clipboard */
  read: () => Promise<ClipboardData>;

  /** Write text to clipboard */
  writeText: (text: string) => Promise<void>;

  /** Write HTML to clipboard */
  writeHTML: (html: string) => Promise<void>;

  /** Write image to clipboard */
  writeImage: (imageData: string) => Promise<void>;

  /** Check if clipboard has content */
  hasContent: () => Promise<boolean>;
}

/**
 * useKeyboard hook return type
 */
export interface KeyboardAPI {
  /** Register a keyboard shortcut */
  register: (shortcut: string, callback: () => void, options?: KeyboardOptions) => () => void;

  /** Unregister all shortcuts for this app */
  unregisterAll: () => void;
}

/**
 * Keyboard shortcut options
 */
export interface KeyboardOptions {
  /** Only trigger when app is focused */
  whenFocused?: boolean;

  /** Prevent default browser behavior */
  preventDefault?: boolean;

  /** Description for help menus */
  description?: string;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * App lifecycle events
 */
export type AppLifecycleEvent =
  | 'app:launch'
  | 'app:activate'
  | 'app:deactivate'
  | 'app:close'
  | 'app:hide'
  | 'app:show';

/**
 * Window events
 */
export type WindowEvent =
  | 'window:resize'
  | 'window:move'
  | 'window:minimize'
  | 'window:maximize'
  | 'window:restore'
  | 'window:focus'
  | 'window:blur';

/**
 * System events
 */
export type SystemEvent =
  | 'system:theme-change'
  | 'system:font-size-change'
  | 'system:dock-position-change';
