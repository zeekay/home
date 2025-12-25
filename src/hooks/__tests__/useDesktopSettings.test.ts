import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDesktopSettings } from '../useDesktopSettings';

describe('useDesktopSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('default values', () => {
    it('has correct default theme', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.theme).toBe('wireframe');
    });

    it('has correct default colorScheme', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.colorScheme).toBe('dark');
    });

    it('has correct default windowTransparency', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.windowTransparency).toBe(20);
    });

    it('has correct default fontSize', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.fontSize).toBe('medium');
    });

    it('has correct default dockPosition', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.dockPosition).toBe('bottom');
    });

    it('has correct default dockSize', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.dockSize).toBe(44);
    });

    it('has correct default dockMagnification', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.dockMagnification).toBe(true);
    });

    it('has correct default dockAutoHide', () => {
      const { result } = renderHook(() => useDesktopSettings());
      expect(result.current.dockAutoHide).toBe(false);
    });
  });

  describe('settings persistence', () => {
    it('persists theme to localStorage after debounce', async () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setTheme('ocean');
      });

      // Fast forward past debounce
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(localStorage.getItem('zos-theme')).toBe('ocean');
    });

    it('persists colorScheme to localStorage after debounce', async () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setColorScheme('light');
      });

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(localStorage.getItem('zos-colorScheme')).toBe('light');
    });

    it('persists dockPosition to localStorage after debounce', async () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setDockPosition('left');
      });

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(localStorage.getItem('zos-dockPosition')).toBe('left');
    });

    it('loads persisted values on mount', () => {
      localStorage.setItem('zos-theme', 'sunset');
      localStorage.setItem('zos-dockPosition', 'right');

      const { result } = renderHook(() => useDesktopSettings());

      expect(result.current.theme).toBe('sunset');
      expect(result.current.dockPosition).toBe('right');
    });
  });

  describe('toggle functions', () => {
    it('toggleDarkMode switches between dark and light', () => {
      const { result } = renderHook(() => useDesktopSettings());

      expect(result.current.colorScheme).toBe('dark');

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.colorScheme).toBe('light');

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.colorScheme).toBe('dark');
    });
  });

  describe('value clamping', () => {
    it('clamps windowTransparency to 0-100', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setWindowTransparency(150);
      });
      expect(result.current.windowTransparency).toBe(100);

      act(() => {
        result.current.setWindowTransparency(-10);
      });
      expect(result.current.windowTransparency).toBe(0);
    });

    it('clamps dockSize to 16-256', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setDockSize(500);
      });
      expect(result.current.dockSize).toBe(256);

      act(() => {
        result.current.setDockSize(5);
      });
      expect(result.current.dockSize).toBe(16);
    });

    it('clamps dockMagnificationSize to 64-512', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setDockMagnificationSize(1000);
      });
      expect(result.current.dockMagnificationSize).toBe(512);

      act(() => {
        result.current.setDockMagnificationSize(10);
      });
      expect(result.current.dockMagnificationSize).toBe(64);
    });
  });

  describe('setters', () => {
    it('setTheme updates theme', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setTheme('night');
      });

      expect(result.current.theme).toBe('night');
    });

    it('setCustomBgUrl updates customBgUrl', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setCustomBgUrl('https://example.com/bg.jpg');
      });

      expect(result.current.customBgUrl).toBe('https://example.com/bg.jpg');
    });

    it('setFontSize updates fontSize', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setFontSize('large');
      });

      expect(result.current.fontSize).toBe('large');
    });

    it('setDockMagnification updates dockMagnification', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setDockMagnification(false);
      });

      expect(result.current.dockMagnification).toBe(false);
    });

    it('setDockAutoHide updates dockAutoHide', () => {
      const { result } = renderHook(() => useDesktopSettings());

      act(() => {
        result.current.setDockAutoHide(true);
      });

      expect(result.current.dockAutoHide).toBe(true);
    });
  });
});
