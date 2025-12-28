import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { QUICK_LINKS, EXTERNAL_LINKS } from '@/config/links';
import { useRecents } from '@/contexts/RecentsContext';
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
  Sparkles,
  User,
  Zap,
  Scale,
  Play,
  History,
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
               'System Preferences' | 'Photos' | 'FaceTime' | 'TextEdit' | 'Notes' |
               'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI' |
               'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies' |
               'App Store' | 'Xcode';

type ResultCategory = 'top' | 'apps' | 'documents' | 'actions' | 'web' | 'suggestions';

interface SearchResult {
  type: 'app' | 'action' | 'document' | 'calculation' | 'conversion' | 'web' | 'recent' | 'contact' | 'suggestion';
  category: ResultCategory;
  name: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  priority?: number;
}

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (app: AppType) => void;
  onQuitApp: () => void;
  onOpenSettings: () => void;
}

// App definitions with icons and keywords
const appList: { name: AppType; icon: React.ReactNode; keywords: string[] }[] = [
  { name: 'Finder', icon: <Folder className="w-5 h-5" />, keywords: ['files', 'browse', 'folder'] },
  { name: 'Terminal', icon: <Terminal className="w-5 h-5" />, keywords: ['command', 'shell', 'bash', 'console', 'cli'] },
  { name: 'Safari', icon: <Globe className="w-5 h-5" />, keywords: ['browser', 'web', 'internet', 'chrome'] },
  { name: 'Music', icon: <Music className="w-5 h-5" />, keywords: ['songs', 'audio', 'player', 'itunes', 'spotify'] },
  { name: 'Mail', icon: <Mail className="w-5 h-5" />, keywords: ['email', 'inbox', 'messages', 'gmail'] },
  { name: 'Calendar', icon: <Calendar className="w-5 h-5" />, keywords: ['events', 'schedule', 'dates', 'appointments'] },
  { name: 'System Preferences', icon: <Settings className="w-5 h-5" />, keywords: ['settings', 'config', 'options', 'preferences'] },
  { name: 'Photos', icon: <Image className="w-5 h-5" />, keywords: ['pictures', 'gallery', 'images', 'camera'] },
  { name: 'FaceTime', icon: <Video className="w-5 h-5" />, keywords: ['call', 'video', 'chat', 'zoom'] },
  { name: 'Notes', icon: <FileText className="w-5 h-5" />, keywords: ['text', 'write', 'memo', 'textpad', 'note'] },
  { name: 'GitHub Stats', icon: <Github className="w-5 h-5" />, keywords: ['code', 'git', 'repos', 'commits'] },
  { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, keywords: ['chat', 'socials', 'talk', 'twitter', 'x'] },
  { name: 'Activity Monitor', icon: <Activity className="w-5 h-5" />, keywords: ['cpu', 'memory', 'stats', 'system', 'monitor'] },
  { name: 'Hanzo AI', icon: <HanzoLogo />, keywords: ['ai', 'assistant', 'chat', 'intelligence', 'llm'] },
  { name: 'Lux Wallet', icon: <Wallet className="w-5 h-5" />, keywords: ['crypto', 'blockchain', 'money', 'wallet', 'bitcoin'] },
  { name: 'Zoo', icon: <ZooLogo />, keywords: ['assistant', 'ai', 'help', 'research'] },
  { name: 'Calculator', icon: <Calculator className="w-5 h-5" />, keywords: ['math', 'calculate', 'numbers', 'compute'] },
  { name: 'Clock', icon: <Clock className="w-5 h-5" />, keywords: ['time', 'alarm', 'timer', 'world'] },
  { name: 'Weather', icon: <Cloud className="w-5 h-5" />, keywords: ['forecast', 'temperature', 'rain', 'sun'] },
  { name: 'Stickies', icon: <StickyNote className="w-5 h-5" />, keywords: ['notes', 'sticky', 'reminder', 'todo'] },
  { name: 'Xcode', icon: <Command className="w-5 h-5" />, keywords: ['code', 'editor', 'dev', 'programming', 'ide'] },
  { name: 'App Store', icon: <Command className="w-5 h-5" />, keywords: ['store', 'apps', 'download', 'install'] },
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

// Contacts list
const contacts = [
  { name: 'Zach Kelling', email: 'z@hanzo.ai', role: 'CTO' },
  { name: 'Hanzo AI', email: 'hello@hanzo.ai', role: 'Company' },
  { name: 'LUX Support', email: 'support@lux.network', role: 'Support' },
];

// Quick web links
const quickLinks = [
  ...QUICK_LINKS,
  { name: 'Google', url: `${EXTERNAL_LINKS.google}/search?q=`, keywords: ['google', 'search'] },
];

// Unit conversion definitions
interface UnitConversion {
  pattern: RegExp;
  convert: (value: number, match: RegExpMatchArray) => { result: number; unit: string };
  label: string;
}

const unitConversions: UnitConversion[] = [
  // Length
  {
    pattern: /^([\d.]+)\s*(miles?|mi)\s+(in|to)\s+(km|kilometers?|kilometres?)$/i,
    convert: (v) => ({ result: v * 1.60934, unit: 'km' }),
    label: 'kilometers',
  },
  {
    pattern: /^([\d.]+)\s*(km|kilometers?|kilometres?)\s+(in|to)\s+(miles?|mi)$/i,
    convert: (v) => ({ result: v / 1.60934, unit: 'miles' }),
    label: 'miles',
  },
  {
    pattern: /^([\d.]+)\s*(feet|ft)\s+(in|to)\s+(m|meters?|metres?)$/i,
    convert: (v) => ({ result: v * 0.3048, unit: 'm' }),
    label: 'meters',
  },
  {
    pattern: /^([\d.]+)\s*(m|meters?|metres?)\s+(in|to)\s+(feet|ft)$/i,
    convert: (v) => ({ result: v / 0.3048, unit: 'ft' }),
    label: 'feet',
  },
  {
    pattern: /^([\d.]+)\s*(inches?|in)\s+(in|to)\s+(cm|centimeters?|centimetres?)$/i,
    convert: (v) => ({ result: v * 2.54, unit: 'cm' }),
    label: 'centimeters',
  },
  {
    pattern: /^([\d.]+)\s*(cm|centimeters?|centimetres?)\s+(in|to)\s+(inches?|in)$/i,
    convert: (v) => ({ result: v / 2.54, unit: 'in' }),
    label: 'inches',
  },
  // Weight
  {
    pattern: /^([\d.]+)\s*(lbs?|pounds?)\s+(in|to)\s+(kg|kilograms?|kilos?)$/i,
    convert: (v) => ({ result: v * 0.453592, unit: 'kg' }),
    label: 'kilograms',
  },
  {
    pattern: /^([\d.]+)\s*(kg|kilograms?|kilos?)\s+(in|to)\s+(lbs?|pounds?)$/i,
    convert: (v) => ({ result: v / 0.453592, unit: 'lbs' }),
    label: 'pounds',
  },
  {
    pattern: /^([\d.]+)\s*(oz|ounces?)\s+(in|to)\s+(g|grams?)$/i,
    convert: (v) => ({ result: v * 28.3495, unit: 'g' }),
    label: 'grams',
  },
  {
    pattern: /^([\d.]+)\s*(g|grams?)\s+(in|to)\s+(oz|ounces?)$/i,
    convert: (v) => ({ result: v / 28.3495, unit: 'oz' }),
    label: 'ounces',
  },
  // Temperature
  {
    pattern: /^([\d.]+)\s*(f|fahrenheit)\s+(in|to)\s+(c|celsius)$/i,
    convert: (v) => ({ result: (v - 32) * 5/9, unit: 'C' }),
    label: 'Celsius',
  },
  {
    pattern: /^([\d.]+)\s*(c|celsius)\s+(in|to)\s+(f|fahrenheit)$/i,
    convert: (v) => ({ result: v * 9/5 + 32, unit: 'F' }),
    label: 'Fahrenheit',
  },
  // Data
  {
    pattern: /^([\d.]+)\s*(gb|gigabytes?)\s+(in|to)\s+(mb|megabytes?)$/i,
    convert: (v) => ({ result: v * 1024, unit: 'MB' }),
    label: 'megabytes',
  },
  {
    pattern: /^([\d.]+)\s*(mb|megabytes?)\s+(in|to)\s+(gb|gigabytes?)$/i,
    convert: (v) => ({ result: v / 1024, unit: 'GB' }),
    label: 'gigabytes',
  },
  {
    pattern: /^([\d.]+)\s*(tb|terabytes?)\s+(in|to)\s+(gb|gigabytes?)$/i,
    convert: (v) => ({ result: v * 1024, unit: 'GB' }),
    label: 'gigabytes',
  },
];

// Try unit conversion
const tryConversion = (expr: string): { result: number; fromValue: number; fromUnit: string; toUnit: string } | null => {
  for (const conv of unitConversions) {
    const match = expr.match(conv.pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        const { result, unit } = conv.convert(value, match);
        return {
          result: Math.round(result * 10000) / 10000,
          fromValue: value,
          fromUnit: match[2],
          toUnit: unit,
        };
      }
    }
  }
  return null;
};

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

