import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcuts, formatShortcut, KeyboardShortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic shortcuts', () => {
    it('triggers action on matching key press', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('does NOT trigger action on non-matching key', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
      });

      expect(action).not.toHaveBeenCalled();
    });

    it('is case insensitive', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'A', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('modifier keys', () => {
    it('triggers with meta key (Cmd)', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'n', meta: true, action, description: 'New' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // Without meta - should NOT trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
      });
      expect(action).not.toHaveBeenCalled();

      // With meta - should trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', metaKey: true, bubbles: true }));
      });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('triggers with shift modifier', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'n', meta: true, shift: true, action, description: 'New with shift' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // Meta only - should NOT trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', metaKey: true, bubbles: true }));
      });
      expect(action).not.toHaveBeenCalled();

      // Meta + Shift - should trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'n',
          metaKey: true,
          shiftKey: true,
          bubbles: true
        }));
      });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('triggers with alt (Option) modifier', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', alt: true, action, description: 'Alt action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // Without alt - should NOT trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });
      expect(action).not.toHaveBeenCalled();

      // With alt - should trigger
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true }));
      });
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled state', () => {
    it('does NOT trigger when disabled', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action).not.toHaveBeenCalled();
    });

    it('triggers when explicitly enabled', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: true }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('preventDefault behavior', () => {
    it('prevents default by default', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('does NOT prevent default when preventDefault is false', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action', preventDefault: false }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      act(() => {
        window.dispatchEvent(event);
      });

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('multiple shortcuts', () => {
    it('handles multiple shortcuts independently', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action: action1, description: 'Action 1' },
        { key: 'b', action: action2, description: 'Action 2' }
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).not.toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
      });

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('removes event listener on unmount', () => {
      const action = vi.fn();
      const shortcuts: KeyboardShortcut[] = [
        { key: 'a', action, description: 'Test action' }
      ];

      const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }));

      unmount();

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });

      expect(action).not.toHaveBeenCalled();
    });
  });
});

describe('formatShortcut', () => {
  it('formats simple key', () => {
    expect(formatShortcut({ key: 'a' })).toBe('A');
  });

  it('formats with meta (Command)', () => {
    expect(formatShortcut({ key: 'n', meta: true })).toBe('⌘N');
  });

  it('formats with shift', () => {
    expect(formatShortcut({ key: 'n', shift: true })).toBe('⇧N');
  });

  it('formats with alt (Option)', () => {
    expect(formatShortcut({ key: 'a', alt: true })).toBe('⌥A');
  });

  it('formats with ctrl (Control)', () => {
    expect(formatShortcut({ key: 'c', ctrl: true })).toBe('⌃C');
  });

  it('formats with multiple modifiers', () => {
    expect(formatShortcut({ key: 'n', meta: true, shift: true })).toBe('⇧⌘N');
  });

  it('formats special keys', () => {
    expect(formatShortcut({ key: 'escape' })).toBe('⎋');
    expect(formatShortcut({ key: 'enter' })).toBe('↩');
    expect(formatShortcut({ key: 'tab' })).toBe('⇥');
    expect(formatShortcut({ key: 'backspace' })).toBe('⌫');
    expect(formatShortcut({ key: 'delete' })).toBe('⌦');
    expect(formatShortcut({ key: 'arrowup' })).toBe('↑');
    expect(formatShortcut({ key: 'arrowdown' })).toBe('↓');
    expect(formatShortcut({ key: 'arrowleft' })).toBe('←');
    expect(formatShortcut({ key: 'arrowright' })).toBe('→');
  });

  it('formats command + special key', () => {
    expect(formatShortcut({ key: 'backspace', meta: true })).toBe('⌘⌫');
  });
});
