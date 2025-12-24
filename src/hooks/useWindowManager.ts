import { useReducer, useCallback, useMemo } from 'react';

// App types for window management
export type AppType =
  | 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar'
  | 'System Preferences' | 'Photos' | 'FaceTime' | 'TextEdit' | 'Notes'
  | 'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI'
  | 'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies';

// All app types as array for iteration
export const ALL_APPS: AppType[] = [
  'Finder', 'Terminal', 'Safari', 'Music', 'Mail', 'Calendar',
  'System Preferences', 'Photos', 'FaceTime', 'TextEdit', 'Notes',
  'GitHub Stats', 'Messages', 'Activity Monitor', 'Hanzo AI',
  'Lux Wallet', 'Zoo', 'Calculator', 'Clock', 'Weather', 'Stickies'
];

// Window state - which windows are open
export type WindowState = Record<AppType, boolean>;

// Actions for reducer
type WindowAction =
  | { type: 'OPEN'; app: AppType }
  | { type: 'CLOSE'; app: AppType }
  | { type: 'TOGGLE'; app: AppType }
  | { type: 'CLOSE_ALL' }
  | { type: 'SET_ACTIVE'; app: AppType };

// Combined state with active app
interface WindowManagerState {
  windows: WindowState;
  activeApp: AppType | null;
}

// Initial state - all windows closed
const initialWindowState: WindowState = ALL_APPS.reduce((acc, app) => {
  acc[app] = false;
  return acc;
}, {} as WindowState);

const initialState: WindowManagerState = {
  windows: initialWindowState,
  activeApp: null,
};

// Reducer function
function windowReducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
  switch (action.type) {
    case 'OPEN':
      return {
        windows: { ...state.windows, [action.app]: true },
        activeApp: action.app,
      };
    case 'CLOSE': {
      const newWindows = { ...state.windows, [action.app]: false };
      let newActiveApp = state.activeApp;

      if (state.activeApp === action.app) {
        // Find next open window, or null if none
        const openApps = ALL_APPS.filter(app => newWindows[app]);
        newActiveApp = openApps.length > 0 ? openApps[0] : null;
      }

      return {
        windows: newWindows,
        activeApp: newActiveApp,
      };
    }
    case 'TOGGLE': {
      const isOpen = state.windows[action.app];
      const newWindows = { ...state.windows, [action.app]: !isOpen };

      let newActiveApp: AppType | null;
      if (!isOpen) {
        // Opening - make it active
        newActiveApp = action.app;
      } else if (state.activeApp === action.app) {
        // Closing active app - find next open window
        const openApps = ALL_APPS.filter(app => newWindows[app]);
        newActiveApp = openApps.length > 0 ? openApps[0] : null;
      } else {
        newActiveApp = state.activeApp;
      }

      return {
        windows: newWindows,
        activeApp: newActiveApp,
      };
    }
    case 'CLOSE_ALL':
      return {
        windows: initialWindowState,
        activeApp: null,
      };
    case 'SET_ACTIVE':
      return {
        ...state,
        activeApp: action.app,
      };
    default:
      return state;
  }
}

export interface WindowManager {
  // State
  windows: WindowState;
  activeApp: AppType | null;
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

export function useWindowManager(): WindowManager {
  const [state, dispatch] = useReducer(windowReducer, initialState);

  // Memoized list of open apps
  const openApps = useMemo(() => {
    return ALL_APPS.filter(app => state.windows[app]);
  }, [state.windows]);

  // Action creators
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

  // Helper to check if window is open
  // Note: Dependency on state.windows is intentional - function identity changes when
  // window state changes, which is correct behavior for render-time checks
  const isOpen = useCallback((app: AppType): boolean => {
    return Boolean(state.windows[app]);
  }, [state.windows]);

  return {
    windows: state.windows,
    activeApp: state.activeApp,
    openApps,
    openWindow,
    closeWindow,
    toggleWindow,
    focusWindow,
    closeAllWindows,
    isOpen,
  };
}
