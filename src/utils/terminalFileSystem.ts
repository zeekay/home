
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
# github.com/zeekay/dot-zsh
# Managed by ellipsis: github.com/zeekay/ellipsis

# Ellipsis
export ELLIPSIS_PATH="$HOME/.ellipsis"
export PATH="$ELLIPSIS_PATH/bin:$PATH"

# Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(git node npm docker kubectl z fzf)

# Aliases
alias ll="ls -la"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias g="git"
alias gs="git status"
alias gc="git commit"
alias gp="git push"
alias gpl="git pull"
alias gco="git checkout"
alias gd="git diff"
alias gl="git log --oneline --graph"
alias vim="nvim"
alias v="nvim"
alias vi="nvim"
alias nano="nvim"
alias pico="nvim"
alias k="kubectl"
alias d="docker"
alias dc="docker-compose"
alias py="python3"
alias pip="pip3"
alias n="node"
alias nr="npm run"
alias ni="npm install"
alias c="code"
alias e="$EDITOR"
alias cls="clear"

# Path
export PATH="$HOME/.local/bin:$HOME/go/bin:$HOME/.cargo/bin:$PATH"

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Starship prompt
eval "$(starship init zsh)"

# FZF
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# Welcome
echo "Welcome back, Z. Type 'help' for commands."`
  },
  '.vimrc': {
    name: '.vimrc',
    type: 'file',
    content: `" zOS vim configuration
" github.com/zeekay/dot-vim
" Managed by vice: github.com/zeekay/vice

set nocompatible
filetype indent plugin on | syntax on

let options = {
    \\ 'addons': [
        \\ 'github:zeekay/vice-colorful',
        \\ 'github:zeekay/vice-ctrlp',
        \\ 'github:zeekay/vice-delimitmate',
        \\ 'github:zeekay/vice-git',
        \\ 'github:zeekay/vice-markdown',
        \\ 'github:zeekay/vice-polyglot',
        \\ 'github:zeekay/vice-complete',
        \\ 'github:zeekay/vice-standard-issue',
        \\ 'github:zeekay/vice-nerdtree',
        \\ 'github:zeekay/vice-lightline',
        \\ 'github:tpope/vim-vinegar',
        \\ 'github:godlygeek/tabular',
    \\ ],
\\ }

set number relativenumber
set tabstop=2 shiftwidth=2 expandtab
set autoindent smartindent
set incsearch hlsearch ignorecase smartcase
set cursorline
set termguicolors
set mouse=a
set background=dark

let mapleader = " "

call vice#Initialize(options)

