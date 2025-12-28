import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Trash2,
  FolderPlus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Minus,
  Table,
  Image,
  Paperclip,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  Pin,
  Share,
  Lock,
  Unlock,
  Download,
  Upload,
  Printer,
  Users,
  Grid,
  List as ListIcon,
  SortAsc,
  SortDesc,
  X,
  Check,
  Copy,
  Link,
  FolderOpen,
  AlertCircle,
  Edit3,
} from 'lucide-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ZNotesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'sketch' | 'scan';
  name: string;
  data: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TableData {
  rows: string[][];
}

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  locked: boolean;
  password?: string;
  attachments: Attachment[];
  checklist: ChecklistItem[];
  tables: TableData[];
  sharedWith: string[];
  sharedLink?: string;
  viewOnly: boolean;
  deleted: boolean;
  deletedAt?: number;
}

interface NoteFolder {
  id: string;
  name: string;
  expanded: boolean;
  color: string;
  order: number;
}

type ViewMode = 'list' | 'gallery';
type SortMode = 'modified' | 'created' | 'title';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'zos-notes';
const FOLDERS_KEY = 'zos-notes-folders';
const SETTINGS_KEY = 'zos-notes-settings';
const DELETED_RETENTION_DAYS = 30;

const FOLDER_COLORS = [
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const generateId = () => Math.random().toString(36).substring(2, 15);

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// ============================================================================
// Default Data
// ============================================================================

const defaultFolders: NoteFolder[] = [
  { id: 'all', name: 'All Notes', expanded: true, color: '#f59e0b', order: 0 },
  { id: 'personal', name: 'Personal', expanded: true, color: '#10b981', order: 1 },
  { id: 'work', name: 'Work', expanded: true, color: '#3b82f6', order: 2 },
];

const defaultNote: Note = {
  id: generateId(),
  title: 'Welcome to Notes',
  content: `# Welcome to zOS Notes

This is your personal notes app with comprehensive features:

## Organization
- Create folders to organize your notes
- Pin important notes to the top
- Move notes between folders
- Recently deleted notes are kept for 30 days

## Rich Text Formatting
- **Bold**, *italic*, __underline__, ~~strikethrough~~
- Headings and body text styles
- Bulleted and numbered lists
- Checklists with completion tracking
- Tables and code blocks
- Horizontal dividers

## Attachments
- Inline images
- File attachments
- Sketches and drawings
- Scanned documents

## Features
- Search notes (Cmd+F)
- Share notes via link
- Lock notes with password
- Export as PDF/Markdown/HTML
- Import from Markdown
- Print notes

## Keyboard Shortcuts
- Cmd+N: New note
- Cmd+F: Search
- Cmd+B: Bold
- Cmd+I: Italic
- Cmd+U: Underline
- Cmd+S: Save (auto-saves)

All your notes are automatically saved to local storage.`,
  folderId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pinned: true,
  locked: false,
  attachments: [],
  checklist: [],
  tables: [],
  sharedWith: [],
  viewOnly: false,
  deleted: false,
};

// ============================================================================
// Sub-Components
// ============================================================================

interface PasswordDialogProps {
  isOpen: boolean;
  mode: 'set' | 'unlock';
  onSubmit: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ isOpen, mode, onSubmit, onCancel, error }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (mode === 'set' && password !== confirmPassword) return;
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-xl p-6 w-80 shadow-2xl border border-white/10">
        <h3 className="text-white font-semibold text-lg mb-4">
          {mode === 'set' ? 'Lock Note' : 'Unlock Note'}
        </h3>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3 outline-none focus:border-yellow-500/50"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {mode === 'set' && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3 outline-none focus:border-yellow-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        )}
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        {mode === 'set' && password !== confirmPassword && confirmPassword && (
          <p className="text-red-400 text-sm mb-3">Passwords do not match</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mode === 'set' && password !== confirmPassword}
            className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50"
          >
            {mode === 'set' ? 'Lock' : 'Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ShareDialogProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onShare: (noteId: string, viewOnly: boolean) => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, note, onClose, onShare }) => {
  const [viewOnly, setViewOnly] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  const shareLink = note.sharedLink || `https://notes.zos.dev/share/${note.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-xl p-6 w-96 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Share Note</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Share link</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={viewOnly}
              onChange={(e) => setViewOnly(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5"
            />
            <span className="text-white/70 text-sm">View only (recipients cannot edit)</span>
          </label>
        </div>
        {note.sharedLink && (
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Users className="w-4 h-4" />
            <span>Currently shared with {note.sharedWith.length || 0} people</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onShare(note.id, viewOnly)}
            className="flex-1 px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-500 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Link className="w-4 h-4" />
            Generate Link
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExportDialogProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onExport: (format: 'pdf' | 'markdown' | 'html') => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, note, onClose, onExport }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#2d2d2d] rounded-xl p-6 w-80 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Export Note</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onExport('pdf')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-white text-sm font-medium">PDF Document</p>
              <p className="text-white/50 text-xs">Export as printable PDF</p>
            </div>
          </button>
          <button
            onClick={() => onExport('markdown')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <Code className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white text-sm font-medium">Markdown</p>
              <p className="text-white/50 text-xs">Export as .md file</p>
            </div>
          </button>
          <button
            onClick={() => onExport('html')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white text-sm font-medium">HTML</p>
              <p className="text-white/50 text-xs">Export as web page</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

interface FolderContextMenuProps {
  folder: NoteFolder;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
}

const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  folder, position, onClose, onRename, onDelete, onChangeColor,
}) => {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  if (folder.id === 'all' || folder.id === 'trash') return null;

  return (
    <div
      className="fixed bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 py-1 z-50 min-w-40"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onRename(folder.id)}
        className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/10 text-sm flex items-center gap-2"
      >
        <Edit3 className="w-4 h-4" />
        Rename
      </button>
      <div className="px-4 py-2">
        <p className="text-white/50 text-xs mb-2">Color</p>
        <div className="flex gap-1">
          {FOLDER_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onChangeColor(folder.id, color)}
              className={cn(
                "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                folder.color === color ? "border-white" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 my-1" />
      <button
        onClick={() => onDelete(folder.id)}
        className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 text-sm flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Folder
      </button>
    </div>
  );
};

interface NoteContextMenuProps {
  note: Note;
  position: { x: number; y: number };
  folders: NoteFolder[];
  onClose: () => void;
  onPin: (id: string) => void;
  onMove: (noteId: string, folderId: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const NoteContextMenu: React.FC<NoteContextMenuProps> = ({
  note, position, folders, onClose, onPin, onMove, onDelete, onDuplicate,
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="fixed bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 py-1 z-50 min-w-44"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onPin(note.id)}
        className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/10 text-sm flex items-center gap-2"
      >
        <Pin className="w-4 h-4" />
        {note.pinned ? 'Unpin' : 'Pin to Top'}
      </button>
      <button
        onClick={() => onDuplicate(note.id)}
        className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/10 text-sm flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <div
        className="relative"
        onMouseEnter={() => setShowMoveMenu(true)}
        onMouseLeave={() => setShowMoveMenu(false)}
      >
        <button className="w-full px-4 py-2 text-left text-white/70 hover:bg-white/10 text-sm flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Move to...
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
        {showMoveMenu && (
          <div className="absolute left-full top-0 bg-[#2d2d2d] rounded-lg shadow-xl border border-white/10 py-1 min-w-36">
            <button
              onClick={() => onMove(note.id, null)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm flex items-center gap-2",
                note.folderId === null ? "text-yellow-500" : "text-white/70 hover:bg-white/10"
              )}
            >
              <FileText className="w-4 h-4" />
              No Folder
            </button>
            {folders.filter(f => f.id !== 'all' && f.id !== 'trash').map(folder => (
              <button
                key={folder.id}
                onClick={() => onMove(note.id, folder.id)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm flex items-center gap-2",
                  note.folderId === folder.id ? "text-yellow-500" : "text-white/70 hover:bg-white/10"
                )}
              >
                <Folder className="w-4 h-4" style={{ color: folder.color }} />
                {folder.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-white/10 my-1" />
      <button
        onClick={() => onDelete(note.id)}
        className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 text-sm flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        {note.deleted ? 'Delete Permanently' : 'Move to Trash'}
      </button>
    </div>
  );
};

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

const ChecklistEditor: React.FC<ChecklistEditorProps> = ({ items, onChange }) => {
  const addItem = () => {
    onChange([...items, { id: generateId(), text: '', checked: false }]);
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const completedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;

  return (
    <div className="bg-white/5 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-xs">Checklist</span>
        {totalCount > 0 && (
          <span className="text-white/50 text-xs">{completedCount}/{totalCount}</span>
        )}
      </div>
      {totalCount > 0 && (
        <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => updateItem(item.id, { checked: !item.checked })}
              className={cn(
                "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                item.checked ? "bg-green-500 border-green-500" : "border-white/30"
              )}
            >
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, { text: e.target.value })}
              placeholder="Item..."
              className={cn(
                "flex-1 bg-transparent text-sm outline-none",
                item.checked ? "text-white/40 line-through" : "text-white"
              )}
            />
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="flex items-center gap-2 text-white/50 hover:text-white/70 text-sm mt-2"
      >
        <Plus className="w-3 h-3" />
        Add item
      </button>
    </div>
  );
};

interface TableEditorProps {
  data: TableData;
  onChange: (data: TableData) => void;
  onRemove: () => void;
}

const TableEditor: React.FC<TableEditorProps> = ({ data, onChange, onRemove }) => {
  const addRow = () => {
    const cols = data.rows[0]?.length || 2;
    onChange({ rows: [...data.rows, Array(cols).fill('')] });
  };

  const addColumn = () => {
    onChange({ rows: data.rows.map(row => [...row, '']) });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = data.rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
    );
    onChange({ rows: newRows });
  };

  const removeRow = (index: number) => {
    if (data.rows.length > 1) {
      onChange({ rows: data.rows.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-3 mb-3 overflow-x-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/50 text-xs">Table</span>
        <button onClick={onRemove} className="text-white/40 hover:text-red-400">
          <X className="w-3 h-3" />
        </button>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-white/10 p-0">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className={cn(
                      "w-full px-2 py-1 bg-transparent text-white text-sm outline-none",
                      rowIndex === 0 && "font-semibold bg-white/5"
                    )}
                    placeholder={rowIndex === 0 ? "Header" : "Cell"}
                  />
                </td>
              ))}
              <td className="w-6 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="p-1 text-white/40 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-2">
        <button onClick={addRow} className="text-white/50 hover:text-white/70 text-xs flex items-center gap-1">
          <Plus className="w-3 h-3" /> Row
        </button>
        <button onClick={addColumn} className="text-white/50 hover:text-white/70 text-xs flex items-center gap-1">
          <Plus className="w-3 h-3" /> Column
        </button>
      </div>
    </div>
  );
};

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onRemove }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (attachment.type === 'image') {
    return (
      <div className="relative group inline-block mr-2 mb-2">
        <img
          src={attachment.data}
          alt={attachment.name}
          className="max-w-xs max-h-48 rounded-lg border border-white/10"
        />
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mr-2 mb-2 group">
      <Paperclip className="w-4 h-4 text-white/50" />
      <div>
        <p className="text-white text-sm">{attachment.name}</p>
        <p className="text-white/40 text-xs">{formatSize(attachment.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ZNotesWindow: React.FC<ZNotesWindowProps> = ({ onClose, onFocus }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((note: Partial<Note>) => ({
          attachments: [],
          checklist: [],
          tables: [],
          sharedWith: [],
          viewOnly: false,
          deleted: false,
          ...note,
        }));
      }
    } catch (e) {
      logger.error('Failed to load notes:', e);
    }
    return [defaultNote];
  });

  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.find((f: NoteFolder) => f.id === 'trash')) {
          return [...parsed, { id: 'trash', name: 'Recently Deleted', expanded: true, color: '#6b7280', order: 999 }];
        }
        return parsed;
      }
    } catch (e) {
      logger.error('Failed to load folders:', e);
    }
    return [...defaultFolders, { id: 'trash', name: 'Recently Deleted', expanded: true, color: '#6b7280', order: 999 }];
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.error('Failed to load settings:', e);
    }
    return { viewMode: 'list' as ViewMode, sortMode: 'modified' as SortMode, sortDirection: 'desc' as SortDirection };
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes.find(n => !n.deleted)?.id || null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [folderContextMenu, setFolderContextMenu] = useState<{ folder: NoteFolder; position: { x: number; y: number } } | null>(null);
  const [noteContextMenu, setNoteContextMenu] = useState<{ note: Note; position: { x: number; y: number } } | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<{ mode: 'set' | 'unlock'; noteId: string } | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [unlockedNotes, setUnlockedNotes] = useState<Set<string>>(new Set());
  const [shareDialog, setShareDialog] = useState<Note | null>(null);
  const [exportDialog, setExportDialog] = useState<Note | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch (e) { logger.error('Failed to save notes:', e); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)); } catch (e) { logger.error('Failed to save folders:', e); }
  }, [folders]);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { logger.error('Failed to save settings:', e); }
  }, [settings]);

  // Clean up old deleted notes
  useEffect(() => {
    const cutoff = Date.now() - (DELETED_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    setNotes(prev => prev.filter(n => !n.deleted || (n.deletedAt && n.deletedAt > cutoff)));
  }, []);

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId), [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (selectedFolderId === 'trash') {
      filtered = filtered.filter(n => n.deleted);
    } else if (selectedFolderId === 'all') {
      filtered = filtered.filter(n => !n.deleted);
    } else {
      filtered = filtered.filter(n => !n.deleted && n.folderId === selectedFolderId);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query));
    }
    filtered = [...filtered].sort((a, b) => {
      if (selectedFolderId !== 'trash') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      let cmp = 0;
      switch (settings.sortMode) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'created': cmp = a.createdAt - b.createdAt; break;
        default: cmp = a.updatedAt - b.updatedAt;
      }
      return settings.sortDirection === 'desc' ? -cmp : cmp;
    });
    return filtered;
  }, [notes, selectedFolderId, searchQuery, settings.sortMode, settings.sortDirection]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: 'New Note',
      content: '',
      folderId: selectedFolderId === 'all' || selectedFolderId === 'trash' ? null : selectedFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      locked: false,
      attachments: [],
      checklist: [],
      tables: [],
      sharedWith: [],
      viewOnly: false,
      deleted: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    if (selectedFolderId === 'trash') setSelectedFolderId('all');
    setTimeout(() => editorRef.current?.focus(), 100);
  }, [selectedFolderId]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note));
  }, []);

  const deleteNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (note.deleted) {
      setNotes(prev => prev.filter(n => n.id !== id));
    } else {
      updateNote(id, { deleted: true, deletedAt: Date.now() });
    }
    if (selectedNoteId === id) {
      const remaining = filteredNotes.filter(n => n.id !== id);
      setSelectedNoteId(remaining[0]?.id || null);
    }
  }, [notes, selectedNoteId, filteredNotes, updateNote]);

  const restoreNote = useCallback((id: string) => {
    updateNote(id, { deleted: false, deletedAt: undefined });
  }, [updateNote]);

  const emptyTrash = useCallback(() => {
    setNotes(prev => prev.filter(n => !n.deleted));
    setSelectedNoteId(null);
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, pinned: !note.pinned } : note));
  }, []);

  const moveNote = useCallback((noteId: string, folderId: string | null) => {
    updateNote(noteId, { folderId });
    setNoteContextMenu(null);
  }, [updateNote]);

  const duplicateNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newNote: Note = {
      ...note,
      id: generateId(),
      title: `${note.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      sharedWith: [],
      sharedLink: undefined,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setNoteContextMenu(null);
  }, [notes]);

  const handleLockNote = useCallback((noteId: string, password: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    if (note.locked) {
      if (hashPassword(password) === note.password) {
        setUnlockedNotes(prev => new Set(prev).add(noteId));
        setPasswordDialog(null);
        setPasswordError('');
      } else {
        setPasswordError('Incorrect password');
      }
    } else {
      updateNote(noteId, { locked: true, password: hashPassword(password) });
      setPasswordDialog(null);
    }
  }, [notes, updateNote]);

  const removeLock = useCallback((noteId: string) => {
    updateNote(noteId, { locked: false, password: undefined });
    setUnlockedNotes(prev => { const next = new Set(prev); next.delete(noteId); return next; });
  }, [updateNote]);

  const handleShare = useCallback((noteId: string, viewOnly: boolean) => {
    updateNote(noteId, { sharedLink: `https://notes.zos.dev/share/${noteId}`, viewOnly });
    setShareDialog(null);
  }, [updateNote]);

  const handleExport = useCallback((format: 'pdf' | 'markdown' | 'html') => {
    if (!exportDialog) return;
    const note = exportDialog;
    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${note.title}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#333;}pre{background:#f5f5f5;padding:15px;border-radius:8px;}</style></head><body><h1>${note.title}</h1><div style="white-space:pre-wrap;">${note.content}</div></body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
      setExportDialog(null);
      return;
    }
    const content = format === 'markdown' ? `# ${note.title}\n\n${note.content}` :
      `<!DOCTYPE html><html><head><title>${note.title}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#333;}pre{background:#f5f5f5;padding:15px;border-radius:8px;overflow-x:auto;}</style></head><body><h1>${note.title}</h1><div>${note.content.replace(/\n/g, '<br>')}</div></body></html>`;
    const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${note.title}.${format === 'markdown' ? 'md' : 'html'}`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExportDialog(null);
  }, [exportDialog]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.(md|txt)$/, '');
      const newNote: Note = {
        id: generateId(), title, content,
        folderId: selectedFolderId === 'all' || selectedFolderId === 'trash' ? null : selectedFolderId,
        createdAt: Date.now(), updatedAt: Date.now(), pinned: false, locked: false,
        attachments: [], checklist: [], tables: [], sharedWith: [], viewOnly: false, deleted: false,
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [selectedFolderId]);

  const handleAddAttachment = useCallback((type: 'image' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : '*/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedNote) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          id: generateId(), type, name: file.name, data: event.target?.result as string,
          mimeType: file.type, size: file.size, createdAt: Date.now(),
        };
        updateNote(selectedNote.id, { attachments: [...selectedNote.attachments, attachment] });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [selectedNote, updateNote]);

  const removeAttachment = useCallback((attachmentId: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { attachments: selectedNote.attachments.filter(a => a.id !== attachmentId) });
  }, [selectedNote, updateNote]);

  const addChecklist = useCallback(() => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { checklist: [...selectedNote.checklist, { id: generateId(), text: '', checked: false }] });
  }, [selectedNote, updateNote]);

  const addTable = useCallback(() => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { tables: [...selectedNote.tables, { rows: [['', ''], ['', '']] }] });
  }, [selectedNote, updateNote]);

  const createFolder = useCallback(() => {
    if (newFolderName.trim()) {
      const newFolder: NoteFolder = {
        id: generateId(), name: newFolderName.trim(), expanded: true,
        color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)], order: folders.length,
      };
      setFolders(prev => [...prev.filter(f => f.id !== 'trash'), newFolder, prev.find(f => f.id === 'trash')!].filter(Boolean));
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  }, [newFolderName, folders]);

  const renameFolder = useCallback((id: string, name: string) => {
    if (name.trim()) setFolders(prev => prev.map(f => f.id === id ? { ...f, name: name.trim() } : f));
    setEditingFolderId(null);
    setEditingFolderName('');
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: null } : n));
    setFolders(prev => prev.filter(f => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId('all');
    setFolderContextMenu(null);
  }, [selectedFolderId]);

  const changeFolderColor = useCallback((id: string, color: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, color } : f));
    setFolderContextMenu(null);
  }, []);

  const toggleFolderExpanded = useCallback((id: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
  }, []);

  const handleContentChange = useCallback((content: string) => {
    if (!selectedNote) return;
    const lines = content.split('\n');
    const title = lines[0]?.replace(/^#*\s*/, '') || 'Untitled';
    updateNote(selectedNote.id, { content, title });
  }, [selectedNote, updateNote]);

  const handlePrint = useCallback(() => {
    if (!selectedNote) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${selectedNote.title}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:800px;margin:40px auto;padding:20px;}h1{color:#333;}pre{background:#f5f5f5;padding:15px;border-radius:8px;}</style></head><body><h1>${selectedNote.title}</h1><div style="white-space:pre-wrap;">${selectedNote.content}</div></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  }, [selectedNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); createNote(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); document.querySelector<HTMLInputElement>('[data-search-input]')?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (new Date(now.getTime() - 86400000).toDateString() === date.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPreview = (content: string) => content.replace(/[#*_~`]/g, '').substring(0, 100) || 'No additional text';
  const isNoteLocked = (note: Note) => note.locked && !unlockedNotes.has(note.id);
  const getNoteCountForFolder = (folderId: string) => {
    if (folderId === 'all') return notes.filter(n => !n.deleted).length;
    if (folderId === 'trash') return notes.filter(n => n.deleted).length;
    return notes.filter(n => !n.deleted && n.folderId === folderId).length;
  };

  return (
    <ZWindow title="Notes" onClose={onClose} onFocus={onFocus} defaultWidth={1100} defaultHeight={700} minWidth={900} minHeight={550} defaultPosition={{ x: 100, y: 60 }}>
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-60 bg-[#252526] border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
              <Search className="w-4 h-4 text-white/40" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" data-search-input className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {folders.filter(f => f.id !== 'trash').sort((a, b) => a.order - b.order).map(folder => (
              <div key={folder.id}>
                {editingFolderId === folder.id ? (
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <input type="text" value={editingFolderName} onChange={(e) => setEditingFolderName(e.target.value)} onBlur={() => renameFolder(folder.id, editingFolderName)} onKeyDown={(e) => { if (e.key === 'Enter') renameFolder(folder.id, editingFolderName); if (e.key === 'Escape') setEditingFolderId(null); }} className="flex-1 bg-white/5 px-2 py-1 rounded text-white text-sm outline-none" autoFocus />
                  </div>
                ) : (
                  <button onClick={() => setSelectedFolderId(folder.id)} onContextMenu={(e) => { e.preventDefault(); setFolderContextMenu({ folder, position: { x: e.clientX, y: e.clientY } }); }} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors", selectedFolderId === folder.id ? "bg-yellow-600/80 text-white" : "text-white/70 hover:bg-white/10")}>
                    {folder.id !== 'all' && <button onClick={(e) => { e.stopPropagation(); toggleFolderExpanded(folder.id); }} className="p-0.5">{folder.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}</button>}
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="flex-1 text-left truncate">{folder.name}</span>
                    <span className="text-xs text-white/40">{getNoteCountForFolder(folder.id)}</span>
                  </button>
                )}
              </div>
            ))}
            {showNewFolderInput ? (
              <div className="flex items-center gap-2 px-2 py-1.5 mt-1">
                <Folder className="w-4 h-4 text-yellow-500" />
                <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolderInput(false); }} placeholder="Folder name" className="flex-1 bg-white/5 px-2 py-1 rounded text-white text-sm placeholder:text-white/40 outline-none" autoFocus />
              </div>
            ) : (
              <button onClick={() => setShowNewFolderInput(true)} className="w-full flex items-center gap-2 px-2 py-1.5 text-white/50 hover:text-white/70 text-sm mt-1">
                <FolderPlus className="w-4 h-4" />New Folder
              </button>
            )}
            <div className="border-t border-white/10 mt-3 pt-3">
              {folders.filter(f => f.id === 'trash').map(folder => (
                <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors", selectedFolderId === folder.id ? "bg-yellow-600/80 text-white" : "text-white/70 hover:bg-white/10")}>
                  <Trash2 className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <span className="text-xs text-white/40">{getNoteCountForFolder(folder.id)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes list */}
        <div className="w-72 bg-[#2d2d2d] border-r border-white/10 flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">{folders.find(f => f.id === selectedFolderId)?.name || 'Notes'}</span>
              <div className="flex items-center gap-1">
                {selectedFolderId === 'trash' ? (
                  <button onClick={emptyTrash} className="p-1.5 rounded-md hover:bg-white/10 text-red-400 transition-colors text-xs" title="Empty Trash">Empty</button>
                ) : (
                  <>
                    <button onClick={createNote} className="p-1.5 rounded-md hover:bg-white/10 text-yellow-500 transition-colors" title="New Note (Cmd+N)"><Plus className="w-4 h-4" /></button>
                    <label className="p-1.5 rounded-md hover:bg-white/10 text-white/70 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept=".md,.txt" onChange={handleImport} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <button onClick={() => setSettings((s: { viewMode: ViewMode; sortMode: SortMode; sortDirection: SortDirection }) => ({ ...s, viewMode: 'list' as ViewMode }))} className={cn("p-1 rounded", settings.viewMode === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}><ListIcon className="w-3.5 h-3.5" /></button>
                <button onClick={() => setSettings((s: { viewMode: ViewMode; sortMode: SortMode; sortDirection: SortDirection }) => ({ ...s, viewMode: 'gallery' as ViewMode }))} className={cn("p-1 rounded", settings.viewMode === 'gallery' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}><Grid className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-center gap-1">
                <select value={settings.sortMode} onChange={(e) => setSettings((s: { viewMode: ViewMode; sortMode: SortMode; sortDirection: SortDirection }) => ({ ...s, sortMode: e.target.value as SortMode }))} className="bg-transparent text-white/60 text-xs outline-none cursor-pointer">
                  <option value="modified">Modified</option>
                  <option value="created">Created</option>
                  <option value="title">Title</option>
                </select>
                <button onClick={() => setSettings((s: { viewMode: ViewMode; sortMode: SortMode; sortDirection: SortDirection }) => ({ ...s, sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' }))} className="p-1 text-white/40 hover:text-white/70">
                  {settings.sortDirection === 'asc' ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-white/40 text-sm">{searchQuery ? 'No matching notes' : selectedFolderId === 'trash' ? 'Trash is empty' : 'No notes yet'}</div>
            ) : settings.viewMode === 'list' ? (
              filteredNotes.map(note => (
                <button key={note.id} onClick={() => { if (isNoteLocked(note)) setPasswordDialog({ mode: 'unlock', noteId: note.id }); else setSelectedNoteId(note.id); }} onContextMenu={(e) => { e.preventDefault(); setNoteContextMenu({ note, position: { x: e.clientX, y: e.clientY } }); }} className={cn("w-full p-3 text-left border-b border-white/5 transition-colors", selectedNoteId === note.id ? "bg-yellow-600/20" : "hover:bg-white/5")}>
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
                    {note.locked && <Lock className="w-3 h-3 text-white/50 flex-shrink-0" />}
                    {note.sharedLink && <Users className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                    <span className="text-white font-medium text-sm truncate flex-1">{note.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-xs">{formatDate(note.updatedAt)}</span>
                    <span className="text-white/30 text-xs truncate flex-1">{isNoteLocked(note) ? 'Locked note' : getPreview(note.content)}</span>
                  </div>
                  {note.checklist.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckSquare className="w-3 h-3 text-white/30" />
                      <span className="text-white/30 text-xs">{note.checklist.filter(i => i.checked).length}/{note.checklist.length}</span>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-2 grid grid-cols-2 gap-2">
                {filteredNotes.map(note => (
                  <button key={note.id} onClick={() => { if (isNoteLocked(note)) setPasswordDialog({ mode: 'unlock', noteId: note.id }); else setSelectedNoteId(note.id); }} onContextMenu={(e) => { e.preventDefault(); setNoteContextMenu({ note, position: { x: e.clientX, y: e.clientY } }); }} className={cn("p-3 rounded-lg text-left transition-colors h-28 overflow-hidden", selectedNoteId === note.id ? "bg-yellow-600/20 ring-1 ring-yellow-500/50" : "bg-white/5 hover:bg-white/10")}>
                    <div className="flex items-center gap-1 mb-1">
                      {note.pinned && <Pin className="w-3 h-3 text-yellow-500" />}
                      {note.locked && <Lock className="w-3 h-3 text-white/50" />}
                      <span className="text-white font-medium text-xs truncate">{note.title}</span>
                    </div>
                    <p className="text-white/30 text-xs line-clamp-4">{isNoteLocked(note) ? 'Locked note' : note.content.substring(0, 150)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            isNoteLocked(selectedNote) ? (
              <div className="flex-1 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">This note is locked</p>
                  <button onClick={() => setPasswordDialog({ mode: 'unlock', noteId: selectedNote.id })} className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors">Unlock Note</button>
                </div>
              </div>
            ) : selectedFolderId === 'trash' ? (
              <div className="flex-1 flex flex-col">
                <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/50"><AlertCircle className="w-4 h-4" /><span className="text-sm">This note is in the trash</span></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => restoreNote(selectedNote.id)} className="px-3 py-1.5 rounded-md bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors text-sm">Restore</button>
                    <button onClick={() => deleteNote(selectedNote.id)} className="px-3 py-1.5 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-sm">Delete Permanently</button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto"><div className="text-white whitespace-pre-wrap font-mono text-base opacity-50">{selectedNote.content}</div></div>
              </div>
            ) : (
              <>
                <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <select className="bg-white/5 text-white/70 text-sm px-2 py-1 rounded outline-none cursor-pointer border border-white/10" defaultValue="body">
                      <option value="title">Title</option>
                      <option value="heading">Heading</option>
                      <option value="body">Body</option>
                    </select>
                    <div className="w-px h-5 bg-white/10 mx-2" />
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Bold (Cmd+B)"><Bold className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Italic (Cmd+I)"><Italic className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Underline (Cmd+U)"><Underline className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-white/10 mx-2" />
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Bulleted List"><List className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
                    <button onClick={addChecklist} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Checklist"><CheckSquare className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-white/10 mx-2" />
                    <button onClick={addTable} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Table"><Table className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Code Block"><Code className="w-4 h-4" /></button>
                    <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Divider"><Minus className="w-4 h-4" /></button>
                    <div className="w-px h-5 bg-white/10 mx-2" />
                    <button onClick={() => handleAddAttachment('image')} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Add Image"><Image className="w-4 h-4" /></button>
                    <button onClick={() => handleAddAttachment('file')} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Attach File"><Paperclip className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePin(selectedNote.id)} className={cn("p-2 rounded hover:bg-white/10 transition-colors", selectedNote.pinned ? "text-yellow-500" : "text-white/70 hover:text-white")} title={selectedNote.pinned ? "Unpin" : "Pin"}><Pin className="w-4 h-4" /></button>
                    <button onClick={() => { if (selectedNote.locked) removeLock(selectedNote.id); else setPasswordDialog({ mode: 'set', noteId: selectedNote.id }); }} className={cn("p-2 rounded hover:bg-white/10 transition-colors", selectedNote.locked ? "text-yellow-500" : "text-white/70 hover:text-white")} title={selectedNote.locked ? "Remove Lock" : "Lock Note"}>{selectedNote.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>
                    <button onClick={() => setShareDialog(selectedNote)} className={cn("p-2 rounded hover:bg-white/10 transition-colors", selectedNote.sharedLink ? "text-blue-400" : "text-white/70 hover:text-white")} title="Share"><Share className="w-4 h-4" /></button>
                    <button onClick={() => setExportDialog(selectedNote)} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Export"><Download className="w-4 h-4" /></button>
                    <button onClick={handlePrint} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => deleteNote(selectedNote.id)} className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors" title="Delete Note"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  {selectedNote.attachments.length > 0 && (
                    <div className="mb-4">{selectedNote.attachments.map(attachment => <AttachmentPreview key={attachment.id} attachment={attachment} onRemove={() => removeAttachment(attachment.id)} />)}</div>
                  )}
                  {selectedNote.checklist.length > 0 && <ChecklistEditor items={selectedNote.checklist} onChange={(items) => updateNote(selectedNote.id, { checklist: items })} />}
                  {selectedNote.tables.map((table, index) => (
                    <TableEditor key={index} data={table} onChange={(data) => { const newTables = [...selectedNote.tables]; newTables[index] = data; updateNote(selectedNote.id, { tables: newTables }); }} onRemove={() => updateNote(selectedNote.id, { tables: selectedNote.tables.filter((_, i) => i !== index) })} />
                  ))}
                  <textarea ref={editorRef} value={selectedNote.content} onChange={(e) => handleContentChange(e.target.value)} className="w-full h-full min-h-[300px] bg-transparent text-white text-base resize-none outline-none font-mono leading-relaxed" placeholder="Start typing..." />
                </div>
                <div className="h-8 px-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-4">
                    <span>Last edited {new Date(selectedNote.updatedAt).toLocaleString()}</span>
                    {selectedNote.sharedLink && <span className="flex items-center gap-1 text-blue-400"><Users className="w-3 h-3" />Shared {selectedNote.viewOnly ? '(view only)' : ''}</span>}
                  </div>
                  <span>{selectedNote.content.length} characters | {selectedNote.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a note or create a new one</p>
                <p className="text-sm mt-2">Press Cmd+N to create a new note</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {folderContextMenu && <FolderContextMenu folder={folderContextMenu.folder} position={folderContextMenu.position} onClose={() => setFolderContextMenu(null)} onRename={(id) => { const folder = folders.find(f => f.id === id); if (folder) { setEditingFolderId(id); setEditingFolderName(folder.name); } setFolderContextMenu(null); }} onDelete={deleteFolder} onChangeColor={changeFolderColor} />}
      {noteContextMenu && <NoteContextMenu note={noteContextMenu.note} position={noteContextMenu.position} folders={folders} onClose={() => setNoteContextMenu(null)} onPin={togglePin} onMove={moveNote} onDelete={deleteNote} onDuplicate={duplicateNote} />}
      <PasswordDialog isOpen={!!passwordDialog} mode={passwordDialog?.mode || 'set'} onSubmit={(password) => passwordDialog && handleLockNote(passwordDialog.noteId, password)} onCancel={() => { setPasswordDialog(null); setPasswordError(''); }} error={passwordError} />
      <ShareDialog isOpen={!!shareDialog} note={shareDialog} onClose={() => setShareDialog(null)} onShare={handleShare} />
      <ExportDialog isOpen={!!exportDialog} note={exportDialog} onClose={() => setExportDialog(null)} onExport={handleExport} />
    </ZWindow>
  );
};

export default ZNotesWindow;
