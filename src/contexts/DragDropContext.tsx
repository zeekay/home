import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

// Drag item types
export type DragItemType = 'file' | 'folder' | 'text' | 'image' | 'url';

// Drag operation types
export type DragOperation = 'copy' | 'move' | 'link';

// File item interface (matches ZFinderWindow's FileItem)
export interface DragFileItem {
  name: string;
  type: 'folder' | 'file';
  path: string[];
  content?: string;
  url?: string;
  size?: string;
  modified?: string;
}

// Generic draggable item
export interface DragItem {
  itemType: DragItemType;
  data: DragFileItem | string; // FileItem for files/folders, string for text/url
  source: string; // App that initiated the drag (e.g., 'finder', 'photos', 'safari')
}

// Drop zone info
export interface DropZone {
  id: string;
  accepts: DragItemType[];
  element: HTMLElement | null;
}

// Context state
interface DragDropState {
  isDragging: boolean;
  dragItem: DragItem | null;
  operation: DragOperation;
  dropZones: Map<string, DropZone>;
  activeDropZone: string | null;
  springLoadedFolder: string | null;
  springLoadTimer: ReturnType<typeof setTimeout> | null;
}

// Context API
interface DragDropContextType {
  // State
  isDragging: boolean;
  dragItem: DragItem | null;
  operation: DragOperation;
  activeDropZone: string | null;
  
  // Drag operations
  startDrag: (item: DragItem, event: React.DragEvent) => void;
  updateOperation: (op: DragOperation) => void;
  endDrag: () => void;
  
  // Drop zone management
  registerDropZone: (id: string, accepts: DragItemType[], element: HTMLElement) => void;
  unregisterDropZone: (id: string) => void;
  setActiveDropZone: (id: string | null) => void;
  canDrop: (zoneId: string) => boolean;
  
  // Spring-loaded folders (hover to open)
  startSpringLoad: (folderId: string) => void;
  cancelSpringLoad: () => void;
  isSpringLoading: (folderId: string) => boolean;
  
  // Helpers
  createDragImage: (icon: React.ReactNode, label: string) => HTMLElement;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

// Spring load delay (ms) - how long to hover before folder opens
const SPRING_LOAD_DELAY = 800;

export const DragDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    dragItem: null,
    operation: 'move',
    dropZones: new Map(),
    activeDropZone: null,
    springLoadedFolder: null,
    springLoadTimer: null,
  });
  
  // Ref for drag image element
  const dragImageRef = useRef<HTMLElement | null>(null);
  
  // Start a drag operation
  const startDrag = useCallback((item: DragItem, event: React.DragEvent) => {
    // Set drag data for HTML5 DnD API
    event.dataTransfer.effectAllowed = 'all';
    
    // Set data based on item type
    if (item.itemType === 'file' || item.itemType === 'folder') {
      const fileData = item.data as DragFileItem;
      event.dataTransfer.setData('application/x-zos-file', JSON.stringify(fileData));
      event.dataTransfer.setData('text/plain', fileData.name);
      if (fileData.url) {
        event.dataTransfer.setData('text/uri-list', fileData.url);
      }
    } else if (item.itemType === 'text') {
      event.dataTransfer.setData('text/plain', item.data as string);
    } else if (item.itemType === 'url') {
      event.dataTransfer.setData('text/uri-list', item.data as string);
      event.dataTransfer.setData('text/plain', item.data as string);
    } else if (item.itemType === 'image') {
      event.dataTransfer.setData('text/plain', item.data as string);
    }
    
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragItem: item,
      operation: 'move',
    }));
  }, []);
  
  // Update operation based on modifier keys
  const updateOperation = useCallback((op: DragOperation) => {
    setState(prev => ({ ...prev, operation: op }));
  }, []);
  
  // End drag operation
  const endDrag = useCallback(() => {
    // Clear spring load timer
    if (state.springLoadTimer) {
      clearTimeout(state.springLoadTimer);
    }
    
    // Clean up drag image
    if (dragImageRef.current && dragImageRef.current.parentNode) {
      dragImageRef.current.parentNode.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragItem: null,
      operation: 'move',
      activeDropZone: null,
      springLoadedFolder: null,
      springLoadTimer: null,
    }));
  }, [state.springLoadTimer]);
  
  // Register a drop zone
  const registerDropZone = useCallback((id: string, accepts: DragItemType[], element: HTMLElement) => {
    setState(prev => {
      const newZones = new Map(prev.dropZones);
      newZones.set(id, { id, accepts, element });
      return { ...prev, dropZones: newZones };
    });
  }, []);
  
  // Unregister a drop zone
  const unregisterDropZone = useCallback((id: string) => {
    setState(prev => {
      const newZones = new Map(prev.dropZones);
      newZones.delete(id);
      return { ...prev, dropZones: newZones };
    });
  }, []);
  
  // Set active drop zone (for highlighting)
  const setActiveDropZone = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeDropZone: id }));
  }, []);
  
  // Check if current drag item can be dropped in zone
  const canDrop = useCallback((zoneId: string): boolean => {
    const zone = state.dropZones.get(zoneId);
    if (!zone || !state.dragItem) return false;
    return zone.accepts.includes(state.dragItem.itemType);
  }, [state.dropZones, state.dragItem]);
  
  // Spring-loaded folder handling
  const startSpringLoad = useCallback((folderId: string) => {
    // Clear existing timer
    if (state.springLoadTimer) {
      clearTimeout(state.springLoadTimer);
    }
    
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, springLoadedFolder: folderId }));
    }, SPRING_LOAD_DELAY);
    
    setState(prev => ({
      ...prev,
      springLoadTimer: timer,
    }));
  }, [state.springLoadTimer]);
  
  const cancelSpringLoad = useCallback(() => {
    if (state.springLoadTimer) {
      clearTimeout(state.springLoadTimer);
    }
    setState(prev => ({
      ...prev,
      springLoadTimer: null,
      springLoadedFolder: null,
    }));
  }, [state.springLoadTimer]);
  
  const isSpringLoading = useCallback((folderId: string): boolean => {
    return state.springLoadedFolder === folderId;
  }, [state.springLoadedFolder]);
  
  // Create custom drag image
  const createDragImage = useCallback((icon: React.ReactNode, label: string): HTMLElement => {
    // Create drag ghost element
    const ghost = document.createElement('div');
    ghost.className = 'fixed pointer-events-none z-[10000] flex flex-col items-center p-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-2xl';
    ghost.style.cssText = 'top: -1000px; left: -1000px;';
    
    // Add icon placeholder (we'll style it with CSS)
    const iconDiv = document.createElement('div');
    iconDiv.className = 'w-12 h-12 flex items-center justify-center text-blue-400';
    iconDiv.innerHTML = '📄'; // Default file emoji, real icon would be rendered via React
    ghost.appendChild(iconDiv);
    
    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'text-xs text-white/80 mt-1 max-w-[100px] truncate text-center';
    labelDiv.textContent = label;
    ghost.appendChild(labelDiv);
    
    document.body.appendChild(ghost);
    dragImageRef.current = ghost;
    
    return ghost;
  }, []);
  
  return (
    <DragDropContext.Provider value={{
      isDragging: state.isDragging,
      dragItem: state.dragItem,
      operation: state.operation,
      activeDropZone: state.activeDropZone,
      startDrag,
      updateOperation,
      endDrag,
      registerDropZone,
      unregisterDropZone,
      setActiveDropZone,
      canDrop,
      startSpringLoad,
      cancelSpringLoad,
      isSpringLoading,
      createDragImage,
    }}>
      {children}
    </DragDropContext.Provider>
  );
};

