import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Hash,
  Volume2,
  ChevronDown,
  ChevronRight,
  Plus,
  Settings,
  Mic,
  MicOff,
  Headphones,
  Phone,
  Video,
  Pin,
  Users,
  Bell,
  Search,
  Inbox,
  HelpCircle,
  Gift,
  ImageIcon,
  Smile,
  PlusCircle,
  Send,
  AtSign,
  Crown,
  Shield,
  Circle,
  MoreHorizontal,
  X,
  ExternalLink,
} from 'lucide-react';

interface ZDiscordWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface Server {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  unreadCount: number;
  hasMentions: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  category?: string;
  unread?: boolean;
  muted?: boolean;
  userCount?: number;
}

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  activity?: string;
  isBot?: boolean;
  role?: 'owner' | 'admin' | 'mod' | 'member';
}

interface Message {
  id: string;
  author: User;
  content: string;
  timestamp: number;
  edited?: boolean;
  mentions?: string[];
  reactions?: { emoji: string; count: number; reacted: boolean }[];
  attachments?: { type: 'image' | 'file'; url: string; name: string }[];
  replyTo?: { author: string; content: string };
}

// Mock Data
const SERVERS: Server[] = [
  { id: 'dm', name: 'Direct Messages', icon: null, color: '#5865f2', unreadCount: 3, hasMentions: true },
  { id: 'hanzo', name: 'Hanzo AI', icon: 'H', color: '#00d4aa', unreadCount: 12, hasMentions: false },
  { id: 'lux', name: 'Lux Network', icon: 'L', color: '#f59e0b', unreadCount: 0, hasMentions: false },
  { id: 'zoo', name: 'Zoo Labs', icon: 'Z', color: '#8b5cf6', unreadCount: 5, hasMentions: true },
  { id: 'dev', name: 'Dev Community', icon: 'D', color: '#ef4444', unreadCount: 0, hasMentions: false },
  { id: 'music', name: 'Music Lounge', icon: 'M', color: '#ec4899', unreadCount: 0, hasMentions: false },
];

const CHANNELS: Record<string, Channel[]> = {
  hanzo: [
    { id: 'announcements', name: 'announcements', type: 'text', category: 'Information', muted: false },
    { id: 'rules', name: 'rules', type: 'text', category: 'Information', muted: true },
    { id: 'general', name: 'general', type: 'text', category: 'Chat', unread: true },
    { id: 'dev-chat', name: 'dev-chat', type: 'text', category: 'Chat', unread: true },
    { id: 'mcp-discussion', name: 'mcp-discussion', type: 'text', category: 'Chat' },
    { id: 'show-and-tell', name: 'show-and-tell', type: 'text', category: 'Chat' },
    { id: 'voice-general', name: 'General', type: 'voice', category: 'Voice', userCount: 3 },
    { id: 'voice-dev', name: 'Dev Talk', type: 'voice', category: 'Voice', userCount: 0 },
  ],
};

const USERS: User[] = [
  { id: 'z', username: 'zeekay', discriminator: '0001', status: 'online', role: 'owner', activity: 'Working on MCP' },
  { id: 'alice', username: 'alice_dev', discriminator: '1234', status: 'online', role: 'admin' },
  { id: 'bob', username: 'bob_builder', discriminator: '5678', status: 'idle', role: 'mod', activity: 'Playing VS Code' },
  { id: 'charlie', username: 'charlie', discriminator: '9012', status: 'dnd', role: 'member' },
  { id: 'dana', username: 'dana_ai', discriminator: '3456', status: 'online', role: 'member', activity: 'Streaming' },
  { id: 'eve', username: 'eve_crypto', discriminator: '7890', status: 'offline', role: 'member' },
  { id: 'frank', username: 'frank_n_beans', discriminator: '2345', status: 'online', role: 'member' },
  { id: 'hanzo-bot', username: 'Hanzo Bot', discriminator: '0000', status: 'online', isBot: true },
];

