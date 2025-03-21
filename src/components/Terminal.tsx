
import React, { useState, useRef, useEffect } from 'react';
import { processCommand, resetFileSystem } from '@/utils/terminal';
import { cn } from '@/lib/utils';

interface TerminalProps {
  className?: string;
  customFontSize?: number;
  customPadding?: number;
  customTheme?: string;
}

interface TerminalEntry {
  command: string;
  output: string;
  isError?: boolean;
  id: number;
}

const Terminal: React.FC<TerminalProps> = ({ 
  className,
  customFontSize = 14,
  customPadding = 16,
  customTheme = 'dark'
}) => {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { 
      command: '', 
      output: "Welcome to Zach's Terminal! Type 'help' for available commands.", 
      id: 0 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset filesystem on mount
  useEffect(() => {
    resetFileSystem();
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);
  
  // Focus input when clicking anywhere in the terminal
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    
    containerRef.current?.addEventListener('click', handleClick);
    
    return () => {
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const trimmedCommand = inputValue.trim();
    
    // Add to history
    setCommandHistory(prev => [trimmedCommand, ...prev]);
    
    // Special case for clear command
    if (trimmedCommand.toLowerCase() === 'clear') {
      setEntries([]);
      setInputValue('');
      setHistoryIndex(-1);
      return;
    }
    
    // Process the command
    const result = processCommand(trimmedCommand);
    
    // Add the command and its output to the terminal
    setEntries(prev => [
      ...prev,
      {
        command: trimmedCommand,
        output: result.output,
        isError: result.isError,
        id: Date.now()
      }
    ]);
    
    setInputValue('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0 && commandHistory[newIndex]) {
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0 && commandHistory[newIndex]) {
        setInputValue(commandHistory[newIndex]);
      } else {
        setInputValue('');
      }
    }
  };

  // Get terminal theme styles
  const getTerminalTheme = () => {
    switch (customTheme) {
      case 'light':
        return 'bg-[#f6f8fa] text-gray-800';
      case 'blue':
        return 'bg-[#0d2538] text-cyan-100';
      case 'green':
        return 'bg-[#0f2d1b] text-green-100';
      case 'purple':
        return 'bg-[#2b213a] text-purple-100';
      default: // dark
        return 'bg-[#262a33] text-white';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'glass-card terminal-shadow rounded-xl overflow-hidden flex flex-col w-full h-full transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div className={cn(
        'flex-1 overflow-y-auto terminal scrollbar-thin',
        getTerminalTheme()
      )}
        style={{ padding: `${customPadding}px` }}
      >
        {entries.map((entry, index) => (
          <div key={entry.id} className="mb-2">
            {entry.command && (
              <div className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">$</span>
                <span style={{ fontSize: `${customFontSize}px` }}>{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div 
                className={cn(
                  'whitespace-pre-wrap font-mono mt-1',
                  entry.isError ? 'text-red-500' : 'text-foreground'
                )}
                style={{ fontSize: `${customFontSize}px` }}
                dangerouslySetInnerHTML={{ __html: entry.output.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
        ))}
        
        <div className="flex mt-2">
          <span className="text-green-600 dark:text-green-400 mr-2">$</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-full outline-none terminal-text"
              style={{ fontSize: `${customFontSize}px` }}
              autoFocus
            />
          </form>
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default Terminal;
