import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  ThumbsUp,
  Check,
  CheckCheck,
  ExternalLink,
  Pin,
  PinOff,
  BellOff,
  Bell,
  Trash2,
  Plus,
  Users,
  User,
  MapPin,
  Play,
  Pause,
  X,
  MessageCircle,
  Reply,
  Forward,
  Copy,
  Edit3,
  RotateCcw,
  ChevronRight,
  Link2,
  UserPlus,
  UserMinus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ZMessagesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface Reaction {
  emoji: string;
  userId: string;
  timestamp: number;
}

interface MessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'gif' | 'link' | 'contact' | 'location' | 'sticker';
  text?: string;
  url?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  duration?: number;
  name?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  stickerId?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: MessageContent;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions: Reaction[];
  replyTo?: string;
  edited?: boolean;
  editedAt?: number;
  deleted?: boolean;
  deletedAt?: number;
  effect?: 'slam' | 'loud' | 'gentle' | 'invisible' | 'confetti' | 'echo' | 'spotlight' | 'balloons';
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  createdAt: number;
  updatedAt: number;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  timestamp: number;
}

// Constants
const STORAGE_KEY = 'zos-messages';
const CONVERSATIONS_KEY = 'zos-messages-conversations';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Social links for integration
const SOCIAL_LINKS = {
  messenger: { url: 'https://m.me/zeekay', name: 'Messenger' },
  instagram: { url: 'https://instagram.com/zeekayai', name: 'Instagram', handle: '@zeekayai' },
  twitter: { url: 'https://x.com/zeekay', name: 'X / Twitter', handle: '@zeekay' },
};

// Message effects
const MESSAGE_EFFECTS = [
  { id: 'slam', name: 'Slam', icon: '💥' },
  { id: 'loud', name: 'Loud', icon: '📢' },
  { id: 'gentle', name: 'Gentle', icon: '🌸' },
  { id: 'invisible', name: 'Invisible Ink', icon: '🫥' },
  { id: 'confetti', name: 'Confetti', icon: '🎉' },
  { id: 'echo', name: 'Echo', icon: '🔊' },
  { id: 'spotlight', name: 'Spotlight', icon: '💡' },
  { id: 'balloons', name: 'Balloons', icon: '🎈' },
];

// Reaction options (tapback style)
const REACTIONS = ['❤️', '👍', '👎', '😂', '‼️', '❓'];

// Stickers/Memoji
const STICKERS = [
  { id: 'wave', emoji: '👋', name: 'Wave' },
  { id: 'thumbsup', emoji: '👍', name: 'Thumbs Up' },
  { id: 'heart', emoji: '❤️', name: 'Heart' },
  { id: 'laugh', emoji: '😂', name: 'Laugh' },
  { id: 'wow', emoji: '😮', name: 'Wow' },
  { id: 'sad', emoji: '😢', name: 'Sad' },
  { id: 'angry', emoji: '😠', name: 'Angry' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'clap', emoji: '👏', name: 'Clap' },
  { id: 'thinking', emoji: '🤔', name: 'Thinking' },
];

// Default current user
const CURRENT_USER: Participant = {
  id: 'me',
  name: 'You',
  avatar: undefined,
  isOnline: true,
};

// Icons
const MessengerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const XTwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const StickerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);

