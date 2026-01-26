import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Search,
  Send,
  Hash,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  AtSign,
  Bookmark,
  MessageSquare,
  Bell,
  BellOff,
  Pin,
  Smile,
  Paperclip,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  ListOrdered,
  List,
  Quote,
  X,
  Phone,
  Video,
  Users,
  Settings,
  Headphones,
  Circle,
  CheckCircle2,
  Clock,
  Moon,
  Mic,
  MicOff,
  Info,
  Star,
  StarOff,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  CornerUpRight,
  MessageCircle,
  Edit3,
  Trash2,
  Share,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ZSlackWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  reacted: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'code';
  name: string;
  url?: string;
  size?: string;
  preview?: string;
  language?: string;
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  edited?: boolean;
  reactions: Reaction[];
  attachments: Attachment[];
  threadCount?: number;
  threadPreview?: string[];
  pinned?: boolean;
  isBot?: boolean;
}

interface User {
  id: string;
  name: string;
  displayName: string;
  avatar?: string;
  status: 'active' | 'away' | 'dnd' | 'offline';
  statusEmoji?: string;
  statusText?: string;
  title?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm' | 'group';
  isPrivate: boolean;
  description?: string;
  members?: string[];
  unread: number;
  mentioned: boolean;
  muted: boolean;
  starred: boolean;
  topic?: string;
}

interface Workspace {
  id: string;
  name: string;
  icon: string;
  unread: number;
}

// Mock data
const WORKSPACES: Workspace[] = [
  { id: 'hanzo', name: 'Hanzo AI', icon: 'H', unread: 5 },
  { id: 'lux', name: 'Lux Network', icon: 'L', unread: 0 },
  { id: 'zoo', name: 'Zoo Labs', icon: 'Z', unread: 12 },
];

const USERS: User[] = [
  { id: 'u1', name: 'zeekay', displayName: 'Z', status: 'active', title: 'CEO', statusEmoji: '🚀' },
  { id: 'u2', name: 'sarah', displayName: 'Sarah Chen', status: 'active', title: 'CTO', statusEmoji: '💻' },
  { id: 'u3', name: 'marcus', displayName: 'Marcus Johnson', status: 'away', title: 'Lead Engineer', statusText: 'In a meeting' },
  { id: 'u4', name: 'emily', displayName: 'Emily Watson', status: 'dnd', title: 'Designer', statusEmoji: '🎨', statusText: 'Focusing' },
  { id: 'u5', name: 'alex', displayName: 'Alex Rivera', status: 'offline', title: 'DevOps' },
  { id: 'u6', name: 'slackbot', displayName: 'Slackbot', status: 'active', isBot: true },
];

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', type: 'channel', isPrivate: false, unread: 3, mentioned: true, muted: false, starred: true, topic: 'Company-wide announcements and work-based matters', description: 'This is the one channel that will always include everyone.' },
  { id: 'random', name: 'random', type: 'channel', isPrivate: false, unread: 0, mentioned: false, muted: false, starred: false, topic: 'Non-work banter and water cooler conversation' },
  { id: 'engineering', name: 'engineering', type: 'channel', isPrivate: false, unread: 7, mentioned: false, muted: false, starred: true, topic: 'Engineering team discussions' },
  { id: 'design', name: 'design', type: 'channel', isPrivate: false, unread: 0, mentioned: false, muted: true, starred: false },
  { id: 'product', name: 'product', type: 'channel', isPrivate: false, unread: 2, mentioned: false, muted: false, starred: false },
  { id: 'private-ops', name: 'private-ops', type: 'channel', isPrivate: true, unread: 0, mentioned: false, muted: false, starred: false },
  { id: 'dm-sarah', name: 'Sarah Chen', type: 'dm', isPrivate: true, unread: 1, mentioned: false, muted: false, starred: false, members: ['u2'] },
  { id: 'dm-marcus', name: 'Marcus Johnson', type: 'dm', isPrivate: true, unread: 0, mentioned: false, muted: false, starred: false, members: ['u3'] },
  { id: 'group-leads', name: 'Team Leads', type: 'group', isPrivate: true, unread: 0, mentioned: false, muted: false, starred: false, members: ['u2', 'u3', 'u4'] },
];

