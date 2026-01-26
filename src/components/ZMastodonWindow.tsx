import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Home,
  Globe,
  Users,
  Bell,
  Bookmark,
  Heart,
  Repeat2,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Image as ImageIcon,
  Smile,
  BarChart3,
  AlertTriangle,
  Hash,
  Settings,
  User,
  Lock,
  Unlock,
  AtSign,
  ExternalLink,
  ChevronDown,
  Plus,
  X,
  Check,
  Share,
  Link2,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Server,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ZMastodonWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface MastodonAccount {
  id: string;
  username: string;
  display_name: string;
  avatar: string;
  header?: string;
  acct: string;
  note: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  created_at: string;
  bot?: boolean;
  locked?: boolean;
  verified?: boolean;
}

interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio';
  url: string;
  preview_url?: string;
  description?: string;
}

interface PollOption {
  title: string;
  votes_count: number;
}

interface Poll {
  id: string;
  expires_at: string;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count: number;
  options: PollOption[];
  voted?: boolean;
  own_votes?: number[];
}

interface Toot {
  id: string;
  content: string;
  created_at: string;
  account: MastodonAccount;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  reblogged: boolean;
  favourited: boolean;
  bookmarked: boolean;
  sensitive: boolean;
  spoiler_text?: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  media_attachments: MediaAttachment[];
  poll?: Poll;
  reblog?: Toot;
  in_reply_to_id?: string;
  mentions?: { id: string; username: string; acct: string }[];
  tags?: { name: string; url: string }[];
}

interface Notification {
  id: string;
  type: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'follow_request';
  created_at: string;
  account: MastodonAccount;
  status?: Toot;
}

interface InstanceInfo {
  uri: string;
  title: string;
  description: string;
  version: string;
  stats: {
    user_count: number;
    status_count: number;
    domain_count: number;
  };
  rules: { id: string; text: string }[];
}

// Mock Data
const mockCurrentUser: MastodonAccount = {
  id: '1',
  username: 'zeekay',
  display_name: 'Z',
  avatar: '',
  acct: 'zeekay@mastodon.social',
  note: 'CEO @ Hanzo AI. Building the future of AI.',
  followers_count: 2847,
  following_count: 342,
  statuses_count: 1203,
  created_at: '2017-04-01T00:00:00.000Z',
  verified: true,
};

const mockAccounts: MastodonAccount[] = [
  {
    id: '2',
    username: 'torvalds',
    display_name: 'Linus Torvalds',
    avatar: '',
    acct: 'torvalds@fosstodon.org',
    note: 'Linux & Git creator',
    followers_count: 125000,
    following_count: 42,
    statuses_count: 2301,
    created_at: '2022-11-01T00:00:00.000Z',
    verified: true,
  },
  {
    id: '3',
    username: 'graydon',
    display_name: 'Graydon Hoare',
    avatar: '',
    acct: 'graydon@hachyderm.io',
    note: 'Created Rust. Now working on other things.',
    followers_count: 45000,
    following_count: 128,
    statuses_count: 892,
    created_at: '2022-11-15T00:00:00.000Z',
  },
  {
    id: '4',
    username: 'mhoye',
    display_name: 'Mike Hoye',
    avatar: '',
    acct: 'mhoye@mastodon.social',
    note: 'Engineering community lead at Mozilla',
    followers_count: 18500,
    following_count: 456,
    statuses_count: 3421,
    created_at: '2017-04-01T00:00:00.000Z',
  },
  {
    id: '5',
    username: 'rachelbythebay',
    display_name: 'Rachel',
    avatar: '',
    acct: 'rachelbythebay@infosec.exchange',
    note: 'SRE. Writer. Observer of tech.',
    followers_count: 28900,
    following_count: 89,
    statuses_count: 1567,
    created_at: '2022-11-10T00:00:00.000Z',
  },
];

