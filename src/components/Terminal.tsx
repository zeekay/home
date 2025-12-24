
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TerminalProps } from '@/types/terminal';
import { useTerminal } from '@/contexts/TerminalContext';
import { getCurrentDir } from '@/utils/terminalFileSystem';
import VimEditor from './VimEditor';

// Commands for tab completion
const COMMANDS = [
  'ls', 'll', 'la', 'cd', 'pwd', 'cat', 'head', 'tail', 'vim', 'nvim', 'nano',
  'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'grep', 'wc', 'tree', 'clear',
  'history', 'help', 'neofetch', 'info', 'whoami', 'uname', 'hostname', 'date',
  'uptime', 'which', 'type', 'alias', 'env', 'printenv', 'theme', 'git', 'node',
  'npm', 'npx', 'python', 'python3', 'open', 'cowsay', 'fortune', 'ellipsis', 'dots'
];

const terminalThemes = {
  dark: { bg: 'bg-black', text: 'text-white' }, // Pure black like iTerm2
  light: { bg: 'bg-[#f6f8fa]', text: 'text-gray-800' },
  blue: { bg: 'bg-[#0d2538]', text: 'text-cyan-100' },
  green: { bg: 'bg-[#0f2d1b]', text: 'text-green-100' },
  purple: { bg: 'bg-[#2b213a]', text: 'text-purple-100' },
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

// Clean ANSI escape codes and control characters from terminal output
const cleanTerminalOutput = (text: string): string => {
  // Use string construction for ANSI escape sequences to avoid ESLint control-regex warnings
  const ESC = '\x1b';
  const BEL = '\x07';
  const ansiCsi = new RegExp(ESC + '\\[[0-9;?]*[a-zA-Z]', 'g');
  const ansiOsc = new RegExp(ESC + '\\][^' + BEL + ESC + ']*(?:' + BEL + '|' + ESC + '\\\\)', 'g');
  const ansiDcs = new RegExp(ESC + '[PX^_][^' + ESC + ']*' + ESC + '\\\\', 'g');
  const ansiSingle = new RegExp(ESC + '[@-Z\\\\-_]', 'g');
  // Control characters: NUL-BS, VT, FF, SO-US, DEL (excluding TAB, LF, CR)
  const controlChars = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + 
    String.fromCharCode(11) + String.fromCharCode(12) + 
    String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g');
  
  return text
    // Remove ANSI escape codes (including CSI sequences like [?2004h)
    .replace(ansiCsi, '')
    .replace(ansiOsc, '') // OSC sequences
    .replace(ansiDcs, '') // DCS, SOS, PM, APC sequences
    .replace(ansiSingle, '') // Single ESC sequences
    // Remove any leftover bracket sequences that might have been split
    .replace(/\[\??\d*[a-zA-Z]/g, '')
    // Remove control characters except newlines and tabs
    .replace(controlChars, '')
    // Clean up multiple consecutive spaces (but preserve indentation)
    .replace(/[^\S\n]{3,}/g, '  ')
    // Trim trailing whitespace from lines
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');
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
    setCommandHistory,
    editorState,
    closeEditor,
    saveFile
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
    
    const container = containerRef.current;
    container?.addEventListener('click', handleClick);
    
    return () => {
      container?.removeEventListener('click', handleClick);
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

  // Tab completion
  const handleTabComplete = useCallback(() => {
    const parts = inputValue.split(' ');
    const currentWord = parts[parts.length - 1];
    const isFirstWord = parts.length === 1;
    
    if (!currentWord) return;
    
    let completions: string[] = [];
    
    if (isFirstWord) {
      // Complete commands
      completions = COMMANDS.filter(cmd => cmd.startsWith(currentWord.toLowerCase()));
    } else {
      // Complete file/directory names
      const currentDir = getCurrentDir();
      const items = Object.keys(currentDir);
      completions = items.filter(item => item.toLowerCase().startsWith(currentWord.toLowerCase()));
    }
    
    if (completions.length === 1) {
      // Single match - complete it
      parts[parts.length - 1] = completions[0];
      setInputValue(parts.join(' '));
    } else if (completions.length > 1) {
      // Multiple matches - find common prefix
      const commonPrefix = completions.reduce((prefix, completion) => {
        let i = 0;
        while (i < prefix.length && i < completion.length && prefix[i] === completion[i]) {
          i++;
        }
        return prefix.slice(0, i);
      }, completions[0]);
      
      if (commonPrefix.length > currentWord.length) {
        parts[parts.length - 1] = commonPrefix;
        setInputValue(parts.join(' '));
      }
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === 'ArrowUp') {
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

  // Handle vim editor save
  const handleEditorSave = async (content: string) => {
    await saveFile(editorState.fileName, content);
  };

  // Show VimEditor when editing
  if (editorState.isOpen) {
    return (
      <VimEditor
        fileName={editorState.fileName}
        initialContent={editorState.content}
        onSave={handleEditorSave}
        onClose={closeEditor}
        isNewFile={editorState.isNewFile}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-hidden flex flex-col w-full h-full',
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
              <div className="flex items-center" style={{ fontSize: `${customFontSize}px` }}>
                <span className="text-cyan-400 mr-1">z@zeekay.ai</span>
                <span className="text-blue-400 mr-1">~</span>
                <span className="text-purple-400 mr-2">❯</span>
                <span className="text-gray-100">{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div
                className={cn(
                  'whitespace-pre-wrap font-mono mt-1',
                  entry.isError ? 'text-red-400' : 'text-gray-200'
                )}
                style={{ fontSize: `${customFontSize}px` }}
              >
                {cleanTerminalOutput(entry.output)
                  .split('\n')
                  .filter(line => line.trim() !== '') // Remove empty lines
                  .map((line, i) => (
                    <div key={i}>{line}</div>
                  ))
                }
              </div>
            )}
          </div>
        ))}
        
        <div className="flex items-center mt-2" style={{ fontSize: `${customFontSize}px` }}>
          <span className="text-cyan-400 mr-1">z@zeekay.ai</span>
          <span className="text-blue-400 mr-1">~</span>
          <span className="text-purple-400 mr-2">❯</span>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-full outline-none text-gray-100 caret-gray-100"
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
