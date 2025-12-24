
import { TerminalEntry } from '@/types/terminal';
import { WebContainer } from '@webcontainer/api';
import { executeWebContainerCommand } from './webContainerUtil';
import { readFile, getFileForEditing, getCurrentDir, writeFile, copyFile, moveFile, grepFile, headFile, tailFile, wcFile } from './terminalFileSystem';

// Alias mappings (like .zshrc aliases)
const aliases: Record<string, string> = {
  'll': 'ls -la',
  'la': 'ls -a',
  'l': 'ls',
  '..': 'cd ..',
  '...': 'cd ../..',
  '....': 'cd ../../..',
  'g': 'git',
  'gs': 'git status',
  'gc': 'git commit',
  'gp': 'git push',
  'gpl': 'git pull',
  'gco': 'git checkout',
  'gd': 'git diff',
  'gl': 'git log --oneline --graph',
  'v': 'vim',
  'vi': 'vim',
  'nvim': 'vim',
  'nano': 'vim',
  'pico': 'vim',
  'ed': 'vim',
  'emacs': 'vim',
  'k': 'kubectl',
  'd': 'docker',
  'dc': 'docker-compose',
  'py': 'python3',
  'n': 'node',
  'nr': 'npm run',
  'ni': 'npm install',
  'c': 'code',
  'cls': 'clear',
};

export const executeHelpCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `zOS Terminal v4.2.0 - Available Commands

Navigation:
  ls, ll, la         List files (-a shows hidden, -l long format)
  cd [dir]           Change directory (.. up, ~ home, - previous)
  pwd                Print working directory
  tree               Show directory structure

File Operations:
  cat [file]         View file contents
  head [-n] [file]   View first n lines (default 10)
  tail [-n] [file]   View last n lines (default 10)
  touch [file]       Create empty file
  mkdir [dir]        Create directory
  rm [file]          Remove file
  cp [src] [dest]    Copy file
  mv [src] [dest]    Move/rename file
  echo [text]        Print text (> file to write)
  grep [pat] [file]  Search for pattern (-n for line numbers)
  wc [file]          Word count (-l lines, -w words, -c chars)

Editors:
  vim [file]         Open file in Vim editor (full vim keybindings)
  nano/pico [file]   Aliases to vim
  :w                 Save file (in vim)
  :q                 Quit editor (in vim)
  :wq                Save and quit (in vim)

Runtime (via WebContainer):
  node [file.js]     Run JavaScript file
  npx [pkg]          Run npm package
  npm [cmd]          npm commands

System:
  clear              Clear terminal
  history            Command history
  whoami             Current user
  uname [-a]         System info
  neofetch / info    System summary
  env                Environment variables
  date               Current date/time
  uptime             Session uptime

Git (via WebContainer):
  git status         Show working tree status
  git log            Show commit history
  git diff           Show changes
  git branch         List branches

Utilities:
  cowsay [msg]       ASCII art cow
  fortune            Random quote
  open [url]         Open URL in browser

Ellipsis (Dotfiles):
  ellipsis           Dotfile manager info
  dots               List installed packages

Aliases (from .zshrc):
  ll → ls -la    la → ls -a     .. → cd ..
  g → git        gs → git status   v → vim
  n → node       py → python3      cls → clear

Theme:
  theme [name]       Change theme (dracula, nord, matrix, monokai...)

Type 'cat .zshrc' to see your configs.
Type 'cd Documents' for GitHub project links.`,
    id: Date.now()
  });
};

