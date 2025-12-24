# zOS Architecture Document: Missing Features Implementation

## Executive Summary

This document outlines the architecture for implementing four major features in zOS:
1. Notes App Persistence (Enhanced)
2. Document Saving in Finder (Virtual File System)
3. System Preferences Panel (Complete macOS Parity)
4. Keyboard Shortcuts System (Registry-based)

The design follows principles of:
- **Separation of Concerns**: Clear boundaries between storage, state, and UI
- **Progressive Enhancement**: Start simple, add complexity as needed
- **macOS Fidelity**: Match real macOS behavior and patterns
- **Type Safety**: Strong TypeScript interfaces throughout

---

## 1. Notes App Persistence

### Current State Analysis

The existing `ZNotesWindow.tsx` already implements:
- localStorage persistence (`zos-notes` and `zos-notes-folders` keys)
- Note model with id, title, content, folderId, createdAt, updatedAt, pinned, locked
- Folder organization with expansion state
- Search and filtering

### Recommended Enhancements

#### 1.1 Enhanced Data Model

```typescript
// src/types/notes.ts

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  locked: boolean;
  // New fields
  color: NoteColor;
  tags: string[];
  attachments: NoteAttachment[];
  format: 'plain' | 'markdown' | 'rich';
  checklistItems?: ChecklistItem[];
  sharedWith?: string[];
  lastSyncedAt?: number;
}

export type NoteColor = 
  | 'default' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'pink' 
  | 'purple' 
  | 'gray';

export interface NoteAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  indentLevel: number;
}

export interface NoteFolder {
  id: string;
  name: string;
  parentId: string | null;
  expanded: boolean;
  color?: NoteColor;
  isSmartFolder?: boolean;
  smartFolderQuery?: SmartFolderQuery;
}

export interface SmartFolderQuery {
  type: 'tag' | 'date' | 'attachment' | 'checklist';
  value: string;
}

export interface NotesState {
  notes: Note[];
  folders: NoteFolder[];
  selectedNoteId: string | null;
  selectedFolderId: string;
  searchQuery: string;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
```

#### 1.2 Storage Strategy

**Recommendation: Hybrid localStorage + IndexedDB**

```typescript
// src/lib/storage/notesStorage.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'by-folder': string;
      'by-updated': number;
      'by-pinned': boolean;
    };
  };
  folders: {
    key: string;
    value: NoteFolder;
  };
  attachments: {
    key: string;
    value: Blob;
  };
}

class NotesStorage {
  private db: IDBPDatabase<NotesDB> | null = null;
  private readonly DB_NAME = 'zos-notes-db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    this.db = await openDB<NotesDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Notes store
        const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
        notesStore.createIndex('by-folder', 'folderId');
        notesStore.createIndex('by-updated', 'updatedAt');
        notesStore.createIndex('by-pinned', 'pinned');

        // Folders store
        db.createObjectStore('folders', { keyPath: 'id' });

        // Attachments store (for images/files)
        db.createObjectStore('attachments', { keyPath: 'id' });
      },
    });
  }

  // CRUD Operations
  async saveNote(note: Note): Promise<void> {
    await this.db?.put('notes', note);
    this.syncToLocalStorage();
  }

  async getNote(id: string): Promise<Note | undefined> {
    return this.db?.get('notes', id);
  }

  async getAllNotes(): Promise<Note[]> {
    return this.db?.getAll('notes') ?? [];
  }

  async deleteNote(id: string): Promise<void> {
    await this.db?.delete('notes', id);
    this.syncToLocalStorage();
  }

  async getNotesByFolder(folderId: string): Promise<Note[]> {
    return this.db?.getAllFromIndex('notes', 'by-folder', folderId) ?? [];
  }

  // Sync lightweight metadata to localStorage for quick access
  private syncToLocalStorage(): void {
    this.getAllNotes().then(notes => {
      const metadata = notes.map(n => ({
        id: n.id,
        title: n.title,
        folderId: n.folderId,
        updatedAt: n.updatedAt,
        pinned: n.pinned,
      }));
      localStorage.setItem('zos-notes-metadata', JSON.stringify(metadata));
    });
  }

  // Export/Import for backup
  async exportAllData(): Promise<string> {
    const notes = await this.getAllNotes();
    const folders = await this.db?.getAll('folders') ?? [];
    return JSON.stringify({ notes, folders, exportedAt: Date.now() });
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const tx = this.db?.transaction(['notes', 'folders'], 'readwrite');
    if (!tx) return;

    for (const note of data.notes) {
      await tx.objectStore('notes').put(note);
    }
    for (const folder of data.folders) {
      await tx.objectStore('folders').put(folder);
    }
    await tx.done;
  }
}

export const notesStorage = new NotesStorage();
```

#### 1.3 Rich Text / Markdown Support

**Recommendation: Use CodeMirror (already in dependencies)**

```typescript
// src/components/notes/NoteEditor.tsx

import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { vim } from '@replit/codemirror-vim';

interface NoteEditorProps {
  note: Note;
  onChange: (content: string) => void;
  format: 'plain' | 'markdown' | 'rich';
  enableVim?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onChange,
  format,
  enableVim = false,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    if (format === 'markdown') {
      extensions.push(markdown());
    }

    if (enableVim) {
      extensions.push(vim());
    }

    viewRef.current = new EditorView({
      doc: note.content,
      extensions,
      parent: editorRef.current,
    });

    return () => viewRef.current?.destroy();
  }, [note.id, format, enableVim]);

  return <div ref={editorRef} className="h-full" />;
};
```

#### 1.4 File Structure

```
src/
  components/
    notes/
      NoteEditor.tsx           # Rich text/markdown editor
      NoteList.tsx             # Note list sidebar
      NoteToolbar.tsx          # Formatting toolbar
      NoteFolderTree.tsx       # Folder navigation
      NoteColorPicker.tsx      # Color selection
      NoteAttachments.tsx      # Attachment handling
      NoteChecklist.tsx        # Checklist component
      NoteSearch.tsx           # Search with filters
  hooks/
    useNotes.ts                # Notes state management
    useNotesSync.ts            # Sync/backup logic
  lib/
    storage/
      notesStorage.ts          # IndexedDB storage layer
  types/
    notes.ts                   # Type definitions
```

---

## 2. Document Saving in Finder

### Current State Analysis

The existing `ZFinderWindow.tsx` has:
- Static file system data (hardcoded in `getFilesForPath()`)
- No persistence layer
- Context menu with placeholder actions ("Creating folder in...")
- Basic view modes (icons, list, columns, gallery)

The `terminalFileSystem.ts` provides:
- In-memory file system structure
- CRUD operations (cd, mkdir, touch, rm, cp, mv)
- No persistence (resets on page refresh)

### Recommended Architecture

#### 2.1 Virtual File System Interface

