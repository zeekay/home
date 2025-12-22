
import { TerminalEntry } from '@/types/terminal';
import { WebContainer } from '@webcontainer/api';
import { executeWebContainerCommand } from './webContainerUtil';

// Alias mappings (like .zshrc aliases)
const aliases: Record<string, string> = {
  'll': 'ls -la',
  'la': 'ls -a',
  'l': 'ls',
  '..': 'cd ..',
  '...': 'cd ../..',
  'g': 'git',
  'gs': 'git status',
  'v': 'vim',
  'nvim': 'vim',
};

export const executeHelpCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `zOS Terminal - Available Commands

Navigation:
  ls, ll, la         List files (-a shows hidden, -l long format)
  cd [dir]           Change directory (.. to go up)
  pwd                Print working directory

File Operations:
  cat [file]         View file contents
  vim [file]         Open file in vim (simulated)
  touch [file]       Create empty file
  mkdir [dir]        Create directory
  rm [file]          Remove file
  echo [text]        Print text (> file to write)

System:
  clear              Clear terminal
  history            Command history
  whoami             Current user
  uname              System info
  neofetch           System summary

Aliases (from .zshrc):
  ll → ls -la    la → ls -a    .. → cd ..
  g → git        gs → git status    v → vim

Theme:
  theme [name]       Change theme (dracula, nord, matrix, monokai...)

Type 'cat .zshrc' to see your shell configuration.`,
    id: Date.now()
  });
};

export const executeVimCommand = (
  args: string[],
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  const file = args[0];

  if (!file) {
    addEntry({
      command,
      output: `vim: Neovim v0.9.5
Usage: vim [file]

In zOS, vim displays file contents.
For full editing, use: echo "content" > file`,
      id: Date.now()
    });
    return;
  }

  // This will be handled by the simulated file system
  // Just show a vim-style header
  addEntry({
    command,
    output: `Opening ${file} in vim... (simulated - showing contents)`,
    id: Date.now()
  });
};

export const executeNeofetch = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `
       ████████████           z@zOS
     ██            ██         ──────────────────
    ██   ██    ██   ██        OS: zOS 4.2.0
   ██                 ██      Host: zeekay.ai
   ██   Z   A   C   H ██      Kernel: WebContainer
   ██                 ██      Shell: zsh 5.9
    ██   ██    ██   ██        Terminal: zOS Terminal
     ██            ██         Theme: Dracula
       ████████████
                              Packages: hanzo, lux, zoo
   █▀▀▀▀▀█ █▀▀▀▀▀█           GitHub: @zeekay
   █     █ █     █           Twitter: @zeekay
   █▀▀▀▀▀█ █▀▀▀▀▀█
                              © 1983-2025 Zach Kelling`,
    id: Date.now()
  });
};

export const resolveAlias = (command: string): string => {
  const parts = command.trim().split(' ');
  const cmd = parts[0];
  const rest = parts.slice(1).join(' ');

  if (aliases[cmd]) {
    return rest ? `${aliases[cmd]} ${rest}` : aliases[cmd];
  }
  return command;
};

export const executeHistoryCommand = (
  commandHistory: string[],
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  const historyOutput = commandHistory.length > 0
    ? commandHistory.map((cmd, index) => `${(commandHistory.length - index).toString().padStart(4)}: ${cmd}`).join('\n')
    : 'No command history available';

  addEntry({
    command,
    output: historyOutput,
    id: Date.now()
  });
};

export const executeThemeCommand = (
  args: string[],
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  const validThemes = [
    'dark', 'light', 'blue', 'green', 'purple', 'neon', 'retro', 
    'sunset', 'ocean', 'midnight', 'matrix', 'monokai', 'dracula', 'nord', 'pastel'
  ];
  
  const theme = args[0];
  
  if (!theme) {
    addEntry({
      command,
      output: `Current available themes: ${validThemes.join(', ')}`,
      id: Date.now()
    });
    return;
  }
  
  if (!validThemes.includes(theme)) {
    addEntry({
      command,
      output: `Error: Unknown theme '${theme}'. Available themes: ${validThemes.join(', ')}`,
      isError: true,
      id: Date.now()
    });
    return;
  }
  
  // In a real implementation, this would set the theme
  // For now we'll just show a message
  addEntry({
    command,
    output: `Theme changed to '${theme}'. Note: This is just a simulation. Use the settings gear in the window title bar to actually change the theme.`,
    id: Date.now()
  });
};

export const processCommand = async (
  command: string,
  webContainerInstance: WebContainer | null,
  isWebContainerReady: boolean,
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  clearEntries: () => void,
  commandHistory: string[] = []
): Promise<void> => {
  if (!command.trim()) return;

  // Resolve aliases first
  const resolvedCommand = resolveAlias(command.trim());
  const parts = resolvedCommand.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  addEntry({
    command,
    output: '',
    id: Date.now()
  });

  // Built-in commands
  if (cmd === 'clear') {
    clearEntries();
    return;
  }

  if (cmd === 'help') {
    executeHelpCommand(addEntry, command);
    return;
  }

  if (cmd === 'history') {
    executeHistoryCommand(commandHistory, addEntry, command);
    return;
  }

  if (cmd === 'neofetch') {
    executeNeofetch(addEntry, command);
    return;
  }

  if (cmd === 'whoami') {
    addEntry({ command: '', output: 'z', id: Date.now() });
    return;
  }

  if (cmd === 'uname') {
    const flag = args[0];
    if (flag === '-a') {
      addEntry({ command: '', output: 'zOS 4.2.0 WebContainer aarch64', id: Date.now() });
    } else {
      addEntry({ command: '', output: 'zOS', id: Date.now() });
    }
    return;
  }

  if (cmd === 'hostname') {
    addEntry({ command: '', output: 'zeekay.ai', id: Date.now() });
    return;
  }

  if (cmd === 'date') {
    addEntry({ command: '', output: new Date().toString(), id: Date.now() });
    return;
  }

  if (cmd === 'uptime') {
    addEntry({ command: '', output: 'up since you loaded this page', id: Date.now() });
    return;
  }

  // Handle theme command
  if (cmd === 'theme') {
    executeThemeCommand(args, addEntry, command);
    return;
  }

  // Handle vim command
  if (cmd === 'vim' || cmd === 'nvim' || cmd === 'vi') {
    if (!args[0]) {
      executeVimCommand(args, addEntry, command);
      return;
    }
    // For vim with a file, fall through to the file system handler
  }

  // Git commands (simulated)
  if (cmd === 'git') {
    const subCmd = args[0];
    if (subCmd === 'status') {
      addEntry({
        command: '',
        output: `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`,
        id: Date.now()
      });
      return;
    }
    addEntry({
      command: '',
      output: `git: simulated in zOS. Try 'git status'`,
      id: Date.now()
    });
    return;
  }

  if (webContainerInstance && isWebContainerReady) {
    await executeWebContainerCommand(webContainerInstance, resolvedCommand, addEntry);
  } else {
    const { processCommand } = await import('@/utils/terminal');
    const result = processCommand(resolvedCommand);

    addEntry({
      command: '',
      output: result.output,
      isError: result.isError,
      id: Date.now()
    });
  }
};
