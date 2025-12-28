import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Slider } from './ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Send,
  Sparkles,
  User,
  Zap,
  Settings,
  MessageSquare,
  History,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Pin,
  Copy,
  Check,
  X,
  ChevronLeft,
  Download,
  Code,
  HelpCircle,
  Bug,
  Mail,
  FileText,
  Languages,
  Square,
  Eye,
  EyeOff,
  Clock,
  Keyboard,
} from 'lucide-react';
import { HanzoLogo } from './dock/logos';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface HanzoAIWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  systemPrompt?: string;
}

interface Settings {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streamResponses: boolean;
}

type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  placeholder: string;
};

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  CONVERSATIONS: 'hanzo-ai-conversations',
  SETTINGS: 'hanzo-ai-settings',
  CURRENT_CONVERSATION: 'hanzo-ai-current-conversation',
};

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 4096,
  streamResponses: true,
};

const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
];

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'generate-code',
    label: 'Generate Code',
    icon: <Code className="w-4 h-4" />,
    prompt: 'Generate code for the following requirement:\n\n',
    placeholder: 'Describe what code you need...',
  },
  {
    id: 'explain-code',
    label: 'Explain Code',
    icon: <HelpCircle className="w-4 h-4" />,
    prompt: 'Explain the following code in detail:\n\n```\n',
    placeholder: 'Paste code to explain...',
  },
  {
    id: 'debug-code',
    label: 'Debug Code',
    icon: <Bug className="w-4 h-4" />,
    prompt: 'Debug the following code and identify issues:\n\n```\n',
    placeholder: 'Paste code to debug...',
  },
  {
    id: 'write-email',
    label: 'Write Email',
    icon: <Mail className="w-4 h-4" />,
    prompt: 'Write a professional email for the following purpose:\n\n',
    placeholder: 'Describe the email purpose...',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: <FileText className="w-4 h-4" />,
    prompt: 'Summarize the following text concisely:\n\n',
    placeholder: 'Paste text to summarize...',
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: <Languages className="w-4 h-4" />,
    prompt: 'Translate the following text to English:\n\n',
    placeholder: 'Paste text to translate...',
  },
];

const DEFAULT_SYSTEM_PROMPT = `You are Hanzo AI, a helpful, intelligent assistant. You provide clear, accurate, and thoughtful responses. When writing code, use proper formatting with language-specific syntax highlighting. Be concise but thorough.`;

// ============================================================================
// Utility Functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function encryptApiKey(key: string): string {
  // Simple obfuscation - in production, use proper encryption
  return btoa(key.split('').reverse().join(''));
}

