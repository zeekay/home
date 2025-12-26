import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowManager, ALL_APPS, AppType } from '../useWindowManager';

describe('useWindowManager', () => {
  describe('initial state', () => {
    it('starts with no open apps', () => {
      const { result } = renderHook(() => useWindowManager());
      expect(result.current.openApps).toEqual([]);
    });

    it('starts with no active app', () => {
      const { result } = renderHook(() => useWindowManager());
      expect(result.current.activeApp).toBeNull();
    });

    it('all windows are initially closed', () => {
      const { result } = renderHook(() => useWindowManager());
      for (const app of ALL_APPS) {
        expect(result.current.isOpen(app)).toBe(false);
      }
    });
  });

  describe('openWindow', () => {
    it('adds app to openApps', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Terminal');
      });

      expect(result.current.openApps).toContain('Terminal');
      expect(result.current.isOpen('Terminal')).toBe(true);
    });

    it('sets app as activeApp', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });

      expect(result.current.activeApp).toBe('Finder');
    });

    it('updates activeApp when opening a new window', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });

      expect(result.current.activeApp).toBe('Terminal');
      expect(result.current.openApps).toContain('Finder');
      expect(result.current.openApps).toContain('Terminal');
    });
  });

  describe('closeWindow', () => {
    it('removes app from openApps', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Safari');
      });
      act(() => {
        result.current.closeWindow('Safari');
      });

      expect(result.current.openApps).not.toContain('Safari');
      expect(result.current.isOpen('Safari')).toBe(false);
    });

    it('selects another open app when active app is closed', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.closeWindow('Terminal');
      });

      expect(result.current.activeApp).toBe('Finder');
    });

    it('sets activeApp to null when last window is closed', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.closeWindow('Terminal');
      });

      expect(result.current.activeApp).toBeNull();
    });
  });

  describe('focusWindow', () => {
    it('sets the app as active', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.focusWindow('Finder');
      });

      expect(result.current.activeApp).toBe('Finder');
    });
  });

  describe('toggleWindow', () => {
    it('opens a closed window', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.toggleWindow('Mail');
      });

      expect(result.current.isOpen('Mail')).toBe(true);
      expect(result.current.activeApp).toBe('Mail');
    });

    it('closes an open window', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Mail');
      });
      act(() => {
        result.current.toggleWindow('Mail');
      });

      expect(result.current.isOpen('Mail')).toBe(false);
    });
  });

  describe('closeAllWindows', () => {
    it('closes all open windows', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
        result.current.openWindow('Terminal');
        result.current.openWindow('Safari');
      });
      act(() => {
        result.current.closeAllWindows();
      });

      expect(result.current.openApps).toEqual([]);
      expect(result.current.activeApp).toBeNull();
    });
  });

  describe('isOpen', () => {
    it('returns true for open windows', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Calendar');
      });

      expect(result.current.isOpen('Calendar')).toBe(true);
    });

    it('returns false for closed windows', () => {
      const { result } = renderHook(() => useWindowManager());

      expect(result.current.isOpen('Calendar')).toBe(false);
    });
  });

  describe('tileWindowLeft', () => {
    it('tiles window to left half of screen', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.tileWindowLeft('Terminal');
      });

      const state = result.current.getWindowState('Terminal');
      expect(state?.isTiled).toBe('left');
      expect(state?.position.x).toBe(0);
      expect(state?.isMaximized).toBe(false);
    });

    it('does nothing for closed windows', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.tileWindowLeft('Terminal');
      });

      expect(result.current.getWindowState('Terminal')).toBeNull();
    });
  });

  describe('tileWindowRight', () => {
    it('tiles window to right half of screen', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Safari');
      });
      act(() => {
        result.current.tileWindowRight('Safari');
      });

      const state = result.current.getWindowState('Safari');
      expect(state?.isTiled).toBe('right');
      expect(state?.position.x).toBeGreaterThan(0);
      expect(state?.isMaximized).toBe(false);
    });
  });

  describe('maximizeWindow', () => {
    it('maximizes the window', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.maximizeWindow('Finder');
      });

      expect(result.current.isMaximized('Finder')).toBe(true);
      expect(result.current.isTiled('Finder')).toBeNull();
    });

    it('restores when already maximized', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.maximizeWindow('Finder');
      });
      act(() => {
        result.current.maximizeWindow('Finder');
      });

      expect(result.current.isMaximized('Finder')).toBe(false);
    });
  });

  describe('minimizeWindow', () => {
    it('minimizes the window', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Mail');
      });
      act(() => {
        result.current.minimizeWindow('Mail');
      });

      expect(result.current.isMinimized('Mail')).toBe(true);
      expect(result.current.visibleApps).not.toContain('Mail');
      expect(result.current.openApps).toContain('Mail');
    });

    it('focuses next window when active is minimized', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.minimizeWindow('Terminal');
      });

      expect(result.current.activeApp).toBe('Finder');
    });
  });

  describe('restoreWindow', () => {
    it('restores from minimized state', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Notes');
      });
      act(() => {
        result.current.minimizeWindow('Notes');
      });
      act(() => {
        result.current.restoreWindow('Notes');
      });

      expect(result.current.isMinimized('Notes')).toBe(false);
      expect(result.current.activeApp).toBe('Notes');
    });

    it('restores previous geometry after tiling', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Terminal');
      });

      const originalState = result.current.getWindowState('Terminal');

      act(() => {
        result.current.tileWindowLeft('Terminal');
      });
      act(() => {
        result.current.restoreWindow('Terminal');
      });

      const restoredState = result.current.getWindowState('Terminal');
      expect(restoredState?.isTiled).toBeNull();
      expect(restoredState?.position).toEqual(originalState?.position);
    });
  });

  describe('hideOtherWindows', () => {
    it('minimizes all windows except active', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.openWindow('Safari');
      });
      act(() => {
        result.current.hideOtherWindows();
      });

      expect(result.current.isMinimized('Finder')).toBe(true);
      expect(result.current.isMinimized('Terminal')).toBe(true);
      expect(result.current.isMinimized('Safari')).toBe(false);
      expect(result.current.activeApp).toBe('Safari');
    });
  });

  describe('showAllWindows', () => {
    it('restores all hidden windows', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.openWindow('Safari');
      });
      act(() => {
        result.current.hideOtherWindows();
      });
      act(() => {
        result.current.showAllWindows();
      });

      expect(result.current.isMinimized('Finder')).toBe(false);
      expect(result.current.isMinimized('Terminal')).toBe(false);
      expect(result.current.isMinimized('Safari')).toBe(false);
    });
  });

  describe('visibleApps', () => {
    it('excludes minimized apps', () => {
      const { result } = renderHook(() => useWindowManager());

      act(() => {
        result.current.openWindow('Finder');
      });
      act(() => {
        result.current.openWindow('Terminal');
      });
      act(() => {
        result.current.minimizeWindow('Finder');
      });

      expect(result.current.openApps).toContain('Finder');
      expect(result.current.visibleApps).not.toContain('Finder');
      expect(result.current.visibleApps).toContain('Terminal');
    });
  });
});
