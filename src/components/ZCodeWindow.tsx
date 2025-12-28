import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor, rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches, search, openSearchPanel } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap, indentUnit } from '@codemirror/language';
import { lintKeymap } from '@codemirror/lint';
import { cn } from '@/lib/utils';
import ZWindow from './ZWindow';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileJson,
  ChevronRight,
  ChevronDown,
  Play,
  Bug,
  GitBranch,
  GitCommit,
  RefreshCw,
  Terminal,
  X,
  Plus,
  Minus,
  Search,
  Code2,
  Settings,
  Copy,
  Clipboard,
  Trash2,
  Edit3,
  Columns,
  Rows,
  Command,
  AlertTriangle,
  Info,
  XCircle,
  FolderPlus,
  FilePlus,
  Hash,
  PanelLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
  isExpanded?: boolean;
}

interface OpenFile {
  id: string;
  path: string;
  name: string;
  content: string;
  originalContent: string;
  modified: boolean;
  language: string;
  cursorPosition?: { line: number; ch: number };
}

interface GitChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'untracked';
  staged: boolean;
}

interface SearchResult {
  path: string;
  line: number;
  column: number;
  text: string;
  match: string;
}

interface TerminalTab {
  id: string;
  name: string;
  output: string[];
  input: string;
  cwd: string;
}

interface BuildMessage {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  file?: string;
  line?: number;
  column?: number;
}

interface EditorSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  formatOnSave: boolean;
  bracketMatching: boolean;
}

type SidebarView = 'files' | 'search' | 'git' | 'settings';
type BottomPanelView = 'terminal' | 'output' | 'problems';

// ============================================================================
// CONSTANTS AND UTILITIES
// ============================================================================

const STORAGE_KEY = 'zcode_filesystem';
const SETTINGS_KEY = 'zcode_settings';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'dark',
  fontSize: 13,
  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  autoSave: false,
  autoSaveDelay: 1000,
  formatOnSave: false,
  bracketMatching: true,
};

const LANGUAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tsx: FileCode,
  ts: FileCode,
  jsx: FileCode,
  js: FileCode,
  json: FileJson,
  css: FileCode,
  scss: FileCode,
  html: FileCode,
  md: FileText,
  txt: FileText,
  default: File,
};

const LANGUAGE_COLORS: Record<string, string> = {
  tsx: 'text-blue-400',
  ts: 'text-blue-400',
  jsx: 'text-yellow-400',
  js: 'text-yellow-400',
  json: 'text-yellow-500',
  css: 'text-pink-400',
  scss: 'text-pink-400',
  html: 'text-orange-400',
  md: 'text-gray-400',
  txt: 'text-gray-400',
  default: 'text-gray-400',
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const getLanguageExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return javascript({ jsx: true });
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'md':
    case 'markdown':
      return markdown();
    case 'json':
      return json();
    case 'css':
    case 'scss':
    case 'sass':
      return css();
    case 'html':
    case 'htm':
      return html();
    default:
      return [];
  }
};

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || 'txt';
};

const getFileIcon = (fileName: string): React.ComponentType<{ className?: string }> => {
  const ext = getFileExtension(fileName);
  return LANGUAGE_ICONS[ext] || LANGUAGE_ICONS.default;
};

const getFileIconColor = (fileName: string): string => {
  const ext = getFileExtension(fileName);
  return LANGUAGE_COLORS[ext] || LANGUAGE_COLORS.default;
};

// ============================================================================
// INITIAL FILE SYSTEM
// ============================================================================

const createDefaultFileSystem = (): FileNode => ({
  id: 'root',
  name: 'workspace',
  type: 'folder',
  path: '/',
  isExpanded: true,
  children: [
    {
      id: generateId(),
      name: 'src',
      type: 'folder',
      path: '/src',
      isExpanded: true,
      children: [
        {
          id: generateId(),
          name: 'components',
          type: 'folder',
          path: '/src/components',
          isExpanded: true,
          children: [
            {
              id: generateId(),
              name: 'App.tsx',
              type: 'file',
              path: '/src/components/App.tsx',
              language: 'tsx',
              content: `import React from 'react';

interface AppProps {
  title: string;
}

const App: React.FC<AppProps> = ({ title }) => {
  return (
    <div className="app">
      <h1>{title}</h1>
      <p>Welcome to zOS Code Editor!</p>
    </div>
  );
};

export default App;
`,
            },
            {
              id: generateId(),
              name: 'Button.tsx',
              type: 'file',
              path: '/src/components/Button.tsx',
              language: 'tsx',
              content: `import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};
`,
            },
          ],
        },
        {
          id: generateId(),
          name: 'styles',
          type: 'folder',
          path: '/src/styles',
          children: [
            {
              id: generateId(),
              name: 'main.css',
              type: 'file',
              path: '/src/styles/main.css',
              language: 'css',
              content: `/* Main Styles */
:root {
  --primary-color: #0066cc;
  --secondary-color: #6c757d;
  --background-color: #1e1e1e;
  --text-color: #ffffff;
}

.app {
  min-height: 100vh;
  background: var(--background-color);
  color: var(--text-color);
  padding: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: var(--secondary-color);
  color: white;
}
`,
            },
          ],
        },
        {
          id: generateId(),
          name: 'index.tsx',
          type: 'file',
          path: '/src/index.tsx',
          language: 'tsx',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/main.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App title="My Application" />
  </React.StrictMode>
);
`,
        },
      ],
    },
    {
      id: generateId(),
      name: 'public',
      type: 'folder',
      path: '/public',
      children: [
        {
          id: generateId(),
          name: 'index.html',
          type: 'file',
          path: '/public/index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Application</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
`,
        },
      ],
    },
    {
      id: generateId(),
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      language: 'json',
      content: `{
  "name": "my-application",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
`,
    },
    {
      id: generateId(),
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      language: 'md',
      content: `# My Application

A sample React application built with TypeScript and Vite.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- React 18
- TypeScript
- Vite for fast development
- Hot Module Replacement

## Project Structure

\`\`\`
src/
  components/   # React components
  styles/       # CSS styles
  index.tsx     # Entry point
public/
  index.html    # HTML template
\`\`\`

## License

MIT
`,
    },
    {
      id: generateId(),
      name: 'tsconfig.json',
      type: 'file',
      path: '/tsconfig.json',
      language: 'json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`,
    },
  ],
});

// ============================================================================
// FILE SYSTEM UTILITIES
// ============================================================================

const loadFileSystem = (): FileNode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load file system:', e);
  }
  return createDefaultFileSystem();
};

