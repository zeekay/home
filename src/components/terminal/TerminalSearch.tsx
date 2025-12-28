
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface TerminalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, direction: 'next' | 'prev') => void;
  matchCount: number;
  currentMatch: number;
}

const TerminalSearch: React.FC<TerminalSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  matchCount,
  currentMatch,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query) {
      onSearch(query, 'next');
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(query, e.shiftKey ? 'prev' : 'next');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 z-10 bg-black/95 backdrop-blur-sm border border-white/10 rounded-bl-lg shadow-lg">
      <div className="flex items-center gap-1 p-2">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find..."
          className="h-7 w-48 text-xs bg-white/5 border-white/10"
        />
        
        <span className="text-xs text-white/50 min-w-[60px] text-center">
          {query && matchCount > 0
            ? `${currentMatch}/${matchCount}`
            : query
            ? 'No match'
            : ''}
        </span>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onSearch(query, 'prev')}
            disabled={!query || matchCount === 0}
            className={cn(
              'p-1 rounded hover:bg-white/10 transition-colors',
              (!query || matchCount === 0) && 'opacity-30 cursor-not-allowed'
            )}
            title="Previous (Shift+Enter)"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onSearch(query, 'next')}
            disabled={!query || matchCount === 0}
            className={cn(
              'p-1 rounded hover:bg-white/10 transition-colors',
              (!query || matchCount === 0) && 'opacity-30 cursor-not-allowed'
            )}
            title="Next (Enter)"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors ml-1"
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalSearch;