colorscheme muon`
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
    pager = delta

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk

[pull]
    rebase = true

[init]
    defaultBranch = main

[delta]
    navigate = true
    side-by-side = true

[merge]
    conflictstyle = diff3`
  },
  '.inputrc': {
    name: '.inputrc',
    type: 'file',
    content: `# Readline configuration
set editing-mode vi
set keymap vi
set show-mode-in-prompt on
set vi-ins-mode-string \\1\\e[6 q\\2
set vi-cmd-mode-string \\1\\e[2 q\\2

# Case insensitive completion
set completion-ignore-case on
set show-all-if-ambiguous on

# History
set history-preserve-point on`
  },
  '.tmux.conf': {
    name: '.tmux.conf',
    type: 'file',
    content: `# tmux configuration
set -g prefix C-a
unbind C-b
bind C-a send-prefix

set -g mouse on
set -g history-limit 10000
set -g default-terminal "screen-256color"
set -ga terminal-overrides ",*256col*:Tc"

# Vi mode
setw -g mode-keys vi

# Status bar
set -g status-style bg=default,fg=white
set -g status-left "#[fg=cyan]#S "
set -g status-right "#[fg=yellow]%H:%M"`
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
- \`node <file>\` - Run JavaScript
- \`help\` - Show all commands
- \`neofetch\` - System info

## Projects
Check out ~/projects for my work.
Check out ~/Documents for GitHub links.

## Dotfiles
Managed by ellipsis: https://ellipsis.sh

## Links
- GitHub: github.com/zeekay
- Twitter: @zeekay
- Website: zeekay.ai`
  },
  'Documents': {
    name: 'Documents',
    type: 'directory',
    children: {
      'README.md': {
        name: 'README.md',
        type: 'file',
        content: `# GitHub Projects

Links to my open source projects.
Use 'cat <file>' to view project info.

## Categories
- dotfiles/ - Shell, vim, and editor configs
- tools/ - Developer tools and CLIs
- web/ - Web frameworks and libraries
- misc/ - Other projects
- hanzo/ - Hanzo AI infrastructure
- lux/ - LUX blockchain platform
- zoo/ - Zoo Labs Foundation`
      },
      'dotfiles': {
        name: 'dotfiles',
        type: 'directory',
        children: {
          'ellipsis.md': {
            name: 'ellipsis.md',
            type: 'file',
            content: `# Ellipsis
◦◦◦ Package manager for dotfiles.

GitHub: https://github.com/zeekay/ellipsis
Docs: https://ellipsis.sh

Install: curl -sL ellipsis.sh | sh

Features:
- Plugin-based dotfiles management
- Easy installation and updates
- Cross-platform support`
          },
          'dot-zsh.md': {
            name: 'dot-zsh.md',
            type: 'file',
            content: `# dot-zsh
🐚 My zsh configuration

GitHub: https://github.com/zeekay/dot-zsh

Install: ellipsis install zeekay/dot-zsh

Features:
- Starship prompt
- FZF integration
- Git aliases`
          },
          'dot-vim.md': {
            name: 'dot-vim.md',
            type: 'file',
            content: `# dot-vim
💉 My vim/neovim configuration

GitHub: https://github.com/zeekay/dot-vim
Vice: https://github.com/zeekay/vice

Install: ellipsis install zeekay/dot-vim

Features:
- Vice plugin framework
- Muon colorscheme
- Language support`
          },
          'zeesh.md': {
            name: 'zeesh.md',
            type: 'file',
            content: `# Zeesh
🐚 Putting the zee in your shell.

GitHub: https://github.com/zeekay/zeesh

A plugin-based framework for Zsh.

Features:
- Modular plugin system
- Fast startup time
- Easy customization`
          }
        }
      },
      'tools': {
        name: 'tools',
        type: 'directory',
        children: {
          'handroll.md': {
            name: 'handroll.md',
            type: 'file',
            content: `# Handroll
🍣 Expertly rolled JavaScript

GitHub: https://github.com/zeekay/handroll

CLI + library for bundling JavaScript with Rollup.js

Install: npm install -g handroll

Features:
- Zero config bundling
- TypeScript support
- Tree shaking`
          },
          'executive.md': {
            name: 'executive.md',
            type: 'file',
            content: `# Executive
🕴 Elegant command execution for Node.

GitHub: https://github.com/zeekay/executive

Install: npm install executive

Features:
- Promise-based API
- Streaming output
- Shell interpolation`
          },
          'bebop.md': {
            name: 'bebop.md',
            type: 'file',
            content: `# Bebop
🎷 Jazzy build tool for front-end development.

GitHub: https://github.com/zeekay/bebop

Features:
- Live reload
- Asset compilation
- Plugin system`
          },
          'vice.md': {
            name: 'vice.md',
            type: 'file',
            content: `# Vice
💉 My favorite vice and a vim hacking gateway drug.

GitHub: https://github.com/zeekay/vice

Vim plugin manager and framework.

Features:
- Lazy loading
- Dependency management
- Easy configuration`
          },
          'soundcloud-cli.md': {
            name: 'soundcloud-cli.md',
            type: 'file',
            content: `# SoundCloud CLI
🎵 Soundcloud command-line interface.

GitHub: https://github.com/zeekay/soundcloud-cli

Control SoundCloud from your terminal.

Features:
- Stream music
- Download tracks
- Playlist management`
          }
        }
      },
      'web': {
        name: 'web',
        type: 'directory',
        children: {
          'flask-uwsgi-websocket.md': {
            name: 'flask-uwsgi-websocket.md',
            type: 'file',
            content: `# Flask-uWSGI-WebSocket
🔌 High-performance WebSockets for Flask

GitHub: https://github.com/zeekay/flask-uwsgi-websocket

Install: pip install flask-uwsgi-websocket

Features:
- uWSGI native WebSocket support
- Async handling
- Real-time communication`
          },
          'bottle-websocket.md': {
            name: 'bottle-websocket.md',
            type: 'file',
            content: `# Bottle-WebSocket
🍾 Easy websockets for Bottle.

GitHub: https://github.com/zeekay/bottle-websocket

Install: pip install bottle-websocket

Simple WebSocket plugin for Bottle.`
          },
          'requisite.md': {
            name: 'requisite.md',
            type: 'file',
            content: `# Requisite
🕸️ CommonJS bundler with compilation and reload.

GitHub: https://github.com/zeekay/requisite

Features:
- Automatic compilation
- Browser reload
- Source maps`
          }
        }
      },
      'misc': {
        name: 'misc',
        type: 'directory',
        children: {
          'decorum.md': {
            name: 'decorum.md',
            type: 'file',
            content: `# Decorum
Python decorator helper library.

GitHub: https://github.com/zeekay/decorum

Install: pip install decorum

Make writing decorators easier.`
          },
          'postmortem.md': {
            name: 'postmortem.md',
            type: 'file',
            content: `# Postmortem
💀 When code dies, it deserves a proper autopsy.

GitHub: https://github.com/zeekay/postmortem

Stacktrace library with source maps support.`
          },
          'rocksteady.md': {
            name: 'rocksteady.md',
            type: 'file',
            content: `# Rocksteady
⚡ Drink blazin' electric death, downtime!

GitHub: https://github.com/zeekay/rocksteady

Fast, zero-downtime apps for production.`
          }
        }
      },
      'hanzo': {
        name: 'hanzo',
        type: 'directory',
        children: {
          'README.md': {
            name: 'README.md',
            type: 'file',
            content: `# Hanzo AI
🤖 Frontier AI infrastructure & foundational models
Techstars '17

GitHub: https://github.com/hanzoai
Website: https://hanzo.ai

Focus: LLMs, MCP, AI blockchain (ACI), Agent frameworks`
          },
          'mcp.md': {
            name: 'mcp.md',
            type: 'file',
            content: `# hanzo-mcp
🔌 Model Context Protocol server

GitHub: https://github.com/hanzoai/mcp

Full-featured MCP server with:
- File operations & search
- Shell execution
- Memory & knowledge bases
- Multi-agent orchestration`
          },
          'ui.md': {
            name: 'ui.md',
            type: 'file',
            content: `# @hanzo/ui
💎 React component library

GitHub: https://github.com/hanzoai/ui

Install: npm install @hanzo/ui

Features:
- Radix UI primitives
- Tailwind CSS styling
- Dark mode support
- Accessible components`
          },
          'python-sdk.md': {
            name: 'python-sdk.md',
            type: 'file',
            content: `# hanzo-python
🐍 Python SDK for Hanzo AI

GitHub: https://github.com/hanzoai/python-sdk

Install: pip install hanzo-ai

Features:
- LLM API access
- Agent orchestration
- Streaming responses`
          },
          'code.md': {
            name: 'code.md',
            type: 'file',
            content: `# hanzo-code
⌨️ AI-powered code editor

GitHub: https://github.com/hanzoai/code

VS Code extension with:
- Code completion
- Inline suggestions
- Chat interface
- Multi-file editing`
          },
          'overlord.md': {
            name: 'overlord.md',
            type: 'file',
            content: `# Overlord
👁️ AI agent orchestration system

GitHub: https://github.com/hanzoai/overlord

Multi-agent coordination with:
- Task planning
- Tool use
- Memory systems
- Parallel execution`
          },
          'solidity.md': {
            name: 'solidity.md',
            type: 'file',
            content: `# @hanzo/solidity
📜 Smart contract library

GitHub: https://github.com/hanzoai/solidity

EVM contracts for:
- Token standards (ERC20/721/1155)
- DeFi primitives
- Governance
- Access control`
          },
          'shop-js.md': {
            name: 'shop-js.md',
            type: 'file',
            content: `# @hanzo/shop.js
🛒 E-commerce SDK

GitHub: https://github.com/hanzoai/shop-js

Headless commerce with:
- Product management
- Cart & checkout
- Payment processing
- Subscription support`
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
            content: `# LUX Network
⚡ Quantum-safe blockchain platform

GitHub: https://github.com/luxfi
Website: https://lux.network

Focus: Post-quantum crypto, multi-consensus, cross-chain`
          },
          'node.md': {
            name: 'node.md',
            type: 'file',
            content: `# lux/node
🔗 Core blockchain node

GitHub: https://github.com/luxfi/node

Go implementation with:
- Multi-consensus
- Virtual machines (AVM, PlatformVM, CoreVM)
- P2P networking
- RPC & REST APIs`
          },
          'cli.md': {
            name: 'cli.md',
            type: 'file',
            content: `# lux/cli
⌨️ Command line interface

GitHub: https://github.com/luxfi/cli

Network operations:
- Node management
- Wallet operations
- Transaction building
- Network monitoring`
          },
          'sdk.md': {
            name: 'sdk.md',
            type: 'file',
            content: `# lux/sdk
🔧 Developer SDK

GitHub: https://github.com/luxfi/sdk

Multi-language support:
- Go, TypeScript, Python
- Transaction building
- Wallet integration
- RPC clients`
          },
          'wallet.md': {
            name: 'wallet.md',
            type: 'file',
            content: `# lux/wallet
💰 Multi-chain wallet

GitHub: https://github.com/luxfi/wallet

Features:
- HD key derivation
- Multi-chain support
- Hardware wallet integration
- Browser extension`
          },
          'netrunner.md': {
            name: 'netrunner.md',
            type: 'file',
            content: `# lux/netrunner
🏃 Network testing tool

GitHub: https://github.com/luxfi/netrunner

Capabilities:
- Network simulation
- Performance testing
- Consensus testing
- Load generation`
          },
          'bridge.md': {
            name: 'bridge.md',
            type: 'file',
            content: `# lux/bridge
🌉 Cross-chain bridge

GitHub: https://github.com/luxfi/bridge

Cross-chain transfers:
- EVM compatibility
- Asset bridging
- Message passing
- Trustless verification`
          },
          'market.md': {
            name: 'market.md',
            type: 'file',
            content: `# lux/market
📊 DEX & trading

GitHub: https://github.com/luxfi/market

Features:
- Order book DEX
- AMM pools
- Liquidity mining
- Analytics`
          },
          'lattice.md': {
            name: 'lattice.md',
            type: 'file',
            content: `# lux/lattice
🔐 Post-quantum cryptography

GitHub: https://github.com/luxfi/lattice

Implementations:
- Lattice-based signatures
- Key encapsulation
- Zero-knowledge proofs
- Quantum-safe algorithms`
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
            content: `# Zoo Labs Foundation
🦁 Decentralized AI research network

GitHub: https://github.com/zooai
Website: https://zoo.ngo
ZIPs: https://zips.zoo.ngo

Focus: DeAI, DeSci, community governance`
          },
          'zips.md': {
            name: 'zips.md',
            type: 'file',
            content: `# Zoo Improvement Proposals
📋 Governance & proposals

Website: https://zips.zoo.ngo
GitHub: https://github.com/zooai/zips

Community-driven proposals for:
- Protocol upgrades
- Research direction
- Treasury allocation
- Ecosystem development`
          },
          'papers.md': {
            name: 'papers.md',
            type: 'file',
            content: `# zoo/papers
📄 Research publications

GitHub: https://github.com/zooai/papers

DeSci research on:
- Decentralized AI
- Federated learning
- Model verification
- AI alignment`
          },
          'node.md': {
            name: 'node.md',
            type: 'file',
            content: `# zoo/node
🖥️ Zoo network node

GitHub: https://github.com/zooai/node

Decentralized compute:
- Model hosting
- Inference network
- Proof of inference
- Resource allocation`
          },
          'gym.md': {
            name: 'gym.md',
            type: 'file',
            content: `# zoo/gym
🏋️ AI training environment

GitHub: https://github.com/zooai/gym

Training infrastructure:
- Distributed training
- Dataset management
- Experiment tracking
- Model registry`
          },
          'genesis.md': {
            name: 'genesis.md',
            type: 'file',
            content: `# zoo/genesis
🌱 Network bootstrapping

GitHub: https://github.com/zooai/genesis

Genesis configuration:
- Initial validators
- Token distribution
- Protocol parameters
- Network launch`
          }
        }
      }
    }
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
            content: `# Hanzo AI

Frontier AI infrastructure and models.
Techstars '17

GitHub: https://github.com/hanzoai
Website: https://hanzo.ai

Projects:
- hanzo-mcp - Model Context Protocol
- @hanzo/ui - React component library
- Jin - Multimodal AI architecture
- ACI - AI Chain Infrastructure`
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
            content: `# LUX Network

Quantum-safe blockchain platform.

GitHub: https://github.com/luxfi
Website: https://lux.network

Projects:
- node - Core blockchain node
- wallet - Multi-chain wallet
- cli - Command line interface
- sdk - Developer SDK`
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
            content: `# Zoo Labs Foundation

Decentralized AI research network.

GitHub: https://github.com/zooai
Website: https://zoo.ngo
ZIPs: https://zips.zoo.ngo

Focus:
- DeAI - Decentralized AI
- DeSci - Decentralized Science
- Community governance`
          }
        }
      }
    }
  },
  '.ellipsis': {
    name: '.ellipsis',
    type: 'directory',
    children: {
      'packages': {
        name: 'packages',
        type: 'directory',
        children: {
          'zeekay': {
            name: 'zeekay',
            type: 'directory',
            children: {
              'dot-zsh': {
                name: 'dot-zsh',
                type: 'file',
                content: '→ github.com/zeekay/dot-zsh'
              },
              'dot-vim': {
                name: 'dot-vim',
                type: 'file',
                content: '→ github.com/zeekay/dot-vim'
              },
              'dot-git': {
                name: 'dot-git',
                type: 'file',
                content: '→ github.com/zeekay/dot-git'
              },
              'dot-tmux': {
                name: 'dot-tmux',
                type: 'file',
                content: '→ github.com/zeekay/dot-tmux'
              }
            }
          }
        }
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
  },
  'bin': {
    name: 'bin',
    type: 'directory',
    children: {
      'README.md': {
        name: 'README.md',
        type: 'file',
        content: 'Local scripts and binaries'
      }
    }
  },
  'hello.js': {
    name: 'hello.js',
    type: 'file',
    content: `// Example Node.js file
console.log('Hello from zOS!');
console.log('Node version:', process.version);

const greet = (name) => {
  return \`Welcome, \${name}!\`;
};

console.log(greet('Z'));`
  },
  'hello.ts': {
    name: 'hello.ts',
    type: 'file',
    content: `// Example TypeScript file
interface User {
  name: string;
  email: string;
}

const user: User = {
  name: 'Zach Kelling',
  email: 'z@hanzo.ai'
};

console.log(\`Hello, \${user.name}!\`);`
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

// Update or create file content
export const updateFileContent = (fileName: string, content: string): void => {
  const currentDir = getCurrentDir();

  if (currentDir[fileName]) {
    // Update existing file
    currentDir[fileName].content = content;
  } else {
    // Create new file
    currentDir[fileName] = {
      name: fileName,
      type: 'file',
      content,
    };
  }
};

// Get file content for editing
export const getFileForEditing = (fileName: string): { content: string; isNewFile: boolean } | null => {
  const currentDir = getCurrentDir();

  if (currentDir[fileName]) {
    if (currentDir[fileName].type === 'directory') {
      return null; // Can't edit directories
    }
    return {
      content: currentDir[fileName].content || '',
      isNewFile: false,
    };
  }

  // New file
  return {
    content: '',
    isNewFile: true,
  };
};

// Change directory
export const changeDirectory = (args: string[]): CommandResult => {
  if (!args[0]) {
    currentPath = [];
    return { output: '' };
  }

  const dir = args[0];

  if (dir === '~' || dir === '/') {
    currentPath = [];
    return { output: '' };
  }

  if (dir === '..') {
    if (currentPath.length > 0) {
      currentPath.pop();
      return { output: '' };
    }
    return { output: '' };
  }

  if (dir === '-') {
    // Go back to previous directory (simplified)
    return { output: '' };
  }

  // Handle paths like ~/Documents or /projects
  if (dir.startsWith('~/') || dir.startsWith('/')) {
    const parts = dir.replace('~/', '').replace('/', '').split('/');
    currentPath = [];
    for (const part of parts) {
      if (part) {
        const currentDir = getCurrentDir();
        if (currentDir[part] && currentDir[part].type === 'directory') {
          currentPath.push(part);
        } else {
          return {
            output: `cd: ${dir}: No such directory`,
            isError: true
          };
        }
      }
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

// Write content to file
export const writeFile = (fileName: string, content: string): CommandResult => {
  const currentDir = getCurrentDir();

  currentDir[fileName] = {
    name: fileName,
    type: 'file',
    content: content
  };

  return { output: '' };
};

// Read file content
export const readFile = (fileName: string): string | null => {
  const currentDir = getCurrentDir();
  const file = currentDir[fileName];

  if (file && file.type === 'file') {
    return file.content || '';
  }

  // Check if it's a path
  if (fileName.startsWith('/') || fileName.startsWith('~/')) {
    const parts = fileName.replace('~/', '').replace('/', '').split('/');
    let current = fileSystem;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] && current[parts[i]].type === 'directory') {
        current = current[parts[i]].children!;
      } else {
        return null;
      }
    }
    const finalFile = current[parts[parts.length - 1]];
    if (finalFile && finalFile.type === 'file') {
      return finalFile.content || '';
    }
  }

  return null;
};

// Copy file
export const copyFile = (source: string, dest: string): CommandResult => {
  const currentDir = getCurrentDir();
  const sourceFile = currentDir[source];

  if (!sourceFile) {
    return { output: `cp: ${source}: No such file or directory`, isError: true };
  }

  if (sourceFile.type === 'directory') {
    return { output: `cp: ${source}: Is a directory (use -r)`, isError: true };
  }

  currentDir[dest] = {
    name: dest,
    type: 'file',
    content: sourceFile.content || ''
  };

  return { output: '' };
};

// Move/rename file
export const moveFile = (source: string, dest: string): CommandResult => {
  const currentDir = getCurrentDir();
  const sourceFile = currentDir[source];

  if (!sourceFile) {
    return { output: `mv: ${source}: No such file or directory`, isError: true };
  }

  currentDir[dest] = {
    ...sourceFile,
    name: dest
  };
  delete currentDir[source];

  return { output: '' };
};

// Grep - search for pattern in files
export const grepFile = (pattern: string, fileName: string): { matches: string[]; lineNumbers: number[] } | null => {
  const content = readFile(fileName);
  if (content === null) return null;

  const lines = content.split('\n');
  const matches: string[] = [];
  const lineNumbers: number[] = [];

  try {
    const regex = new RegExp(pattern, 'gi');
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        matches.push(line);
        lineNumbers.push(index + 1);
      }
    });
  } catch {
    // If regex fails, do literal search
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(pattern.toLowerCase())) {
        matches.push(line);
        lineNumbers.push(index + 1);
      }
    });
  }

  return { matches, lineNumbers };
};

// Get head of file (first n lines)
export const headFile = (fileName: string, lines: number = 10): string | null => {
  const content = readFile(fileName);
  if (content === null) return null;
  return content.split('\n').slice(0, lines).join('\n');
};

// Get tail of file (last n lines)
export const tailFile = (fileName: string, lines: number = 10): string | null => {
  const content = readFile(fileName);
  if (content === null) return null;
  const allLines = content.split('\n');
  return allLines.slice(-lines).join('\n');
};

// Word count
export const wcFile = (fileName: string): { lines: number; words: number; chars: number } | null => {
  const content = readFile(fileName);
  if (content === null) return null;

  const lines = content.split('\n').length;
  const words = content.split(/\s+/).filter(w => w.length > 0).length;
  const chars = content.length;

  return { lines, words, chars };
};
