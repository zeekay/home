import { useReducer, useCallback, useMemo, useEffect } from 'react';

// App types for window management
export type AppType =
  | 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar'
  | 'System Preferences' | 'Photos' | 'FaceTime' | 'TextEdit' | 'Notes'
  | 'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI'
  | 'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies'
  | 'App Store' | 'Xcode';

// All app types as array for iteration
export const ALL_APPS: AppType[] = [
  'Finder', 'Terminal', 'Safari', 'Music', 'Mail', 'Calendar',
  'System Preferences', 'Photos', 'FaceTime', 'TextEdit', 'Notes',
  'GitHub Stats', 'Messages', 'Activity Monitor', 'Hanzo AI',
  'Lux Wallet', 'Zoo', 'Calculator', 'Clock', 'Weather', 'Stickies',
  'App Store', 'Xcode'
];

// Window state - which windows are open
export type WindowState = Record<AppType, boolean>;

// Window geometry for tiling/maximize
export interface WindowGeometry {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isTiled: 'left' | 'right' | null;
}

// Screen layout constants
const MENU_BAR_HEIGHT = 25;
const DOCK_HEIGHT = 70;

// Get available screen dimensions
function getScreenDimensions() {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080, availableHeight: 985 };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const availableHeight = height - MENU_BAR_HEIGHT - DOCK_HEIGHT;
  return { width, height, availableHeight };
}

// Default window geometry
function getDefaultGeometry(): WindowGeometry {
  return {
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    isMinimized: false,
    isMaximized: false,
    isTiled: null,
  };
}

// Actions for reducer
type WindowAction =
  | { type: 'OPEN'; app: AppType }
  | { type: 'CLOSE'; app: AppType }
  | { type: 'TOGGLE'; app: AppType }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_ACTIVE'; app: AppType }
  | { type: 'TILE_LEFT'; app: AppType }
  | { type: 'TILE_RIGHT'; app: AppType }
  | { type: 'MAXIMIZE'; app: AppType }
  | { type: 'MINIMIZE'; app: AppType }
  | { type: 'RESTORE'; app: AppType }
  | { type: 'HIDE_OTHERS' }
  | { type: 'SHOW_ALL' }
  | { type: 'UPDATE_GEOMETRY'; app: AppType; geometry: Partial<WindowGeometry> };

// Combined state with active app and window geometries
interface WindowManagerState {
  windows: WindowState;
  activeApp: AppType | null;
  windowGeometries: Partial<Record<AppType, WindowGeometry>>;
  previousGeometries: Partial<Record<AppType, WindowGeometry>>;
  hiddenWindows: Set<AppType>;
}

// Initial state - all windows closed
const initialWindowState: WindowState = ALL_APPS.reduce((acc, app) => {
  acc[app] = false;
  return acc;
}, {} as WindowState);

const initialState: WindowManagerState = {
  windows: initialWindowState,
  activeApp: null,
  windowGeometries: {},
  previousGeometries: {},
  hiddenWindows: new Set(),
};

