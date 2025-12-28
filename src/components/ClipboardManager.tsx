import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useClipboard, ClipboardItem } from '@/contexts/ClipboardContext';
import {
  FileText,
  Image,
  Link,
  File,
  Pin,
  PinOff,
  Trash2,
  Search,
  X,
  Copy,
  Clock,
} from 'lucide-react';

interface ClipboardManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Type icons
const TypeIcon: React.FC<{ type: ClipboardItem['type']; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'text':
      return <FileText className={cn('w-4 h-4', className)} />;
    case 'image':
      return <Image className={cn('w-4 h-4', className)} />;
    case 'url':
      return <Link className={cn('w-4 h-4', className)} />;
    case 'file':
      return <File className={cn('w-4 h-4', className)} />;
  }
};

// Format relative time
function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

const ClipboardManager: React.FC<ClipboardManagerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, clearHistory, pinItem, unpinItem, pasteItem } = useClipboard();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(item => {
      if (item.type === 'image') return false; // Can't search images
      return item.content.toLowerCase().includes(q);
    });
  }, [items, query]);

  // Separate pinned and unpinned
  const pinnedItems = useMemo(() => filteredItems.filter(i => i.pinned), [filteredItems]);
  const unpinnedItems = useMemo(() => filteredItems.filter(i => !i.pinned), [filteredItems]);

  // Handler for pasting items
  const handlePaste = useCallback((item: ClipboardItem) => {
    pasteItem(item.id);
    onClose();
  }, [pasteItem, onClose]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handlePaste(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Delete':
        case 'Backspace':
          if (e.metaKey && filteredItems[selectedIndex]) {
            e.preventDefault();
            removeItem(filteredItems[selectedIndex].id);
          }
          break;
        case 'p':
          if (e.metaKey && filteredItems[selectedIndex]) {
            e.preventDefault();
            const item = filteredItems[selectedIndex];
            if (item.pinned) {
              unpinItem(item.id);
            } else {
              pinItem(item.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, removeItem, pinItem, unpinItem, handlePaste]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[30000] flex items-start justify-center pt-[12%] bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Clipboard Manager"
        className="w-[500px] bg-black/70 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-4 h-4 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clipboard history..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">{filteredItems.length} items</span>
            {items.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                className="text-white/40 hover:text-red-400 transition-colors p-1"
                title="Clear history (keeps pinned)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/60 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto">
          {filteredItems.length === 0 && (
            <div className="px-4 py-12 text-center text-white/50">
              {query ? `No results for "${query}"` : 'Clipboard history is empty'}
            </div>
          )}

          {/* Pinned Section */}
          {pinnedItems.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-xs text-white/40 bg-white/5 flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </div>
              {pinnedItems.map((item, idx) => (
                <ClipboardItemRow
                  key={item.id}
                  item={item}
                  index={idx}
                  isSelected={selectedIndex === idx}
                  onSelect={() => setSelectedIndex(idx)}
                  onPaste={() => handlePaste(item)}
                  onRemove={() => removeItem(item.id)}
                  onTogglePin={() => unpinItem(item.id)}
                />
              ))}
            </>
          )}

          {/* Recent Section */}
          {unpinnedItems.length > 0 && (
            <>
              {pinnedItems.length > 0 && (
                <div className="px-4 py-1.5 text-xs text-white/40 bg-white/5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
              )}
              {unpinnedItems.map((item, idx) => {
                const globalIndex = pinnedItems.length + idx;
                return (
                  <ClipboardItemRow
                    key={item.id}
                    item={item}
                    index={globalIndex}
                    isSelected={selectedIndex === globalIndex}
                    onSelect={() => setSelectedIndex(globalIndex)}
                    onPaste={() => handlePaste(item)}
                    onRemove={() => removeItem(item.id)}
                    onTogglePin={() => pinItem(item.id)}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-white/40 text-xs">
          <span>Clipboard Manager</span>
          <div className="flex gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Paste</span>
            <span>⌘P Pin</span>
            <span>⌘⌫ Delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual clipboard item row
interface ClipboardItemRowProps {
  item: ClipboardItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onPaste: () => void;
  onRemove: () => void;
  onTogglePin: () => void;
}

const ClipboardItemRow: React.FC<ClipboardItemRowProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onPaste,
  onRemove,
  onTogglePin,
}) => {
  return (
    <div
      data-index={index}
      className={cn(
        'group flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors',
        isSelected
          ? 'bg-blue-500/80 text-white'
          : 'text-white/90 hover:bg-white/10'
      )}
      onClick={onPaste}
      onMouseEnter={onSelect}
    >
      {/* Type Icon */}
      <div className={cn(
        'mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
        isSelected ? 'bg-white/20' : 'bg-white/10'
      )}>
        {item.type === 'image' && item.preview?.startsWith('data:') ? (
          <img
            src={item.preview}
            alt="Preview"
            className="w-5 h-5 object-cover rounded"
          />
        ) : (
          <TypeIcon type={item.type} className={isSelected ? 'text-white' : 'text-white/70'} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {item.type === 'image' ? '[Image]' : item.preview}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn(
            'text-xs capitalize',
            isSelected ? 'text-white/70' : 'text-white/50'
          )}>
            {item.type}
          </span>
          <span className={cn(
            'text-xs',
            isSelected ? 'text-white/50' : 'text-white/30'
          )}>
            {formatTime(item.timestamp)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
        isSelected && 'opacity-100'
      )}>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={cn(
            'p-1.5 rounded hover:bg-white/20 transition-colors',
            item.pinned ? 'text-yellow-400' : 'text-white/50'
          )}
          title={item.pinned ? 'Unpin' : 'Pin'}
        >
          {item.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPaste(); }}
          className="p-1.5 rounded hover:bg-white/20 text-white/50 transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded hover:bg-red-500/50 text-white/50 hover:text-white transition-colors"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ClipboardManager;
