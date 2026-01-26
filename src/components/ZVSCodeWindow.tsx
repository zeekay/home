import React, { useState, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Files,
  Search,
  GitBranch,
  Bug,
  Puzzle,
  Settings,
  ChevronRight,
  ChevronDown,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  X,
  SplitSquareVertical,
  MoreHorizontal,
  Terminal,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Bell,
  Wifi,
  GitCommit,
  Plus,
  Minus,
  RefreshCw,
  Upload,
  Download,
  History,
  Braces,
  Play,
  ChevronUp,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// ============================================================================
// TYPES
// ============================================================================

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

interface OpenTab {
  id: string;
  name: string;
  path: string;
  language: string;
  modified?: boolean;
}

type ActivityView = 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
type BottomPanelTab = 'problems' | 'output' | 'debug-console' | 'terminal';

interface ZVSCodeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  isActive?: boolean;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_FILES: FileNode = {
  id: 'root',
  name: 'hanzo-mcp',
  type: 'folder',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: 'server',
          name: 'server',
          type: 'folder',
          children: [
            { id: 'index.ts', name: 'index.ts', type: 'file', language: 'typescript' },
            { id: 'dag.ts', name: 'dag.ts', type: 'file', language: 'typescript' },
            { id: 'search.ts', name: 'search.ts', type: 'file', language: 'typescript' },
          ],
        },
        {
          id: 'tools',
          name: 'tools',
          type: 'folder',
          children: [
            { id: 'read.ts', name: 'read.ts', type: 'file', language: 'typescript' },
            { id: 'write.ts', name: 'write.ts', type: 'file', language: 'typescript' },
            { id: 'edit.ts', name: 'edit.ts', type: 'file', language: 'typescript' },
            { id: 'shell.ts', name: 'shell.ts', type: 'file', language: 'typescript' },
          ],
        },
        { id: 'types.ts', name: 'types.ts', type: 'file', language: 'typescript' },
        { id: 'utils.ts', name: 'utils.ts', type: 'file', language: 'typescript' },
      ],
    },
    {
      id: 'tests',
      name: 'tests',
      type: 'folder',
      children: [
        { id: 'dag.test.ts', name: 'dag.test.ts', type: 'file', language: 'typescript' },
        { id: 'search.test.ts', name: 'search.test.ts', type: 'file', language: 'typescript' },
      ],
    },
    { id: 'package.json', name: 'package.json', type: 'file', language: 'json' },
    { id: 'tsconfig.json', name: 'tsconfig.json', type: 'file', language: 'json' },
    { id: 'README.md', name: 'README.md', type: 'file', language: 'markdown' },
  ],
};

const SAMPLE_CODE: Record<string, { content: string; language: string }> = {
  'index.ts': {
    language: 'typescript',
    content: `import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { dag } from './dag';
import { search } from './search';
import { read, write, edit } from '../tools';

const server = new Server({
  name: 'hanzo-mcp',
  version: '0.10.8',
});

// Register core tools
server.tool('dag', dag.schema, dag.handler);
server.tool('search', search.schema, search.handler);
server.tool('read', read.schema, read.handler);
server.tool('write', write.schema, write.handler);
server.tool('edit', edit.schema, edit.handler);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('Hanzo MCP server started');`,
  },
  'dag.ts': {
    language: 'typescript',
    content: `import { z } from 'zod';
import { spawn } from 'child_process';

export const dagSchema = z.object({
  commands: z.array(z.union([
    z.string(),
    z.object({
      id: z.string().optional(),
      run: z.string(),
      after: z.array(z.string()).optional(),
    }),
    z.object({
      parallel: z.array(z.string()),
    }),
  ])),
  parallel: z.boolean().optional(),
  shell: z.string().default('zsh'),
});

export type DagInput = z.infer<typeof dagSchema>;

export async function executeDag(input: DagInput) {
  const { commands, parallel, shell } = input;
  const results: Array<{ id: string; output: string }> = [];

  if (parallel) {
    // Execute all commands in parallel
    const promises = commands.map(async (cmd, i) => {
      const id = typeof cmd === 'string' ? \`cmd-\${i}\` : cmd.id || \`cmd-\${i}\`;
      const output = await runCommand(cmd, shell);
      return { id, output };
    });
    results.push(...await Promise.all(promises));
  } else {
    // Execute sequentially
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const id = typeof cmd === 'string' ? \`cmd-\${i}\` : cmd.id || \`cmd-\${i}\`;
      const output = await runCommand(cmd, shell);
      results.push({ id, output });
    }
  }

  return results;
}`,
  },
  'types.ts': {
    language: 'typescript',
    content: `export interface ToolResult {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

export interface ProcessInfo {
  id: string;
  pid: number;
  command: string;
  status: 'running' | 'stopped' | 'completed';
  startTime: Date;
  exitCode?: number;
}

export type ShellType = 'bash' | 'zsh' | 'sh' | 'fish';

export interface ExecutionOptions {
  shell?: ShellType;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}`,
  },
};

