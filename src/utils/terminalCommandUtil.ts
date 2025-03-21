
import { TerminalEntry } from '@/types/terminal';
import { WebContainer } from '@webcontainer/api';
import { executeWebContainerCommand } from './webContainerUtil';

export const executeHelpCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
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
};

export const processCommand = async (
  command: string,
  webContainerInstance: WebContainer | null,
  isWebContainerReady: boolean,
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  clearEntries: () => void
): Promise<void> => {
  if (!command.trim()) return;

  addEntry({
    command,
    output: '',
    id: Date.now()
  });

  if (command.trim() === 'clear') {
    clearEntries();
    return;
  }

  if (command.trim() === 'help') {
    executeHelpCommand(addEntry, command);
    return;
  }

  if (webContainerInstance && isWebContainerReady) {
    await executeWebContainerCommand(webContainerInstance, command, addEntry);
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
};
