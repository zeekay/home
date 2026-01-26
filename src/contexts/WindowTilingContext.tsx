/**
 * WindowTilingContext - macOS-style window tiling with snap zones
 *
 * Features:
 * - Drag-to-snap (like Rectangle, Magnet, or Stage Manager)
 * - Multiple grid sizes: 2x2 (quadrants), 3x3, 4x4, 6x6, 8x8
 * - Edge detection with configurable hotspots
 * - Visual preview overlay during drag
 * - Keyboard shortcuts for tiling
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Grid configuration - how many columns/rows
export type TilingGrid = '2x2' | '3x3' | '4x4' | '6x6' | '8x8';

// Snap zone positions
export type SnapPosition =
  // Edge snaps
  | 'left' | 'right' | 'top' | 'bottom'
  // Corner snaps (2x2 quadrants)
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  // Thirds (3x3)
  | 'left-third' | 'center-third' | 'right-third'
  | 'top-third' | 'middle-third' | 'bottom-third'
  // Custom grid position
  | 'custom'
  | null;

// Snap zone rectangle
export interface SnapZone {
  x: number;
  y: number;
  width: number;
  height: number;
  position: SnapPosition;
}

// Snap preview state
export interface SnapPreview {
  isVisible: boolean;
  zone: SnapZone | null;
  opacity: number;
}

// Context state
interface WindowTilingState {
  // Current grid mode
  gridMode: TilingGrid;
  // Snap preview
  preview: SnapPreview;
  // Whether snap is enabled
  isEnabled: boolean;
  // Hotspot size (pixels from edge)
  edgeThreshold: number;
  cornerThreshold: number;
}

// Context API
interface WindowTilingContextType {
  state: WindowTilingState;
  // Grid controls
  setGridMode: (grid: TilingGrid) => void;
  toggleEnabled: () => void;
  // Snap detection
  detectSnapZone: (mouseX: number, mouseY: number) => SnapZone | null;
  // Preview controls
  showPreview: (zone: SnapZone) => void;
  hidePreview: () => void;
  // Get snap bounds (accounting for menu bar and dock)
  getSnapBounds: () => { x: number; y: number; width: number; height: number };
  // Get zone rectangle for a position
  getZoneRect: (position: SnapPosition, gridX?: number, gridY?: number) => SnapZone;
}

const WindowTilingContext = createContext<WindowTilingContextType | undefined>(undefined);

// Menu bar height
const MENU_BAR_HEIGHT = 28;
// Dock height (approximate)
const DOCK_HEIGHT = 70;
// Padding from edges
const WINDOW_PADDING = 0;

export const WindowTilingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WindowTilingState>({
    gridMode: '2x2',
    preview: {
      isVisible: false,
      zone: null,
      opacity: 0,
    },
    isEnabled: true,
    edgeThreshold: 50,
    cornerThreshold: 80,
  });

  // Get available snap bounds (screen minus menu bar and dock)
  const getSnapBounds = useCallback(() => {
    if (typeof window === 'undefined') {
      return { x: 0, y: MENU_BAR_HEIGHT, width: 1920, height: 1080 - MENU_BAR_HEIGHT - DOCK_HEIGHT };
    }
    return {
      x: WINDOW_PADDING,
      y: MENU_BAR_HEIGHT + WINDOW_PADDING,
      width: window.innerWidth - (WINDOW_PADDING * 2),
      height: window.innerHeight - MENU_BAR_HEIGHT - DOCK_HEIGHT - (WINDOW_PADDING * 2),
    };
  }, []);

  // Get zone rectangle for a given position
  const getZoneRect = useCallback((position: SnapPosition, gridX = 0, gridY = 0): SnapZone => {
    const bounds = getSnapBounds();
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    const thirdWidth = bounds.width / 3;
    const thirdHeight = bounds.height / 3;

    switch (position) {
      // Full edges
      case 'left':
        return { x: bounds.x, y: bounds.y, width: halfWidth, height: bounds.height, position };
      case 'right':
        return { x: bounds.x + halfWidth, y: bounds.y, width: halfWidth, height: bounds.height, position };
      case 'top':
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: halfHeight, position };
      case 'bottom':
        return { x: bounds.x, y: bounds.y + halfHeight, width: bounds.width, height: halfHeight, position };

      // Corners (2x2 quadrants)
      case 'top-left':
        return { x: bounds.x, y: bounds.y, width: halfWidth, height: halfHeight, position };
      case 'top-right':
        return { x: bounds.x + halfWidth, y: bounds.y, width: halfWidth, height: halfHeight, position };
      case 'bottom-left':
        return { x: bounds.x, y: bounds.y + halfHeight, width: halfWidth, height: halfHeight, position };
      case 'bottom-right':
        return { x: bounds.x + halfWidth, y: bounds.y + halfHeight, width: halfWidth, height: halfHeight, position };

      // Thirds (horizontal)
      case 'left-third':
        return { x: bounds.x, y: bounds.y, width: thirdWidth, height: bounds.height, position };
      case 'center-third':
        return { x: bounds.x + thirdWidth, y: bounds.y, width: thirdWidth, height: bounds.height, position };
      case 'right-third':
        return { x: bounds.x + thirdWidth * 2, y: bounds.y, width: thirdWidth, height: bounds.height, position };

      // Thirds (vertical)
      case 'top-third':
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: thirdHeight, position };
      case 'middle-third':
        return { x: bounds.x, y: bounds.y + thirdHeight, width: bounds.width, height: thirdHeight, position };
      case 'bottom-third':
        return { x: bounds.x, y: bounds.y + thirdHeight * 2, width: bounds.width, height: thirdHeight, position };

      // Custom grid position (based on current gridMode)
      case 'custom': {
        const gridSize = parseInt(state.gridMode.split('x')[0]);
        const cellWidth = bounds.width / gridSize;
        const cellHeight = bounds.height / gridSize;
        return {
          x: bounds.x + gridX * cellWidth,
          y: bounds.y + gridY * cellHeight,
          width: cellWidth,
          height: cellHeight,
          position,
        };
      }

      default:
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, position: null };
    }
  }, [getSnapBounds, state.gridMode]);

  // Detect which snap zone the mouse is in
  const detectSnapZone = useCallback((mouseX: number, mouseY: number): SnapZone | null => {
    if (!state.isEnabled) return null;

    const bounds = getSnapBounds();
    const { edgeThreshold, cornerThreshold } = state;

    // Relative position within bounds
    const relX = mouseX - bounds.x;
    const relY = mouseY - bounds.y;

    // Check if outside snap area
    if (relX < -edgeThreshold || relX > bounds.width + edgeThreshold ||
        relY < -edgeThreshold || relY > bounds.height + edgeThreshold) {
      return null;
    }

    // Check corners first (they have priority)
    const isNearLeft = relX < cornerThreshold;
    const isNearRight = relX > bounds.width - cornerThreshold;
    const isNearTop = relY < cornerThreshold;
    const isNearBottom = relY > bounds.height - cornerThreshold;

    // Top-left corner
    if (isNearLeft && isNearTop) {
      return getZoneRect('top-left');
    }
    // Top-right corner
    if (isNearRight && isNearTop) {
      return getZoneRect('top-right');
    }
    // Bottom-left corner
    if (isNearLeft && isNearBottom) {
      return getZoneRect('bottom-left');
    }
    // Bottom-right corner
    if (isNearRight && isNearBottom) {
      return getZoneRect('bottom-right');
    }

    // Check edges
    // Left edge
    if (relX < edgeThreshold) {
      return getZoneRect('left');
    }
    // Right edge
    if (relX > bounds.width - edgeThreshold) {
      return getZoneRect('right');
    }
    // Top edge
    if (relY < edgeThreshold) {
      return getZoneRect('top');
    }
    // Bottom edge (dock area)
    if (relY > bounds.height - edgeThreshold) {
      return getZoneRect('bottom');
    }

    return null;
  }, [state.isEnabled, state.edgeThreshold, state.cornerThreshold, getSnapBounds, getZoneRect]);

  // Show snap preview
  const showPreview = useCallback((zone: SnapZone) => {
    setState(prev => ({
      ...prev,
      preview: {
        isVisible: true,
        zone,
        opacity: 0.3,
      },
    }));
  }, []);

  // Hide snap preview
  const hidePreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      preview: {
        isVisible: false,
        zone: null,
        opacity: 0,
      },
    }));
  }, []);

  // Set grid mode
  const setGridMode = useCallback((grid: TilingGrid) => {
    setState(prev => ({ ...prev, gridMode: grid }));
  }, []);

  // Toggle enabled
  const toggleEnabled = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  return (
    <WindowTilingContext.Provider value={{
      state,
      setGridMode,
      toggleEnabled,
      detectSnapZone,
      showPreview,
      hidePreview,
      getSnapBounds,
      getZoneRect,
    }}>
      {children}
    </WindowTilingContext.Provider>
  );
};

// Hook to use tiling context
export const useWindowTiling = (): WindowTilingContextType => {
  const context = useContext(WindowTilingContext);
  if (!context) {
    throw new Error('useWindowTiling must be used within a WindowTilingProvider');
  }
  return context;
};

export default WindowTilingContext;
