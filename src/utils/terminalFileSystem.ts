
// File system types and utilities
import { CommandResult } from './terminalCommands';

// File system types
export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemItem>;
}

// Initial file system structure
export const initialFileSystem: Record<string, FileSystemItem> = {
  'README.md': {
    name: 'README.md',
    type: 'file',
    content: `# Zach Kelling
    
Welcome to my terminal!

## Commands to try:
- ls: list files 
- cat [filename]: view file contents
- cd [dir]: change directory
- mkdir [dir]: create directory
- rm [file]: remove file
- clear: clear the terminal
- help: show available commands

Feel free to explore!`
  },
  'projects': {
    name: 'projects',
    type: 'directory',
    children: {
      'awesome-project.txt': {
        name: 'awesome-project.txt',
        type: 'file',
        content: 'This is one of my awesome projects. Check out more at github.com/zeekay'
      }
    }
  },
  'contact.txt': {
    name: 'contact.txt',
    type: 'file',
    content: `Twitter: @zeekay
GitHub: @zeekay
Email: [redacted]`
  },
  'bio.txt': {
    name: 'bio.txt',
    type: 'file',
    content: 'Software engineer with a passion for building elegant solutions to complex problems.'
  }
};

// File system state
let currentPath: string[] = [];
let fileSystem: Record<string, FileSystemItem> = JSON.parse(JSON.stringify(initialFileSystem));

// Get the current directory object based on path
export const getCurrentDir = (): Record<string, FileSystemItem> => {
  let current = fileSystem;
  
  for (const segment of currentPath) {
    if (current[segment] && current[segment].type === 'directory' && current[segment].children) {
      current = current[segment].children!;
    } else {
      return {};
    }
  }
  
  return current;
};

// Get full path string
export const getFullPath = (): string => {
  return '/' + currentPath.join('/');
};

// Reset the file system to initial state
export const resetFileSystem = (): void => {
  fileSystem = JSON.parse(JSON.stringify(initialFileSystem));
  currentPath = [];
};

// Change directory
export const changeDirectory = (args: string[]): CommandResult => {
  if (!args[0]) {
    currentPath = [];
    return { output: '' };
  }
  
  const dir = args[0];
  
  if (dir === '..') {
    if (currentPath.length > 0) {
      currentPath.pop();
      return { output: '' };
    }
    return { output: '' };
  }
  
  const currentDir = getCurrentDir();
  
  if (currentDir[dir] && currentDir[dir].type === 'directory') {
    currentPath.push(dir);
    return { output: '' };
  }
  
  return {
    output: `cd: ${dir}: No such directory`,
    isError: true
  };
};

// Create directory
export const makeDirectory = (args: string[]): CommandResult => {
  if (!args[0]) {
    return { output: 'Usage: mkdir [directory]', isError: true };
  }
  
  const dirName = args[0];
  const currentDir = getCurrentDir();
  
  if (currentDir[dirName]) {
    return {
      output: `mkdir: ${dirName}: File or directory already exists`,
      isError: true
    };
  }
  
  currentDir[dirName] = {
    name: dirName,
    type: 'directory',
    children: {}
  };
  
  return { output: '' };
};

// Create file
export const touchFile = (args: string[]): CommandResult => {
  if (!args[0]) {
    return { output: 'Usage: touch [filename]', isError: true };
  }
  
  const fileName = args[0];
  const currentDir = getCurrentDir();
  
  if (currentDir[fileName]) {
    return { output: '' }; // touch updates timestamp, but we'll just do nothing
  }
  
  currentDir[fileName] = {
    name: fileName,
    type: 'file',
    content: ''
  };
  
  return { output: '' };
};

// Remove file
export const removeFile = (args: string[]): CommandResult => {
  if (!args[0]) {
    return { output: 'Usage: rm [file]', isError: true };
  }
  
  const fileName = args[0];
  const currentDir = getCurrentDir();
  
  if (!currentDir[fileName]) {
    return {
      output: `rm: ${fileName}: No such file or directory`,
      isError: true
    };
  }
  
  delete currentDir[fileName];
  return { output: '' };
};
