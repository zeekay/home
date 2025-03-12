
interface CommandResult {
  output: string;
  isError?: boolean;
}

// Mock file system
interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemItem>;
}

// Initial file system structure
const initialFileSystem: Record<string, FileSystemItem> = {
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

let currentPath: string[] = [];
let fileSystem: Record<string, FileSystemItem> = JSON.parse(JSON.stringify(initialFileSystem));

// Get the current directory object based on path
const getCurrentDir = (): Record<string, FileSystemItem> => {
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
const getFullPath = (): string => {
  return '/' + currentPath.join('/');
};

// List all available commands
const getHelp = (): CommandResult => {
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
const listFiles = (): CommandResult => {
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

// Change directory
const changeDirectory = (args: string[]): CommandResult => {
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

// Print working directory
const pwd = (): CommandResult => {
  return {
    output: getFullPath() || '/'
  };
};

// View file contents
const catFile = (args: string[]): CommandResult => {
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
const openEditor = (editor: string, args: string[]): CommandResult => {
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

// Create directory
const makeDirectory = (args: string[]): CommandResult => {
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
const touchFile = (args: string[]): CommandResult => {
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
const removeFile = (args: string[]): CommandResult => {
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

// Echo command
const echo = (args: string[]): CommandResult => {
  return {
    output: args.join(' ')
  };
};

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

// Reset the file system to initial state
export const resetFileSystem = (): void => {
  fileSystem = JSON.parse(JSON.stringify(initialFileSystem));
  currentPath = [];
};
