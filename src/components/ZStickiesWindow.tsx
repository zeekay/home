import React, { useState, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { Plus, Trash2, Palette } from 'lucide-react';

interface ZStickiesWindowProps {
  onClose: () => void;
}

interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
}

const noteColors = [
  { name: 'Yellow', bg: 'bg-yellow-200', text: 'text-yellow-900', border: 'border-yellow-300' },
  { name: 'Pink', bg: 'bg-pink-200', text: 'text-pink-900', border: 'border-pink-300' },
  { name: 'Blue', bg: 'bg-blue-200', text: 'text-blue-900', border: 'border-blue-300' },
  { name: 'Green', bg: 'bg-green-200', text: 'text-green-900', border: 'border-green-300' },
  { name: 'Purple', bg: 'bg-purple-200', text: 'text-purple-900', border: 'border-purple-300' },
  { name: 'Orange', bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-300' },
];

const ZStickiesWindow: React.FC<ZStickiesWindowProps> = ({ onClose }) => {
  const [notes, setNotes] = useState<StickyNote[]>([
    { id: '1', content: 'Welcome to Stickies!\n\nClick + to add a new note.', color: 'Yellow', createdAt: new Date() },
    { id: '2', content: 'Remember to:\n- Check emails\n- Review PRs\n- Deploy updates', color: 'Pink', createdAt: new Date() },
    { id: '3', content: 'Ideas:\n• New terminal features\n• Better animations\n• More themes', color: 'Blue', createdAt: new Date() },
  ]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const addNote = () => {
    const newNote: StickyNote = {
      id: Date.now().toString(),
      content: '',
      color: noteColors[Math.floor(Math.random() * noteColors.length)].name,
      createdAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote.id);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (selectedNote === id) {
      setSelectedNote(null);
    }
  };

  const changeColor = (id: string, color: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, color } : note
    ));
    setShowColorPicker(null);
  };

  const getColorClasses = (colorName: string) => {
    return noteColors.find(c => c.name === colorName) || noteColors[0];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <ZWindow
      title="Stickies"
      onClose={onClose}
      initialPosition={{ x: 140, y: 70 }}
      initialSize={{ width: 700, height: 500 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#2c2c2e]">
        {/* Sidebar - Notes List */}
        <div className="w-56 border-r border-white/10 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 border-b border-white/10">
            <button
              onClick={addNote}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="New Note"
            >
              <Plus className="w-5 h-5 text-white/70" />
            </button>
            <span className="text-white/50 text-xs">{notes.length} notes</span>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {notes.map((note) => {
              const colors = getColorClasses(note.color);
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note.id)}
                  className={`group p-3 cursor-pointer border-b border-white/5 transition-colors ${
                    selectedNote === note.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors.bg} flex-shrink-0 mt-1`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {note.content.split('\n')[0] || 'New Note'}
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-white/50" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content - Note Editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === selectedNote ? null : selectedNote)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <div className={`w-4 h-4 rounded-full ${getColorClasses(notes.find(n => n.id === selectedNote)?.color || 'Yellow').bg}`} />
                    <Palette className="w-4 h-4 text-white/50" />
                  </button>

                  {showColorPicker === selectedNote && (
                    <div className="absolute top-full left-0 mt-1 bg-[#3c3c3e] rounded-lg shadow-xl border border-white/10 p-2 z-10">
                      <div className="flex gap-1">
                        {noteColors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => changeColor(selectedNote, color.name)}
                            className={`w-6 h-6 rounded-full ${color.bg} hover:ring-2 ring-white/50 transition-all`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteNote(selectedNote)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              {/* Note Content */}
              {(() => {
                const note = notes.find(n => n.id === selectedNote);
                if (!note) return null;
                const colors = getColorClasses(note.color);
                return (
                  <div className={`flex-1 ${colors.bg}`}>
                    <textarea
                      value={note.content}
                      onChange={(e) => updateNote(note.id, e.target.value)}
                      placeholder="Start typing..."
                      className={`w-full h-full p-4 bg-transparent ${colors.text} placeholder:${colors.text}/50 resize-none outline-none text-base leading-relaxed font-medium`}
                      autoFocus
                    />
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              <div className="text-center">
                <p className="text-lg mb-2">No note selected</p>
                <p className="text-sm">Select a note or click + to create one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZStickiesWindow;