const CURRENT_USER: User = {
  id: 'me',
  username: 'You',
  discriminator: '1337',
  status: 'online',
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const INITIAL_MESSAGES: Message[] = [
  {
    id: generateId(),
    author: USERS[0],
    content: 'Hey everyone! Welcome to the Hanzo AI Discord. Feel free to ask questions about MCP, our AI tools, or anything else!',
    timestamp: Date.now() - 3600000 * 2,
    reactions: [{ emoji: '👋', count: 5, reacted: false }, { emoji: '🚀', count: 3, reacted: true }],
  },
  {
    id: generateId(),
    author: USERS[7],
    content: 'Hello! I\'m the Hanzo Bot. I can help you with documentation, code examples, and more. Just mention me with @Hanzo Bot!',
    timestamp: Date.now() - 3600000 * 1.5,
  },
  {
    id: generateId(),
    author: USERS[1],
    content: 'Just shipped a new feature for the MCP server. Check out the #announcements channel for details!',
    timestamp: Date.now() - 3600000,
    mentions: ['announcements'],
  },
  {
    id: generateId(),
    author: USERS[2],
    content: 'Nice work @alice_dev! The new context management is amazing.',
    timestamp: Date.now() - 1800000,
    mentions: ['alice_dev'],
    replyTo: { author: 'alice_dev', content: 'Just shipped a new feature for the MCP server...' },
  },
  {
    id: generateId(),
    author: USERS[4],
    content: 'Has anyone tried integrating MCP with the new Claude models? I\'m getting some interesting results.',
    timestamp: Date.now() - 900000,
  },
  {
    id: generateId(),
    author: USERS[3],
    content: 'Working on it now! The context window improvements are really noticeable.',
    timestamp: Date.now() - 600000,
  },
  {
    id: generateId(),
    author: USERS[6],
    content: 'Just joined the server! Excited to learn more about Hanzo AI. Any resources for getting started?',
    timestamp: Date.now() - 300000,
  },
  {
    id: generateId(),
    author: USERS[0],
    content: 'Welcome @frank_n_beans! Check out our docs at https://hanzo.ai/docs and feel free to ask any questions here.',
    timestamp: Date.now() - 120000,
    mentions: ['frank_n_beans'],
  },
];

// Emoji Picker Data
const EMOJI_CATEGORIES = [
  { name: 'Recent', emojis: ['👍', '❤️', '😂', '🔥', '👀', '🚀', '✨', '💯'] },
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌'] },
  { name: 'Gestures', emojis: ['👋', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤝', '👏', '🙌', '🤲', '🙏'] },
  { name: 'Objects', emojis: ['💻', '🖥️', '📱', '💡', '🔧', '⚙️', '🛠️', '📦', '🎮', '🎧', '📚', '✏️'] },
];

// Status colors
const STATUS_COLORS: Record<User['status'], string> = {
  online: '#23a55a',
  idle: '#f0b232',
  dnd: '#f23f43',
  offline: '#80848e',
};

// Discord Icon
const DiscordIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
);

const ZDiscordWindow: React.FC<ZDiscordWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [selectedServer, setSelectedServer] = useState<string>('hanzo');
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMemberList, setShowMemberList] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Information', 'Chat', 'Voice']));
  const [inVoiceChannel, setInVoiceChannel] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current channels
  const currentChannels = useMemo(() => {
    return CHANNELS[selectedServer] || [];
  }, [selectedServer]);

  // Group channels by category
  const channelsByCategory = useMemo(() => {
    const grouped: Record<string, Channel[]> = {};
    currentChannels.forEach(channel => {
      const category = channel.category || 'Channels';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(channel);
    });
    return grouped;
  }, [currentChannels]);

  // Group users by role/status
  const usersByRole = useMemo(() => {
    const online = USERS.filter(u => u.status !== 'offline');
    const offline = USERS.filter(u => u.status === 'offline');
    return { online, offline };
  }, []);

  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  // Send message
  const sendMessage = useCallback(() => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: generateId(),
      author: CURRENT_USER,
      content: messageInput.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setShowEmojiPicker(false);
  }, [messageInput]);

  // Add emoji to input
  const addEmoji = useCallback((emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  }, []);

  // Toggle reaction on message
  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const reactions = msg.reactions || [];
      const existing = reactions.find(r => r.emoji === emoji);

      if (existing) {
        if (existing.reacted) {
          // Remove reaction
          return {
            ...msg,
            reactions: existing.count === 1
              ? reactions.filter(r => r.emoji !== emoji)
              : reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r),
          };
        } else {
          // Add to existing
          return {
            ...msg,
            reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r),
          };
        }
      } else {
        // New reaction
        return {
          ...msg,
          reactions: [...reactions, { emoji, count: 1, reacted: true }],
        };
      }
    }));
  }, []);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Get role icon
  const getRoleIcon = (role?: User['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'admin': return <Shield className="w-3 h-3 text-red-400" />;
      case 'mod': return <Shield className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  // Current server info
  const currentServer = SERVERS.find(s => s.id === selectedServer);

  return (
    <ZWindow
      title="Discord"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1000}
      defaultHeight={700}
      minWidth={800}
      minHeight={500}
      defaultPosition={{ x: 120, y: 50 }}
    >
      <div className="flex h-full bg-[#313338] overflow-hidden">
        {/* Server List Sidebar */}
        <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
          {/* Home/DMs Button */}
          <button
            onClick={() => setSelectedServer('dm')}
            className={cn(
              'w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center',
              selectedServer === 'dm'
                ? 'bg-[#5865f2] rounded-[16px]'
                : 'bg-[#313338] hover:bg-[#5865f2]'
            )}
          >
            <DiscordIcon className="w-7 h-7 text-white" />
          </button>

          {/* Separator */}
          <div className="w-8 h-0.5 bg-[#35363c] rounded-full my-1" />

          {/* Server Icons */}
          {SERVERS.slice(1).map(server => (
            <div key={server.id} className="relative group">
              <button
                onClick={() => setSelectedServer(server.id)}
                className={cn(
                  'w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-white font-semibold text-lg',
                  selectedServer === server.id
                    ? 'rounded-[16px]'
                    : 'hover:rounded-[16px]'
                )}
                style={{ backgroundColor: server.color }}
              >
                {server.icon}
              </button>

              {/* Server indicator */}
              <div className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1 rounded-r-full bg-white transition-all',
                selectedServer === server.id ? 'h-10' : server.unreadCount > 0 ? 'h-2' : 'h-0 opacity-0'
              )} />

              {/* Unread badge */}
              {server.hasMentions && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#f23f43] rounded-full flex items-center justify-center text-[10px] text-white font-bold border-4 border-[#1e1f22]">
                  {server.unreadCount > 9 ? '9+' : server.unreadCount}
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#111214] text-white text-sm font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {server.name}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#111214] rotate-45" />
              </div>
            </div>
          ))}

          {/* Add Server Button */}
          <button className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a55a] transition-all duration-200 flex items-center justify-center text-[#23a55a] hover:text-white">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Channel List Sidebar */}
        <div className="w-60 bg-[#2b2d31] flex flex-col">
          {/* Server Header */}
          <button className="h-12 px-4 flex items-center justify-between hover:bg-[#35373c] transition-colors border-b border-[#1f2023] shadow-sm">
            <span className="text-white font-semibold truncate">{currentServer?.name}</span>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </button>

          {/* Channels List */}
          <ScrollArea className="flex-1">
            <div className="pt-4 px-2">
              {Object.entries(channelsByCategory).map(([category, channels]) => (
                <div key={category} className="mb-4">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-0.5 px-1 mb-1 text-[#949ba4] hover:text-[#dbdee1] text-xs font-semibold uppercase tracking-wide w-full"
                  >
                    <ChevronDown className={cn(
                      'w-3 h-3 transition-transform',
                      !expandedCategories.has(category) && '-rotate-90'
                    )} />
                    <span>{category}</span>
                  </button>

                  {/* Channels */}
                  {expandedCategories.has(category) && channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => channel.type === 'text' ? setSelectedChannel(channel.id) : setInVoiceChannel(channel.id)}
                      className={cn(
                        'w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[15px] group transition-colors',
                        selectedChannel === channel.id && channel.type === 'text'
                          ? 'bg-[#404249] text-white'
                          : 'text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c]',
                        channel.muted && 'opacity-50'
                      )}
                    >
                      {channel.type === 'text' ? (
                        <Hash className="w-5 h-5 shrink-0 text-[#80848e]" />
                      ) : (
                        <Volume2 className="w-5 h-5 shrink-0 text-[#80848e]" />
                      )}
                      <span className="truncate flex-1 text-left">{channel.name}</span>
                      {channel.unread && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                      {channel.type === 'voice' && channel.userCount && channel.userCount > 0 && (
                        <span className="text-xs text-[#949ba4]">{channel.userCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* User Panel */}
          <div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-sm font-medium">
                Y
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#232428]"
                style={{ backgroundColor: STATUS_COLORS[CURRENT_USER.status] }}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{CURRENT_USER.username}</p>
              <p className="text-[#949ba4] text-xs">Online</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center hover:bg-[#35373c] transition-colors',
                  isMuted ? 'text-[#f23f43]' : 'text-[#b5bac1]'
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center hover:bg-[#35373c] transition-colors',
                  isDeafened ? 'text-[#f23f43]' : 'text-[#b5bac1]'
                )}
              >
                <Headphones className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded flex items-center justify-center text-[#b5bac1] hover:bg-[#35373c] transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#313338]">
          {/* Chat Header */}
          <div className="h-12 px-4 flex items-center gap-2 border-b border-[#1f2023] shadow-sm">
            <Hash className="w-6 h-6 text-[#80848e]" />
            <span className="text-white font-semibold">{selectedChannel}</span>
            <div className="w-px h-6 bg-[#3f4147] mx-2" />
            <span className="text-[#949ba4] text-sm truncate flex-1">
              General discussion about Hanzo AI and MCP
            </span>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                <Pin className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMemberList(!showMemberList)}
                className={cn(
                  'transition-colors',
                  showMemberList ? 'text-white' : 'text-[#b5bac1] hover:text-[#dbdee1]'
                )}
              >
                <Users className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#1e1f22] rounded text-[#949ba4] text-sm">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </div>
              <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                <Inbox className="w-5 h-5" />
              </button>
              <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex">
            <ScrollArea className="flex-1 px-4">
              <div className="py-4 space-y-4">
                {/* Channel Welcome */}
                <div className="pb-4 mb-4 border-b border-[#3f4147]">
                  <div className="w-[68px] h-[68px] rounded-full bg-[#41434a] flex items-center justify-center mb-4">
                    <Hash className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-[32px] font-bold text-white mb-2">Welcome to #{selectedChannel}!</h2>
                  <p className="text-[#949ba4]">This is the start of the #{selectedChannel} channel.</p>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                  const showAuthor = idx === 0 || messages[idx - 1].author.id !== msg.author.id ||
                    (msg.timestamp - messages[idx - 1].timestamp) > 300000;
                  const isMention = msg.mentions?.includes(CURRENT_USER.username) ||
                    msg.content.toLowerCase().includes('@you');

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'group relative',
                        showAuthor ? 'mt-4' : 'mt-0.5',
                        isMention && 'bg-[#444037] border-l-2 border-[#f0b132] -mx-4 px-4 py-0.5'
                      )}
                    >
                      {/* Reply Context */}
                      {msg.replyTo && (
                        <div className="flex items-center gap-2 ml-[52px] mb-1 text-[13px]">
                          <div className="w-8 h-0.5 rounded-full bg-[#4e5058] -rotate-90 -translate-x-2" />
                          <span className="text-[#949ba4]">@{msg.replyTo.author}</span>
                          <span className="text-[#949ba4] truncate max-w-[300px]">{msg.replyTo.content}</span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        {/* Avatar or Timestamp */}
                        {showAuthor ? (
                          <div className="relative shrink-0">
                            {msg.author.avatar ? (
                              <img src={msg.author.avatar} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                style={{ backgroundColor: msg.author.isBot ? '#5865f2' : '#5865f2' }}
                              >
                                {msg.author.username[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-[10px] text-[#949ba4]">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          {showAuthor && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                'font-medium hover:underline cursor-pointer',
                                msg.author.role === 'owner' ? 'text-[#f0b132]' :
                                msg.author.role === 'admin' ? 'text-[#f23f43]' :
                                msg.author.isBot ? 'text-[#5865f2]' : 'text-white'
                              )}>
                                {msg.author.username}
                              </span>
                              {msg.author.isBot && (
                                <span className="px-1 py-0.5 bg-[#5865f2] text-white text-[10px] font-medium rounded">
                                  BOT
                                </span>
                              )}
                              {getRoleIcon(msg.author.role)}
                              <span className="text-[#949ba4] text-xs">
                                {formatTime(msg.timestamp)}
                              </span>
                              {msg.edited && (
                                <span className="text-[#949ba4] text-[10px]">(edited)</span>
                              )}
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="text-[#dbdee1] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content.split(/(@\w+|#\w+|https?:\/\/\S+)/g).map((part, i) => {
                              if (part.startsWith('@')) {
                                return <span key={i} className="bg-[#5865f2]/30 text-[#c9cdfb] px-0.5 rounded hover:bg-[#5865f2] hover:text-white cursor-pointer">{part}</span>;
                              }
                              if (part.startsWith('#')) {
                                return <span key={i} className="text-[#00a8fc] hover:underline cursor-pointer">{part}</span>;
                              }
                              if (part.startsWith('http')) {
                                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#00a8fc] hover:underline">{part}</a>;
                              }
                              return part;
                            })}
                          </p>

                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {msg.reactions.map((reaction, i) => (
                                <button
                                  key={i}
                                  onClick={() => toggleReaction(msg.id, reaction.emoji)}
                                  className={cn(
                                    'flex items-center gap-1 px-1.5 py-0.5 rounded border text-sm transition-colors',
                                    reaction.reacted
                                      ? 'bg-[#5865f2]/20 border-[#5865f2] text-[#dee0fc]'
                                      : 'bg-[#2b2d31] border-[#3f4147] text-[#dbdee1] hover:border-[#5865f2]'
                                  )}
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-xs">{reaction.count}</span>
                                </button>
                              ))}
                              <button className="w-6 h-6 rounded flex items-center justify-center bg-[#2b2d31] border border-[#3f4147] text-[#b5bac1] hover:text-white hover:border-[#5865f2] opacity-0 group-hover:opacity-100 transition-all">
                                <Smile className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Message Actions (hover) */}
                        <div className="absolute right-0 -top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center bg-[#2b2d31] border border-[#1e1f22] rounded shadow-lg">
                            {['😀', '❤️', '👍', '🔥'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(msg.id, emoji)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-[#35373c] transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-[#35373c] transition-colors text-[#b5bac1]">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Member List Sidebar */}
            {showMemberList && (
              <div className="w-60 bg-[#2b2d31] border-l border-[#1f2023]">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {/* Online Members */}
                    <div className="mb-4">
                      <h3 className="text-[#949ba4] text-xs font-semibold uppercase tracking-wide mb-2">
                        Online - {usersByRole.online.length}
                      </h3>
                      {usersByRole.online.map(user => (
                        <button
                          key={user.id}
                          className="w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] transition-colors group"
                        >
                          <div className="relative shrink-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: user.isBot ? '#5865f2' : '#5865f2' }}
                            >
                              {user.username[0].toUpperCase()}
                            </div>
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#2b2d31]"
                              style={{ backgroundColor: STATUS_COLORS[user.status] }}
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-1">
                              <span className={cn(
                                'text-sm truncate',
                                user.role === 'owner' ? 'text-[#f0b132]' :
                                user.role === 'admin' ? 'text-[#f23f43]' :
                                'text-[#949ba4] group-hover:text-[#dbdee1]'
                              )}>
                                {user.username}
                              </span>
                              {user.isBot && (
                                <span className="px-1 py-0.5 bg-[#5865f2] text-white text-[8px] font-medium rounded">
                                  BOT
                                </span>
                              )}
                              {getRoleIcon(user.role)}
                            </div>
                            {user.activity && (
                              <p className="text-[#949ba4] text-xs truncate">{user.activity}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Offline Members */}
                    <div>
                      <h3 className="text-[#949ba4] text-xs font-semibold uppercase tracking-wide mb-2">
                        Offline - {usersByRole.offline.length}
                      </h3>
                      {usersByRole.offline.map(user => (
                        <button
                          key={user.id}
                          className="w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-[#35373c] transition-colors opacity-50 hover:opacity-100"
                        >
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-sm font-medium">
                              {user.username[0].toUpperCase()}
                            </div>
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#2b2d31]"
                              style={{ backgroundColor: STATUS_COLORS.offline }}
                            />
                          </div>
                          <span className="text-[#949ba4] text-sm truncate">{user.username}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="px-4 pb-6">
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#383a40] rounded-lg">
                <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                  <PlusCircle className="w-6 h-6" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message #${selectedChannel}`}
                  className="flex-1 bg-transparent text-[#dbdee1] placeholder:text-[#6d6f78] outline-none"
                />

                <div className="flex items-center gap-2">
                  <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                    <Gift className="w-6 h-6" />
                  </button>
                  <button className="text-[#b5bac1] hover:text-[#dbdee1] transition-colors">
                    <ImageIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={cn(
                      'transition-colors',
                      showEmojiPicker ? 'text-[#fcc21b]' : 'text-[#b5bac1] hover:text-[#dbdee1]'
                    )}
                  >
                    <Smile className="w-6 h-6" />
                  </button>
                  {messageInput.trim() && (
                    <button
                      onClick={sendMessage}
                      className="text-[#5865f2] hover:text-[#7983f5] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 right-0 w-[352px] bg-[#2b2d31] rounded-lg shadow-xl border border-[#1e1f22] overflow-hidden z-50">
                  <div className="p-3 border-b border-[#1e1f22]">
                    <div className="flex items-center gap-2 px-2 py-1 bg-[#1e1f22] rounded text-[#949ba4]">
                      <Search className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search emoji"
                        className="flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="p-2">
                      {EMOJI_CATEGORIES.map(category => (
                        <div key={category.name} className="mb-3">
                          <h4 className="text-[#949ba4] text-xs font-semibold uppercase mb-1 px-1">
                            {category.name}
                          </h4>
                          <div className="grid grid-cols-8 gap-0.5">
                            {category.emojis.map((emoji, i) => (
                              <button
                                key={i}
                                onClick={() => addEmoji(emoji)}
                                className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-[#35373c] rounded transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Channel Connected Bar */}
      {inVoiceChannel && (
        <div className="absolute bottom-0 left-[72px] w-60 bg-[#1a1b1e] border-t border-[#232428] p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#23a55a] animate-pulse" />
            <span className="text-[#23a55a] text-xs font-medium">Voice Connected</span>
          </div>
          <div className="flex items-center gap-2 text-[#949ba4] text-sm mb-2">
            <Volume2 className="w-4 h-4" />
            <span>General / Hanzo AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInVoiceChannel(null)}
              className="flex-1 py-1.5 bg-[#f23f43] hover:bg-[#da373c] text-white text-sm font-medium rounded transition-colors"
            >
              Disconnect
            </button>
            <button className="p-1.5 bg-[#35373c] hover:bg-[#3f4147] text-white rounded transition-colors">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </ZWindow>
  );
};

export default ZDiscordWindow;