```typescript
// src/types/filesystem.ts

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'symlink';
  parentId: string | null;
  
  // Metadata
  createdAt: number;
  modifiedAt: number;
  accessedAt: number;
  size: number;
  
  // Content (for files)
  content?: string;
  mimeType?: string;
  encoding?: 'utf-8' | 'base64';
  
  // Folder specific
  children?: string[];  // Array of child IDs
  
  // Symlink specific
  targetPath?: string;
  
  // UI metadata
  icon?: string;
  color?: string;
  tags?: string[];
  isHidden?: boolean;
  isLocked?: boolean;
  
  // External links (for GitHub projects, etc.)
  externalUrl?: string;
}

export interface FileSystemState {
  nodes: Record<string, FileNode>;
  rootId: string;
  currentPath: string[];
  selectedIds: string[];
  clipboard: {
    operation: 'cut' | 'copy' | null;
    nodeIds: string[];
  };
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  viewMode: 'icons' | 'list' | 'columns' | 'gallery';
  showHidden: boolean;
}

export interface FileSystemOperations {
  // Navigation
  navigate(path: string[]): void;
  navigateUp(): void;
  navigateToNode(nodeId: string): void;
  
  // CRUD
  createFile(name: string, content?: string, parentId?: string): FileNode;
  createFolder(name: string, parentId?: string): FileNode;
  rename(nodeId: string, newName: string): void;
  delete(nodeIds: string[]): void;
  duplicate(nodeId: string): FileNode;
  
  // Clipboard
  cut(nodeIds: string[]): void;
  copy(nodeIds: string[]): void;
  paste(targetFolderId: string): void;
  
  // Content
  readFile(nodeId: string): string | null;
  writeFile(nodeId: string, content: string): void;
  
  // Search
  search(query: string, options?: SearchOptions): FileNode[];
  
  // Metadata
  setTags(nodeId: string, tags: string[]): void;
  setColor(nodeId: string, color: string): void;
  getInfo(nodeId: string): FileNodeInfo;
}

export interface SearchOptions {
  inContent?: boolean;
  fileTypes?: string[];
  dateRange?: { from?: number; to?: number };
  sizeRange?: { min?: number; max?: number };
  tags?: string[];
}

export interface FileNodeInfo extends FileNode {
  path: string;
  depth: number;
  childCount?: number;
  totalSize?: number;
}
```

#### 2.2 File System Storage Layer

```typescript
// src/lib/storage/fileSystemStorage.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FileSystemDB extends DBSchema {
  nodes: {
    key: string;
    value: FileNode;
    indexes: {
      'by-parent': string;
      'by-name': string;
      'by-type': string;
    };
  };
  blobs: {
    key: string;
    value: {
      nodeId: string;
      data: Blob;
      mimeType: string;
    };
  };
}

class FileSystemStorage {
  private db: IDBPDatabase<FileSystemDB> | null = null;
  private readonly DB_NAME = 'zos-filesystem';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    this.db = await openDB<FileSystemDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        const nodesStore = db.createObjectStore('nodes', { keyPath: 'id' });
        nodesStore.createIndex('by-parent', 'parentId');
        nodesStore.createIndex('by-name', 'name');
        nodesStore.createIndex('by-type', 'type');
        
        db.createObjectStore('blobs');
      },
    });
    
    await this.ensureRootExists();
  }

  private async ensureRootExists(): Promise<void> {
    const root = await this.db?.get('nodes', 'root');
    if (!root) {
      await this.db?.put('nodes', {
        id: 'root',
        name: 'Home',
        type: 'folder',
        parentId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        accessedAt: Date.now(),
        size: 0,
        children: [],
      });
      
      // Create default folders
      await this.createDefaultStructure();
    }
  }

  private async createDefaultStructure(): Promise<void> {
    const defaultFolders = [
      'Applications', 'Desktop', 'Documents', 'Downloads',
      'Movies', 'Music', 'Pictures', 'projects'
    ];
    
    for (const name of defaultFolders) {
      await this.createNode({
        name,
        type: 'folder',
        parentId: 'root',
      });
    }
  }

  async createNode(partial: Partial<FileNode>): Promise<FileNode> {
    const now = Date.now();
    const node: FileNode = {
      id: crypto.randomUUID(),
      name: partial.name || 'Untitled',
      type: partial.type || 'file',
      parentId: partial.parentId || 'root',
      createdAt: now,
      modifiedAt: now,
      accessedAt: now,
      size: partial.content?.length || 0,
      ...partial,
    };
    
    await this.db?.put('nodes', node);
    
    // Update parent's children array
    if (node.parentId) {
      const parent = await this.db?.get('nodes', node.parentId);
      if (parent && parent.type === 'folder') {
        parent.children = [...(parent.children || []), node.id];
        parent.modifiedAt = now;
        await this.db?.put('nodes', parent);
      }
    }
    
    return node;
  }

  async getNode(id: string): Promise<FileNode | undefined> {
    return this.db?.get('nodes', id);
  }

  async getChildren(parentId: string): Promise<FileNode[]> {
    return this.db?.getAllFromIndex('nodes', 'by-parent', parentId) ?? [];
  }

  async updateNode(id: string, updates: Partial<FileNode>): Promise<void> {
    const node = await this.getNode(id);
    if (node) {
      await this.db?.put('nodes', {
        ...node,
        ...updates,
        modifiedAt: Date.now(),
      });
    }
  }

  async deleteNode(id: string): Promise<void> {
    const node = await this.getNode(id);
    if (!node) return;
    
    // Recursively delete children
    if (node.type === 'folder' && node.children) {
      for (const childId of node.children) {
        await this.deleteNode(childId);
      }
    }
    
    // Remove from parent's children
    if (node.parentId) {
      const parent = await this.getNode(node.parentId);
      if (parent && parent.children) {
        parent.children = parent.children.filter(c => c !== id);
        await this.updateNode(node.parentId, { children: parent.children });
      }
    }
    
    await this.db?.delete('nodes', id);
  }

  async moveNode(nodeId: string, newParentId: string): Promise<void> {
    const node = await this.getNode(nodeId);
    if (!node) return;
    
    // Remove from old parent
    if (node.parentId) {
      const oldParent = await this.getNode(node.parentId);
      if (oldParent && oldParent.children) {
        oldParent.children = oldParent.children.filter(c => c !== nodeId);
        await this.updateNode(node.parentId, { children: oldParent.children });
      }
    }
    
    // Add to new parent
    const newParent = await this.getNode(newParentId);
    if (newParent && newParent.type === 'folder') {
      newParent.children = [...(newParent.children || []), nodeId];
      await this.updateNode(newParentId, { children: newParent.children });
    }
    
    // Update node's parentId
    await this.updateNode(nodeId, { parentId: newParentId });
  }

  async search(query: string): Promise<FileNode[]> {
    const allNodes = await this.db?.getAll('nodes') ?? [];
    const lowerQuery = query.toLowerCase();
    
    return allNodes.filter(node => {
      // Search in name
      if (node.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in content for files
      if (node.type === 'file' && node.content) {
        if (node.content.toLowerCase().includes(lowerQuery)) return true;
      }
      
      // Search in tags
      if (node.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;
      
      return false;
    });
  }

  // Blob storage for binary files
  async saveBlob(nodeId: string, blob: Blob): Promise<void> {
    await this.db?.put('blobs', {
      nodeId,
      data: blob,
      mimeType: blob.type,
    }, nodeId);
  }

  async getBlob(nodeId: string): Promise<Blob | undefined> {
    const record = await this.db?.get('blobs', nodeId);
    return record?.data;
  }
}

export const fileSystemStorage = new FileSystemStorage();
```

#### 2.3 File System Hook

