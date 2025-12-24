/**
 * zOS Window Manager Hook
 *
 * This wraps @hanzo/ui/desktop's useWindowManager with zOS-specific
 * app types and naming conventions for backward compatibility.
 */

import { useWindowManager as useBaseWindowManager } from '@hanzo/ui/desktop';
import type { AppType } from './index';
import { ALL_APPS } from './index';

export interface ZOSWindowManager {
  // State - uses zOS naming
  windows: Record<AppType, boolean>;
  activeApp: AppType;
  openApps: AppType[];

  // Actions
  openWindow: (app: AppType) => void;
  closeWindow: (app: AppType) => void;
  toggleWindow: (app: AppType) => void;
  focusWindow: (app: AppType) => void;
  closeAllWindows: () => void;

  // Helpers
  isOpen: (app: AppType) => boolean;
}

export function useZOSWindowManager(): ZOSWindowManager {
  const base = useBaseWindowManager(ALL_APPS);

  return {
    // Map base properties to zOS naming
    windows: base.windows as Record<AppType, boolean>,
    activeApp: (base.activeWindow || 'Finder') as AppType,
    openApps: base.openWindows as AppType[],

    // Actions pass through with proper typing
    openWindow: (app: AppType) => base.openWindow(app),
    closeWindow: (app: AppType) => base.closeWindow(app),
    toggleWindow: (app: AppType) => base.toggleWindow(app),
    focusWindow: (app: AppType) => base.focusWindow(app),
    closeAllWindows: base.closeAllWindows,

    // Helpers
    isOpen: (app: AppType) => base.isOpen(app),
  };
}
