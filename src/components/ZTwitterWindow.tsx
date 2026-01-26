import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Search,
  Home,
  Bell,
  Mail,
  Bookmark,
  ListTodo,
  User,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  BarChart2,
  Image as ImageIcon,
  Smile,
  Calendar,
  MapPin,
  MoreVertical,
  Check,
  X,
  Settings,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ExternalLink,
  Play,
  Verified,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export interface ZTwitterWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// X/Twitter Icon
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Types
interface Tweet {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
    isBlueVerified?: boolean;
  };
  content: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    aspectRatio?: string;
  }[];
  timestamp: number;
  stats: {
    replies: number;
    retweets: number;
    likes: number;
    views: number;
    bookmarks?: number;
  };
  liked?: boolean;
  retweeted?: boolean;
  bookmarked?: boolean;
  replyTo?: string;
  quoteTweet?: Tweet;
  isPinned?: boolean;
}

interface TrendingTopic {
  id: string;
  category: string;
  topic: string;
  tweetCount?: number;
}

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'reply';
  user: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
  tweet?: Tweet;
  timestamp: number;
  read?: boolean;
}

interface DirectMessage {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
    isOnline?: boolean;
  };
  lastMessage: string;
  timestamp: number;
  unread?: boolean;
}

// Mock data
const PROFILE = {
  name: 'Z',
  handle: 'zeekay',
  bio: 'CEO @HanzoAI. Building the future of AI. Previously @Techstars. Making things.',
  location: 'San Francisco, CA',
  website: 'zeekay.ai',
  joinedDate: 'April 2009',
  following: 1247,
  followers: 8432,
  tweets: 12847,
  avatar: undefined,
  banner: undefined,
  verified: true,
};

const generateMockTweets = (): Tweet[] => [
  {
    id: '1',
    author: { name: 'Z', handle: 'zeekay', verified: true },
    content: "Just shipped a major update to Hanzo AI. The new model context protocol is a game changer for agent workflows. More details coming soon!",
    timestamp: Date.now() - 1000 * 60 * 15,
    stats: { replies: 42, retweets: 128, likes: 892, views: 24500 },
    isPinned: true,
  },
  {
    id: '2',
    author: { name: 'Lux Network', handle: 'luxnetwork', verified: true, isBlueVerified: true },
    content: "Mainnet launch countdown: 7 days. Post-quantum security meets high-performance consensus. The future of blockchain is almost here.",
    media: [{ type: 'image', url: 'https://picsum.photos/seed/lux/600/340', aspectRatio: '16/9' }],
    timestamp: Date.now() - 1000 * 60 * 45,
    stats: { replies: 156, retweets: 892, likes: 3421, views: 128000 },
  },
  {
    id: '3',
    author: { name: 'Zoo Labs', handle: 'zoolabs', verified: true },
    content: "New ZIP proposal live: Decentralized AI training coordination protocol. This could fundamentally change how we approach distributed ML.\n\nRead the full proposal: zips.zoo.ngo/zip-0042",
    timestamp: Date.now() - 1000 * 60 * 120,
    stats: { replies: 89, retweets: 234, likes: 1205, views: 45600 },
  },
  {
    id: '4',
    author: { name: 'Andrej Karpathy', handle: 'karpathy', verified: true },
    content: "The thing about LLMs is that they're essentially giant pattern matchers trained on the internet. But the patterns they learn are incredibly nuanced and compositional.",
    timestamp: Date.now() - 1000 * 60 * 180,
    stats: { replies: 892, retweets: 4521, likes: 28934, views: 2100000 },
    liked: true,
  },
  {
    id: '5',
    author: { name: 'Sam Altman', handle: 'sama', verified: true },
    content: "the most important thing i've learned is that the people who change the world are the ones who show up every day and do the work, not the ones who wait for inspiration",
    timestamp: Date.now() - 1000 * 60 * 240,
    stats: { replies: 1256, retweets: 8934, likes: 67823, views: 5400000 },
  },
  {
    id: '6',
    author: { name: 'Pieter Levels', handle: 'levelsio', verified: true, isBlueVerified: true },
    content: "shipped 3 features today\n\nwoke up at 5am, made coffee, sat down and just started coding\n\nno meetings, no slack, no distractions\n\njust flow state for 6 hours straight\n\nthis is the way",
    timestamp: Date.now() - 1000 * 60 * 300,
    stats: { replies: 234, retweets: 1892, likes: 12453, views: 890000 },
  },
  {
    id: '7',
    author: { name: 'Z', handle: 'zeekay', verified: true },
    content: "Hot take: The best code is the code you don't write.\n\nThe second best code is the code that's so simple it's boring.",
    timestamp: Date.now() - 1000 * 60 * 420,
    stats: { replies: 67, retweets: 312, likes: 2134, views: 78000 },
    retweeted: true,
  },
  {
    id: '8',
    author: { name: 'OpenAI', handle: 'OpenAI', verified: true },
    content: "Introducing our latest research on scaling laws for AI agents. The results show a clear path to more capable systems through better training methodologies.",
    media: [{ type: 'image', url: 'https://picsum.photos/seed/openai/600/340', aspectRatio: '16/9' }],
    timestamp: Date.now() - 1000 * 60 * 600,
    stats: { replies: 2341, retweets: 12453, likes: 89234, views: 12000000 },
    bookmarked: true,
  },
];

