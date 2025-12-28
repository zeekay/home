import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import QuickLook, { QuickLookFile } from './QuickLook';
import { toast } from '@/hooks/use-toast';
import { useDragDrop, useDropTarget, type DragItem, type DragFileItem, type DragOperation } from '@/contexts/DragDropContext';
import { useFileTags, TAG_COLORS, type TagColor, type SmartFolderFilter } from '@/contexts/FileTagsContext';
import {
  Folder,
  FileText,
  Download,
  Image,
  Music,
  Film,
  HardDrive,
  Cloud,
  Clock,
  ChevronRight,
  ChevronDown,
  List,
  LayoutGrid,
  Columns,
  GalleryHorizontal,
  X,
  ExternalLink,
  Copy,
  Trash2,
  Info,
  FolderOpen,
  Share,
  Eye,
  FolderPlus,
  FilePlus,
  Plus,
  Tag,
  Archive,
  Edit,
  MoreHorizontal,
  Check,
  Pencil,
  Search,
} from 'lucide-react';

interface ZFinderWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  initialPath?: string[];
}

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  icon?: React.ReactNode;
  modified?: string;
  size?: string;
  content?: string;
  url?: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  item: FileItem | null;
  isBackground: boolean;
}

interface Tab {
  id: string;
  path: string[];
  selectedItem: string | null;
}

interface ColumnData {
  path: string[];
  items: FileItem[];
  selectedItem: string | null;
}