const PINNED_MESSAGES: Message[] = [
  {
    id: 'pin1',
    channelId: 'general',
    userId: 'u1',
    userName: 'Z',
    content: 'Welcome to Hanzo AI! Please read the company handbook in #onboarding before diving in.',
    timestamp: Date.now() - 86400000 * 7,
    reactions: [{ emoji: '👍', count: 12, users: ['u2', 'u3'], reacted: false }],
    attachments: [],
    pinned: true,
  },
];

const generateMockMessages = (channelId: string): Message[] => {
  const baseMessages: Message[] = [
    {
      id: 'm1',
      channelId,
      userId: 'u1',
      userName: 'Z',
      content: "Hey team! Just pushed the new MCP integration. Check it out and let me know what you think. 🚀",
      timestamp: Date.now() - 3600000 * 2,
      reactions: [
        { emoji: '🚀', count: 5, users: ['u2', 'u3', 'u4', 'u5'], reacted: true },
        { emoji: '👀', count: 3, users: ['u2', 'u3'], reacted: false },
      ],
      attachments: [],
      threadCount: 4,
      threadPreview: ['Sarah Chen', 'Marcus Johnson'],
    },
    {
      id: 'm2',
      channelId,
      userId: 'u2',
      userName: 'Sarah Chen',
      content: "This looks amazing! The latency improvements are incredible. I'm seeing sub-100ms response times.",
      timestamp: Date.now() - 3600000 * 1.5,
      reactions: [{ emoji: '🎉', count: 2, users: ['u1'], reacted: false }],
      attachments: [],
    },
    {
      id: 'm3',
      channelId,
      userId: 'u3',
      userName: 'Marcus Johnson',
      content: "Quick question - are we using the new streaming API or the batch endpoint?",
      timestamp: Date.now() - 3600000,
      reactions: [],
      attachments: [],
    },
    {
      id: 'm4',
      channelId,
      userId: 'u1',
      userName: 'Z',
      content: "Streaming for real-time, batch for bulk operations. Here's the architecture diagram:",
      timestamp: Date.now() - 3600000 * 0.8,
      reactions: [],
      attachments: [
        { id: 'a1', type: 'image', name: 'architecture.png', url: '/images/arch.png', preview: 'https://via.placeholder.com/400x200' },
      ],
    },
    {
      id: 'm5',
      channelId,
      userId: 'u4',
      userName: 'Emily Watson',
      content: "The new UI mockups are ready for review. I've incorporated all the feedback from last week's design review.",
      timestamp: Date.now() - 1800000,
      reactions: [{ emoji: '❤️', count: 4, users: ['u1', 'u2', 'u3'], reacted: true }],
      attachments: [
        { id: 'a2', type: 'file', name: 'design-specs.pdf', size: '2.4 MB' },
        { id: 'a3', type: 'file', name: 'mockups-v2.fig', size: '12.1 MB' },
      ],
      threadCount: 2,
    },
    {
      id: 'm6',
      channelId,
      userId: 'u6',
      userName: 'Slackbot',
      isBot: true,
      content: "Reminder: Team standup in 15 minutes! Join the huddle in #engineering.",
      timestamp: Date.now() - 900000,
      reactions: [],
      attachments: [],
    },
    {
      id: 'm7',
      channelId,
      userId: 'u3',
      userName: 'Marcus Johnson',
      content: "```typescript\nconst handleStream = async (response: ReadableStream) => {\n  const reader = response.getReader();\n  while (true) {\n    const { done, value } = await reader.read();\n    if (done) break;\n    processChunk(value);\n  }\n};\n```",
      timestamp: Date.now() - 600000,
      reactions: [{ emoji: '💡', count: 1, users: ['u1'], reacted: false }],
      attachments: [],
    },
  ];

  return baseMessages.filter(m => m.channelId === channelId || channelId === 'general');
};

const REACTIONS_PALETTE = ['👍', '👎', '❤️', '🎉', '🚀', '👀', '💡', '🔥', '✅', '❌'];

const generateId = () => Math.random().toString(36).substring(2, 15);

