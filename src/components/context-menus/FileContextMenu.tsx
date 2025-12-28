// File Context Menu
// Context menu for Finder items (files and folders)

import React, { useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuTrigger,
  MacContextMenuContent,
  MacMenuItem,
  MacSeparator,
  MacSubmenu,
  MacLabel,
} from './ContextMenuBase';
import {
  FileText,
  FolderOpen,
  ExternalLink,
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  Info,
  Tag,
  Archive,
  Share2,
  Mail,
  MessageSquare,
  Send,
  Printer,
  Edit3,
  Eye,
  Lock,
  Unlock,
  Download,
  Upload,
  Terminal,
  Code,
  Image,
  FileImage,
  Folder,
  FolderPlus,
  Move,
  RotateCcw,
  Sparkles,
  Play,
  Palette,
  Zap,
} from 'lucide-react';
import type { FileItem, FileType } from '@/types/contextMenu';

interface FileContextMenuProps {
  children: React.ReactNode;
  file: FileItem;
  selectedFiles?: FileItem[];
  onOpen?: (file: FileItem) => void;
  onOpenWith?: (file: FileItem, appId: string) => void;
  onShowInEnclosingFolder?: (file: FileItem) => void;
  onGetInfo?: (file: FileItem) => void;
  onRename?: (file: FileItem) => void;
  onDuplicate?: (files: FileItem[]) => void;
  onCopy?: (files: FileItem[]) => void;
  onCut?: (files: FileItem[]) => void;
  onPaste?: () => void;
  onMoveToTrash?: (files: FileItem[]) => void;
  onCompress?: (files: FileItem[]) => void;
  onShare?: (files: FileItem[]) => void;
  onAddTag?: (files: FileItem[], tag: string) => void;
  onRemoveTag?: (files: FileItem[], tag: string) => void;
  onQuickLook?: (file: FileItem) => void;
  onNewFolder?: () => void;
  onSetDesktopPicture?: (file: FileItem) => void;
  canPaste?: boolean;
}

// Available tags (macOS style)
const AVAILABLE_TAGS = [
  { id: 'red', label: 'Red', color: '#FF3B30' },
  { id: 'orange', label: 'Orange', color: '#FF9500' },
  { id: 'yellow', label: 'Yellow', color: '#FFCC00' },
  { id: 'green', label: 'Green', color: '#34C759' },
  { id: 'blue', label: 'Blue', color: '#007AFF' },
  { id: 'purple', label: 'Purple', color: '#AF52DE' },
  { id: 'gray', label: 'Gray', color: '#8E8E93' },
];