const ZFinderWindow: React.FC<ZFinderWindowProps> = ({ onClose, onFocus, initialPath }) => {
  // Tab state
  const [tabs, setTabs] = useState<Tab[]>([
    { id: crypto.randomUUID(), path: initialPath || ['Home'], selectedItem: null }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);

  // Get active tab
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const currentPath = activeTab?.path || ['Home'];

  // View and UI state
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'columns' | 'gallery'>('icons');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [quickLookFile, setQuickLookFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [, setShowGetInfo] = useState<FileItem | null>(null);
  const [showPathBar, setShowPathBar] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnContainerRef = useRef<HTMLDivElement>(null);

  // Column view state
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [columnData, setColumnData] = useState<ColumnData[]>([]);

  // Drag/Drop state
  const [draggedItem, setDraggedItem] = useState<FileItem | null>(null);
  const { startDrag, endDrag, isDragging, startSpringLoad, cancelSpringLoad, isSpringLoading } = useDragDrop();

  // File Tags state
  const {
    tags,
    createTag,
    updateTag,
    addTagToFile,
    removeTagFromFile,
    getFileTags,
    getFilesByTag,
    smartFolders,
    createSmartFolder,
    deleteSmartFolder,
  } = useFileTags();
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showSmartFolderDialog, setShowSmartFolderDialog] = useState(false);
  const [smartFolderName, setSmartFolderName] = useState('');
  const [smartFolderFilters, setSmartFolderFilters] = useState<SmartFolderFilter[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    favorites: true,
    locations: true,
    tags: true,
    smartFolders: true,
  });
  const [filterByTag, setFilterByTag] = useState<string | null>(null);
  const [activeSmartFolder, setActiveSmartFolder] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  // Update path for active tab
  const setCurrentPath = useCallback((newPath: string[]) => {
    setTabs(prev => prev.map(t =>
      t.id === activeTabId ? { ...t, path: newPath, selectedItem: null } : t
    ));
    setSelectedItem(null);
  }, [activeTabId]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault();
            createNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (tabs.length > 1) {
              closeTab(activeTabId);
            }
            break;
          case 'shift':
            if (e.key === 'P' || e.key === 'p') {
              e.preventDefault();
              setShowPathBar(prev => !prev);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, tabs.length]);

  // Tab management functions
  const createNewTab = useCallback(() => {
    const newTab: Tab = {
      id: crypto.randomUUID(),
      path: ['Home'],
      selectedItem: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    if (tabs.length <= 1) return;
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  }, [tabs, activeTabId]);

  const handleTabDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleTabDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetTabId) return;

    const draggedIndex = tabs.findIndex(t => t.id === draggedTabId);
    const targetIndex = tabs.findIndex(t => t.id === targetTabId);

    const newTabs = [...tabs];
    const [removed] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, removed);

    setTabs(newTabs);
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  const handleTabDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
  };

  // Sidebar favorites
  const favorites = [
    { name: 'AirDrop', icon: <Cloud className="w-4 h-4 text-blue-400" /> },
    { name: 'Recents', icon: <Clock className="w-4 h-4 text-gray-400" /> },
    { name: 'Applications', icon: <Folder className="w-4 h-4 text-blue-400" /> },
    { name: 'Desktop', icon: <HardDrive className="w-4 h-4 text-blue-400" /> },
    { name: 'Documents', icon: <Folder className="w-4 h-4 text-blue-400" /> },
    { name: 'Downloads', icon: <Download className="w-4 h-4 text-blue-400" /> },
  ];

  const locations = [
    { name: 'zeekay.ai', icon: <HardDrive className="w-4 h-4 text-gray-400" /> },
    { name: 'iCloud Drive', icon: <Cloud className="w-4 h-4 text-blue-400" /> },
  ];

  // File system content based on current path
  const getFilesForPath = useCallback((path: string[]): FileItem[] => {
    const pathName = path[path.length - 1];

    if (pathName === 'Trash') {
      return [
        { 
          name: 'quantum-finality-proposal.md', 
          type: 'file', 
          icon: <FileText className="w-12 h-12 text-gray-400" />,
          modified: 'Yesterday',
          size: '12 KB',
          content: `# Proof of Quantum Finality (PoQF)

## Abstract

A novel consensus mechanism leveraging quantum entanglement for instant, provably-final transaction confirmation.

## Introduction

Traditional blockchain finality relies on probabilistic guarantees or economic security. PoQF introduces true finality through quantum measurement collapse.

## Key Innovations

1. **Quantum Validator Bonds** - Validators stake entangled qubits
2. **Measurement-Based Consensus** - Transaction finality upon qubit measurement
3. **No-Cloning Theorem Security** - Prevents double-spend attacks fundamentally
4. **Instant Finality** - Sub-millisecond confirmation times

## Technical Approach

By maintaining quantum coherence across validator nodes and triggering coordinated measurement events, we achieve:

- Deterministic finality (not probabilistic)
- Byzantine fault tolerance via quantum correlations
- Sybil resistance through qubit scarcity

## Conclusion

PoQF represents a paradigm shift from classical to quantum consensus...

*Draft - moved to trash for revision*`
        },
        { 
          name: 'old-notes.txt', 
          type: 'file', 
          icon: <FileText className="w-12 h-12 text-gray-400" />,
          modified: 'Last week',
          size: '2 KB'
        },
        { 
          name: 'unused-assets', 
          type: 'folder', 
          icon: <Folder className="w-12 h-12 text-blue-400" />,
          modified: '2 days ago'
        },
      ];
    }

    if (pathName === 'Home' || pathName === 'zeekay.ai') {
      return [
        { name: 'Applications', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'Desktop', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'Documents', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'Downloads', type: 'folder', icon: <Download className="w-12 h-12 text-blue-400" /> },
        { name: 'Movies', type: 'folder', icon: <Film className="w-12 h-12 text-purple-400" /> },
        { name: 'Music', type: 'folder', icon: <Music className="w-12 h-12 text-pink-400" /> },
        { name: 'Pictures', type: 'folder', icon: <Image className="w-12 h-12 text-cyan-400" /> },
        { name: 'projects', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" /> },
      ];
    }

    if (pathName === 'Documents') {
      return [
        { name: 'dotfiles', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'hanzo', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" /> },
        { name: 'lux', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" /> },
        { name: 'zoo', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" /> },
        { name: 'models', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" /> },
        { name: 'tools', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'web', type: 'folder', icon: <Folder className="w-12 h-12 text-blue-400" /> },
        { name: 'README.md', type: 'file', icon: <FileText className="w-12 h-12 text-gray-400" />, size: '2 KB',
          content: `# GitHub Projects

Links to my open source projects.

## Categories
- dotfiles/ - Shell, vim, and editor configs
- hanzo/ - Hanzo AI infrastructure
- lux/ - LUX blockchain platform
- zoo/ - Zoo Labs Foundation
- models/ - Foundational AI models
- tools/ - Developer tools and CLIs
- web/ - Web frameworks and libraries`
        },
      ];
    }

    if (pathName === 'models') {
      return [
        { name: 'zen-0.6B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-0.6B' },
        { name: 'zen-1.7B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-1.7B' },
        { name: 'zen-4B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-4B' },
        { name: 'zen-8B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-8B' },
        { name: 'zen-14B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-14B' },
        { name: 'zen-32B', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://huggingface.co/hanzoai/zen-32B' },
        { name: 'README.md', type: 'file', icon: <FileText className="w-12 h-12 text-gray-400" />, size: '1 KB',
          url: 'https://huggingface.co/hanzoai',
          content: `# Zen Models
Foundational AI models by Hanzo AI

Based on Qwen3 architecture

## Models
- zen-0.6B - 0.6 billion parameters
- zen-1.7B - 1.7 billion parameters
- zen-4B - 4 billion parameters
- zen-8B - 8 billion parameters
- zen-14B - 14 billion parameters
- zen-32B - 32 billion parameters

HuggingFace: https://huggingface.co/hanzoai
GitHub: https://github.com/hanzoai/zen`
        },
      ];
    }

    if (pathName === 'hanzo') {
      return [
        { name: 'mcp', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/mcp' },
        { name: 'dev', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/dev' },
        { name: 'ui', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/ui' },
        { name: 'code', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/code' },
        { name: 'desktop', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/desktop' },
        { name: 'node', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/node' },
        { name: 'engine', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/engine' },
        { name: 'rust-sdk', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/rust-sdk' },
        { name: 'python-sdk', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" />, url: 'https://github.com/hanzoai/python-sdk' },
        { name: 'zen', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" />, url: 'https://github.com/hanzoai/zen' },
        { name: 'README.md', type: 'file', icon: <FileText className="w-12 h-12 text-gray-400" />, size: '1 KB',
          url: 'https://github.com/hanzoai',
          content: `# Hanzo AI
Frontier AI infrastructure & foundational models
Techstars '17

GitHub: https://github.com/hanzoai
Website: https://hanzo.ai

## Projects
- mcp - Model Context Protocol server
- dev - AI development tools
- ui - React component library
- code - AI-powered code editor
- desktop - Desktop application
- rust-sdk - Rust SDK
- python-sdk - Python SDK
- zen - Foundational AI models`
        },
      ];
    }

    if (pathName === 'lux') {
      return [
        { name: 'node', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/node' },
        { name: 'cli', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/cli' },
        { name: 'netrunner', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/netrunner' },
        { name: 'crypto', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/crypto' },
        { name: 'threshold', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/threshold' },
        { name: 'mpc', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/mpc' },
        { name: 'wallet', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/wallet' },
        { name: 'bridge', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" />, url: 'https://github.com/luxfi/bridge' },
        { name: 'README.md', type: 'file', icon: <FileText className="w-12 h-12 text-gray-400" />, size: '1 KB',
          url: 'https://github.com/luxfi',
          content: `# LUX Network
Quantum-safe blockchain platform

GitHub: https://github.com/luxfi
Website: https://lux.network

## Projects
- node - Core blockchain node (Go)
- cli - Command line interface
- netrunner - Network testing tool
- crypto - Cryptography library
- threshold - Threshold signatures
- mpc - Multi-party computation
- wallet - Multi-chain wallet
- bridge - Cross-chain bridge`
        },
      ];
    }

    if (pathName === 'zoo') {
      return [
        { name: 'zips', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" />, url: 'https://zips.zoo.ngo' },
        { name: 'papers', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" />, url: 'https://github.com/zooai/papers' },
        { name: 'node', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" />, url: 'https://github.com/zooai/node' },
        { name: 'gym', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" />, url: 'https://github.com/zooai/gym' },
        { name: 'README.md', type: 'file', icon: <FileText className="w-12 h-12 text-gray-400" />, size: '1 KB',
          url: 'https://github.com/zooai',
          content: `# Zoo Labs Foundation
Decentralized AI research network

GitHub: https://github.com/zooai
Website: https://zoo.ngo
ZIPs: https://zips.zoo.ngo

## Focus
- DeAI - Decentralized AI
- DeSci - Decentralized Science
- Community governance`
        },
      ];
    }

    if (pathName === 'projects') {
      return [
        { name: 'hanzo', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" /> },
        { name: 'lux', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" /> },
        { name: 'zoo', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" /> },
      ];
    }

    if (pathName === 'dotfiles') {
      return [
        { name: 'ellipsis', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" /> },
        { name: 'dot-zsh', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
        { name: 'dot-vim', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
        { name: 'zeesh', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
      ];
    }

    if (pathName === 'Downloads') {
      return [
        { name: 'resume.pdf', type: 'file', icon: <FileText className="w-12 h-12 text-red-400" />, size: '245 KB' },
      ];
    }

    return [];
  }, []);

  // Get file path for tagging
  const getFilePath = useCallback((item: FileItem): string => {
    return [...currentPath, item.name].join('/');
  }, [currentPath]);

  // Filter files by tag or smart folder
  const files = useMemo(() => {
    let result = getFilesForPath(currentPath);

    if (filterByTag) {
      const taggedPaths = getFilesByTag(filterByTag);
      result = result.filter(file => taggedPaths.includes(getFilePath(file)));
    }

    if (activeSmartFolder) {
      const folder = smartFolders.find(sf => sf.id === activeSmartFolder);
      if (folder) {
        result = result.filter(file => {
          return folder.filters.every(filter => {
            const filePath = getFilePath(file);
            switch (filter.type) {
              case 'tag': {
                const fileTags = getFileTags(filePath);
                const hasTag = fileTags.some(t => t.id === filter.value);
                return filter.operator === 'is' ? hasTag : !hasTag;
              }
              case 'name': {
                if (filter.operator === 'contains') {
                  return file.name.toLowerCase().includes(filter.value.toLowerCase());
                }
                return filter.operator === 'is'
                  ? file.name === filter.value
                  : file.name !== filter.value;
              }
              case 'type':
                return filter.operator === 'is'
                  ? file.type === filter.value
                  : file.type !== filter.value;
              default:
                return true;
            }
          });
        });
      }
    }

    return result;
  }, [currentPath, filterByTag, activeSmartFolder, smartFolders, getFilesByTag, getFileTags, getFilePath, getFilesForPath]);

  // Get previewable files (only files, not folders)
  const previewableFiles = files.filter(f => f.type === 'file');

  // Convert FileItem to QuickLookFile
  const toQuickLookFile = useCallback((item: FileItem): QuickLookFile => ({
    name: item.name,
    type: item.type,
    content: item.content,
    url: item.url,
    size: item.size,
    modified: item.modified,
  }), []);

  // Open Quick Look for selected file
  const openQuickLook = useCallback((item?: FileItem) => {
    const targetItem = item || files.find(f => f.name === selectedItem);
    if (targetItem && targetItem.type === 'file') {
      setQuickLookFile(targetItem);
    }
  }, [files, selectedItem]);

  // Close Quick Look
  const closeQuickLook = useCallback(() => {
    setQuickLookFile(null);
  }, []);

  // Navigate between files in Quick Look
  const navigateQuickLook = useCallback((file: QuickLookFile) => {
    const item = files.find(f => f.name === file.name);
    if (item) {
      setQuickLookFile(item);
      setSelectedItem(item.name);
    }
  }, [files]);

  // Handle share action from Quick Look
  const handleQuickLookShare = useCallback((file: QuickLookFile) => {
    const item = files.find(f => f.name === file.name);
    if (item?.url) {
      navigator.clipboard?.writeText(item.url);
      toast({ title: 'Link copied', description: 'URL copied to clipboard' });
    } else {
      toast({ title: 'Share', description: `Sharing ${file.name}` });
    }
  }, [files]);

  // Handle open with action from Quick Look
  const handleQuickLookOpenWith = useCallback((file: QuickLookFile) => {
    const item = files.find(f => f.name === file.name);
    if (item?.url) {
      window.open(item.url, '_blank');
    } else {
      toast({ title: 'Open with...', description: `Opening ${file.name}` });
    }
  }, [files]);

  // Keyboard handler for Space key (Quick Look trigger)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if Quick Look is already open (it handles its own keys)
      if (quickLookFile) return;

      // Skip if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space to open Quick Look
      if (e.key === ' ' && selectedItem && !e.metaKey && !e.ctrlKey) {
        const item = files.find(f => f.name === selectedItem);
        if (item && item.type === 'file') {
          e.preventDefault();
          openQuickLook(item);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, quickLookFile, openQuickLook, files]);

  // Initialize column view data when entering column mode or path changes
  useEffect(() => {
    if (viewMode === 'columns') {
      const columns: ColumnData[] = [];
      for (let i = 0; i < currentPath.length; i++) {
        const path = currentPath.slice(0, i + 1);
        const items = getFilesForPath(path);
        const nextItem = currentPath[i + 1] || null;
        columns.push({ path, items, selectedItem: nextItem });
      }
      // Add the current directory items
      const currentItems = getFilesForPath(currentPath);
      if (currentItems.length > 0 || columns.length === 0) {
        columns.push({ path: currentPath, items: currentItems, selectedItem });
      }
      setColumnData(columns);
      setColumnWidths(prev => {
        const newWidths = [...prev];
        while (newWidths.length < columns.length) {
          newWidths.push(200);
        }
        return newWidths.slice(0, columns.length);
      });
    }
  }, [viewMode, currentPath, selectedItem, getFilesForPath]);

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.name);
    if (item.type === 'file' && item.content) {
      setPreviewFile(item);
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      if (item.url) {
        window.open(item.url, '_blank');
      } else {
        setCurrentPath([...currentPath, item.name]);
        setSelectedItem(null);
        setPreviewFile(null);
      }
    } else {
      if (item.url) {
        window.open(item.url, '_blank');
      }
    }
  };

  // Column view specific handlers
  const handleColumnItemClick = (columnIndex: number, item: FileItem) => {
    if (item.type === 'folder') {
      // Navigate to this folder in column view
      const newPath = [...columnData[columnIndex].path.slice(0, -1), columnData[columnIndex].path[columnData[columnIndex].path.length - 1]];
      if (columnIndex < columnData.length - 1) {
        // Clicking on an item in a non-last column
        const basePath = columnData[columnIndex].path;
        setCurrentPath([...basePath, item.name]);
      } else {
        // Clicking on the last column
        if (!item.url) {
          setCurrentPath([...currentPath, item.name]);
        }
      }
      setSelectedItem(item.name);
    } else {
      setSelectedItem(item.name);
      if (item.content) {
        setPreviewFile(item);
      }
    }
  };

  const handleColumnResize = (columnIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnIndex);

    const startX = e.clientX;
    const startWidth = columnWidths[columnIndex] || 200;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(400, startWidth + delta));
      setColumnWidths(prev => {
        const newWidths = [...prev];
        newWidths[columnIndex] = newWidth;
        return newWidths;
      });
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSidebarClick = (name: string) => {
    setFilterByTag(null);
    setActiveSmartFolder(null);
    if (name === 'zeekay.ai') {
      setCurrentPath(['Home']);
    } else if (name === 'Documents' || name === 'Downloads' || name === 'Applications' || name === 'Desktop') {
      setCurrentPath(['Home', name]);
    } else if (name === 'Trash') {
      setCurrentPath(['Trash']);
    } else {
      setCurrentPath([name]);
    }
    setSelectedItem(null);
  };

  const handleTagClick = (tagId: string) => {
    setActiveSmartFolder(null);
    setFilterByTag(tagId === filterByTag ? null : tagId);
  };

  const handleSmartFolderClick = (folderId: string) => {
    setFilterByTag(null);
    setActiveSmartFolder(folderId === activeSmartFolder ? null : folderId);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTagFile = useCallback((tagId: string, item: FileItem) => {
    const filePath = getFilePath(item);
    const currentFileTags = getFileTags(filePath);
    const hasTag = currentFileTags.some(t => t.id === tagId);

    if (hasTag) {
      removeTagFromFile(filePath, tagId);
    } else {
      addTagToFile(filePath, tagId);
    }
  }, [getFilePath, getFileTags, removeTagFromFile, addTagToFile]);

  // Render tag dots for a file
  const renderFileTags = useCallback((item: FileItem) => {
    const filePath = getFilePath(item);
    const fileTags = getFileTags(filePath);
    if (fileTags.length === 0) return null;

    return (
      <div className="flex gap-0.5 mt-0.5">
        {fileTags.slice(0, 3).map(tag => (
          <div
            key={tag.id}
            className={`w-2 h-2 rounded-full ${TAG_COLORS[tag.color].bg}`}
            title={tag.name}
          />
        ))}
        {fileTags.length > 3 && (
          <span className="text-[10px] text-white/50">+{fileTags.length - 3}</span>
        )}
      </div>
    );
  }, [getFilePath, getFileTags]);

  const handleCreateSmartFolder = () => {
    if (smartFolderName.trim() && smartFolderFilters.length > 0) {
      createSmartFolder(smartFolderName.trim(), smartFolderFilters);
      setSmartFolderName('');
      setSmartFolderFilters([]);
      setShowSmartFolderDialog(false);
      toast({ title: 'Smart Folder Created', description: `"${smartFolderName}" created` });
    }
  };

  const addSmartFolderFilter = () => {
    setSmartFolderFilters([...smartFolderFilters, { type: 'tag', operator: 'is', value: '' }]);
  };

  const updateSmartFolderFilter = (index: number, updates: Partial<SmartFolderFilter>) => {
    setSmartFolderFilters(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeSmartFolderFilter = (index: number) => {
    setSmartFolderFilters(prev => prev.filter((_, i) => i !== index));
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedItem(null);
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, item?: FileItem) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = contentRef.current?.getBoundingClientRect();
    const x = rect ? Math.min(e.clientX - rect.left, rect.width - 200) : e.clientX;
    const y = rect ? Math.min(e.clientY - rect.top, rect.height - 300) : e.clientY;

    setContextMenu({
      x,
      y,
      item: item || null,
      isBackground: !item
    });

    if (item) {
      setSelectedItem(item.name);
    }
  };

  const handleContextAction = (action: string) => {
    const item = contextMenu?.item;
    setContextMenu(null);

    switch (action) {
      case 'open':
        if (item) {
          if (item.type === 'folder') {
            if (item.url) {
              window.open(item.url, '_blank');
            } else {
              setCurrentPath([...currentPath, item.name]);
            }
          } else if (item.url) {
            window.open(item.url, '_blank');
          }
        }
        break;
      case 'quicklook':
        if (item && item.type === 'file') {
          openQuickLook(item);
        }
        break;
      case 'getinfo':
        if (item) {
          setShowGetInfo(item);
        }
        break;
      case 'copy':
        if (item) {
          navigator.clipboard?.writeText(item.name);
        }
        break;
      case 'copypath':
        if (item) {
          navigator.clipboard?.writeText([...currentPath, item.name].join('/'));
        }
        break;
      case 'newfolder':
        toast({ title: 'New Folder', description: `Creating folder in ${currentPath.join('/')}` });
        break;
      case 'newfile':
        toast({ title: 'New File', description: `Creating file in ${currentPath.join('/')}` });
        break;
      case 'trash':
        toast({ title: 'Move to Trash', description: `${item?.name || 'Item'} moved to trash` });
        break;
      case 'share':
        if (item?.url) {
          navigator.clipboard?.writeText(item.url);
        }
        break;
    }
  };

  // Drag handlers for files/folders
  const handleFileDragStart = useCallback((e: React.DragEvent, file: FileItem) => {
    setDraggedItem(file);

    // Create drag item
    const dragItem: DragItem = {
      itemType: file.type === 'folder' ? 'folder' : 'file',
      data: {
        name: file.name,
        type: file.type,
        path: [...currentPath],
        content: file.content,
        url: file.url,
        size: file.size,
        modified: file.modified,
      },
      source: 'finder',
    };

    startDrag(dragItem, e);
    e.dataTransfer.effectAllowed = 'all';

    // Create custom drag preview
    const ghost = document.createElement('div');
    ghost.className = 'flex flex-col items-center p-2 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20';
    ghost.innerHTML = `
      <div class="w-12 h-12 flex items-center justify-center text-3xl">
        ${file.type === 'folder' ? '📁' : '📄'}
      </div>
      <div class="text-xs text-white/80 mt-1 max-w-[100px] truncate text-center">${file.name}</div>
    `;
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 40, 40);

    setTimeout(() => ghost.parentNode?.removeChild(ghost), 0);
  }, [currentPath, startDrag]);

  const handleFileDragEnd = useCallback(() => {
    setDraggedItem(null);
    endDrag();
  }, [endDrag]);

  const handleFolderDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFolderDragEnter = useCallback((e: React.DragEvent, folder: FileItem) => {
    if (folder.type === 'folder' && !folder.url) {
      e.preventDefault();
      e.stopPropagation();
      startSpringLoad(`${currentPath.join('/')}/${folder.name}`);
    }
  }, [currentPath, startSpringLoad]);

  const handleFolderDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    cancelSpringLoad();
  }, [cancelSpringLoad]);

  const handleFolderFileDrop = useCallback((e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    cancelSpringLoad();

    if (targetFolder.type !== 'folder') return;

    const zosFileData = e.dataTransfer.getData('application/x-zos-file');
    if (zosFileData) {
      try {
        const fileData = JSON.parse(zosFileData) as DragFileItem;
        const operation = e.altKey ? 'copy' : e.metaKey ? 'link' : 'move';
        const action = operation === 'copy' ? 'Copied' : operation === 'link' ? 'Created alias for' : 'Moved';

        toast({
          title: `${action} ${fileData.name}`,
          description: `${action} to ${targetFolder.name}`,
        });
      } catch {
        // Ignore parse errors
      }
    }
  }, [cancelSpringLoad]);

  // Handle drop into current folder content area
  const handleContentAreaDrop = useCallback((item: DragItem, operation: DragOperation) => {
    const fileData = item.data as DragFileItem;
    const action = operation === 'copy' ? 'Copied' : operation === 'link' ? 'Created alias for' : 'Moved';
    toast({
      title: `${action} ${fileData.name}`,
      description: `${action} to ${currentPath.join('/')}`,
    });
  }, [currentPath]);

  // Drop target for main content area
  const contentDropTarget = useDropTarget(
    `finder-content-${currentPath.join('/')}`,
    ['file', 'folder', 'image'],
    handleContentAreaDrop
  );

  // Check if a folder should open due to spring loading
  useEffect(() => {
    files.forEach(file => {
      if (file.type === 'folder' && !file.url && isSpringLoading(`${currentPath.join('/')}/${file.name}`)) {
        setCurrentPath([...currentPath, file.name]);
        cancelSpringLoad();
      }
    });
  }, [files, currentPath, isSpringLoading, cancelSpringLoad, setCurrentPath]);

  // Quick action handlers
  const quickActions = [
    { icon: <Tag className="w-4 h-4" />, label: 'Tag', action: () => toast({ title: 'Tag', description: 'Add tags to selected items' }) },
    { icon: <Share className="w-4 h-4" />, label: 'Share', action: () => toast({ title: 'Share', description: 'Share selected items' }) },
    { icon: <Archive className="w-4 h-4" />, label: 'Compress', action: () => toast({ title: 'Compress', description: 'Compressing selected items' }) },
    { icon: <Edit className="w-4 h-4" />, label: 'Edit', action: () => toast({ title: 'Edit', description: 'Opening editor' }) },
    { icon: <MoreHorizontal className="w-4 h-4" />, label: 'More', action: () => toast({ title: 'More Actions', description: 'Additional actions menu' }) },
  ];

  // Get folder name for tab display
  const getTabName = (path: string[]) => path[path.length - 1] || 'Finder';

  // Get icon for folder
  const getFolderIcon = (name: string) => {
    if (name === 'Home' || name === 'zeekay.ai') return <HardDrive className="w-3 h-3" />;
    if (name === 'Documents') return <Folder className="w-3 h-3" />;
    if (name === 'Downloads') return <Download className="w-3 h-3" />;
    if (name === 'Trash') return <Trash2 className="w-3 h-3" />;
    return <Folder className="w-3 h-3" />;
  };

  return (
    <ZWindow
      title="Finder"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#3d3d3d] to-[#2d2d2d] border-b border-black/30">
          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
              disabled={currentPath.length <= 1}
              onClick={() => setCurrentPath(currentPath.slice(0, -1))}
            >
              <ChevronRight className="w-4 h-4 text-white/70 rotate-180" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10 opacity-30">
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Breadcrumb path (in toolbar) */}
          <div className="flex items-center gap-1 text-sm text-white/70">
            {currentPath.map((segment, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3 h-3 text-white/40" />}
                <button
                  className="hover:text-white px-1"
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {segment}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* View mode and quick actions */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {selectedItem && (
              <div className="flex items-center gap-0.5 mr-2">
                {quickActions.slice(0, 3).map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white/90"
                    title={action.label}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
            )}

            {/* View mode buttons */}
            <div className="flex items-center gap-0.5 bg-black/30 rounded-lg p-0.5">
              <button
                className={`p-1.5 rounded ${viewMode === 'icons' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('icons')}
                title="Icons"
              >
                <LayoutGrid className="w-4 h-4 text-white/70" />
              </button>
              <button
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('list')}
                title="List"
              >
                <List className="w-4 h-4 text-white/70" />
              </button>
              <button
                className={`p-1.5 rounded ${viewMode === 'columns' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('columns')}
                title="Columns"
              >
                <Columns className="w-4 h-4 text-white/70" />
              </button>
              <button
                className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setViewMode('gallery')}
                title="Gallery"
              >
                <GalleryHorizontal className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center bg-[#2a2a2a] border-b border-black/30 min-h-[32px]">
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleTabDragStart(e, tab.id)}
                onDragOver={(e) => handleTabDragOver(e, tab.id)}
                onDrop={(e) => handleTabDrop(e, tab.id)}
                onDragEnd={handleTabDragEnd}
                className={`group flex items-center gap-1.5 px-3 py-1.5 border-r border-black/20 cursor-pointer min-w-0 max-w-[180px] ${
                  tab.id === activeTabId
                    ? 'bg-[#3a3a3a]'
                    : 'bg-transparent hover:bg-white/5'
                } ${dragOverTabId === tab.id ? 'bg-blue-500/20' : ''}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="text-white/60">
                  {getFolderIcon(getTabName(tab.path))}
                </span>
                <span className="text-xs text-white/80 truncate flex-1">
                  {getTabName(tab.path)}
                </span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/20 text-white/50 hover:text-white/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={createNewTab}
            className="p-1.5 mx-1 rounded hover:bg-white/10 text-white/50 hover:text-white/90"
            title="New Tab (Cmd+T)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 vibrancy-sidebar overflow-y-auto flex-shrink-0 flex flex-col" data-sidebar>
            {/* Favorites */}
            <div className="p-2 pt-1">
              <button
                className="w-full flex items-center gap-1 text-[11px] font-medium text-white/50 uppercase tracking-wide px-2 py-1.5 hover:text-white/70"
                onClick={() => toggleSection('favorites')}
              >
                {expandedSections.favorites ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Favorites
              </button>
              {expandedSections.favorites && favorites.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80"
                  onClick={() => handleSidebarClick(item.name)}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>

            {/* Locations */}
            <div className="p-2 pt-1">
              <button
                className="w-full flex items-center gap-1 text-[11px] font-medium text-white/50 uppercase tracking-wide px-2 py-1.5 hover:text-white/70"
                onClick={() => toggleSection('locations')}
              >
                {expandedSections.locations ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Locations
              </button>
              {expandedSections.locations && locations.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80"
                  onClick={() => handleSidebarClick(item.name)}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>

            {/* Tags */}
            <div className="p-2 pt-1">
              <button
                className="w-full flex items-center gap-1 text-[11px] font-medium text-white/50 uppercase tracking-wide px-2 py-1.5 hover:text-white/70"
                onClick={() => toggleSection('tags')}
              >
                {expandedSections.tags ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Tags
              </button>
              {expandedSections.tags && tags.map((tag) => (
                <div key={tag.id} className="group flex items-center">
                  <button
                    className={`flex-1 flex items-center gap-2 px-2 py-1 rounded text-sm text-white/80 ${
                      filterByTag === tag.id ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                    onClick={() => handleTagClick(tag.id)}
                  >
                    <div className={`w-3 h-3 rounded-full ${TAG_COLORS[tag.color].bg}`} />
                    {editingTagId === tag.id ? (
                      <input
                        type="text"
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        onBlur={() => {
                          if (editingTagName.trim()) {
                            updateTag(tag.id, { name: editingTagName.trim() });
                          }
                          setEditingTagId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingTagName.trim()) {
                              updateTag(tag.id, { name: editingTagName.trim() });
                            }
                            setEditingTagId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTagId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-b border-white/30 outline-none text-white w-20"
                        autoFocus
                      />
                    ) : (
                      tag.name
                    )}
                  </button>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTagId(tag.id);
                      setEditingTagName(tag.name);
                    }}
                  >
                    <Pencil className="w-3 h-3 text-white/50" />
                  </button>
                </div>
              ))}
              {expandedSections.tags && (
                <button
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/50 mt-1"
                  onClick={() => {
                    const colors: TagColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];
                    const unusedColor = colors.find(c => !tags.some(t => t.color === c)) || 'gray';
                    createTag('New Tag', unusedColor);
                  }}
                >
                  <Plus className="w-3 h-3" />
                  Add Tag
                </button>
              )}
            </div>

            {/* Smart Folders */}
            <div className="p-2 pt-1">
              <button
                className="w-full flex items-center gap-1 text-[11px] font-medium text-white/50 uppercase tracking-wide px-2 py-1.5 hover:text-white/70"
                onClick={() => toggleSection('smartFolders')}
              >
                {expandedSections.smartFolders ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Smart Folders
              </button>
              {expandedSections.smartFolders && (
                <>
                  {smartFolders.map((folder) => (
                    <div key={folder.id} className="group flex items-center">
                      <button
                        className={`flex-1 flex items-center gap-2 px-2 py-1 rounded text-sm text-white/80 ${
                          activeSmartFolder === folder.id ? 'bg-white/20' : 'hover:bg-white/10'
                        }`}
                        onClick={() => handleSmartFolderClick(folder.id)}
                      >
                        <Search className="w-4 h-4 text-purple-400" />
                        {folder.name}
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSmartFolder(folder.id);
                        }}
                      >
                        <X className="w-3 h-3 text-white/50" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/50 mt-1"
                    onClick={() => setShowSmartFolderDialog(true)}
                  >
                    <Plus className="w-3 h-3" />
                    New Smart Folder
                  </button>
                </>
              )}
            </div>

            {/* Trash */}
            <div className="p-2 pt-1 mt-auto border-t border-white/5">
              <button
                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80"
                onClick={() => handleSidebarClick('Trash')}
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
                Trash
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div
            ref={(el) => {
              (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              contentDropTarget.ref(el);
            }}
            className={`flex-1 overflow-hidden bg-[#232323] relative flex flex-col transition-colors ${
              contentDropTarget.isOver && contentDropTarget.canDrop ? 'bg-blue-500/10 ring-2 ring-blue-500/30 ring-inset' : ''
            }`}
            onContextMenu={(e) => handleContextMenu(e)}
            onDragOver={contentDropTarget.onDragOver}
            onDragEnter={contentDropTarget.onDragEnter}
            onDragLeave={contentDropTarget.onDragLeave}
            onDrop={contentDropTarget.onDrop}
          >
            <div className="flex-1 overflow-auto p-4">
              {/* Icons View */}
              {viewMode === 'icons' && (
                <div className="grid grid-cols-6 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      draggable
                      onDragStart={(e) => handleFileDragStart(e, file)}
                      onDragEnd={handleFileDragEnd}
                      onDragOver={file.type === 'folder' && !file.url ? handleFolderDragOver : undefined}
                      onDragEnter={file.type === 'folder' && !file.url ? (e) => handleFolderDragEnter(e, file) : undefined}
                      onDragLeave={file.type === 'folder' && !file.url ? handleFolderDragLeave : undefined}
                      onDrop={file.type === 'folder' && !file.url ? (e) => handleFolderFileDrop(e, file) : undefined}
                      className={`flex flex-col items-center p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                        selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                      } ${draggedItem?.name === file.name ? 'opacity-50' : ''} ${
                        file.type === 'folder' && isDragging && !file.url ? 'ring-2 ring-blue-400/50 ring-inset' : ''
                      }`}
                      onClick={() => handleItemClick(file)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      {file.icon}
                      <span className="text-xs text-white/80 mt-1 text-center truncate w-full">
                        {file.name}
                      </span>
                      {renderFileTags(file)}
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-0.5">
                  <div className="flex items-center px-2 py-1 text-xs text-white/50 border-b border-white/10">
                    <span className="flex-1">Name</span>
                    <span className="w-16">Tags</span>
                    <span className="w-24">Date Modified</span>
                    <span className="w-20 text-right">Size</span>
                  </div>
                  {files.map((file) => (
                    <div
                      key={file.name}
                      draggable
                      onDragStart={(e) => handleFileDragStart(e, file)}
                      onDragEnd={handleFileDragEnd}
                      onDragOver={file.type === 'folder' && !file.url ? handleFolderDragOver : undefined}
                      onDragEnter={file.type === 'folder' && !file.url ? (e) => handleFolderDragEnter(e, file) : undefined}
                      onDragLeave={file.type === 'folder' && !file.url ? handleFolderDragLeave : undefined}
                      onDrop={file.type === 'folder' && !file.url ? (e) => handleFolderFileDrop(e, file) : undefined}
                      className={`w-full flex items-center px-2 py-1.5 rounded cursor-grab active:cursor-grabbing transition-all ${
                        selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                      } ${draggedItem?.name === file.name ? 'opacity-50' : ''} ${
                        file.type === 'folder' && isDragging && !file.url ? 'ring-1 ring-blue-400/50 ring-inset' : ''
                      }`}
                      onClick={() => handleItemClick(file)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      <span className="flex items-center gap-2 flex-1">
                        {file.type === 'folder' ? (
                          <Folder className="w-4 h-4 text-blue-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-white/80">{file.name}</span>
                      </span>
                      <span className="w-16">{renderFileTags(file)}</span>
                      <span className="w-24 text-xs text-white/50">{file.modified || 'Today'}</span>
                      <span className="w-20 text-xs text-white/50 text-right">
                        {file.size || '--'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Column View */}
              {viewMode === 'columns' && (
                <div
                  ref={columnContainerRef}
                  className="flex h-full overflow-x-auto"
                  style={{ marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}
                >
                  {columnData.map((column, colIndex) => (
                    <React.Fragment key={colIndex}>
                      <div
                        className="flex-shrink-0 border-r border-white/10 overflow-y-auto"
                        style={{ width: columnWidths[colIndex] || 200, minWidth: 120 }}
                      >
                        {column.items.map((item) => (
                          <button
                            key={item.name}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-left ${
                              column.selectedItem === item.name || (colIndex === columnData.length - 1 && selectedItem === item.name)
                                ? 'bg-blue-500/30'
                                : 'hover:bg-white/10'
                            }`}
                            onClick={() => handleColumnItemClick(colIndex, item)}
                            onDoubleClick={() => {
                              if (item.url) window.open(item.url, '_blank');
                            }}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                          >
                            {item.type === 'folder' ? (
                              <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm text-white/80 truncate flex-1">{item.name}</span>
                            {item.type === 'folder' && (
                              <ChevronRight className="w-3 h-3 text-white/40 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                      {/* Column resize handle */}
                      <div
                        data-column-resizer
                        className={`w-1 hover:bg-blue-500/50 ${
                          resizingColumn === colIndex ? 'bg-blue-500/50' : ''
                        }`}
                        onMouseDown={(e) => handleColumnResize(colIndex, e)}
                      />
                    </React.Fragment>
                  ))}
                  {/* Preview column for selected file */}
                  {previewFile && (
                    <div className="flex-shrink-0 w-64 border-l border-white/10 p-4 overflow-y-auto">
                      <div className="flex flex-col items-center mb-4">
                        <FileText className="w-16 h-16 text-gray-400 mb-2" />
                        <span className="text-sm text-white/80 text-center">{previewFile.name}</span>
                        <span className="text-xs text-white/50">{previewFile.size}</span>
                      </div>
                      <div className="text-xs text-white/60 whitespace-pre-wrap font-mono">
                        {previewFile.content?.slice(0, 500)}...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gallery View */}
              {viewMode === 'gallery' && (
                <div className="grid grid-cols-6 gap-4">
                  {files.map((file) => (
                    <button
                      key={file.name}
                      className={`flex flex-col items-center p-2 rounded-lg ${
                        selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                      }`}
                      onClick={() => handleItemClick(file)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                    >
                      {file.icon}
                      <span className="text-xs text-white/80 mt-1 text-center truncate w-full">
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Context Menu */}
              {contextMenu && (
                <div
                  className="absolute vibrancy-menu rounded-xl py-1 min-w-[200px] z-50"
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {contextMenu.isBackground ? (
                    <>
                      <button
                        onClick={() => handleContextAction('newfolder')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <FolderPlus className="w-4 h-4 text-white/60" />
                        New Folder
                      </button>
                      <button
                        onClick={() => handleContextAction('newfile')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <FilePlus className="w-4 h-4 text-white/60" />
                        New Document
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => setViewMode('icons')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <LayoutGrid className="w-4 h-4 text-white/60" />
                        View as Icons
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <List className="w-4 h-4 text-white/60" />
                        View as List
                      </button>
                      <button
                        onClick={() => setViewMode('columns')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <Columns className="w-4 h-4 text-white/60" />
                        View as Columns
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => setShowPathBar(prev => !prev)}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <ChevronRight className="w-4 h-4 text-white/60" />
                        {showPathBar ? 'Hide' : 'Show'} Path Bar
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => handleContextAction('getinfo')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <Info className="w-4 h-4 text-white/60" />
                        Get Info
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleContextAction('open')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm font-medium"
                      >
                        <FolderOpen className="w-4 h-4 text-white/60" />
                        Open
                      </button>
                      {contextMenu.item?.type === 'file' && (
                        <button
                          onClick={() => handleContextAction('quicklook')}
                          className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                        >
                          <Eye className="w-4 h-4 text-white/60" />
                          Quick Look
                          <span className="ml-auto text-white/40 text-xs">Space</span>
                        </button>
                      )}
                      <div className="h-px bg-white/10 my-1 mx-2" />

                      {/* Tags submenu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTagMenu(!showTagMenu);
                          }}
                          className="w-full flex items-center justify-between gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                        >
                          <span className="flex items-center gap-3">
                            <Tag className="w-4 h-4 text-white/60" />
                            Tags
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {showTagMenu && contextMenu.item && (
                          <div
                            className="absolute left-full top-0 ml-1 vibrancy-menu rounded-xl py-1 min-w-[160px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {tags.map(tag => {
                              const filePath = getFilePath(contextMenu.item!);
                              const isTagged = getFileTags(filePath).some(t => t.id === tag.id);
                              return (
                                <button
                                  key={tag.id}
                                  onClick={() => handleTagFile(tag.id, contextMenu.item!)}
                                  className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                                >
                                  <div className={`w-3 h-3 rounded-full ${TAG_COLORS[tag.color].bg}`} />
                                  <span className="flex-1 text-left">{tag.name}</span>
                                  {isTagged && <Check className="w-4 h-4" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => handleContextAction('getinfo')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <Info className="w-4 h-4 text-white/60" />
                        Get Info
                      </button>
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => handleContextAction('copy')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <Copy className="w-4 h-4 text-white/60" />
                        Copy
                      </button>
                      <button
                        onClick={() => handleContextAction('copypath')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                      >
                        <Copy className="w-4 h-4 text-white/60" />
                        Copy Path
                      </button>
                      {contextMenu.item?.url && (
                        <button
                          onClick={() => handleContextAction('share')}
                          className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500 rounded-sm"
                        >
                          <Share className="w-4 h-4 text-white/60" />
                          Copy Link
                        </button>
                      )}
                      <div className="h-px bg-white/10 my-1 mx-2" />
                      <button
                        onClick={() => handleContextAction('trash')}
                        className="w-full flex items-center gap-3 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Move to Trash
                      </button>
                    </>
                  )}
                </div>
              )}

              {files.length === 0 && (
                <div className="flex items-center justify-center h-full text-white/40">
                  {filterByTag || activeSmartFolder ? 'No matching files' : 'This folder is empty'}
                </div>
              )}
            </div>

            {/* Path Bar */}
            {showPathBar && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#1e1e1e] border-t border-white/10">
                {currentPath.map((segment, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="w-3 h-3 text-white/30" />}
                    <button
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 text-xs text-white/70 hover:text-white"
                      onClick={() => handleBreadcrumbClick(index)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        // Could add path bar context menu here
                      }}
                    >
                      {getFolderIcon(segment)}
                      <span>{segment}</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 bg-gradient-to-b from-[#2a2a2a] to-[#252525] border-t border-black/30 text-xs text-white/60">
          {files.length} item{files.length !== 1 ? 's' : ''}
          {filterByTag && ` tagged "${tags.find(t => t.id === filterByTag)?.name}"`}
          {activeSmartFolder && ` in "${smartFolders.find(sf => sf.id === activeSmartFolder)?.name}"`}
          {selectedItem && (
            <>
              {` - "${selectedItem}" selected`}
              {files.find(f => f.name === selectedItem)?.type === 'file' && (
                <span className="ml-2 text-white/40">Press Space to Quick Look</span>
              )}
            </>
          )}
        </div>

        {/* Quick Look Preview Modal */}
        {previewFile && viewMode !== 'columns' && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="bg-[#1e1e1e] rounded-xl border border-white/20 shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-medium">{previewFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {previewFile.url && (
                    <button
                      onClick={() => window.open(previewFile.url, '_blank')}
                      className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white"
                      title="Open in browser"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                  {previewFile.content}
                </pre>
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-t border-white/10">
                <span className="text-xs text-white/50">{previewFile.size || 'Document'}</span>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Look Modal - rendered as portal for proper z-index */}
      {quickLookFile && (
        <QuickLook
          file={toQuickLookFile(quickLookFile)}
          files={previewableFiles.map(toQuickLookFile)}
          onClose={closeQuickLook}
          onNavigate={navigateQuickLook}
          onShare={handleQuickLookShare}
          onOpenWith={handleQuickLookOpenWith}
        />
      )}

      {/* Smart Folder Dialog */}
      {showSmartFolderDialog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setShowSmartFolderDialog(false)}
        >
          <div
            className="bg-[#1e1e1e] rounded-xl border border-white/20 shadow-2xl w-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-white/10">
              <span className="text-white font-medium">New Smart Folder</span>
              <button
                onClick={() => setShowSmartFolderDialog(false)}
                className="p-1.5 rounded hover:bg-white/10 text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input
                  type="text"
                  value={smartFolderName}
                  onChange={(e) => setSmartFolderName(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  placeholder="Smart Folder Name"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Filters</label>
                {smartFolderFilters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={filter.type}
                      onChange={(e) => updateSmartFolderFilter(index, { type: e.target.value as SmartFolderFilter['type'] })}
                      className="bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-white text-sm outline-none"
                    >
                      <option value="tag">Tag</option>
                      <option value="name">Name</option>
                      <option value="type">Type</option>
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateSmartFolderFilter(index, { operator: e.target.value as SmartFolderFilter['operator'] })}
                      className="bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-white text-sm outline-none"
                    >
                      <option value="is">is</option>
                      <option value="isNot">is not</option>
                      <option value="contains">contains</option>
                    </select>
                    {filter.type === 'tag' ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateSmartFolderFilter(index, { value: e.target.value })}
                        className="flex-1 bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-white text-sm outline-none"
                      >
                        <option value="">Select tag...</option>
                        {tags.map(tag => (
                          <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                      </select>
                    ) : filter.type === 'type' ? (
                      <select
                        value={filter.value}
                        onChange={(e) => updateSmartFolderFilter(index, { value: e.target.value })}
                        className="flex-1 bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-white text-sm outline-none"
                      >
                        <option value="">Select type...</option>
                        <option value="file">File</option>
                        <option value="folder">Folder</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateSmartFolderFilter(index, { value: e.target.value })}
                        className="flex-1 bg-[#2a2a2a] border border-white/10 rounded px-2 py-1 text-white text-sm outline-none"
                        placeholder="Value..."
                      />
                    )}
                    <button
                      onClick={() => removeSmartFolderFilter(index)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <X className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSmartFolderFilter}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-3 h-3" />
                  Add Filter
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-[#2d2d2d] border-t border-white/10">
              <button
                onClick={() => setShowSmartFolderDialog(false)}
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSmartFolder}
                disabled={!smartFolderName.trim() || smartFolderFilters.length === 0}
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </ZWindow>
  );
};

export default ZFinderWindow;