const saveFileSystem = (fs: FileNode): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fs));
  } catch (e) {
    console.error('Failed to save file system:', e);
  }
};

const loadSettings = (): EditorSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: EditorSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

const findNodeByPath = (root: FileNode, path: string): FileNode | null => {
  if (root.path === path) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }
  return null;
};

const findParentNode = (root: FileNode, path: string): FileNode | null => {
  const parentPath = path.split('/').slice(0, -1).join('/') || '/';
  return findNodeByPath(root, parentPath);
};

const updateNodeInTree = (
  root: FileNode,
  path: string,
  updater: (node: FileNode) => FileNode
): FileNode => {
  if (root.path === path) {
    return updater(root);
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) => updateNodeInTree(child, path, updater)),
    };
  }
  return root;
};

const addNodeToTree = (root: FileNode, parentPath: string, newNode: FileNode): FileNode => {
  if (root.path === parentPath) {
    return {
      ...root,
      children: [...(root.children || []), newNode].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) => addNodeToTree(child, parentPath, newNode)),
    };
  }
  return root;
};

const removeNodeFromTree = (root: FileNode, path: string): FileNode => {
  if (root.children) {
    return {
      ...root,
      children: root.children
        .filter((child) => child.path !== path)
        .map((child) => removeNodeFromTree(child, path)),
    };
  }
  return root;
};

const getAllFiles = (node: FileNode): FileNode[] => {
  const files: FileNode[] = [];
  if (node.type === 'file') {
    files.push(node);
  }
  if (node.children) {
    for (const child of node.children) {
      files.push(...getAllFiles(child));
    }
  }
  return files;
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  onToggleExpand: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
  onDragStart: (e: React.DragEvent, node: FileNode) => void;
  onDrop: (e: React.DragEvent, targetNode: FileNode) => void;
  onDragOver: (e: React.DragEvent) => void;
  dragOverPath: string | null;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  selectedPath,
  onSelect,
  onToggleExpand,
  onContextMenu,
  onDragStart,
  onDrop,
  onDragOver,
  dragOverPath,
}) => {
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder';
  const isDragOver = dragOverPath === node.path;

  const FileIcon = getFileIcon(node.name);
  const iconColor = getFileIconColor(node.name);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer text-sm',
          'hover:bg-[#2a2d2e] transition-colors',
          isSelected && 'bg-[#094771]',
          isDragOver && isFolder && 'bg-[#094771]/50 border border-blue-500'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleExpand(node.path);
          }
          onSelect(node);
        }}
        onContextMenu={(e) => onContextMenu(e, node)}
        draggable
        onDragStart={(e) => onDragStart(e, node)}
        onDrop={(e) => onDrop(e, node)}
        onDragOver={onDragOver}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            {node.isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </span>
        )}
        {!isFolder && <span className="w-4" />}
        {isFolder ? (
          node.isExpanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          )
        ) : (
          <FileIcon className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isFolder && node.isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onContextMenu={onContextMenu}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onDragOver={onDragOver}
              dragOverPath={dragOverPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ContextMenuProps {
  x: number;
  y: number;
  node: FileNode;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canPaste: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  node,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onCopy,
  onPaste,
  canPaste,
}) => {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="fixed bg-[#252526] border border-[#3c3c3c] rounded shadow-xl z-[9999] py-1 min-w-[180px]"
      style={{ left: x, top: y }}
    >
      {node.type === 'folder' && (
        <>
          <button
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
            onClick={onNewFile}
          >
            <FilePlus className="w-4 h-4" />
            New File
          </button>
          <button
            className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
            onClick={onNewFolder}
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <div className="border-t border-[#3c3c3c] my-1" />
        </>
      )}
      <button
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
        onClick={onCopy}
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>
      {node.type === 'folder' && (
        <button
          className={cn(
            'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
            canPaste ? 'hover:bg-[#094771]' : 'opacity-50 cursor-not-allowed'
          )}
          onClick={canPaste ? onPaste : undefined}
        >
          <Clipboard className="w-4 h-4" />
          Paste
        </button>
      )}
      <div className="border-t border-[#3c3c3c] my-1" />
      <button
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#094771] flex items-center gap-2"
        onClick={onRename}
      >
        <Edit3 className="w-4 h-4" />
        Rename
      </button>
      <button
        className="w-full px-3 py-1.5 text-left text-sm hover:bg-[#094771] text-red-400 flex items-center gap-2"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onOpenFile: (file: FileNode) => void;
  onCommand: (command: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onOpenFile,
  onCommand,
}) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'files' | 'commands'>('files');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'save', label: 'Save File', shortcut: 'Cmd+S' },
    { id: 'saveAll', label: 'Save All', shortcut: 'Cmd+Shift+S' },
    { id: 'find', label: 'Find in File', shortcut: 'Cmd+F' },
    { id: 'findInFiles', label: 'Find in Files', shortcut: 'Cmd+Shift+F' },
    { id: 'replace', label: 'Find and Replace', shortcut: 'Cmd+H' },
    { id: 'goToLine', label: 'Go to Line', shortcut: 'Cmd+G' },
    { id: 'format', label: 'Format Document', shortcut: 'Shift+Alt+F' },
    { id: 'fold', label: 'Fold All', shortcut: 'Cmd+K Cmd+0' },
    { id: 'unfold', label: 'Unfold All', shortcut: 'Cmd+K Cmd+J' },
    { id: 'build', label: 'Build Project', shortcut: 'Cmd+B' },
    { id: 'run', label: 'Run Project', shortcut: 'Cmd+R' },
    { id: 'toggleTerminal', label: 'Toggle Terminal', shortcut: 'Cmd+`' },
    { id: 'newFile', label: 'New File', shortcut: 'Cmd+N' },
    { id: 'newFolder', label: 'New Folder', shortcut: 'Cmd+Shift+N' },
    { id: 'settings', label: 'Open Settings', shortcut: 'Cmd+,' },
  ];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.startsWith('>')) {
      setMode('commands');
    } else {
      setMode('files');
    }
    setSelectedIndex(0);
  }, [query]);

  const filteredFiles = useMemo(() => {
    const searchQuery = query.toLowerCase();
    return files.filter((f) => f.name.toLowerCase().includes(searchQuery));
  }, [files, query]);

  const filteredCommands = useMemo(() => {
    const searchQuery = query.slice(1).toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(searchQuery));
  }, [query]);

  const items = mode === 'files' ? filteredFiles : filteredCommands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'files' && filteredFiles[selectedIndex]) {
        onOpenFile(filteredFiles[selectedIndex]);
        onClose();
      } else if (mode === 'commands' && filteredCommands[selectedIndex]) {
        onCommand(filteredCommands[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15%]" onClick={onClose}>
      <div
        className="w-[600px] max-w-[90vw] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3c3c3c]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'commands' ? 'Type a command...' : 'Search files by name (> for commands)'}
            className="flex-1 bg-transparent border-none outline-none text-sm"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {mode === 'files' &&
            filteredFiles.slice(0, 10).map((file, i) => {
              const FileIconComp = getFileIcon(file.name);
              const iconColor = getFileIconColor(file.name);
              return (
                <div
                  key={file.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer',
                    i === selectedIndex ? 'bg-[#094771]' : 'hover:bg-[#2a2d2e]'
                  )}
                  onClick={() => {
                    onOpenFile(file);
                    onClose();
                  }}
                >
                  <FileIconComp className={cn('w-4 h-4', iconColor)} />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{file.path}</span>
                </div>
              );
            })}
          {mode === 'commands' &&
            filteredCommands.slice(0, 10).map((cmd, i) => (
              <div
                key={cmd.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 cursor-pointer',
                  i === selectedIndex ? 'bg-[#094771]' : 'hover:bg-[#2a2d2e]'
                )}
                onClick={() => {
                  onCommand(cmd.id);
                  onClose();
                }}
              >
                <Command className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{cmd.label}</span>
                <span className="text-xs text-gray-500 ml-auto">{cmd.shortcut}</span>
              </div>
            ))}
          {items.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};

