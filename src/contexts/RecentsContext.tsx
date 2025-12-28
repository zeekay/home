import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface RecentItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder' | 'app';
  appId?: string; // Which app opened it
  icon?: string;
  timestamp: number;
}

interface RecentsContextType {
  recentItems: RecentItem[];
  recentApps: string[];
  addRecent: (item: Omit<RecentItem, 'timestamp'>) => void;
  addRecentApp: (appId: string) => void;
  getRecentsForApp: (appId: string) => RecentItem[];
  clearRecents: () => void;
  clearRecentsForApp: (appId: string) => void;
}

const RecentsContext = createContext<RecentsContextType | undefined>(undefined);

const STORAGE_KEY = 'zos-recents';
const APPS_STORAGE_KEY = 'zos-recent-apps';
const MAX_RECENTS = 20;
const MAX_RECENT_APPS = 10;

export const RecentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentApps, setRecentApps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(APPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentItems));
  }, [recentItems]);

  useEffect(() => {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(recentApps));
  }, [recentApps]);

  const addRecent = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
    setRecentItems(prev => {
      // Remove existing entry with same id
      const filtered = prev.filter(r => r.id !== item.id);
      // Add new entry at the beginning
      const newItem: RecentItem = { ...item, timestamp: Date.now() };
      const updated = [newItem, ...filtered].slice(0, MAX_RECENTS);
      return updated;
    });
  }, []);

  const addRecentApp = useCallback((appId: string) => {
    setRecentApps(prev => {
      const filtered = prev.filter(id => id !== appId);
      return [appId, ...filtered].slice(0, MAX_RECENT_APPS);
    });
  }, []);

  const getRecentsForApp = useCallback((appId: string): RecentItem[] => {
    return recentItems.filter(item => item.appId === appId).slice(0, 10);
  }, [recentItems]);

  const clearRecents = useCallback(() => {
    setRecentItems([]);
    setRecentApps([]);
  }, []);

  const clearRecentsForApp = useCallback((appId: string) => {
    setRecentItems(prev => prev.filter(item => item.appId !== appId));
  }, []);

  return (
    <RecentsContext.Provider value={{
      recentItems,
      recentApps,
      addRecent,
      addRecentApp,
      getRecentsForApp,
      clearRecents,
      clearRecentsForApp,
    }}>
      {children}
    </RecentsContext.Provider>
  );
};

export const useRecents = () => {
  const context = useContext(RecentsContext);
  if (!context) {
    throw new Error('useRecents must be used within RecentsProvider');
  }
  return context;
};