const mockToots: Toot[] = [
  {
    id: '1',
    content: '<p>Just released a new kernel patch that improves performance by 15% on ARM64. The future of computing is definitely not x86-only anymore.</p><p>🐧 <a href="#" class="hashtag">#Linux</a> <a href="#" class="hashtag">#ARM64</a> <a href="#" class="hashtag">#OpenSource</a></p>',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    account: mockAccounts[0],
    replies_count: 234,
    reblogs_count: 1892,
    favourites_count: 4521,
    reblogged: false,
    favourited: true,
    bookmarked: false,
    sensitive: false,
    visibility: 'public',
    media_attachments: [],
    tags: [{ name: 'Linux', url: '#' }, { name: 'ARM64', url: '#' }, { name: 'OpenSource', url: '#' }],
  },
  {
    id: '2',
    content: '<p>Been thinking about memory safety in systems programming. Rust gets it right in so many ways, but there\'s still room for improvement in the ecosystem.</p><p>Thread on what we\'ve learned over 10 years of Rust: 🧵</p>',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    account: mockAccounts[1],
    replies_count: 89,
    reblogs_count: 567,
    favourites_count: 2134,
    reblogged: true,
    favourited: true,
    bookmarked: true,
    sensitive: false,
    visibility: 'public',
    media_attachments: [],
    tags: [{ name: 'Rust', url: '#' }, { name: 'Programming', url: '#' }],
  },
  {
    id: '3',
    content: '<p>The real problem with modern web development isn\'t the frameworks. It\'s that we\'ve normalized shipping 10MB of JavaScript to show a form.</p>',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    account: mockAccounts[2],
    replies_count: 156,
    reblogs_count: 892,
    favourites_count: 3421,
    reblogged: false,
    favourited: false,
    bookmarked: false,
    sensitive: false,
    visibility: 'public',
    media_attachments: [],
  },
  {
    id: '4',
    content: '<p>SRE tip of the day: Your monitoring isn\'t complete until it can detect when your monitoring is down.</p><p>Yes, this is meta. Yes, it\'s necessary. Yes, I learned this the hard way.</p>',
    created_at: new Date(Date.now() - 28800000).toISOString(),
    account: mockAccounts[3],
    replies_count: 45,
    reblogs_count: 234,
    favourites_count: 1123,
    reblogged: false,
    favourited: false,
    bookmarked: true,
    sensitive: false,
    visibility: 'public',
    media_attachments: [],
    poll: {
      id: 'poll1',
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      expired: false,
      multiple: false,
      votes_count: 2341,
      voters_count: 2341,
      options: [
        { title: 'Prometheus + Alertmanager', votes_count: 1245 },
        { title: 'Datadog', votes_count: 456 },
        { title: 'Grafana Cloud', votes_count: 389 },
        { title: 'Self-hosted stack', votes_count: 251 },
      ],
      voted: true,
      own_votes: [0],
    },
  },
  {
    id: '5',
    content: '<p>Working on integrating LLMs with our MCP infrastructure. The future of AI agents is going to be wild.</p>',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    account: mockCurrentUser,
    replies_count: 12,
    reblogs_count: 45,
    favourites_count: 234,
    reblogged: false,
    favourited: false,
    bookmarked: false,
    sensitive: false,
    visibility: 'public',
    media_attachments: [
      {
        id: 'media1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        preview_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
        description: 'AI neural network visualization',
      },
    ],
    tags: [{ name: 'AI', url: '#' }, { name: 'MCP', url: '#' }, { name: 'LLM', url: '#' }],
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'favourite',
    created_at: new Date(Date.now() - 300000).toISOString(),
    account: mockAccounts[0],
    status: mockToots[4],
  },
  {
    id: 'n2',
    type: 'reblog',
    created_at: new Date(Date.now() - 600000).toISOString(),
    account: mockAccounts[1],
    status: mockToots[4],
  },
  {
    id: 'n3',
    type: 'follow',
    created_at: new Date(Date.now() - 1200000).toISOString(),
    account: mockAccounts[2],
  },
  {
    id: 'n4',
    type: 'mention',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    account: mockAccounts[3],
    status: {
      ...mockToots[3],
      content: '<p><span class="mention">@zeekay</span> What\'s your take on self-hosted monitoring vs cloud solutions for AI workloads?</p>',
    },
  },
];

const mockInstanceInfo: InstanceInfo = {
  uri: 'mastodon.social',
  title: 'Mastodon',
  description: 'The original server operated by the Mastodon gGmbH non-profit',
  version: '4.2.0',
  stats: {
    user_count: 1823456,
    status_count: 89234567,
    domain_count: 23456,
  },
  rules: [
    { id: '1', text: 'No racism, sexism, homophobia, transphobia, xenophobia, or casteism' },
    { id: '2', text: 'No incitement of violence or promotion of violent ideologies' },
    { id: '3', text: 'No harassment, dogpiling or doxxing of other users' },
  ],
};

const mockHashtags = [
  { name: 'AI', uses: 12456, history: [{ uses: 234 }, { uses: 189 }, { uses: 245 }] },
  { name: 'Rust', uses: 8923, history: [{ uses: 156 }, { uses: 178 }, { uses: 192 }] },
  { name: 'Fediverse', uses: 7845, history: [{ uses: 234 }, { uses: 256 }, { uses: 298 }] },
  { name: 'OpenSource', uses: 6234, history: [{ uses: 123 }, { uses: 134 }, { uses: 145 }] },
  { name: 'Linux', uses: 5678, history: [{ uses: 98 }, { uses: 112 }, { uses: 125 }] },
];