```typescript
// src/hooks/useFileSystem.ts

import { useReducer, useCallback, useEffect } from 'react';
import { fileSystemStorage } from '@/lib/storage/fileSystemStorage';

type FileSystemAction =
  | { type: 'SET_NODES'; nodes: Record<string, FileNode> }
  | { type: 'SET_CURRENT_PATH'; path: string[] }
  | { type: 'SELECT'; nodeIds: string[] }
  | { type: 'ADD_SELECTION'; nodeId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_CLIPBOARD'; operation: 'cut' | 'copy' | null; nodeIds: string[] }
  | { type: 'SET_VIEW_MODE'; mode: FileSystemState['viewMode'] }
  | { type: 'SET_SORT'; sortBy: FileSystemState['sortBy']; sortOrder?: FileSystemState['sortOrder'] }
  | { type: 'TOGGLE_HIDDEN' }
  | { type: 'UPDATE_NODE'; nodeId: string; updates: Partial<FileNode> }
  | { type: 'ADD_NODE'; node: FileNode }
  | { type: 'REMOVE_NODE'; nodeId: string };

function fileSystemReducer(state: FileSystemState, action: FileSystemAction): FileSystemState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.nodes };
    case 'SET_CURRENT_PATH':
      return { ...state, currentPath: action.path, selectedIds: [] };
    case 'SELECT':
      return { ...state, selectedIds: action.nodeIds };
    case 'ADD_SELECTION':
      return { ...state, selectedIds: [...state.selectedIds, action.nodeId] };
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: [] };
    case 'SET_CLIPBOARD':
      return { ...state, clipboard: { operation: action.operation, nodeIds: action.nodeIds } };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode };
    case 'SET_SORT':
      return { 
        ...state, 
        sortBy: action.sortBy, 
        sortOrder: action.sortOrder ?? state.sortOrder 
      };
    case 'TOGGLE_HIDDEN':
      return { ...state, showHidden: !state.showHidden };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: { ...state.nodes[action.nodeId], ...action.updates },
        },
      };
    case 'ADD_NODE':
      return {
        ...state,
        nodes: { ...state.nodes, [action.node.id]: action.node },
      };
    case 'REMOVE_NODE':
      const { [action.nodeId]: removed, ...remainingNodes } = state.nodes;
      return { ...state, nodes: remainingNodes };
    default:
      return state;
  }
}

export function useFileSystem(): FileSystemOperations & { state: FileSystemState } {
  const [state, dispatch] = useReducer(fileSystemReducer, {
    nodes: {},
    rootId: 'root',
    currentPath: [],
    selectedIds: [],
    clipboard: { operation: null, nodeIds: [] },
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'icons',
    showHidden: false,
  });

  // Initialize from storage
  useEffect(() => {
    fileSystemStorage.init().then(async () => {
      const root = await fileSystemStorage.getNode('root');
      if (root) {
        // Load all nodes into memory
        const loadNodes = async (nodeId: string): Promise<Record<string, FileNode>> => {
          const node = await fileSystemStorage.getNode(nodeId);
          if (!node) return {};
          
          let nodes: Record<string, FileNode> = { [nodeId]: node };
          
          if (node.type === 'folder' && node.children) {
            for (const childId of node.children) {
              const childNodes = await loadNodes(childId);
              nodes = { ...nodes, ...childNodes };
            }
          }
          
          return nodes;
        };
        
        const allNodes = await loadNodes('root');
        dispatch({ type: 'SET_NODES', nodes: allNodes });
      }
    });
  }, []);

  const navigate = useCallback((path: string[]) => {
    dispatch({ type: 'SET_CURRENT_PATH', path });
  }, []);

  const navigateUp = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_PATH', path: state.currentPath.slice(0, -1) });
  }, [state.currentPath]);

  const createFile = useCallback(async (name: string, content = '', parentId?: string) => {
    const currentFolderId = parentId ?? getCurrentFolderId(state);
    const node = await fileSystemStorage.createNode({
      name,
      type: 'file',
      parentId: currentFolderId,
      content,
    });
    dispatch({ type: 'ADD_NODE', node });
    return node;
  }, [state]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    const currentFolderId = parentId ?? getCurrentFolderId(state);
    const node = await fileSystemStorage.createNode({
      name,
      type: 'folder',
      parentId: currentFolderId,
      children: [],
    });
    dispatch({ type: 'ADD_NODE', node });
    return node;
  }, [state]);

  const deleteNodes = useCallback(async (nodeIds: string[]) => {
    for (const nodeId of nodeIds) {
      await fileSystemStorage.deleteNode(nodeId);
      dispatch({ type: 'REMOVE_NODE', nodeId });
    }
  }, []);

  const cut = useCallback((nodeIds: string[]) => {
    dispatch({ type: 'SET_CLIPBOARD', operation: 'cut', nodeIds });
  }, []);

  const copy = useCallback((nodeIds: string[]) => {
    dispatch({ type: 'SET_CLIPBOARD', operation: 'copy', nodeIds });
  }, []);

  const paste = useCallback(async (targetFolderId: string) => {
    const { operation, nodeIds } = state.clipboard;
    if (!operation || nodeIds.length === 0) return;

    for (const nodeId of nodeIds) {
      if (operation === 'cut') {
        await fileSystemStorage.moveNode(nodeId, targetFolderId);
      } else {
        // Copy: create duplicate
        const original = state.nodes[nodeId];
        if (original) {
          await fileSystemStorage.createNode({
            ...original,
            id: undefined, // Will generate new ID
            name: `${original.name} copy`,
            parentId: targetFolderId,
          });
        }
      }
    }

    if (operation === 'cut') {
      dispatch({ type: 'SET_CLIPBOARD', operation: null, nodeIds: [] });
    }
  }, [state.clipboard, state.nodes]);

  // ... more operations

  return {
    state,
    navigate,
    navigateUp,
    navigateToNode: (nodeId) => { /* implementation */ },
    createFile,
    createFolder,
    rename: async (nodeId, newName) => {
      await fileSystemStorage.updateNode(nodeId, { name: newName });
      dispatch({ type: 'UPDATE_NODE', nodeId, updates: { name: newName } });
    },
    delete: deleteNodes,
    duplicate: async (nodeId) => { /* implementation */ },
    cut,
    copy,
    paste,
    readFile: (nodeId) => state.nodes[nodeId]?.content ?? null,
    writeFile: async (nodeId, content) => {
      await fileSystemStorage.updateNode(nodeId, { content });
      dispatch({ type: 'UPDATE_NODE', nodeId, updates: { content } });
    },
    search: async (query) => fileSystemStorage.search(query),
    setTags: async (nodeId, tags) => {
      await fileSystemStorage.updateNode(nodeId, { tags });
      dispatch({ type: 'UPDATE_NODE', nodeId, updates: { tags } });
    },
    setColor: async (nodeId, color) => {
      await fileSystemStorage.updateNode(nodeId, { color });
      dispatch({ type: 'UPDATE_NODE', nodeId, updates: { color } });
    },
    getInfo: (nodeId) => { /* implementation */ },
  };
}

function getCurrentFolderId(state: FileSystemState): string {
  if (state.currentPath.length === 0) return 'root';
  // Resolve path to folder ID
  let currentId = 'root';
  for (const segment of state.currentPath) {
    const node = state.nodes[currentId];
    if (node?.type === 'folder' && node.children) {
      const child = node.children.find(childId => 
        state.nodes[childId]?.name === segment
      );
      if (child) currentId = child;
    }
  }
  return currentId;
}
```

#### 2.4 Drag and Drop Support

```typescript
// src/hooks/useDragAndDrop.ts

import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  draggedIds: string[];
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

export function useDragAndDrop(
  onMove: (sourceIds: string[], targetId: string) => Promise<void>
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIds: [],
    dropTargetId: null,
    dropPosition: null,
  });

  const handleDragStart = useCallback((e: React.DragEvent, nodeIds: string[]) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-zos-files', JSON.stringify(nodeIds));
    setDragState({
      isDragging: true,
      draggedIds: nodeIds,
      dropTargetId: null,
      dropPosition: null,
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string, isFolder: boolean) => {
    e.preventDefault();
    
    if (dragState.draggedIds.includes(targetId)) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = isFolder ? 'inside' : 
      y < rect.height / 2 ? 'before' : 'after';
    
    setDragState(prev => ({
      ...prev,
      dropTargetId: targetId,
      dropPosition: position,
    }));
  }, [dragState.draggedIds]);

  const handleDrop = useCallback(async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    const data = e.dataTransfer.getData('application/x-zos-files');
    if (!data) return;

    const sourceIds = JSON.parse(data) as string[];
    await onMove(sourceIds, targetId);

    setDragState({
      isDragging: false,
      draggedIds: [],
      dropTargetId: null,
      dropPosition: null,
    });
  }, [onMove]);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedIds: [],
      dropTargetId: null,
      dropPosition: null,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
```

#### 2.5 File Structure

