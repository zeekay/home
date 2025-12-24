import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  MoreHorizontal,
  Pin,
  Share,
  Lock,
} from 'lucide-react';

interface ZNotesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
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
}

interface NoteFolder {
  id: string;
  name: string;
  expanded: boolean;
}

const STORAGE_KEY = 'zos-notes';
const FOLDERS_KEY = 'zos-notes-folders';

const generateId = () => Math.random().toString(36).substring(2, 15);

const ZNotesWindow: React.FC<ZNotesWindowProps> = ({ onClose, onFocus }) => {
  // Load notes from localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logger.error('Failed to load notes:', e);
    }
    // Default notes
    return [
      {
        id: generateId(),
        title: 'Welcome to Notes',
        content: `# Welcome to zOS Notes

This is your personal notes app. Here's what you can do:

• Create new notes with ⌘N
• Organize notes in folders
• Pin important notes
• Search across all notes
• Format text with rich editing

All your notes are automatically saved to your browser's local storage.

Happy note-taking! 📝`,
        folderId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: true,
        locked: false,
      },
    ];
  });

  // Load folders from localStorage
  const [folders, setFolders] = useState<NoteFolder[]>(() => {
    try {
      const saved = localStorage.getItem(FOLDERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logger.error('Failed to load folders:', e);
    }
    return [
      { id: 'all', name: 'All Notes', expanded: true },
      { id: 'personal', name: 'Personal', expanded: true },
      { id: 'work', name: 'Work', expanded: true },
    ];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      logger.error('Failed to save notes:', e);
    }
  }, [notes]);

  // Save folders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    } catch (e) {
      logger.error('Failed to save folders:', e);
    }
  }, [folders]);

  const selectedNote = useMemo(() => 
    notes.find(n => n.id === selectedNoteId),
    [notes, selectedNoteId]
  );

  // Filter notes based on folder and search
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    
    // Filter by folder
    if (selectedFolderId !== 'all') {
      filtered = filtered.filter(n => n.folderId === selectedFolderId);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }
    
    // Sort: pinned first, then by updated date
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, selectedFolderId, searchQuery]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: 'New Note',
      content: '',
      folderId: selectedFolderId === 'all' ? null : selectedFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      locked: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, [selectedFolderId]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(note =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    ));
  }, []);

  const createFolder = useCallback(() => {
    if (newFolderName.trim()) {
      const newFolder: NoteFolder = {
        id: generateId(),
        name: newFolderName.trim(),
        expanded: true,
      };
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  }, [newFolderName]);

  const toggleFolderExpanded = useCallback((id: string) => {
    setFolders(prev => prev.map(f =>
      f.id === id ? { ...f, expanded: !f.expanded } : f
    ));
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPreview = (content: string) => {
    return content.replace(/[#*_~`]/g, '').substring(0, 100) || 'No additional text';
  };

  // Handle title editing (first line of content)
  const handleContentChange = (content: string) => {
    if (!selectedNote) return;
    
    const lines = content.split('\n');
    const title = lines[0]?.replace(/^#*\s*/, '') || 'Untitled';
    
    updateNote(selectedNote.id, { content, title });
  };

  // Keyboard shortcut for new note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNote]);

  return (
    <ZWindow
      title="Notes"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1000}
      defaultHeight={650}
      minWidth={800}
      minHeight={500}
      defaultPosition={{ x: 120, y: 80 }}
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar - Folders */}
        <div className="w-56 bg-[#252526] border-r border-white/10 flex flex-col">
          {/* Sidebar header */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
              />
            </div>
          </div>

          {/* Folders list */}
          <div className="flex-1 overflow-y-auto p-2">
            {folders.map(folder => (
              <div key={folder.id}>
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                    selectedFolderId === folder.id
                      ? "bg-yellow-600/80 text-white"
                      : "text-white/70 hover:bg-white/10"
                  )}
                >
                  {folder.id !== 'all' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolderExpanded(folder.id);
                      }}
                      className="p-0.5"
                    >
                      {folder.expanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  )}
                  <Folder className="w-4 h-4 text-yellow-500" />
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <span className="text-xs text-white/40">
                    {folder.id === 'all' 
                      ? notes.length 
                      : notes.filter(n => n.folderId === folder.id).length}
                  </span>
                </button>
              </div>
            ))}

            {/* New folder input */}
            {showNewFolderInput ? (
              <div className="flex items-center gap-2 px-2 py-1.5 mt-1">
                <Folder className="w-4 h-4 text-yellow-500" />
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createFolder();
                    if (e.key === 'Escape') setShowNewFolderInput(false);
                  }}
                  placeholder="Folder name"
                  className="flex-1 bg-white/5 px-2 py-1 rounded text-white text-sm placeholder:text-white/40 outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-white/50 hover:text-white/70 text-sm mt-1"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
            )}
          </div>
        </div>

        {/* Notes list */}
        <div className="w-72 bg-[#2d2d2d] border-r border-white/10 flex flex-col">
          {/* Notes list header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/70 text-sm font-medium">
              {folders.find(f => f.id === selectedFolderId)?.name || 'Notes'}
            </span>
            <button
              onClick={createNote}
              className="p-1.5 rounded-md hover:bg-white/10 text-yellow-500 transition-colors"
              title="New Note (⌘N)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-white/40 text-sm">
                {searchQuery ? 'No matching notes' : 'No notes yet'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={cn(
                    "w-full p-3 text-left border-b border-white/5 transition-colors",
                    selectedNoteId === note.id
                      ? "bg-yellow-600/20"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin className="w-3 h-3 text-yellow-500" />}
                    <span className="text-white font-medium text-sm truncate flex-1">
                      {note.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40 text-xs">
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="text-white/30 text-xs truncate flex-1">
                      {getPreview(note.content)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Note editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Editor toolbar */}
              <div className="h-12 px-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <Underline className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-2" />
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <List className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-2" />
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(selectedNote.id)}
                    className={cn(
                      "p-2 rounded hover:bg-white/10 transition-colors",
                      selectedNote.pinned ? "text-yellow-500" : "text-white/70 hover:text-white"
                    )}
                    title={selectedNote.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                    <Share className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-red-400 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-full bg-transparent text-white text-base resize-none outline-none font-mono leading-relaxed"
                  placeholder="Start typing..."
                />
              </div>

              {/* Status bar */}
              <div className="h-8 px-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                <span>
                  Last edited {new Date(selectedNote.updatedAt).toLocaleString()}
                </span>
                <span>
                  {selectedNote.content.length} characters • {selectedNote.content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a note or create a new one</p>
                <p className="text-sm mt-2">Press ⌘N to create a new note</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZNotesWindow;
