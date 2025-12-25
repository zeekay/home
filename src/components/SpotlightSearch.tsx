import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { QUICK_LINKS, EXTERNAL_LINKS } from '@/config/links';
import {
  Search,
  Folder,
  Terminal,
  Globe,
  Music,
  MessageSquare,
  Mail,
  Calendar,
  Settings,
  Image,
  Video,
  FileText,
  Github,
  Activity,
  Wallet,
  Calculator,
  Clock,
  Cloud,
  StickyNote,
  Command,
  ExternalLink,
  FolderOpen,
  Hash,
  ArrowRight,
} from 'lucide-react';

// Hanzo AI Logo
const HanzoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M20 80 L50 20 L80 80 M35 55 L65 55" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Zoo Logo
const ZooLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

type AppType = 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar' |
               'System Preferences' | 'Photos' | 'FaceTime' | 'Notes' |
               'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI' |
               'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies';

interface SearchResult {
  type: 'app' | 'action' | 'document' | 'calculation' | 'web';
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (app: AppType) => void;
  onQuitApp: () => void;
  onOpenSettings: () => void;
}

const appList: { name: AppType; icon: React.ReactNode; keywords: string[] }[] = [
  { name: 'Finder', icon: <Folder className="w-5 h-5" />, keywords: ['files', 'browse', 'folder'] },
  { name: 'Terminal', icon: <Terminal className="w-5 h-5" />, keywords: ['command', 'shell', 'bash', 'console'] },
  { name: 'Safari', icon: <Globe className="w-5 h-5" />, keywords: ['browser', 'web', 'internet'] },
  { name: 'Music', icon: <Music className="w-5 h-5" />, keywords: ['songs', 'audio', 'player', 'itunes'] },
  { name: 'Mail', icon: <Mail className="w-5 h-5" />, keywords: ['email', 'inbox', 'messages'] },
  { name: 'Calendar', icon: <Calendar className="w-5 h-5" />, keywords: ['events', 'schedule', 'dates'] },
  { name: 'System Preferences', icon: <Settings className="w-5 h-5" />, keywords: ['settings', 'config', 'options'] },
  { name: 'Photos', icon: <Image className="w-5 h-5" />, keywords: ['pictures', 'gallery', 'images'] },
  { name: 'FaceTime', icon: <Video className="w-5 h-5" />, keywords: ['call', 'video', 'chat'] },
  { name: 'Notes', icon: <FileText className="w-5 h-5" />, keywords: ['text', 'write', 'memo', 'textpad'] },
  { name: 'GitHub Stats', icon: <Github className="w-5 h-5" />, keywords: ['code', 'git', 'repos'] },
  { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, keywords: ['chat', 'socials', 'talk'] },
  { name: 'Activity Monitor', icon: <Activity className="w-5 h-5" />, keywords: ['cpu', 'memory', 'stats', 'system'] },
  { name: 'Hanzo AI', icon: <HanzoLogo />, keywords: ['ai', 'assistant', 'chat', 'intelligence'] },
  { name: 'Lux Wallet', icon: <Wallet className="w-5 h-5" />, keywords: ['crypto', 'blockchain', 'money'] },
  { name: 'Zoo', icon: <ZooLogo />, keywords: ['assistant', 'ai', 'help'] },
  { name: 'Calculator', icon: <Calculator className="w-5 h-5" />, keywords: ['math', 'calculate', 'numbers'] },
  { name: 'Clock', icon: <Clock className="w-5 h-5" />, keywords: ['time', 'alarm', 'timer'] },
  { name: 'Weather', icon: <Cloud className="w-5 h-5" />, keywords: ['forecast', 'temperature', 'rain'] },
  { name: 'Stickies', icon: <StickyNote className="w-5 h-5" />, keywords: ['notes', 'sticky', 'reminder'] },
];