```
src/
  components/
    finder/
      FinderWindow.tsx         # Main window (refactored from ZFinderWindow)
      FinderSidebar.tsx        # Favorites/locations/tags
      FinderToolbar.tsx        # Navigation and view controls
      FinderContent.tsx        # File grid/list display
      FileIcon.tsx             # Individual file/folder icon
      FileListItem.tsx         # List view item
      FinderContextMenu.tsx    # Right-click menu
      FinderInfoPanel.tsx      # Get Info dialog
      FinderPathBar.tsx        # Breadcrumb navigation
      FinderQuickLook.tsx      # File preview modal
  hooks/
    useFileSystem.ts           # File system state & operations
    useDragAndDrop.ts          # Drag/drop handling
    useFileSelection.ts        # Multi-select logic
  lib/
    storage/
      fileSystemStorage.ts     # IndexedDB storage
  types/
    filesystem.ts              # Type definitions
```

---

## 3. System Preferences Panel

### Current State Analysis

The existing system has:
- `ZSystemPreferencesWindow.tsx` with sidebar navigation
- Categories: Display, Appearance, Dock (system) + Profile, Interests, Technology, etc. (personal)
- Individual tab components in `src/components/system-preferences/`

### Recommended macOS Parity

#### 3.1 Complete Preference Categories

```typescript
// src/types/preferences.ts

export interface PreferenceCategory {
  id: string;
  name: string;
  icon: string;  // Lucide icon name
  section: 'personal' | 'system' | 'hardware' | 'network';
  component: React.ComponentType<PreferencePaneProps>;
}

export interface PreferencePaneProps {
  settings: PreferenceSettings;
  onSettingsChange: <K extends keyof PreferenceSettings>(
    key: K,
    value: PreferenceSettings[K]
  ) => void;
}

// Full macOS-style preference categories
export const PREFERENCE_CATEGORIES: PreferenceCategory[] = [
  // Personal
  { id: 'apple-id', name: 'Apple ID', icon: 'User', section: 'personal' },
  { id: 'family', name: 'Family Sharing', icon: 'Users', section: 'personal' },
  
  // System
  { id: 'general', name: 'General', icon: 'Settings', section: 'system' },
  { id: 'desktop-screensaver', name: 'Desktop & Screen Saver', icon: 'Monitor', section: 'system' },
  { id: 'dock', name: 'Dock & Menu Bar', icon: 'LayoutPanelLeft', section: 'system' },
  { id: 'mission-control', name: 'Mission Control', icon: 'Layout', section: 'system' },
  { id: 'siri', name: 'Siri & Spotlight', icon: 'Mic', section: 'system' },
  { id: 'language', name: 'Language & Region', icon: 'Globe', section: 'system' },
  { id: 'notifications', name: 'Notifications & Focus', icon: 'Bell', section: 'system' },
  { id: 'internet-accounts', name: 'Internet Accounts', icon: 'AtSign', section: 'system' },
  { id: 'passwords', name: 'Passwords', icon: 'Key', section: 'system' },
  { id: 'wallet', name: 'Wallet & Apple Pay', icon: 'Wallet', section: 'system' },
  { id: 'users', name: 'Users & Groups', icon: 'UserCog', section: 'system' },
  { id: 'accessibility', name: 'Accessibility', icon: 'Accessibility', section: 'system' },
  { id: 'screen-time', name: 'Screen Time', icon: 'Clock', section: 'system' },
  { id: 'extensions', name: 'Extensions', icon: 'Puzzle', section: 'system' },
  { id: 'security', name: 'Security & Privacy', icon: 'Shield', section: 'system' },
  
  // Hardware
  { id: 'software-update', name: 'Software Update', icon: 'RefreshCw', section: 'hardware' },
  { id: 'network', name: 'Network', icon: 'Wifi', section: 'hardware' },
  { id: 'bluetooth', name: 'Bluetooth', icon: 'Bluetooth', section: 'hardware' },
  { id: 'sound', name: 'Sound', icon: 'Volume2', section: 'hardware' },
  { id: 'printers', name: 'Printers & Scanners', icon: 'Printer', section: 'hardware' },
  { id: 'keyboard', name: 'Keyboard', icon: 'Keyboard', section: 'hardware' },
  { id: 'trackpad', name: 'Trackpad', icon: 'Pointer', section: 'hardware' },
  { id: 'mouse', name: 'Mouse', icon: 'Mouse', section: 'hardware' },
  { id: 'displays', name: 'Displays', icon: 'Monitor', section: 'hardware' },
  { id: 'battery', name: 'Battery', icon: 'Battery', section: 'hardware' },
  { id: 'date-time', name: 'Date & Time', icon: 'Calendar', section: 'hardware' },
  { id: 'sharing', name: 'Sharing', icon: 'Share2', section: 'hardware' },
  { id: 'time-machine', name: 'Time Machine', icon: 'Clock', section: 'hardware' },
  { id: 'startup-disk', name: 'Startup Disk', icon: 'HardDrive', section: 'hardware' },
];
```

#### 3.2 Settings Schema

```typescript
// src/types/settings.ts

export interface PreferenceSettings {
  // General
  appearance: 'light' | 'dark' | 'auto';
  accentColor: AccentColor;
  highlightColor: string;
  sidebarIconSize: 'small' | 'medium' | 'large';
  allowWallpaperTinting: boolean;
  showScrollBars: 'automatic' | 'whenScrolling' | 'always';
  clickScrollBarTo: 'jumpToNextPage' | 'jumpToSpotClicked';
  defaultBrowser: string;
  defaultEmailReader: string;
  
  // Desktop & Screen Saver
  desktopBackground: {
    type: 'solid' | 'gradient' | 'image' | 'dynamic';
    value: string;
    fit: 'fill' | 'fit' | 'stretch' | 'center' | 'tile';
  };
  screenSaver: {
    type: string;
    startAfter: number; // minutes
    showClock: boolean;
  };
  
  // Dock & Menu Bar
  dock: DockSettings;
  menuBar: MenuBarSettings;
  controlCenter: ControlCenterSettings;
  
  // Mission Control
  missionControl: {
    enabled: boolean;
    groupByApp: boolean;
    autoRearrangeSpaces: boolean;
    switchToSpaceWithOpenWindows: boolean;
    displaysHaveSeparateSpaces: boolean;
  };
  hotCorners: {
    topLeft: HotCornerAction;
    topRight: HotCornerAction;
    bottomLeft: HotCornerAction;
    bottomRight: HotCornerAction;
  };
  
  // Siri & Spotlight
  spotlight: {
    enabled: boolean;
    showInMenuBar: boolean;
    searchCategories: SpotlightCategory[];
    keyboardShortcut: string;
  };
  
  // Notifications & Focus
  notifications: {
    enabled: boolean;
    showPreviews: 'always' | 'whenUnlocked' | 'never';
    allowWhenLocked: boolean;
    showInNotificationCenter: boolean;
    badgeAppIcon: boolean;
    playSound: boolean;
  };
  focus: FocusMode[];
  
  // Keyboard
  keyboard: {
    keyRepeatRate: number;
    delayUntilRepeat: number;
    turnOffKeyboardLight: number;
    useF1Keys: boolean;
    modifierKeys: ModifierKeyMapping;
  };
  shortcuts: ShortcutSettings;
  inputSources: InputSource[];
  dictation: DictationSettings;
  
  // Trackpad / Mouse
  trackpad: {
    tapToClick: boolean;
    secondaryClick: 'twoFingers' | 'bottomRight' | 'bottomLeft';
    lookUp: boolean;
    scrollDirection: 'natural' | 'traditional';
    scrollSpeed: number;
    trackingSpeed: number;
    silentClick: boolean;
    forceClick: boolean;
  };
  
  // Displays
  displays: {
    resolution: 'default' | 'scaled';
    scaledResolution?: string;
    brightness: number;
    automaticallyAdjust: boolean;
    trueTone: boolean;
    nightShift: NightShiftSettings;
  };
  
  // Sound
  sound: {
    outputDevice: string;
    outputVolume: number;
    inputDevice: string;
    inputVolume: number;
    alertVolume: number;
    alertSound: string;
    playFeedback: boolean;
    showInMenuBar: boolean;
  };
  
  // Network
  network: {
    wifi: {
      enabled: boolean;
      currentNetwork: string | null;
      askToJoin: boolean;
    };
    vpn: VPNConfiguration[];
    dns: string[];
    proxy: ProxySettings;
  };
  
  // Bluetooth
  bluetooth: {
    enabled: boolean;
    showInMenuBar: boolean;
    devices: BluetoothDevice[];
  };
  
  // Security & Privacy
  security: SecuritySettings;
  privacy: PrivacySettings;
  
  // Date & Time
  dateTime: {
    setAutomatically: boolean;
    timeZone: string;
    use24Hour: boolean;
    showDate: boolean;
    showDayOfWeek: boolean;
    flashTimeSeparators: boolean;
  };
  
  // Accessibility
  accessibility: AccessibilitySettings;
  
  // User preferences (zOS specific)
  profile: UserProfile;
  interests: UserInterests;
}

export type AccentColor = 
  | 'blue' | 'purple' | 'pink' | 'red' 
  | 'orange' | 'yellow' | 'green' | 'graphite';

export type HotCornerAction =
  | 'none' | 'missionControl' | 'applicationWindows'
  | 'desktop' | 'notificationCenter' | 'launchpad'
  | 'quickNote' | 'startScreenSaver' | 'disableScreenSaver'
  | 'lockScreen' | 'sleep';

export interface DockSettings {
  position: 'bottom' | 'left' | 'right';
  size: number;
  magnification: boolean;
  magnificationSize: number;
  autoHide: boolean;
  showIndicators: boolean;
  showRecents: boolean;
  minimizeUsing: 'genie' | 'scale';
  minimizeToAppIcon: boolean;
  animateOpening: boolean;
}

export interface MenuBarSettings {
  autoHide: boolean;
  showInFullScreen: boolean;
  recentDocuments: number;
  recentApps: number;
  recentServers: number;
}

// ... more detailed types as needed
```