const ZMessagesWindow: React.FC<ZMessagesWindowProps> = ({ onClose, onFocus }) => {
  // Load conversations from localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.error('Failed to load conversations:', e);
    }
    return [
      {
        id: 'welcome',
        type: 'direct',
        participants: [
          CURRENT_USER,
          { id: 'z', name: 'Z', avatar: undefined, isOnline: true },
        ],
        lastMessage: undefined,
        unreadCount: 0,
        pinned: true,
        muted: false,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now(),
      },
    ];
  });

  // Load messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.error('Failed to load messages:', e);
    }
    return [
      {
        id: generateId(),
        conversationId: 'welcome',
        senderId: 'z',
        content: { type: 'text', text: "Hey! 👋 Welcome to Messages." },
        timestamp: Date.now() - 60000,
        status: 'read',
        reactions: [],
      },
      {
        id: generateId(),
        conversationId: 'welcome',
        senderId: 'z',
        content: {
          type: 'text',
          text: "Feel free to message me here! I'm usually quick to respond.\n\nYou can ask me about:\n• Hanzo AI & our products\n• Lux blockchain\n• Collaboration opportunities\n• Or just say hi!",
        },
        timestamp: Date.now() - 30000,
        status: 'read',
        reactions: [],
      },
    ];
  });

  // UI State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('welcome');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showEffectPicker, setShowEffectPicker] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [typingIndicators] = useState<TypingIndicator[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [revealedInvisible, setRevealedInvisible] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      logger.error('Failed to save messages:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (e) {
      logger.error('Failed to save conversations:', e);
    }
  }, [conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  // Get current conversation
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  // Get messages for current conversation
  const conversationMessages = useMemo(
    () =>
      messages
        .filter((m) => m.conversationId === selectedConversationId && !m.deleted)
        .sort((a, b) => a.timestamp - b.timestamp),
    [messages, selectedConversationId]
  );

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.participants.some((p) => p.name.toLowerCase().includes(query))
      );
    }
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [conversations, searchQuery]);

  // Get other participant in direct conversation
  const getOtherParticipant = useCallback((conv: Conversation) => {
    if (conv.type === 'group') return null;
    return conv.participants.find((p) => p.id !== CURRENT_USER.id);
  }, []);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (isYesterday) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Send message
  const sendMessage = useCallback(() => {
    if (!messageInput.trim() && !replyingTo) return;
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: generateId(),
      conversationId: selectedConversationId,
      senderId: CURRENT_USER.id,
      content: { type: 'text', text: messageInput.trim() },
      timestamp: Date.now(),
      status: 'sending',
      reactions: [],
      replyTo: replyingTo?.id,
      effect: selectedEffect as Message['effect'],
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    setReplyingTo(null);
    setSelectedEffect(null);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: newMessage, updatedAt: Date.now() }
          : c
      )
    );

    // Simulate sending states
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'sent' } : m))
      );
    }, 300);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m))
      );
    }, 800);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' } : m))
      );
    }, 1500);
  }, [messageInput, selectedConversationId, replyingTo, selectedEffect]);

  // Send sticker
  const sendSticker = useCallback((sticker: { id: string; emoji: string }) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: generateId(),
      conversationId: selectedConversationId,
      senderId: CURRENT_USER.id,
      content: { type: 'sticker', stickerId: sticker.id, text: sticker.emoji },
      timestamp: Date.now(),
      status: 'sent',
      reactions: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setShowStickerPicker(false);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: newMessage, updatedAt: Date.now() }
          : c
      )
    );
  }, [selectedConversationId]);

  // Send quick reaction (thumbs up)
  const sendQuickReaction = useCallback(() => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: generateId(),
      conversationId: selectedConversationId,
      senderId: CURRENT_USER.id,
      content: { type: 'sticker', stickerId: 'thumbsup', text: '👍' },
      timestamp: Date.now(),
      status: 'sent',
      reactions: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: newMessage, updatedAt: Date.now() }
          : c
      )
    );
  }, [selectedConversationId]);

  // Add reaction to message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const existingReaction = m.reactions.find(
          (r) => r.userId === CURRENT_USER.id && r.emoji === emoji
        );
        if (existingReaction) {
          return {
            ...m,
            reactions: m.reactions.filter(
              (r) => !(r.userId === CURRENT_USER.id && r.emoji === emoji)
            ),
          };
        }
        return {
          ...m,
          reactions: [
            ...m.reactions.filter((r) => r.userId !== CURRENT_USER.id),
            { emoji, userId: CURRENT_USER.id, timestamp: Date.now() },
          ],
        };
      })
    );
    setShowReactionPicker(null);
  }, []);

  // Edit message
  const saveEdit = useCallback(() => {
    if (!editingMessage || !editText.trim()) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === editingMessage.id
          ? {
              ...m,
              content: { ...m.content, text: editText.trim() },
              edited: true,
              editedAt: Date.now(),
            }
          : m
      )
    );
    setEditingMessage(null);
    setEditText('');
    toast.success('Message edited');
  }, [editingMessage, editText]);

  // Unsend message
  const unsendMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, deleted: true, deletedAt: Date.now() } : m
      )
    );
    setShowMessageMenu(null);
    toast.success('Message unsent');
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setShowMessageMenu(null);
    toast.success('Message deleted');
  }, []);

  // Copy message
  const copyMessage = useCallback((message: Message) => {
    if (message.content.text) {
      navigator.clipboard.writeText(message.content.text);
      toast.success('Message copied');
    }
    setShowMessageMenu(null);
  }, []);

  // Forward message
  const forwardMessage = useCallback(() => {
    setShowNewConversation(true);
    setShowMessageMenu(null);
    toast.info('Select a conversation to forward to');
  }, []);

  // Toggle pin conversation
  const togglePin = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  // Toggle mute conversation
  const toggleMute = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, muted: !c.muted } : c))
    );
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    setMessages((prev) => prev.filter((m) => m.conversationId !== convId));
    if (selectedConversationId === convId) {
      setSelectedConversationId(null);
    }
    toast.success('Conversation deleted');
  }, [selectedConversationId]);

  // Create new conversation
  const createConversation = useCallback((name: string, isGroup: boolean = false) => {
    const newConv: Conversation = {
      id: generateId(),
      type: isGroup ? 'group' : 'direct',
      name: isGroup ? name : undefined,
      participants: [CURRENT_USER, { id: generateId(), name, isOnline: false }],
      unreadCount: 0,
      pinned: false,
      muted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setSelectedConversationId(newConv.id);
    setShowNewConversation(false);
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedConversationId) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newMessage: Message = {
          id: generateId(),
          conversationId: selectedConversationId,
          senderId: CURRENT_USER.id,
          content: {
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: reader.result as string,
          },
          timestamp: Date.now(),
          status: 'sent',
          reactions: [],
        };
        setMessages((prev) => [...prev, newMessage]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversationId
              ? { ...c, lastMessage: newMessage, updatedAt: Date.now() }
              : c
          )
        );
      };
      reader.readAsDataURL(file);
    });
  }, [selectedConversationId]);

  // Open social link
  const openSocialLink = (url: string) => {
    window.open(url, '_blank');
  };

  // Reveal invisible ink message
  const revealInvisible = (messageId: string) => {
    setRevealedInvisible((prev) => new Set(prev).add(messageId));
  };

  // Get message bubble classes with effects
  const getMessageBubbleClasses = (message: Message, isFromMe: boolean) => {
    const base = cn(
      'max-w-[75%] px-3 py-2 rounded-2xl relative',
      isFromMe
        ? 'bg-gradient-to-r from-[#0084ff] to-[#0099ff] text-white ml-auto'
        : 'bg-[#303030] text-white'
    );

    if (message.effect === 'slam') return cn(base, 'animate-slam');
    if (message.effect === 'loud') return cn(base, 'text-2xl font-bold');
    if (message.effect === 'gentle') return cn(base, 'opacity-60 text-sm');
    if (message.effect === 'invisible' && !revealedInvisible.has(message.id)) {
      return cn(base, 'blur-sm cursor-pointer hover:blur-none transition-all duration-300');
    }

    return base;
  };

  // Render message content
  const renderMessageContent = (message: Message) => {
    const { content } = message;
    const isFromMe = message.senderId === CURRENT_USER.id;

    switch (content.type) {
      case 'image':
        return (
          <img
            src={content.url}
            alt="Shared image"
            className="max-w-[280px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(content.url, '_blank')}
          />
        );

      case 'video':
        return (
          <video src={content.url} controls className="rounded-xl w-full max-w-[280px]" />
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <button
              onClick={() => setPlayingAudio(playingAudio === message.id ? null : message.id)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              {playingAudio === message.id ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="h-1 bg-white/30 rounded-full">
                <div className="h-1 bg-white rounded-full w-1/3" />
              </div>
              <span className="text-xs opacity-70 mt-1">
                {content.duration
                  ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}`
                  : '0:00'}
              </span>
            </div>
          </div>
        );

      case 'gif':
        return <img src={content.url} alt="GIF" className="max-w-[200px] rounded-xl" />;

      case 'link':
        return (
          <a href={content.url} target="_blank" rel="noopener noreferrer" className="block">
            {content.thumbnail && (
              <img src={content.thumbnail} alt={content.title} className="w-full rounded-t-xl" />
            )}
            <div className={cn('p-3', isFromMe ? 'bg-white/10' : 'bg-white/5', content.thumbnail ? 'rounded-b-xl' : 'rounded-xl')}>
              <p className="font-medium text-sm">{content.title}</p>
              {content.description && (
                <p className="text-xs opacity-70 mt-1 line-clamp-2">{content.description}</p>
              )}
              <p className="text-xs opacity-50 mt-1 flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {content.url && new URL(content.url).hostname}
              </p>
            </div>
          </a>
        );

      case 'contact':
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">{content.name}</p>
              {content.phone && <p className="text-xs opacity-70">{content.phone}</p>}
              {content.email && <p className="text-xs opacity-70">{content.email}</p>}
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="min-w-[200px]">
            <div className="h-32 bg-white/10 rounded-t-xl flex items-center justify-center">
              <MapPin className="w-8 h-8 opacity-50" />
            </div>
            <div className={cn('p-2 rounded-b-xl', isFromMe ? 'bg-white/10' : 'bg-white/5')}>
              <p className="text-sm">{content.address || 'Shared location'}</p>
            </div>
          </div>
        );

      case 'sticker':
        return <span className="text-6xl">{content.text}</span>;

      default:
        if (message.effect === 'invisible' && !revealedInvisible.has(message.id)) {
          return (
            <p
              className="text-[15px] whitespace-pre-wrap leading-relaxed cursor-pointer select-none"
              onClick={() => revealInvisible(message.id)}
            >
              {content.text}
            </p>
          );
        }
        return (
          <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{content.text}</p>
        );
    }
  };

  // Render reactions on message
  const renderReactions = (message: Message) => {
    if (message.reactions.length === 0) return null;

    const grouped = message.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex gap-1 mt-1">
        {Object.entries(grouped).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => addReaction(message.id, emoji)}
            className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors"
          >
            <span>{emoji}</span>
            {count > 1 && <span className="text-white/70">{count}</span>}
          </button>
        ))}
      </div>
    );
  };

  // Render reply preview
  const renderReplyPreview = (replyToId: string) => {
    const replyMessage = messages.find((m) => m.id === replyToId);
    if (!replyMessage) return null;

    return (
      <div className="text-xs opacity-70 border-l-2 border-white/30 pl-2 mb-1">
        <span className="font-medium">
          {replyMessage.senderId === CURRENT_USER.id ? 'You' : 'Them'}
        </span>
        <p className="truncate">
          {replyMessage.content.text ||
            (replyMessage.content.type === 'image'
              ? '📷 Photo'
              : replyMessage.content.type === 'video'
              ? '🎬 Video'
              : replyMessage.content.type === 'audio'
              ? '🎤 Audio'
              : 'Message')}
        </p>
      </div>
    );
  };

  return (
    <ZWindow
      title="Messages"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={900}
      defaultHeight={650}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 100, y: 60 }}
    >
      <div className="flex h-full bg-[#000000] overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-[#1c1c1e] border-r border-white/10 flex flex-col">
          {/* Search Header */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#2c2c2e] rounded-lg">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
              />
            </div>
          </div>

          {/* New Conversation Button */}
          <div className="px-3 py-2 border-b border-white/10">
            <button
              onClick={() => setShowNewConversation(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#0a84ff] hover:bg-white/5 rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="py-1">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const displayName = conv.type === 'group' ? conv.name : other?.name;
                const isSelected = selectedConversationId === conv.id;

                return (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 transition-colors',
                        isSelected ? 'bg-[#0a84ff]/20' : 'hover:bg-white/5'
                      )}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {conv.type === 'group' ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                            {displayName?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        {other?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#31a24c] rounded-full border-2 border-[#1c1c1e]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          {conv.pinned && <Pin className="w-3 h-3 text-white/50" />}
                          <span className="font-medium text-white truncate">{displayName}</span>
                          {conv.muted && <BellOff className="w-3 h-3 text-white/40" />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-sm text-white/50 truncate flex-1">
                            {conv.lastMessage?.content.text ||
                              (conv.lastMessage?.content.type === 'image'
                                ? '📷 Photo'
                                : conv.lastMessage?.content.type === 'video'
                                ? '🎬 Video'
                                : 'Start a conversation')}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-xs text-white/30 shrink-0">
                              {formatTime(conv.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread badge */}
                      {conv.unreadCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-[#0a84ff] flex items-center justify-center text-xs text-white font-medium shrink-0">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>

                    {/* Hover actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(conv.id); }}
                        className="p-1.5 rounded-full bg-[#2c2c2e] text-white/60 hover:text-white hover:bg-[#3c3c3e] transition-colors"
                        title={conv.pinned ? 'Unpin' : 'Pin'}
                      >
                        {conv.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(conv.id); }}
                        className="p-1.5 rounded-full bg-[#2c2c2e] text-white/60 hover:text-white hover:bg-[#3c3c3e] transition-colors"
                        title={conv.muted ? 'Unmute' : 'Mute'}
                      >
                        {conv.muted ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                        className="p-1.5 rounded-full bg-[#2c2c2e] text-white/60 hover:text-red-400 hover:bg-[#3c3c3e] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Social Links */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => setShowSocialLinks(!showSocialLinks)}
              className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="flex-1 text-left">Contact Links</span>
              <ChevronRight className={cn('w-4 h-4 transition-transform', showSocialLinks && 'rotate-90')} />
            </button>
            {showSocialLinks && (
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => openSocialLink(SOCIAL_LINKS.messenger.url)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <MessengerIcon className="w-5 h-5 text-[#0084ff]" />
                  <span className="text-sm text-white/80">Messenger</span>
                  <ExternalLink className="w-3 h-3 text-white/40 ml-auto" />
                </button>
                <button
                  onClick={() => openSocialLink(SOCIAL_LINKS.instagram.url)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <InstagramIcon className="w-5 h-5 text-[#e4405f]" />
                  <span className="text-sm text-white/80">@zeekayai</span>
                  <ExternalLink className="w-3 h-3 text-white/40 ml-auto" />
                </button>
                <button
                  onClick={() => openSocialLink(SOCIAL_LINKS.twitter.url)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <XTwitterIcon className="w-5 h-5 text-white" />
                  <span className="text-sm text-white/80">@zeekay</span>
                  <ExternalLink className="w-3 h-3 text-white/40 ml-auto" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1c1c1e] border-b border-white/10">
              <div className="relative">
                {selectedConversation.type === 'group' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {(selectedConversation.type === 'group'
                      ? selectedConversation.name
                      : getOtherParticipant(selectedConversation)?.name)?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {getOtherParticipant(selectedConversation)?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#31a24c] rounded-full border-2 border-[#1c1c1e]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {selectedConversation.type === 'group'
                    ? selectedConversation.name
                    : getOtherParticipant(selectedConversation)?.name}
                </p>
                <p className="text-[#65676b] text-xs flex items-center gap-1">
                  {getOtherParticipant(selectedConversation)?.isOnline ? (
                    <>
                      <span className="w-2 h-2 bg-[#31a24c] rounded-full" />
                      Active now
                    </>
                  ) : selectedConversation.type === 'group' ? (
                    `${selectedConversation.participants.length} members`
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSocialLink(SOCIAL_LINKS.messenger.url)}
                  className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openSocialLink(SOCIAL_LINKS.messenger.url)}
                  className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => selectedConversation.type === 'group' && setShowGroupSettings(true)}
                  className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {/* Profile Card for welcome conversation */}
                {selectedConversationId === 'welcome' && conversationMessages.length <= 2 && (
                  <div className="flex flex-col items-center py-6 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg">
                      Z
                    </div>
                    <h3 className="text-white font-semibold text-lg">Z</h3>
                    <p className="text-[#65676b] text-sm">zeekay.ai</p>
                    <p className="text-[#65676b] text-xs mt-1">CEO, Hanzo AI</p>
                  </div>
                )}

                {/* Messages */}
                {conversationMessages.map((msg, idx) => {
                  const isFromMe = msg.senderId === CURRENT_USER.id;
                  const showAvatar =
                    !isFromMe &&
                    (idx === 0 || conversationMessages[idx - 1].senderId !== msg.senderId);

                  return (
                    <div key={msg.id} className="group relative">
                      <div className={cn('flex items-end gap-2', isFromMe ? 'justify-end' : 'justify-start')}>
                        {/* Avatar */}
                        {!isFromMe && (
                          <div className="w-8 shrink-0">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                {selectedConversation.participants.find((p) => p.id === msg.senderId)?.name?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={getMessageBubbleClasses(msg, isFromMe)}
                          onDoubleClick={() => setShowReactionPicker(msg.id)}
                          onClick={() => { if (msg.effect === 'invisible') revealInvisible(msg.id); }}
                        >
                          {/* Reply preview */}
                          {msg.replyTo && renderReplyPreview(msg.replyTo)}

                          {/* Content */}
                          {renderMessageContent(msg)}

                          {/* Edited indicator */}
                          {msg.edited && <span className="text-[10px] opacity-50 ml-2">(edited)</span>}

                          {/* Effect indicator */}
                          {msg.effect && msg.effect !== 'invisible' && (
                            <span className="absolute -top-2 -right-2 text-sm">
                              {MESSAGE_EFFECTS.find((e) => e.id === msg.effect)?.icon}
                            </span>
                          )}
                        </div>

                        {/* Message actions (hover) */}
                        <div className={cn('absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity', isFromMe ? 'left-0' : 'right-0')}>
                          <button
                            onClick={() => setShowReactionPicker(msg.id)}
                            className="p-1 rounded-full bg-[#303030] text-white/60 hover:text-white hover:bg-[#3a3a3a] transition-colors"
                          >
                            <Smile className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 rounded-full bg-[#303030] text-white/60 hover:text-white hover:bg-[#3a3a3a] transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowMessageMenu(msg.id)}
                            className="p-1 rounded-full bg-[#303030] text-white/60 hover:text-white hover:bg-[#3a3a3a] transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className={cn('mt-1', isFromMe ? 'text-right' : 'text-left pl-10')}>
                        {renderReactions(msg)}
                      </div>

                      {/* Status for sent messages */}
                      {isFromMe && idx === conversationMessages.length - 1 && (
                        <div className="flex justify-end mt-1">
                          <div className="flex items-center gap-1 text-[#65676b] text-xs">
                            {msg.status === 'sending' && <span className="animate-pulse">Sending...</span>}
                            {msg.status === 'sent' && <Check className="w-3 h-3" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                            {msg.status === 'read' && (
                              <>
                                <CheckCheck className="w-3 h-3 text-[#0084ff]" />
                                <span>Seen</span>
                              </>
                            )}
                            {msg.status === 'failed' && <span className="text-red-500">Failed</span>}
                          </div>
                        </div>
                      )}

                      {/* Reaction picker */}
                      {showReactionPicker === msg.id && (
                        <div className={cn('absolute z-50 flex items-center gap-1 p-1.5 bg-[#303030] rounded-full shadow-lg', isFromMe ? 'left-0 top-0' : 'right-0 top-0')}>
                          {REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(msg.id, emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setShowReactionPicker(null)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-white/60"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Message menu */}
                      {showMessageMenu === msg.id && (
                        <div className={cn('absolute z-50 min-w-[160px] bg-[#2c2c2e] rounded-lg shadow-lg overflow-hidden', isFromMe ? 'left-0 top-0' : 'right-0 top-0')}>
                          <button
                            onClick={() => { setReplyingTo(msg); setShowMessageMenu(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </button>
                          <button
                            onClick={() => copyMessage(msg)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => forwardMessage()}
                            className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                          >
                            <Forward className="w-4 h-4" />
                            Forward
                          </button>
                          {isFromMe && msg.content.type === 'text' && (
                            <button
                              onClick={() => { setEditingMessage(msg); setEditText(msg.content.text || ''); setShowMessageMenu(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {isFromMe && (
                            <button
                              onClick={() => unsendMessage(msg.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-orange-400 hover:bg-white/10 text-sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Unsend
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-white/10 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                          <div className="border-t border-white/10" />
                          <button
                            onClick={() => setShowMessageMenu(null)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-white/60 hover:bg-white/10 text-sm"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typingIndicators.some((t) => t.conversationId === selectedConversationId) && (
                  <div className="flex items-center gap-2 pl-10">
                    <div className="px-4 py-2 bg-[#303030] rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Card for welcome conversation */}
                {selectedConversationId === 'welcome' && (
                  <div className="flex justify-center mt-6">
                    <div className="bg-[#1c1c1c] rounded-2xl p-5 max-w-[90%] text-center border border-white/5">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#0078ff] flex items-center justify-center">
                        <MessengerIcon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-1">Message me on Messenger</h3>
                      <p className="text-[#65676b] text-sm mb-4">Click below to start chatting</p>
                      <button
                        onClick={() => openSocialLink(SOCIAL_LINKS.messenger.url)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#00c6ff] to-[#0078ff] hover:opacity-90 text-white rounded-full font-semibold transition-opacity"
                      >
                        <MessengerIcon className="w-5 h-5" />
                        Open Messenger
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* Alternative links */}
                      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                        <a
                          href={SOCIAL_LINKS.twitter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#65676b] hover:text-white text-sm transition-colors flex items-center gap-1"
                        >
                          <XTwitterIcon className="w-4 h-4" />
                          @zeekay
                        </a>
                        <span className="text-[#65676b]">|</span>
                        <a
                          href={SOCIAL_LINKS.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#65676b] hover:text-white text-sm transition-colors flex items-center gap-1"
                        >
                          <InstagramIcon className="w-4 h-4" />
                          @zeekayai
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply preview bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#1c1c1e] border-t border-white/10 flex items-center gap-3">
                <div className="flex-1 border-l-2 border-[#0084ff] pl-3">
                  <p className="text-xs text-[#0084ff]">
                    Replying to {replyingTo.senderId === CURRENT_USER.id ? 'yourself' : 'them'}
                  </p>
                  <p className="text-sm text-white/70 truncate">{replyingTo.content.text || 'Media message'}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-white/10 text-white/60">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Edit mode bar */}
            {editingMessage && (
              <div className="px-4 py-2 bg-[#1c1c1e] border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-[#0084ff]" />
                  <span className="text-sm text-[#0084ff]">Editing message</span>
                  <button
                    onClick={() => { setEditingMessage(null); setEditText(''); }}
                    className="ml-auto p-1 rounded-full hover:bg-white/10 text-white/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 px-4 py-2 bg-[#303030] text-white text-sm rounded-full outline-none"
                    autoFocus
                  />
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-[#0084ff] text-white text-sm rounded-full hover:bg-[#0066cc] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            {!editingMessage && (
              <div className="px-3 py-2 bg-[#1c1c1e] border-t border-white/10">
                {/* Effect indicator */}
                {selectedEffect && (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="text-sm text-[#0084ff]">
                      {MESSAGE_EFFECTS.find((e) => e.id === selectedEffect)?.icon}{' '}
                      {MESSAGE_EFFECTS.find((e) => e.id === selectedEffect)?.name} effect
                    </span>
                    <button onClick={() => setSelectedEffect(null)} className="text-white/60 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Media buttons */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-full bg-[#303030] flex items-center justify-center text-[#0084ff] hover:bg-[#3a3a3a] transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <button
                    onClick={() => setShowStickerPicker(!showStickerPicker)}
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                      showStickerPicker ? 'bg-[#0084ff] text-white' : 'bg-[#303030] text-[#0084ff] hover:bg-[#3a3a3a]'
                    )}
                  >
                    <StickerIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setShowEffectPicker(!showEffectPicker)}
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                      showEffectPicker || selectedEffect ? 'bg-[#0084ff] text-white' : 'bg-[#303030] text-[#0084ff] hover:bg-[#3a3a3a]'
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>

                  {/* Message input */}
                  <div className="flex-1">
                    <input
                      ref={messageInputRef}
                      type="text"
                      placeholder="Aa"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="w-full px-4 py-2 bg-[#303030] text-white text-sm rounded-full outline-none placeholder:text-[#65676b] focus:ring-1 focus:ring-[#0084ff]"
                    />
                  </div>

                  {/* Send or thumbs up */}
                  {messageInput.trim() ? (
                    <button
                      onClick={sendMessage}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#0084ff] hover:bg-[#303030] transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={sendQuickReaction}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#0084ff] hover:bg-[#303030] transition-colors"
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Sticker picker */}
                {showStickerPicker && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#2c2c2e] rounded-2xl p-3 shadow-xl border border-white/10 z-50">
                    <div className="grid grid-cols-6 gap-2">
                      {STICKERS.map((sticker) => (
                        <button
                          key={sticker.id}
                          onClick={() => sendSticker(sticker)}
                          className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-white/10 rounded-lg transition-colors"
                          title={sticker.name}
                        >
                          {sticker.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Effect picker */}
                {showEffectPicker && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#2c2c2e] rounded-2xl p-3 shadow-xl border border-white/10 z-50 min-w-[280px]">
                    <p className="text-xs text-white/60 mb-2 px-1">Message Effects</p>
                    <div className="grid grid-cols-4 gap-2">
                      {MESSAGE_EFFECTS.map((effect) => (
                        <button
                          key={effect.id}
                          onClick={() => { setSelectedEffect(effect.id); setShowEffectPicker(false); }}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
                            selectedEffect === effect.id ? 'bg-[#0084ff] text-white' : 'hover:bg-white/10 text-white/80'
                          )}
                        >
                          <span className="text-2xl">{effect.icon}</span>
                          <span className="text-[10px]">{effect.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#000000] text-white/40">
            <MessageCircle className="w-20 h-20 mb-4 opacity-30" />
            <h2 className="text-xl font-medium mb-2">Your Messages</h2>
            <p className="text-sm mb-6">Send messages to connect</p>
            <button
              onClick={() => setShowNewConversation(true)}
              className="px-6 py-2 bg-[#0084ff] text-white rounded-full hover:bg-[#0066cc] transition-colors"
            >
              Send Message
            </button>
          </div>
        )}

        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2c2c2e] rounded-xl w-[400px] max-h-[500px] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">New Message</h3>
                <button onClick={() => setShowNewConversation(false)} className="p-1 rounded-full hover:bg-white/10 text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="text-sm text-white/60 block mb-2">To:</label>
                  <input
                    type="text"
                    placeholder="Name or group name"
                    className="w-full px-4 py-2 bg-[#1c1c1e] text-white rounded-lg outline-none placeholder:text-white/40 focus:ring-1 focus:ring-[#0084ff]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) createConversation(input.value.trim());
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-white/60">Or message me on:</p>
                  <button
                    onClick={() => { openSocialLink(SOCIAL_LINKS.messenger.url); setShowNewConversation(false); }}
                    className="w-full flex items-center gap-3 p-3 bg-[#1c1c1e] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MessengerIcon className="w-8 h-8 text-[#0084ff]" />
                    <div className="text-left">
                      <p className="text-white font-medium">Messenger</p>
                      <p className="text-xs text-white/50">m.me/zeekay</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 ml-auto" />
                  </button>
                  <button
                    onClick={() => { openSocialLink(SOCIAL_LINKS.instagram.url); setShowNewConversation(false); }}
                    className="w-full flex items-center gap-3 p-3 bg-[#1c1c1e] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <InstagramIcon className="w-8 h-8 text-[#e4405f]" />
                    <div className="text-left">
                      <p className="text-white font-medium">Instagram</p>
                      <p className="text-xs text-white/50">@zeekayai</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 ml-auto" />
                  </button>
                  <button
                    onClick={() => { openSocialLink(SOCIAL_LINKS.twitter.url); setShowNewConversation(false); }}
                    className="w-full flex items-center gap-3 p-3 bg-[#1c1c1e] rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <XTwitterIcon className="w-8 h-8 text-white" />
                    <div className="text-left">
                      <p className="text-white font-medium">X / Twitter</p>
                      <p className="text-xs text-white/50">@zeekay</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Group Settings Modal */}
        {showGroupSettings && selectedConversation?.type === 'group' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2c2c2e] rounded-xl w-[400px] max-h-[600px] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Group Settings</h3>
                <button onClick={() => setShowGroupSettings(false)} className="p-1 rounded-full hover:bg-white/10 text-white/60">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {/* Group photo */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <button className="text-[#0084ff] text-sm">Change Photo</button>
                </div>

                {/* Group name */}
                <div>
                  <label className="text-sm text-white/60 block mb-2">Group Name</label>
                  <input
                    type="text"
                    defaultValue={selectedConversation.name}
                    className="w-full px-4 py-2 bg-[#1c1c1e] text-white rounded-lg outline-none focus:ring-1 focus:ring-[#0084ff]"
                  />
                </div>

                {/* Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-white/60">Members ({selectedConversation.participants.length})</label>
                    <button className="text-[#0084ff] text-sm flex items-center gap-1">
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedConversation.participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {p.name[0].toUpperCase()}
                        </div>
                        <span className="flex-1 text-white">{p.name}</span>
                        {p.id !== CURRENT_USER.id && (
                          <button className="text-red-400 p-1 rounded-full hover:bg-white/10">
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    Leave Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for message effects */}
      <style>{`
        @keyframes slam {
          0% { transform: scale(3) rotate(-5deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(2deg); }
          100% { transform: scale(1) rotate(0); }
        }
        .animate-slam {
          animation: slam 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </ZWindow>
  );
};

export default ZMessagesWindow;