// Reducer function
function windowReducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
  switch (action.type) {
    case 'OPEN': {
      const newGeometries = { ...state.windowGeometries };
      if (!newGeometries[action.app]) {
        newGeometries[action.app] = getDefaultGeometry();
      }
      // Unminimize if minimized
      if (newGeometries[action.app]?.isMinimized) {
        newGeometries[action.app] = {
          ...newGeometries[action.app]!,
          isMinimized: false,
        };
      }
      const newHidden = new Set(state.hiddenWindows);
      newHidden.delete(action.app);
      return {
        ...state,
        windows: { ...state.windows, [action.app]: true },
        activeApp: action.app,
        windowGeometries: newGeometries,
        hiddenWindows: newHidden,
      };
    }

    case 'CLOSE': {
      const newWindows = { ...state.windows, [action.app]: false };
      let newActiveApp = state.activeApp;

      if (state.activeApp === action.app) {
        const openApps = ALL_APPS.filter(app => newWindows[app]);
        newActiveApp = openApps.length > 0 ? openApps[0] : null;
      }

      // Clean up geometry
      const newGeometries = { ...state.windowGeometries };
      delete newGeometries[action.app];
      const newPrevious = { ...state.previousGeometries };
      delete newPrevious[action.app];

      return {
        ...state,
        windows: newWindows,
        activeApp: newActiveApp,
        windowGeometries: newGeometries,
        previousGeometries: newPrevious,
      };
    }

    case 'TOGGLE': {
      const isOpen = state.windows[action.app];
      if (isOpen) {
        return windowReducer(state, { type: 'CLOSE', app: action.app });
      }
      return windowReducer(state, { type: 'OPEN', app: action.app });
    }

    case 'CLOSE_ALL':
      return {
        ...initialState,
        hiddenWindows: new Set(),
      };

    case 'SET_ACTIVE':
      return {
        ...state,
        activeApp: action.app,
      };

    case 'TILE_LEFT': {
      if (!state.windows[action.app]) return state;

      const screen = getScreenDimensions();
      const currentGeometry = state.windowGeometries[action.app] || getDefaultGeometry();

      // Save previous state if not already tiled/maximized
      const newPrevious = { ...state.previousGeometries };
      if (!currentGeometry.isTiled && !currentGeometry.isMaximized) {
        newPrevious[action.app] = { ...currentGeometry };
      }

      const newGeometry: WindowGeometry = {
        position: { x: 0, y: MENU_BAR_HEIGHT },
        size: { width: Math.floor(screen.width / 2), height: screen.availableHeight },
        isMinimized: false,
        isMaximized: false,
        isTiled: 'left',
      };

      return {
        ...state,
        activeApp: action.app,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
        previousGeometries: newPrevious,
      };
    }

    case 'TILE_RIGHT': {
      if (!state.windows[action.app]) return state;

      const screen = getScreenDimensions();
      const currentGeometry = state.windowGeometries[action.app] || getDefaultGeometry();

      // Save previous state if not already tiled/maximized
      const newPrevious = { ...state.previousGeometries };
      if (!currentGeometry.isTiled && !currentGeometry.isMaximized) {
        newPrevious[action.app] = { ...currentGeometry };
      }

      const halfWidth = Math.floor(screen.width / 2);
      const newGeometry: WindowGeometry = {
        position: { x: halfWidth, y: MENU_BAR_HEIGHT },
        size: { width: halfWidth, height: screen.availableHeight },
        isMinimized: false,
        isMaximized: false,
        isTiled: 'right',
      };

      return {
        ...state,
        activeApp: action.app,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
        previousGeometries: newPrevious,
      };
    }

    case 'MAXIMIZE': {
      if (!state.windows[action.app]) return state;

      const screen = getScreenDimensions();
      const currentGeometry = state.windowGeometries[action.app] || getDefaultGeometry();

      // If already maximized, restore instead
      if (currentGeometry.isMaximized) {
        return windowReducer(state, { type: 'RESTORE', app: action.app });
      }

      // Save previous state if not already tiled/maximized
      const newPrevious = { ...state.previousGeometries };
      if (!currentGeometry.isTiled && !currentGeometry.isMaximized) {
        newPrevious[action.app] = { ...currentGeometry };
      }

      const newGeometry: WindowGeometry = {
        position: { x: 0, y: MENU_BAR_HEIGHT },
        size: { width: screen.width, height: screen.availableHeight },
        isMinimized: false,
        isMaximized: true,
        isTiled: null,
      };

      return {
        ...state,
        activeApp: action.app,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
        previousGeometries: newPrevious,
      };
    }

    case 'MINIMIZE': {
      if (!state.windows[action.app]) return state;

      const currentGeometry = state.windowGeometries[action.app] || getDefaultGeometry();
      const newGeometry: WindowGeometry = {
        ...currentGeometry,
        isMinimized: true,
      };

      // Find next non-minimized window to focus
      let newActiveApp = state.activeApp;
      if (state.activeApp === action.app) {
        const openApps = ALL_APPS.filter(app =>
          state.windows[app] &&
          app !== action.app &&
          !state.windowGeometries[app]?.isMinimized
        );
        newActiveApp = openApps.length > 0 ? openApps[0] : null;
      }

      return {
        ...state,
        activeApp: newActiveApp,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
      };
    }

    case 'RESTORE': {
      if (!state.windows[action.app]) return state;

      const previousGeometry = state.previousGeometries[action.app];

      // Restore to previous geometry or default
      const newGeometry: WindowGeometry = previousGeometry
        ? { ...previousGeometry, isMinimized: false }
        : { ...getDefaultGeometry() };

      const newPrevious = { ...state.previousGeometries };
      delete newPrevious[action.app];

      return {
        ...state,
        activeApp: action.app,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
        previousGeometries: newPrevious,
      };
    }

    case 'HIDE_OTHERS': {
      if (!state.activeApp) return state;

      const newHidden = new Set<AppType>();
      const newGeometries = { ...state.windowGeometries };

      ALL_APPS.forEach(app => {
        if (state.windows[app] && app !== state.activeApp) {
          newHidden.add(app);
          const geo = newGeometries[app] || getDefaultGeometry();
          newGeometries[app] = { ...geo, isMinimized: true };
        }
      });

      return {
        ...state,
        windowGeometries: newGeometries,
        hiddenWindows: newHidden,
      };
    }

    case 'SHOW_ALL': {
      const newGeometries = { ...state.windowGeometries };

      state.hiddenWindows.forEach(app => {
        if (state.windows[app]) {
          const geo = newGeometries[app] || getDefaultGeometry();
          newGeometries[app] = { ...geo, isMinimized: false };
        }
      });

      return {
        ...state,
        windowGeometries: newGeometries,
        hiddenWindows: new Set(),
      };
    }

    case 'UPDATE_GEOMETRY': {
      if (!state.windows[action.app]) return state;

      const currentGeometry = state.windowGeometries[action.app] || getDefaultGeometry();
      const newGeometry: WindowGeometry = {
        ...currentGeometry,
        ...action.geometry,
      };

      return {
        ...state,
        windowGeometries: { ...state.windowGeometries, [action.app]: newGeometry },
      };
    }

    default:
      return state;
  }
}