#### 3.3 Settings Storage & State

```typescript
// src/hooks/useSettings.ts

import { useReducer, useCallback, useEffect } from 'react';

const SETTINGS_STORAGE_KEY = 'zos-settings';

const defaultSettings: PreferenceSettings = {
  appearance: 'dark',
  accentColor: 'blue',
  // ... all defaults
};

type SettingsAction =
  | { type: 'SET_SETTING'; key: keyof PreferenceSettings; value: any }
  | { type: 'SET_NESTED_SETTING'; path: string[]; value: any }
  | { type: 'RESET_ALL' }
  | { type: 'RESET_CATEGORY'; category: string }
  | { type: 'LOAD'; settings: Partial<PreferenceSettings> };

function settingsReducer(
  state: PreferenceSettings, 
  action: SettingsAction
): PreferenceSettings {
  switch (action.type) {
    case 'SET_SETTING':
      return { ...state, [action.key]: action.value };
    case 'SET_NESTED_SETTING':
      return setNestedValue(state, action.path, action.value);
    case 'RESET_ALL':
      return defaultSettings;
    case 'RESET_CATEGORY':
      // Reset specific category to defaults
      return { ...state, ...getCategoryDefaults(action.category) };
    case 'LOAD':
      return { ...defaultSettings, ...action.settings };
    default:
      return state;
  }
}

export function useSettings() {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        dispatch({ type: 'LOAD', settings: JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setSetting = useCallback(<K extends keyof PreferenceSettings>(
    key: K,
    value: PreferenceSettings[K]
  ) => {
    dispatch({ type: 'SET_SETTING', key, value });
  }, []);

  const setNestedSetting = useCallback((path: string[], value: any) => {
    dispatch({ type: 'SET_NESTED_SETTING', path, value });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const resetCategory = useCallback((category: string) => {
    dispatch({ type: 'RESET_CATEGORY', category });
  }, []);

  // Export/import settings
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      dispatch({ type: 'LOAD', settings: imported });
    } catch (e) {
      throw new Error('Invalid settings file');
    }
  }, []);

  return {
    settings,
    setSetting,
    setNestedSetting,
    resetAll,
    resetCategory,
    exportSettings,
    importSettings,
  };
}
```

#### 3.4 Preference Pane Component Architecture

```typescript
// src/components/system-preferences/PreferencePane.tsx

interface PreferencePaneProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const PreferencePane: React.FC<PreferencePaneProps> = ({
  title,
  description,
  icon,
  children,
}) => (
  <div className="h-full overflow-y-auto">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
      {icon && <div className="text-gray-600 dark:text-gray-400">{icon}</div>}
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

// Reusable setting components
export const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="font-medium">{label}</div>
      {description && <div className="text-sm text-gray-500">{description}</div>}
    </div>
    {children}
  </div>
);

export const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
      {title}
    </h3>
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
      {children}
    </div>
  </div>
);
```

#### 3.5 File Structure

```
src/
  components/
    system-preferences/
      PreferencePane.tsx           # Base pane layout
      PreferenceSidebar.tsx        # Category navigation
      SettingControls.tsx          # Reusable setting controls
      panes/
        GeneralPane.tsx
        DesktopScreensaverPane.tsx
        DockMenuBarPane.tsx
        MissionControlPane.tsx
        SpotlightPane.tsx
        NotificationsPane.tsx
        KeyboardPane.tsx
        TrackpadPane.tsx
        DisplaysPane.tsx
        SoundPane.tsx
        NetworkPane.tsx
        BluetoothPane.tsx
        SecurityPrivacyPane.tsx
        DateTimePane.tsx
        AccessibilityPane.tsx
        ProfilePane.tsx            # zOS specific
        InterestsPane.tsx          # zOS specific
  hooks/
    useSettings.ts                 # Settings state management
  types/
    settings.ts                    # Settings type definitions
    preferences.ts                 # Preference category types
  lib/
    storage/
      settingsStorage.ts           # Settings persistence
```

---

## 4. Keyboard Shortcuts System

### Current State Analysis

The existing implementation:
- `useKeyboardShortcuts.ts` hook with basic shortcut handling
- Hardcoded shortcuts in `ZDesktop.tsx`
- Supports meta/shift/alt/ctrl modifiers
- Format helper for display (`formatShortcut`)

### Recommended Architecture

#### 4.1 Shortcut Registry System

```typescript
// src/types/shortcuts.ts

export interface ShortcutDefinition {
  id: string;
  key: string;
  modifiers: {
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
  };
  action: () => void;
  description: string;
  category: ShortcutCategory;
  context?: ShortcutContext;
  customizable?: boolean;
  enabled?: boolean;
}

export type ShortcutCategory = 
  | 'system'           // OS-level shortcuts
  | 'app'              // Application shortcuts
  | 'window'           // Window management
  | 'navigation'       // Navigation
  | 'editing'          // Text editing
  | 'finder'           // Finder-specific
  | 'terminal'         // Terminal-specific
  | 'custom';          // User-defined

export type ShortcutContext =
  | 'global'           // Always active
  | 'focused-window'   // Active window only
  | 'terminal'         // Terminal focused
  | 'finder'           // Finder focused
  | 'notes'            // Notes focused
  | 'safari'           // Safari focused
  | 'text-input';      // Any text input focused

export interface ShortcutConflict {
  shortcutId: string;
  conflictsWith: string[];
  resolution: 'priority' | 'context' | 'disabled';
}

export interface ShortcutRegistry {
  shortcuts: Map<string, ShortcutDefinition>;
  conflicts: ShortcutConflict[];
  userOverrides: Map<string, Partial<ShortcutDefinition>>;
}
```

#### 4.2 macOS Standard Shortcuts Audit

