import React, { useState } from 'react';
import ZWindow from './ZWindow';
import {
  Folder,
  FileText,
  Home,
  Download,
  Image,
  Music,
  Film,
  HardDrive,
  Cloud,
  Star,
  Clock,
  Tag,
  ChevronRight,
  List,
  LayoutGrid,
  Columns,
  GalleryHorizontal,
  X,
  ExternalLink
} from 'lucide-react';

interface ZFinderWindowProps {
  onClose: () => void;
  onFocus?: () => void;
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

const ZFinderWindow: React.FC<ZFinderWindowProps> = ({ onClose, onFocus }) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['Home']);
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'columns' | 'gallery'>('icons');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

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
  const getFilesForPath = (): FileItem[] => {
    const path = currentPath[currentPath.length - 1];

    if (path === 'Home' || path === 'zeekay.ai') {
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

    if (path === 'Documents') {
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

    if (path === 'models') {
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

    if (path === 'hanzo') {
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

    if (path === 'lux') {
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

    if (path === 'zoo') {
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

    if (path === 'projects') {
      return [
        { name: 'hanzo', type: 'folder', icon: <Folder className="w-12 h-12 text-orange-400" /> },
        { name: 'lux', type: 'folder', icon: <Folder className="w-12 h-12 text-cyan-400" /> },
        { name: 'zoo', type: 'folder', icon: <Folder className="w-12 h-12 text-emerald-400" /> },
      ];
    }

    if (path === 'dotfiles') {
      return [
        { name: 'ellipsis', type: 'folder', icon: <Folder className="w-12 h-12 text-purple-400" /> },
        { name: 'dot-zsh', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
        { name: 'dot-vim', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
        { name: 'zeesh', type: 'folder', icon: <Folder className="w-12 h-12 text-green-400" /> },
      ];
    }

    if (path === 'Downloads') {
      return [
        { name: 'resume.pdf', type: 'file', icon: <FileText className="w-12 h-12 text-red-400" />, size: '245 KB' },
      ];
    }

    return [];
  };

  const files = getFilesForPath();

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.name);
    // Single click on file = Quick Look preview
    if (item.type === 'file' && item.content) {
      setPreviewFile(item);
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      // Double-click folder = navigate into it or open URL
      if (item.url) {
        window.open(item.url, '_blank');
      } else {
        setCurrentPath([...currentPath, item.name]);
        setSelectedItem(null);
        setPreviewFile(null);
      }
    } else {
      // Double-click file = open in default app (URL)
      if (item.url) {
        window.open(item.url, '_blank');
      }
    }
  };

  const handleSidebarClick = (name: string) => {
    if (name === 'zeekay.ai') {
      setCurrentPath(['Home']);
    } else if (name === 'Documents' || name === 'Downloads' || name === 'Applications' || name === 'Desktop') {
      setCurrentPath(['Home', name]);
    } else {
      setCurrentPath([name]);
    }
    setSelectedItem(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
    setSelectedItem(null);
  };

  return (
    <ZWindow
      title="Finder"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 60 }}
      initialSize={{ width: 900, height: 550 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-white/10">
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

          {/* Breadcrumb path */}
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

          {/* View mode buttons */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-0.5">
            <button
              className={`p-1.5 rounded ${viewMode === 'icons' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setViewMode('icons')}
            >
              <LayoutGrid className="w-4 h-4 text-white/70" />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 text-white/70" />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'columns' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setViewMode('columns')}
            >
              <Columns className="w-4 h-4 text-white/70" />
            </button>
            <button
              className={`p-1.5 rounded ${viewMode === 'gallery' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              onClick={() => setViewMode('gallery')}
            >
              <GalleryHorizontal className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-[#252525] border-r border-white/10 overflow-y-auto">
            <div className="p-2">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 py-1">
                Favorites
              </div>
              {favorites.map((item) => (
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
            <div className="p-2">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 py-1">
                Locations
              </div>
              {locations.map((item) => (
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
            <div className="p-2">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 py-1">
                Tags
              </div>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Red
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                Orange
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-sm text-white/80">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Blue
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {viewMode === 'icons' && (
              <div className="grid grid-cols-6 gap-4">
                {files.map((file) => (
                  <button
                    key={file.name}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                    }`}
                    onClick={() => handleItemClick(file)}
                    onDoubleClick={() => handleItemDoubleClick(file)}
                  >
                    {file.icon}
                    <span className="text-xs text-white/80 mt-1 text-center truncate w-full">
                      {file.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-0.5">
                <div className="flex items-center px-2 py-1 text-xs text-white/50 border-b border-white/10">
                  <span className="flex-1">Name</span>
                  <span className="w-24">Date Modified</span>
                  <span className="w-20 text-right">Size</span>
                </div>
                {files.map((file) => (
                  <button
                    key={file.name}
                    className={`w-full flex items-center px-2 py-1.5 rounded ${
                      selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                    }`}
                    onClick={() => handleItemClick(file)}
                    onDoubleClick={() => handleItemDoubleClick(file)}
                  >
                    <span className="flex items-center gap-2 flex-1">
                      {file.type === 'folder' ? (
                        <Folder className="w-4 h-4 text-blue-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-white/80">{file.name}</span>
                    </span>
                    <span className="w-24 text-xs text-white/50">Today</span>
                    <span className="w-20 text-xs text-white/50 text-right">
                      {file.size || '--'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {(viewMode === 'columns' || viewMode === 'gallery') && (
              <div className="grid grid-cols-6 gap-4">
                {files.map((file) => (
                  <button
                    key={file.name}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      selectedItem === file.name ? 'bg-blue-500/30' : 'hover:bg-white/10'
                    }`}
                    onClick={() => handleItemClick(file)}
                    onDoubleClick={() => handleItemDoubleClick(file)}
                  >
                    {file.icon}
                    <span className="text-xs text-white/80 mt-1 text-center truncate w-full">
                      {file.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {files.length === 0 && (
              <div className="flex items-center justify-center h-full text-white/40">
                This folder is empty
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 py-1.5 bg-[#2d2d2d] border-t border-white/10 text-xs text-white/50">
          {files.length} items
        </div>

        {/* Quick Look Preview Modal */}
        {previewFile && (
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setPreviewFile(null)}
          >
            <div
              className="bg-[#1e1e1e] rounded-xl border border-white/20 shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
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
              {/* Content */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
                  {previewFile.content}
                </pre>
              </div>
              {/* Footer */}
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
    </ZWindow>
  );
};

export default ZFinderWindow;
