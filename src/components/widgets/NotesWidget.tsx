import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import DesktopWidget from './DesktopWidget';
import { useWidgets, type WidgetInstance } from '@/contexts/WidgetContext';

interface NotesWidgetProps {
  widget: WidgetInstance;
}

const STORAGE_KEY_PREFIX = 'zos-widget-note-';

const NotesWidget: React.FC<NotesWidgetProps> = ({ widget }) => {
  const { updateWidget, editMode } = useWidgets();
  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  // Load note from widget data or localStorage
  const [note, setNote] = useState<string>(() => {
    if (widget.data?.note) return widget.data.note as string;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + widget.id);
      return saved || '';
    } catch {
      return '';
    }
  });

  // Save note to localStorage and widget data
  const saveNote = useCallback((text: string) => {
    setNote(text);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + widget.id, text);
    } catch { /* ignore */ }
    updateWidget(widget.id, { data: { ...widget.data, note: text } });
  }, [widget.id, widget.data, updateWidget]);

  if (isSmall) {
    return (
      <DesktopWidget widget={widget}>
        <div className="flex flex-col h-full p-3 bg-yellow-100/90">
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            disabled={editMode}
            placeholder="New Note..."
            className={cn(
              'flex-1 w-full bg-transparent resize-none outline-none',
              'text-gray-800 text-sm leading-relaxed',
              'placeholder:text-gray-400',
              editMode && 'cursor-grab'
            )}
          />
        </div>
      </DesktopWidget>
    );
  }

  return (
    <DesktopWidget widget={widget}>
      <div className="flex flex-col h-full bg-yellow-100/90">
        {/* Header */}
        <div className="px-4 py-2 border-b border-yellow-200/50">
          <p className="text-yellow-700/60 text-xs">
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            disabled={editMode}
            placeholder="Start typing..."
            className={cn(
              'w-full h-full bg-transparent resize-none outline-none',
              'text-gray-800 leading-relaxed',
              isLarge ? 'text-base' : 'text-sm',
              'placeholder:text-gray-400',
              editMode && 'cursor-grab'
            )}
          />
        </div>
      </div>
    </DesktopWidget>
  );
};

export default NotesWidget;
