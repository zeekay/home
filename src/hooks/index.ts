// Window management - local implementation matching @hanzo/ui/desktop interface
// When @hanzo/ui/desktop is published with these exports, switch to:
// export { useWindowManager, useDesktopSettings, useOverlayManager, useKeyboardShortcuts } from '@hanzo/ui/desktop'
export { useWindowManager } from './useWindowManager';
export type { AppType, WindowState, WindowManager, WindowGeometry } from './useWindowManager';
export { ALL_APPS } from './useWindowManager';

// Desktop settings - local implementation
export { useDesktopSettings } from './useDesktopSettings';
export type {
  DesktopSettings,
  DesktopSettingsActions,
  ColorScheme,
  FontSize,
  DockPosition
} from './useDesktopSettings';

// Overlay management - local implementation
export { useOverlays } from './useOverlays';
export type { OverlayState, OverlayActions } from './useOverlays';

// Keyboard shortcuts - local implementation
export { useKeyboardShortcuts, formatShortcut } from './useKeyboardShortcuts';
export type { KeyboardShortcut } from './useKeyboardShortcuts';

// Other local hooks
export { useGitHubStats } from './useGitHubStats';
export { useStackOverflow } from './useStackOverflow';
export { useTerminal } from './useTerminal';
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
