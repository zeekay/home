import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from 'react';

// Selection item with unique identifier and bounding rect
export interface SelectableItem {
  id: string;
  element: HTMLElement;
  data?: unknown;
}

// Rubber band selection rectangle
export interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Selection context state
interface SelectionState {
  // Currently selected item IDs
  selectedIds: Set<string>;
  // Last clicked item for shift-click range selection
  lastClickedId: string | null;
  // Rubber band selection in progress
  isSelecting: boolean;
  selectionRect: SelectionRect | null;
  // Registered selectable items
  selectableItems: Map<string, SelectableItem>;
  // Container element for rubber band selection
  containerRef: HTMLElement | null;
}

// Selection context API
interface SelectionContextType {
  // State
  selectedIds: Set<string>;
  isSelecting: boolean;
  selectionRect: SelectionRect | null;
  selectionCount: number;

  // Selection operations
  select: (id: string, options?: SelectOptions) => void;
  deselect: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectRange: (startId: string, endId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // Click handlers
  handleClick: (id: string, event: React.MouseEvent) => void;

  // Rubber band selection
  startRubberBand: (event: React.MouseEvent, container: HTMLElement) => void;
  updateRubberBand: (event: MouseEvent) => void;
  endRubberBand: () => void;

  // Item registration
  registerItem: (item: SelectableItem) => void;
  unregisterItem: (id: string) => void;
  getSelectedItems: () => SelectableItem[];

  // Container registration
  setContainer: (container: HTMLElement | null) => void;

  // Drag selection state for ghost preview
  isDraggingSelection: boolean;
  setDraggingSelection: (dragging: boolean) => void;
  dragPosition: { x: number; y: number } | null;
  setDragPosition: (pos: { x: number; y: number } | null) => void;
}

interface SelectOptions {
  additive?: boolean; // Cmd+click behavior
  range?: boolean; // Shift+click behavior
  exclusive?: boolean; // Normal click behavior
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

// macOS selection color
export const SELECTION_COLOR = '#0A84FF';
export const SELECTION_BG = 'rgba(10, 132, 255, 0.2)';
export const SELECTION_BORDER = 'rgba(10, 132, 255, 0.5)';

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SelectionState>({
    selectedIds: new Set(),
    lastClickedId: null,
    isSelecting: false,
    selectionRect: null,
    selectableItems: new Map(),
    containerRef: null,
  });

  const [isDraggingSelection, setDraggingSelection] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Refs for event handling
  const stateRef = useRef(state);
  stateRef.current = state;

  // Select a single item
  const select = useCallback((id: string, options: SelectOptions = {}) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);

      if (options.additive) {
        // Cmd+click: toggle this item
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
      } else if (options.range && prev.lastClickedId) {
        // Shift+click: select range
        const items = Array.from(prev.selectableItems.keys());
        const startIdx = items.indexOf(prev.lastClickedId);
        const endIdx = items.indexOf(id);

        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          for (let i = from; i <= to; i++) {
            newSelected.add(items[i]);
          }
        } else {
          newSelected.add(id);
        }
      } else if (options.exclusive !== false) {
        // Normal click: exclusive selection
        newSelected.clear();
        newSelected.add(id);
      } else {
        newSelected.add(id);
      }