// Timeline tabs
type TimelineTab = 'home' | 'local' | 'federated';
type MainTab = 'timeline' | 'notifications' | 'bookmarks' | 'favourites' | 'profile' | 'instance';

// Utilities
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const stripHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Components
const MastodonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 74 79" className={className} fill="currentColor">
    <path d="M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C-0.00357854 21.0022 -0.100361 25.6322 0.068112 29.8793C0.308275 35.9699 0.354874 42.0498 0.91406 48.1156C1.30064 52.1448 1.97502 56.1419 2.93215 60.0769C4.72441 67.3445 11.9795 73.3925 19.0876 75.86C26.6979 78.4332 34.8821 78.8603 42.724 77.0937C43.5866 76.8952 44.4398 76.6647 45.2833 76.4024C47.1867 75.8033 49.4199 75.1332 51.0616 73.9562C51.0841 73.9397 51.1026 73.9184 51.1156 73.8938C51.1286 73.8693 51.1359 73.8421 51.1368 73.8144V67.9366C51.1364 67.9107 51.1302 67.8852 51.1186 67.862C51.1069 67.8388 51.0902 67.8184 51.0695 67.8025C51.0489 67.7865 51.0249 67.7753 50.9994 67.7696C50.9739 67.764 50.9474 67.7641 50.9219 67.7699C45.8976 68.9569 40.7491 69.5519 35.5836 69.5425C26.694 69.5425 24.3031 65.3699 23.6184 63.6327C23.0681 62.1314 22.7186 60.5654 22.5789 58.9744C22.5775 58.9477 22.5825 58.921 22.5934 58.8965C22.6043 58.872 22.621 58.8503 22.6## 58.833C22.6## 58.8157 22.6709 58.8032 22.6944 58.7964C22.7## 58.7896 22.7## 58.7888 22.7## 58.794C27.7## 59.9723 32.## 60.5579 37.5 60.5475C38.## 60.5475 39.## 60.5475 40.## 60.5422C## ## ## ## ## ## 35.## 59.8## 28.## 59.## 25.## 58.7017C## 0.## -0.## 10.## -7.## 18.## -7.## 26.## -11.## -11.## -17.## -8.## -23.##C## 22.## 72.## 17.## 73.## 17.##" />
  </svg>
);

const VisibilityIcon: React.FC<{ visibility: Toot['visibility']; className?: string }> = ({ visibility, className }) => {
  switch (visibility) {
    case 'public':
      return <Globe className={className} />;
    case 'unlisted':
      return <Unlock className={className} />;
    case 'private':
      return <Lock className={className} />;
    case 'direct':
      return <AtSign className={className} />;
  }
};

const Avatar: React.FC<{ account: MastodonAccount; size?: 'sm' | 'md' | 'lg' }> = ({ account, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];

  const colorIndex = account.username.charCodeAt(0) % colors.length;

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br shrink-0',
      sizeClasses[size],
      colors[colorIndex]
    )}>
      {account.display_name[0]?.toUpperCase() || account.username[0]?.toUpperCase() || '?'}
    </div>
  );
};