```typescript
// src/lib/shortcuts/standardShortcuts.ts

import { ShortcutDefinition } from '@/types/shortcuts';

/**
 * Standard macOS shortcuts that zOS should implement
 * Reference: https://support.apple.com/en-us/HT201236
 */
export const STANDARD_MACOS_SHORTCUTS: Omit<ShortcutDefinition, 'action'>[] = [
  // System
  { id: 'screenshot-full', key: '3', modifiers: { meta: true, shift: true }, description: 'Screenshot (full screen)', category: 'system', context: 'global' },
  { id: 'screenshot-selection', key: '4', modifiers: { meta: true, shift: true }, description: 'Screenshot (selection)', category: 'system', context: 'global' },
  { id: 'screenshot-window', key: '4', modifiers: { meta: true, shift: true, alt: true }, description: 'Screenshot (window)', category: 'system', context: 'global' },
  { id: 'spotlight', key: ' ', modifiers: { meta: true }, description: 'Spotlight Search', category: 'system', context: 'global' },
  { id: 'force-quit', key: 'Escape', modifiers: { meta: true, alt: true }, description: 'Force Quit', category: 'system', context: 'global' },
  { id: 'lock-screen', key: 'q', modifiers: { meta: true, ctrl: true }, description: 'Lock Screen', category: 'system', context: 'global' },
  { id: 'logout', key: 'q', modifiers: { meta: true, shift: true }, description: 'Log Out', category: 'system', context: 'global' },
  { id: 'sleep', key: 'Media Eject', modifiers: { meta: true, alt: true }, description: 'Sleep', category: 'system', context: 'global' },
  
  // App Switching
  { id: 'app-switcher', key: 'Tab', modifiers: { meta: true }, description: 'App Switcher', category: 'app', context: 'global' },
  { id: 'app-switcher-reverse', key: 'Tab', modifiers: { meta: true, shift: true }, description: 'App Switcher (reverse)', category: 'app', context: 'global' },
  { id: 'hide-app', key: 'h', modifiers: { meta: true }, description: 'Hide App', category: 'app', context: 'global' },
  { id: 'hide-others', key: 'h', modifiers: { meta: true, alt: true }, description: 'Hide Others', category: 'app', context: 'global' },
  { id: 'quit-app', key: 'q', modifiers: { meta: true }, description: 'Quit App', category: 'app', context: 'global' },
  
  // Window Management
  { id: 'close-window', key: 'w', modifiers: { meta: true }, description: 'Close Window', category: 'window', context: 'focused-window' },
  { id: 'minimize', key: 'm', modifiers: { meta: true }, description: 'Minimize', category: 'window', context: 'focused-window' },
  { id: 'minimize-all', key: 'm', modifiers: { meta: true, alt: true }, description: 'Minimize All', category: 'window', context: 'global' },
  { id: 'fullscreen', key: 'f', modifiers: { meta: true, ctrl: true }, description: 'Toggle Fullscreen', category: 'window', context: 'focused-window' },
  { id: 'cycle-windows', key: '`', modifiers: { meta: true }, description: 'Cycle Windows', category: 'window', context: 'global' },
  { id: 'new-window', key: 'n', modifiers: { meta: true }, description: 'New Window', category: 'window', context: 'focused-window' },
  
  // Document
  { id: 'new', key: 'n', modifiers: { meta: true }, description: 'New', category: 'editing', context: 'focused-window' },
  { id: 'open', key: 'o', modifiers: { meta: true }, description: 'Open', category: 'editing', context: 'focused-window' },
  { id: 'save', key: 's', modifiers: { meta: true }, description: 'Save', category: 'editing', context: 'focused-window' },
  { id: 'save-as', key: 's', modifiers: { meta: true, shift: true }, description: 'Save As', category: 'editing', context: 'focused-window' },
  { id: 'print', key: 'p', modifiers: { meta: true }, description: 'Print', category: 'editing', context: 'focused-window' },
  
  // Editing
  { id: 'cut', key: 'x', modifiers: { meta: true }, description: 'Cut', category: 'editing', context: 'text-input' },
  { id: 'copy', key: 'c', modifiers: { meta: true }, description: 'Copy', category: 'editing', context: 'text-input' },
  { id: 'paste', key: 'v', modifiers: { meta: true }, description: 'Paste', category: 'editing', context: 'text-input' },
  { id: 'paste-match-style', key: 'v', modifiers: { meta: true, shift: true, alt: true }, description: 'Paste and Match Style', category: 'editing', context: 'text-input' },
  { id: 'undo', key: 'z', modifiers: { meta: true }, description: 'Undo', category: 'editing', context: 'text-input' },
  { id: 'redo', key: 'z', modifiers: { meta: true, shift: true }, description: 'Redo', category: 'editing', context: 'text-input' },
  { id: 'select-all', key: 'a', modifiers: { meta: true }, description: 'Select All', category: 'editing', context: 'text-input' },
  { id: 'find', key: 'f', modifiers: { meta: true }, description: 'Find', category: 'editing', context: 'focused-window' },
  { id: 'find-next', key: 'g', modifiers: { meta: true }, description: 'Find Next', category: 'editing', context: 'focused-window' },
  { id: 'find-previous', key: 'g', modifiers: { meta: true, shift: true }, description: 'Find Previous', category: 'editing', context: 'focused-window' },
  { id: 'replace', key: 'h', modifiers: { meta: true, alt: true }, description: 'Find and Replace', category: 'editing', context: 'focused-window' },
  
  // Text Navigation
  { id: 'move-word-left', key: 'ArrowLeft', modifiers: { alt: true }, description: 'Move Word Left', category: 'editing', context: 'text-input' },
  { id: 'move-word-right', key: 'ArrowRight', modifiers: { alt: true }, description: 'Move Word Right', category: 'editing', context: 'text-input' },
  { id: 'move-line-start', key: 'ArrowLeft', modifiers: { meta: true }, description: 'Move to Line Start', category: 'editing', context: 'text-input' },
  { id: 'move-line-end', key: 'ArrowRight', modifiers: { meta: true }, description: 'Move to Line End', category: 'editing', context: 'text-input' },
  { id: 'move-doc-start', key: 'ArrowUp', modifiers: { meta: true }, description: 'Move to Document Start', category: 'editing', context: 'text-input' },
  { id: 'move-doc-end', key: 'ArrowDown', modifiers: { meta: true }, description: 'Move to Document End', category: 'editing', context: 'text-input' },
  
  // Text Formatting
  { id: 'bold', key: 'b', modifiers: { meta: true }, description: 'Bold', category: 'editing', context: 'text-input' },
  { id: 'italic', key: 'i', modifiers: { meta: true }, description: 'Italic', category: 'editing', context: 'text-input' },
  { id: 'underline', key: 'u', modifiers: { meta: true }, description: 'Underline', category: 'editing', context: 'text-input' },
  
  // Finder
  { id: 'finder-new-folder', key: 'n', modifiers: { meta: true, shift: true }, description: 'New Folder', category: 'finder', context: 'finder' },
  { id: 'finder-new-window', key: 'n', modifiers: { meta: true }, description: 'New Finder Window', category: 'finder', context: 'finder' },
  { id: 'finder-get-info', key: 'i', modifiers: { meta: true }, description: 'Get Info', category: 'finder', context: 'finder' },
  { id: 'finder-duplicate', key: 'd', modifiers: { meta: true }, description: 'Duplicate', category: 'finder', context: 'finder' },
  { id: 'finder-quick-look', key: ' ', modifiers: {}, description: 'Quick Look', category: 'finder', context: 'finder' },
  { id: 'finder-trash', key: 'Backspace', modifiers: { meta: true }, description: 'Move to Trash', category: 'finder', context: 'finder' },
  { id: 'finder-empty-trash', key: 'Backspace', modifiers: { meta: true, shift: true }, description: 'Empty Trash', category: 'finder', context: 'finder' },
  { id: 'finder-go-enclosing', key: 'ArrowUp', modifiers: { meta: true }, description: 'Go to Enclosing Folder', category: 'finder', context: 'finder' },
  { id: 'finder-open-item', key: 'ArrowDown', modifiers: { meta: true }, description: 'Open Item', category: 'finder', context: 'finder' },
  { id: 'finder-go-home', key: 'h', modifiers: { meta: true, shift: true }, description: 'Go to Home', category: 'finder', context: 'finder' },
  { id: 'finder-go-desktop', key: 'd', modifiers: { meta: true, shift: true }, description: 'Go to Desktop', category: 'finder', context: 'finder' },
  { id: 'finder-go-downloads', key: 'l', modifiers: { meta: true, alt: true }, description: 'Go to Downloads', category: 'finder', context: 'finder' },
  { id: 'finder-go-applications', key: 'a', modifiers: { meta: true, shift: true }, description: 'Go to Applications', category: 'finder', context: 'finder' },
  
  // Views
  { id: 'view-icons', key: '1', modifiers: { meta: true }, description: 'Icon View', category: 'finder', context: 'finder' },
  { id: 'view-list', key: '2', modifiers: { meta: true }, description: 'List View', category: 'finder', context: 'finder' },
  { id: 'view-columns', key: '3', modifiers: { meta: true }, description: 'Column View', category: 'finder', context: 'finder' },
  { id: 'view-gallery', key: '4', modifiers: { meta: true }, description: 'Gallery View', category: 'finder', context: 'finder' },
  { id: 'show-sidebar', key: 's', modifiers: { meta: true, alt: true }, description: 'Show/Hide Sidebar', category: 'finder', context: 'finder' },
  { id: 'show-toolbar', key: 't', modifiers: { meta: true, alt: true }, description: 'Show/Hide Toolbar', category: 'finder', context: 'finder' },
  { id: 'show-hidden', key: '.', modifiers: { meta: true, shift: true }, description: 'Show Hidden Files', category: 'finder', context: 'finder' },
  
  // Settings
  { id: 'preferences', key: ',', modifiers: { meta: true }, description: 'Preferences', category: 'app', context: 'global' },
];
```

#### 4.3 Shortcut Registry Implementation

```typescript
// src/lib/shortcuts/shortcutRegistry.ts

