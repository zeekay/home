import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useContextMenu, useTextSelection, useLinkDetection, useImageDetection } from '../useContextMenu';

describe('useContextMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts closed', () => {
      const { result } = renderHook(() => useContextMenu());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.position).toBeNull();
      expect(result.current.target).toBeNull();
    });
  });

  describe('open', () => {
    it('opens menu with target and position', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open({ type: 'desktop' }, { x: 100, y: 200 });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.position).toEqual({ x: 100, y: 200 });
      expect(result.current.target).toEqual({ type: 'desktop' });
    });

    it('calls onOpen callback', () => {
      const onOpen = vi.fn();
      const { result } = renderHook(() => useContextMenu({ onOpen }));

      act(() => {
        result.current.open({ type: 'desktop' }, { x: 100, y: 200 });
      });

      expect(onOpen).toHaveBeenCalledWith({ type: 'desktop' }, { x: 100, y: 200 });
    });
  });

  describe('close', () => {
    it('closes menu', async () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open({ type: 'desktop' }, { x: 100, y: 200 });
      });

      // Wait for justOpenedRef to be cleared
      await new Promise(resolve => setTimeout(resolve, 150));

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.position).toBeNull();
      expect(result.current.target).toBeNull();
    });

    it('calls onClose callback', async () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useContextMenu({ onClose }));

      act(() => {
        result.current.open({ type: 'desktop' }, { x: 100, y: 200 });
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      act(() => {
        result.current.close();
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    it('opens when closed', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.toggle({ type: 'desktop' }, { x: 100, y: 200 });
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closes when open', async () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open({ type: 'desktop' }, { x: 100, y: 200 });
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      act(() => {
        result.current.toggle({ type: 'desktop' }, { x: 100, y: 200 });
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('handleContextMenu', () => {
    it('opens menu at mouse position', () => {
      const { result } = renderHook(() => useContextMenu());

      const mockEvent = {
        clientX: 150,
        clientY: 250,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleContextMenu(mockEvent, { type: 'desktop' });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.position).toEqual({ x: 150, y: 250 });
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('does NOT preventDefault when option is false', () => {
      const { result } = renderHook(() => useContextMenu({ preventDefaultOnRightClick: false }));

      const mockEvent = {
        clientX: 150,
        clientY: 250,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleContextMenu(mockEvent, { type: 'desktop' });
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('state object', () => {
    it('provides state object with all properties', () => {
      const { result } = renderHook(() => useContextMenu());

      expect(result.current.state).toEqual({
        isOpen: false,
        position: null,
        target: null,
      });

      act(() => {
        result.current.open({ type: 'file', file: { id: '1', name: 'test.txt', type: 'file', size: 100 } }, { x: 10, y: 20 });
      });

      expect(result.current.state.isOpen).toBe(true);
      expect(result.current.state.position).toEqual({ x: 10, y: 20 });
      expect(result.current.state.target?.type).toBe('file');
    });
  });

  describe('getContainerProps', () => {
    it('returns onContextMenu handler', () => {
      const { result } = renderHook(() => useContextMenu());

      const props = result.current.getContainerProps();

      expect(typeof props.onContextMenu).toBe('function');
    });

    it('preventDefault on container context menu when enabled', () => {
      const { result } = renderHook(() => useContextMenu({ preventDefaultOnRightClick: true }));

      const props = result.current.getContainerProps();
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent;

      act(() => {
        props.onContextMenu(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('different target types', () => {
    it('handles file target', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open(
          { type: 'file', file: { id: '1', name: 'test.txt', type: 'file', size: 100 } },
          { x: 100, y: 200 }
        );
      });

      expect(result.current.target?.type).toBe('file');
    });

    it('handles text target', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open(
          { type: 'text', text: 'selected text', isEditable: false },
          { x: 100, y: 200 }
        );
      });

      expect(result.current.target?.type).toBe('text');
    });

    it('handles dock target', () => {
      const { result } = renderHook(() => useContextMenu());

      act(() => {
        result.current.open(
          { type: 'dock', appId: 'finder', appName: 'Finder', isRunning: true, isPinned: true },
          { x: 100, y: 200 }
        );
      });

      expect(result.current.target?.type).toBe('dock');
    });
  });
});

describe('useTextSelection', () => {
  it('starts with empty selection', () => {
    const { result } = renderHook(() => useTextSelection());

    expect(result.current.text).toBe('');
    expect(result.current.isEditable).toBe(false);
    expect(result.current.rect).toBeNull();
  });
});

describe('useLinkDetection', () => {
  it('provides detectLink function', () => {
    const { result } = renderHook(() => useLinkDetection());

    expect(typeof result.current.detectLink).toBe('function');
  });

  it('link starts as null', () => {
    const { result } = renderHook(() => useLinkDetection());

    expect(result.current.link).toBeNull();
  });

  it('provides handleMouseMove function', () => {
    const { result } = renderHook(() => useLinkDetection());

    expect(typeof result.current.handleMouseMove).toBe('function');
  });
});

describe('useImageDetection', () => {
  it('provides detectImage function', () => {
    const { result } = renderHook(() => useImageDetection());

    expect(typeof result.current.detectImage).toBe('function');
  });

  it('returns null for non-image elements', () => {
    const { result } = renderHook(() => useImageDetection());

    const div = document.createElement('div');
    const mockEvent = { target: div } as unknown as React.MouseEvent;

    const imageInfo = result.current.detectImage(mockEvent);

    expect(imageInfo).toBeNull();
  });
});