const TootCard: React.FC<{
  toot: Toot;
  isReblog?: boolean;
  onFavourite: (id: string) => void;
  onReblog: (id: string) => void;
  onBookmark: (id: string) => void;
}> = ({ toot, isReblog, onFavourite, onReblog, onBookmark }) => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const displayToot = toot.reblog || toot;

  return (
    <div className="px-4 py-3 border-b border-white/10 hover:bg-white/[0.02] transition-colors">
      {/* Reblog indicator */}
      {toot.reblog && (
        <div className="flex items-center gap-2 mb-2 pl-12 text-white/50 text-sm">
          <Repeat2 className="w-4 h-4" />
          <span>{toot.account.display_name} boosted</span>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar account={displayToot.account} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white truncate">{displayToot.account.display_name}</span>
            {displayToot.account.verified && (
              <Check className="w-4 h-4 text-[#6364ff]" />
            )}
            {displayToot.account.bot && (
              <span className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded text-white/60">BOT</span>
            )}
            <span className="text-white/50 text-sm truncate">@{displayToot.account.acct}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/50 text-sm">{formatTimeAgo(displayToot.created_at)}</span>
            <VisibilityIcon visibility={displayToot.visibility} className="w-3.5 h-3.5 text-white/40 ml-auto" />
          </div>

          {/* Spoiler/CW */}
          {displayToot.spoiler_text && (
            <div className="mt-2">
              <p className="text-white/80 text-sm">{displayToot.spoiler_text}</p>
              <button
                onClick={() => setShowSpoiler(!showSpoiler)}
                className="mt-1 px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 rounded text-white/70 transition-colors"
              >
                {showSpoiler ? 'Hide content' : 'Show content'}
              </button>
            </div>
          )}

          {/* Content */}
          {(!displayToot.spoiler_text || showSpoiler) && (
            <div
              className="mt-2 text-white/90 text-[15px] leading-relaxed [&_a]:text-[#8c8dff] [&_a]:hover:underline [&_.hashtag]:text-[#8c8dff] [&_.mention]:text-[#8c8dff]"
              dangerouslySetInnerHTML={{ __html: displayToot.content }}
            />
          )}

          {/* Media */}
          {(!displayToot.spoiler_text || showSpoiler) && displayToot.media_attachments.length > 0 && (
            <div className={cn(
              'mt-3 rounded-xl overflow-hidden',
              displayToot.sensitive && !showSensitive && 'relative'
            )}>
              {displayToot.sensitive && !showSensitive ? (
                <button
                  onClick={() => setShowSensitive(true)}
                  className="w-full h-48 bg-white/5 flex flex-col items-center justify-center gap-2 text-white/60 hover:bg-white/10 transition-colors"
                >
                  <EyeOff className="w-6 h-6" />
                  <span className="text-sm">Sensitive content</span>
                  <span className="text-xs text-white/40">Click to view</span>
                </button>
              ) : (
                <div className={cn(
                  'grid gap-1',
                  displayToot.media_attachments.length === 1 && 'grid-cols-1',
                  displayToot.media_attachments.length === 2 && 'grid-cols-2',
                  displayToot.media_attachments.length >= 3 && 'grid-cols-2'
                )}>
                  {displayToot.media_attachments.slice(0, 4).map((media, idx) => (
                    <div
                      key={media.id}
                      className={cn(
                        'relative bg-white/5 overflow-hidden',
                        displayToot.media_attachments.length === 1 ? 'aspect-video' : 'aspect-square',
                        displayToot.media_attachments.length === 3 && idx === 0 && 'row-span-2 aspect-auto h-full'
                      )}
                    >
                      {media.type === 'image' && (
                        <img
                          src={media.preview_url || media.url}
                          alt={media.description || 'Media'}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {media.type === 'video' && (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll */}
          {(!displayToot.spoiler_text || showSpoiler) && displayToot.poll && (
            <div className="mt-3 space-y-2">
              {displayToot.poll.options.map((option, idx) => {
                const percentage = displayToot.poll!.votes_count > 0
                  ? Math.round((option.votes_count / displayToot.poll!.votes_count) * 100)
                  : 0;
                const isVoted = displayToot.poll?.own_votes?.includes(idx);

                return (
                  <div key={idx} className="relative">
                    <div
                      className="absolute inset-0 bg-[#6364ff]/20 rounded"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between px-3 py-2 border border-white/10 rounded">
                      <div className="flex items-center gap-2">
                        {isVoted && <Check className="w-4 h-4 text-[#6364ff]" />}
                        <span className="text-white/90 text-sm">{option.title}</span>
                      </div>
                      <span className="text-white/50 text-sm">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
              <p className="text-white/50 text-xs">
                {formatNumber(displayToot.poll.voters_count)} voters ·{' '}
                {displayToot.poll.expired ? 'Closed' : `Ends ${formatTimeAgo(displayToot.poll.expires_at)}`}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 mt-3">
            <button className="flex items-center gap-1.5 text-white/50 hover:text-[#8c8dff] transition-colors group">
              <MessageCircle className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span className="text-sm">{formatNumber(displayToot.replies_count)}</span>
            </button>
            <button
              onClick={() => onReblog(displayToot.id)}
              className={cn(
                'flex items-center gap-1.5 transition-colors group',
                displayToot.reblogged ? 'text-green-500' : 'text-white/50 hover:text-green-500'
              )}
            >
              <Repeat2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span className="text-sm">{formatNumber(displayToot.reblogs_count)}</span>
            </button>
            <button
              onClick={() => onFavourite(displayToot.id)}
              className={cn(
                'flex items-center gap-1.5 transition-colors group',
                displayToot.favourited ? 'text-yellow-500' : 'text-white/50 hover:text-yellow-500'
              )}
            >
              <Star className={cn(
                'w-[18px] h-[18px] group-hover:scale-110 transition-transform',
                displayToot.favourited && 'fill-current'
              )} />
              <span className="text-sm">{formatNumber(displayToot.favourites_count)}</span>
            </button>
            <button
              onClick={() => onBookmark(displayToot.id)}
              className={cn(
                'flex items-center gap-1.5 transition-colors group',
                displayToot.bookmarked ? 'text-[#8c8dff]' : 'text-white/50 hover:text-[#8c8dff]'
              )}
            >
              <Bookmark className={cn(
                'w-[18px] h-[18px] group-hover:scale-110 transition-transform',
                displayToot.bookmarked && 'fill-current'
              )} />
            </button>
            <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group ml-auto">
              <Share className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ZMastodonWindow: React.FC<ZMastodonWindowProps> = ({ onClose, onFocus }) => {
  // State
  const [mainTab, setMainTab] = useState<MainTab>('timeline');
  const [timelineTab, setTimelineTab] = useState<TimelineTab>('home');
  const [toots, setToots] = useState<Toot[]>(mockToots);
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [composeText, setComposeText] = useState('');
  const [composeCW, setComposeCW] = useState('');
  const [showCW, setShowCW] = useState(false);
  const [composeVisibility, setComposeVisibility] = useState<Toot['visibility']>('public');
  const [showComposeOptions, setShowComposeOptions] = useState(false);
  const [followedHashtags] = useState(['AI', 'Rust', 'OpenSource']);
  const [showHashtags, setShowHashtags] = useState(false);

  const composeRef = useRef<HTMLTextAreaElement>(null);

  // Handlers
  const handleFavourite = useCallback((id: string) => {
    setToots(prev => prev.map(t => {
      if (t.id === id || t.reblog?.id === id) {
        const target = t.reblog || t;
        return {
          ...t,
          reblog: t.reblog ? {
            ...t.reblog,
            favourited: !target.favourited,
            favourites_count: target.favourited ? target.favourites_count - 1 : target.favourites_count + 1,
          } : undefined,
          ...(t.reblog ? {} : {
            favourited: !t.favourited,
            favourites_count: t.favourited ? t.favourites_count - 1 : t.favourites_count + 1,
          }),
        };
      }
      return t;
    }));
  }, []);

  const handleReblog = useCallback((id: string) => {
    setToots(prev => prev.map(t => {
      if (t.id === id || t.reblog?.id === id) {
        const target = t.reblog || t;
        return {
          ...t,
          reblog: t.reblog ? {
            ...t.reblog,
            reblogged: !target.reblogged,
            reblogs_count: target.reblogged ? target.reblogs_count - 1 : target.reblogs_count + 1,
          } : undefined,
          ...(t.reblog ? {} : {
            reblogged: !t.reblogged,
            reblogs_count: t.reblogged ? t.reblogs_count - 1 : t.reblogs_count + 1,
          }),
        };
      }
      return t;
    }));
  }, []);

  const handleBookmark = useCallback((id: string) => {
    setToots(prev => prev.map(t => {
      if (t.id === id || t.reblog?.id === id) {
        return {
          ...t,
          reblog: t.reblog ? { ...t.reblog, bookmarked: !t.reblog.bookmarked } : undefined,
          ...(t.reblog ? {} : { bookmarked: !t.bookmarked }),
        };
      }
      return t;
    }));
  }, []);

  const handlePost = useCallback(() => {
    if (!composeText.trim()) return;

    const newToot: Toot = {
      id: `new-${Date.now()}`,
      content: `<p>${composeText.replace(/\n/g, '</p><p>')}</p>`,
      created_at: new Date().toISOString(),
      account: mockCurrentUser,
      replies_count: 0,
      reblogs_count: 0,
      favourites_count: 0,
      reblogged: false,
      favourited: false,
      bookmarked: false,
      sensitive: false,
      spoiler_text: showCW ? composeCW : undefined,
      visibility: composeVisibility,
      media_attachments: [],
    };

    setToots(prev => [newToot, ...prev]);
    setComposeText('');
    setComposeCW('');
    setShowCW(false);
  }, [composeText, composeCW, showCW, composeVisibility]);

  // Filter toots based on timeline
  const filteredToots = useMemo(() => {
    switch (mainTab) {
      case 'bookmarks':
        return toots.filter(t => (t.reblog || t).bookmarked);
      case 'favourites':
        return toots.filter(t => (t.reblog || t).favourited);
      default:
        return toots;
    }
  }, [toots, mainTab]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'favourite':
        return <Star className="w-4 h-4 text-yellow-500 fill-current" />;
      case 'reblog':
        return <Repeat2 className="w-4 h-4 text-green-500" />;
      case 'follow':
        return <User className="w-4 h-4 text-[#8c8dff]" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-[#8c8dff]" />;
      case 'poll':
        return <BarChart3 className="w-4 h-4 text-[#8c8dff]" />;
      case 'follow_request':
        return <User className="w-4 h-4 text-orange-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'favourite':
        return 'favourited your toot';
      case 'reblog':
        return 'boosted your toot';
      case 'follow':
        return 'followed you';
      case 'mention':
        return 'mentioned you';
      case 'poll':
        return 'poll has ended';
      case 'follow_request':
        return 'requested to follow you';
    }
  };

  return (
    <ZWindow
      title="Mastodon"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={900}
      defaultHeight={700}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 120, y: 80 }}
    >
      <div className="flex h-full bg-[#191b22] overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-[#17181f] border-r border-white/10 flex flex-col">
          {/* Logo & Profile */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6364ff] to-[#563acc] flex items-center justify-center">
                <MastodonIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">Mastodon</h2>
                <p className="text-white/50 text-xs">mastodon.social</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar account={mockCurrentUser} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{mockCurrentUser.display_name}</p>
                <p className="text-white/50 text-xs truncate">@{mockCurrentUser.username}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 overflow-y-auto">
            <button
              onClick={() => setMainTab('timeline')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                mainTab === 'timeline' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Home</span>
            </button>
            <button
              onClick={() => setMainTab('notifications')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors relative',
                mainTab === 'notifications' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="text-sm font-medium">Notifications</span>
              {notifications.length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] bg-[#6364ff] rounded-full text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMainTab('bookmarks')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                mainTab === 'bookmarks' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-sm font-medium">Bookmarks</span>
            </button>
            <button
              onClick={() => setMainTab('favourites')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                mainTab === 'favourites' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">Favourites</span>
            </button>
            <button
              onClick={() => setMainTab('profile')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                mainTab === 'profile' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button
              onClick={() => setMainTab('instance')}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                mainTab === 'instance' ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Server className="w-5 h-5" />
              <span className="text-sm font-medium">About</span>
            </button>

            {/* Followed Hashtags */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowHashtags(!showHashtags)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-white/50 hover:text-white/70 transition-colors"
              >
                <Hash className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Followed Tags</span>
                <ChevronDown className={cn(
                  'w-4 h-4 ml-auto transition-transform',
                  showHashtags && 'rotate-180'
                )} />
              </button>
              {showHashtags && (
                <div className="mt-1 space-y-0.5">
                  {followedHashtags.map(tag => (
                    <button
                      key={tag}
                      className="w-full flex items-center gap-2 px-4 py-1.5 text-left text-white/60 hover:bg-white/5 hover:text-[#8c8dff] transition-colors text-sm"
                    >
                      <span>#</span>
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Post Button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => composeRef.current?.focus()}
              className="w-full py-2.5 bg-gradient-to-r from-[#6364ff] to-[#563acc] hover:from-[#7374ff] hover:to-[#6340dd] text-white rounded-full font-medium text-sm transition-all"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Timeline Header with Tabs */}
          {mainTab === 'timeline' && (
            <div className="flex items-center border-b border-white/10 bg-[#191b22]/80 backdrop-blur-sm">
              <button
                onClick={() => setTimelineTab('home')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                  timelineTab === 'home' ? 'text-white' : 'text-white/60 hover:text-white/80'
                )}
              >
                Home
                {timelineTab === 'home' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#6364ff] rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setTimelineTab('local')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                  timelineTab === 'local' ? 'text-white' : 'text-white/60 hover:text-white/80'
                )}
              >
                Local
                {timelineTab === 'local' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#6364ff] rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setTimelineTab('federated')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                  timelineTab === 'federated' ? 'text-white' : 'text-white/60 hover:text-white/80'
                )}
              >
                Federated
                {timelineTab === 'federated' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#6364ff] rounded-t-full" />
                )}
              </button>
            </div>
          )}

          {/* Other Headers */}
          {mainTab !== 'timeline' && mainTab !== 'profile' && mainTab !== 'instance' && (
            <div className="px-4 py-3 border-b border-white/10 bg-[#191b22]/80 backdrop-blur-sm">
              <h2 className="text-white font-semibold capitalize">{mainTab}</h2>
            </div>
          )}

          {/* Content */}
          <ScrollArea className="flex-1">
            {/* Compose Area (only on timeline) */}
            {mainTab === 'timeline' && (
              <div className="p-4 border-b border-white/10">
                <div className="flex gap-3">
                  <Avatar account={mockCurrentUser} />
                  <div className="flex-1">
                    {showCW && (
                      <input
                        type="text"
                        placeholder="Content warning"
                        value={composeCW}
                        onChange={(e) => setComposeCW(e.target.value)}
                        className="w-full px-3 py-2 mb-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 outline-none focus:border-[#6364ff] transition-colors"
                      />
                    )}
                    <textarea
                      ref={composeRef}
                      placeholder="What's on your mind?"
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 outline-none focus:border-[#6364ff] transition-colors resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg text-[#8c8dff] hover:bg-white/5 transition-colors">
                          <ImageIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg text-[#8c8dff] hover:bg-white/5 transition-colors">
                          <BarChart3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowCW(!showCW)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            showCW ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-[#8c8dff] hover:bg-white/5'
                          )}
                        >
                          <AlertTriangle className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg text-[#8c8dff] hover:bg-white/5 transition-colors">
                          <Smile className="w-5 h-5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowComposeOptions(!showComposeOptions)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#8c8dff] hover:bg-white/5 transition-colors text-sm"
                          >
                            <VisibilityIcon visibility={composeVisibility} className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {showComposeOptions && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-[#1f2028] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                              {(['public', 'unlisted', 'private', 'direct'] as const).map(v => (
                                <button
                                  key={v}
                                  onClick={() => { setComposeVisibility(v); setShowComposeOptions(false); }}
                                  className={cn(
                                    'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                                    composeVisibility === v ? 'bg-[#6364ff]/20 text-[#8c8dff]' : 'text-white/70 hover:bg-white/5'
                                  )}
                                >
                                  <VisibilityIcon visibility={v} className="w-4 h-4" />
                                  <span className="capitalize">{v}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm',
                          composeText.length > 500 ? 'text-red-400' : 'text-white/40'
                        )}>
                          {500 - composeText.length}
                        </span>
                        <button
                          onClick={handlePost}
                          disabled={!composeText.trim() || composeText.length > 500}
                          className="px-4 py-1.5 bg-[#6364ff] hover:bg-[#7374ff] disabled:opacity-50 disabled:hover:bg-[#6364ff] text-white rounded-full text-sm font-medium transition-colors"
                        >
                          Toot!
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {(mainTab === 'timeline' || mainTab === 'bookmarks' || mainTab === 'favourites') && (
              <div>
                {filteredToots.length > 0 ? (
                  filteredToots.map(toot => (
                    <TootCard
                      key={toot.id}
                      toot={toot}
                      onFavourite={handleFavourite}
                      onReblog={handleReblog}
                      onBookmark={handleBookmark}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-white/40">
                    {mainTab === 'bookmarks' ? (
                      <>
                        <Bookmark className="w-12 h-12 mb-3" />
                        <p>No bookmarks yet</p>
                      </>
                    ) : mainTab === 'favourites' ? (
                      <>
                        <Star className="w-12 h-12 mb-3" />
                        <p>No favourites yet</p>
                      </>
                    ) : (
                      <>
                        <Home className="w-12 h-12 mb-3" />
                        <p>No toots to show</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {mainTab === 'notifications' && (
              <div>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 border-b border-white/10 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 flex justify-end">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar account={notification.account} size="sm" />
                          <span className="text-white font-medium text-sm truncate">
                            {notification.account.display_name}
                          </span>
                          <span className="text-white/50 text-sm">
                            {getNotificationText(notification)}
                          </span>
                          <span className="text-white/30 text-sm ml-auto shrink-0">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        {notification.status && (
                          <div
                            className="mt-2 text-white/60 text-sm line-clamp-2 [&_a]:text-[#8c8dff] [&_.mention]:text-[#8c8dff]"
                            dangerouslySetInnerHTML={{ __html: notification.status.content }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile */}
            {mainTab === 'profile' && (
              <div>
                {/* Header */}
                <div className="h-32 bg-gradient-to-br from-[#6364ff] to-[#563acc] relative">
                  <div className="absolute -bottom-12 left-4">
                    <div className="w-24 h-24 rounded-full border-4 border-[#191b22] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {mockCurrentUser.display_name[0]}
                    </div>
                  </div>
                </div>

                <div className="px-4 pt-14 pb-4 border-b border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-white text-xl font-bold">{mockCurrentUser.display_name}</h2>
                        {mockCurrentUser.verified && <Check className="w-5 h-5 text-[#6364ff]" />}
                      </div>
                      <p className="text-white/50 text-sm">@{mockCurrentUser.acct}</p>
                    </div>
                    <button className="px-4 py-1.5 border border-white/20 rounded-full text-white text-sm hover:bg-white/5 transition-colors">
                      Edit profile
                    </button>
                  </div>
                  <p className="text-white/80 text-sm mb-4">{mockCurrentUser.note}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-white/50">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(mockCurrentUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <button className="text-center hover:underline">
                      <span className="text-white font-bold">{formatNumber(mockCurrentUser.statuses_count)}</span>
                      <span className="text-white/50 ml-1">Toots</span>
                    </button>
                    <button className="text-center hover:underline">
                      <span className="text-white font-bold">{formatNumber(mockCurrentUser.following_count)}</span>
                      <span className="text-white/50 ml-1">Following</span>
                    </button>
                    <button className="text-center hover:underline">
                      <span className="text-white font-bold">{formatNumber(mockCurrentUser.followers_count)}</span>
                      <span className="text-white/50 ml-1">Followers</span>
                    </button>
                  </div>
                </div>

                {/* User's toots */}
                {toots
                  .filter(t => t.account.id === mockCurrentUser.id)
                  .map(toot => (
                    <TootCard
                      key={toot.id}
                      toot={toot}
                      onFavourite={handleFavourite}
                      onReblog={handleReblog}
                      onBookmark={handleBookmark}
                    />
                  ))}
              </div>
            )}

            {/* Instance Info */}
            {mainTab === 'instance' && (
              <div className="p-4">
                <div className="rounded-xl bg-white/5 overflow-hidden mb-4">
                  <div className="h-32 bg-gradient-to-br from-[#6364ff] to-[#563acc] flex items-center justify-center">
                    <MastodonIcon className="w-16 h-16 text-white/80" />
                  </div>
                  <div className="p-4">
                    <h2 className="text-white text-xl font-bold mb-1">{mockInstanceInfo.title}</h2>
                    <p className="text-[#8c8dff] text-sm mb-3">{mockInstanceInfo.uri}</p>
                    <p className="text-white/70 text-sm">{mockInstanceInfo.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <Users className="w-6 h-6 text-[#8c8dff] mx-auto mb-2" />
                    <p className="text-white font-bold">{formatNumber(mockInstanceInfo.stats.user_count)}</p>
                    <p className="text-white/50 text-xs">Users</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <MessageCircle className="w-6 h-6 text-[#8c8dff] mx-auto mb-2" />
                    <p className="text-white font-bold">{formatNumber(mockInstanceInfo.stats.status_count)}</p>
                    <p className="text-white/50 text-xs">Toots</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 text-center">
                    <Globe className="w-6 h-6 text-[#8c8dff] mx-auto mb-2" />
                    <p className="text-white font-bold">{formatNumber(mockInstanceInfo.stats.domain_count)}</p>
                    <p className="text-white/50 text-xs">Servers</p>
                  </div>
                </div>

                {/* Trending Hashtags */}
                <div className="rounded-xl bg-white/5 overflow-hidden mb-4">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#8c8dff]" />
                      Trending Hashtags
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {mockHashtags.map(tag => (
                      <button
                        key={tag.name}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-white/40" />
                          <span className="text-[#8c8dff]">{tag.name}</span>
                        </div>
                        <span className="text-white/40 text-sm">{formatNumber(tag.uses)} uses</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div className="rounded-xl bg-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <h3 className="text-white font-semibold">Server Rules</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {mockInstanceInfo.rules.map((rule, idx) => (
                      <div key={rule.id} className="flex gap-3 px-4 py-3">
                        <span className="text-[#8c8dff] font-bold">{idx + 1}.</span>
                        <span className="text-white/80 text-sm">{rule.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Version */}
                <div className="mt-4 text-center text-white/30 text-xs">
                  Mastodon v{mockInstanceInfo.version}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Sidebar - Search & Trending */}
        <div className="w-72 bg-[#17181f] border-l border-white/10 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {/* Trending Now */}
            <div className="p-3">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8c8dff]" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {mockHashtags.slice(0, 5).map(tag => (
                  <button
                    key={tag.name}
                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <p className="text-[#8c8dff] font-medium text-sm">#{tag.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{formatNumber(tag.uses)} people talking</p>
                    <div className="flex gap-0.5 mt-2">
                      {tag.history.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 h-6 bg-[#6364ff]/30 rounded-sm"
                          style={{ height: `${Math.max(8, (h.uses / 300) * 24)}px` }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Who to Follow */}
            <div className="p-3 border-t border-white/10">
              <h3 className="text-white font-semibold text-sm mb-3">Who to Follow</h3>
              <div className="space-y-3">
                {mockAccounts.slice(0, 3).map(account => (
                  <div key={account.id} className="flex items-center gap-3">
                    <Avatar account={account} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{account.display_name}</p>
                      <p className="text-white/50 text-xs truncate">@{account.acct}</p>
                    </div>
                    <button className="px-3 py-1 bg-white text-[#191b22] rounded-full text-xs font-medium hover:bg-white/90 transition-colors">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="p-3 border-t border-white/10">
              <div className="flex flex-wrap gap-2 text-xs text-white/40">
                <a href="#" className="hover:underline">About</a>
                <span>·</span>
                <a href="#" className="hover:underline">Apps</a>
                <span>·</span>
                <a href="#" className="hover:underline">Privacy</a>
                <span>·</span>
                <a href="#" className="hover:underline">Keyboard</a>
              </div>
              <p className="text-xs text-white/30 mt-2">
                Mastodon · Decentralized social media
              </p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZMastodonWindow;