const SAMPLE_GIT_CHANGES = [
  { file: 'src/server/dag.ts', status: 'modified' as const },
  { file: 'src/tools/edit.ts', status: 'modified' as const },
  { file: 'tests/dag.test.ts', status: 'added' as const },
  { file: 'docs/README.md', status: 'deleted' as const },
];

const SAMPLE_PROBLEMS = [
  { type: 'warning' as const, message: "Type 'string' is not assignable to type 'number'", file: 'src/tools/edit.ts', line: 42 },
  { type: 'error' as const, message: "Cannot find module '@/utils'", file: 'src/server/index.ts', line: 7 },
  { type: 'info' as const, message: 'Consider using optional chaining', file: 'src/types.ts', line: 23 },
];

const SAMPLE_EXTENSIONS = [
  { name: 'TypeScript', publisher: 'Microsoft', installed: true },
  { name: 'ESLint', publisher: 'Microsoft', installed: true },
  { name: 'Prettier', publisher: 'Prettier', installed: true },
  { name: 'GitLens', publisher: 'GitKraken', installed: true },
  { name: 'Tailwind CSS', publisher: 'Tailwind Labs', installed: false },
  { name: 'Error Lens', publisher: 'usernamehw', installed: false },
];

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

const getFileIcon = (name: string, isOpen?: boolean) => {
  if (name.endsWith('.ts') || name.endsWith('.tsx')) {
    return <FileCode className="w-4 h-4 text-blue-400" />;
  }
  if (name.endsWith('.json')) {
    return <FileJson className="w-4 h-4 text-yellow-400" />;
  }
  if (name.endsWith('.md')) {
    return <FileText className="w-4 h-4 text-gray-400" />;
  }
  return <File className="w-4 h-4 text-gray-400" />;
};

// ============================================================================
// ACTIVITY BAR
// ============================================================================

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const items: Array<{ id: ActivityView; icon: React.ReactNode; label: string }> = [
    { id: 'explorer', icon: <Files className="w-6 h-6" />, label: 'Explorer' },
    { id: 'search', icon: <Search className="w-6 h-6" />, label: 'Search' },
    { id: 'git', icon: <GitBranch className="w-6 h-6" />, label: 'Source Control' },
    { id: 'debug', icon: <Bug className="w-6 h-6" />, label: 'Run and Debug' },
    { id: 'extensions', icon: <Puzzle className="w-6 h-6" />, label: 'Extensions' },
  ];

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-1 border-r border-[#252526]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={cn(
            'w-12 h-12 flex items-center justify-center transition-colors relative',
            activeView === item.id
              ? 'text-white'
              : 'text-[#858585] hover:text-white'
          )}
          title={item.label}
        >
          {activeView === item.id && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white" />
          )}
          {item.icon}
        </button>
      ))}
      <div className="flex-1" />
      <button
        className="w-12 h-12 flex items-center justify-center text-[#858585] hover:text-white"
        title="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};