const ZSlackWindow: React.FC<ZSlackWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>(generateMockMessages('general'));
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // UI State
  const [expandedSections, setExpandedSections] = useState({
    starred: true,
    channels: true,
    dms: true,
  });
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showThread, setShowThread] = useState<Message | null>(null);
  const [isInHuddle, setIsInHuddle] = useState(false);
  const [huddleMuted, setHuddleMuted] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [currentUserStatus, setCurrentUserStatus] = useState<User['status']>('active');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages when channel changes
  useEffect(() => {
    if (selectedChannel) {
      setMessages(generateMockMessages(selectedChannel.id));
    }
  }, [selectedChannel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (isToday) return time;
    if (isYesterday) return `Yesterday at ${time}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` at ${time}`;
  };

  // Toggle section
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Send message
  const sendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedChannel) return;

    const newMessage: Message = {
      id: generateId(),
      channelId: selectedChannel.id,
      userId: 'u1',
      userName: 'Z',
      content: messageInput.trim(),
      timestamp: Date.now(),
      reactions: [],
      attachments: [],
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setShowFormatting(false);
  }, [messageInput, selectedChannel]);

  // Add reaction
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;

      const existingReaction = m.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.reacted) {
          // Remove reaction
          const newCount = existingReaction.count - 1;
          if (newCount === 0) {
            return { ...m, reactions: m.reactions.filter(r => r.emoji !== emoji) };
          }
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji ? { ...r, count: newCount, reacted: false } : r
            ),
          };
        } else {
          // Add to existing
          return {
            ...m,
            reactions: m.reactions.map(r =>
              r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r
            ),
          };
        }
      } else {
        // New reaction
        return {
          ...m,
          reactions: [...m.reactions, { emoji, count: 1, users: ['u1'], reacted: true }],
        };
      }
    }));
    setShowReactionPicker(null);
  }, []);

  // Pin message
  const togglePinMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, pinned: !m.pinned } : m
    ));
    setShowMessageMenu(null);
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setShowMessageMenu(null);
  }, []);

  // Copy message
  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    setShowMessageMenu(null);
  }, []);

  // Search messages
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = messages.filter(m =>
        m.content.toLowerCase().includes(query.toLowerCase()) ||
        m.userName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [messages]);

  // Star channel
  const toggleStarChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, starred: !c.starred } : c
    ));
  }, []);

  // Mute channel
  const toggleMuteChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, muted: !c.muted } : c
    ));
  }, []);

  // Get user status color
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get user by ID
  const getUserById = (userId: string) => USERS.find(u => u.id === userId);

  // Filtered channels
  const starredChannels = useMemo(() => channels.filter(c => c.starred), [channels]);
  const regularChannels = useMemo(() => channels.filter(c => c.type === 'channel' && !c.starred), [channels]);
  const directMessages = useMemo(() => channels.filter(c => c.type === 'dm' || c.type === 'group'), [channels]);

  // Pinned messages for current channel
  const pinnedMessages = useMemo(() =>
    messages.filter(m => m.pinned && m.channelId === selectedChannel?.id),
    [messages, selectedChannel]
  );

  // Render message content with markdown-like formatting
  const renderContent = (content: string) => {
    // Code blocks
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderInlineContent(content.slice(lastIndex, match.index)));
      }
      parts.push(
        <pre key={match.index} className="bg-[#1a1d21] rounded-md p-3 my-2 overflow-x-auto text-sm font-mono">
          <code>{match[2]}</code>
        </pre>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderInlineContent(content.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : content;
  };

  const renderInlineContent = (text: string) => {
    // Handle inline code, bold, italic, strikethrough
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {line}
      </span>
    ));
  };

  return (
    <ZWindow
      title="Slack"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1100}
      defaultHeight={700}
      minWidth={800}
      minHeight={500}
      defaultPosition={{ x: 80, y: 50 }}
    >
      <div className="flex h-full bg-[#1a1d21] overflow-hidden text-white">
        {/* Workspace Sidebar */}
        <div className="w-[70px] bg-[#3f0e40] flex flex-col items-center py-2 gap-2">
          {/* Workspaces */}
          {WORKSPACES.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace)}
              className={cn(
                'relative w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all',
                activeWorkspace.id === workspace.id
                  ? 'bg-white text-[#3f0e40] rounded-xl'
                  : 'bg-white/20 text-white hover:bg-white/30 rounded-lg'
              )}
            >
              {workspace.icon}
              {workspace.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e01e5a] rounded-full text-[10px] flex items-center justify-center font-medium">
                  {workspace.unread > 9 ? '9+' : workspace.unread}
                </span>
              )}
            </button>
          ))}

          <div className="w-8 h-px bg-white/20 my-2" />

          {/* Add workspace */}
          <button className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Sidebar */}
        <div className="w-[260px] bg-[#3f0e40] flex flex-col border-r border-white/10">
          {/* Workspace Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <button className="flex items-center gap-1 hover:bg-white/10 rounded px-2 py-1 -ml-2 transition-colors">
              <span className="font-bold text-lg">{activeWorkspace.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* User Status */}
          <div className="px-4 py-2 border-b border-white/10">
            <button className="flex items-center gap-2 w-full hover:bg-white/10 rounded px-2 py-1.5 -ml-2 transition-colors">
              <div className="relative">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
                  Z
                </div>
                <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#3f0e40]', getStatusColor(currentUserStatus))} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Z</p>
                <p className="text-xs text-white/60 flex items-center gap-1">
                  <span>🚀</span>
                  {currentUserStatus === 'active' ? 'Active' : currentUserStatus}
                </p>
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-2">
            <button
              onClick={() => setShowSearch(true)}
              className="w-full flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-md text-white/60 text-sm hover:bg-white/20 transition-colors"
            >
              <Search className="w-4 h-4" />
              Search {activeWorkspace.name}
            </button>
          </div>

          <ScrollArea className="flex-1">
            <div className="py-2">
              {/* Threads */}
              <button className="w-full flex items-center gap-2 px-4 py-1.5 text-white/80 hover:bg-white/10 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Threads</span>
              </button>

              {/* Mentions */}
              <button className="w-full flex items-center gap-2 px-4 py-1.5 text-white/80 hover:bg-white/10 transition-colors">
                <AtSign className="w-4 h-4" />
                <span className="text-sm">Mentions & reactions</span>
                <span className="ml-auto w-5 h-5 bg-[#e01e5a] rounded text-xs flex items-center justify-center">2</span>
              </button>

              {/* Drafts */}
              <button className="w-full flex items-center gap-2 px-4 py-1.5 text-white/80 hover:bg-white/10 transition-colors">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Drafts</span>
              </button>

              {/* Saved */}
              <button className="w-full flex items-center gap-2 px-4 py-1.5 text-white/80 hover:bg-white/10 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span className="text-sm">Saved items</span>
              </button>

              <div className="h-px bg-white/10 my-2 mx-4" />

              {/* Starred Section */}
              {starredChannels.length > 0 && (
                <div className="mb-2">
                  <button
                    onClick={() => toggleSection('starred')}
                    className="w-full flex items-center gap-1 px-4 py-1 text-white/60 hover:text-white transition-colors"
                  >
                    {expandedSections.starred ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span className="text-xs font-medium uppercase tracking-wide">Starred</span>
                  </button>
                  {expandedSections.starred && (
                    <div className="mt-1">
                      {starredChannels.map(channel => (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={cn(
                            'w-full flex items-center gap-2 px-4 py-1 transition-colors group',
                            selectedChannel?.id === channel.id
                              ? 'bg-[#1164a3] text-white'
                              : 'text-white/80 hover:bg-white/10'
                          )}
                        >
                          {channel.type === 'channel' ? (
                            channel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500 text-[8px] flex items-center justify-center font-bold">
                              {channel.name[0]}
                            </div>
                          )}
                          <span className={cn('text-sm truncate flex-1 text-left', channel.unread > 0 && 'font-bold')}>
                            {channel.name}
                          </span>
                          {channel.unread > 0 && !channel.muted && (
                            <span className={cn(
                              'min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-medium px-1',
                              channel.mentioned ? 'bg-[#e01e5a]' : 'bg-white/20'
                            )}>
                              {channel.unread}
                            </span>
                          )}
                          {channel.muted && <BellOff className="w-3 h-3 text-white/40" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Channels Section */}
              <div className="mb-2">
                <button
                  onClick={() => toggleSection('channels')}
                  className="w-full flex items-center justify-between px-4 py-1 text-white/60 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    {expandedSections.channels ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span className="text-xs font-medium uppercase tracking-wide">Channels</span>
                  </div>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {expandedSections.channels && (
                  <div className="mt-1">
                    {regularChannels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel)}
                        className={cn(
                          'w-full flex items-center gap-2 px-4 py-1 transition-colors group',
                          selectedChannel?.id === channel.id
                            ? 'bg-[#1164a3] text-white'
                            : 'text-white/80 hover:bg-white/10'
                        )}
                      >
                        {channel.isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                        <span className={cn('text-sm truncate flex-1 text-left', channel.unread > 0 && 'font-bold')}>
                          {channel.name}
                        </span>
                        {channel.unread > 0 && !channel.muted && (
                          <span className="min-w-[18px] h-[18px] bg-white/20 rounded-full text-[10px] flex items-center justify-center font-medium px-1">
                            {channel.unread}
                          </span>
                        )}
                        {channel.muted && <BellOff className="w-3 h-3 text-white/40" />}
                      </button>
                    ))}
                    <button className="w-full flex items-center gap-2 px-4 py-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add channels</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Messages Section */}
              <div className="mb-2">
                <button
                  onClick={() => toggleSection('dms')}
                  className="w-full flex items-center justify-between px-4 py-1 text-white/60 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    {expandedSections.dms ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span className="text-xs font-medium uppercase tracking-wide">Direct Messages</span>
                  </div>
                  <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {expandedSections.dms && (
                  <div className="mt-1">
                    {directMessages.map(channel => {
                      const user = channel.members?.[0] ? getUserById(channel.members[0]) : null;
                      return (
                        <button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          className={cn(
                            'w-full flex items-center gap-2 px-4 py-1 transition-colors group',
                            selectedChannel?.id === channel.id
                              ? 'bg-[#1164a3] text-white'
                              : 'text-white/80 hover:bg-white/10'
                          )}
                        >
                          <div className="relative shrink-0">
                            {channel.type === 'group' ? (
                              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                                <Users className="w-3 h-3" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-cyan-500 text-[10px] flex items-center justify-center font-bold">
                                {channel.name[0]}
                              </div>
                            )}
                            {user && (
                              <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#3f0e40]', getStatusColor(user.status))} />
                            )}
                          </div>
                          <span className={cn('text-sm truncate flex-1 text-left', channel.unread > 0 && 'font-bold')}>
                            {channel.name}
                          </span>
                          {channel.unread > 0 && (
                            <span className="min-w-[18px] h-[18px] bg-white/20 rounded-full text-[10px] flex items-center justify-center font-medium px-1">
                              {channel.unread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button className="w-full flex items-center gap-2 px-4 py-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add teammates</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Huddle */}
          {isInHuddle ? (
            <div className="p-3 border-t border-white/10 bg-[#2e6b3e]">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-medium">Huddle</span>
                <span className="text-xs text-white/60 ml-auto">2 participants</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHuddleMuted(!huddleMuted)}
                  className={cn(
                    'flex-1 py-1.5 rounded text-sm flex items-center justify-center gap-1',
                    huddleMuted ? 'bg-[#e01e5a]' : 'bg-white/20 hover:bg-white/30'
                  )}
                >
                  {huddleMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {huddleMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={() => setIsInHuddle(false)}
                  className="py-1.5 px-3 bg-[#e01e5a] rounded text-sm hover:bg-[#c41e4a] transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => setIsInHuddle(true)}
                className="w-full flex items-center gap-2 py-2 px-3 bg-white/10 rounded text-sm hover:bg-white/20 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                Start a huddle
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#1a1d21]">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  {selectedChannel.type === 'channel' ? (
                    selectedChannel.isPrivate ? <Lock className="w-5 h-5 text-white/60" /> : <Hash className="w-5 h-5 text-white/60" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 text-xs flex items-center justify-center font-bold">
                      {selectedChannel.name[0]}
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-lg">{selectedChannel.name}</h2>
                    {selectedChannel.topic && (
                      <p className="text-xs text-white/50 truncate max-w-md">{selectedChannel.topic}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStarChannel(selectedChannel.id)}
                    className={cn(
                      'p-2 rounded hover:bg-white/10 transition-colors',
                      selectedChannel.starred ? 'text-yellow-400' : 'text-white/60'
                    )}
                  >
                    {selectedChannel.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded hover:bg-white/10 text-white/60 transition-colors">
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                    className={cn(
                      'p-2 rounded hover:bg-white/10 transition-colors',
                      showPinnedMessages ? 'text-white bg-white/10' : 'text-white/60'
                    )}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowChannelInfo(!showChannelInfo)}
                    className={cn(
                      'p-2 rounded hover:bg-white/10 transition-colors',
                      showChannelInfo ? 'text-white bg-white/10' : 'text-white/60'
                    )}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pinned Messages Banner */}
              {showPinnedMessages && pinnedMessages.length > 0 && (
                <div className="px-4 py-3 bg-[#2c2f33] border-b border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Pin className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">Pinned messages</span>
                    <button onClick={() => setShowPinnedMessages(false)} className="ml-auto text-white/60 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {pinnedMessages.map(msg => (
                    <div key={msg.id} className="bg-[#1a1d21] rounded p-2 text-sm">
                      <span className="font-medium">{msg.userName}: </span>
                      <span className="text-white/80">{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4">
                <div className="py-4 space-y-0.5">
                  {messages.map((msg, idx) => {
                    const showHeader = idx === 0 ||
                      messages[idx - 1].userId !== msg.userId ||
                      msg.timestamp - messages[idx - 1].timestamp > 300000;

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'group relative px-4 py-1 -mx-4 hover:bg-white/5 rounded transition-colors',
                          showHeader && 'mt-4 pt-2'
                        )}
                      >
                        {showHeader ? (
                          <div className="flex items-start gap-2">
                            <div className={cn(
                              'w-9 h-9 rounded shrink-0 flex items-center justify-center text-sm font-bold',
                              msg.isBot ? 'bg-white/10' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            )}>
                              {msg.isBot ? '🤖' : msg.userName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold hover:underline cursor-pointer">{msg.userName}</span>
                                {msg.isBot && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">APP</span>}
                                <span className="text-xs text-white/40">{formatTime(msg.timestamp)}</span>
                                {msg.edited && <span className="text-xs text-white/40">(edited)</span>}
                              </div>
                              <div className="text-[15px] text-white/90 break-words">
                                {renderContent(msg.content)}
                              </div>

                              {/* Attachments */}
                              {msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map(att => (
                                    <div key={att.id} className="max-w-md">
                                      {att.type === 'image' ? (
                                        <div className="rounded-lg overflow-hidden border border-white/10">
                                          <img src={att.preview} alt={att.name} className="max-h-[300px] object-cover" />
                                          <div className="p-2 bg-white/5 text-xs text-white/60 flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3" />
                                            {att.name}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                          <File className="w-8 h-8 text-white/40" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{att.name}</p>
                                            <p className="text-xs text-white/40">{att.size}</p>
                                          </div>
                                          <button className="p-2 hover:bg-white/10 rounded transition-colors">
                                            <Download className="w-4 h-4 text-white/60" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reactions */}
                              {msg.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {msg.reactions.map((reaction, i) => (
                                    <button
                                      key={i}
                                      onClick={() => addReaction(msg.id, reaction.emoji)}
                                      className={cn(
                                        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                                        reaction.reacted
                                          ? 'bg-[#1d9bd1]/20 border border-[#1d9bd1] text-[#1d9bd1]'
                                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                                      )}
                                    >
                                      <span>{reaction.emoji}</span>
                                      <span>{reaction.count}</span>
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setShowReactionPicker(msg.id)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
                                  >
                                    <Smile className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {/* Thread preview */}
                              {msg.threadCount && msg.threadCount > 0 && (
                                <button
                                  onClick={() => setShowThread(msg)}
                                  className="flex items-center gap-2 mt-2 text-[#1d9bd1] hover:underline text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  {msg.threadCount} {msg.threadCount === 1 ? 'reply' : 'replies'}
                                  {msg.threadPreview && (
                                    <span className="text-white/40">
                                      from {msg.threadPreview.join(', ')}
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="pl-11">
                            <div className="text-[15px] text-white/90 break-words">
                              {renderContent(msg.content)}
                            </div>
                          </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute right-2 top-0 hidden group-hover:flex items-center gap-0.5 bg-[#1a1d21] border border-white/10 rounded-lg shadow-lg">
                          <button
                            onClick={() => setShowReactionPicker(msg.id)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowThread(msg)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => togglePinMessage(msg.id)}
                            className={cn(
                              'p-1.5 hover:bg-white/10 rounded transition-colors',
                              msg.pinned ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                            )}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowMessageMenu(msg.id)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Reaction Picker */}
                        {showReactionPicker === msg.id && (
                          <div className="absolute right-2 top-8 z-50 flex items-center gap-1 p-2 bg-[#2c2f33] rounded-lg shadow-xl border border-white/10">
                            {REACTIONS_PALETTE.map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => addReaction(msg.id, emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              onClick={() => setShowReactionPicker(null)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-white/60"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Message Menu */}
                        {showMessageMenu === msg.id && (
                          <div className="absolute right-2 top-8 z-50 min-w-[180px] bg-[#2c2f33] rounded-lg shadow-xl border border-white/10 py-1">
                            <button
                              onClick={() => { setEditingMessage(msg.id); setEditText(msg.content); setShowMessageMenu(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit message
                            </button>
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            >
                              <Copy className="w-4 h-4" />
                              Copy text
                            </button>
                            <button
                              onClick={() => togglePinMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            >
                              <Pin className="w-4 h-4" />
                              {msg.pinned ? 'Unpin from channel' : 'Pin to channel'}
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                              <Share className="w-4 h-4" />
                              Share message
                            </button>
                            <div className="h-px bg-white/10 my-1" />
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/10"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete message
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Composer */}
              <div className="px-4 pb-4">
                <div className="bg-[#222529] rounded-lg border border-white/10">
                  {/* Formatting toolbar */}
                  {showFormatting && (
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10">
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <List className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Quote className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Code className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end">
                    <button className="p-3 text-white/60 hover:text-white transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                    <textarea
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={`Message #${selectedChannel.name}`}
                      className="flex-1 bg-transparent text-white text-[15px] py-3 px-0 outline-none resize-none min-h-[44px] max-h-[200px] placeholder:text-white/40"
                      rows={1}
                    />
                    <div className="flex items-center gap-1 p-2">
                      <button
                        onClick={() => setShowFormatting(!showFormatting)}
                        className={cn(
                          'p-1.5 rounded hover:bg-white/10 transition-colors',
                          showFormatting ? 'text-white bg-white/10' : 'text-white/60 hover:text-white'
                        )}
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                        <AtSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input ref={fileInputRef} type="file" className="hidden" />
                      {messageInput.trim() && (
                        <button
                          onClick={sendMessage}
                          className="p-1.5 rounded bg-[#007a5a] hover:bg-[#006b4f] text-white transition-colors ml-1"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40">
              <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
              <h2 className="text-xl font-medium mb-2">Select a channel</h2>
              <p className="text-sm">Choose a channel or DM to start chatting</p>
            </div>
          )}
        </div>

        {/* Channel Info Panel */}
        {showChannelInfo && selectedChannel && (
          <div className="w-[320px] bg-[#1a1d21] border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-lg">About</h3>
              <button
                onClick={() => setShowChannelInfo(false)}
                className="p-1 rounded hover:bg-white/10 text-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Channel Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedChannel.isPrivate ? <Lock className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
                    <h4 className="font-bold text-xl">{selectedChannel.name}</h4>
                  </div>
                  {selectedChannel.starred && (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Starred
                    </div>
                  )}
                </div>

                {/* Topic */}
                {selectedChannel.topic && (
                  <div>
                    <h5 className="text-sm text-white/60 mb-1">Topic</h5>
                    <p className="text-sm">{selectedChannel.topic}</p>
                  </div>
                )}

                {/* Description */}
                {selectedChannel.description && (
                  <div>
                    <h5 className="text-sm text-white/60 mb-1">Description</h5>
                    <p className="text-sm text-white/80">{selectedChannel.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => toggleMuteChannel(selectedChannel.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm transition-colors"
                  >
                    {selectedChannel.muted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    {selectedChannel.muted ? 'Unmute channel' : 'Mute channel'}
                  </button>
                  <button
                    onClick={() => toggleStarChannel(selectedChannel.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm transition-colors"
                  >
                    {selectedChannel.starred ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    {selectedChannel.starred ? 'Remove from starred' : 'Add to starred'}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 text-sm transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy channel link
                  </button>
                </div>

                <div className="h-px bg-white/10" />

                {/* Members */}
                <div>
                  <h5 className="text-sm text-white/60 mb-3">Members</h5>
                  <div className="space-y-2">
                    {USERS.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 text-xs flex items-center justify-center font-bold">
                            {user.displayName[0]}
                          </div>
                          <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#1a1d21]', getStatusColor(user.status))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.displayName}</p>
                          {user.title && <p className="text-xs text-white/40 truncate">{user.title}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 text-[#1d9bd1] text-sm hover:underline">
                    View all members
                  </button>
                </div>

                {/* Pinned */}
                {pinnedMessages.length > 0 && (
                  <>
                    <div className="h-px bg-white/10" />
                    <div>
                      <h5 className="text-sm text-white/60 mb-2">Pinned messages ({pinnedMessages.length})</h5>
                      <button className="text-[#1d9bd1] text-sm hover:underline">
                        View pinned messages
                      </button>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Thread Panel */}
        {showThread && (
          <div className="w-[400px] bg-[#1a1d21] border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold">Thread</h3>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-white/10 text-white/60 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowThread(null)}
                  className="p-1.5 rounded hover:bg-white/10 text-white/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {/* Original message */}
              <div className="pb-4 mb-4 border-b border-white/10">
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-500 to-cyan-500 shrink-0 flex items-center justify-center text-sm font-bold">
                    {showThread.userName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold">{showThread.userName}</span>
                      <span className="text-xs text-white/40">{formatTime(showThread.timestamp)}</span>
                    </div>
                    <div className="text-[15px] text-white/90 break-words">
                      {renderContent(showThread.content)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread replies - mock */}
              <div className="text-sm text-white/40 text-center py-4">
                {showThread.threadCount || 0} replies
              </div>
            </ScrollArea>

            {/* Thread composer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-end gap-2 bg-[#222529] rounded-lg border border-white/10">
                <textarea
                  placeholder="Reply..."
                  className="flex-1 bg-transparent text-white text-sm py-3 px-3 outline-none resize-none min-h-[44px] max-h-[120px] placeholder:text-white/40"
                  rows={1}
                />
                <button className="p-2 text-white/60 hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        {showSearch && (
          <div className="absolute inset-0 bg-black/60 flex items-start justify-center pt-20 z-50">
            <div className="w-[600px] bg-[#1a1d21] rounded-lg shadow-2xl border border-white/10">
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search messages, files, and more..."
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
                  autoFocus
                />
                <button
                  onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                  className="p-1 rounded hover:bg-white/10 text-white/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {searchResults.length > 0 ? (
                <ScrollArea className="max-h-[400px]">
                  <div className="p-2">
                    {searchResults.map(msg => (
                      <button
                        key={msg.id}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 shrink-0 flex items-center justify-center text-xs font-bold">
                          {msg.userName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm">{msg.userName}</span>
                            <span className="text-xs text-white/40">{formatTime(msg.timestamp)}</span>
                          </div>
                          <p className="text-sm text-white/70 truncate">{msg.content}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              ) : searchQuery ? (
                <div className="p-8 text-center text-white/40">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-white/40 mb-3">Recent searches</p>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-sm text-white/80 transition-colors">
                      <Clock className="w-4 h-4 text-white/40" />
                      MCP integration
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-sm text-white/80 transition-colors">
                      <Clock className="w-4 h-4 text-white/40" />
                      design review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ZWindow>
  );
};

export default ZSlackWindow;
