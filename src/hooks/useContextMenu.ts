// useContextMenu Hook
// Unified hook for managing context menu state and interactions

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ContextMenuPosition, FileItem, ImageInfo, LinkInfo, TabInfo, WindowInfo } from '@/types/contextMenu';

// Context menu target types
export type ContextMenuTarget =
  | { type: 'desktop' }
  | { type: 'file'; file: FileItem; selectedFiles?: FileItem[] }
  | { type: 'text'; text: string; isEditable: boolean }
  | { type: 'image'; image: ImageInfo }
  | { type: 'link'; link: LinkInfo }
  | { type: 'window'; window: WindowInfo }
  | { type: 'tab'; tab: TabInfo; tabIndex: number; tabCount: number }
  | { type: 'dock'; appId: string; appName: string; isRunning: boolean; isPinned: boolean }
  | { type: 'sidebar'; itemId: string; itemType: string }
  | { type: 'menubar'; itemId: string; itemType: string }
  | { type: 'custom'; data: unknown };

interface ContextMenuState {
  isOpen: boolean;
  position: ContextMenuPosition | null;
  target: ContextMenuTarget | null;
}

interface UseContextMenuOptions {
  onOpen?: (target: ContextMenuTarget, position: ContextMenuPosition) => void;
  onClose?: () => void;
  preventDefaultOnRightClick?: boolean;
}

interface UseContextMenuReturn {
  // State
  state: ContextMenuState;
  isOpen: boolean;
  position: ContextMenuPosition | null;
  target: ContextMenuTarget | null;

  // Actions
  open: (target: ContextMenuTarget, position: ContextMenuPosition) => void;
  close: () => void;
  toggle: (target: ContextMenuTarget, position: ContextMenuPosition) => void;

  // Event handlers for easy binding
  handleContextMenu: (e: React.MouseEvent, target: ContextMenuTarget) => void;
  getContainerProps: () => {
    onContextMenu: (e: React.MouseEvent) => void;
  };
}

/**
 * Hook for managing context menu state
 */
export function useContextMenu(options: UseContextMenuOptions = {}): UseContextMenuReturn {
  const { onOpen, onClose, preventDefaultOnRightClick = true } = options;

  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: null,
    target: null,
  });

  // Track if menu was just opened to prevent immediate close
  const justOpenedRef = useRef(false);

  const open = useCallback((target: ContextMenuTarget, position: ContextMenuPosition) => {
    setState({
      isOpen: true,
      position,
      target,
    });
    justOpenedRef.current = true;
    setTimeout(() => {
      justOpenedRef.current = false;
    }, 100);
    onOpen?.(target, position);
  }, [onOpen]);

  const close = useCallback(() => {
    if (justOpenedRef.current) return;
    setState({
      isOpen: false,
      position: null,
      target: null,
    });
    onClose?.();
  }, [onClose]);

  const toggle = useCallback((target: ContextMenuTarget, position: ContextMenuPosition) => {
    if (state.isOpen) {
      close();
    } else {
      open(target, position);
    }
  }, [state.isOpen, open, close]);

  const handleContextMenu = useCallback((e: React.MouseEvent, target: ContextMenuTarget) => {
    if (preventDefaultOnRightClick) {
      e.preventDefault();
    }
    e.stopPropagation();
    open(target, { x: e.clientX, y: e.clientY });
  }, [preventDefaultOnRightClick, open]);

  // Close on click outside
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside context menu
      const target = e.target as HTMLElement;
      if (target.closest('[data-radix-menu-content]')) {
        return;
      }
      close();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    // Add with delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isOpen, close]);

  // Helper to get container props
  const getContainerProps = useCallback(() => ({
    onContextMenu: (e: React.MouseEvent) => {
      if (preventDefaultOnRightClick) {
        e.preventDefault();
      }
    },
  }), [preventDefaultOnRightClick]);

  return {
    state,
    isOpen: state.isOpen,
    position: state.position,
    target: state.target,
    open,
    close,
    toggle,
    handleContextMenu,
    getContainerProps,
  };
}

/**
 * Hook for detecting text selection for context menus
 */
export function useTextSelection() {
  const [selection, setSelection] = useState<{
    text: string;
    isEditable: boolean;
    rect: DOMRect | null;
  }>({
    text: '',
    isEditable: false,
    rect: null,
  });

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        setSelection({ text: '', isEditable: false, rect: null });
        return;
      }

      const text = sel.toString();
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Check if selection is in an editable element
      const anchorNode = sel.anchorNode;
      const element = anchorNode?.nodeType === Node.ELEMENT_NODE
        ? (anchorNode as HTMLElement)
        : anchorNode?.parentElement;

      const isEditable = element?.isContentEditable === true ||
        element?.tagName === 'INPUT' ||
        element?.tagName === 'TEXTAREA';

      setSelection({
        text,
        isEditable: isEditable ?? false,
        rect: text ? rect : null,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return selection;
}

/**
 * Hook for detecting if element under cursor is a link
 */
export function useLinkDetection() {
  const [link, setLink] = useState<LinkInfo | null>(null);

  const detectLink = useCallback((e: React.MouseEvent): LinkInfo | null => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      return {
        href: anchor.href,
        text: anchor.textContent ?? undefined,
        title: anchor.title ?? undefined,
      };
    }

    return null;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setLink(detectLink(e));
  }, [detectLink]);

  return { link, detectLink, handleMouseMove };
}

/**
 * Hook for detecting if element under cursor is an image
 */
export function useImageDetection() {
  const detectImage = useCallback((e: React.MouseEvent): ImageInfo | null => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      return {
        src: img.src,
        alt: img.alt ?? undefined,
        width: img.naturalWidth || undefined,
        height: img.naturalHeight || undefined,
      };
    }

    // Check for background image
    const style = window.getComputedStyle(target);
    const backgroundImage = style.backgroundImage;
    if (backgroundImage && backgroundImage !== 'none') {
      const match = backgroundImage.match(/url\(["']?(.+?)["']?\)/);
      if (match) {
        return {
          src: match[1],
        };
      }
    }

    return null;
  }, []);

  return { detectImage };
}

export default useContextMenu;
