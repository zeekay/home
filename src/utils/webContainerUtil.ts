
import { WebContainer } from '@webcontainer/api';
import { TerminalEntry } from '@/types/terminal';
import { logger } from '@/lib/logger';

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
    logger.error('Failed to initialize WebContainer:', error);
    addEntry({
      command: '',
      output: "Failed to initialize WebContainer. Falling back to simulated terminal.",
      isError: true,
      id: Date.now()
    });
    return null;
  }
};

// Clean WebContainer output - remove shell echoes, prompts, and ANSI codes
const cleanWebContainerOutput = (output: string, command: string): string => {
  // Use string construction for ANSI escape sequences to avoid ESLint control-regex warnings
  const ESC = '\x1b';
  const BEL = '\x07';
  const ansiCsi = new RegExp(ESC + '\\[[0-9;?]*[a-zA-Z]', 'g');
  const ansiOsc = new RegExp(ESC + '\\][^' + BEL + ESC + ']*(?:' + BEL + '|' + ESC + '\\\\)', 'g');
  const ansiDcs = new RegExp(ESC + '[PX^_][^' + ESC + ']*' + ESC + '\\\\', 'g');
  const ansiSingle = new RegExp(ESC + '[@-Z\\\\-_]', 'g');
  // Control characters: NUL-BS, VT, FF, SO-US, DEL (excluding TAB, LF, CR)
  const controlChars = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(8) + 
    String.fromCharCode(11) + String.fromCharCode(12) + 
    String.fromCharCode(14) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']', 'g');
  
  return output
    // Remove ANSI escape codes
    .replace(ansiCsi, '')
    .replace(ansiOsc, '')
    .replace(ansiDcs, '')
    .replace(ansiSingle, '')
    // Remove shell prompt patterns
    .replace(/^.*?[$#>]\s*/gm, '')
    // Remove command echo (the command itself being echoed back)
    .replace(new RegExp(`^${command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm'), '')
    // Remove WebContainer temp paths that look like ~/random-string
    .replace(/~\/[a-z0-9]{20,}[^\s]*/g, '')
    // Remove leftover control characters
    .replace(controlChars, '')
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
};

export const executeWebContainerCommand = async (
  webContainerInstance: WebContainer,
  command: string,
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  originalCommand?: string
): Promise<void> => {
  try {
    // Use -c flag to run command directly without interactive shell
    const shellProcess = await webContainerInstance.spawn('sh', ['-c', command]);

    const outputChunks: string[] = [];
    
    // Read all output into buffer
    const reader = shellProcess.output.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        outputChunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const exitCode = await shellProcess.exit;
    
    // Combine and clean all output
    const rawOutput = outputChunks.join('');
    const cleanedOutput = cleanWebContainerOutput(rawOutput, command);

    if (cleanedOutput) {
      addEntry({
        command: originalCommand || '',
        output: cleanedOutput,
        isError: exitCode !== 0,
        id: Date.now()
      });
    } else if (originalCommand) {
      // No output but we have a command - still show the command was executed
      addEntry({
        command: originalCommand,
        output: '',
        id: Date.now()
      });
    }

    if (exitCode !== 0 && exitCode !== undefined && !cleanedOutput) {
      addEntry({
        command: originalCommand || '',
        output: `Command exited with code ${exitCode}`,
        isError: true,
        id: Date.now()
      });
    }
  } catch (error) {
    logger.error('Error executing command:', error);
    addEntry({
      command: originalCommand || '',
      output: `Error executing command: ${error}`,
      isError: true,
      id: Date.now()
    });
  }
};
