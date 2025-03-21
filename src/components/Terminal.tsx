
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TerminalProps } from '@/types/terminal';
import { useTerminal } from '@/contexts/TerminalContext';

const Terminal: React.FC<TerminalProps> = ({ 
  className,
  customFontSize = 14,
  customPadding = 16,
  customTheme = 'dark'
}) => {
  const {
    entries,
    executeCommand,
    commandHistory,
    setCommandHistory
  } = useTerminal();
  
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);
  
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };
    
    containerRef.current?.addEventListener('click', handleClick);
    
    return () => {
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const trimmedCommand = inputValue.trim();
    
    // Add the command to history only if it's not the same as the most recent one
    setCommandHistory(prev => {
      if (prev.length === 0 || prev[0] !== trimmedCommand) {
        return [trimmedCommand, ...prev];
      }
      return prev;
    });
    
    setInputValue('');
    setHistoryIndex(-1);
    
    await executeCommand(trimmedCommand);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    } else {
      // Reset history index when typing new commands
      if (historyIndex !== -1) {
        setHistoryIndex(-1);
      }
    }
  };

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
