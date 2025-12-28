import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { AppType } from '@/hooks/useWindowManager';

// A Space represents a virtual desktop
export interface Space {
  id: string;
  name: string;
  isActive: boolean;
  windowIds: AppType[]; // Windows assigned to this space
}

interface SpacesContextType {
  // State
  spaces: Space[];
  activeSpaceId: string;
  
  // Space management
  addSpace: () => void;
  removeSpace: (id: string) => void;
  setActiveSpace: (id: string) => void;
  renameSpace: (id: string, name: string) => void;
  
  // Window-to-space assignment
  moveWindowToSpace: (windowId: AppType, spaceId: string) => void;
  getWindowsInSpace: (spaceId: string) => AppType[];
  getSpaceForWindow: (windowId: AppType) => string;
  
  // Navigation
  goToNextSpace: () => void;
  goToPrevSpace: () => void;
}

const SpacesContext = createContext<SpacesContextType | undefined>(undefined);

// Generate unique ID for spaces
let spaceIdCounter = 0;
function generateSpaceId(): string {
  spaceIdCounter += 1;
  return `space-${spaceIdCounter}`;
}

// Default space
const createDefaultSpace = (): Space => ({
  id: 'space-1',
  name: 'Desktop 1',
  isActive: true,
  windowIds: [],
});

const STORAGE_KEY = 'zos-spaces';

export const SpacesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          spaceIdCounter = parsed.length;
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    spaceIdCounter = 1;
    return [createDefaultSpace()];
  });

  const [activeSpaceId, setActiveSpaceId] = useState<string>(() => {
    const active = spaces.find(s => s.isActive);
    return active?.id ?? spaces[0]?.id ?? 'space-1';
  });

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  }, [spaces]);

  const addSpace = useCallback(() => {
    const newId = generateSpaceId();
    const newSpace: Space = {
      id: newId,
      name: `Desktop ${spaces.length + 1}`,
      isActive: false,
      windowIds: [],
    };
    setSpaces(prev => [...prev, newSpace]);
  }, [spaces.length]);

  const removeSpace = useCallback((id: string) => {
    // Cannot remove the last space
    if (spaces.length <= 1) return;
    
    setSpaces(prev => {
      const filtered = prev.filter(s => s.id !== id);
      // If removing active space, activate the first remaining space
      if (id === activeSpaceId) {
        const newActive = filtered[0];
        if (newActive) {
          newActive.isActive = true;
          setActiveSpaceId(newActive.id);
        }
      }
      return filtered;
    });
  }, [spaces.length, activeSpaceId]);

  const setActiveSpace = useCallback((id: string) => {
    setSpaces(prev => prev.map(s => ({
      ...s,
      isActive: s.id === id,
    })));
    setActiveSpaceId(id);
  }, []);

  const renameSpace = useCallback((id: string, name: string) => {
    setSpaces(prev => prev.map(s => 
      s.id === id ? { ...s, name } : s
    ));
  }, []);

  const moveWindowToSpace = useCallback((windowId: AppType, spaceId: string) => {
    setSpaces(prev => prev.map(s => ({
      ...s,
      windowIds: s.id === spaceId 
        ? [...s.windowIds.filter(w => w !== windowId), windowId]
        : s.windowIds.filter(w => w !== windowId),
    })));
  }, []);

  const getWindowsInSpace = useCallback((spaceId: string): AppType[] => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.windowIds ?? [];
  }, [spaces]);

  const getSpaceForWindow = useCallback((windowId: AppType): string => {
    const space = spaces.find(s => s.windowIds.includes(windowId));
    return space?.id ?? activeSpaceId;
  }, [spaces, activeSpaceId]);

  const goToNextSpace = useCallback(() => {
    const currentIndex = spaces.findIndex(s => s.id === activeSpaceId);
    const nextIndex = (currentIndex + 1) % spaces.length;
    setActiveSpace(spaces[nextIndex].id);
  }, [spaces, activeSpaceId, setActiveSpace]);

  const goToPrevSpace = useCallback(() => {
    const currentIndex = spaces.findIndex(s => s.id === activeSpaceId);
    const prevIndex = (currentIndex - 1 + spaces.length) % spaces.length;
    setActiveSpace(spaces[prevIndex].id);
  }, [spaces, activeSpaceId, setActiveSpace]);

  const value = useMemo(() => ({
    spaces,
    activeSpaceId,
    addSpace,
    removeSpace,
    setActiveSpace,
    renameSpace,
    moveWindowToSpace,
    getWindowsInSpace,
    getSpaceForWindow,
    goToNextSpace,
    goToPrevSpace,
  }), [
    spaces, activeSpaceId, addSpace, removeSpace, setActiveSpace,
    renameSpace, moveWindowToSpace, getWindowsInSpace, getSpaceForWindow,
    goToNextSpace, goToPrevSpace,
  ]);

  return (
    <SpacesContext.Provider value={value}>
      {children}
    </SpacesContext.Provider>
  );
};

export const useSpaces = (): SpacesContextType => {
  const context = useContext(SpacesContext);
  if (!context) {
    throw new Error('useSpaces must be used within SpacesProvider');
  }
  return context;
};

export default SpacesContext;