// ============================================================================
// FILE EXPLORER
// ============================================================================

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onToggleFolder: (id: string) => void;
  onSelectFile: (node: FileNode) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  level,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onSelectFile,
}) => {
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFile === node.id;

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.id)}
          className={cn(
            'w-full flex items-center gap-1 px-2 py-0.5 text-left text-sm hover:bg-[#2a2d2e]',
            isSelected && 'bg-[#094771]'
          )}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#c5c5c5] flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#c5c5c5] flex-shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-[#dcb67a] flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-[#dcb67a] flex-shrink-0" />
          )}
          <span className="text-[#cccccc] truncate">{node.name}</span>
        </button>
        {isExpanded && node.children?.map((child) => (
          <FileTreeItem
            key={child.id}
            node={child}
            level={level + 1}
            expandedFolders={expandedFolders}
            selectedFile={selectedFile}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node)}
      className={cn(
        'w-full flex items-center gap-1 px-2 py-0.5 text-left text-sm hover:bg-[#2a2d2e]',
        isSelected && 'bg-[#094771]'
      )}
      style={{ paddingLeft: `${level * 12 + 20}px` }}
    >
      {getFileIcon(node.name)}
      <span className="text-[#cccccc] truncate">{node.name}</span>
    </button>
  );
};

// ============================================================================
// SIDEBAR PANELS
// ============================================================================