export interface WindowManager {
  // State
  windows: WindowState;
  activeApp: AppType | null;
  openApps: AppType[];
  visibleApps: AppType[];

  // Basic window actions
  openWindow: (app: AppType) => void;
  closeWindow: (app: AppType) => void;
  toggleWindow: (app: AppType) => void;
  focusWindow: (app: AppType) => void;
  closeAllWindows: () => void;

  // Tiling and management
  tileWindowLeft: (app: AppType) => void;
  tileWindowRight: (app: AppType) => void;
  maximizeWindow: (app: AppType) => void;
  minimizeWindow: (app: AppType) => void;
  restoreWindow: (app: AppType) => void;
  hideOtherWindows: () => void;
  showAllWindows: () => void;

  // Geometry
  getWindowState: (app: AppType) => WindowGeometry | null;
  updateWindowGeometry: (app: AppType, geometry: Partial<WindowGeometry>) => void;

  // Helpers
  isOpen: (app: AppType) => boolean;
  isMinimized: (app: AppType) => boolean;
  isMaximized: (app: AppType) => boolean;
  isTiled: (app: AppType) => 'left' | 'right' | null;
}

export function useWindowManager(): WindowManager {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  // Memoized list of open apps
  const openApps = useMemo(() => {
    return ALL_APPS.filter(app => state.windows[app]);
  }, [state.windows]);

  // Memoized list of visible (non-minimized) apps
  const visibleApps = useMemo(() => {
    return ALL_APPS.filter(app =>
      state.windows[app] && !state.windowGeometries[app]?.isMinimized
    );
  }, [state.windows, state.windowGeometries]);

  // Basic action creators
  const openWindow = useCallback((app: AppType) => {
    dispatch({ type: 'OPEN', app });
  }, []);

  const closeWindow = useCallback((app: AppType) => {
    dispatch({ type: 'CLOSE', app });
  }, []);

  const toggleWindow = useCallback((app: AppType) => {
    dispatch({ type: 'TOGGLE', app });
  }, []);

  const focusWindow = useCallback((app: AppType) => {
    dispatch({ type: 'SET_ACTIVE', app });
  }, []);

  const closeAllWindows = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL' });
  }, []);

  // Tiling actions
  const tileWindowLeft = useCallback((app: AppType) => {
    dispatch({ type: 'TILE_LEFT', app });
  }, []);

  const tileWindowRight = useCallback((app: AppType) => {
    dispatch({ type: 'TILE_RIGHT', app });
  }, []);

  const maximizeWindow = useCallback((app: AppType) => {
    dispatch({ type: 'MAXIMIZE', app });
  }, []);

  const minimizeWindow = useCallback((app: AppType) => {
    dispatch({ type: 'MINIMIZE', app });
  }, []);

  const restoreWindow = useCallback((app: AppType) => {
    dispatch({ type: 'RESTORE', app });
  }, []);

  const hideOtherWindows = useCallback(() => {
    dispatch({ type: 'HIDE_OTHERS' });
  }, []);

  const showAllWindows = useCallback(() => {
    dispatch({ type: 'SHOW_ALL' });
  }, []);

  // Geometry helpers
  const getWindowState = useCallback((app: AppType): WindowGeometry | null => {
    if (!state.windows[app]) return null;
    return state.windowGeometries[app] || getDefaultGeometry();
  }, [state.windows, state.windowGeometries]);

  const updateWindowGeometry = useCallback((app: AppType, geometry: Partial<WindowGeometry>) => {
    dispatch({ type: 'UPDATE_GEOMETRY', app, geometry });
  }, []);

  // State query helpers
  const isOpen = useCallback((app: AppType): boolean => {
    return Boolean(state.windows[app]);
  }, [state.windows]);

  const isMinimized = useCallback((app: AppType): boolean => {
    return Boolean(state.windowGeometries[app]?.isMinimized);
  }, [state.windowGeometries]);

  const isMaximized = useCallback((app: AppType): boolean => {
    return Boolean(state.windowGeometries[app]?.isMaximized);
  }, [state.windowGeometries]);

  const isTiled = useCallback((app: AppType): 'left' | 'right' | null => {
    return state.windowGeometries[app]?.isTiled || null;
  }, [state.windowGeometries]);

  // Event listeners for custom events
  useEffect(() => {
    const handleTileLeft = (e: CustomEvent<{ app?: AppType }>) => {
      const app = e.detail?.app || state.activeApp;
      if (app) tileWindowLeft(app);
    };

    const handleTileRight = (e: CustomEvent<{ app?: AppType }>) => {
      const app = e.detail?.app || state.activeApp;
      if (app) tileWindowRight(app);
    };

    const handleZoom = (e: CustomEvent<{ app?: AppType }>) => {
      const app = e.detail?.app || state.activeApp;
      if (app) maximizeWindow(app);
    };

    const handleHideApp = (e: CustomEvent<{ app?: AppType }>) => {
      const app = e.detail?.app || state.activeApp;
      if (app) minimizeWindow(app);
    };

    const handleShowAll = () => {
      showAllWindows();
    };

    // Add event listeners
    window.addEventListener('zos:window-left', handleTileLeft as EventListener);
    window.addEventListener('zos:window-right', handleTileRight as EventListener);
    window.addEventListener('zos:window-zoom', handleZoom as EventListener);
    window.addEventListener('zos:hide-app', handleHideApp as EventListener);
    window.addEventListener('zos:show-all', handleShowAll);

    return () => {
      window.removeEventListener('zos:window-left', handleTileLeft as EventListener);
      window.removeEventListener('zos:window-right', handleTileRight as EventListener);
      window.removeEventListener('zos:window-zoom', handleZoom as EventListener);
      window.removeEventListener('zos:hide-app', handleHideApp as EventListener);
      window.removeEventListener('zos:show-all', handleShowAll);
    };
  }, [state.activeApp, tileWindowLeft, tileWindowRight, maximizeWindow, minimizeWindow, showAllWindows]);

  return {
    // State
    windows: state.windows,
    activeApp: state.activeApp,
    openApps,
    visibleApps,

    // Basic actions
    openWindow,
    closeWindow,
    toggleWindow,
    focusWindow,
    closeAllWindows,

    // Tiling and management
    tileWindowLeft,
    tileWindowRight,
    maximizeWindow,
    minimizeWindow,
    restoreWindow,
    hideOtherWindows,
    showAllWindows,

    // Geometry
    getWindowState,
    updateWindowGeometry,

    // Helpers
    isOpen,
    isMinimized,
    isMaximized,
    isTiled,
  };
}