import { ShortcutDefinition, ShortcutContext, ShortcutConflict } from '@/types/shortcuts';
import { STANDARD_MACOS_SHORTCUTS } from './standardShortcuts';

class ShortcutRegistry {
  private shortcuts = new Map<string, ShortcutDefinition>();
  private userOverrides = new Map<string, Partial<ShortcutDefinition>>();
  private conflicts: ShortcutConflict[] = [];
  private activeContext: ShortcutContext = 'global';
  private listeners = new Set<() => void>();

  constructor() {
    this.loadUserOverrides();
  }

  /**
   * Register a shortcut
   */
  register(shortcut: ShortcutDefinition): void {
    // Check for conflicts
    const conflict = this.findConflict(shortcut);
    if (conflict) {
      this.conflicts.push({
        shortcutId: shortcut.id,
        conflictsWith: [conflict.id],
        resolution: 'context',
      });
    }

    // Apply user overrides if any
    const override = this.userOverrides.get(shortcut.id);
    if (override) {
      shortcut = { ...shortcut, ...override };
    }

    this.shortcuts.set(shortcut.id, shortcut);
    this.notifyListeners();
  }

  /**
   * Register all standard shortcuts with actions
   */
  registerStandardShortcuts(actionMap: Record<string, () => void>): void {
    for (const shortcut of STANDARD_MACOS_SHORTCUTS) {
      const action = actionMap[shortcut.id];
      if (action) {
        this.register({ ...shortcut, action });
      }
    }
  }

  /**
   * Unregister a shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
    this.conflicts = this.conflicts.filter(c => 
      c.shortcutId !== id && !c.conflictsWith.includes(id)
    );
    this.notifyListeners();
  }

  /**
   * Get all shortcuts
   */
  getAll(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts for a category
   */
  getByCategory(category: string): ShortcutDefinition[] {
    return this.getAll().filter(s => s.category === category);
  }

  /**
   * Get shortcuts for current context
   */
  getActiveShortcuts(): ShortcutDefinition[] {
    return this.getAll().filter(s => 
      s.enabled !== false &&
      (s.context === 'global' || s.context === this.activeContext)
    );
  }

  /**
   * Set current context (called when focus changes)
   */
  setContext(context: ShortcutContext): void {
    this.activeContext = context;
  }

  /**
   * Customize a shortcut
   */
  customize(id: string, newKeyCombo: { key: string; modifiers: ShortcutDefinition['modifiers'] }): void {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut || !shortcut.customizable) return;

    // Check for new conflicts
    const testShortcut = { ...shortcut, ...newKeyCombo };
    const conflict = this.findConflict(testShortcut);
    if (conflict && conflict.id !== id) {
      throw new Error(`Shortcut conflicts with "${conflict.description}"`);
    }

    // Save override
    this.userOverrides.set(id, newKeyCombo);
    this.saveUserOverrides();

    // Update shortcut
    this.shortcuts.set(id, { ...shortcut, ...newKeyCombo });
    this.notifyListeners();
  }

  /**
   * Reset a shortcut to default
   */
  resetToDefault(id: string): void {
    this.userOverrides.delete(id);
    this.saveUserOverrides();

    // Re-register from standard shortcuts
    const standard = STANDARD_MACOS_SHORTCUTS.find(s => s.id === id);
    const current = this.shortcuts.get(id);
    if (standard && current) {
      this.shortcuts.set(id, { ...current, key: standard.key, modifiers: standard.modifiers });
    }
    this.notifyListeners();
  }

  /**
   * Enable/disable a shortcut
   */
  setEnabled(id: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(id);
    if (shortcut) {
      this.shortcuts.set(id, { ...shortcut, enabled });
      this.userOverrides.set(id, { ...this.userOverrides.get(id), enabled });
      this.saveUserOverrides();
      this.notifyListeners();
    }
  }

  /**
   * Find conflicting shortcut
   */
  private findConflict(shortcut: ShortcutDefinition): ShortcutDefinition | null {
    for (const existing of this.shortcuts.values()) {
      if (existing.id === shortcut.id) continue;
      if (existing.key.toLowerCase() !== shortcut.key.toLowerCase()) continue;
      if (!this.modifiersMatch(existing.modifiers, shortcut.modifiers)) continue;
      
      // Check if contexts overlap
      if (existing.context === 'global' || shortcut.context === 'global') {
        return existing;
      }
      if (existing.context === shortcut.context) {
        return existing;
      }
    }
    return null;
  }

  private modifiersMatch(a: ShortcutDefinition['modifiers'], b: ShortcutDefinition['modifiers']): boolean {
    return !!a.meta === !!b.meta &&
           !!a.shift === !!b.shift &&
           !!a.alt === !!b.alt &&
           !!a.ctrl === !!b.ctrl;
  }

  private loadUserOverrides(): void {
    try {
      const stored = localStorage.getItem('zos-shortcut-overrides');
      if (stored) {
        const data = JSON.parse(stored);
        this.userOverrides = new Map(Object.entries(data));
      }
    } catch (e) {
      console.error('Failed to load shortcut overrides:', e);
    }
  }

  private saveUserOverrides(): void {
    const data = Object.fromEntries(this.userOverrides);
    localStorage.setItem('zos-shortcut-overrides', JSON.stringify(data));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }
}

export const shortcutRegistry = new ShortcutRegistry();
```

#### 4.4 Enhanced Keyboard Hook

```typescript
// src/hooks/useKeyboardShortcuts.ts (enhanced)

import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { shortcutRegistry } from '@/lib/shortcuts/shortcutRegistry';
import { ShortcutDefinition, ShortcutContext } from '@/types/shortcuts';

interface UseKeyboardShortcutsOptions {
  context?: ShortcutContext;
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { context = 'global', enabled = true } = options;

  // Subscribe to registry changes
  const shortcuts = useSyncExternalStore(
    shortcutRegistry.subscribe.bind(shortcutRegistry),
    () => shortcutRegistry.getActiveShortcuts()
  );