interface SidebarProps {
  activeView: ActivityView;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onToggleFolder: (id: string) => void;
  onSelectFile: (node: FileNode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onSelectFile,
  searchQuery,
  onSearchChange,
}) => {
  if (activeView === 'explorer') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 text-xs text-[#bbbbbb] uppercase tracking-wide flex items-center justify-between">
          <span>Explorer</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#3c3c3c] rounded" title="New File">
              <File className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-[#3c3c3c] rounded" title="New Folder">
              <Folder className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-[#3c3c3c] rounded" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <FileTreeItem
            node={SAMPLE_FILES}
            level={0}
            expandedFolders={expandedFolders}
            selectedFile={selectedFile}
            onToggleFolder={onToggleFolder}
            onSelectFile={onSelectFile}
          />
        </ScrollArea>
      </div>
    );
  }

  if (activeView === 'search') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 text-xs text-[#bbbbbb] uppercase tracking-wide">Search</div>
        <div className="px-3 pb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full px-2 py-1 text-sm bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-[#cccccc] placeholder-[#6e6e6e] outline-none"
          />
        </div>
        <div className="px-3 pb-2 flex gap-2">
          <input
            type="text"
            placeholder="files to include"
            className="flex-1 px-2 py-1 text-xs bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-[#cccccc] placeholder-[#6e6e6e] outline-none"
          />
        </div>
        {searchQuery && (
          <ScrollArea className="flex-1 px-3">
            <div className="text-xs text-[#cccccc]">
              <div className="py-1">3 results in 2 files</div>
              <div className="mt-2">
                <div className="flex items-center gap-1 text-[#cccccc]">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>src/server/dag.ts</span>
                </div>
                <div className="pl-5 py-0.5 text-[#9e9e9e] hover:bg-[#2a2d2e] cursor-pointer">
                  Line 12: <span className="text-[#f9c74f]">{searchQuery}</span>
                </div>
                <div className="pl-5 py-0.5 text-[#9e9e9e] hover:bg-[#2a2d2e] cursor-pointer">
                  Line 34: <span className="text-[#f9c74f]">{searchQuery}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  if (activeView === 'git') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 text-xs text-[#bbbbbb] uppercase tracking-wide flex items-center justify-between">
          <span>Source Control</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-[#3c3c3c] rounded" title="Commit">
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-[#3c3c3c] rounded" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="px-3 pb-2">
          <input
            type="text"
            placeholder="Message (Ctrl+Enter to commit)"
            className="w-full px-2 py-1.5 text-sm bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-[#cccccc] placeholder-[#6e6e6e] outline-none"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3">
            <div className="flex items-center justify-between py-1 text-xs text-[#cccccc]">
              <span>Changes</span>
              <span className="text-[#858585]">{SAMPLE_GIT_CHANGES.length}</span>
            </div>
            {SAMPLE_GIT_CHANGES.map((change, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-0.5 text-xs hover:bg-[#2a2d2e] cursor-pointer group"
              >
                <span className={cn(
                  'w-4 text-center font-medium',
                  change.status === 'modified' && 'text-[#e2c08d]',
                  change.status === 'added' && 'text-[#89d185]',
                  change.status === 'deleted' && 'text-[#c74e39]'
                )}>
                  {change.status === 'modified' ? 'M' : change.status === 'added' ? 'A' : 'D'}
                </span>
                <span className="text-[#cccccc] truncate flex-1">{change.file}</span>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button className="p-0.5 hover:bg-[#3c3c3c] rounded">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button className="p-0.5 hover:bg-[#3c3c3c] rounded">
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t border-[#3c3c3c] p-2 flex items-center gap-2 text-xs text-[#cccccc]">
          <GitBranch className="w-3.5 h-3.5" />
          <span>main</span>
          <GitCommit className="w-3.5 h-3.5 ml-2" />
          <span className="text-[#858585]">12 commits</span>
        </div>
      </div>
    );
  }

  if (activeView === 'debug') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 text-xs text-[#bbbbbb] uppercase tracking-wide">Run and Debug</div>
        <div className="px-3 pb-2 flex items-center gap-2">
          <select className="flex-1 px-2 py-1 text-sm bg-[#3c3c3c] border border-[#3c3c3c] rounded text-[#cccccc] outline-none">
            <option>Node.js: Launch Program</option>
            <option>Node.js: Attach</option>
            <option>Jest: Current File</option>
          </select>
          <button className="p-1.5 bg-[#3c9a3c] hover:bg-[#4caf50] rounded" title="Start Debugging">
            <Play className="w-4 h-4 text-white fill-white" />
          </button>
        </div>
        <div className="px-3 text-xs text-[#858585]">
          To customize Run and Debug create a launch.json file.
        </div>
      </div>
    );
  }

  if (activeView === 'extensions') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 text-xs text-[#bbbbbb] uppercase tracking-wide">Extensions</div>
        <div className="px-3 pb-2">
          <input
            type="text"
            placeholder="Search Extensions in Marketplace"
            className="w-full px-2 py-1 text-sm bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-[#cccccc] placeholder-[#6e6e6e] outline-none"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3">
            <div className="py-1 text-xs text-[#858585]">INSTALLED</div>
            {SAMPLE_EXTENSIONS.filter(e => e.installed).map((ext, i) => (
              <div key={i} className="flex items-center gap-2 py-2 hover:bg-[#2a2d2e] cursor-pointer">
                <div className="w-8 h-8 bg-[#3c3c3c] rounded flex items-center justify-center">
                  <Braces className="w-4 h-4 text-[#cccccc]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#cccccc] truncate">{ext.name}</div>
                  <div className="text-xs text-[#858585] truncate">{ext.publisher}</div>
                </div>
                <Settings className="w-4 h-4 text-[#858585]" />
              </div>
            ))}
            <div className="py-1 text-xs text-[#858585] mt-2">RECOMMENDED</div>
            {SAMPLE_EXTENSIONS.filter(e => !e.installed).map((ext, i) => (
              <div key={i} className="flex items-center gap-2 py-2 hover:bg-[#2a2d2e] cursor-pointer">
                <div className="w-8 h-8 bg-[#3c3c3c] rounded flex items-center justify-center">
                  <Braces className="w-4 h-4 text-[#cccccc]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#cccccc] truncate">{ext.name}</div>
                  <div className="text-xs text-[#858585] truncate">{ext.publisher}</div>
                </div>
                <button className="px-2 py-0.5 text-xs bg-[#0e639c] hover:bg-[#1177bb] rounded text-white">
                  Install
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return null;
};

// ============================================================================
// EDITOR TABS
// ============================================================================

interface EditorTabsProps {
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
}) => {
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-[#252526] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer border-t-2 min-w-0 group',
            activeTabId === tab.id
              ? 'bg-[#1e1e1e] border-t-[#007acc] text-[#ffffff]'
              : 'bg-[#2d2d2d] border-t-transparent text-[#969696] hover:bg-[#2d2d2d]'
          )}
        >
          {getFileIcon(tab.name)}
          <span className="truncate max-w-[120px]">{tab.name}</span>
          {tab.modified && (
            <div className="w-2 h-2 rounded-full bg-[#cccccc]" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            className={cn(
              'p-0.5 rounded hover:bg-[#3c3c3c]',
              activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex-1 bg-[#252526]" />
      <button className="p-2 hover:bg-[#3c3c3c] text-[#858585]" title="Split Editor Right">
        <SplitSquareVertical className="w-4 h-4" />
      </button>
      <button className="p-2 hover:bg-[#3c3c3c] text-[#858585]" title="More Actions">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================================================
// CODE EDITOR WITH SYNTAX HIGHLIGHTING
// ============================================================================

interface CodeEditorProps {
  fileName: string;
  content: string;
  language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, content, language }) => {
  const lines = content.split('\n');

  // Simple syntax highlighting
  const highlightLine = (line: string): React.ReactNode => {
    // Keywords
    const keywords = ['import', 'export', 'const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'from', 'default', 'new'];
    const types = ['string', 'number', 'boolean', 'void', 'any', 'Array', 'Promise', 'Record', 'Date'];

    let result = line;

    // Replace strings first (to avoid highlighting keywords inside strings)
    const stringRegex = /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g;
    const strings: string[] = [];
    result = result.replace(stringRegex, (match) => {
      strings.push(match);
      return `__STRING_${strings.length - 1}__`;
    });

    // Comments
    if (result.trim().startsWith('//')) {
      return <span className="text-[#6a9955]">{line}</span>;
    }

    // Highlight keywords
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b(${kw})\\b`, 'g');
      result = result.replace(regex, `<span class="text-[#c586c0]">$1</span>`);
    });

    // Highlight types
    types.forEach((t) => {
      const regex = new RegExp(`\\b(${t})\\b`, 'g');
      result = result.replace(regex, `<span class="text-[#4ec9b0]">$1</span>`);
    });

    // Function calls
    result = result.replace(/(\w+)(?=\()/g, '<span class="text-[#dcdcaa]">$1</span>');

    // Numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="text-[#b5cea8]">$1</span>');

    // Restore strings with highlighting
    strings.forEach((str, i) => {
      result = result.replace(`__STRING_${i}__`, `<span class="text-[#ce9178]">${str}</span>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  // Breadcrumbs
  const pathParts = fileName.split('/').filter(Boolean);

  // Generate minimap content
  const minimapLines = useMemo(() => {
    return lines.slice(0, 100).map((line, i) => {
      const length = Math.min(line.replace(/\s/g, '').length, 40);
      return (
        <div
          key={i}
          className="h-[2px] my-[1px] bg-[#6e6e6e] opacity-40"
          style={{ width: `${length * 1.5}px`, marginLeft: `${line.search(/\S/) * 0.5}px` }}
        />
      );
    });
  }, [lines]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-4 py-1 bg-[#1e1e1e] border-b border-[#3c3c3c] text-xs">
        {pathParts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-[#858585]" />}
            <span className="text-[#cccccc] hover:text-white cursor-pointer">{part}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Editor content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code area */}
        <ScrollArea className="flex-1">
          <div className="flex text-sm font-mono leading-5">
            {/* Line numbers and gutter */}
            <div className="sticky left-0 flex-shrink-0 bg-[#1e1e1e] select-none">
              {lines.map((_, i) => (
                <div
                  key={i}
                  className="px-4 text-right text-[#858585] hover:text-[#cccccc] w-12"
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <div className="flex-1 pl-2 pr-4">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="text-[#d4d4d4] hover:bg-[#2a2d2e] whitespace-pre"
                >
                  {highlightLine(line)}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Minimap */}
        <div className="w-[60px] bg-[#1e1e1e] border-l border-[#3c3c3c] overflow-hidden flex-shrink-0">
          <div className="p-1 transform scale-[0.5] origin-top-left">
            {minimapLines}
          </div>
          {/* Viewport indicator */}
          <div className="absolute top-0 right-0 w-[60px] h-16 bg-[#007acc] opacity-20 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BOTTOM PANEL
// ============================================================================

interface BottomPanelProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  activeTab,
  onTabChange,
  isExpanded,
  onToggle,
}) => {
  const tabs: Array<{ id: BottomPanelTab; label: string; badge?: number }> = [
    { id: 'problems', label: 'Problems', badge: SAMPLE_PROBLEMS.length },
    { id: 'output', label: 'Output' },
    { id: 'debug-console', label: 'Debug Console' },
    { id: 'terminal', label: 'Terminal' },
  ];

  return (
    <div className={cn(
      'bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col transition-all',
      isExpanded ? 'h-48' : 'h-8'
    )}>
      {/* Panel header */}
      <div className="flex items-center justify-between bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5',
                activeTab === tab.id
                  ? 'text-[#ffffff] border-b border-[#007acc]'
                  : 'text-[#858585] hover:text-[#cccccc]'
              )}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-[#007acc] rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-[#3c3c3c] text-[#858585]"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button className="p-1.5 hover:bg-[#3c3c3c] text-[#858585]">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel content */}
      {isExpanded && (
        <ScrollArea className="flex-1">
          {activeTab === 'problems' && (
            <div className="p-2 text-xs">
              {SAMPLE_PROBLEMS.map((problem, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-1 hover:bg-[#2a2d2e] cursor-pointer"
                >
                  {problem.type === 'error' && <XCircle className="w-3.5 h-3.5 text-[#f14c4c] flex-shrink-0 mt-0.5" />}
                  {problem.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-[#cca700] flex-shrink-0 mt-0.5" />}
                  {problem.type === 'info' && <Info className="w-3.5 h-3.5 text-[#3794ff] flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-[#cccccc]">{problem.message}</span>
                    <span className="text-[#858585] ml-2">
                      {problem.file}:{problem.line}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'output' && (
            <div className="p-2 text-xs font-mono text-[#cccccc]">
              <div className="text-[#3794ff]">[INFO] Build started...</div>
              <div className="text-[#3794ff]">[INFO] Compiling TypeScript...</div>
              <div className="text-[#89d185]">[SUCCESS] Build completed in 1.24s</div>
              <div className="text-[#3794ff]">[INFO] Watching for file changes...</div>
            </div>
          )}

          {activeTab === 'debug-console' && (
            <div className="p-2 text-xs font-mono text-[#858585]">
              <div>Debug console is not active.</div>
              <div>Start a debug session to see output here.</div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="p-2 text-xs font-mono">
              <div className="text-[#89d185]">user@hanzo-mcp</div>
              <div className="text-[#cccccc]">$ npm run dev</div>
              <div className="text-[#cccccc]">&gt; hanzo-mcp@0.10.8 dev</div>
              <div className="text-[#cccccc]">&gt; tsx watch src/server/index.ts</div>
              <div className="text-[#3794ff]">[tsx] watching for file changes...</div>
              <div className="text-[#cccccc] flex items-center">
                <span className="text-[#89d185]">$</span>
                <span className="ml-1 w-2 h-4 bg-[#cccccc] animate-pulse" />
              </div>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

// ============================================================================
// STATUS BAR
// ============================================================================

interface StatusBarProps {
  branch: string;
  line: number;
  column: number;
  language: string;
  encoding: string;
  problems: { errors: number; warnings: number };
}

const StatusBar: React.FC<StatusBarProps> = ({
  branch,
  line,
  column,
  language,
  encoding,
  problems,
}) => {
  return (
    <div className="flex items-center justify-between px-2 h-6 bg-[#007acc] text-white text-xs">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 hover:bg-[#1177bb] px-1 rounded">
          <GitBranch className="w-3.5 h-3.5" />
          <span>{branch}</span>
        </button>
        <button className="flex items-center gap-1 hover:bg-[#1177bb] px-1 rounded">
          {problems.errors > 0 && (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>{problems.errors}</span>
            </>
          )}
          {problems.warnings > 0 && (
            <>
              <AlertTriangle className="w-3.5 h-3.5 ml-1" />
              <span>{problems.warnings}</span>
            </>
          )}
          {problems.errors === 0 && problems.warnings === 0 && (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="hover:bg-[#1177bb] px-1 rounded">
          Ln {line}, Col {column}
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded">
          Spaces: 2
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded">
          {encoding}
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded">
          LF
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded">
          {language}
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Prettier</span>
        </button>
        <button className="hover:bg-[#1177bb] px-1 rounded">
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMMAND PALETTE
// ============================================================================

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  const commands = [
    { label: 'Go to File...', shortcut: 'Cmd+P' },
    { label: 'Go to Symbol in Workspace...', shortcut: 'Cmd+T' },
    { label: 'Show All Commands', shortcut: 'Cmd+Shift+P' },
    { label: 'Toggle Terminal', shortcut: 'Ctrl+`' },
    { label: 'Format Document', shortcut: 'Shift+Alt+F' },
    { label: 'Go to Definition', shortcut: 'F12' },
    { label: 'Find All References', shortcut: 'Shift+F12' },
    { label: 'Rename Symbol', shortcut: 'F2' },
  ];

  const filteredCommands = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50" onClick={onClose}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-12 w-[500px] max-w-[90%]">
        <div
          className="bg-[#252526] border border-[#454545] rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-[#454545]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="> Type a command or search..."
              className="w-full px-2 py-1.5 text-sm bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007acc] rounded text-[#cccccc] placeholder-[#6e6e6e] outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {filteredCommands.map((cmd, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 hover:bg-[#094771] cursor-pointer"
              >
                <span className="text-sm text-[#cccccc]">{cmd.label}</span>
                <span className="text-xs text-[#858585]">{cmd.shortcut}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ZVSCodeWindow: React.FC<ZVSCodeWindowProps> = ({ onClose, onFocus, isActive }) => {
  // State
  const [activeView, setActiveView] = useState<ActivityView>('explorer');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'src', 'server', 'tools'])
  );
  const [selectedFile, setSelectedFile] = useState<string | null>('index.ts');
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    { id: 'index.ts', name: 'index.ts', path: 'src/server/index.ts', language: 'TypeScript', modified: false },
    { id: 'dag.ts', name: 'dag.ts', path: 'src/server/dag.ts', language: 'TypeScript', modified: true },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>('index.ts');
  const [searchQuery, setSearchQuery] = useState('');
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('terminal');
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Handlers
  const handleToggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectFile = useCallback((node: FileNode) => {
    if (node.type === 'file') {
      setSelectedFile(node.id);
      // Add to tabs if not already open
      if (!openTabs.find((t) => t.id === node.id)) {
        setOpenTabs((prev) => [
          ...prev,
          {
            id: node.id,
            name: node.name,
            path: node.id,
            language: node.language === 'typescript' ? 'TypeScript' : node.language || 'Plain Text',
            modified: false,
          },
        ]);
      }
      setActiveTabId(node.id);
    }
  }, [openTabs]);

  const handleCloseTab = useCallback((id: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id && next.length > 0) {
        setActiveTabId(next[next.length - 1].id);
      } else if (next.length === 0) {
        setActiveTabId(null);
      }
      return next;
    });
  }, [activeTabId]);

  // Get current file content
  const currentFileContent = useMemo(() => {
    if (!activeTabId) return null;
    return SAMPLE_CODE[activeTabId] || { content: '// No content available', language: 'typescript' };
  }, [activeTabId]);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  return (
    <ZWindow
      title="Visual Studio Code"
      onClose={onClose}
      onFocus={onFocus}
      isActive={isActive}
      initialPosition={{ x: 80, y: 40 }}
      initialSize={{ width: 1100, height: 700 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex min-h-0">
          {/* Activity bar */}
          <ActivityBar activeView={activeView} onViewChange={setActiveView} />

          {/* Sidebar */}
          {sidebarVisible && (
            <div className="w-60 bg-[#252526] flex-shrink-0 flex flex-col border-r border-[#3c3c3c]">
              <Sidebar
                activeView={activeView}
                expandedFolders={expandedFolders}
                selectedFile={selectedFile}
                onToggleFolder={handleToggleFolder}
                onSelectFile={handleSelectFile}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          )}

          {/* Editor area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Editor tabs */}
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
            />

            {/* Editor content */}
            <div className="flex-1 min-h-0">
              {currentFileContent && activeTab ? (
                <CodeEditor
                  fileName={activeTab.path}
                  content={currentFileContent.content}
                  language={currentFileContent.language}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#6e6e6e]">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-20">VS</div>
                    <div className="text-sm">Visual Studio Code</div>
                    <div className="text-xs mt-2 opacity-50">
                      Press Cmd+P to go to a file
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom panel */}
            <BottomPanel
              activeTab={bottomPanelTab}
              onTabChange={setBottomPanelTab}
              isExpanded={bottomPanelExpanded}
              onToggle={() => setBottomPanelExpanded(!bottomPanelExpanded)}
            />
          </div>
        </div>

        {/* Status bar */}
        <StatusBar
          branch="main"
          line={12}
          column={34}
          language={activeTab?.language || 'Plain Text'}
          encoding="UTF-8"
          problems={{ errors: 1, warnings: 1 }}
        />

        {/* Command palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
    </ZWindow>
  );
};

export default ZVSCodeWindow;
