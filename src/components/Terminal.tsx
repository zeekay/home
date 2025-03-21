
import React, { useState, useRef, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
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
      output: "Welcome to Zach's Terminal! Type 'help' for available commands or wait for WebContainer to load...", 
      id: 0 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | null>(null);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize WebContainer on mount
  useEffect(() => {
    const initWebContainer = async () => {
      try {
        // Check if WebContainer is supported by checking if it exists
        if (typeof WebContainer === 'undefined') {
          addEntry({
            command: '',
            output: "WebContainer is not supported in this environment. Falling back to simulated terminal.",
            isError: true,
            id: Date.now()
          });
          return;
        }

        const webContainerInstance = await WebContainer.boot();
        setWebContainerInstance(webContainerInstance);
        
        // Initialize file system with some files
        await webContainerInstance.mount({
          'README.md': {
            file: {
              contents: `# Zach Kelling
              
Welcome to my terminal!

## Commands to try:
- ls: list files 
- cat README.md
- cd projects
- mkdir new-project
- touch hello.txt
- echo "Hello world" > hello.txt
- cat hello.txt

Feel free to explore!`
            }
          },
          'projects': {
            directory: {
              'awesome-project.txt': {
                file: {
                  contents: 'This is one of my awesome projects. Check out more at github.com/zeekay'
                }
              }
            }
          },
          'contact.txt': {
            file: {
              contents: `Twitter: @zeekay
GitHub: @zeekay
Email: [redacted]`
            }
          },
          'bio.txt': {
            file: {
              contents: 'Software engineer with a passion for building elegant solutions to complex problems.'
            }
          }
        });

        addEntry({
          command: '',
          output: "WebContainer loaded successfully! Try commands like 'ls', 'cat README.md', or 'help'.",
          id: Date.now()
        });

        setIsWebContainerReady(true);
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
        addEntry({
          command: '',
          output: "Failed to initialize WebContainer. Falling back to simulated terminal.",
          isError: true,
          id: Date.now()
        });
      }
    };

    initWebContainer();
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

  const addEntry = (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => {
    setEntries(prev => [
      ...prev,
      {
        ...entry,
        id: entry.id || Date.now()
      }
    ]);
  };

  const executeWebContainerCommand = async (command: string) => {
    if (!webContainerInstance || !isWebContainerReady) return;

    try {
      // Special case for clear command
      if (command.trim() === 'clear') {
        setEntries([]);
        return;
      }

      // Handle help command specially
      if (command.trim() === 'help') {
        addEntry({
          command,
          output: `
Available commands:

ls                 - List files in current directory
cd [directory]     - Change directory
cat [file]         - View file contents
mkdir [directory]  - Create a new directory
touch [file]       - Create a new file
rm [file]          - Remove a file
echo [text]        - Print text
echo "text" > file - Write text to file
clear              - Clear terminal
pwd                - Print working directory
help               - Show this help message`,
          id: Date.now()
        });
        return;
      }

      // Handle other commands
      const shellProcess = await webContainerInstance.spawn('sh', []);
      
      // Create a custom writer to handle the output
      const outputChunks: string[] = [];
      const outputWriter = new WritableStream({
        write(chunk) {
          outputChunks.push(chunk);
          addEntry({
            command: '',
            output: chunk,
            id: Date.now()
          });
        }
      });
      
      // Pipe the shell output to our custom writer
      shellProcess.output.pipeTo(outputWriter);

      // Use the input.write method correctly
      await shellProcess.input.write(`${command}\n`);
      
      // Get the exit code
      const exitCode = await shellProcess.exit;

      if (exitCode !== 0 && exitCode !== undefined) {
        addEntry({
          command: '',
          output: `Command exited with code ${exitCode}`,
          isError: true,
          id: Date.now()
        });
      }
    } catch (error) {
      console.error('Error executing command:', error);
      addEntry({
        command: '',
        output: `Error executing command: ${error}`,
        isError: true,
        id: Date.now()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const trimmedCommand = inputValue.trim();
    
    // Add to history
    setCommandHistory(prev => [trimmedCommand, ...prev]);
    
    // Add command to entries
    addEntry({
      command: trimmedCommand,
      output: '',
      id: Date.now()
    });

    // If WebContainer is ready, execute command there
    if (webContainerInstance && isWebContainerReady) {
      await executeWebContainerCommand(trimmedCommand);
    } else {
      // Fall back to simulated terminal
      if (trimmedCommand.toLowerCase() === 'clear') {
        setEntries([]);
      } else {
        // Process using the fallback terminal
        import('@/utils/terminal').then(({ processCommand }) => {
          const result = processCommand(trimmedCommand);
          
          addEntry({
            command: '',
            output: result.output,
            isError: result.isError,
            id: Date.now()
          });
        });
      }
    }
    
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