const TRENDING_TOPICS: TrendingTopic[] = [
  { id: '1', category: 'Technology - Trending', topic: 'Claude 4', tweetCount: 125000 },
  { id: '2', category: 'Crypto - Trending', topic: 'Bitcoin ETF', tweetCount: 89000 },
  { id: '3', category: 'AI - Trending', topic: '#AGI2025', tweetCount: 67000 },
  { id: '4', category: 'Tech - Trending', topic: 'Apple Vision Pro', tweetCount: 234000 },
  { id: '5', category: 'Science - Trending', topic: 'Fusion Energy', tweetCount: 45000 },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: { name: 'Elon Musk', handle: 'elonmusk', verified: true },
    tweet: { id: '1', author: { name: 'Z', handle: 'zeekay', verified: true }, content: 'Just shipped a major update...', timestamp: Date.now(), stats: { replies: 0, retweets: 0, likes: 0, views: 0 } },
    timestamp: Date.now() - 1000 * 60 * 5,
  },
  {
    id: '2',
    type: 'follow',
    user: { name: 'Naval', handle: 'naval', verified: true },
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: '3',
    type: 'retweet',
    user: { name: 'Paul Graham', handle: 'paulg', verified: true },
    tweet: { id: '7', author: { name: 'Z', handle: 'zeekay', verified: true }, content: 'Hot take: The best code...', timestamp: Date.now(), stats: { replies: 0, retweets: 0, likes: 0, views: 0 } },
    timestamp: Date.now() - 1000 * 60 * 60,
  },
  {
    id: '4',
    type: 'mention',
    user: { name: 'Marc Andreessen', handle: 'pmarca', verified: true },
    tweet: { id: 'x', author: { name: 'Marc Andreessen', handle: 'pmarca', verified: true }, content: '@zeekay great thread on AI agents!', timestamp: Date.now(), stats: { replies: 0, retweets: 0, likes: 0, views: 0 } },
    timestamp: Date.now() - 1000 * 60 * 120,
  },
];

const DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: '1',
    user: { name: 'Naval', handle: 'naval', verified: true, isOnline: true },
    lastMessage: "Let's chat about the AI governance proposal",
    timestamp: Date.now() - 1000 * 60 * 10,
    unread: true,
  },
  {
    id: '2',
    user: { name: 'Balaji', handle: 'balaboreal', verified: true },
    lastMessage: 'Interesting take on decentralized AI',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: '3',
    user: { name: 'Vitalik', handle: 'VitalikButerin', verified: true, isOnline: true },
    lastMessage: 'The ZK proofs look promising',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
];

// Navigation items
type NavItem = 'home' | 'explore' | 'notifications' | 'messages' | 'bookmarks' | 'lists' | 'profile';