export const executeVimCommand = (
  args: string[],
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string,
  editorName: string = 'vim',
  openEditor?: (fileName: string, content: string, isNewFile?: boolean) => void
): void => {
  const file = args[0];

  if (!file) {
    const editorInfo: Record<string, string> = {
      vim: `Neovim v0.10.0 - Managed by Vice
github.com/zeekay/vice | github.com/zeekay/dot-vim`,
      nano: `GNU nano 7.2 - Aliased to vim in zOS`,
      pico: `Pstrstrstr pico 5.07 - Aliased to vim in zOS`,
      ed: `GNU Ed 1.19 - The standard Unix text editor`,
    };

    addEntry({
      command,
      output: `${editorInfo[editorName] || editorInfo.vim}

Usage: ${editorName} [file]

Open files for editing with vim keybindings.
Commands: :w to save, :q to quit, :wq to save and quit`,
      id: Date.now()
    });
    return;
  }

  // Try to get file for editing
  const fileData = getFileForEditing(file);
  
  if (fileData && openEditor) {
    // Open the real editor
    addEntry({
      command,
      output: `Opening ${file}...`,
      id: Date.now()
    });
    openEditor(file, fileData.content, fileData.isNewFile);
  } else if (!openEditor) {
    // Fallback to display mode if no editor callback
    const content = readFile(file);
    if (content !== null) {
      addEntry({
        command,
        output: `╭─────────────────────────────────────────────────────────────╮
│ ${editorName.toUpperCase()} - ${file.padEnd(50)} │
╰─────────────────────────────────────────────────────────────╯

${content}

───────────────────────────────────────────────────────────────
[Read-only] Press :q to exit (simulated)`,
        id: Date.now()
      });
    } else {
      addEntry({
        command,
        output: `${editorName}: ${file}: New file

╭─────────────────────────────────────────────────────────────╮
│ ${editorName.toUpperCase()} - ${file.padEnd(50)} │
╰─────────────────────────────────────────────────────────────╯

~
~
~

[New File] Use 'echo "content" > ${file}' to create`,
        id: Date.now()
      });
    }
  }
};

export const executeNeofetch = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  const uptime = Math.floor((Date.now() - performance.timeOrigin) / 1000);
  const uptimeStr = uptime > 60 ? `${Math.floor(uptime / 60)}m ${uptime % 60}s` : `${uptime}s`;

  addEntry({
    command,
    output: `
       ████████████           z@zeekay.ai
     ██            ██         ──────────────────────────
    ██   ██    ██   ██        OS: zOS 4.2.0 (WebContainer)
   ██                 ██      Host: zeekay.ai
   ██   Z   A   C   H ██      Kernel: WebContainer 1.0
   ██                 ██      Uptime: ${uptimeStr}
    ██   ██    ██   ██        Shell: zsh 5.9 + starship
     ██            ██         Terminal: zOS Terminal
       ████████████           Theme: Dracula / Muon

   ███ ███ ███ ███ ███        Dotfiles: ellipsis.sh
                              Packages: dot-zsh, dot-vim
   ◦◦◦ ellipsis.sh ◦◦◦        Editor: Neovim + Vice

GitHub: @zeekay                Twitter: @zeekay
Hanzo: hanzo.ai                Lux: lux.network
Zoo: zoo.ngo

                              © 1983-2025 Zach Kelling`,
    id: Date.now()
  });
};

export const executeEllipsisCommand = (
  args: string[],
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  const subCmd = args[0];

  if (!subCmd || subCmd === 'help' || subCmd === '-h') {
    addEntry({
      command,
      output: `◦◦◦ ellipsis v1.9.5

Package manager for dotfiles.
https://ellipsis.sh | github.com/zeekay/ellipsis

Usage: ellipsis <command>

Commands:
  install <pkg>     Install a package
  uninstall <pkg>   Remove a package
  list              List installed packages
  search <query>    Search for packages
  update            Update all packages
  status            Show package status

Installed packages:
  zeekay/dot-zsh    Shell configuration
  zeekay/dot-vim    Vim/Neovim configuration
  zeekay/dot-git    Git configuration
  zeekay/dot-tmux   Tmux configuration`,
      id: Date.now()
    });
    return;
  }

  if (subCmd === 'list' || subCmd === 'ls') {
    addEntry({
      command,
      output: `Installed packages:

  zeekay/dot-zsh    🐚  Zsh configuration
  zeekay/dot-vim    💉  Vim/Neovim + Vice
  zeekay/dot-git    📝  Git configuration
  zeekay/dot-tmux   🖥️   Tmux configuration

4 packages installed`,
      id: Date.now()
    });
    return;
  }

  if (subCmd === 'status') {
    addEntry({
      command,
      output: `◦◦◦ Package status

zeekay/dot-zsh    ✓ up to date
zeekay/dot-vim    ✓ up to date
zeekay/dot-git    ✓ up to date
zeekay/dot-tmux   ✓ up to date

All packages are up to date.`,
      id: Date.now()
    });
    return;
  }

  addEntry({
    command,
    output: `ellipsis: '${subCmd}' is simulated in zOS. See 'ellipsis help'`,
    id: Date.now()
  });
};

