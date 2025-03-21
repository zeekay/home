
// Main terminal processor
import {
  CommandResult,
  getHelp,
  listFiles,
  changeDirectory,
  pwd,
  catFile,
  openEditor,
  makeDirectory,
  touchFile,
  removeFile,
  echo
} from './terminalCommands';
import { resetFileSystem } from './terminalFileSystem';

// Process commands
export const processCommand = (input: string): CommandResult => {
  if (!input.trim()) {
    return { output: '' };
  }
  
  const [command, ...args] = input.trim().split(' ');
  
  switch (command.toLowerCase()) {
    case 'help':
      return getHelp();
    case 'ls':
      return listFiles();
    case 'cd':
      return changeDirectory(args);
    case 'pwd':
      return pwd();
    case 'cat':
      return catFile(args);
    case 'vim':
    case 'vi':
      return openEditor('vim', args);
    case 'nano':
      return openEditor('nano', args);
    case 'mkdir':
      return makeDirectory(args);
    case 'touch':
      return touchFile(args);
    case 'rm':
      return removeFile(args);
    case 'echo':
      return echo(args);
    default:
      return {
        output: `command not found: ${command}`,
        isError: true
      };
  }
};

// Re-export resetFileSystem for use in components
export { resetFileSystem };
export type { CommandResult };