// Quick actions parsing
interface QuickAction {
  pattern: RegExp;
  action: (match: RegExpMatchArray, callbacks: { openApp: (app: AppType) => void; close: () => void }) => void;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
}

const quickActions: QuickAction[] = [
  {
    pattern: /^(new\s+)?note$/i,
    action: (_, { openApp, close }) => { openApp('Notes'); close(); },
    name: 'New Note',
    subtitle: 'Create a new note in Notes',
    icon: <FileText className="w-5 h-5 text-yellow-400" />,
  },
  {
    pattern: /^(send\s+)?email(\s+to\s+(.+))?$/i,
    action: (match, { openApp, close }) => {
      if (match[3]) {
        window.open(`mailto:${match[3]}`, '_blank');
      } else {
        openApp('Mail');
      }
      close();
    },
    name: 'Send Email',
    subtitle: 'Open Mail to compose',
    icon: <Mail className="w-5 h-5 text-blue-400" />,
  },
  {
    pattern: /^play\s+music$/i,
    action: (_, { openApp, close }) => { openApp('Music'); close(); },
    name: 'Play Music',
    subtitle: 'Open Music app',
    icon: <Play className="w-5 h-5 text-pink-400" />,
  },
  {
    pattern: /^(open\s+)?terminal$/i,
    action: (_, { openApp, close }) => { openApp('Terminal'); close(); },
    name: 'Open Terminal',
    subtitle: 'Launch Terminal',
    icon: <Terminal className="w-5 h-5 text-green-400" />,
  },
  {
    pattern: /^(ask\s+)?(hanzo|ai)(\s+.+)?$/i,
    action: (_, { openApp, close }) => { openApp('Hanzo AI'); close(); },
    name: 'Ask Hanzo AI',
    subtitle: 'Open AI assistant',
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
  },
];

