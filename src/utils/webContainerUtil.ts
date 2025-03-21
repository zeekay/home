
import { WebContainer } from '@webcontainer/api';
import { TerminalEntry } from '@/types/terminal';

export const initializeWebContainer = async (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void
): Promise<WebContainer | null> => {
  try {
    if (typeof WebContainer === 'undefined') {
      addEntry({
        command: '',
        output: "WebContainer is not supported in this environment. Falling back to simulated terminal.",
        isError: true,
        id: Date.now()
      });
      return null;
    }

    const webContainerInstance = await WebContainer.boot();
    
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

    return webContainerInstance;
  } catch (error) {
    console.error('Failed to initialize WebContainer:', error);
    addEntry({
      command: '',
      output: "Failed to initialize WebContainer. Falling back to simulated terminal.",
      isError: true,
      id: Date.now()
    });
    return null;
  }
};

export const executeWebContainerCommand = async (
  webContainerInstance: WebContainer,
  command: string,
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void
): Promise<void> => {
  try {
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