  // Set context when component mounts/updates
  useEffect(() => {
    shortcutRegistry.setContext(context);
  }, [context]);

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input (unless shortcut has modifier)
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.isContentEditable;

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          // Skip non-modifier shortcuts when typing
          const hasModifiers = shortcut.modifiers.meta || 
                              shortcut.modifiers.alt || 
                              shortcut.modifiers.ctrl;
          if (isTyping && !hasModifiers) continue;

          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled, shortcuts]);

  return {
    shortcuts,
    customize: shortcutRegistry.customize.bind(shortcutRegistry),
    resetToDefault: shortcutRegistry.resetToDefault.bind(shortcutRegistry),
    setEnabled: shortcutRegistry.setEnabled.bind(shortcutRegistry),
  };
}

function matchesShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  const key = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  // Handle special key names
  const keyMatch = key === shortcutKey ||
    (shortcutKey === ' ' && key === ' ') ||
    (shortcutKey === 'escape' && key === 'escape');

  if (!keyMatch) return false;

  const { meta, shift, alt, ctrl } = shortcut.modifiers;
  
  // Meta matches either Cmd (Mac) or Ctrl (Windows/Linux)
  const metaMatch = meta ? (event.metaKey || event.ctrlKey) : !event.metaKey;
  const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
  const altMatch = alt ? event.altKey : !event.altKey;
  const ctrlMatch = ctrl ? event.ctrlKey : true; // ctrl is optional

  return metaMatch && shiftMatch && altMatch;
}

/**
 * Format a shortcut for display (converts to macOS symbols)
 */
export function formatShortcut(shortcut: ShortcutDefinition): string {
  const parts: string[] = [];
  const { meta, shift, alt, ctrl } = shortcut.modifiers;

  if (ctrl) parts.push('\u2303');   // Control
  if (alt) parts.push('\u2325');    // Option
  if (shift) parts.push('\u21E7');  // Shift
  if (meta) parts.push('\u2318');   // Command

  const keyMap: Record<string, string> = {
    'escape': '\u238B',
    'tab': '\u21E5',
    'space': 'Space',
    'enter': '\u21A9',
    'backspace': '\u232B',
    'delete': '\u2326',
    'arrowup': '\u2191',
    'arrowdown': '\u2193',
    'arrowleft': '\u2190',
    'arrowright': '\u2192',
    ' ': 'Space',
  };

  const displayKey = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
  parts.push(displayKey);

  return parts.join('');
}
```

#### 4.5 Keyboard Preferences Pane

```typescript
// src/components/system-preferences/panes/KeyboardPane.tsx

import React, { useState } from 'react';
import { useKeyboardShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import { PreferencePane, SettingSection, SettingRow } from '../PreferencePane';
import { ShortcutDefinition, ShortcutCategory } from '@/types/shortcuts';

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  system: 'System',
  app: 'App Shortcuts',
  window: 'Window Management',
  navigation: 'Navigation',
  editing: 'Editing',
  finder: 'Finder',
  terminal: 'Terminal',
  custom: 'Custom',
};

export const KeyboardPane: React.FC = () => {
  const { shortcuts, customize, resetToDefault, setEnabled } = useKeyboardShortcuts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ShortcutCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShortcuts = shortcuts.filter(s => {
    if (filterCategory !== 'all' && s.category !== filterCategory) return false;
    if (searchQuery && !s.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const groupedShortcuts = groupBy(filteredShortcuts, s => s.category);

  const handleRecordShortcut = (id: string) => {
    setEditingId(id);
    // Start listening for key combo...
  };

  return (
    <PreferencePane title="Keyboard" description="Keyboard shortcuts and input settings">
      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as ShortcutCategory | 'all')}
          className="px-3 py-2 rounded-lg border"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Shortcut Groups */}
      {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
        <SettingSection key={category} title={CATEGORY_LABELS[category as ShortcutCategory]}>
          {categoryShortcuts.map(shortcut => (
            <ShortcutRow
              key={shortcut.id}
              shortcut={shortcut}
              isEditing={editingId === shortcut.id}
              onEdit={() => handleRecordShortcut(shortcut.id)}
              onReset={() => resetToDefault(shortcut.id)}
              onToggle={enabled => setEnabled(shortcut.id, enabled)}
            />
          ))}
        </SettingSection>
      ))}
    </PreferencePane>
  );
};

interface ShortcutRowProps {
  shortcut: ShortcutDefinition;
  isEditing: boolean;
  onEdit: () => void;
  onReset: () => void;
  onToggle: (enabled: boolean) => void;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({
  shortcut,
  isEditing,
  onEdit,
  onReset,
  onToggle,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={shortcut.enabled !== false}
        onChange={e => onToggle(e.target.checked)}
      />
      <span className={shortcut.enabled === false ? 'text-gray-400' : ''}>
        {shortcut.description}
      </span>
    </div>
    <div className="flex items-center gap-2">
      {isEditing ? (
        <span className="px-3 py-1 bg-blue-100 rounded text-sm">
          Press new shortcut...
        </span>
      ) : (
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-gray-100 rounded font-mono text-sm hover:bg-gray-200"
          disabled={!shortcut.customizable}
        >
          {formatShortcut(shortcut)}
        </button>
      )}
      {shortcut.customizable && (
        <button
          onClick={onReset}
          className="text-xs text-blue-500 hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  </div>
);

function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
```

#### 4.6 File Structure

```
src/
  lib/
    shortcuts/
      shortcutRegistry.ts      # Central shortcut registry
      standardShortcuts.ts     # macOS standard shortcuts list
      shortcutContext.ts       # Context detection utilities
  hooks/
    useKeyboardShortcuts.ts    # Enhanced hook
  components/
    system-preferences/
      panes/
        KeyboardPane.tsx       # Shortcut customization UI
  types/
    shortcuts.ts               # Type definitions
```

---

## 5. Implementation Dependencies

### New Dependencies Required

```json
{
  "dependencies": {
    "idb": "^8.0.0"  // IndexedDB wrapper for storage
  }
}
```

**Note:** Most functionality can be achieved with existing dependencies:
- `@codemirror/*` already installed for rich text editing
- `@radix-ui/*` for UI components
- `lucide-react` for icons

### Migration Strategy

1. **Phase 1: Storage Layer** (Week 1)
   - Implement `notesStorage.ts` with IndexedDB
   - Implement `fileSystemStorage.ts` with IndexedDB
   - Migrate existing localStorage data

2. **Phase 2: Notes Enhancement** (Week 1-2)
   - Add rich text editor with CodeMirror
   - Implement attachment support
   - Add smart folders

3. **Phase 3: File System** (Week 2-3)
   - Refactor Finder to use new file system
   - Implement drag-and-drop
   - Connect terminal file system

4. **Phase 4: System Preferences** (Week 3-4)
   - Create preference pane components
   - Implement settings persistence
   - Add all macOS-style categories

5. **Phase 5: Keyboard Shortcuts** (Week 4)
   - Implement shortcut registry
   - Add all standard shortcuts
   - Build customization UI

---

## 6. Testing Strategy

### Unit Tests
- Storage layer CRUD operations
- Shortcut matching logic
- Settings state management

### Integration Tests
- Note creation and persistence across sessions
- File system operations (create, move, delete)
- Shortcut conflicts and context switching

### E2E Tests
- Full Notes workflow (create, edit, organize, search)
- Finder file operations
- Preferences changes persist

---

## 7. Future Considerations

### Cloud Sync
- Optional backend API for cross-device sync
- iCloud-style conflict resolution
- Offline-first architecture

### Performance
- Virtual scrolling for large file lists
- Lazy loading for file contents
- Web Worker for search indexing

### Accessibility
- Full keyboard navigation
- Screen reader support
- Reduced motion preferences

---

This architecture document provides a comprehensive roadmap for implementing the missing features in zOS while maintaining macOS fidelity and code quality standards.