// Fuzzy match scoring (simple implementation)
const fuzzyScore = (query: string, text: string): number => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  
  // Exact match
  if (t === q) return 100;
  // Starts with
  if (t.startsWith(q)) return 90;
  // Contains
  if (t.includes(q)) return 70;
  
  // Fuzzy character match
  let score = 0;
  let qIdx = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 10;
      qIdx++;
    }
  }
  
  return qIdx === q.length ? score : 0;
};

// AI-powered suggestion generator (simplified - contextual suggestions)
const getAISuggestions = (query: string, recentApps: string[]): SearchResult[] => {
  const suggestions: SearchResult[] = [];
  const q = query.toLowerCase();
  
  // Time-based suggestions
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17 && (q.includes('work') || q.includes('focus'))) {
    suggestions.push({
      type: 'suggestion',
      category: 'suggestions',
      name: 'Focus Mode',
      subtitle: 'AI suggests: Try the Terminal for focused work',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      action: () => {},
      priority: 50,
    });
  }
  
  // Query-based suggestions
  if (q.includes('code') || q.includes('develop')) {
    suggestions.push({
      type: 'suggestion',
      category: 'suggestions',
      name: 'Open Xcode',
      subtitle: 'AI suggests: Start coding in Xcode',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      action: () => {},
      priority: 60,
    });
  }
  
  if (q.includes('crypto') || q.includes('wallet') || q.includes('bitcoin')) {
    suggestions.push({
      type: 'suggestion',
      category: 'suggestions',
      name: 'Check Lux Wallet',
      subtitle: 'AI suggests: View your crypto portfolio',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      action: () => {},
      priority: 60,
    });
  }
  
  // Recent apps context
  if (recentApps.includes('Terminal') && q.includes('git')) {
    suggestions.push({
      type: 'suggestion',
      category: 'suggestions',
      name: 'Open Terminal for Git',
      subtitle: 'AI suggests: Continue with git in Terminal',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      action: () => {},
      priority: 55,
    });
  }
  
  return suggestions;
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
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Get recents from context
  const { recentItems, recentApps } = useRecents();

  // Build search results based on query
  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    const resultList: SearchResult[] = [];

    if (!q) {
      // Show recent items when empty
      const recentResults: SearchResult[] = [];
      
      // Recent apps (top 3)
      recentApps.slice(0, 3).forEach(appId => {
        const app = appList.find(a => a.name.toLowerCase().replace(/\s/g, '') === appId.toLowerCase());
        if (app) {
          recentResults.push({
            type: 'recent',
            category: 'top',
            name: app.name,
            subtitle: 'Recently Used',
            icon: <div className="relative">{app.icon}<History className="w-3 h-3 absolute -bottom-1 -right-1 text-white/50" /></div>,
            action: () => { onOpenApp(app.name); onClose(); },
            priority: 100,
          });
        }
      });
      
      // Recent files (top 3)
      recentItems.slice(0, 3).forEach(item => {
        recentResults.push({
          type: 'recent',
          category: 'top',
          name: item.name,
          subtitle: item.path,
          icon: item.type === 'folder' 
            ? <FolderOpen className="w-5 h-5 text-blue-400" />
            : <FileText className="w-5 h-5 text-gray-400" />,
          action: () => { onOpenApp('Finder'); onClose(); },
          priority: 90,
        });
      });
      
      // If no recents, show suggested apps
      if (recentResults.length === 0) {
        const suggested: AppType[] = ['Terminal', 'Safari', 'Notes', 'Hanzo AI', 'System Preferences'];
        suggested.forEach(appName => {
          const app = appList.find(a => a.name === appName);
          if (app) {
            resultList.push({
              type: 'app',
              category: 'apps',
              name: app.name,
              subtitle: 'Application',
              icon: app.icon,
              action: () => { onOpenApp(app.name); onClose(); },
            });
          }
        });
      } else {
        resultList.push(...recentResults);
      }
      
      return resultList;
    }

    // Check for unit conversion first
    const conversion = tryConversion(q);
    if (conversion) {
      resultList.push({
        type: 'conversion',
        category: 'top',
        name: `${conversion.result} ${conversion.toUnit}`,
        subtitle: `${conversion.fromValue} ${conversion.fromUnit} = ${conversion.result} ${conversion.toUnit}`,
        icon: <Scale className="w-5 h-5 text-green-400" />,
        action: () => {
          navigator.clipboard?.writeText(String(conversion.result));
          onClose();
        },
        priority: 100,
      });
    }

    // Check for math expression
    const calculation = tryEvaluate(q);
    if (calculation !== null) {
      resultList.push({
        type: 'calculation',
        category: 'top',
        name: `= ${calculation}`,
        subtitle: `${q} - Click to copy`,
        icon: <Hash className="w-5 h-5 text-orange-400" />,
        action: () => {
          navigator.clipboard?.writeText(String(calculation));
          onClose();
        },
        priority: 100,
      });
    }

    // Check for quick actions
    for (const action of quickActions) {
      const match = q.match(action.pattern);
      if (match) {
        resultList.push({
          type: 'action',
          category: 'actions',
          name: action.name,
          subtitle: action.subtitle,
          icon: action.icon,
          action: () => action.action(match, { openApp: onOpenApp, close: onClose }),
          priority: 95,
        });
      }
    }

    // Search apps with fuzzy matching
    appList.forEach(app => {
      const nameScore = fuzzyScore(q, app.name);
      const keywordScore = Math.max(...app.keywords.map(k => fuzzyScore(q, k)));
      const score = Math.max(nameScore, keywordScore);
      
      if (score > 0) {
        resultList.push({
          type: 'app',
          category: 'apps',
          name: app.name,
          subtitle: 'Application',
          icon: app.icon,
          action: () => { onOpenApp(app.name); onClose(); },
          priority: score,
        });
      }
    });

    // Search contacts
    contacts.forEach(contact => {
      const nameScore = fuzzyScore(q, contact.name);
      const emailScore = fuzzyScore(q, contact.email);
      const score = Math.max(nameScore, emailScore);
      
      if (score > 0) {
        resultList.push({
          type: 'contact',
          category: 'documents',
          name: contact.name,
          subtitle: `${contact.email} - ${contact.role}`,
          icon: <User className="w-5 h-5 text-cyan-400" />,
          action: () => {
            window.open(`mailto:${contact.email}`, '_blank');
            onClose();
          },
          priority: score - 10,
        });
      }
    });

    // Search documents/files
    documentList.forEach(doc => {
      const nameScore = fuzzyScore(q, doc.name);
      const pathScore = fuzzyScore(q, doc.path);
      const score = Math.max(nameScore, pathScore);
      
      if (score > 0) {
        resultList.push({
          type: 'document',
          category: 'documents',
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
          priority: score - 20,
        });
      }
    });

    // Quick web links
    quickLinks.forEach(link => {
      const nameScore = fuzzyScore(q, link.name);
      const keywordScore = Math.max(...link.keywords.map(k => fuzzyScore(q, k)));
      const score = Math.max(nameScore, keywordScore);
      
      if (score > 0) {
        resultList.push({
          type: 'web',
          category: 'web',
          name: link.name,
          subtitle: link.url,
          icon: <Globe className="w-5 h-5 text-cyan-400" />,
          action: () => {
            window.open(link.url, '_blank');
            onClose();
          },
          priority: score - 30,
        });
      }
    });

    // Add system actions
    if ('quit'.includes(q) || 'close'.includes(q) || 'exit'.includes(q)) {
      resultList.push({
        type: 'action',
        category: 'actions',
        name: 'Quit Current App',
        subtitle: 'System Action',
        icon: <Command className="w-5 h-5" />,
        action: () => { onQuitApp(); onClose(); },
        shortcut: 'Cmd+Q',
        priority: 80,
      });
    }

    if ('settings'.includes(q) || 'preferences'.includes(q) || 'config'.includes(q)) {
      resultList.push({
        type: 'action',
        category: 'actions',
        name: 'Open System Preferences',
        subtitle: 'System Action',
        icon: <Settings className="w-5 h-5" />,
        action: () => { onOpenSettings(); onClose(); },
        shortcut: 'Cmd+,',
        priority: 80,
      });
    }

    // AI-powered suggestions
    const aiSuggestions = getAISuggestions(q, recentApps);
    resultList.push(...aiSuggestions);

    // Web search suggestion (at the end)
    if (q.length > 2 && resultList.length < 10) {
      resultList.push({
        type: 'web',
        category: 'web',
        name: `Search "${query}" on the web`,
        subtitle: 'Press Enter to search',
        icon: <Search className="w-5 h-5 text-white/50" />,
        action: () => {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          onClose();
        },
        priority: 10,
      });
    }

    // Sort by priority and limit results
    return resultList
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .slice(0, 15);
  }, [query, onOpenApp, onQuitApp, onOpenSettings, onClose, recentItems, recentApps]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<ResultCategory, SearchResult[]> = {
      top: [],
      apps: [],
      documents: [],
      actions: [],
      web: [],
      suggestions: [],
    };
    
    results.forEach(result => {
      groups[result.category].push(result);
    });
    
    return groups;
  }, [results]);

  // Flatten for keyboard navigation
  const flatResults = useMemo(() => {
    const categoryOrder: ResultCategory[] = ['top', 'apps', 'documents', 'actions', 'web', 'suggestions'];
    return categoryOrder.flatMap(cat => groupedResults[cat]);
  }, [groupedResults]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          flatResults[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else {
          setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        }
        break;
    }
  }, [flatResults, selectedIndex, onClose]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const getCategoryLabel = (category: ResultCategory): string => {
    const labels: Record<ResultCategory, string> = {
      top: 'Top Hit',
      apps: 'Applications',
      documents: 'Documents & Contacts',
      actions: 'Actions',
      web: 'Web',
      suggestions: 'Siri Suggestions',
    };
    return labels[category];
  };

  const renderCategory = (category: ResultCategory, items: SearchResult[]) => {
    if (items.length === 0) return null;
    
    const startIndex = flatResults.indexOf(items[0]);
    
    return (
      <div key={category} className="mb-2">
        <div className="px-4 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">
          {getCategoryLabel(category)}
        </div>
        {items.map((result, idx) => {
          const globalIndex = startIndex + idx;
          return (
            <div
              key={`${result.type}-${result.name}-${globalIndex}`}
              data-index={globalIndex}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                globalIndex === selectedIndex
                  ? "bg-blue-500/90 text-white"
                  : "text-white/90 hover:bg-white/10"
              )}
              onClick={result.action}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                globalIndex === selectedIndex ? "bg-white/20" : "bg-white/10"
              )}>
                {result.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.name}</p>
                <p className={cn(
                  "text-xs truncate",
                  globalIndex === selectedIndex ? "text-white/70" : "text-white/50"
                )}>
                  {result.subtitle}
                </p>
              </div>
              {result.shortcut && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded shrink-0",
                  globalIndex === selectedIndex ? "bg-white/20" : "bg-white/10"
                )}>
                  {result.shortcut}
                </span>
              )}
              {result.type === 'web' && (
                <ExternalLink className={cn(
                  "w-4 h-4 shrink-0",
                  globalIndex === selectedIndex ? "text-white/70" : "text-white/40"
                )} />
              )}
              {(result.type === 'document' || result.type === 'contact') && (
                <ArrowRight className={cn(
                  "w-4 h-4 shrink-0",
                  globalIndex === selectedIndex ? "text-white/70" : "text-white/40"
                )} />
              )}
              {result.type === 'suggestion' && (
                <Zap className={cn(
                  "w-4 h-4 shrink-0",
                  globalIndex === selectedIndex ? "text-white/70" : "text-purple-400"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[30000] flex items-start justify-center pt-[12%] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        className={cn(
          "w-[640px] max-w-[90vw]",
          "bg-black/70 backdrop-blur-2xl",
          "border border-white/20 rounded-2xl",
          "shadow-2xl shadow-black/50",
          "overflow-hidden",
          "ring-1 ring-white/10"
        )}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-6 h-6 text-white/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-lg font-light outline-none placeholder:text-white/40"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/40 hover:text-white/60 text-sm px-2 py-1 rounded hover:bg-white/10"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[400px] overflow-y-auto overflow-x-hidden">
          {flatResults.length === 0 && query && (
            <div className="px-4 py-8 text-center text-white/50">
              No results for "{query}"
            </div>
          )}

          {/* Render by category */}
          {(['top', 'apps', 'documents', 'actions', 'web', 'suggestions'] as ResultCategory[]).map(cat => 
            renderCategory(cat, groupedResults[cat])
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-white/40 text-xs">
          <div className="flex items-center gap-2">
            <Command className="w-3 h-3" />
            <span>Spotlight</span>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch;
