
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
  '.zshrc': {
    name: '.zshrc',
    type: 'file',
    content: `# zOS zsh configuration
# Author: Zach Kelling

# Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(git node npm docker kubectl)

# Aliases
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias g="git"
alias gs="git status"
alias gc="git commit"
alias gp="git push"
alias vim="nvim"
alias v="nvim"
alias k="kubectl"
alias d="docker"
alias dc="docker-compose"

# Path
export PATH="$HOME/.local/bin:$HOME/go/bin:$PATH"

# NVM
export NVM_DIR="$HOME/.nvm"

# Starship prompt
eval "$(starship init zsh)"`
  },
  '.vimrc': {
    name: '.vimrc',
    type: 'file',
    content: `" zOS vim configuration
set nocompatible
filetype plugin indent on
syntax on

set number relativenumber
set tabstop=2 shiftwidth=2 expandtab
set autoindent smartindent
set incsearch hlsearch ignorecase smartcase
set cursorline
set termguicolors
set mouse=a

" Leader key
let mapleader = " "

" Plugins (vim-plug)
call plug#begin()
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'preservim/nerdtree'
Plug 'junegunn/fzf.vim'
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'dracula/vim', { 'as': 'dracula' }
call plug#end()

colorscheme dracula`
  },
  '.gitconfig': {
    name: '.gitconfig',
    type: 'file',
    content: `[user]
    name = Zach Kelling
    email = z@hanzo.ai

[core]
    editor = nvim
    autocrlf = input

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate

[pull]
    rebase = true`
  },
  'README.md': {
    name: 'README.md',
    type: 'file',
    content: `# Welcome to zOS

This is Zach Kelling's terminal environment.

## Quick Commands
- \`ll\` - List files (long format)
- \`la\` - List all files
- \`vim <file>\` - Edit file
- \`cat <file>\` - View file
- \`help\` - Show all commands

## Projects
Check out ~/projects for my work.

## Links
- GitHub: github.com/zeekay
- Twitter: @zeekay
- Website: zeekay.ai`
  },
  'projects': {
    name: 'projects',
    type: 'directory',
    children: {
      'hanzo': {
        name: 'hanzo',
        type: 'directory',
        children: {
          'README.md': {
            name: 'README.md',
            type: 'file',
            content: '# Hanzo AI\\n\\nFrontier AI infrastructure and models.\\n\\ngithub.com/hanzoai'
          }
        }
      },
      'lux': {
        name: 'lux',
        type: 'directory',
        children: {
          'README.md': {
            name: 'README.md',
            type: 'file',
            content: '# LUX Network\\n\\nQuantum-safe blockchain.\\n\\ngithub.com/luxfi'
          }
        }
      },
      'zoo': {
        name: 'zoo',
        type: 'directory',
        children: {
          'README.md': {
            name: 'README.md',
            type: 'file',
            content: '# ZOO\\n\\nDecentralized AI research network.\\n\\ngithub.com/zooai'
          }
        }
      },
      'ellipsis': {
        name: 'ellipsis',
        type: 'file',
        content: '# Ellipsis\\n\\n◦◦◦ Package manager for dotfiles.\\n\\ngithub.com/ellipsis/ellipsis'
      }
    }
  },
  '.ssh': {
    name: '.ssh',
    type: 'directory',
    children: {
      'config': {
        name: 'config',
        type: 'file',
        content: `Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

Host *
    AddKeysToAgent yes
    IdentitiesOnly yes`
      }
    }
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
