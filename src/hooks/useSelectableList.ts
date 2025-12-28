import { useCallback, useEffect, useRef } from 'react';
import { useSelection } from '@/contexts/SelectionContext';

interface UseSelectableListOptions<T> {
  items: T[];
  getId: (item: T) => string;
  onSelectionChange?: (selectedItems: T[]) => void;
  onDoubleClick?: (item: T) => void;
  onContextMenu?: (item: T, event: React.MouseEvent) => void;
}

/**
 * useSelectableList - Hook for managing selection in a list or grid of items
 *
 * Provides:
 * - Automatic item registration with SelectionContext
 * - Click handling with modifier key support
 * - Keyboard navigation (arrows, space, enter)
 * - Select all (Cmd+A)
 */
export function useSelectableList<T>({
  items,
  getId,
  onSelectionChange,
  onDoubleClick,
  onContextMenu,
}: UseSelectableListOptions<T>) {
  const {
    selectedIds,
    isSelected,
    handleClick,
    selectAll,
    clearSelection,
    registerItem,
    unregisterItem,
    getSelectedItems,
  } = useSelection();

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLElement>(null);

  // Track selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedItems = items.filter(item => isSelected(getId(item)));
      onSelectionChange(selectedItems);
    }
  }, [selectedIds, items, getId, isSelected, onSelectionChange]);

  // Register item ref
  const registerItemRef = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        itemRefs.current.set(id, element);
        registerItem({ id, element, data: items.find(item => getId(item) === id) });
      } else {
        const existing = itemRefs.current.get(id);
        if (existing) {
          itemRefs.current.delete(id);
          unregisterItem(id);
        }
      }
    },
    [items, getId, registerItem, unregisterItem]
  );

  // Create item props helper
  const getItemProps = useCallback(
    (item: T, index: number) => {
      const id = getId(item);
      const selected = isSelected(id);

      return {
        id,
        'data-selectable': true,
        'data-selected': selected,
        'data-index': index,
        role: 'option',
        'aria-selected': selected,
        tabIndex: index === 0 ? 0 : -1,
        ref: (el: HTMLElement | null) => registerItemRef(id, el),
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          handleClick(id, e);
        },
        onDoubleClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onDoubleClick?.(item);
        },
        onContextMenu: (e: React.MouseEvent) => {
          e.stopPropagation();
          onContextMenu?.(item, e);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          handleKeyNavigation(e, id, index);
        },
      };
    },
    [getId, isSelected, handleClick, registerItemRef, onDoubleClick, onContextMenu]
  );

  // Keyboard navigation
  const handleKeyNavigation = useCallback(
    (e: React.KeyboardEvent, currentId: string, currentIndex: number) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmd = isMac ? e.metaKey : e.ctrlKey;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          e.preventDefault();
          const nextIndex = currentIndex + 1;
          if (nextIndex < items.length) {
            const nextId = getId(items[nextIndex]);
            const nextEl = itemRefs.current.get(nextId);
            nextEl?.focus();
            if (!e.shiftKey) {
              handleClick(nextId, e as unknown as React.MouseEvent);
            }
          }
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          e.preventDefault();
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            const prevId = getId(items[prevIndex]);
            const prevEl = itemRefs.current.get(prevId);
            prevEl?.focus();
            if (!e.shiftKey) {
              handleClick(prevId, e as unknown as React.MouseEvent);
            }
          }
          break;
        }

        case ' ':
        case 'Enter': {
          e.preventDefault();
          if (e.key === 'Enter') {
            onDoubleClick?.(items[currentIndex]);
          } else {
            handleClick(currentId, e as unknown as React.MouseEvent);
          }
          break;
        }

        case 'a':
        case 'A': {
          if (isCmd) {
            e.preventDefault();
            selectAll();
          }
          break;
        }

        case 'Escape': {
          e.preventDefault();
          clearSelection();
          break;
        }
      }
    },
    [items, getId, handleClick, selectAll, clearSelection, onDoubleClick]
  );

  // Get container props for the list/grid container
  const getContainerProps = useCallback(() => {
    return {
      ref: containerRef,
      role: 'listbox',
      'aria-multiselectable': true,
      onClick: (e: React.MouseEvent) => {
        // Clear selection when clicking on empty space
        if (e.target === e.currentTarget) {
          clearSelection();
        }
      },
    };
  }, [clearSelection]);

  // Get selected items data
  const getSelectedItemsData = useCallback(() => {
    return items.filter(item => isSelected(getId(item)));
  }, [items, getId, isSelected]);

  return {
    selectedIds,
    isSelected,
    getItemProps,
    getContainerProps,
    getSelectedItemsData,
    selectAll,
    clearSelection,
  };
}

export default useSelectableList;
