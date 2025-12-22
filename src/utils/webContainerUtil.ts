
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

    const webContainerInstance = await WebContainer.boot({
      coep: 'credentialless'
    });
    
    await webContainerInstance.mount({
      '.zshrc': {
        file: {
          contents: `# zOS zsh configuration
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
alias vim="nvim"
alias v="nvim"

# Path
export PATH="$HOME/.local/bin:$HOME/go/bin:$PATH"

# Starship prompt
eval "$(starship init zsh)"`
        }
      },
      '.vimrc': {
        file: {
          contents: `" zOS vim configuration
set nocompatible
syntax on
set number relativenumber
set tabstop=2 shiftwidth=2 expandtab
colorscheme dracula`
        }
      },
      '.gitconfig': {
        file: {
          contents: `[user]
    name = Zach Kelling
    email = z@hanzo.ai

[core]
    editor = nvim

[alias]
    st = status
    co = checkout`
        }
      },
      'README.md': {
        file: {
          contents: `# Welcome to zOS

This is Zach Kelling's terminal environment.

## Quick Commands
- ll - List files (long format)
- la - List all files
- vim <file> - Edit file
- cat <file> - View file
- help - Show all commands
- neofetch - System info

## Projects
Check out ~/projects for my work.`
        }
      },
      'projects': {
        directory: {
          'hanzo': {
            directory: {
              'README.md': {
                file: { contents: '# Hanzo AI\n\nFrontier AI infrastructure.\ngithub.com/hanzoai' }
              }
            }
          },
          'lux': {
            directory: {
              'README.md': {
                file: { contents: '# LUX Network\n\nQuantum-safe blockchain.\ngithub.com/luxfi' }
              }
            }
          },
          'zoo': {
            directory: {
              'README.md': {
                file: { contents: '# ZOO\n\nDecentralized AI research.\ngithub.com/zooai' }
              }
            }
          }
        }
      }
    });

    addEntry({
      command: '',
      output: "zsh loaded. Try 'll', 'neofetch', or 'cat .zshrc'",
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
