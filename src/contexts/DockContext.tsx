import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface DockItem {
  id: string;
  isPinned: boolean;
  order: number;
}

interface DockContextType {
  dockOrder: DockItem[];
  reorderItems: (dragId: string, dropId: string) => void;
  removeFromDock: (id: string) => void;
  addToDock: (id: string) => void;
  pinItem: (id: string) => void;
  unpinItem: (id: string) => void;
  isItemInDock: (id: string) => boolean;
  isItemPinned: (id: string) => boolean;
}

const DockContext = createContext<DockContextType | undefined>(undefined);

// Default dock items - these are always available
const DEFAULT_DOCK_ITEMS: DockItem[] = [
  { id: 'finder', isPinned: true, order: 0 },
  { id: 'safari', isPinned: true, order: 1 },
  { id: 'mail', isPinned: true, order: 2 },
  { id: 'photos', isPinned: true, order: 3 },
  { id: 'calendar', isPinned: true, order: 4 },
  { id: 'socials', isPinned: true, order: 5 },
  { id: 'facetime', isPinned: true, order: 6 },
  { id: 'music', isPinned: true, order: 7 },
  { id: 'terminal', isPinned: true, order: 8 },
  { id: 'textedit', isPinned: true, order: 9 },
  { id: 'hanzo', isPinned: true, order: 10 },
  { id: 'lux', isPinned: true, order: 11 },
  { id: 'zoo', isPinned: true, order: 12 },
];

const STORAGE_KEY = 'zos-dock-order';

export const DockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dockOrder, setDockOrder] = useState<DockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new items
        const savedIds = new Set(parsed.map((item: DockItem) => item.id));
        const merged = [...parsed];
        DEFAULT_DOCK_ITEMS.forEach((item) => {
          if (!savedIds.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      }
    } catch (e) {
      logger.error('Failed to parse dock order:', e);
    }
    return DEFAULT_DOCK_ITEMS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dockOrder));
  }, [dockOrder]);

  const reorderItems = useCallback((dragId: string, dropId: string) => {
    if (dragId === dropId) return;

    setDockOrder(prev => {
      const items = [...prev];
      const dragIndex = items.findIndex(item => item.id === dragId);
      const dropIndex = items.findIndex(item => item.id === dropId);

      if (dragIndex === -1 || dropIndex === -1) return prev;

      const [draggedItem] = items.splice(dragIndex, 1);
      items.splice(dropIndex, 0, draggedItem);

      // Update order numbers
      return items.map((item, index) => ({ ...item, order: index }));
    });
  }, []);

  const removeFromDock = useCallback((id: string) => {
    // Finder cannot be removed
    if (id === 'finder') return;

    setDockOrder(prev => {
      const items = prev.filter(item => item.id !== id);
      return items.map((item, index) => ({ ...item, order: index }));
    });
  }, []);

  const addToDock = useCallback((id: string) => {
    setDockOrder(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [...prev, { id, isPinned: false, order: prev.length }];
    });
  }, []);

  const pinItem = useCallback((id: string) => {
    setDockOrder(prev => prev.map(item =>
      item.id === id ? { ...item, isPinned: true } : item
    ));
  }, []);

  const unpinItem = useCallback((id: string) => {
    // Finder is always pinned
    if (id === 'finder') return;

    setDockOrder(prev => prev.map(item =>
      item.id === id ? { ...item, isPinned: false } : item
    ));
  }, []);

  const isItemInDock = useCallback((id: string) => {
    return dockOrder.some(item => item.id === id);
  }, [dockOrder]);

  const isItemPinned = useCallback((id: string) => {
    const item = dockOrder.find(i => i.id === id);
    return item?.isPinned ?? false;
  }, [dockOrder]);

  return (
    <DockContext.Provider value={{
      dockOrder,
      reorderItems,
      removeFromDock,
      addToDock,
      pinItem,
      unpinItem,
      isItemInDock,
      isItemPinned,
    }}>
      {children}
    </DockContext.Provider>
  );
};

// Default no-op functions for when context is not available
const defaultContext: DockContextType = {
  dockOrder: DEFAULT_DOCK_ITEMS,
  reorderItems: () => {},
  removeFromDock: () => {},
  addToDock: () => {},
  pinItem: () => {},
  unpinItem: () => {},
  isItemInDock: () => true,
  isItemPinned: () => true,
};

export const useDock = (): DockContextType => {
  const context = useContext(DockContext);
  // Return default context if not within provider (graceful degradation)
  return context ?? defaultContext;
};
