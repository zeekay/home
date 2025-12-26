import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { cn } from '@/lib/utils';
import ZWindow from './ZWindow';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Play,
  Square,
  GitBranch,
  GitPullRequest,
  Github,
  RefreshCw,
  Terminal,
  X,
  Plus,
  Search,
  Eye,
  Code2,
  Layers,
  Box,
  Cpu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// zOS source file structure (virtual representation)
interface FileNode {
  name: string;
  type: 'file' | 'folder' | 'app';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

// Define .app bundle format
interface AppBundle {
  name: string;
  identifier: string;
  version: string;
  icon: string;
  entry: string;
  files: string[];
  dependencies: string[];
  permissions: string[];
}

const getLanguageExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: ext?.includes('t') });
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

// Virtual file system representing zOS source
const createVirtualFileSystem = (): FileNode => ({
  name: 'zOS',
  type: 'folder',
  path: '/',
  children: [
    {
      name: 'Applications',
      type: 'folder',
      path: '/Applications',
      children: [
        {
          name: 'Terminal.app',
          type: 'app',
          path: '/Applications/Terminal.app',
          children: [
            { name: 'Terminal.tsx', type: 'file', path: '/Applications/Terminal.app/Terminal.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Terminal.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Safari.app',
          type: 'app',
          path: '/Applications/Safari.app',
          children: [
            { name: 'ZSafariWindow.tsx', type: 'file', path: '/Applications/Safari.app/ZSafariWindow.tsx', language: 'tsx' },
            { name: 'SafariNavBar.tsx', type: 'file', path: '/Applications/Safari.app/SafariNavBar.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Safari.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Finder.app',
          type: 'app',
          path: '/Applications/Finder.app',
          children: [
            { name: 'ZFinderWindow.tsx', type: 'file', path: '/Applications/Finder.app/ZFinderWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Finder.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Mail.app',
          type: 'app',
          path: '/Applications/Mail.app',
          children: [
            { name: 'ZEmailWindow.tsx', type: 'file', path: '/Applications/Mail.app/ZEmailWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Mail.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Calculator.app',
          type: 'app',
          path: '/Applications/Calculator.app',
          children: [
            { name: 'ZCalculatorWindow.tsx', type: 'file', path: '/Applications/Calculator.app/ZCalculatorWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Calculator.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Music.app',
          type: 'app',
          path: '/Applications/Music.app',
          children: [
            { name: 'ZMusicWindow.tsx', type: 'file', path: '/Applications/Music.app/ZMusicWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Music.app/manifest.json', language: 'json' },
          ]
        },
        {
          name: 'Xcode.app',
          type: 'app',
          path: '/Applications/Xcode.app',
          children: [
            { name: 'ZCodeWindow.tsx', type: 'file', path: '/Applications/Xcode.app/ZCodeWindow.tsx', language: 'tsx' },
            { name: 'manifest.json', type: 'file', path: '/Applications/Xcode.app/manifest.json', language: 'json' },
          ]
        },
      ]
    },
    {
      name: 'System',
      type: 'folder',
      path: '/System',
      children: [
        {
          name: 'Core',
          type: 'folder',
          path: '/System/Core',
          children: [
            { name: 'ZDesktop.tsx', type: 'file', path: '/System/Core/ZDesktop.tsx', language: 'tsx' },
            { name: 'ZMenuBar.tsx', type: 'file', path: '/System/Core/ZMenuBar.tsx', language: 'tsx' },
            { name: 'ZDock.tsx', type: 'file', path: '/System/Core/ZDock.tsx', language: 'tsx' },
            { name: 'SpotlightSearch.tsx', type: 'file', path: '/System/Core/SpotlightSearch.tsx', language: 'tsx' },
          ]
        },
        {
          name: 'Contexts',
          type: 'folder',
          path: '/System/Contexts',
          children: [
            { name: 'TerminalContext.tsx', type: 'file', path: '/System/Contexts/TerminalContext.tsx', language: 'tsx' },
            { name: 'DockContext.tsx', type: 'file', path: '/System/Contexts/DockContext.tsx', language: 'tsx' },
          ]
        },
        {
          name: 'Hooks',
          type: 'folder',
          path: '/System/Hooks',
          children: [
            { name: 'useWindowManager.ts', type: 'file', path: '/System/Hooks/useWindowManager.ts', language: 'ts' },
            { name: 'use-toast.ts', type: 'file', path: '/System/Hooks/use-toast.ts', language: 'ts' },
          ]
        },
      ]
    },
    {
      name: 'Library',
      type: 'folder',
      path: '/Library',
      children: [
        { name: 'utils.ts', type: 'file', path: '/Library/utils.ts', language: 'ts' },
        { name: 'logger.ts', type: 'file', path: '/Library/logger.ts', language: 'ts' },
      ]
    },
  ]
});

// Map virtual paths to actual source files
const pathToSourceMap: Record<string, string> = {
  '/Applications/Terminal.app/Terminal.tsx': '/src/components/Terminal.tsx',
  '/Applications/Safari.app/ZSafariWindow.tsx': '/src/components/ZSafariWindow.tsx',
  '/Applications/Safari.app/SafariNavBar.tsx': '/src/components/safari/SafariNavBar.tsx',
  '/Applications/Finder.app/ZFinderWindow.tsx': '/src/components/ZFinderWindow.tsx',
  '/Applications/Mail.app/ZEmailWindow.tsx': '/src/components/ZEmailWindow.tsx',
  '/Applications/Calculator.app/ZCalculatorWindow.tsx': '/src/components/ZCalculatorWindow.tsx',
  '/Applications/Music.app/ZMusicWindow.tsx': '/src/components/ZMusicWindow.tsx',
  '/Applications/Xcode.app/ZCodeWindow.tsx': '/src/components/ZCodeWindow.tsx',
  '/System/Core/ZDesktop.tsx': '/src/components/ZDesktop.tsx',
  '/System/Core/ZMenuBar.tsx': '/src/components/ZMenuBar.tsx',
  '/System/Core/ZDock.tsx': '/src/components/dock/ZDock.tsx',
  '/System/Core/SpotlightSearch.tsx': '/src/components/SpotlightSearch.tsx',
  '/System/Contexts/TerminalContext.tsx': '/src/contexts/TerminalContext.tsx',
  '/System/Contexts/DockContext.tsx': '/src/contexts/DockContext.tsx',
  '/System/Hooks/useWindowManager.ts': '/src/hooks/useWindowManager.ts',
  '/System/Hooks/use-toast.ts': '/src/hooks/use-toast.ts',
  '/Library/utils.ts': '/src/lib/utils.ts',
  '/Library/logger.ts': '/src/lib/logger.ts',
};

interface FileTreeProps {
  node: FileNode;
  level: number;
  selectedPath: string | null;
  onSelect: (node: FileNode) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  node,
  level,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggleExpand,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isFolder = node.type === 'folder' || node.type === 'app';

  const getIcon = () => {
    if (node.type === 'app') {
      return <Box className="w-4 h-4 text-blue-400" />;
    }
    if (node.type === 'folder') {
      return <Folder className="w-4 h-4 text-blue-400" />;
    }
    // File icon based on extension
    const ext = node.name.split('.').pop();
    if (ext === 'tsx' || ext === 'ts') {
      return <Code2 className="w-4 h-4 text-blue-300" />;
    }
    if (ext === 'json') {
      return <Layers className="w-4 h-4 text-yellow-400" />;
    }
    return <File className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm',
          'hover:bg-[#2a2d2e]',
          isSelected && 'bg-[#094771]'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (isFolder) {
            onToggleExpand(node.path);
          }
          onSelect(node);
        }}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        {!isFolder && <span className="w-4" />}
        {getIcon()}
        <span className={cn(
          'truncate',
          node.type === 'app' && 'font-medium'
        )}>
          {node.name}
        </span>
      </div>
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface OpenFile {
  path: string;
  name: string;
  content: string;
  modified: boolean;
  language: string;
}

interface ZCodeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ZCodeWindow: React.FC<ZCodeWindowProps> = ({ onClose, onFocus }) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const [fileSystem] = useState<FileNode>(createVirtualFileSystem);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['/', '/Applications', '/System'])
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [gitBranch, setGitBranch] = useState('main');
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');

  // Sample file contents
  const fileContents: Record<string, string> = {
    '/Applications/Terminal.app/manifest.json': JSON.stringify({
      name: 'Terminal',
      identifier: 'ai.zeekay.zos.terminal',
      version: '1.0.0',
      icon: 'Terminal',
      entry: 'Terminal.tsx',
      permissions: ['filesystem', 'network', 'shell'],
      dependencies: ['@webcontainer/api', 'codemirror']
    }, null, 2),
    '/Applications/Calculator.app/manifest.json': JSON.stringify({
      name: 'Calculator',
      identifier: 'ai.zeekay.zos.calculator',
      version: '1.0.0',
      icon: 'Calculator',
      entry: 'ZCalculatorWindow.tsx',
      permissions: [],
      dependencies: []
    }, null, 2),
  };

  const handleToggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback(async (node: FileNode) => {
    setSelectedPath(node.path);

    if (node.type === 'file') {
      // Check if already open
      const existing = openFiles.find(f => f.path === node.path);
      if (existing) {
        setActiveFile(node.path);
        return;
      }

      // Load file content
      let content = fileContents[node.path] || '';

      // Try to fetch actual source if mapped
      const sourcePath = pathToSourceMap[node.path];
      if (sourcePath) {
        try {
          // In production, we'd fetch from GitHub API
          // For now, show a helpful placeholder
          content = `// Source: github.com/zeekay/home${sourcePath}
//
// This file can be edited and submitted as a PR to zOS!
//
// To contribute:
// 1. Fork github.com/zeekay/home
// 2. Edit this file
// 3. Create a Pull Request
//
// Your changes will be reviewed and merged into zOS!

// Loading source from GitHub...
// In development mode, Vite's HMR enables live editing.

export default function Component() {
  // Component source loads here
  return null;
}
`;
        } catch {
          content = `// Failed to load source for ${sourcePath}`;
        }
      }

      const newFile: OpenFile = {
        path: node.path,
        name: node.name,
        content,
        modified: false,
        language: node.language || 'tsx',
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFile(node.path);
    }
  }, [openFiles, fileContents]);

  const handleCloseFile = useCallback((path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenFiles(prev => prev.filter(f => f.path !== path));
    if (activeFile === path) {
      setActiveFile(openFiles.find(f => f.path !== path)?.path || null);
    }
  }, [activeFile, openFiles]);

  const handleSave = useCallback(() => {
    if (!activeFile) return;

    const file = openFiles.find(f => f.path === activeFile);
    if (!file) return;

    // In a real implementation, this would:
    // 1. Save to IndexedDB for persistence
    // 2. Trigger HMR if in dev mode
    // 3. Queue for GitHub PR if user wants to contribute

    setOpenFiles(prev => prev.map(f =>
      f.path === activeFile ? { ...f, modified: false } : f
    ));

    toast({
      title: 'File Saved',
      description: `${file.name} saved successfully`,
    });
  }, [activeFile, openFiles, toast]);

  const handleBuild = useCallback(async () => {
    setIsBuilding(true);
    setBuildOutput(['Building zOS...', '']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Compiling TypeScript...']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Bundling with Vite...']);

    await new Promise(r => setTimeout(r, 500));
    setBuildOutput(prev => [...prev, '✓ Optimizing assets...']);

    await new Promise(r => setTimeout(r, 300));
    setBuildOutput(prev => [...prev, '', '✅ Build successful!', '', 'Ready to deploy to zeekay.ai']);

    setIsBuilding(false);

    toast({
      title: 'Build Complete',
      description: 'zOS built successfully',
    });
  }, [toast]);

  const handleCreateBranch = useCallback(() => {
    const branchName = `feature/zos-edit-${Date.now()}`;
    setGitBranch(branchName);
    toast({
      title: 'Branch Created',
      description: `Switched to ${branchName}`,
    });
  }, [toast]);

  const handleCreatePR = useCallback(() => {
    if (!prTitle) {
      toast({
        title: 'PR Title Required',
        description: 'Please enter a title for your pull request',
        variant: 'destructive',
      });
      return;
    }

    // In production, this would use GitHub API
    const prUrl = `https://github.com/zeekay/home/compare/main...${gitBranch}`;
    window.open(prUrl, '_blank');

    toast({
      title: 'Opening GitHub',
      description: 'Complete your PR on GitHub',
    });

    setPrTitle('');
    setPrDescription('');
    setShowGitPanel(false);
  }, [prTitle, gitBranch, toast]);

  // Setup editor when active file changes
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    const file = openFiles.find(f => f.path === activeFile);
    if (!file) return;

    // Destroy previous editor
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const languageExt = getLanguageExtension(file.name);

    const state = EditorState.create({
      doc: file.content,
      extensions: [
        basicSetup,
        oneDark,
        languageExt,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString();
            setOpenFiles(prev => prev.map(f =>
              f.path === activeFile ? { ...f, content: newContent, modified: true } : f
            ));
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          },
          '.cm-content': { caretColor: '#fff' },
          '.cm-cursor': { borderLeftColor: '#fff', borderLeftWidth: '2px' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
    };
  }, [activeFile, openFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleBuild();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleBuild]);

  return (
    <ZWindow
      title="Xcode"
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 1200, height: 800 }}
      windowType="default"
    >
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#323233] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBuild}
            disabled={isBuilding}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium',
              'bg-[#0066cc] hover:bg-[#0055aa] disabled:opacity-50'
            )}
          >
            {isBuilding ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isBuilding ? 'Building...' : 'Build'}
          </button>
          <button
            onClick={() => setIsBuilding(false)}
            disabled={!isBuilding}
            className="p-1.5 rounded hover:bg-[#3c3c3c] disabled:opacity-30"
          >
            <Square className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#3c3c3c] mx-2" />
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              'p-1.5 rounded',
              showPreview ? 'bg-[#0066cc]' : 'hover:bg-[#3c3c3c]'
            )}
            title="Toggle Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGitPanel(!showGitPanel)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-sm',
              showGitPanel ? 'bg-[#0066cc]' : 'hover:bg-[#3c3c3c]'
            )}
          >
            <GitBranch className="w-4 h-4" />
            {gitBranch}
          </button>
          <button
            className="flex items-center gap-1.5 px-2 py-1 rounded text-sm hover:bg-[#3c3c3c]"
            onClick={() => window.open('https://github.com/zeekay/home', '_blank')}
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Navigator */}
        <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          <div className="p-2 border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2 px-2 py-1 bg-[#3c3c3c] rounded text-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="bg-transparent border-none outline-none flex-1 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <FileTree
              node={fileSystem}
              level={0}
              selectedPath={selectedPath}
              onSelect={handleFileSelect}
              expandedPaths={expandedPaths}
              onToggleExpand={handleToggleExpand}
            />
          </div>

          {/* .app Bundle Info */}
          {selectedPath?.endsWith('.app') && (
            <div className="p-3 border-t border-[#3c3c3c] text-xs">
              <div className="font-medium mb-2 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                App Bundle
              </div>
              <div className="text-gray-400 space-y-1">
                <div>Format: zOS .app bundle</div>
                <div>Type: React Component</div>
                <div>Hot Reload: Enabled</div>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Bar */}
          {openFiles.length > 0 && (
            <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto">
              {openFiles.map(file => (
                <div
                  key={file.path}
                  onClick={() => setActiveFile(file.path)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r border-[#3c3c3c]',
                    'hover:bg-[#2a2d2e]',
                    activeFile === file.path && 'bg-[#1e1e1e]'
                  )}
                >
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span className={cn(file.modified && 'italic')}>
                    {file.name}
                    {file.modified && ' •'}
                  </span>
                  <button
                    onClick={(e) => handleCloseFile(file.path, e)}
                    className="p-0.5 rounded hover:bg-[#3c3c3c]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor / Welcome */}
          <div className="flex-1 flex">
            {activeFile ? (
              <div ref={editorRef} className="flex-1 overflow-hidden" />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
                <div className="text-center text-gray-400 max-w-md">
                  <Code2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <h2 className="text-xl font-semibold text-gray-200 mb-2">
                    Welcome to Xcode for zOS
                  </h2>
                  <p className="text-sm mb-4">
                    Edit zOS source code, build, and submit PRs directly from your browser.
                  </p>
                  <div className="text-xs space-y-1">
                    <div>⌘S to save • ⌘B to build</div>
                    <div>Select a file from the navigator to begin</div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Panel */}
            {showPreview && (
              <div className="w-1/2 border-l border-[#3c3c3c] bg-white">
                <div className="p-2 bg-[#2d2d2d] text-sm text-gray-400 border-b border-[#3c3c3c]">
                  Live Preview
                </div>
                <iframe
                  src="/"
                  className="w-full h-full"
                  title="zOS Preview"
                />
              </div>
            )}
          </div>

          {/* Build Output */}
          {buildOutput.length > 0 && (
            <div className="h-32 bg-[#1e1e1e] border-t border-[#3c3c3c] overflow-auto">
              <div className="flex items-center justify-between px-3 py-1 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <div className="flex items-center gap-2 text-sm">
                  <Terminal className="w-4 h-4" />
                  Build Output
                </div>
                <button
                  onClick={() => setBuildOutput([])}
                  className="p-1 rounded hover:bg-[#3c3c3c]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="p-2 font-mono text-xs">
                {buildOutput.map((line, i) => (
                  <div key={i} className={cn(
                    line.startsWith('✓') && 'text-green-400',
                    line.startsWith('✅') && 'text-green-400 font-bold',
                    line.startsWith('❌') && 'text-red-400'
                  )}>
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Git Panel */}
        {showGitPanel && (
          <div className="w-80 bg-[#252526] border-l border-[#3c3c3c] flex flex-col">
            <div className="p-3 border-b border-[#3c3c3c]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-medium">
                  <GitPullRequest className="w-4 h-4" />
                  Create Pull Request
                </div>
                <button
                  onClick={() => setShowGitPanel(false)}
                  className="p-1 rounded hover:bg-[#3c3c3c]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Branch</div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 px-2 py-1 bg-[#3c3c3c] rounded text-sm">
                      {gitBranch}
                    </span>
                    {gitBranch === 'main' && (
                      <button
                        onClick={handleCreateBranch}
                        className="p-1.5 rounded bg-[#0066cc] hover:bg-[#0055aa]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Title</div>
                  <input
                    type="text"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    placeholder="Add feature to zOS..."
                    className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-transparent focus:border-[#0066cc] outline-none"
                  />
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Description</div>
                  <textarea
                    value={prDescription}
                    onChange={(e) => setPrDescription(e.target.value)}
                    placeholder="Describe your changes..."
                    rows={4}
                    className="w-full px-2 py-1.5 bg-[#3c3c3c] rounded text-sm border border-transparent focus:border-[#0066cc] outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleCreatePR}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] rounded text-sm font-medium"
                >
                  <GitPullRequest className="w-4 h-4" />
                  Create Pull Request
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 overflow-auto">
              <div className="text-xs text-gray-400 mb-2">Modified Files</div>
              {openFiles.filter(f => f.modified).map(file => (
                <div
                  key={file.path}
                  className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-[#2a2d2e] rounded"
                >
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  {file.name}
                </div>
              ))}
              {openFiles.filter(f => f.modified).length === 0 && (
                <div className="text-sm text-gray-500">No modified files</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </ZWindow>
  );
};

export default ZCodeWindow;
