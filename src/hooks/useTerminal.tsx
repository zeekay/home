
import { useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { TerminalEntry } from '@/types/terminal';

export function useTerminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { 
      command: '', 
      output: "Welcome to Zach's Terminal! Type 'help' for available commands or wait for WebContainer to load...", 
      id: 0 
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [webContainerInstance, setWebContainerInstance] = useState<WebContainer | null>(null);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);

  const addEntry = useCallback((entry: Omit<TerminalEntry, 'id'> & { id?: number }) => {
    setEntries(prev => [
      ...prev,
      {
        ...entry,
        id: entry.id || Date.now()
      }
    ]);
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  useEffect(() => {
    const initWebContainer = async () => {
      try {
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
  }, [addEntry]);

  const executeWebContainerCommand = async (command: string): Promise<void> => {
    if (!webContainerInstance || !isWebContainerReady) return;

    try {
      if (command.trim() === 'clear') {
        clearEntries();
        return;
      }

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

      const shellProcess = await webContainerInstance.spawn('sh', []);
      
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
      
      shellProcess.output.pipeTo(outputWriter);

      await shellProcess.input.getWriter().write(`${command}\n`);
      
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

  const executeCommand = async (command: string): Promise<void> => {
    if (!command.trim()) return;

    if (webContainerInstance && isWebContainerReady) {
      await executeWebContainerCommand(command);
    } else {
      if (command.toLowerCase() === 'clear') {
        clearEntries();
      } else {
        const { processCommand } = await import('@/utils/terminal');
        const result = processCommand(command);
        
        addEntry({
          command: '',
          output: result.output,
          isError: result.isError,
          id: Date.now()
        });
      }
    }
  };

  return {
    entries,
    addEntry,
    executeCommand,
    webContainerInstance,
    isWebContainerReady,
    commandHistory,
    setCommandHistory,
    clearEntries
  };
}