export const executeDotsCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `Dotfiles managed by ellipsis.sh:

~/.zshrc      → zeekay/dot-zsh
~/.vimrc      → zeekay/dot-vim
~/.gitconfig  → zeekay/dot-git
~/.tmux.conf  → zeekay/dot-tmux
~/.inputrc    → zeekay/dot-vim

Use 'cat <file>' to view configuration.
Use 'cd Documents/dotfiles' for GitHub links.`,
    id: Date.now()
  });
};

export const executeEnvCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `USER=z
HOME=/home/z
SHELL=/bin/zsh
TERM=xterm-256color
EDITOR=nvim
VISUAL=nvim
LANG=en_US.UTF-8
PATH=/home/z/.local/bin:/home/z/go/bin:/home/z/.cargo/bin:/usr/local/bin:/usr/bin:/bin
ELLIPSIS_PATH=/home/z/.ellipsis
ZSH=/home/z/.oh-my-zsh
NVM_DIR=/home/z/.nvm
STARSHIP_SHELL=zsh`,
    id: Date.now()
  });
};

export const executeTreeCommand = (
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  command: string
): void => {
  addEntry({
    command,
    output: `.
├── .zshrc
├── .vimrc
├── .gitconfig
├── .inputrc
├── .tmux.conf
├── README.md
├── hello.js
├── hello.ts
├── Documents/
│   ├── README.md
│   ├── dotfiles/
│   ├── tools/
│   ├── web/
│   └── misc/
├── projects/
│   ├── hanzo/
│   ├── lux/
│   └── zoo/
├── bin/
├── .ssh/
└── .ellipsis/

8 directories, 8 files`,
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
      output: `Current theme: dracula

Available themes: ${validThemes.join(', ')}

Use the settings gear ⚙️ in the window title bar to change themes.`,
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

  addEntry({
    command,
    output: `Theme '${theme}' selected. Use the settings gear ⚙️ in the title bar to apply.`,
    id: Date.now()
  });
};

export const processCommand = async (
  command: string,
  webContainerInstance: WebContainer | null,
  isWebContainerReady: boolean,
  addEntry: (entry: Omit<TerminalEntry, 'id'> & { id?: number }) => void,
  clearEntries: () => void,
  commandHistory: string[] = [],
  openEditor?: (fileName: string, content: string, isNewFile?: boolean) => void
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
  if (cmd === 'clear' || cmd === 'cls') {
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

  if (cmd === 'neofetch' || cmd === 'info') {
    executeNeofetch(addEntry, command);
    return;
  }

  if (cmd === 'ellipsis') {
    executeEllipsisCommand(args, addEntry, command);
    return;
  }

  if (cmd === 'dots') {
    executeDotsCommand(addEntry, command);
    return;
  }

  if (cmd === 'env' || cmd === 'printenv') {
    executeEnvCommand(addEntry, command);
    return;
  }

  if (cmd === 'tree') {
    executeTreeCommand(addEntry, command);
    return;
  }

  if (cmd === 'whoami') {
    addEntry({ command, output: 'z', id: Date.now() });
    return;
  }

  if (cmd === 'id') {
    addEntry({ command, output: 'uid=1000(z) gid=1000(z) groups=1000(z),27(sudo),100(users)', id: Date.now() });
    return;
  }

  if (cmd === 'uname') {
    const flag = args[0];
    if (flag === '-a') {
      addEntry({ command, output: 'zOS 4.2.0 zeekay.ai WebContainer aarch64 GNU/Linux', id: Date.now() });
    } else if (flag === '-r') {
      addEntry({ command, output: '4.2.0-webcontainer', id: Date.now() });
    } else {
      addEntry({ command, output: 'zOS', id: Date.now() });
    }
    return;
  }

  if (cmd === 'hostname') {
    addEntry({ command, output: 'zeekay.ai', id: Date.now() });
    return;
  }

  if (cmd === 'date') {
    addEntry({ command, output: new Date().toString(), id: Date.now() });
    return;
  }

  if (cmd === 'uptime') {
    const uptime = Math.floor((Date.now() - performance.timeOrigin) / 1000);
    const uptimeStr = uptime > 60 ? `${Math.floor(uptime / 60)} min` : `${uptime} sec`;
    addEntry({ command, output: `up ${uptimeStr}, 1 user, load average: 0.00, 0.00, 0.00`, id: Date.now() });
    return;
  }

  if (cmd === 'which') {
    const prog = args[0];
    if (prog) {
      const paths: Record<string, string> = {
        'zsh': '/bin/zsh',
        'vim': '/usr/bin/vim',
        'nvim': '/usr/local/bin/nvim',
        'node': '/usr/local/bin/node',
        'npm': '/usr/local/bin/npm',
        'git': '/usr/bin/git',
        'python': '/usr/bin/python3',
        'python3': '/usr/bin/python3',
      };
      addEntry({ command, output: paths[prog] || `${prog} not found`, id: Date.now() });
    }
    return;
  }

  if (cmd === 'type') {
    const prog = args[0];
    if (prog) {
      if (aliases[prog]) {
        addEntry({ command, output: `${prog} is aliased to '${aliases[prog]}'`, id: Date.now() });
      } else {
        addEntry({ command, output: `${prog} is /usr/bin/${prog}`, id: Date.now() });
      }
    }
    return;
  }

  if (cmd === 'alias') {
    const aliasOutput = Object.entries(aliases)
      .map(([k, v]) => `${k}='${v}'`)
      .join('\n');
    addEntry({ command, output: aliasOutput, id: Date.now() });
    return;
  }

  // Handle theme command
  if (cmd === 'theme') {
    executeThemeCommand(args, addEntry, command);
    return;
  }

  // Handle editor commands (vim, nano, pico, ed)
  if (['vim', 'nvim', 'vi', 'nano', 'pico', 'ed', 'emacs'].includes(cmd)) {
    executeVimCommand(args, addEntry, command, cmd, openEditor);
    return;
  }

  // Grep command
  if (cmd === 'grep') {
    if (args.length < 2) {
      addEntry({ command, output: 'Usage: grep <pattern> <file>', isError: true, id: Date.now() });
      return;
    }
    const pattern = args[0];
    const fileName = args[1];
    const showLineNumbers = args.includes('-n');

    const result = grepFile(pattern, fileName);
    if (result === null) {
      addEntry({ command, output: `grep: ${fileName}: No such file or directory`, isError: true, id: Date.now() });
    } else if (result.matches.length === 0) {
      addEntry({ command, output: '', id: Date.now() });
    } else {
      const output = result.matches.map((line, i) =>
        showLineNumbers ? `${result.lineNumbers[i]}:${line}` : line
      ).join('\n');
      addEntry({ command, output, id: Date.now() });
    }
    return;
  }

  // Head command
  if (cmd === 'head') {
    let lines = 10;
    let fileName = args[0];

    // Parse -n flag
    if (args[0] === '-n' && args[1]) {
      lines = parseInt(args[1]) || 10;
      fileName = args[2];
    } else if (args[0]?.startsWith('-')) {
      lines = parseInt(args[0].slice(1)) || 10;
      fileName = args[1];
    }

    if (!fileName) {
      addEntry({ command, output: 'Usage: head [-n lines] <file>', isError: true, id: Date.now() });
      return;
    }

    const content = headFile(fileName, lines);
    if (content === null) {
      addEntry({ command, output: `head: ${fileName}: No such file or directory`, isError: true, id: Date.now() });
    } else {
      addEntry({ command, output: content, id: Date.now() });
    }
    return;
  }

  // Tail command
  if (cmd === 'tail') {
    let lines = 10;
    let fileName = args[0];

    // Parse -n flag
    if (args[0] === '-n' && args[1]) {
      lines = parseInt(args[1]) || 10;
      fileName = args[2];
    } else if (args[0]?.startsWith('-')) {
      lines = parseInt(args[0].slice(1)) || 10;
      fileName = args[1];
    }

    if (!fileName) {
      addEntry({ command, output: 'Usage: tail [-n lines] <file>', isError: true, id: Date.now() });
      return;
    }

    const content = tailFile(fileName, lines);
    if (content === null) {
      addEntry({ command, output: `tail: ${fileName}: No such file or directory`, isError: true, id: Date.now() });
    } else {
      addEntry({ command, output: content, id: Date.now() });
    }
    return;
  }

  // Copy command
  if (cmd === 'cp') {
    if (args.length < 2) {
      addEntry({ command, output: 'Usage: cp <source> <destination>', isError: true, id: Date.now() });
      return;
    }
    const result = copyFile(args[0], args[1]);
    if (result.isError) {
      addEntry({ command, output: result.output, isError: true, id: Date.now() });
    } else {
      addEntry({ command, output: '', id: Date.now() });
    }
    return;
  }

  // Move command
  if (cmd === 'mv') {
    if (args.length < 2) {
      addEntry({ command, output: 'Usage: mv <source> <destination>', isError: true, id: Date.now() });
      return;
    }
    const result = moveFile(args[0], args[1]);
    if (result.isError) {
      addEntry({ command, output: result.output, isError: true, id: Date.now() });
    } else {
      addEntry({ command, output: '', id: Date.now() });
    }
    return;
  }

  // Word count command
  if (cmd === 'wc') {
    const fileName = args.filter(a => !a.startsWith('-'))[0];
    if (!fileName) {
      addEntry({ command, output: 'Usage: wc <file>', isError: true, id: Date.now() });
      return;
    }

    const result = wcFile(fileName);
    if (result === null) {
      addEntry({ command, output: `wc: ${fileName}: No such file or directory`, isError: true, id: Date.now() });
    } else {
      const showLines = args.includes('-l');
      const showWords = args.includes('-w');
      const showChars = args.includes('-c') || args.includes('-m');

      if (showLines && !showWords && !showChars) {
        addEntry({ command, output: `${result.lines} ${fileName}`, id: Date.now() });
      } else if (showWords && !showLines && !showChars) {
        addEntry({ command, output: `${result.words} ${fileName}`, id: Date.now() });
      } else if (showChars && !showLines && !showWords) {
        addEntry({ command, output: `${result.chars} ${fileName}`, id: Date.now() });
      } else {
        addEntry({ command, output: `  ${result.lines}   ${result.words}  ${result.chars} ${fileName}`, id: Date.now() });
      }
    }
    return;
  }

  // Git commands - pass to WebContainer if available, otherwise show demo
  if (cmd === 'git') {
    if (webContainerInstance && isWebContainerReady) {
      await executeWebContainerCommand(webContainerInstance, resolvedCommand, addEntry, command);
      return;
    }
    // Fallback demo mode when WebContainer not ready
    const subCmd = args[0];
    if (subCmd === 'status') {
      addEntry({
        command,
        output: `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`,
        id: Date.now()
      });
      return;
    }
    if (subCmd === 'log') {
      addEntry({
        command,
        output: `* a1b2c3d (HEAD -> main, origin/main) Update terminal features
* e4f5g6h Add zsh configuration
* i7j8k9l Initial commit`,
        id: Date.now()
      });
      return;
    }
    if (subCmd === 'branch') {
      addEntry({
        command,
        output: `* main
  develop
  feature/terminal`,
        id: Date.now()
      });
      return;
    }
    if (subCmd === 'remote') {
      addEntry({
        command,
        output: `origin  git@github.com:zeekay/zos.git (fetch)
origin  git@github.com:zeekay/zos.git (push)`,
        id: Date.now()
      });
      return;
    }
    addEntry({
      command,
      output: `git: WebContainer loading... Try again in a moment.`,
      id: Date.now()
    });
    return;
  }

  // NPM commands
  if (cmd === 'npm') {
    const subCmd = args[0];
    if (subCmd === 'version' || subCmd === '-v') {
      addEntry({ command, output: '10.2.0', id: Date.now() });
      return;
    }
    // Fall through to WebContainer
  }

  // Node.js - try WebContainer first
  if (cmd === 'node') {
    if (args[0] === '-v' || args[0] === '--version') {
      addEntry({ command, output: 'v20.10.0', id: Date.now() });
      return;
    }

    // If we have a file argument and WebContainer isn't ready, simulate
    if (args[0] && !isWebContainerReady) {
      const content = readFile(args[0]);
      if (content) {
        addEntry({
          command: '',
          output: `[Simulated Node.js output for ${args[0]}]\n\n${content.split('\n').filter(l => l.includes('console.log')).map(l => {
            const match = l.match(/console\.log\(['"](.+)['"]\)/);
            return match ? match[1] : '';
          }).filter(Boolean).join('\n')}`,
          id: Date.now()
        });
        return;
      }
    }
    // Fall through to WebContainer
  }

  // Python
  if (cmd === 'python' || cmd === 'python3') {
    if (args[0] === '--version' || args[0] === '-V') {
      addEntry({ command, output: 'Python 3.12.0', id: Date.now() });
      return;
    }
    addEntry({
      command,
      output: 'Python is simulated. WebContainer runs Node.js natively.',
      id: Date.now()
    });
    return;
  }

  // Open command
  if (cmd === 'open') {
    const target = args[0];
    if (target) {
      if (target.startsWith('http')) {
        addEntry({ command, output: `Opening ${target} in browser...`, id: Date.now() });
        window.open(target, '_blank');
      } else {
        addEntry({ command, output: `open: cannot open '${target}': Use cat to view files`, id: Date.now() });
      }
    }
    return;
  }

  // Cowsay
  if (cmd === 'cowsay') {
    const message = args.join(' ') || 'moo!';
    addEntry({
      command,
      output: ` ${'_'.repeat(message.length + 2)}
< ${message} >
 ${'-'.repeat(message.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`,
      id: Date.now()
    });
    return;
  }

  // Fortune
  if (cmd === 'fortune') {
    const fortunes = [
      "You will be fortunate in everything you put your hands to.",
      "A journey of a thousand miles begins with a single step.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Simplicity is the ultimate sophistication.",
      "Code is poetry.",
    ];
    addEntry({
      command,
      output: fortunes[Math.floor(Math.random() * fortunes.length)],
      id: Date.now()
    });
    return;
  }

  if (webContainerInstance && isWebContainerReady) {
    await executeWebContainerCommand(webContainerInstance, resolvedCommand, addEntry, command);
  } else {
    const { processCommand: processTerminalCommand } = await import('@/utils/terminal');
    const result = processTerminalCommand(resolvedCommand);

    addEntry({
      command,
      output: result.output,
      isError: result.isError,
      id: Date.now()
    });
  }
};