interface GoToLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLine: (line: number) => void;
  maxLine: number;
}

const GoToLineDialog: React.FC<GoToLineDialogProps> = ({ isOpen, onClose, onGoToLine, maxLine }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = parseInt(value, 10);
    if (!isNaN(line) && line >= 1 && line <= maxLine) {
      onGoToLine(line);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15%]" onClick={onClose}>
      <div
        className="w-[400px] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={maxLine}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Go to line (1-${maxLine})`}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
        </form>
      </div>
    </div>
  );
};

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({ isOpen, currentName, onClose, onRename }) => {
  const [value, setValue] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(currentName);
      setTimeout(() => {
        inputRef.current?.focus();
        const dotIndex = currentName.lastIndexOf('.');
        inputRef.current?.setSelectionRange(0, dotIndex > 0 ? dotIndex : currentName.length);
      }, 0);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && value !== currentName) {
      onRename(value.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[400px] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[#3c3c3c] font-medium">Rename</div>
        <form onSubmit={handleSubmit} className="p-4">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 bg-[#3c3c3c] border border-[#5a5a5a] rounded text-sm outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded hover:bg-[#3c3c3c]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-blue-600 rounded hover:bg-blue-700"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ZCodeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ZCodeWindow: React.FC<ZCodeWindowProps> = ({ onClose, onFocus }) => {
  const { toast } = useToast();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editorLanguageCompartment = useRef(new Compartment());

  const [fileSystem, setFileSystem] = useState<FileNode>(loadFileSystem);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);

  const [sidebarView, setSidebarView] = useState<SidebarView>('files');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [bottomPanelView, setBottomPanelView] = useState<BottomPanelView>('terminal');
  const [bottomPanelHeight] = useState(200);

  const [searchInFilesQuery, setSearchInFilesQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  const [gitBranch] = useState('main');
  const [gitChanges, setGitChanges] = useState<GitChange[]>([]);
  const [commitMessage, setCommitMessage] = useState('');

  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    { id: generateId(), name: 'Terminal 1', output: ['$ Welcome to zOS Terminal', ''], input: '', cwd: '~' },
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState<string>(terminalTabs[0].id);

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildMessages, setBuildMessages] = useState<BuildMessage[]>([]);
  const [problems] = useState<BuildMessage[]>([]);

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ node: FileNode } | null>(null);
  const [clipboardNode, setClipboardNode] = useState<FileNode | null>(null);

  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);

  const [splitView, setSplitView] = useState<'none' | 'horizontal' | 'vertical'>('none');

  const activeFile = useMemo(
    () => openFiles.find((f) => f.path === activeFilePath),
    [openFiles, activeFilePath]
  );

  const allFiles = useMemo(() => getAllFiles(fileSystem), [fileSystem]);

  useEffect(() => {
    saveFileSystem(fileSystem);
  }, [fileSystem]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    const changes: GitChange[] = openFiles
      .filter((f) => f.modified)
      .map((f) => ({
        path: f.path,
        status: 'modified' as const,
        staged: false,
      }));
    setGitChanges(changes);
  }, [openFiles]);

  const handleToggleExpand = useCallback((path: string) => {
    setFileSystem((prev) =>
      updateNodeInTree(prev, path, (node) => ({
        ...node,
        isExpanded: !node.isExpanded,
      }))
    );
  }, []);

  const handleFileSelect = useCallback(
    (node: FileNode) => {
      setSelectedPath(node.path);

      if (node.type === 'file') {
        const existing = openFiles.find((f) => f.path === node.path);
        if (existing) {
          setActiveFilePath(node.path);
          return;
        }

        const content = node.content || '';

        const newFile: OpenFile = {
          id: node.id,
          path: node.path,
          name: node.name,
          content,
          originalContent: content,
          modified: false,
          language: getFileExtension(node.name),
        };

        setOpenFiles((prev) => [...prev, newFile]);
        setActiveFilePath(node.path);
      }
    },
    [openFiles]
  );

  const handleSaveFile = useCallback(
    (path?: string) => {
      const targetPath = path || activeFilePath;
      if (!targetPath) return;

      const file = openFiles.find((f) => f.path === targetPath);
      if (!file) return;

      setFileSystem((prev) =>
        updateNodeInTree(prev, targetPath, (node) => ({
          ...node,
          content: file.content,
        }))
      );

      setOpenFiles((prev) =>
        prev.map((f) =>
          f.path === targetPath ? { ...f, modified: false, originalContent: f.content } : f
        )
      );

      toast({
        title: 'File Saved',
        description: file.name,
      });
    },
    [activeFilePath, openFiles, toast]
  );

  const handleCloseFile = useCallback(
    (path: string, e?: React.MouseEvent) => {
      e?.stopPropagation();

      const file = openFiles.find((f) => f.path === path);
      if (file?.modified) {
        if (confirm(`Save changes to ${file.name}?`)) {
          handleSaveFile(path);
        }
      }

      setOpenFiles((prev) => prev.filter((f) => f.path !== path));

      if (activeFilePath === path) {
        const remaining = openFiles.filter((f) => f.path !== path);
        setActiveFilePath(remaining.length > 0 ? remaining[remaining.length - 1].path : null);
      }
    },
    [activeFilePath, openFiles, handleSaveFile]
  );

  const handleSaveAll = useCallback(() => {
    openFiles.filter((f) => f.modified).forEach((f) => handleSaveFile(f.path));
  }, [openFiles, handleSaveFile]);

  const handleNewFile = useCallback(
    (parentPath?: string) => {
      const targetPath = parentPath || selectedPath || '/';
      const parentNode = findNodeByPath(fileSystem, targetPath);

      if (!parentNode || parentNode.type !== 'folder') {
        toast({ title: 'Error', description: 'Select a folder first', variant: 'destructive' });
        return;
      }

      const name = prompt('Enter file name:');
      if (!name) return;

      const newPath = `${targetPath === '/' ? '' : targetPath}/${name}`;

      if (parentNode.children?.some((c) => c.name === name)) {
        toast({ title: 'Error', description: 'File already exists', variant: 'destructive' });
        return;
      }

      const newNode: FileNode = {
        id: generateId(),
        name,
        type: 'file',
        path: newPath,
        language: getFileExtension(name),
        content: '',
      };

      setFileSystem((prev) => addNodeToTree(prev, targetPath, newNode));
      handleFileSelect(newNode);
    },
    [selectedPath, fileSystem, toast, handleFileSelect]
  );

  const handleNewFolder = useCallback(
    (parentPath?: string) => {
      const targetPath = parentPath || selectedPath || '/';
      const parentNode = findNodeByPath(fileSystem, targetPath);

      if (!parentNode || parentNode.type !== 'folder') {
        toast({ title: 'Error', description: 'Select a folder first', variant: 'destructive' });
        return;
      }

      const name = prompt('Enter folder name:');
      if (!name) return;

      const newPath = `${targetPath === '/' ? '' : targetPath}/${name}`;

      if (parentNode.children?.some((c) => c.name === name)) {
        toast({ title: 'Error', description: 'Folder already exists', variant: 'destructive' });
        return;
      }

      const newNode: FileNode = {
        id: generateId(),
        name,
        type: 'folder',
        path: newPath,
        children: [],
        isExpanded: false,
      };

      setFileSystem((prev) => addNodeToTree(prev, targetPath, newNode));
    },
    [selectedPath, fileSystem, toast]
  );

  const handleRename = useCallback(
    (node: FileNode, newName: string) => {
      const parentPath = node.path.split('/').slice(0, -1).join('/') || '/';
      const newPath = `${parentPath === '/' ? '' : parentPath}/${newName}`;

      setFileSystem((prev) =>
        updateNodeInTree(prev, node.path, (n) => ({
          ...n,
          name: newName,
          path: newPath,
        }))
      );

      setOpenFiles((prev) =>
        prev.map((f) => (f.path === node.path ? { ...f, path: newPath, name: newName } : f))
      );

      if (activeFilePath === node.path) {
        setActiveFilePath(newPath);
      }

      if (selectedPath === node.path) {
        setSelectedPath(newPath);
      }
    },
    [activeFilePath, selectedPath]
  );

  const handleDelete = useCallback(
    (node: FileNode) => {
      if (!confirm(`Delete "${node.name}"?`)) return;

      if (node.type === 'file') {
        setOpenFiles((prev) => prev.filter((f) => f.path !== node.path));
        if (activeFilePath === node.path) {
          setActiveFilePath(null);
        }
      } else {
        setOpenFiles((prev) => prev.filter((f) => !f.path.startsWith(node.path)));
        if (activeFilePath?.startsWith(node.path)) {
          setActiveFilePath(null);
        }
      }

      setFileSystem((prev) => removeNodeFromTree(prev, node.path));
      setSelectedPath(null);
    },
    [activeFilePath]
  );

  const handleCopy = useCallback((node: FileNode) => {
    setClipboardNode(node);
  }, []);

  const handlePaste = useCallback(
    (targetPath: string) => {
      if (!clipboardNode) return;

      const targetNode = findNodeByPath(fileSystem, targetPath);
      if (!targetNode || targetNode.type !== 'folder') return;

      const copyNode = (node: FileNode, parentPath: string): FileNode => {
        const newPath = `${parentPath}/${node.name}`;
        return {
          ...node,
          id: generateId(),
          path: newPath,
          children: node.children?.map((c) => copyNode(c, newPath)),
        };
      };

      const newNode = copyNode(clipboardNode, targetPath);
      setFileSystem((prev) => addNodeToTree(prev, targetPath, newNode));
    },
    [clipboardNode, fileSystem]
  );

  const handleDragStart = useCallback((e: React.DragEvent, node: FileNode) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedNode(node);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const updateChildPaths = useCallback((node: FileNode, oldParent: string, newParent: string): FileNode => ({
    ...node,
    path: node.path.replace(oldParent, newParent),
    children: node.children?.map((c) => updateChildPaths(c, oldParent, newParent)),
  }), []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetNode: FileNode) => {
      e.preventDefault();
      setDragOverPath(null);

      if (!draggedNode || draggedNode.path === targetNode.path) return;
      if (targetNode.path.startsWith(draggedNode.path)) return;

      const targetPath = targetNode.type === 'folder' ? targetNode.path : findParentNode(fileSystem, targetNode.path)?.path;
      if (!targetPath) return;

      let newFs = removeNodeFromTree(fileSystem, draggedNode.path);

      const newPath = `${targetPath === '/' ? '' : targetPath}/${draggedNode.name}`;
      const movedNode: FileNode = {
        ...draggedNode,
        path: newPath,
        children: draggedNode.children?.map((c) => updateChildPaths(c, draggedNode.path, newPath)),
      };

      newFs = addNodeToTree(newFs, targetPath, movedNode);
      setFileSystem(newFs);

      setOpenFiles((prev) =>
        prev.map((f) => {
          if (f.path.startsWith(draggedNode.path)) {
            const newFilePath = f.path.replace(draggedNode.path, newPath);
            return { ...f, path: newFilePath };
          }
          return f;
        })
      );

      if (activeFilePath?.startsWith(draggedNode.path)) {
        setActiveFilePath(activeFilePath.replace(draggedNode.path, newPath));
      }

      setDraggedNode(null);
    },
    [draggedNode, fileSystem, activeFilePath, updateChildPaths]
  );

  const handleSearchInFiles = useCallback(() => {
    if (!searchInFilesQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const query = matchCase ? searchInFilesQuery : searchInFilesQuery.toLowerCase();

    allFiles.forEach((file) => {
      const content = file.content || '';
      const lines = content.split('\n');

      lines.forEach((line, lineIndex) => {
        const searchLine = matchCase ? line : line.toLowerCase();
        let index = 0;

        while ((index = searchLine.indexOf(query, index)) !== -1) {
          if (matchWholeWord) {
            const before = index > 0 ? searchLine[index - 1] : ' ';
            const after = index + query.length < searchLine.length ? searchLine[index + query.length] : ' ';
            if (/\w/.test(before) || /\w/.test(after)) {
              index++;
              continue;
            }
          }

          results.push({
            path: file.path,
            line: lineIndex + 1,
            column: index + 1,
            text: line.trim(),
            match: line.substring(index, index + query.length),
          });
          index++;
        }
      });
    });

    setSearchResults(results);
  }, [searchInFilesQuery, allFiles, matchCase, matchWholeWord]);

  useEffect(() => {
    if (sidebarView === 'search') {
      handleSearchInFiles();
    }
  }, [sidebarView, handleSearchInFiles]);

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildMessages([{ type: 'info', message: 'Starting build...' }]);
    setShowBottomPanel(true);
    setBottomPanelView('output');

    await new Promise((r) => setTimeout(r, 500));
    setBuildMessages((prev) => [...prev, { type: 'info', message: 'Compiling TypeScript...' }]);

    await new Promise((r) => setTimeout(r, 500));
    setBuildMessages((prev) => [...prev, { type: 'info', message: 'Bundling modules...' }]);

    await new Promise((r) => setTimeout(r, 300));
    setBuildMessages((prev) => [...prev, { type: 'info', message: 'Optimizing assets...' }]);

    await new Promise((r) => setTimeout(r, 200));
    setBuildMessages((prev) => [...prev, { type: 'success', message: 'Build completed successfully!' }]);

    setIsBuilding(false);

    toast({
      title: 'Build Complete',
      description: 'Project built successfully',
    });
  }, [toast]);

  const handleRun = useCallback(async () => {
    setShowBottomPanel(true);
    setBottomPanelView('terminal');

    setTerminalTabs((prev) =>
      prev.map((t) =>
        t.id === activeTerminalId
          ? {
              ...t,
              output: [...t.output, '$ npm run dev', '', 'Starting development server...', 'Server running at http://localhost:5173', ''],
            }
          : t
      )
    );

    toast({
      title: 'Development Server',
      description: 'Server started at localhost:5173',
    });
  }, [activeTerminalId, toast]);

  const handleTerminalCommand = useCallback(
    (command: string) => {
      setTerminalTabs((prev) =>
        prev.map((t) => {
          if (t.id !== activeTerminalId) return t;

          const output = [...t.output, `$ ${command}`];

          if (command === 'ls') {
            output.push('src/  public/  package.json  README.md  tsconfig.json');
          } else if (command === 'pwd') {
            output.push('/workspace');
          } else if (command === 'clear') {
            return { ...t, output: [], input: '' };
          } else if (command.startsWith('echo ')) {
            output.push(command.substring(5));
          } else if (command === 'help') {
            output.push('Available commands: ls, pwd, clear, echo, help, npm, node');
          } else if (command.startsWith('npm ') || command.startsWith('node ')) {
            output.push(`Simulated: ${command}`);
          } else {
            output.push(`Command not found: ${command}`);
          }

          output.push('');
          return { ...t, output, input: '' };
        })
      );
    },
    [activeTerminalId]
  );

  const handleNewTerminal = useCallback(() => {
    const newTab: TerminalTab = {
      id: generateId(),
      name: `Terminal ${terminalTabs.length + 1}`,
      output: ['$ '],
      input: '',
      cwd: '~',
    };
    setTerminalTabs((prev) => [...prev, newTab]);
    setActiveTerminalId(newTab.id);
  }, [terminalTabs.length]);

  const handleCloseTerminal = useCallback(
    (id: string) => {
      if (terminalTabs.length === 1) return;

      setTerminalTabs((prev) => prev.filter((t) => t.id !== id));
      if (activeTerminalId === id) {
        setActiveTerminalId(terminalTabs.find((t) => t.id !== id)?.id || '');
      }
    },
    [activeTerminalId, terminalTabs]
  );

  const handleStageChange = useCallback((path: string) => {
    setGitChanges((prev) => prev.map((c) => (c.path === path ? { ...c, staged: !c.staged } : c)));
  }, []);

  const handleCommit = useCallback(() => {
    if (!commitMessage.trim()) {
      toast({ title: 'Error', description: 'Commit message required', variant: 'destructive' });
      return;
    }

    const stagedChanges = gitChanges.filter((c) => c.staged);
    if (stagedChanges.length === 0) {
      toast({ title: 'Error', description: 'No staged changes', variant: 'destructive' });
      return;
    }

    setGitChanges((prev) => prev.filter((c) => !c.staged));
    setCommitMessage('');

    toast({
      title: 'Commit Created',
      description: `${stagedChanges.length} files committed`,
    });
  }, [commitMessage, gitChanges, toast]);

  const handleCommand = useCallback(
    (command: string) => {
      switch (command) {
        case 'save':
          handleSaveFile();
          break;
        case 'saveAll':
          handleSaveAll();
          break;
        case 'find':
          if (viewRef.current) {
            openSearchPanel(viewRef.current);
          }
          break;
        case 'findInFiles':
          setSidebarView('search');
          setShowSidebar(true);
          break;
        case 'goToLine':
          setShowGoToLine(true);
          break;
        case 'build':
          handleBuild();
          break;
        case 'run':
          handleRun();
          break;
        case 'toggleTerminal':
          setShowBottomPanel((prev) => !prev);
          setBottomPanelView('terminal');
          break;
        case 'newFile':
          handleNewFile();
          break;
        case 'newFolder':
          handleNewFolder();
          break;
        case 'settings':
          setSidebarView('settings');
          setShowSidebar(true);
          break;
        default:
          break;
      }
    },
    [handleSaveFile, handleSaveAll, handleBuild, handleRun, handleNewFile, handleNewFolder]
  );

  const handleGoToLine = useCallback(
    (line: number) => {
      if (!viewRef.current) return;

      const doc = viewRef.current.state.doc;
      const lineInfo = doc.line(Math.min(line, doc.lines));

      viewRef.current.dispatch({
        selection: { anchor: lineInfo.from },
        scrollIntoView: true,
      });

      viewRef.current.focus();
    },
    []
  );

  useEffect(() => {
    if (!editorContainerRef.current || !activeFile) return;

    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const languageExt = getLanguageExtension(activeFile.name);

    const extensions = [
      minimalSetup,
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      search({ top: true }),
      editorLanguageCompartment.current.of(languageExt),
      oneDark,
      indentUnit.of('  '),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString();
          setOpenFiles((prev) =>
            prev.map((f) =>
              f.path === activeFile.path
                ? { ...f, content: newContent, modified: newContent !== f.originalContent }
                : f
            )
          );
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: `${settings.fontSize}px`,
        },
        '.cm-scroller': {
          fontFamily: settings.fontFamily,
          overflow: 'auto',
        },
        '.cm-content': {
          caretColor: '#fff',
        },
        '.cm-cursor': {
          borderLeftColor: '#fff',
          borderLeftWidth: '2px',
        },
        '.cm-gutters': {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #3c3c3c',
        },
        '.cm-activeLineGutter': {
          backgroundColor: '#2a2d2e',
        },
      }),
    ];

    const state = EditorState.create({
      doc: activeFile.content,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorContainerRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
    };
  }, [activeFile?.path, settings.fontSize, settings.fontFamily]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAll();
        } else {
          handleSaveFile();
        }
      } else if (isMod && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      } else if (isMod && e.key === 'g') {
        e.preventDefault();
        setShowGoToLine(true);
      } else if (isMod && e.key === 'b') {
        e.preventDefault();
        handleBuild();
      } else if (isMod && e.key === 'r') {
        e.preventDefault();
        handleRun();
      } else if (isMod && e.key === '`') {
        e.preventDefault();
        setShowBottomPanel((prev) => !prev);
      } else if (isMod && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setSidebarView('search');
        setShowSidebar(true);
      } else if (isMod && e.key === 'n') {
        e.preventDefault();
        if (e.shiftKey) {
          handleNewFolder();
        } else {
          handleNewFile();
        }
      } else if (isMod && e.key === ',') {
        e.preventDefault();
        setSidebarView('settings');
        setShowSidebar(true);
      } else if (isMod && e.key === 'w') {
        e.preventDefault();
        if (activeFilePath) {
          handleCloseFile(activeFilePath);
        }
      } else if (isMod && e.key === '\\') {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile, handleSaveAll, handleBuild, handleRun, handleNewFile, handleNewFolder, activeFilePath, handleCloseFile]);

  const activeTerminal = terminalTabs.find((t) => t.id === activeTerminalId);
  const maxLine = activeFile ? activeFile.content.split('\n').length : 1;

  return (
    <ZWindow
      title="Code"
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 1200, height: 800 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e] text-white select-none">
        <div className="flex items-center justify-between px-2 py-1.5 bg-[#323233] border-b border-[#3c3c3c]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn('p-1.5 rounded hover:bg-[#3c3c3c]', showSidebar && 'bg-[#3c3c3c]')}
              title="Toggle Sidebar (Cmd+\\)"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-[#3c3c3c] mx-1" />

            <button
              onClick={handleBuild}
              disabled={isBuilding}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
                'bg-[#0066cc] hover:bg-[#0055aa] disabled:opacity-50'
              )}
              title="Build (Cmd+B)"
            >
              {isBuilding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              {isBuilding ? 'Building...' : 'Build'}
            </button>
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium hover:bg-[#3c3c3c]"
              title="Run (Cmd+R)"
            >
              <Bug className="w-3.5 h-3.5" />
              Run
            </button>

            <div className="w-px h-5 bg-[#3c3c3c] mx-1" />

            <button
              onClick={() => setSplitView(splitView === 'vertical' ? 'none' : 'vertical')}
              className={cn('p-1.5 rounded hover:bg-[#3c3c3c]', splitView === 'vertical' && 'bg-[#3c3c3c]')}
              title="Split Vertical"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSplitView(splitView === 'horizontal' ? 'none' : 'horizontal')}
              className={cn('p-1.5 rounded hover:bg-[#3c3c3c]', splitView === 'horizontal' && 'bg-[#3c3c3c]')}
              title="Split Horizontal"
            >
              <Rows className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-[#3c3c3c]"
              title="Command Palette (Cmd+Shift+P)"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Commands</span>
            </button>

            <div className="w-px h-5 bg-[#3c3c3c] mx-1" />

            <button
              onClick={() => {
                setSidebarView('git');
                setShowSidebar(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:bg-[#3c3c3c]"
            >
              <GitBranch className="w-3.5 h-3.5" />
              {gitBranch}
              {gitChanges.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full px-1.5 text-[10px]">
                  {gitChanges.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-12 bg-[#333333] border-r border-[#3c3c3c] flex flex-col items-center py-2 gap-1">
            <button
              onClick={() => {
                setSidebarView('files');
                setShowSidebar(true);
              }}
              className={cn(
                'p-2 rounded hover:bg-[#3c3c3c]',
                sidebarView === 'files' && showSidebar && 'border-l-2 border-white bg-[#252526]'
              )}
              title="Explorer"
            >
              <File className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSidebarView('search');
                setShowSidebar(true);
              }}
              className={cn(
                'p-2 rounded hover:bg-[#3c3c3c]',
                sidebarView === 'search' && showSidebar && 'border-l-2 border-white bg-[#252526]'
              )}
              title="Search (Cmd+Shift+F)"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSidebarView('git');
                setShowSidebar(true);
              }}
              className={cn(
                'p-2 rounded hover:bg-[#3c3c3c] relative',
                sidebarView === 'git' && showSidebar && 'border-l-2 border-white bg-[#252526]'
              )}
              title="Source Control"
            >
              <GitBranch className="w-5 h-5" />
              {gitChanges.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {gitChanges.length}
                </span>
              )}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                setSidebarView('settings');
                setShowSidebar(true);
              }}
              className={cn(
                'p-2 rounded hover:bg-[#3c3c3c]',
                sidebarView === 'settings' && showSidebar && 'border-l-2 border-white bg-[#252526]'
              )}
              title="Settings (Cmd+,)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {showSidebar && (
            <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col overflow-hidden">
              {sidebarView === 'files' && (
                <>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#3c3c3c]">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Explorer</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleNewFile()}
                        className="p-1 rounded hover:bg-[#3c3c3c]"
                        title="New File"
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleNewFolder()}
                        className="p-1 rounded hover:bg-[#3c3c3c]"
                        title="New Folder"
                      >
                        <FolderPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto py-1">
                    <FileTreeItem
                      node={fileSystem}
                      level={0}
                      selectedPath={selectedPath}
                      onSelect={handleFileSelect}
                      onToggleExpand={handleToggleExpand}
                      onContextMenu={(e, node) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, node });
                      }}
                      onDragStart={handleDragStart}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      dragOverPath={dragOverPath}
                    />
                  </div>
                </>
              )}

              {sidebarView === 'search' && (
                <>
                  <div className="px-3 py-2 border-b border-[#3c3c3c]">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Search</span>
                  </div>
                  <div className="p-2 border-b border-[#3c3c3c]">
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#3c3c3c] rounded mb-2">
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchInFilesQuery}
                        onChange={(e) => setSearchInFilesQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchInFiles()}
                        placeholder="Search in files..."
                        className="flex-1 bg-transparent border-none outline-none text-sm min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={matchCase}
                          onChange={(e) => setMatchCase(e.target.checked)}
                          className="w-3 h-3"
                        />
                        Aa
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={matchWholeWord}
                          onChange={(e) => setMatchWholeWord(e.target.checked)}
                          className="w-3 h-3"
                        />
                        W
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useRegex}
                          onChange={(e) => setUseRegex(e.target.checked)}
                          className="w-3 h-3"
                        />
                        .*
                      </label>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-1">
                        <div className="px-3 py-1 text-xs text-gray-400">
                          {searchResults.length} results in {new Set(searchResults.map((r) => r.path)).size} files
                        </div>
                        {searchResults.slice(0, 100).map((result, i) => (
                          <div
                            key={i}
                            className="px-3 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm"
                            onClick={() => {
                              const node = findNodeByPath(fileSystem, result.path);
                              if (node) {
                                handleFileSelect(node);
                              }
                            }}
                          >
                            <div className="text-gray-400 text-xs truncate">{result.path}</div>
                            <div className="truncate">
                              <span className="text-gray-500">{result.line}:</span>{' '}
                              {result.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : searchInFilesQuery ? (
                      <div className="p-4 text-center text-gray-500 text-sm">No results</div>
                    ) : null}
                  </div>
                </>
              )}

              {sidebarView === 'git' && (
                <>
                  <div className="px-3 py-2 border-b border-[#3c3c3c]">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Source Control</span>
                  </div>
                  <div className="p-2 border-b border-[#3c3c3c]">
                    <textarea
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Commit message..."
                      rows={3}
                      className="w-full px-2 py-1 bg-[#3c3c3c] rounded text-sm border border-transparent focus:border-blue-500 outline-none resize-none"
                    />
                    <button
                      onClick={handleCommit}
                      disabled={!commitMessage.trim() || gitChanges.filter((c) => c.staged).length === 0}
                      className="w-full mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <GitCommit className="w-4 h-4" />
                      Commit
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {gitChanges.length > 0 ? (
                      <>
                        {gitChanges.filter((c) => c.staged).length > 0 && (
                          <div className="py-1">
                            <div className="px-3 py-1 text-xs font-medium text-gray-400">
                              Staged Changes ({gitChanges.filter((c) => c.staged).length})
                            </div>
                            {gitChanges
                              .filter((c) => c.staged)
                              .map((change) => (
                                <div
                                  key={change.path}
                                  className="flex items-center gap-2 px-3 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm"
                                  onClick={() => handleStageChange(change.path)}
                                >
                                  <Minus className="w-4 h-4 text-red-400" />
                                  <span className="truncate flex-1">{change.path.split('/').pop()}</span>
                                  <span className="text-xs text-yellow-400">M</span>
                                </div>
                              ))}
                          </div>
                        )}
                        {gitChanges.filter((c) => !c.staged).length > 0 && (
                          <div className="py-1">
                            <div className="px-3 py-1 text-xs font-medium text-gray-400">
                              Changes ({gitChanges.filter((c) => !c.staged).length})
                            </div>
                            {gitChanges
                              .filter((c) => !c.staged)
                              .map((change) => (
                                <div
                                  key={change.path}
                                  className="flex items-center gap-2 px-3 py-1 hover:bg-[#2a2d2e] cursor-pointer text-sm"
                                  onClick={() => handleStageChange(change.path)}
                                >
                                  <Plus className="w-4 h-4 text-green-400" />
                                  <span className="truncate flex-1">{change.path.split('/').pop()}</span>
                                  <span className="text-xs text-yellow-400">M</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">No changes</div>
                    )}
                  </div>
                </>
              )}

              {sidebarView === 'settings' && (
                <>
                  <div className="px-3 py-2 border-b border-[#3c3c3c]">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Settings</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-1">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'dark' | 'light' | 'system' })}
                        className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-[#5a5a5a] outline-none"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-1">
                        Font Size: {settings.fontSize}px
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={24}
                        value={settings.fontSize}
                        onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-1">Tab Size</label>
                      <select
                        value={settings.tabSize}
                        onChange={(e) => setSettings({ ...settings, tabSize: parseInt(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-[#5a5a5a] outline-none"
                      >
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={8}>8 spaces</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Word Wrap</label>
                      <button
                        onClick={() => setSettings({ ...settings, wordWrap: !settings.wordWrap })}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          settings.wordWrap ? 'bg-blue-600' : 'bg-[#3c3c3c]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full transition-transform',
                            settings.wordWrap ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Line Numbers</label>
                      <button
                        onClick={() => setSettings({ ...settings, lineNumbers: !settings.lineNumbers })}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          settings.lineNumbers ? 'bg-blue-600' : 'bg-[#3c3c3c]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full transition-transform',
                            settings.lineNumbers ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Minimap</label>
                      <button
                        onClick={() => setSettings({ ...settings, minimap: !settings.minimap })}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          settings.minimap ? 'bg-blue-600' : 'bg-[#3c3c3c]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full transition-transform',
                            settings.minimap ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Auto Save</label>
                      <button
                        onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          settings.autoSave ? 'bg-blue-600' : 'bg-[#3c3c3c]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full transition-transform',
                            settings.autoSave ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm">Bracket Matching</label>
                      <button
                        onClick={() => setSettings({ ...settings, bracketMatching: !settings.bracketMatching })}
                        className={cn(
                          'w-10 h-5 rounded-full transition-colors',
                          settings.bracketMatching ? 'bg-blue-600' : 'bg-[#3c3c3c]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 bg-white rounded-full transition-transform',
                            settings.bracketMatching ? 'translate-x-5' : 'translate-x-0.5'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {openFiles.length > 0 && (
              <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto">
                {openFiles.map((file) => {
                  const FileIconComp = getFileIcon(file.name);
                  const iconColor = getFileIconColor(file.name);
                  return (
                    <div
                      key={file.path}
                      onClick={() => setActiveFilePath(file.path)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer border-r border-[#3c3c3c] min-w-0 flex-shrink-0',
                        'hover:bg-[#2a2d2e]',
                        activeFilePath === file.path && 'bg-[#1e1e1e]'
                      )}
                    >
                      <FileIconComp className={cn('w-4 h-4 flex-shrink-0', iconColor)} />
                      <span className={cn('truncate', file.modified && 'italic')}>
                        {file.name}
                        {file.modified && ' *'}
                      </span>
                      <button
                        onClick={(e) => handleCloseFile(file.path, e)}
                        className="p-0.5 rounded hover:bg-[#3c3c3c] flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              {activeFile ? (
                <div ref={editorContainerRef} className="flex-1 overflow-hidden" />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
                  <div className="text-center text-gray-400 max-w-md">
                    <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-semibold text-gray-200 mb-2">Welcome to Code</h2>
                    <p className="text-sm mb-4">A powerful code editor for zOS</p>
                    <div className="text-xs space-y-1">
                      <div>Cmd+P to quick open files</div>
                      <div>Cmd+Shift+P for command palette</div>
                      <div>Cmd+S to save * Cmd+B to build</div>
                    </div>
                    <div className="mt-6 flex flex-col gap-2">
                      <button
                        onClick={() => handleNewFile()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                      >
                        Create New File
                      </button>
                      <button
                        onClick={() => setShowCommandPalette(true)}
                        className="px-4 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-sm"
                      >
                        Open Command Palette
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showBottomPanel && (
              <div
                className="bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col"
                style={{ height: bottomPanelHeight }}
              >
                <div className="flex items-center justify-between px-2 bg-[#252526] border-b border-[#3c3c3c]">
                  <div className="flex items-center">
                    <button
                      onClick={() => setBottomPanelView('problems')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium',
                        bottomPanelView === 'problems' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'
                      )}
                    >
                      Problems
                      {problems.length > 0 && (
                        <span className="ml-1 px-1.5 bg-red-600 rounded-full text-[10px]">
                          {problems.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setBottomPanelView('output')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium',
                        bottomPanelView === 'output' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'
                      )}
                    >
                      Output
                    </button>
                    <button
                      onClick={() => setBottomPanelView('terminal')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium',
                        bottomPanelView === 'terminal' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'
                      )}
                    >
                      Terminal
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {bottomPanelView === 'terminal' && (
                      <button
                        onClick={handleNewTerminal}
                        className="p-1 rounded hover:bg-[#3c3c3c]"
                        title="New Terminal"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowBottomPanel(false)}
                      className="p-1 rounded hover:bg-[#3c3c3c]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {bottomPanelView === 'problems' && (
                    <div className="h-full overflow-auto p-2">
                      {problems.length > 0 ? (
                        problems.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 py-1 text-sm">
                            {p.type === 'error' ? (
                              <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                            ) : p.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                            )}
                            <span>{p.message}</span>
                            {p.file && (
                              <span className="text-gray-500">
                                {p.file}:{p.line}:{p.column}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm p-2">No problems detected</div>
                      )}
                    </div>
                  )}

                  {bottomPanelView === 'output' && (
                    <div className="h-full overflow-auto p-2 font-mono text-xs">
                      {buildMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            msg.type === 'error' && 'text-red-400',
                            msg.type === 'warning' && 'text-yellow-400',
                            msg.type === 'success' && 'text-green-400',
                            msg.type === 'info' && 'text-gray-300'
                          )}
                        >
                          {msg.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {bottomPanelView === 'terminal' && (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto">
                        {terminalTabs.map((tab) => (
                          <div
                            key={tab.id}
                            onClick={() => setActiveTerminalId(tab.id)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1 text-xs cursor-pointer border-r border-[#3c3c3c]',
                              'hover:bg-[#2a2d2e]',
                              activeTerminalId === tab.id && 'bg-[#1e1e1e]'
                            )}
                          >
                            <Terminal className="w-3 h-3" />
                            <span>{tab.name}</span>
                            {terminalTabs.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseTerminal(tab.id);
                                }}
                                className="p-0.5 rounded hover:bg-[#3c3c3c]"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex-1 overflow-auto p-2 font-mono text-xs">
                        {activeTerminal?.output.map((line, i) => (
                          <div key={i}>{line || '\u00A0'}</div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 px-2 py-1 border-t border-[#3c3c3c]">
                        <span className="text-green-400 text-xs">$</span>
                        <input
                          type="text"
                          value={activeTerminal?.input || ''}
                          onChange={(e) =>
                            setTerminalTabs((prev) =>
                              prev.map((t) => (t.id === activeTerminalId ? { ...t, input: e.target.value } : t))
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && activeTerminal?.input) {
                              handleTerminalCommand(activeTerminal.input);
                            }
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-xs font-mono"
                          placeholder="Enter command..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-0.5 bg-[#007acc] text-white text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {gitBranch}
            </span>
            {gitChanges.length > 0 && (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                {gitChanges.length} changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeFile && (
              <>
                <span>Ln {activeFile.cursorPosition?.line || 1}, Col {activeFile.cursorPosition?.ch || 1}</span>
                <span>{activeFile.language.toUpperCase()}</span>
                <span>UTF-8</span>
              </>
            )}
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        files={allFiles}
        onOpenFile={handleFileSelect}
        onCommand={handleCommand}
      />

      <GoToLineDialog
        isOpen={showGoToLine}
        onClose={() => setShowGoToLine(false)}
        onGoToLine={handleGoToLine}
        maxLine={maxLine}
      />

      {renameDialog && (
        <RenameDialog
          isOpen={true}
          currentName={renameDialog.node.name}
          onClose={() => setRenameDialog(null)}
          onRename={(newName) => handleRename(renameDialog.node, newName)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onNewFile={() => {
            handleNewFile(contextMenu.node.type === 'folder' ? contextMenu.node.path : findParentNode(fileSystem, contextMenu.node.path)?.path);
            setContextMenu(null);
          }}
          onNewFolder={() => {
            handleNewFolder(contextMenu.node.type === 'folder' ? contextMenu.node.path : findParentNode(fileSystem, contextMenu.node.path)?.path);
            setContextMenu(null);
          }}
          onRename={() => {
            setRenameDialog({ node: contextMenu.node });
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDelete(contextMenu.node);
            setContextMenu(null);
          }}
          onCopy={() => {
            handleCopy(contextMenu.node);
            setContextMenu(null);
          }}
          onPaste={() => {
            if (contextMenu.node.type === 'folder') {
              handlePaste(contextMenu.node.path);
            }
            setContextMenu(null);
          }}
          canPaste={!!clipboardNode}
        />
      )}
    </ZWindow>
  );
};

export default ZCodeWindow;