// Hook to use drag/drop context
export const useDragDrop = (): DragDropContextType => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

// Hook for drag source behavior
export const useDragSource = (item: DragItem | null) => {
  const { startDrag, updateOperation, endDrag, isDragging } = useDragDrop();
  
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!item) return;
    startDrag(item, e);
  }, [item, startDrag]);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    // Update operation based on modifier keys
    if (e.altKey) {
      updateOperation('copy');
    } else if (e.metaKey || e.ctrlKey) {
      updateOperation('link');
    } else {
      updateOperation('move');
    }
  }, [updateOperation]);
  
  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);
  
  return {
    draggable: !!item,
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
    isDragging,
  };
};

// Hook for drop target behavior
export const useDropTarget = (
  id: string,
  accepts: DragItemType[],
  onDrop: (item: DragItem, operation: DragOperation) => void
) => {
  const { 
    setActiveDropZone, 
    canDrop, 
    activeDropZone,
    dragItem,
    operation,
    isDragging,
    registerDropZone,
    unregisterDropZone,
  } = useDragDrop();
  
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Register drop zone on mount
  React.useEffect(() => {
    if (elementRef.current) {
      registerDropZone(id, accepts, elementRef.current);
    }
    return () => {
      unregisterDropZone(id);
    };
  }, [id, accepts, registerDropZone, unregisterDropZone]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set drop effect based on operation
    if (e.altKey) {
      e.dataTransfer.dropEffect = 'copy';
    } else if (e.metaKey || e.ctrlKey) {
      e.dataTransfer.dropEffect = 'link';
    } else {
      e.dataTransfer.dropEffect = 'move';
    }
    
    if (canDrop(id)) {
      setActiveDropZone(id);
    }
  }, [id, canDrop, setActiveDropZone]);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canDrop(id)) {
      setActiveDropZone(id);
    }
  }, [id, canDrop, setActiveDropZone]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving to outside this element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (activeDropZone === id) {
        setActiveDropZone(null);
      }
    }
  }, [id, activeDropZone, setActiveDropZone]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActiveDropZone(null);
    
    // Try to get zOS file data first
    const zosFileData = e.dataTransfer.getData('application/x-zos-file');
    if (zosFileData && dragItem) {
      onDrop(dragItem, operation);
      return;
    }
    
    // Handle external drops (from OS file system or other sources)
    const files = e.dataTransfer.files;
    if (files.length > 0 && accepts.includes('file')) {
      // Handle file drop from OS
      Array.from(files).forEach(file => {
        const externalItem: DragItem = {
          itemType: file.type.startsWith('image/') ? 'image' : 'file',
          data: {
            name: file.name,
            type: 'file',
            path: ['External'],
            size: `${Math.round(file.size / 1024)} KB`,
          },
          source: 'external',
        };
        onDrop(externalItem, 'copy');
      });
      return;
    }
    
    // Handle URL drops
    const urlData = e.dataTransfer.getData('text/uri-list');
    if (urlData && accepts.includes('url')) {
      const urlItem: DragItem = {
        itemType: 'url',
        data: urlData,
        source: 'external',
      };
      onDrop(urlItem, 'copy');
      return;
    }
    
    // Handle text drops
    const textData = e.dataTransfer.getData('text/plain');
    if (textData && accepts.includes('text')) {
      const textItem: DragItem = {
        itemType: 'text',
        data: textData,
        source: 'external',
      };
      onDrop(textItem, 'copy');
    }
  }, [accepts, dragItem, operation, onDrop, setActiveDropZone]);
  
  const setRef = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
    if (el) {
      registerDropZone(id, accepts, el);
    }
  }, [id, accepts, registerDropZone]);
  
  return {
    ref: setRef,
    onDragOver: handleDragOver,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    isOver: activeDropZone === id,
    canDrop: isDragging && canDrop(id),
  };
};

export default DragDropContext;