function decryptApiKey(encrypted: string): string {
  try {
    return atob(encrypted).split('').reverse().join('');
  } catch {
    return '';
  }
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function estimateTokens(text: string): number {
  // Rough estimation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

// ============================================================================
// Markdown Rendering
// ============================================================================

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden bg-zinc-900 border border-white/10">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 border-b border-white/10">
        <span className="text-xs text-white/50 font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-white/50 hover:text-white/80 rounded transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm">
        <code className="text-white/90 font-mono">{code}</code>
      </pre>
    </div>
  );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const elements: React.ReactNode[] = [];
  let key = 0;

  // Split content into blocks
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={key++} language={language} code={codeLines.join('\n')} />
      );
      i++;
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-white/95 mt-4 mb-2">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-lg font-semibold text-white/95 mt-4 mb-2">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-xl font-bold text-white/95 mt-4 mb-2">
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // Lists
    if (line.match(/^[-*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-white/85">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-white/85">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={key++}
          className="border-l-2 border-orange-500/50 pl-3 my-2 text-white/70 italic"
        >
          {line.slice(2)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={key++} className="border-white/10 my-4" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-white/85 my-1">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className="leading-relaxed">{elements}</div>;
};

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index === 0) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index === 0) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index === 0) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 bg-white/10 rounded text-orange-300 font-mono text-sm">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Links
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index === 0) {
      parts.push(
        <a key={key++} href={linkMatch[2]} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/[\*`\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onTogglePin,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      )}
      onClick={() => !isEditing && onSelect()}
    >
      {conversation.pinned && (
        <Pin className="w-3 h-3 text-orange-400 flex-shrink-0" />
      )}
      <MessageSquare className="w-4 h-4 text-white/50 flex-shrink-0" />

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveTitle();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="flex-1 bg-white/10 rounded px-2 py-0.5 text-sm text-white outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-sm text-white/80 truncate">{conversation.title}</span>
      )}

      <span className="text-[10px] text-white/40 flex-shrink-0 group-hover:hidden">
        {formatDate(new Date(conversation.updatedAt))}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4 text-white/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
          <DropdownMenuItem
            className="text-white/80 hover:bg-white/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-white/80 hover:bg-white/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            <Pin className="w-4 h-4 mr-2" />
            {conversation.pinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-blue-500'
            : 'bg-gradient-to-br from-orange-500 to-red-600'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <HanzoLogo className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-white/90'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm">
            <MarkdownRenderer content={message.content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-orange-400 animate-pulse" />
            )}
          </div>
        )}
        <p className="text-[10px] mt-2 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
      <HanzoLogo className="w-5 h-5 text-white" />
    </div>
    <div className="bg-white/10 rounded-2xl px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const HanzoAIWindow: React.FC<HanzoAIWindowProps> = ({ onClose }) => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'settings'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Computed values
  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId),
    [conversations, currentConversationId]
  );

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredConversations]);

  const tokenCount = useMemo(() => {
    if (!currentConversation) return 0;
    return currentConversation.messages.reduce(
      (acc, m) => acc + estimateTokens(m.content),
      0
    );
  }, [currentConversation]);

  // Effects
  useEffect(() => {
    // Load data from localStorage
    try {
      const storedConversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (storedConversations) {
        const parsed = JSON.parse(storedConversations);
        setConversations(parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        })));
      }

      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({
          ...parsed,
          apiKey: decryptApiKey(parsed.apiKey || ''),
        });
      }

      const storedCurrentId = localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
      if (storedCurrentId) {
        setCurrentConversationId(storedCurrentId);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }, [conversations]);

  useEffect(() => {
    // Save settings to localStorage
    try {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          ...settings,
          apiKey: encryptApiKey(settings.apiKey),
        })
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  useEffect(() => {
    // Save current conversation ID
    if (currentConversationId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, streamingContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+N: New conversation
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      // Cmd+K: Clear chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleClearChat();
      }
      // Escape: Stop generation
      if (e.key === 'Escape' && isGenerating) {
        e.preventDefault();
        handleStopGeneration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating]);

  // Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [
        {
          id: generateId(),
          role: 'assistant',
          content: "Hello! I'm Hanzo AI. How can I help you today?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      pinned: false,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setInput('');
    setActiveTab('chat');
  }, []);

  const handleClearChat = useCallback(() => {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [
                {
                  id: generateId(),
                  role: 'assistant',
                  content: "Chat cleared. How can I help you?",
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            }
          : c
      )
    );
  }, [currentConversationId]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setIsTyping(false);
    setStreamingContent('');
  }, []);

  const handleRenameConversation = useCallback((id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: new Date() } : c
      )
    );
  }, []);

  const handleDeleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [currentConversationId, conversations]);

  const handleTogglePinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned, updatedAt: new Date() } : c
      )
    );
  }, []);

  const handleExportConversation = useCallback(() => {
    if (!currentConversation) return;
    const markdown = currentConversation.messages
      .map((m) => `**${m.role === 'user' ? 'You' : 'Hanzo AI'}:**\n${m.content}`)
      .join('\n\n---\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentConversation]);

  const handleCopyConversation = useCallback(async () => {
    if (!currentConversation) return;
    const text = currentConversation.messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Hanzo AI'}: ${m.content}`)
      .join('\n\n');
    await navigator.clipboard.writeText(text);
  }, [currentConversation]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isGenerating) return;

    // Create new conversation if none exists
    if (!currentConversationId) {
      handleNewConversation();
      // Wait for state update
      setTimeout(() => sendMessage(content), 100);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title:
                c.messages.length <= 1
                  ? content.trim().slice(0, 40) + (content.length > 40 ? '...' : '')
                  : c.title,
              updatedAt: new Date(),
            }
          : c
      )
    );

    setInput('');
    setSelectedAction(null);
    setIsTyping(true);
    setIsGenerating(true);

    // Check for API key
    if (!settings.apiKey) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Please set your API key in the Settings tab to use Hanzo AI.',
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date() }
            : c
        )
      );
      setIsTyping(false);
      setIsGenerating(false);
      return;
    }

    // Prepare API call
    abortControllerRef.current = new AbortController();
    const conv = conversations.find((c) => c.id === currentConversationId);
    const messages = conv?.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })) || [];

    try {
      // Determine API endpoint based on model
      const isAnthropic = settings.model.startsWith('claude');
      const apiUrl = isAnthropic
        ? 'https://api.anthropic.com/v1/messages'
        : 'https://api.openai.com/v1/chat/completions';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (isAnthropic) {
        headers['x-api-key'] = settings.apiKey;
        headers['anthropic-version'] = '2023-06-01';
      } else {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      const body = isAnthropic
        ? {
            model: settings.model,
            max_tokens: settings.maxTokens,
            system: conv?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
            messages: [...messages, { role: 'user', content: content.trim() }].filter(
              (m) => m.role !== 'system'
            ),
            stream: settings.streamResponses,
          }
        : {
            model: settings.model,
            messages: [
              { role: 'system', content: conv?.systemPrompt || DEFAULT_SYSTEM_PROMPT },
              ...messages,
              { role: 'user', content: content.trim() },
            ],
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: settings.streamResponses,
          };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      let assistantContent = '';

      if (settings.streamResponses && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        setIsTyping(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              let delta = '';

              if (isAnthropic) {
                if (parsed.type === 'content_block_delta') {
                  delta = parsed.delta?.text || '';
                }
              } else {
                delta = parsed.choices?.[0]?.delta?.content || '';
              }

              if (delta) {
                assistantContent += delta;
                setStreamingContent(assistantContent);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } else {
        const data = await response.json();
        assistantContent = isAnthropic
          ? data.content[0].text
          : data.choices[0].message.content;
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() }
            : c
        )
      );
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled
        return;
      }

      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${(error as Error).message}. Please check your API key and try again.`,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date() }
            : c
        )
      );
    } finally {
      setIsTyping(false);
      setIsGenerating(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [currentConversationId, conversations, settings, handleNewConversation, isGenerating]);

  const handleSend = useCallback(() => {
    if (selectedAction) {
      const finalContent = selectedAction.prompt + input + (selectedAction.id.includes('code') ? '\n```' : '');
      sendMessage(finalContent);
    } else {
      sendMessage(input);
    }
  }, [input, selectedAction, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Enter' && !e.shiftKey && !input.includes('\n')) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend, input]);

  // Render helper for settings
  const renderSettings = () => (
    <div className="p-4 space-y-6">
      {/* API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={settings.apiKey}
            onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            placeholder="Enter your API key..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500/50"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
          >
            {showApiKey ? (
              <EyeOff className="w-4 h-4 text-white/50" />
            ) : (
              <Eye className="w-4 h-4 text-white/50" />
            )}
          </button>
        </div>
        <p className="text-xs text-white/40">
          Your API key is encrypted and stored locally.
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Model</label>
        <select
          value={settings.model}
          onChange={(e) => setSettings({ ...settings, model: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
        >
          {MODELS.map((model) => (
            <option key={model.id} value={model.id} className="bg-zinc-900">
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-white/80">Temperature</label>
          <span className="text-sm text-white/50">{settings.temperature.toFixed(1)}</span>
        </div>
        <Slider
          value={[settings.temperature]}
          min={0}
          max={2}
          step={0.1}
          onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
          className="py-2"
        />
        <p className="text-xs text-white/40">
          Lower = more focused, Higher = more creative
        </p>
      </div>

      {/* Max Tokens */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-white/80">Max Tokens</label>
          <span className="text-sm text-white/50">{settings.maxTokens}</span>
        </div>
        <Slider
          value={[settings.maxTokens]}
          min={256}
          max={8192}
          step={256}
          onValueChange={([value]) => setSettings({ ...settings, maxTokens: value })}
          className="py-2"
        />
      </div>

      {/* Stream Responses */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-white/80">Stream Responses</label>
          <p className="text-xs text-white/40">Show responses as they are generated</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, streamResponses: !settings.streamResponses })}
          className={cn(
            'w-12 h-6 rounded-full transition-colors',
            settings.streamResponses ? 'bg-orange-500' : 'bg-white/20'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 bg-white rounded-full transition-transform',
              settings.streamResponses ? 'translate-x-6' : 'translate-x-0.5'
            )}
          />
        </button>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Default System Prompt</label>
        <textarea
          value={currentConversation?.systemPrompt || DEFAULT_SYSTEM_PROMPT}
          onChange={(e) => {
            if (currentConversationId) {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === currentConversationId
                    ? { ...c, systemPrompt: e.target.value }
                    : c
                )
              );
            }
          }}
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500/50 resize-none"
        />
      </div>

      {/* Keyboard Shortcuts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <Keyboard className="w-4 h-4" />
          Keyboard Shortcuts
        </div>
        <div className="space-y-1 text-xs text-white/50">
          <div className="flex justify-between">
            <span>New conversation</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Cmd+N</kbd>
          </div>
          <div className="flex justify-between">
            <span>Send message</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Cmd+Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Clear chat</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Cmd+K</kbd>
          </div>
          <div className="flex justify-between">
            <span>Stop generation</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Escape</kbd>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ZWindow
      title="Hanzo AI"
      onClose={onClose}
      initialPosition={{ x: 150, y: 60 }}
      initialSize={{ width: 900, height: 650 }}
      windowType="default"
    >
      <TooltipProvider>
        <div className="flex h-full bg-gradient-to-b from-zinc-900 to-black">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-64 border-r border-white/10 flex flex-col bg-black/30">
              {/* Sidebar Header */}
              <div className="p-3 border-b border-white/10">
                <button
                  onClick={handleNewConversation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>

              {/* Search */}
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-1 pb-4">
                  {sortedConversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === currentConversationId}
                      onSelect={() => {
                        setCurrentConversationId(conversation.id);
                        setActiveTab('chat');
                      }}
                      onRename={(title) => handleRenameConversation(conversation.id, title)}
                      onDelete={() => handleDeleteConversation(conversation.id)}
                      onTogglePin={() => handleTogglePinConversation(conversation.id)}
                    />
                  ))}
                  {sortedConversations.length === 0 && (
                    <div className="text-center text-white/40 text-sm py-8">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className={cn('w-5 h-5 text-white/60 transition-transform', !showSidebar && 'rotate-180')} />
              </button>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center">
                  <HanzoLogo className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  {currentConversation?.title || 'Hanzo AI'}
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </h3>
                <p className="text-xs text-white/50">
                  {MODELS.find((m) => m.id === settings.model)?.name || 'Frontier Model'} - {tokenCount} tokens
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating && (
                  <button
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
                  >
                    <Square className="w-3 h-3" />
                    Stop
                  </button>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopyConversation}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/60" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Copy conversation</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleExportConversation}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-white/60" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Export as Markdown</TooltipContent>
                </Tooltip>

                <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Ready</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 bg-white/5 border border-white/10 self-start">
                <TabsTrigger value="chat" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                  <History className="w-4 h-4 mr-1.5" />
                  History
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
                {/* Quick Actions */}
                <div className="px-4 py-2 flex gap-2 flex-wrap border-b border-white/5">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(selectedAction?.id === action.id ? null : action)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors',
                        selectedAction?.id === action.id
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                      )}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentConversation?.messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {streamingContent && (
                      <MessageBubble
                        message={{
                          id: 'streaming',
                          role: 'assistant',
                          content: streamingContent,
                          timestamp: new Date(),
                        }}
                        isStreaming
                      />
                    )}
                    {isTyping && !streamingContent && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-black/40">
                  {selectedAction && (
                    <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-orange-300">
                        {selectedAction.icon}
                        <span>{selectedAction.label}</span>
                      </div>
                      <button
                        onClick={() => setSelectedAction(null)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <X className="w-3 h-3 text-orange-300" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-2 bg-white/10 rounded-xl px-4 py-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={selectedAction?.placeholder || 'Message Hanzo AI...'}
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm resize-none max-h-32"
                      rows={1}
                      style={{
                        height: 'auto',
                        minHeight: '24px',
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isGenerating}
                      className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30 mt-2 text-center">
                    Cmd+Enter to send - Powered by Hanzo AI
                  </p>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="flex-1 m-0 p-4 data-[state=inactive]:hidden">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <div className="text-center text-white/40 py-12">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No conversation history yet</p>
                        <p className="text-sm mt-1">Start a new chat to begin</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => {
                            setCurrentConversationId(conv.id);
                            setActiveTab('chat');
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white/90 flex items-center gap-2">
                              {conv.pinned && <Pin className="w-3 h-3 text-orange-400" />}
                              {conv.title}
                            </h4>
                            <span className="text-xs text-white/40">
                              {formatDate(new Date(conv.updatedAt))}
                            </span>
                          </div>
                          <p className="text-sm text-white/50 line-clamp-2">
                            {conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                            <span>{conv.messages.length} messages</span>
                            <span>-</span>
                            <span>{estimateTokens(conv.messages.map((m) => m.content).join(''))} tokens</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="flex-1 m-0 data-[state=inactive]:hidden">
                <ScrollArea className="h-full">{renderSettings()}</ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </TooltipProvider>
    </ZWindow>
  );
};

export default HanzoAIWindow;