// Virtual documents/files that can be searched
const documentList = [
  { name: 'README.md', path: 'Documents', type: 'file', url: 'https://github.com/hanzoai' },
  { name: 'hanzo', path: 'Documents', type: 'folder', url: 'https://github.com/hanzoai' },
  { name: 'lux', path: 'Documents', type: 'folder', url: 'https://github.com/luxfi' },
  { name: 'zoo', path: 'Documents', type: 'folder', url: 'https://github.com/zooai' },
  { name: 'zen-0.6B', path: 'Documents/models', type: 'folder', url: 'https://huggingface.co/hanzoai/zen-0.6B' },
  { name: 'zen-1.7B', path: 'Documents/models', type: 'folder', url: 'https://huggingface.co/hanzoai/zen-1.7B' },
  { name: 'zen-4B', path: 'Documents/models', type: 'folder', url: 'https://huggingface.co/hanzoai/zen-4B' },
  { name: 'zen-8B', path: 'Documents/models', type: 'folder', url: 'https://huggingface.co/hanzoai/zen-8B' },
  { name: 'mcp', path: 'Documents/hanzo', type: 'folder', url: 'https://github.com/hanzoai/mcp' },
  { name: 'dev', path: 'Documents/hanzo', type: 'folder', url: 'https://github.com/hanzoai/dev' },
  { name: 'ui', path: 'Documents/hanzo', type: 'folder', url: 'https://github.com/hanzoai/ui' },
  { name: 'node', path: 'Documents/lux', type: 'folder', url: 'https://github.com/luxfi/node' },
  { name: 'wallet', path: 'Documents/lux', type: 'folder', url: 'https://github.com/luxfi/wallet' },
  { name: 'zips', path: 'Documents/zoo', type: 'folder', url: 'https://zips.zoo.ngo' },
  { name: 'dotfiles', path: 'Documents', type: 'folder' },
  { name: 'ellipsis', path: 'Documents/dotfiles', type: 'folder' },
  { name: 'zeesh', path: 'Documents/dotfiles', type: 'folder' },
];

// Quick web links - use centralized config with additional search link
const quickLinks = [
  ...QUICK_LINKS,
  { name: 'Google', url: `${EXTERNAL_LINKS.google}/search?q=`, keywords: ['google', 'search'] },
];

