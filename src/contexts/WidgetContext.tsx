import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logger } from '@/lib/logger';

export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetType = 'clock' | 'weather' | 'calendar' | 'stocks' | 'notes' | 'photos' | 'battery';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
}

interface WidgetContextType {
  widgets: WidgetInstance[];
  editMode: boolean;
  showGallery: boolean;
  addWidget: (type: WidgetType, size?: WidgetSize) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Omit<WidgetInstance, 'id' | 'type'>>) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  toggleEditMode: () => void;
  openGallery: () => void;
  closeGallery: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

const STORAGE_KEY = 'zos-widgets';

// Widget size dimensions
export const WIDGET_SIZES: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 170, height: 170 },
  medium: { width: 170, height: 360 },
  large: { width: 360, height: 360 },
};

// Widget metadata for gallery
export const WIDGET_METADATA: Record<WidgetType, { name: string; description: string; icon: string; availableSizes: WidgetSize[] }> = {
  clock: { 
    name: 'Clock', 
    description: 'Analog or digital clock display',
    icon: 'Clock',
    availableSizes: ['small', 'medium', 'large'],
  },
  weather: { 
    name: 'Weather', 
    description: 'Current weather conditions',
    icon: 'Cloud',
    availableSizes: ['small', 'medium', 'large'],
  },
  calendar: { 
    name: 'Calendar', 
    description: 'Upcoming events and dates',
    icon: 'Calendar',
    availableSizes: ['small', 'medium', 'large'],
  },
  stocks: { 
    name: 'Stocks', 
    description: 'Stock prices and changes',
    icon: 'TrendingUp',
    availableSizes: ['small', 'medium', 'large'],
  },
  notes: { 
    name: 'Notes', 
    description: 'Quick notes and reminders',
    icon: 'StickyNote',
    availableSizes: ['small', 'medium', 'large'],
  },
  photos: { 
    name: 'Photos', 
    description: 'Photo slideshow from your library',
    icon: 'Image',
    availableSizes: ['small', 'medium', 'large'],
  },
  battery: { 
    name: 'Battery', 
    description: 'Battery status and health',
    icon: 'Battery',
    availableSizes: ['small'],
  },
};

// Generate unique ID
const generateId = (): string => `widget-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Find non-overlapping position for new widget
const findAvailablePosition = (widgets: WidgetInstance[], size: WidgetSize): { x: number; y: number } => {
  const dimensions = WIDGET_SIZES[size];
  const menuBarHeight = 28;
  const dockHeight = 90;
  const padding = 20;
  
  // Start from top-left, below menu bar
  const startX = padding;
  const startY = menuBarHeight + padding;
  const maxX = window.innerWidth - dimensions.width - padding;
  const maxY = window.innerHeight - dimensions.height - dockHeight - padding;
  
  // Grid-based placement
  const gridX = dimensions.width + 20;
  const gridY = dimensions.height + 20;
  
  for (let y = startY; y <= maxY; y += gridY) {
    for (let x = startX; x <= maxX; x += gridX) {
      const overlap = widgets.some(w => {
        const wDim = WIDGET_SIZES[w.size];
        return !(x + dimensions.width < w.position.x || 
                 x > w.position.x + wDim.width ||
                 y + dimensions.height < w.position.y || 
                 y > w.position.y + wDim.height);
      });
      if (!overlap) return { x, y };
    }
  }
  
  // Fallback: offset from last widget
  const lastWidget = widgets[widgets.length - 1];
  if (lastWidget) {
    return {
      x: Math.min(lastWidget.position.x + 30, maxX),
      y: Math.min(lastWidget.position.y + 30, maxY),
    };
  }
  
  return { x: startX, y: startY };
};

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logger.error('Failed to parse widgets:', e);
    }
    return [];
  });
  
  const [editMode, setEditMode] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (e) {
      logger.error('Failed to save widgets:', e);
    }
  }, [widgets]);

  const addWidget = useCallback((type: WidgetType, size: WidgetSize = 'small') => {
    setWidgets(prev => {
      const position = findAvailablePosition(prev, size);
      const newWidget: WidgetInstance = {
        id: generateId(),
        type,
        size,
        position,
      };
      return [...prev, newWidget];
    });
    setShowGallery(false);
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<Omit<WidgetInstance, 'id' | 'type'>>) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const moveWidget = useCallback((id: string, position: { x: number; y: number }) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const resizeWidget = useCallback((id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  const openGallery = useCallback(() => {
    setShowGallery(true);
  }, []);

  const closeGallery = useCallback(() => {
    setShowGallery(false);
  }, []);

  return (
    <WidgetContext.Provider value={{
      widgets,
      editMode,
      showGallery,
      addWidget,
      removeWidget,
      updateWidget,
      moveWidget,
      resizeWidget,
      toggleEditMode,
      openGallery,
      closeGallery,
    }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = (): WidgetContextType => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};
