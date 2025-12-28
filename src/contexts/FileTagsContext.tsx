import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Tag colors matching macOS Finder
export const TAG_COLORS = {
  red: { bg: 'bg-red-500', text: 'Red', hex: '#ef4444' },
  orange: { bg: 'bg-orange-500', text: 'Orange', hex: '#f97316' },
  yellow: { bg: 'bg-yellow-500', text: 'Yellow', hex: '#eab308' },
  green: { bg: 'bg-green-500', text: 'Green', hex: '#22c55e' },
  blue: { bg: 'bg-blue-500', text: 'Blue', hex: '#3b82f6' },
  purple: { bg: 'bg-purple-500', text: 'Purple', hex: '#a855f7' },
  gray: { bg: 'bg-gray-500', text: 'Gray', hex: '#6b7280' },
} as const;

export type TagColor = keyof typeof TAG_COLORS;

export interface FileTag {
  id: string;
  name: string;
  color: TagColor;
}

export interface SmartFolder {
  id: string;
  name: string;
  icon?: string;
  filters: SmartFolderFilter[];
  createdAt: number;
}

export interface SmartFolderFilter {
  type: 'tag' | 'name' | 'type' | 'dateModified' | 'size';
  operator: 'is' | 'isNot' | 'contains' | 'before' | 'after' | 'lessThan' | 'greaterThan';
  value: string;
}

// File path -> array of tag IDs
type FileTagMap = Record<string, string[]>;

interface FileTagsContextType {
  // Tags
  tags: FileTag[];
  createTag: (name: string, color: TagColor) => FileTag;
  updateTag: (id: string, updates: Partial<Pick<FileTag, 'name' | 'color'>>) => void;
  deleteTag: (id: string) => void;
  
  // File tagging
  fileTagMap: FileTagMap;
  addTagToFile: (filePath: string, tagId: string) => void;
  removeTagFromFile: (filePath: string, tagId: string) => void;
  setFileTags: (filePath: string, tagIds: string[]) => void;
  getFileTags: (filePath: string) => FileTag[];
  getFilesByTag: (tagId: string) => string[];
  
  // Smart Folders
  smartFolders: SmartFolder[];
  createSmartFolder: (name: string, filters: SmartFolderFilter[]) => SmartFolder;
  updateSmartFolder: (id: string, updates: Partial<Pick<SmartFolder, 'name' | 'filters'>>) => void;
  deleteSmartFolder: (id: string) => void;
}

const FileTagsContext = createContext<FileTagsContextType | undefined>(undefined);

const TAGS_STORAGE_KEY = 'zos-file-tags';
const FILE_TAG_MAP_STORAGE_KEY = 'zos-file-tag-map';
const SMART_FOLDERS_STORAGE_KEY = 'zos-smart-folders';

// Default tags matching macOS
const DEFAULT_TAGS: FileTag[] = [
  { id: 'tag-red', name: 'Red', color: 'red' },
  { id: 'tag-orange', name: 'Orange', color: 'orange' },
  { id: 'tag-yellow', name: 'Yellow', color: 'yellow' },
  { id: 'tag-green', name: 'Green', color: 'green' },
  { id: 'tag-blue', name: 'Blue', color: 'blue' },
  { id: 'tag-purple', name: 'Purple', color: 'purple' },
  { id: 'tag-gray', name: 'Gray', color: 'gray' },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const FileTagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Tags state
  const [tags, setTags] = useState<FileTag[]>(() => {
    try {
      const stored = localStorage.getItem(TAGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TAGS;
    } catch {
      return DEFAULT_TAGS;
    }
  });

  // File -> tags mapping
  const [fileTagMap, setFileTagMap] = useState<FileTagMap>(() => {
    try {
      const stored = localStorage.getItem(FILE_TAG_MAP_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Smart folders
  const [smartFolders, setSmartFolders] = useState<SmartFolder[]>(() => {
    try {
      const stored = localStorage.getItem(SMART_FOLDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist tags
  useEffect(() => {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);

  // Persist file-tag map
  useEffect(() => {
    localStorage.setItem(FILE_TAG_MAP_STORAGE_KEY, JSON.stringify(fileTagMap));
  }, [fileTagMap]);

  // Persist smart folders
  useEffect(() => {
    localStorage.setItem(SMART_FOLDERS_STORAGE_KEY, JSON.stringify(smartFolders));
  }, [smartFolders]);

  // Tag management
  const createTag = useCallback((name: string, color: TagColor): FileTag => {
    const newTag: FileTag = {
      id: `tag-${generateId()}`,
      name,
      color,
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const updateTag = useCallback((id: string, updates: Partial<Pick<FileTag, 'name' | 'color'>>) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    ));
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
    // Also remove from all files
    setFileTagMap(prev => {
      const updated: FileTagMap = {};
      for (const [path, tagIds] of Object.entries(prev)) {
        const filtered = tagIds.filter(tid => tid !== id);
        if (filtered.length > 0) {
          updated[path] = filtered;
        }
      }
      return updated;
    });
  }, []);

  // File tagging
  const addTagToFile = useCallback((filePath: string, tagId: string) => {
    setFileTagMap(prev => {
      const current = prev[filePath] || [];
      if (current.includes(tagId)) return prev;
      return { ...prev, [filePath]: [...current, tagId] };
    });
  }, []);

  const removeTagFromFile = useCallback((filePath: string, tagId: string) => {
    setFileTagMap(prev => {
      const current = prev[filePath] || [];
      const filtered = current.filter(id => id !== tagId);
      if (filtered.length === 0) {
        const { [filePath]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [filePath]: filtered };
    });
  }, []);

  const setFileTags = useCallback((filePath: string, tagIds: string[]) => {
    setFileTagMap(prev => {
      if (tagIds.length === 0) {
        const { [filePath]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [filePath]: tagIds };
    });
  }, []);

  const getFileTags = useCallback((filePath: string): FileTag[] => {
    const tagIds = fileTagMap[filePath] || [];
    return tagIds.map(id => tags.find(t => t.id === id)).filter((t): t is FileTag => t !== undefined);
  }, [fileTagMap, tags]);

  const getFilesByTag = useCallback((tagId: string): string[] => {
    return Object.entries(fileTagMap)
      .filter(([, tagIds]) => tagIds.includes(tagId))
      .map(([path]) => path);
  }, [fileTagMap]);

  // Smart folder management
  const createSmartFolder = useCallback((name: string, filters: SmartFolderFilter[]): SmartFolder => {
    const newFolder: SmartFolder = {
      id: `sf-${generateId()}`,
      name,
      filters,
      createdAt: Date.now(),
    };
    setSmartFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateSmartFolder = useCallback((id: string, updates: Partial<Pick<SmartFolder, 'name' | 'filters'>>) => {
    setSmartFolders(prev => prev.map(folder =>
      folder.id === id ? { ...folder, ...updates } : folder
    ));
  }, []);

  const deleteSmartFolder = useCallback((id: string) => {
    setSmartFolders(prev => prev.filter(folder => folder.id !== id));
  }, []);

  return (
    <FileTagsContext.Provider value={{
      tags,
      createTag,
      updateTag,
      deleteTag,
      fileTagMap,
      addTagToFile,
      removeTagFromFile,
      setFileTags,
      getFileTags,
      getFilesByTag,
      smartFolders,
      createSmartFolder,
      updateSmartFolder,
      deleteSmartFolder,
    }}>
      {children}
    </FileTagsContext.Provider>
  );
};

export const useFileTags = () => {
  const context = useContext(FileTagsContext);
  if (!context) {
    throw new Error('useFileTags must be used within FileTagsProvider');
  }
  return context;
};