      return {
        ...prev,
        selectedIds: newSelected,
        lastClickedId: id,
      };
    });
  }, []);

  // Deselect a single item
  const deselect = useCallback((id: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);
      newSelected.delete(id);
      return { ...prev, selectedIds: newSelected };
    });
  }, []);

  // Toggle selection of an item
  const toggleSelection = useCallback((id: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { ...prev, selectedIds: newSelected, lastClickedId: id };
    });
  }, []);

  // Select a range of items
  const selectRange = useCallback((startId: string, endId: string) => {
    setState(prev => {
      const items = Array.from(prev.selectableItems.keys());
      const startIdx = items.indexOf(startId);
      const endIdx = items.indexOf(endId);

      if (startIdx === -1 || endIdx === -1) {
        return prev;
      }

      const newSelected = new Set(prev.selectedIds);
      const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];

      for (let i = from; i <= to; i++) {
        newSelected.add(items[i]);
      }

      return {
        ...prev,
        selectedIds: newSelected,
        lastClickedId: endId,
      };
    });
  }, []);

  // Select all items
  const selectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: new Set(prev.selectableItems.keys()),
    }));
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIds: new Set(),
      lastClickedId: null,
    }));
  }, []);

  // Check if item is selected
  const isSelected = useCallback((id: string) => {
    return stateRef.current.selectedIds.has(id);
  }, []);

  // Handle click with modifier key detection
  const handleClick = useCallback((id: string, event: React.MouseEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCmd = isMac ? event.metaKey : event.ctrlKey;
    const isShift = event.shiftKey;

    if (isCmd) {
      select(id, { additive: true });
    } else if (isShift) {
      select(id, { range: true });
    } else {
      select(id, { exclusive: true });
    }
  }, [select]);

  // Start rubber band selection
  const startRubberBand = useCallback((event: React.MouseEvent, container: HTMLElement) => {
    // Only start on left click without modifiers (or with shift to extend)
    if (event.button !== 0) return;

    const rect = container.getBoundingClientRect();
    const startX = event.clientX - rect.left + container.scrollLeft;
    const startY = event.clientY - rect.top + container.scrollTop;

    setState(prev => ({
      ...prev,
      isSelecting: true,
      selectionRect: { startX, startY, endX: startX, endY: startY },
      containerRef: container,
      // Clear selection unless shift is held
      selectedIds: event.shiftKey ? prev.selectedIds : new Set(),
    }));
  }, []);

  // Update rubber band selection
  const updateRubberBand = useCallback((event: MouseEvent) => {
    setState(prev => {
      if (!prev.isSelecting || !prev.selectionRect || !prev.containerRef) {
        return prev;
      }

      const rect = prev.containerRef.getBoundingClientRect();
      const endX = event.clientX - rect.left + prev.containerRef.scrollLeft;
      const endY = event.clientY - rect.top + prev.containerRef.scrollTop;

      const newRect = { ...prev.selectionRect, endX, endY };

      // Calculate selection box bounds
      const minX = Math.min(newRect.startX, newRect.endX);
      const maxX = Math.max(newRect.startX, newRect.endX);
      const minY = Math.min(newRect.startY, newRect.endY);
      const maxY = Math.max(newRect.startY, newRect.endY);

      // Find items that intersect with selection box
      const newSelected = new Set<string>();
      const containerRect = prev.containerRef.getBoundingClientRect();

      prev.selectableItems.forEach((item, id) => {
        const itemRect = item.element.getBoundingClientRect();

        // Convert item rect to container-relative coordinates
        const itemLeft = itemRect.left - containerRect.left + prev.containerRef!.scrollLeft;
        const itemTop = itemRect.top - containerRect.top + prev.containerRef!.scrollTop;
        const itemRight = itemLeft + itemRect.width;
        const itemBottom = itemTop + itemRect.height;

        // Check intersection
        const intersects =
          itemLeft < maxX &&
          itemRight > minX &&
          itemTop < maxY &&
          itemBottom > minY;

        if (intersects) {
          newSelected.add(id);
        }
      });

      return {
        ...prev,
        selectionRect: newRect,
        selectedIds: newSelected,
      };
    });
  }, []);

  // End rubber band selection
  const endRubberBand = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSelecting: false,
      selectionRect: null,
    }));
  }, []);

  // Register a selectable item
  const registerItem = useCallback((item: SelectableItem) => {
    setState(prev => {
      const newItems = new Map(prev.selectableItems);
      newItems.set(item.id, item);
      return { ...prev, selectableItems: newItems };
    });
  }, []);

  // Unregister a selectable item
  const unregisterItem = useCallback((id: string) => {
    setState(prev => {
      const newItems = new Map(prev.selectableItems);
      newItems.delete(id);
      const newSelected = new Set(prev.selectedIds);
      newSelected.delete(id);
      return { ...prev, selectableItems: newItems, selectedIds: newSelected };
    });
  }, []);

  // Get all selected items
  const getSelectedItems = useCallback(() => {
    const items: SelectableItem[] = [];
    stateRef.current.selectedIds.forEach(id => {
      const item = stateRef.current.selectableItems.get(id);
      if (item) items.push(item);
    });
    return items;
  }, []);

  // Set container element
  const setContainer = useCallback((container: HTMLElement | null) => {
    setState(prev => ({ ...prev, containerRef: container }));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmd = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+A: Select All
      if (isCmd && e.key === 'a') {
        // Only if we have items registered
        if (stateRef.current.selectableItems.size > 0) {
          e.preventDefault();
          selectAll();
        }
      }

      // Escape: Clear selection
      if (e.key === 'Escape' && stateRef.current.selectedIds.size > 0) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, clearSelection]);

  // Global mouse events for rubber band
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (stateRef.current.isSelecting) {
        updateRubberBand(e);
      }
    };

    const handleMouseUp = () => {
      if (stateRef.current.isSelecting) {
        endRubberBand();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateRubberBand, endRubberBand]);

  return (
    <SelectionContext.Provider
      value={{
        selectedIds: state.selectedIds,
        isSelecting: state.isSelecting,
        selectionRect: state.selectionRect,
        selectionCount: state.selectedIds.size,
        select,
        deselect,
        toggleSelection,
        selectRange,
        selectAll,
        clearSelection,
        isSelected,
        handleClick,
        startRubberBand,
        updateRubberBand,
        endRubberBand,
        registerItem,
        unregisterItem,
        getSelectedItems,
        setContainer,
        isDraggingSelection,
        setDraggingSelection,
        dragPosition,
        setDragPosition,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

// Hook to use selection context
export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export default SelectionContext;