// Try to evaluate math expression safely
const tryEvaluate = (expr: string): number | null => {
  try {
    // Only allow numbers, operators, parentheses, and decimal points
    const sanitized = expr.replace(/[^0-9+\-*/().%\s^]/g, '');
    if (!sanitized || sanitized.length < 1) return null;

    // Replace ^ with ** for exponentiation
    const processed = sanitized.replace(/\^/g, '**');

    // Evaluate using Function (safer than eval)
    const result = new Function(`return ${processed}`)();

    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
};

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onQuitApp,
  onOpenSettings,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build search results based on query
  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    const resultList: SearchResult[] = [];

    if (!q) {
      // Show recent/suggested apps when empty
      const suggested: AppType[] = ['Terminal', 'Safari', 'Notes', 'Hanzo AI', 'System Preferences'];
      suggested.forEach(appName => {
        const app = appList.find(a => a.name === appName);
        if (app) {
          resultList.push({
            type: 'app',
            name: app.name,
            subtitle: 'Application',
            icon: app.icon,
            action: () => { onOpenApp(app.name); onClose(); },
          });
        }
      });
      return resultList;
    }

    // Check for math expression
    const calculation = tryEvaluate(q);
    if (calculation !== null) {
      resultList.push({
        type: 'calculation',
        name: `= ${calculation}`,
        subtitle: `${q}`,
        icon: <Hash className="w-5 h-5 text-orange-400" />,
        action: () => {
          navigator.clipboard?.writeText(String(calculation));
          onClose();
        },
      });
    }

    // Search apps
    appList.forEach(app => {
      const nameMatch = app.name.toLowerCase().includes(q);
      const keywordMatch = app.keywords.some(k => k.includes(q));
      if (nameMatch || keywordMatch) {
        resultList.push({
          type: 'app',
          name: app.name,
          subtitle: 'Application',
          icon: app.icon,
          action: () => { onOpenApp(app.name); onClose(); },
        });
      }
    });

    // Search documents/files
    documentList.forEach(doc => {
      if (doc.name.toLowerCase().includes(q) || doc.path.toLowerCase().includes(q)) {
        resultList.push({
          type: 'document',
          name: doc.name,
          subtitle: `${doc.path} - ${doc.type === 'folder' ? 'Folder' : 'Document'}`,
          icon: doc.type === 'folder'
            ? <FolderOpen className="w-5 h-5 text-blue-400" />
            : <FileText className="w-5 h-5 text-gray-400" />,
          action: () => {
            if (doc.url) {
              window.open(doc.url, '_blank');
            } else {
              onOpenApp('Finder');
            }
            onClose();
          },
        });
      }
    });

    // Quick web links
    quickLinks.forEach(link => {
      if (link.keywords.some(k => k.includes(q)) || link.name.toLowerCase().includes(q)) {
        resultList.push({
          type: 'web',
          name: link.name,
          subtitle: link.url,
          icon: <Globe className="w-5 h-5 text-cyan-400" />,
          action: () => {
            window.open(link.url, '_blank');
            onClose();
          },
        });
      }
    });

    // Add system actions
    if ('quit'.includes(q) || 'close'.includes(q)) {
      resultList.push({
        type: 'action',
        name: 'Quit Current App',
        subtitle: 'System Action',
        icon: <Command className="w-5 h-5" />,
        action: () => { onQuitApp(); onClose(); },
        shortcut: '⌘Q',
      });
    }

    if ('settings'.includes(q) || 'preferences'.includes(q)) {
      resultList.push({
        type: 'action',
        name: 'Open System Preferences',
        subtitle: 'System Action',
        icon: <Settings className="w-5 h-5" />,
        action: () => { onOpenSettings(); onClose(); },
        shortcut: '⌘,',
      });
    }

    // Web search suggestion (at the end)
    if (q.length > 2 && resultList.length < 10) {
      resultList.push({
        type: 'web',
        name: `Search "${query}" on the web`,
        subtitle: 'Press Enter to search',
        icon: <Search className="w-5 h-5 text-white/50" />,
        action: () => {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          onClose();
        },
      });
    }

    return resultList;
  }, [query, onOpenApp, onQuitApp, onOpenSettings, onClose]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'app': return 'Application';
      case 'document': return 'Document';
      case 'calculation': return 'Calculator - Click to copy';
      case 'web': return 'Web';
      case 'action': return 'System Action';
      default: return type;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[30000] flex items-start justify-center pt-[15%] bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        className="w-[600px] bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/40"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/40 hover:text-white/60 text-sm"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query && (
            <div className="px-4 py-8 text-center text-white/50">
              No results for "{query}"
            </div>
          )}

          {/* Group results by type */}
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.name}-${index}`}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                index === selectedIndex
                  ? "bg-blue-500 text-white"
                  : "text-white/90 hover:bg-white/10"
              )}
              onClick={result.action}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                index === selectedIndex ? "bg-white/20" : "bg-white/10"
              )}>
                {result.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.name}</p>
                <p className={cn(
                  "text-xs truncate",
                  index === selectedIndex ? "text-white/70" : "text-white/50"
                )}>
                  {result.subtitle || getTypeLabel(result.type)}
                </p>
              </div>
              {result.shortcut && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded",
                  index === selectedIndex ? "bg-white/20" : "bg-white/10"
                )}>
                  {result.shortcut}
                </span>
              )}
              {result.type === 'web' && (
                <ExternalLink className={cn(
                  "w-4 h-4",
                  index === selectedIndex ? "text-white/70" : "text-white/40"
                )} />
              )}
              {result.type === 'document' && (
                <ArrowRight className={cn(
                  "w-4 h-4",
                  index === selectedIndex ? "text-white/70" : "text-white/40"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-white/40 text-xs">
          <span>Spotlight Search</span>
          <div className="flex gap-2">
            <span>↑↓ Navigate</span>
            <span>-</span>
            <span>↵ Open</span>
            <span>-</span>
            <span>esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
