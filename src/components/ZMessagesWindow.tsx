import React, { useState, useEffect, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Search,
  Send,
  Plus,
  ExternalLink,
  RefreshCw,
  Settings,
  Image as ImageIcon,
  Smile,
  MoreHorizontal,
} from 'lucide-react';

interface ZMessagesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

interface DirectMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant: TwitterUser;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: DirectMessage[];
}

interface TwitterDMData {
  user: TwitterUser;
  conversations: Conversation[];
  fetchedAt: string;
}

// X/Twitter icon
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ZMessagesWindow: React.FC<ZMessagesWindowProps> = ({ onClose, onFocus }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [dmData, setDmData] = useState<TwitterDMData | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Twitter DM data from static JSON
  useEffect(() => {
    const loadDMData = async () => {
      try {
        const response = await fetch('/data/twitter-dms.json');
        if (response.ok) {
          const data = await response.json();
          setDmData(data);
          if (data.conversations.length > 0) {
            setSelectedConversation(data.conversations[0].id);
          }
        }
      } catch (error) {
        console.log('Twitter DM data not available');
      } finally {
        setLoading(false);
      }
    };
    loadDMData();
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, dmData]);

  const currentConversation = dmData?.conversations.find(c => c.id === selectedConversation);

  const filteredConversations = dmData?.conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // In a real app, this would send via Twitter API
    // For now, just open Twitter DMs
    window.open('https://twitter.com/messages', '_blank');
    setMessageInput('');
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
      defaultPosition={{ x: 160, y: 80 }}
    >
      <div className="flex h-full bg-[#1a1a1a] overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-72 border-r border-white/10 flex flex-col bg-black/30">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Messages</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <Plus className="w-4 h-4 text-white/60" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search Direct Messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-white/40 animate-spin mb-2" />
                <p className="text-white/40 text-sm">Loading...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    selectedConversation === conv.id
                      ? 'bg-blue-500/20'
                      : 'hover:bg-white/5'
                  )}
                >
                  <div className="relative">
                    {conv.participant.profileImageUrl ? (
                      <img
                        src={conv.participant.profileImageUrl}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                        {conv.participant.name.charAt(0)}
                      </div>
                    )}
                    {conv.unread && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1a1a1a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        'font-medium truncate',
                        conv.unread ? 'text-white' : 'text-white/90'
                      )}>
                        {conv.participant.name}
                      </p>
                      <span className="text-white/40 text-xs flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className={cn(
                      'text-sm truncate',
                      conv.unread ? 'text-white/70' : 'text-white/50'
                    )}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <XIcon className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">No messages yet</p>
                <p className="text-white/40 text-sm mb-4">
                  Connect your X account to see your DMs
                </p>
                <a
                  href="https://twitter.com/messages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                  Open X Messages
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Messages */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Conversation Header */}
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  {currentConversation.participant.profileImageUrl ? (
                    <img
                      src={currentConversation.participant.profileImageUrl}
                      alt={currentConversation.participant.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                      {currentConversation.participant.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{currentConversation.participant.name}</p>
                    <p className="text-white/50 text-sm">@{currentConversation.participant.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://twitter.com/${currentConversation.participant.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-white/60" />
                  </a>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {currentConversation.messages.map((msg, idx) => {
                  const isMe = msg.senderId === dmData?.user.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        isMe ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] px-4 py-2 rounded-2xl',
                          isMe
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white/10 text-white rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={cn(
                          'text-xs mt-1',
                          isMe ? 'text-white/60' : 'text-white/40'
                        )}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-white/10 bg-black/20">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-blue-400" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Start a new message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-sm outline-none focus:border-blue-500/50 placeholder:text-white/40"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      messageInput.trim()
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-white/5 text-white/30'
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-center text-white/30 text-xs mt-2">
                  Messages are synced from X • <a href="https://twitter.com/messages" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open in X</a>
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mb-4">
                <XIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-white text-xl font-medium mb-2">Welcome to Messages</h2>
              <p className="text-white/50 mb-6 max-w-sm">
                See your X Direct Messages here. Select a conversation to start chatting or open X to send new messages.
              </p>
              <a
                href="https://twitter.com/messages"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                <XIcon className="w-5 h-5" />
                Open X Messages
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZMessagesWindow;
