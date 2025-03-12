
import React, { useState, useRef, useEffect } from 'react';
import { processCommand, resetFileSystem } from '@/utils/terminal';
import { cn } from '@/lib/utils';

interface TerminalProps {
  className?: string;
}

interface TerminalEntry {
  command: string;
  output: string;
  isError?: boolean;
  id: number;
}

const Terminal: React.FC<TerminalProps> = ({ className }) => {
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

  return (
    <div 
      ref={containerRef}
      className={cn(
        'glass-card terminal-shadow rounded-xl overflow-hidden flex flex-col',
        'w-full h-[500px] md:h-[600px] transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div className="bg-[#2d333b] dark:bg-[#1c1e26] flex items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-white text-xs ml-4 opacity-70">Terminal</div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-[#f6f8fa] dark:bg-[#262a33] terminal scrollbar-thin">
        {entries.map((entry, index) => (
          <div key={entry.id} className="mb-2">
            {entry.command && (
              <div className="flex">
                <span className="text-green-600 dark:text-green-400 mr-2">$</span>
                <span>{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div 
                className={cn(
                  'whitespace-pre-wrap font-mono text-sm mt-1',
                  entry.isError ? 'text-red-500' : 'text-foreground'
                )}
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