// Apps for "Open With" menu
const OPEN_WITH_APPS: Record<FileType, Array<{ id: string; label: string; icon: React.ReactNode }>> = {
  folder: [
    { id: 'finder', label: 'Finder', icon: <Folder className="w-4 h-4" /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
  ],
  file: [
    { id: 'textpad', label: 'TextEdit', icon: <FileText className="w-4 h-4" /> },
    { id: 'vscode', label: 'Visual Studio Code', icon: <Code className="w-4 h-4" /> },
  ],
  image: [
    { id: 'preview', label: 'Preview', icon: <Image className="w-4 h-4" /> },
    { id: 'photos', label: 'Photos', icon: <FileImage className="w-4 h-4" /> },
  ],
  video: [
    { id: 'quicktime', label: 'QuickTime Player', icon: <Play className="w-4 h-4" /> },
  ],
  audio: [
    { id: 'itunes', label: 'Music', icon: <Play className="w-4 h-4" /> },
  ],
  document: [
    { id: 'textpad', label: 'TextEdit', icon: <FileText className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
  ],
  archive: [
    { id: 'archive', label: 'Archive Utility', icon: <Archive className="w-4 h-4" /> },
  ],
  code: [
    { id: 'vscode', label: 'Visual Studio Code', icon: <Code className="w-4 h-4" /> },
    { id: 'textpad', label: 'TextEdit', icon: <FileText className="w-4 h-4" /> },
  ],
  application: [
    { id: 'finder', label: 'Finder', icon: <Folder className="w-4 h-4" /> },
  ],
};

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  children,
  file,
  selectedFiles = [],
  onOpen,
  onOpenWith,
  onShowInEnclosingFolder,
  onGetInfo,
  onRename,
  onDuplicate,
  onCopy,
  onCut,
  onPaste,
  onMoveToTrash,
  onCompress,
  onShare,
  onAddTag,
  onRemoveTag,
  onQuickLook,
  onNewFolder,
  onSetDesktopPicture,
  canPaste = false,
}) => {
  // Determine actual selection (file or multiple files)
  const selection = selectedFiles.length > 0 ? selectedFiles : [file];
  const isMultiSelect = selection.length > 1;
  const isFolder = file.type === 'folder';
  const isImage = file.type === 'image';
  const hasSelection = selection.length > 0;

  const handleOpen = useCallback(() => {
    onOpen?.(file);
  }, [file, onOpen]);

  const handleOpenWith = useCallback((appId: string) => {
    onOpenWith?.(file, appId);
  }, [file, onOpenWith]);

  const handleGetInfo = useCallback(() => {
    onGetInfo?.(file);
  }, [file, onGetInfo]);

  const handleRename = useCallback(() => {
    onRename?.(file);
  }, [file, onRename]);

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(selection);
  }, [selection, onDuplicate]);

  const handleCopy = useCallback(() => {
    onCopy?.(selection);
  }, [selection, onCopy]);

  const handleCut = useCallback(() => {
    onCut?.(selection);
  }, [selection, onCut]);

  const handleMoveToTrash = useCallback(() => {
    onMoveToTrash?.(selection);
  }, [selection, onMoveToTrash]);

  const handleCompress = useCallback(() => {
    onCompress?.(selection);
  }, [selection, onCompress]);

  const handleShare = useCallback(() => {
    onShare?.(selection);
  }, [selection, onShare]);

  const handleQuickLook = useCallback(() => {
    onQuickLook?.(file);
  }, [file, onQuickLook]);

  const handleAddTag = useCallback((tagId: string) => {
    onAddTag?.(selection, tagId);
  }, [selection, onAddTag]);

  const openWithApps = OPEN_WITH_APPS[file.type] ?? OPEN_WITH_APPS.file;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <MacContextMenuContent>
        {/* Open */}
        <MacMenuItem
          icon={isFolder ? <FolderOpen className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          label={isFolder ? 'Open' : 'Open'}
          shortcut="Cmd+O"
          onClick={handleOpen}
        />

        {/* Open With Submenu */}
        <MacSubmenu
          icon={<ExternalLink className="w-4 h-4" />}
          label="Open With"
        >
          {openWithApps.map((app) => (
            <MacMenuItem
              key={app.id}
              icon={app.icon}
              label={app.label}
              onClick={() => handleOpenWith(app.id)}
            />
          ))}
          <MacSeparator />
          <MacMenuItem label="Other..." disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Move, Copy, etc. */}
        <MacMenuItem
          icon={<Move className="w-4 h-4" />}
          label="Move to..."
          disabled
        />
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label={isMultiSelect ? `Duplicate ${selection.length} Items` : 'Duplicate'}
          shortcut="Cmd+D"
          onClick={handleDuplicate}
        />

        {/* New Folder with Selection (when multiple items selected) */}
        {isMultiSelect && (
          <MacMenuItem
            icon={<FolderPlus className="w-4 h-4" />}
            label={`New Folder with Selection (${selection.length} items)`}
            shortcut="Ctrl+Cmd+N"
            disabled
          />
        )}

        <MacSeparator />

        {/* Quick Look */}
        <MacMenuItem
          icon={<Eye className="w-4 h-4" />}
          label="Quick Look"
          shortcut="Space"
          onClick={handleQuickLook}
        />

        {/* Get Info */}
        <MacMenuItem
          icon={<Info className="w-4 h-4" />}
          label={isMultiSelect ? `Get Info on ${selection.length} Items` : 'Get Info'}
          shortcut="Cmd+I"
          onClick={handleGetInfo}
        />

        {/* Rename (only for single selection) */}
        {!isMultiSelect && (
          <MacMenuItem
            icon={<Edit3 className="w-4 h-4" />}
            label="Rename"
            shortcut="Enter"
            onClick={handleRename}
          />
        )}

        <MacSeparator />

        {/* Compress */}
        <MacMenuItem
          icon={<Archive className="w-4 h-4" />}
          label={isMultiSelect ? `Compress ${selection.length} Items` : `Compress "${file.name}"`}
          onClick={handleCompress}
        />

        <MacSeparator />

        {/* Copy/Cut/Paste */}
        <MacMenuItem
          icon={<Copy className="w-4 h-4" />}
          label={isMultiSelect ? `Copy ${selection.length} Items` : 'Copy'}
          shortcut="Cmd+C"
          onClick={handleCopy}
        />
        <MacMenuItem
          icon={<Scissors className="w-4 h-4" />}
          label={isMultiSelect ? `Cut ${selection.length} Items` : 'Cut'}
          shortcut="Cmd+X"
          onClick={handleCut}
        />
        <MacMenuItem
          icon={<ClipboardPaste className="w-4 h-4" />}
          label="Paste"
          shortcut="Cmd+V"
          onClick={onPaste}
          disabled={!canPaste}
        />

        <MacSeparator />

        {/* Share Submenu */}
        <MacSubmenu icon={<Share2 className="w-4 h-4" />} label="Share">
          <MacMenuItem icon={<Mail className="w-4 h-4" />} label="Mail" onClick={handleShare} />
          <MacMenuItem icon={<MessageSquare className="w-4 h-4" />} label="Messages" disabled />
          <MacMenuItem icon={<Send className="w-4 h-4" />} label="AirDrop" disabled />
          <MacSeparator />
          <MacMenuItem icon={<Copy className="w-4 h-4" />} label="Copy" onClick={handleCopy} />
          <MacMenuItem icon={<Printer className="w-4 h-4" />} label="Print..." disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Tags */}
        <MacSubmenu icon={<Tag className="w-4 h-4" />} label="Tags">
          {AVAILABLE_TAGS.map((tag) => (
            <MacMenuItem
              key={tag.id}
              icon={
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              }
              label={tag.label}
              checked={file.tags?.includes(tag.id)}
              onClick={() => {
                if (file.tags?.includes(tag.id)) {
                  onRemoveTag?.(selection, tag.id);
                } else {
                  handleAddTag(tag.id);
                }
              }}
            />
          ))}
          <MacSeparator />
          <MacMenuItem label="Show All Tags..." disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Show in Enclosing Folder */}
        <MacMenuItem
          icon={<Folder className="w-4 h-4" />}
          label="Show in Enclosing Folder"
          onClick={() => onShowInEnclosingFolder?.(file)}
        />

        {/* Set Desktop Picture (for images) */}
        {isImage && (
          <>
            <MacSeparator />
            <MacMenuItem
              icon={<Palette className="w-4 h-4" />}
              label="Set Desktop Picture"
              onClick={() => onSetDesktopPicture?.(file)}
            />
          </>
        )}

        <MacSeparator />

        {/* Services */}
        <MacSubmenu icon={<Sparkles className="w-4 h-4" />} label="Services">
          <MacMenuItem label="Open in Terminal" icon={<Terminal className="w-4 h-4" />} disabled />
          <MacMenuItem label="Show in Finder" icon={<Folder className="w-4 h-4" />} disabled />
          <MacSeparator />
          <MacMenuItem label="Services Preferences..." disabled />
        </MacSubmenu>

        <MacSeparator />

        {/* Quick Actions (for files) */}
        {!isFolder && (
          <>
            <MacSubmenu icon={<Zap className="w-4 h-4" />} label="Quick Actions">
              <MacMenuItem icon={<RotateCcw className="w-4 h-4" />} label="Rotate Left" disabled />
              <MacMenuItem icon={<RotateCcw className="w-4 h-4" style={{ transform: 'scaleX(-1)' }} />} label="Rotate Right" disabled />
              <MacMenuItem icon={<Edit3 className="w-4 h-4" />} label="Markup" disabled />
              <MacMenuItem icon={<FileImage className="w-4 h-4" />} label="Create PDF" disabled />
              <MacSeparator />
              <MacMenuItem label="Customize..." disabled />
            </MacSubmenu>
            <MacSeparator />
          </>
        )}

        {/* Move to Trash */}
        <MacMenuItem
          icon={<Trash2 className="w-4 h-4" />}
          label={isMultiSelect ? `Move ${selection.length} Items to Trash` : 'Move to Trash'}
          shortcut="Cmd+Del"
          danger
          onClick={handleMoveToTrash}
        />
      </MacContextMenuContent>
    </ContextMenu>
  );
};

export default FileContextMenu;
