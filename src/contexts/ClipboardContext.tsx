import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

export type ClipboardItemType = 'text' | 'image' | 'url' | 'file';

export interface ClipboardItem {
  id: string;
  type: ClipboardItemType;
  content: string;
  preview?: string; // For images: data URL; for text: truncated
  timestamp: number;
  pinned: boolean;
}

interface ClipboardContextType {
  items: ClipboardItem[];
  addItem: (content: string, type?: ClipboardItemType) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  pinItem: (id: string) => void;
  unpinItem: (id: string) => void;
  pasteItem: (id: string) => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

const STORAGE_KEY = 'zos-clipboard-history';
const MAX_ITEMS = 50;

// Detect item type from content
function detectType(content: string): ClipboardItemType {
  // URL pattern
  if (/^https?:\/\/\S+$/i.test(content.trim())) {
    return 'url';
  }
  // Data URL (image)
  if (content.startsWith('data:image/')) {
    return 'image';
  }
  // File path pattern
  if (/^(\/|[A-Z]:\\|~\/)\S+/.test(content.trim())) {
    return 'file';
  }
  return 'text';
}

// Generate preview for item
function generatePreview(content: string, type: ClipboardItemType): string {
  if (type === 'image') {
    return content; // Data URL is the preview
  }
  // Truncate text preview
  const maxLen = 200;
  if (content.length > maxLen) {
    return content.slice(0, maxLen) + '...';
  }
  return content;
}

export const ClipboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ClipboardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Stable ref for addItem to avoid closure issues
  const addItemRef = useRef<((content: string, type?: ClipboardItemType) => void) | null>(null);

  const addItem = useCallback((content: string, type?: ClipboardItemType) => {
    if (!content.trim()) return;

    const detectedType = type ?? detectType(content);
    const newItem: ClipboardItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: detectedType,
      content,
      preview: generatePreview(content, detectedType),
      timestamp: Date.now(),
      pinned: false,
    };

    setItems(prev => {
      // Remove duplicate if exists (by content)
      const filtered = prev.filter(item => item.content !== content);
      // Add new item at top, maintain pinned items
      const pinned = filtered.filter(i => i.pinned);
      const unpinned = filtered.filter(i => !i.pinned);
      const combined = [newItem, ...pinned, ...unpinned];
      // Limit to MAX_ITEMS (but never remove pinned)
      const pinnedCount = combined.filter(i => i.pinned).length;
      const maxUnpinned = MAX_ITEMS - pinnedCount;
      const result = [
        ...combined.filter(i => i.pinned),
        ...combined.filter(i => !i.pinned).slice(0, maxUnpinned),
      ];
      return result;
    });
  }, []);

  // Keep ref updated
  addItemRef.current = addItem;

  // Listen for copy events to auto-capture clipboard content
  useEffect(() => {
    const handleCopy = async () => {
      // Small delay to let the copy complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      try {
        // Try to read text from clipboard
        const text = await navigator.clipboard.readText();
        if (text && addItemRef.current) {
          addItemRef.current(text);
        }
      } catch {
        // Clipboard access denied or not available
        // This is expected in some contexts
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setItems(prev => prev.filter(item => item.pinned)); // Keep pinned
  }, []);

  const pinItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, pinned: true } : item
    ));
  }, []);

  const unpinItem = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, pinned: false } : item
    ));
  }, []);

  const pasteItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Write to clipboard
    if (item.type === 'image' && item.content.startsWith('data:')) {
      // For images, we can't easily paste at cursor, but we can copy to clipboard
      navigator.clipboard?.writeText(item.content);
    } else {
      navigator.clipboard?.writeText(item.content);
    }
  }, [items]);

  return (
    <ClipboardContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearHistory,
      pinItem,
      unpinItem,
      pasteItem,
    }}>
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = (): ClipboardContextType => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within ClipboardProvider');
  }
  return context;
};