const ZTwitterWindow: React.FC<ZTwitterWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [activeNav, setActiveNav] = useState<NavItem>('home');
  const [tweets, setTweets] = useState<Tweet[]>(generateMockTweets);
  const [composeText, setComposeText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);

  const composeRef = useRef<HTMLTextAreaElement>(null);

  // Format number for display (e.g., 1234 -> 1.2K)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle tweet interactions
  const handleLike = useCallback((tweetId: string) => {
    setTweets(prev => prev.map(t => {
      if (t.id === tweetId) {
        const newLiked = !t.liked;
        return {
          ...t,
          liked: newLiked,
          stats: { ...t.stats, likes: t.stats.likes + (newLiked ? 1 : -1) }
        };
      }
      return t;
    }));
  }, []);

  const handleRetweet = useCallback((tweetId: string) => {
    setTweets(prev => prev.map(t => {
      if (t.id === tweetId) {
        const newRetweeted = !t.retweeted;
        return {
          ...t,
          retweeted: newRetweeted,
          stats: { ...t.stats, retweets: t.stats.retweets + (newRetweeted ? 1 : -1) }
        };
      }
      return t;
    }));
  }, []);

  const handleBookmark = useCallback((tweetId: string) => {
    setTweets(prev => prev.map(t => {
      if (t.id === tweetId) {
        const newBookmarked = !t.bookmarked;
        if (newBookmarked) {
          toast.success('Tweet added to Bookmarks');
        } else {
          toast.success('Tweet removed from Bookmarks');
        }
        return { ...t, bookmarked: newBookmarked };
      }
      return t;
    }));
  }, []);

  const handleShare = useCallback((tweet: Tweet) => {
    navigator.clipboard.writeText(`https://x.com/${tweet.author.handle}/status/${tweet.id}`);
    toast.success('Link copied to clipboard');
  }, []);

  // Post tweet
  const handlePostTweet = useCallback(() => {
    if (!composeText.trim()) return;

    const newTweet: Tweet = {
      id: `new-${Date.now()}`,
      author: { name: PROFILE.name, handle: PROFILE.handle, verified: PROFILE.verified },
      content: composeText.trim(),
      timestamp: Date.now(),
      stats: { replies: 0, retweets: 0, likes: 0, views: 0 },
    };

    setTweets(prev => [newTweet, ...prev]);
    setComposeText('');
    setShowComposeModal(false);
    setIsComposing(false);
    toast.success('Tweet posted!');
  }, [composeText]);

  // Render verified badge
  const renderVerified = (author: Tweet['author']) => {
    if (!author.verified && !author.isBlueVerified) return null;
    return (
      <Verified className={cn(
        'w-4 h-4 ml-0.5',
        author.isBlueVerified ? 'text-[#1d9bf0] fill-[#1d9bf0]' : 'text-[#e8b634] fill-[#e8b634]'
      )} />
    );
  };

  // Render single tweet
  const renderTweet = (tweet: Tweet, showThread = true) => (
    <div key={tweet.id} className="px-4 py-3 border-b border-[#2f3336] hover:bg-white/[0.03] transition-colors cursor-pointer">
      {/* Pinned indicator */}
      {tweet.isPinned && (
        <div className="flex items-center gap-3 text-[#71767b] text-xs mb-2 ml-10">
          <MapPin className="w-3 h-3" />
          <span>Pinned</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
            {tweet.author.name[0].toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-bold text-[#e7e9ea] hover:underline">{tweet.author.name}</span>
            {renderVerified(tweet.author)}
            <span className="text-[#71767b]">@{tweet.author.handle}</span>
            <span className="text-[#71767b]">.</span>
            <span className="text-[#71767b] hover:underline">{formatTime(tweet.timestamp)}</span>
            <button className="ml-auto p-1.5 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Tweet text */}
          <p className="text-[#e7e9ea] text-[15px] leading-5 whitespace-pre-wrap mt-0.5">{tweet.content}</p>

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#2f3336]">
              {tweet.media.map((m, idx) => (
                <div key={idx} className="relative">
                  {m.type === 'video' ? (
                    <div className="relative bg-black aspect-video flex items-center justify-center">
                      <img src={m.url} alt="" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#1d9bf0] flex items-center justify-center">
                          <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full" style={{ aspectRatio: m.aspectRatio }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            {/* Reply */}
            <button className="group flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] transition-colors">
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{tweet.stats.replies > 0 ? formatNumber(tweet.stats.replies) : ''}</span>
            </button>

            {/* Retweet */}
            <button
              onClick={(e) => { e.stopPropagation(); handleRetweet(tweet.id); }}
              className={cn(
                'group flex items-center gap-1 transition-colors',
                tweet.retweeted ? 'text-[#00ba7c]' : 'text-[#71767b] hover:text-[#00ba7c]'
              )}
            >
              <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                <Repeat2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{tweet.stats.retweets > 0 ? formatNumber(tweet.stats.retweets) : ''}</span>
            </button>

            {/* Like */}
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(tweet.id); }}
              className={cn(
                'group flex items-center gap-1 transition-colors',
                tweet.liked ? 'text-[#f91880]' : 'text-[#71767b] hover:text-[#f91880]'
              )}
            >
              <div className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                <Heart className={cn('w-[18px] h-[18px]', tweet.liked && 'fill-current')} />
              </div>
              <span className="text-[13px]">{tweet.stats.likes > 0 ? formatNumber(tweet.stats.likes) : ''}</span>
            </button>

            {/* Views */}
            <button className="group flex items-center gap-1 text-[#71767b] hover:text-[#1d9bf0] transition-colors">
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <BarChart2 className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[13px]">{tweet.stats.views > 0 ? formatNumber(tweet.stats.views) : ''}</span>
            </button>

            {/* Bookmark & Share */}
            <div className="flex items-center">
              <button
                onClick={(e) => { e.stopPropagation(); handleBookmark(tweet.id); }}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  tweet.bookmarked ? 'text-[#1d9bf0]' : 'text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10'
                )}
              >
                <Bookmark className={cn('w-[18px] h-[18px]', tweet.bookmarked && 'fill-current')} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(tweet); }}
                className="p-2 rounded-full text-[#71767b] hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors"
              >
                <Share className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render compose area
  const renderCompose = (minimal = false) => (
    <div className={cn('px-4 py-3 border-b border-[#2f3336]', minimal && 'pb-2')}>
      <div className="flex gap-3">
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {PROFILE.name[0].toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            ref={composeRef}
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            onFocus={() => setIsComposing(true)}
            placeholder="What is happening?!"
            className="w-full bg-transparent text-[#e7e9ea] text-xl placeholder:text-[#71767b] outline-none resize-none min-h-[56px]"
            rows={isComposing ? 3 : 1}
          />

          {isComposing && (
            <>
              {/* Audience selector */}
              <button className="flex items-center gap-1 text-[#1d9bf0] text-sm font-bold hover:bg-[#1d9bf0]/10 px-3 py-1 rounded-full -ml-3 mb-3">
                <span>Everyone can reply</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="border-t border-[#2f3336] pt-3 flex items-center justify-between">
                {/* Media buttons */}
                <div className="flex items-center gap-1 -ml-2">
                  <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>

                {/* Post button */}
                <button
                  onClick={handlePostTweet}
                  disabled={!composeText.trim()}
                  className={cn(
                    'px-4 py-1.5 rounded-full font-bold text-[15px] transition-colors',
                    composeText.trim()
                      ? 'bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]'
                      : 'bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed'
                  )}
                >
                  Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Render timeline
  const renderTimeline = () => (
    <ScrollArea className="flex-1">
      {/* Compose */}
      {renderCompose()}

      {/* For You / Following tabs */}
      <div className="flex border-b border-[#2f3336]">
        <button className="flex-1 py-4 text-[15px] font-bold text-[#e7e9ea] hover:bg-white/[0.03] transition-colors relative">
          For you
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full" />
        </button>
        <button className="flex-1 py-4 text-[15px] font-medium text-[#71767b] hover:bg-white/[0.03] transition-colors">
          Following
        </button>
      </div>

      {/* Tweets */}
      {tweets.map(tweet => renderTweet(tweet))}
    </ScrollArea>
  );

  // Render notifications
  const renderNotifications = () => (
    <ScrollArea className="flex-1">
      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        <button className="flex-1 py-4 text-[15px] font-bold text-[#e7e9ea] hover:bg-white/[0.03] transition-colors relative">
          All
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#1d9bf0] rounded-full" />
        </button>
        <button className="flex-1 py-4 text-[15px] font-medium text-[#71767b] hover:bg-white/[0.03] transition-colors">
          Verified
        </button>
        <button className="flex-1 py-4 text-[15px] font-medium text-[#71767b] hover:bg-white/[0.03] transition-colors">
          Mentions
        </button>
      </div>

      {/* Notifications list */}
      {NOTIFICATIONS.map(notif => (
        <div key={notif.id} className="px-4 py-3 border-b border-[#2f3336] hover:bg-white/[0.03] transition-colors cursor-pointer">
          <div className="flex gap-3">
            <div className="w-8 flex justify-center">
              {notif.type === 'like' && <Heart className="w-6 h-6 text-[#f91880] fill-[#f91880]" />}
              {notif.type === 'retweet' && <Repeat2 className="w-6 h-6 text-[#00ba7c]" />}
              {notif.type === 'follow' && <User className="w-6 h-6 text-[#1d9bf0]" />}
              {notif.type === 'mention' && <MessageCircle className="w-6 h-6 text-[#1d9bf0]" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {notif.user.name[0]}
                </div>
              </div>
              <p className="text-[15px] text-[#e7e9ea]">
                <span className="font-bold hover:underline">{notif.user.name}</span>
                {notif.type === 'like' && ' liked your post'}
                {notif.type === 'retweet' && ' reposted your post'}
                {notif.type === 'follow' && ' followed you'}
                {notif.type === 'mention' && ' mentioned you'}
              </p>
              {notif.tweet && (
                <p className="text-[#71767b] text-[15px] mt-1 line-clamp-2">{notif.tweet.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
  );

  // Render messages
  const renderMessages = () => (
    <ScrollArea className="flex-1">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#e7e9ea]">Messages</h2>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5 text-[#e7e9ea]" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#202327] rounded-full border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-transparent">
          <Search className="w-5 h-5 text-[#71767b]" />
          <input
            type="text"
            placeholder="Search Direct Messages"
            className="flex-1 bg-transparent text-[#e7e9ea] placeholder:text-[#71767b] outline-none text-[15px]"
          />
        </div>
      </div>

      {/* DM list */}
      {DIRECT_MESSAGES.map(dm => (
        <div key={dm.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {dm.user.name[0]}
            </div>
            {dm.user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00ba7c] rounded-full border-2 border-black" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[#e7e9ea] text-[15px]">{dm.user.name}</span>
              {dm.user.verified && <Verified className="w-4 h-4 text-[#e8b634] fill-[#e8b634]" />}
              <span className="text-[#71767b] text-[15px]">@{dm.user.handle}</span>
              <span className="text-[#71767b] text-[15px]">. {formatTime(dm.timestamp)}</span>
            </div>
            <p className={cn(
              'text-[15px] truncate',
              dm.unread ? 'text-[#e7e9ea] font-medium' : 'text-[#71767b]'
            )}>{dm.lastMessage}</p>
          </div>
          {dm.unread && (
            <div className="w-2.5 h-2.5 bg-[#1d9bf0] rounded-full" />
          )}
        </div>
      ))}
    </ScrollArea>
  );

  // Render bookmarks
  const renderBookmarks = () => {
    const bookmarkedTweets = tweets.filter(t => t.bookmarked);
    return (
      <ScrollArea className="flex-1">
        <div className="px-4 py-3 border-b border-[#2f3336]">
          <h2 className="text-xl font-bold text-[#e7e9ea]">Bookmarks</h2>
          <p className="text-[#71767b] text-[13px]">@{PROFILE.handle}</p>
        </div>

        {bookmarkedTweets.length > 0 ? (
          bookmarkedTweets.map(tweet => renderTweet(tweet))
        ) : (
          <div className="px-8 py-12 text-center">
            <h3 className="text-3xl font-bold text-[#e7e9ea] mb-2">Save posts for later</h3>
            <p className="text-[#71767b] text-[15px]">Bookmark posts to easily find them again in the future.</p>
          </div>
        )}
      </ScrollArea>
    );
  };

  // Render lists
  const renderLists = () => (
    <ScrollArea className="flex-1">
      <div className="px-4 py-3 border-b border-[#2f3336] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e7e9ea]">Lists</h2>
          <p className="text-[#71767b] text-[13px]">@{PROFILE.handle}</p>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-[#e7e9ea]" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[#2f3336]">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#1d9bf0] flex items-center justify-center">
            <ListTodo className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-[#e7e9ea]">Create a new List</p>
            <p className="text-[#71767b] text-sm">Organize your timeline</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#71767b] ml-auto" />
        </button>
      </div>

      <div className="px-8 py-12 text-center">
        <h3 className="text-3xl font-bold text-[#e7e9ea] mb-2">You haven't created any Lists</h3>
        <p className="text-[#71767b] text-[15px]">When you do, it'll show up here.</p>
      </div>
    </ScrollArea>
  );

  // Render profile
  const renderProfile = () => (
    <ScrollArea className="flex-1">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600" />

      {/* Profile header */}
      <div className="px-4 pb-4 relative">
        {/* Avatar */}
        <div className="absolute -top-16 left-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-black">
            {PROFILE.name}
          </div>
        </div>

        {/* Edit button */}
        <div className="flex justify-end py-3">
          <button className="px-4 py-1.5 rounded-full border border-[#536471] text-[#e7e9ea] font-bold hover:bg-white/10 transition-colors">
            Edit profile
          </button>
        </div>

        {/* Profile info */}
        <div className="mt-8">
          <div className="flex items-center gap-1">
            <h2 className="text-xl font-bold text-[#e7e9ea]">{PROFILE.name}</h2>
            {PROFILE.verified && <Verified className="w-5 h-5 text-[#e8b634] fill-[#e8b634]" />}
          </div>
          <p className="text-[#71767b]">@{PROFILE.handle}</p>

          <p className="text-[#e7e9ea] mt-3">{PROFILE.bio}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[#71767b] text-[15px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {PROFILE.location}
            </span>
            <a href={`https://${PROFILE.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1d9bf0] hover:underline">
              <ExternalLink className="w-4 h-4" /> {PROFILE.website}
            </a>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Joined {PROFILE.joinedDate}
            </span>
          </div>

          <div className="flex gap-4 mt-3 text-[15px]">
            <span>
              <span className="text-[#e7e9ea] font-bold">{formatNumber(PROFILE.following)}</span>
              <span className="text-[#71767b]"> Following</span>
            </span>
            <span>
              <span className="text-[#e7e9ea] font-bold">{formatNumber(PROFILE.followers)}</span>
              <span className="text-[#71767b]"> Followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2f3336]">
        {['Posts', 'Replies', 'Highlights', 'Media', 'Likes'].map((tab, idx) => (
          <button
            key={tab}
            className={cn(
              'flex-1 py-4 text-[15px] font-medium hover:bg-white/[0.03] transition-colors relative',
              idx === 0 ? 'text-[#e7e9ea]' : 'text-[#71767b]'
            )}
          >
            {tab}
            {idx === 0 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#1d9bf0] rounded-full" />}
          </button>
        ))}
      </div>

      {/* User's tweets */}
      {tweets.filter(t => t.author.handle === PROFILE.handle).map(tweet => renderTweet(tweet))}
    </ScrollArea>
  );

  // Get main content based on active nav
  const getMainContent = () => {
    switch (activeNav) {
      case 'home': return renderTimeline();
      case 'notifications': return renderNotifications();
      case 'messages': return renderMessages();
      case 'bookmarks': return renderBookmarks();
      case 'lists': return renderLists();
      case 'profile': return renderProfile();
      default: return renderTimeline();
    }
  };

  // Get page title
  const getPageTitle = () => {
    switch (activeNav) {
      case 'home': return 'Home';
      case 'notifications': return 'Notifications';
      case 'messages': return 'Messages';
      case 'bookmarks': return 'Bookmarks';
      case 'lists': return 'Lists';
      case 'profile': return PROFILE.name;
      default: return 'Home';
    }
  };

  return (
    <ZWindow
      title="X"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1100}
      defaultHeight={700}
      minWidth={800}
      minHeight={500}
      defaultPosition={{ x: 120, y: 50 }}
    >
      <div className="flex h-full bg-black overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-[68px] xl:w-[275px] flex flex-col items-center xl:items-start px-2 py-1 border-r border-[#2f3336]">
          {/* X Logo */}
          <button className="p-3 rounded-full hover:bg-white/10 transition-colors my-1">
            <XIcon className="w-7 h-7 text-[#e7e9ea]" />
          </button>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 w-full mt-1">
            {[
              { id: 'home' as NavItem, icon: Home, label: 'Home' },
              { id: 'explore' as NavItem, icon: Search, label: 'Explore' },
              { id: 'notifications' as NavItem, icon: Bell, label: 'Notifications', badge: 3 },
              { id: 'messages' as NavItem, icon: Mail, label: 'Messages', badge: 1 },
              { id: 'bookmarks' as NavItem, icon: Bookmark, label: 'Bookmarks' },
              { id: 'lists' as NavItem, icon: ListTodo, label: 'Lists' },
              { id: 'profile' as NavItem, icon: User, label: 'Profile' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-full hover:bg-white/10 transition-colors w-fit',
                  activeNav === item.id && 'font-bold'
                )}
              >
                <div className="relative">
                  <item.icon className={cn('w-[26px] h-[26px]', activeNav === item.id ? 'text-[#e7e9ea]' : 'text-[#e7e9ea]')} />
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#1d9bf0] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {item.badge}
                    </div>
                  )}
                </div>
                <span className="hidden xl:block text-xl text-[#e7e9ea]">{item.label}</span>
              </button>
            ))}

            <button className="flex items-center gap-4 p-3 rounded-full hover:bg-white/10 transition-colors w-fit">
              <MoreHorizontal className="w-[26px] h-[26px] text-[#e7e9ea]" />
              <span className="hidden xl:block text-xl text-[#e7e9ea]">More</span>
            </button>
          </nav>

          {/* Post button */}
          <button
            onClick={() => setShowComposeModal(true)}
            className="mt-4 w-[50px] xl:w-[90%] py-3 bg-[#1d9bf0] hover:bg-[#1a8cd8] rounded-full text-white font-bold text-[17px] transition-colors"
          >
            <span className="hidden xl:block">Post</span>
            <span className="xl:hidden flex justify-center">
              <Sparkles className="w-6 h-6" />
            </span>
          </button>

          {/* Profile button at bottom */}
          <button className="mt-auto mb-3 flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition-colors w-full">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
              {PROFILE.name[0]}
            </div>
            <div className="hidden xl:block text-left flex-1 min-w-0">
              <p className="font-bold text-[15px] text-[#e7e9ea] truncate">{PROFILE.name}</p>
              <p className="text-[#71767b] text-[15px] truncate">@{PROFILE.handle}</p>
            </div>
            <MoreHorizontal className="hidden xl:block w-5 h-5 text-[#e7e9ea]" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#2f3336]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 border-b border-[#2f3336]">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-[#e7e9ea]">{getPageTitle()}</h1>
              {activeNav === 'home' && (
                <button className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors">
                  <Sparkles className="w-5 h-5 text-[#e7e9ea]" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {getMainContent()}
        </div>

        {/* Right Sidebar - Trending & Who to follow */}
        <div className="w-[350px] hidden lg:flex flex-col py-2 px-4">
          {/* Search */}
          <div className="sticky top-0 bg-black pb-3 pt-1">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#202327] rounded-full border border-transparent focus-within:border-[#1d9bf0] focus-within:bg-transparent group">
              <Search className="w-5 h-5 text-[#71767b] group-focus-within:text-[#1d9bf0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-[#e7e9ea] placeholder:text-[#71767b] outline-none text-[15px]"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {/* Premium card */}
            <div className="rounded-2xl bg-[#16181c] p-4 mb-4">
              <h3 className="text-xl font-bold text-[#e7e9ea] mb-1">Subscribe to Premium</h3>
              <p className="text-[#e7e9ea] text-[15px] mb-3">Subscribe to unlock new features and if eligible, receive a share of revenue.</p>
              <button className="px-4 py-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] rounded-full text-white font-bold transition-colors">
                Subscribe
              </button>
            </div>

            {/* Trending */}
            <div className="rounded-2xl bg-[#16181c] mb-4">
              <h3 className="text-xl font-bold text-[#e7e9ea] px-4 py-3">What's happening</h3>
              {TRENDING_TOPICS.map(topic => (
                <div key={topic.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <p className="text-[#71767b] text-[13px]">{topic.category}</p>
                  <p className="text-[#e7e9ea] font-bold text-[15px]">{topic.topic}</p>
                  {topic.tweetCount && (
                    <p className="text-[#71767b] text-[13px]">{formatNumber(topic.tweetCount)} posts</p>
                  )}
                </div>
              ))}
              <button className="w-full px-4 py-4 text-left text-[#1d9bf0] text-[15px] hover:bg-white/[0.03] transition-colors rounded-b-2xl">
                Show more
              </button>
            </div>

            {/* Who to follow */}
            <div className="rounded-2xl bg-[#16181c]">
              <h3 className="text-xl font-bold text-[#e7e9ea] px-4 py-3">Who to follow</h3>
              {[
                { name: 'Anthropic', handle: 'AnthropicAI', verified: true },
                { name: 'Y Combinator', handle: 'ycombinator', verified: true },
                { name: 'a]16z', handle: 'a16z', verified: true },
              ].map((user, idx) => (
                <div key={idx} className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[#e7e9ea] text-[15px] truncate hover:underline">{user.name}</span>
                      {user.verified && <Verified className="w-4 h-4 text-[#e8b634] fill-[#e8b634] shrink-0" />}
                    </div>
                    <p className="text-[#71767b] text-[15px] truncate">@{user.handle}</p>
                  </div>
                  <button className="px-4 py-1.5 bg-white text-black font-bold text-[14px] rounded-full hover:bg-white/90 transition-colors">
                    Follow
                  </button>
                </div>
              ))}
              <button className="w-full px-4 py-4 text-left text-[#1d9bf0] text-[15px] hover:bg-white/[0.03] transition-colors rounded-b-2xl">
                Show more
              </button>
            </div>

            {/* Footer links */}
            <div className="px-4 py-4 text-[13px] text-[#71767b] flex flex-wrap gap-x-3 gap-y-1">
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Cookie Policy</a>
              <a href="#" className="hover:underline">Accessibility</a>
              <a href="#" className="hover:underline">Ads info</a>
              <a href="#" className="hover:underline">More</a>
              <span>2024 X Corp.</span>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-[#5b708366] flex items-start justify-center pt-16 z-50">
          <div className="bg-black rounded-2xl w-[600px] max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center p-3 border-b border-[#2f3336]">
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#e7e9ea]" />
              </button>
              <span className="ml-auto text-[#1d9bf0] font-bold text-[15px] cursor-pointer hover:underline">Drafts</span>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {PROFILE.name[0]}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={composeText}
                    onChange={(e) => setComposeText(e.target.value)}
                    placeholder="What is happening?!"
                    className="w-full bg-transparent text-[#e7e9ea] text-xl placeholder:text-[#71767b] outline-none resize-none min-h-[150px]"
                    autoFocus
                  />

                  <button className="flex items-center gap-1 text-[#1d9bf0] text-sm font-bold hover:bg-[#1d9bf0]/10 px-3 py-1 rounded-full -ml-3 mb-3">
                    <span>Everyone can reply</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="border-t border-[#2f3336] pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 -ml-2">
                      <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={handlePostTweet}
                      disabled={!composeText.trim()}
                      className={cn(
                        'px-4 py-1.5 rounded-full font-bold text-[15px] transition-colors',
                        composeText.trim()
                          ? 'bg-[#1d9bf0] text-white hover:bg-[#1a8cd8]'
                          : 'bg-[#1d9bf0]/50 text-white/50 cursor-not-allowed'
                      )}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ZWindow>
  );
};

export default ZTwitterWindow;
