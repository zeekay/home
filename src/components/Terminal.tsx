
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TerminalProps } from '@/types/terminal';
import { useTerminal } from '@/contexts/TerminalContext';

const terminalThemes = {
  dark: { bg: 'bg-[#262a33]', text: 'text-white' },
  light: { bg: 'bg-[#f6f8fa]', text: 'text-gray-800' },
  blue: { bg: 'bg-[#0d2538]', text: 'text-cyan-100' },
  green: { bg: 'bg-[#0f2d1b]', text: 'text-green-100' },
  purple: { bg: 'bg-[#2b213a]', text: 'text-purple-100' },
  // New themes
  neon: { bg: 'bg-[#0c0b1f]', text: 'text-[#00ff9f]' },
  retro: { bg: 'bg-[#2d2b55]', text: 'text-[#fad000]' },
  sunset: { bg: 'bg-gradient-to-r from-[#1a1c2c] to-[#2d1b31]', text: 'text-orange-100' },
  ocean: { bg: 'bg-gradient-to-r from-[#0f2027] to-[#203a43]', text: 'text-blue-100' },
  midnight: { bg: 'bg-[#121212]', text: 'text-[#e2e2e2]' },
  matrix: { bg: 'bg-black', text: 'text-[#00ff00]' },
  monokai: { bg: 'bg-[#272822]', text: 'text-[#f8f8f2]' },
  dracula: { bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]' },
  nord: { bg: 'bg-[#2e3440]', text: 'text-[#d8dee9]' },
  pastel: { bg: 'bg-[#fdf6e3]', text: 'text-[#657b83]' }
};

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
    return terminalThemes[customTheme as keyof typeof terminalThemes] || terminalThemes.dark;
  };

  const theme = getTerminalTheme();

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
        theme.bg,
        theme.text
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
