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
});
