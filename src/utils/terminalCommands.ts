
// Terminal command handlers
import { 
  getCurrentDir, 
  getFullPath, 
  changeDirectory, 
  makeDirectory, 
  touchFile, 
  removeFile 
} from './terminalFileSystem';

export interface CommandResult {
  output: string;
  isError?: boolean;
}

// List all available commands
export const getHelp = (): CommandResult => {
  return {
    output: `
Available commands:

ls                 - List files in current directory
cd [directory]     - Change directory
cat [file]         - View file contents
vim [file]         - Open file in vim (read-only mockup)
nano [file]        - Open file in nano (read-only mockup)
mkdir [directory]  - Create a new directory
touch [file]       - Create a new file
rm [file]          - Remove a file
clear              - Clear terminal
pwd                - Print working directory
help               - Show this help message
echo [text]        - Print text
`
  };
};

// List files in current directory
export const listFiles = (): CommandResult => {
  const currentDir = getCurrentDir();
  if (Object.keys(currentDir).length === 0) {
    return { output: 'No files found', isError: true };
  }
  
  const directories: string[] = [];
  const files: string[] = [];
  
  Object.values(currentDir).forEach(item => {
    if (item.type === 'directory') {
      directories.push(`\x1b[1;34m${item.name}/\x1b[0m`);
    } else {
      files.push(item.name);
    }
  });
  
  return {
    output: [...directories, ...files].join('\n')
  };
};

// Print working directory
export const pwd = (): CommandResult => {
  return {
    output: getFullPath() || '/'
  };
};

// View file contents
export const catFile = (args: string[]): CommandResult => {
  if (!args[0]) {
    return { output: 'Usage: cat [filename]', isError: true };
  }
  
  const fileName = args[0];
  const currentDir = getCurrentDir();
  
  if (currentDir[fileName] && currentDir[fileName].type === 'file') {
    return {
      output: currentDir[fileName].content || ''
    };
  }
  
  return {
    output: `cat: ${fileName}: No such file`,
    isError: true
  };
};

// Mock vim/nano
export const openEditor = (editor: string, args: string[]): CommandResult => {
  if (!args[0]) {
    return { output: `Usage: ${editor} [filename]`, isError: true };
  }
  
  const fileName = args[0];
  const currentDir = getCurrentDir();
  
  if (currentDir[fileName] && currentDir[fileName].type === 'file') {
    return {
      output: `Opening ${fileName} in ${editor}...\n\n${currentDir[fileName].content || ''}\n\n[${editor} mock - read only mode]`
    };
  }
  
  if (editor === 'vim' || editor === 'nano') {
    return {
      output: `New file: "${fileName}"\n\n[${editor} mock - read only mode]`
    };
  }
  
  return {
    output: `${editor}: ${fileName}: No such file`,
    isError: true
  };
};

// Echo command
export const echo = (args: string[]): CommandResult => {
  return {
    output: args.join(' ')
  };
};

// Export commands for use in terminal.ts
export { changeDirectory, makeDirectory, touchFile, removeFile };
