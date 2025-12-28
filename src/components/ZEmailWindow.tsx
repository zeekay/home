import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Inbox,
  FileText,
  Trash2,
  Star,
  Archive,
  Paperclip,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  MoreHorizontal,
  Reply,
  Forward,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  File,
  Download,
  Search,
  Flag,
  Mail,
  MailOpen,
  FolderPlus,
  Filter,
  Clock,
  Users,
  AlertCircle,
  Ban,
  Bell,
  Copy,
  Check,
  Plus,
  Minus,
  Edit2,
  Save,
  Trash,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';

interface ZEmailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Types
interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  data?: string;
}

interface EmailAddress {
  name: string;
  email: string;
}

interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  date: Date;
  read: boolean;
  starred: boolean;
  flagColor?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
  attachments: EmailAttachment[];
  folder: string;
  threadId?: string;
  inReplyTo?: string;
  isScheduled?: boolean;
  scheduledDate?: Date;
  labels: string[];
}

interface Signature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

interface EmailRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    field: 'from' | 'to' | 'subject' | 'body';
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith';
    value: string;
  }[];
  actions: {
    type: 'move' | 'flag' | 'markRead' | 'delete' | 'label';
    value: string;
  }[];
}

interface CustomFolder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
}

interface SearchFilters {
  from?: string;
  to?: string;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachment?: boolean;
  unreadOnly?: boolean;
  folder?: string;
}

interface OutOfOfficeSettings {
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  subject: string;
  message: string;
  sendToContacts: boolean;
  sendToAll: boolean;
}

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  showPreview: boolean;
  vipOnly: boolean;
}

interface TemplateEmail {
  id: string;
  name: string;
  subject: string;
  body: string;
}

// Storage keys
const STORAGE_KEYS = {
  emails: 'zos_mail_emails',
  drafts: 'zos_mail_drafts',
  signatures: 'zos_mail_signatures',
  rules: 'zos_mail_rules',
  folders: 'zos_mail_folders',
  savedSearches: 'zos_mail_saved_searches',
  vipSenders: 'zos_mail_vip_senders',
  blockedSenders: 'zos_mail_blocked_senders',
  oooSettings: 'zos_mail_ooo_settings',
  notificationPrefs: 'zos_mail_notification_prefs',
  templates: 'zos_mail_templates',
};

// Utility functions
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const parseEmailAddress = (str: string): EmailAddress => {
  const match = str.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: str.trim(), email: str.trim() };
};

const formatEmailAddress = (addr: EmailAddress): string => {
  if (addr.name && addr.name !== addr.email) {
    return `${addr.name} <${addr.email}>`;
  }
  return addr.email;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

// Default data
const defaultSignatures: Signature[] = [
  { id: 'default', name: 'Default', content: '\n\nBest regards,\nZ', isDefault: true },
  { id: 'professional', name: 'Professional', content: '\n\nBest,\nZachary Elliott\nzeekay.ai', isDefault: false },
  { id: 'none', name: 'No Signature', content: '', isDefault: false },
];

const defaultTemplates: TemplateEmail[] = [
  { id: 'followup', name: 'Follow Up', subject: 'Following up on our conversation', body: 'Hi,\n\nI wanted to follow up on our recent conversation...' },
  { id: 'meeting', name: 'Meeting Request', subject: 'Meeting Request', body: 'Hi,\n\nI would like to schedule a meeting to discuss...' },
  { id: 'thankyou', name: 'Thank You', subject: 'Thank You', body: 'Hi,\n\nThank you for your time and consideration...' },
];

const FLAG_COLORS = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  gray: '#6b7280',
};

// Sample emails for demo
const generateSampleEmails = (): Email[] => {
  const now = new Date();
  return [
    {
      id: generateId(),
      from: { name: 'GitHub', email: 'noreply@github.com' },
      to: [{ name: 'Z', email: 'z@zeekay.ai' }],
      cc: [],
      bcc: [],
      subject: 'New pull request merged',
      body: 'Your pull request #42 has been merged into main.\n\nChanges:\n- Updated authentication flow\n- Fixed memory leak in worker threads\n- Added unit tests\n\nView the changes: https://github.com/...',
      date: new Date(now.getTime() - 1000 * 60 * 30),
      read: false,
      starred: false,
      attachments: [],
      folder: 'inbox',
      labels: ['github'],
    },
    {
      id: generateId(),
      from: { name: 'Hanzo AI', email: 'team@hanzo.ai' },
      to: [{ name: 'Z', email: 'z@zeekay.ai' }],
      cc: [],
      bcc: [],
      subject: 'Weekly AI Research Digest',
      body: 'This week in AI:\n\n1. New breakthrough in multimodal models\n2. Advances in reasoning capabilities\n3. Edge deployment optimizations\n\nRead more at hanzo.ai/research',
      date: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      read: true,
      starred: true,
      attachments: [
        { id: '1', name: 'research-summary.pdf', size: 245000, type: 'application/pdf' },
      ],
      folder: 'inbox',
      labels: ['newsletter'],
    },
    {
      id: generateId(),
      from: { name: 'Lux Network', email: 'alerts@lux.network' },
      to: [{ name: 'Z', email: 'z@zeekay.ai' }],
      cc: [],
      bcc: [],
      subject: 'Validator Status Update',
      body: 'Your validator node is performing optimally.\n\nStats:\n- Uptime: 99.99%\n- Blocks validated: 12,847\n- Rewards earned: 142.5 LUX\n\nView dashboard: https://lux.network/validators',
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      read: false,
      starred: false,
      flagColor: 'green',
      attachments: [],
      folder: 'inbox',
      labels: ['lux', 'important'],
    },
  ];
};

// Main component
const ZEmailWindow: React.FC<ZEmailWindowProps> = ({ onClose, onFocus }) => {
  // Core state
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'replyAll' | 'forward' | null>(null);

  // Compose state
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeBcc, setComposeBcc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sending, setSending] = useState(false);

  // Signatures & Templates
  const [signatures, setSignatures] = useState<Signature[]>(defaultSignatures);
  const [templates, setTemplates] = useState<TemplateEmail[]>(defaultTemplates);
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Folders
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['mailboxes', 'smart']));
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Rules
  const [rules, setRules] = useState<EmailRule[]>([]);

  // VIP & Blocked
  const [vipSenders, setVipSenders] = useState<string[]>([]);
  const [blockedSenders, setBlockedSenders] = useState<string[]>([]);

  // Settings
  const [oooSettings, setOooSettings] = useState<OutOfOfficeSettings>({
    enabled: false,
    subject: 'Out of Office',
    message: 'I am currently out of the office and will respond when I return.',
    sendToContacts: true,
    sendToAll: false,
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    showPreview: true,
    vipOnly: false,
  });

  // Undo send
  const [undoQueue, setUndoQueue] = useState<{ email: Email; timeout: NodeJS.Timeout }[]>([]);
  const UNDO_DELAY = 30000; // 30 seconds

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'signatures' | 'rules' | 'ooo' | 'notifications' | 'templates'>('signatures');
  const [formatting, setFormatting] = useState({ bold: false, italic: false, list: false });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; email: Email } | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedEmails = localStorage.getItem(STORAGE_KEYS.emails);
      if (storedEmails) {
        const parsed = JSON.parse(storedEmails);
        setEmails(parsed.map((e: Email) => ({ ...e, date: new Date(e.date) })));
      } else {
        setEmails(generateSampleEmails());
      }

      const storedSignatures = localStorage.getItem(STORAGE_KEYS.signatures);
      if (storedSignatures) setSignatures(JSON.parse(storedSignatures));

      const storedRules = localStorage.getItem(STORAGE_KEYS.rules);
      if (storedRules) setRules(JSON.parse(storedRules));

      const storedFolders = localStorage.getItem(STORAGE_KEYS.folders);
      if (storedFolders) setCustomFolders(JSON.parse(storedFolders));

      const storedSearches = localStorage.getItem(STORAGE_KEYS.savedSearches);
      if (storedSearches) setSavedSearches(JSON.parse(storedSearches));

      const storedVip = localStorage.getItem(STORAGE_KEYS.vipSenders);
      if (storedVip) setVipSenders(JSON.parse(storedVip));

      const storedBlocked = localStorage.getItem(STORAGE_KEYS.blockedSenders);
      if (storedBlocked) setBlockedSenders(JSON.parse(storedBlocked));

      const storedOoo = localStorage.getItem(STORAGE_KEYS.oooSettings);
      if (storedOoo) setOooSettings(JSON.parse(storedOoo));

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.notificationPrefs);
      if (storedNotifs) setNotificationPrefs(JSON.parse(storedNotifs));

      const storedTemplates = localStorage.getItem(STORAGE_KEYS.templates);
      if (storedTemplates) setTemplates(JSON.parse(storedTemplates));

      const defaultSig = defaultSignatures.find(s => s.isDefault) || defaultSignatures[0];
      setSelectedSignature(defaultSig);
    } catch (err) {
      console.error('Error loading mail data:', err);
      setEmails(generateSampleEmails());
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.emails, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.signatures, JSON.stringify(signatures));
  }, [signatures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.rules, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.folders, JSON.stringify(customFolders));
  }, [customFolders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.savedSearches, JSON.stringify(savedSearches));
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.vipSenders, JSON.stringify(vipSenders));
  }, [vipSenders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.blockedSenders, JSON.stringify(blockedSenders));
  }, [blockedSenders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.oooSettings, JSON.stringify(oooSettings));
  }, [oooSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notificationPrefs, JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
  }, [templates]);

  // Mailbox definitions
  const standardMailboxes = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'drafts', label: 'Drafts', icon: FileText },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'junk', label: 'Junk', icon: AlertCircle },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const smartMailboxes = [
    { id: 'unread', label: 'Unread', icon: Mail, filter: (e: Email) => !e.read && e.folder !== 'trash' && e.folder !== 'junk' },
    { id: 'flagged', label: 'Flagged', icon: Flag, filter: (e: Email) => !!e.flagColor && e.folder !== 'trash' },
    { id: 'starred', label: 'Starred', icon: Star, filter: (e: Email) => e.starred && e.folder !== 'trash' },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, filter: (e: Email) => e.attachments.length > 0 && e.folder !== 'trash' },
    { id: 'vip', label: 'VIP', icon: Users, filter: (e: Email) => vipSenders.includes(e.from.email) && e.folder !== 'trash' },
  ];

  // Get email counts
  const getMailboxCount = (id: string): number => {
    const smartMailbox = smartMailboxes.find(m => m.id === id);
    if (smartMailbox) {
      return emails.filter(smartMailbox.filter).length;
    }
    if (id === 'inbox') {
      return emails.filter(e => e.folder === 'inbox' && !e.read).length;
    }
    return emails.filter(e => e.folder === id).length;
  };

  // Filter emails based on current mailbox and search
  const getFilteredEmails = useCallback((): Email[] => {
    let filtered = [...emails];

    // Apply mailbox filter
    const smartMailbox = smartMailboxes.find(m => m.id === selectedMailbox);
    if (smartMailbox) {
      filtered = filtered.filter(smartMailbox.filter);
    } else if (selectedMailbox.startsWith('search:')) {
      const searchId = selectedMailbox.replace('search:', '');
      const savedSearch = savedSearches.find(s => s.id === searchId);
      if (savedSearch) {
        filtered = applySearchFilters(filtered, savedSearch.query, savedSearch.filters);
      }
    } else if (selectedMailbox.startsWith('folder:')) {
      const folderId = selectedMailbox.replace('folder:', '');
      filtered = filtered.filter(e => e.folder === folderId);
    } else {
      filtered = filtered.filter(e => e.folder === selectedMailbox);
    }

    // Apply search
    if (searchQuery || Object.keys(searchFilters).length > 0) {
      filtered = applySearchFilters(filtered, searchQuery, searchFilters);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [emails, selectedMailbox, searchQuery, searchFilters, savedSearches, vipSenders]);

  const applySearchFilters = (emailList: Email[], query: string, filters: SearchFilters): Email[] => {
    return emailList.filter(email => {
      if (query) {
        const q = query.toLowerCase();
        const matchesQuery =
          email.subject.toLowerCase().includes(q) ||
          email.body.toLowerCase().includes(q) ||
          email.from.name.toLowerCase().includes(q) ||
          email.from.email.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      if (filters.from) {
        const f = filters.from.toLowerCase();
        if (!email.from.email.toLowerCase().includes(f) && !email.from.name.toLowerCase().includes(f)) {
          return false;
        }
      }

      if (filters.to) {
        const t = filters.to.toLowerCase();
        if (!email.to.some(addr => addr.email.toLowerCase().includes(t) || addr.name.toLowerCase().includes(t))) {
          return false;
        }
      }

      if (filters.subject) {
        if (!email.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
          return false;
        }
      }

      if (filters.dateFrom) {
        if (new Date(email.date) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        if (new Date(email.date) > new Date(filters.dateTo)) return false;
      }

      if (filters.hasAttachment && email.attachments.length === 0) {
        return false;
      }

      if (filters.unreadOnly && email.read) {
        return false;
      }

      if (filters.folder && email.folder !== filters.folder) {
        return false;
      }

      return true;
    });
  };

  // Email actions
  const markAsRead = (emailId: string, read: boolean = true) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read } : e));
  };

  const toggleStar = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  };

  const setFlag = (emailId: string, color: Email['flagColor'] | undefined) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, flagColor: color } : e));
  };

  const moveToFolder = (emailId: string, folder: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder } : e));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
    toast.success(`Moved to ${folder}`);
  };

  const deleteEmail = (emailId: string, permanent: boolean = false) => {
    if (permanent) {
      setEmails(prev => prev.filter(e => e.id !== emailId));
      toast.success('Email deleted permanently');
    } else {
      moveToFolder(emailId, 'trash');
    }
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const blockSender = (email: string) => {
    if (!blockedSenders.includes(email)) {
      setBlockedSenders(prev => [...prev, email]);
      toast.success(`Blocked ${email}`);
    }
  };

  const unblockSender = (email: string) => {
    setBlockedSenders(prev => prev.filter(e => e !== email));
    toast.success(`Unblocked ${email}`);
  };

  const addToVip = (email: string) => {
    if (!vipSenders.includes(email)) {
      setVipSenders(prev => [...prev, email]);
      toast.success(`Added to VIP`);
    }
  };

  const removeFromVip = (email: string) => {
    setVipSenders(prev => prev.filter(e => e !== email));
    toast.success(`Removed from VIP`);
  };

  // Compose actions
  const startCompose = () => {
    setIsComposing(true);
    setReplyMode(null);
    setSelectedEmail(null);
    setComposeTo('z@zeekay.ai');
    setComposeCc('');
    setComposeBcc('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    setShowCcBcc(false);
    setIsScheduling(false);
    setScheduledDate('');
    setScheduledTime('');
  };

  const startReply = (email: Email, mode: 'reply' | 'replyAll' | 'forward') => {
    setIsComposing(true);
    setReplyMode(mode);

    if (mode === 'forward') {
      setComposeTo('');
      setComposeSubject(`Fwd: ${email.subject}`);
      setComposeBody(`\n\n---------- Forwarded message ----------\nFrom: ${formatEmailAddress(email.from)}\nDate: ${new Date(email.date).toLocaleString()}\nSubject: ${email.subject}\nTo: ${email.to.map(formatEmailAddress).join(', ')}\n\n${email.body}`);
      setComposeAttachments([...email.attachments]);
    } else {
      setComposeTo(formatEmailAddress(email.from));
      if (mode === 'replyAll') {
        const ccAddrs = [...email.to, ...email.cc]
          .filter(addr => addr.email !== 'z@zeekay.ai')
          .map(formatEmailAddress);
        setComposeCc(ccAddrs.join(', '));
        setShowCcBcc(ccAddrs.length > 0);
      }
      setComposeSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);
      setComposeBody(`\n\nOn ${new Date(email.date).toLocaleString()}, ${formatEmailAddress(email.from)} wrote:\n> ${email.body.split('\n').join('\n> ')}`);
    }

    setSelectedEmail(null);
  };

  const saveDraft = () => {
    const draft: Email = {
      id: generateId(),
      from: { name: senderName || 'Draft', email: senderEmail || 'draft@zos.local' },
      to: composeTo.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      cc: composeCc.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      bcc: composeBcc.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      subject: composeSubject || '(No Subject)',
      body: composeBody,
      date: new Date(),
      read: true,
      starred: false,
      attachments: composeAttachments,
      folder: 'drafts',
      labels: [],
    };

    setEmails(prev => [...prev, draft]);
    toast.success('Draft saved');
    setIsComposing(false);
  };

  const handleSendEmail = async () => {
    if (!composeSubject.trim() || !composeBody.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (!senderEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setSending(true);

    const fullMessage = composeBody + (selectedSignature?.content || '');

    const sentEmail: Email = {
      id: generateId(),
      from: { name: senderName || 'Visitor', email: senderEmail },
      to: composeTo.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      cc: composeCc.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      bcc: composeBcc.split(',').map(s => parseEmailAddress(s.trim())).filter(a => a.email),
      subject: composeSubject,
      body: fullMessage,
      date: isScheduling && scheduledDate ? new Date(`${scheduledDate}T${scheduledTime || '09:00'}`) : new Date(),
      read: true,
      starred: false,
      attachments: composeAttachments,
      folder: isScheduling ? 'scheduled' : 'sent',
      isScheduled: isScheduling,
      scheduledDate: isScheduling && scheduledDate ? new Date(`${scheduledDate}T${scheduledTime || '09:00'}`) : undefined,
      labels: [],
    };

    const timeout = setTimeout(() => {
      actualSendEmail(sentEmail);
    }, UNDO_DELAY);

    setUndoQueue(prev => [...prev, { email: sentEmail, timeout }]);
    setEmails(prev => [...prev, sentEmail]);

    toast.success(
      <div className="flex items-center gap-2">
        <span>{isScheduling ? 'Email scheduled' : 'Email sent'}</span>
        <button
          onClick={() => undoSend(sentEmail.id)}
          className="underline text-blue-400"
        >
          Undo
        </button>
      </div>,
      { duration: UNDO_DELAY }
    );

    setIsComposing(false);
    setComposeTo('');
    setComposeCc('');
    setComposeBcc('');
    setComposeSubject('');
    setComposeBody('');
    setComposeAttachments([]);
    setSenderName('');
    setSenderEmail('');
    setSending(false);
  };

  const actualSendEmail = async (email: Email) => {
    setUndoQueue(prev => prev.filter(item => item.email.id !== email.id));

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'd4f2f8a0-8e8a-4f3b-9b1e-2c3d4e5f6a7b',
          to: 'z@zeekay.ai',
          from_name: email.from.name,
          email: email.from.email,
          subject: `[zOS Mail] ${email.subject}`,
          message: email.body,
          redirect: false,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
        window.open(mailtoLink, '_blank');
      }
    } catch {
      const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
      window.open(mailtoLink, '_blank');
    }
  };

  const undoSend = (emailId: string) => {
    const item = undoQueue.find(i => i.email.id === emailId);
    if (item) {
      clearTimeout(item.timeout);
      setUndoQueue(prev => prev.filter(i => i.email.id !== emailId));
      setEmails(prev => prev.filter(e => e.id !== emailId));
      toast.success('Send cancelled');

      setIsComposing(true);
      setComposeTo(item.email.to.map(formatEmailAddress).join(', '));
      setComposeCc(item.email.cc.map(formatEmailAddress).join(', '));
      setComposeBcc(item.email.bcc.map(formatEmailAddress).join(', '));
      setComposeSubject(item.email.subject);
      setComposeBody(item.email.body);
      setComposeAttachments(item.email.attachments);
    }
  };

  // Attachment handling
  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const attachment: EmailAttachment = {
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result as string,
          preview: file.type.startsWith('image/') ? reader.result as string : undefined,
        };
        setComposeAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} file(s) attached`);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setComposeAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Formatting
  const applyFormatting = (type: 'bold' | 'italic' | 'list') => {
    if (!messageRef.current) return;

    const textarea = messageRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = composeBody.substring(start, end);

    let newText = '';
    switch (type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'list':
        newText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        break;
    }

    const newMessage = composeBody.substring(0, start) + newText + composeBody.substring(end);
    setComposeBody(newMessage);
    setFormatting(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Folder management
  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const folder: CustomFolder = {
      id: generateId(),
      name: newFolderName.trim(),
    };

    setCustomFolders(prev => [...prev, folder]);
    setNewFolderName('');
    setShowNewFolderInput(false);
    toast.success(`Folder "${folder.name}" created`);
  };

  const deleteFolder = (folderId: string) => {
    setEmails(prev => prev.map(e => e.folder === folderId ? { ...e, folder: 'inbox' } : e));
    setCustomFolders(prev => prev.filter(f => f.id !== folderId));
    toast.success('Folder deleted');
  };

  // Save search
  const saveCurrentSearch = () => {
    if (!searchQuery && Object.keys(searchFilters).length === 0) {
      toast.error('No search to save');
      return;
    }

    const name = prompt('Enter a name for this search:');
    if (!name) return;

    const savedSearch: SavedSearch = {
      id: generateId(),
      name,
      query: searchQuery,
      filters: { ...searchFilters },
    };

    setSavedSearches(prev => [...prev, savedSearch]);
    toast.success(`Search "${name}" saved`);
  };

  // Quick reply
  const [quickReplyText, setQuickReplyText] = useState('');
  const sendQuickReply = () => {
    if (!selectedEmail || !quickReplyText.trim()) return;

    const reply: Email = {
      id: generateId(),
      from: { name: 'Z', email: 'z@zeekay.ai' },
      to: [selectedEmail.from],
      cc: [],
      bcc: [],
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
      body: quickReplyText + (selectedSignature?.content || ''),
      date: new Date(),
      read: true,
      starred: false,
      attachments: [],
      folder: 'sent',
      threadId: selectedEmail.threadId || selectedEmail.id,
      inReplyTo: selectedEmail.id,
      labels: [],
    };

    setEmails(prev => [...prev, reply]);
    setQuickReplyText('');
    toast.success('Reply sent');
  };

  // Template handling
  const applyTemplate = (template: TemplateEmail) => {
    setComposeSubject(template.subject);
    setComposeBody(template.body);
    setShowTemplateMenu(false);
  };

  const filteredEmails = getFilteredEmails();

  // Render sidebar
  const renderSidebar = () => (
    <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[#3c3c3c]">
        <Button
          onClick={startCompose}
          className="w-full bg-[#0a84ff] hover:bg-[#0066cc] text-white rounded-lg h-9 text-sm font-medium"
        >
          <FileText className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-1.5">
          <button
            onClick={() => setExpandedFolders(prev => {
              const next = new Set(prev);
              if (next.has('mailboxes')) next.delete('mailboxes');
              else next.add('mailboxes');
              return next;
            })}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wide hover:text-white"
          >
            {expandedFolders.has('mailboxes') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Mailboxes
          </button>
        </div>
        {expandedFolders.has('mailboxes') && standardMailboxes.map((mailbox) => {
          const Icon = mailbox.icon;
          const count = getMailboxCount(mailbox.id);
          return (
            <button
              key={mailbox.id}
              onClick={() => {
                setSelectedMailbox(mailbox.id);
                setIsComposing(false);
                setSelectedEmail(null);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                selectedMailbox === mailbox.id
                  ? "bg-[#0a84ff] text-white"
                  : "text-[#cccccc] hover:bg-[#2a2d2e]"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{mailbox.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  selectedMailbox === mailbox.id ? "bg-white/20" : "bg-[#3c3c3c]"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="px-3 py-1.5 mt-2">
          <button
            onClick={() => setExpandedFolders(prev => {
              const next = new Set(prev);
              if (next.has('smart')) next.delete('smart');
              else next.add('smart');
              return next;
            })}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wide hover:text-white"
          >
            {expandedFolders.has('smart') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Smart Mailboxes
          </button>
        </div>
        {expandedFolders.has('smart') && smartMailboxes.map((mailbox) => {
          const Icon = mailbox.icon;
          const count = getMailboxCount(mailbox.id);
          return (
            <button
              key={mailbox.id}
              onClick={() => {
                setSelectedMailbox(mailbox.id);
                setIsComposing(false);
                setSelectedEmail(null);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                selectedMailbox === mailbox.id
                  ? "bg-[#0a84ff] text-white"
                  : "text-[#cccccc] hover:bg-[#2a2d2e]"
              )}
            >
              <Icon className={cn("w-4 h-4", mailbox.id === 'starred' && "text-yellow-500")} />
              <span className="flex-1 text-left">{mailbox.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  selectedMailbox === mailbox.id ? "bg-white/20" : "bg-[#3c3c3c]"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {customFolders.length > 0 && (
          <>
            <div className="px-3 py-1.5 mt-2">
              <button
                onClick={() => setExpandedFolders(prev => {
                  const next = new Set(prev);
                  if (next.has('folders')) next.delete('folders');
                  else next.add('folders');
                  return next;
                })}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wide hover:text-white"
              >
                {expandedFolders.has('folders') ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Folders
              </button>
            </div>
            {expandedFolders.has('folders') && customFolders.map((folder) => {
              const count = emails.filter(e => e.folder === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedMailbox(`folder:${folder.id}`);
                    setIsComposing(false);
                    setSelectedEmail(null);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors group",
                    selectedMailbox === `folder:${folder.id}`
                      ? "bg-[#0a84ff] text-white"
                      : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  )}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  {count > 0 && (
                    <span className="text-xs bg-[#3c3c3c] px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${folder.name}"?`)) {
                        deleteFolder(folder.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </button>
              );
            })}
          </>
        )}

        <div className="px-3 py-1.5 mt-2">
          {showNewFolderInput ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createFolder();
                  if (e.key === 'Escape') {
                    setShowNewFolderInput(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="Folder name..."
                className="flex-1 bg-[#3c3c3c] text-white text-xs px-2 py-1 rounded outline-none"
                autoFocus
              />
              <button onClick={createFolder} className="text-green-400 hover:text-green-300">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }} className="text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="flex items-center gap-2 text-[#808080] hover:text-white text-xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              New Folder
            </button>
          )}
        </div>

        {savedSearches.length > 0 && (
          <>
            <div className="px-3 py-1.5 mt-2">
              <span className="text-[11px] font-semibold text-[#808080] uppercase tracking-wide">
                Saved Searches
              </span>
            </div>
            {savedSearches.map((search) => (
              <button
                key={search.id}
                onClick={() => {
                  setSelectedMailbox(`search:${search.id}`);
                  setIsComposing(false);
                  setSelectedEmail(null);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors group",
                  selectedMailbox === `search:${search.id}`
                    ? "bg-[#0a84ff] text-white"
                    : "text-[#cccccc] hover:bg-[#2a2d2e]"
                )}
              >
                <Search className="w-4 h-4" />
                <span className="flex-1 text-left truncate">{search.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedSearches(prev => prev.filter(s => s.id !== search.id));
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t border-[#3c3c3c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#808080] text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>z@zeekay.ai</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-[#808080] hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        {oooSettings.enabled && (
          <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Out of Office is on
          </div>
        )}
      </div>
    </div>
  );

  // Render email list
  const renderEmailList = () => (
    <div className="w-80 border-r border-[#3c3c3c] flex flex-col bg-[#1e1e1e]">
      <div className="p-2 border-b border-[#3c3c3c]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mail..."
            className="w-full bg-[#3c3c3c] text-white text-sm pl-8 pr-8 py-1.5 rounded-md outline-none placeholder:text-[#808080]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#808080] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowSearchFilters(!showSearchFilters)}
            className={cn(
              "text-xs flex items-center gap-1 px-2 py-1 rounded",
              showSearchFilters ? "bg-[#0a84ff] text-white" : "text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
            )}
          >
            <Filter className="w-3 h-3" />
            Filters
          </button>
          {(searchQuery || Object.keys(searchFilters).length > 0) && (
            <button
              onClick={saveCurrentSearch}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          )}
        </div>

        {showSearchFilters && (
          <div className="mt-2 p-2 bg-[#252526] rounded-md space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <label className="w-12 text-[#808080]">From:</label>
              <input
                type="text"
                value={searchFilters.from || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, from: e.target.value || undefined }))}
                className="flex-1 bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-12 text-[#808080]">To:</label>
              <input
                type="text"
                value={searchFilters.to || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, to: e.target.value || undefined }))}
                className="flex-1 bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-12 text-[#808080]">Subject:</label>
              <input
                type="text"
                value={searchFilters.subject || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, subject: e.target.value || undefined }))}
                className="flex-1 bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-12 text-[#808080]">Date:</label>
              <input
                type="date"
                value={searchFilters.dateFrom || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                className="flex-1 bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none"
              />
              <span className="text-[#808080]">to</span>
              <input
                type="date"
                value={searchFilters.dateTo || ''}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                className="flex-1 bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1 text-[#cccccc]">
                <input
                  type="checkbox"
                  checked={searchFilters.hasAttachment || false}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, hasAttachment: e.target.checked || undefined }))}
                  className="rounded"
                />
                Has attachment
              </label>
              <label className="flex items-center gap-1 text-[#cccccc]">
                <input
                  type="checkbox"
                  checked={searchFilters.unreadOnly || false}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, unreadOnly: e.target.checked || undefined }))}
                  className="rounded"
                />
                Unread only
              </label>
            </div>
            <button
              onClick={() => setSearchFilters({})}
              className="text-[#0a84ff] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {filteredEmails.length > 0 ? (
          filteredEmails.map((email) => (
            <button
              key={email.id}
              onClick={() => {
                setSelectedEmail(email);
                setIsComposing(false);
                markAsRead(email.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, email });
              }}
              className={cn(
                "w-full flex items-start gap-2 px-3 py-2.5 border-b border-[#3c3c3c] text-left transition-colors",
                selectedEmail?.id === email.id ? "bg-[#094771]" : "hover:bg-[#2a2d2e]",
                !email.read && "bg-[#252526]"
              )}
            >
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className={cn(
                    "p-0.5 rounded",
                    email.starred ? "text-yellow-500" : "text-[#555] hover:text-[#808080]"
                  )}
                >
                  <Star className="w-3.5 h-3.5" fill={email.starred ? 'currentColor' : 'none'} />
                </button>
                {email.flagColor && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: FLAG_COLORS[email.flagColor] }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "text-sm truncate",
                    email.read ? "text-[#cccccc]" : "text-white font-medium"
                  )}>
                    {email.from.name}
                  </span>
                  <span className="text-xs text-[#808080] shrink-0">
                    {formatDate(new Date(email.date))}
                  </span>
                </div>
                <p className={cn(
                  "text-sm truncate",
                  email.read ? "text-[#808080]" : "text-[#cccccc]"
                )}>
                  {email.subject}
                </p>
                <p className="text-xs text-[#555] truncate mt-0.5">
                  {email.body.substring(0, 80)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {email.attachments.length > 0 && (
                    <Paperclip className="w-3 h-3 text-[#808080]" />
                  )}
                  {vipSenders.includes(email.from.email) && (
                    <Star className="w-3 h-3 text-[#0a84ff]" fill="currentColor" />
                  )}
                  {email.labels.map(label => (
                    <span key={label} className="text-[10px] bg-[#3c3c3c] text-[#cccccc] px-1 rounded">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#808080] p-4">
            <Inbox className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-medium">No Messages</p>
            <p className="text-xs text-center mt-1">
              {searchQuery ? 'No results match your search' : 'This mailbox is empty'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render email detail
  const renderEmailDetail = () => {
    if (!selectedEmail) {
      return (
        <div className="flex-1 flex items-center justify-center text-[#808080]">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Message Selected</p>
            <p className="text-sm mt-1">Select a message to read</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-3 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startReply(selectedEmail, 'reply')}
            className="h-7 px-3 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] text-xs"
          >
            <Reply className="w-3.5 h-3.5 mr-1.5" />
            Reply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startReply(selectedEmail, 'replyAll')}
            className="h-7 px-3 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] text-xs"
          >
            <Reply className="w-3.5 h-3.5 mr-1.5" />
            Reply All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startReply(selectedEmail, 'forward')}
            className="h-7 px-3 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] text-xs"
          >
            <Forward className="w-3.5 h-3.5 mr-1.5" />
            Forward
          </Button>
          <div className="h-5 w-px bg-[#3c3c3c] mx-2" />

          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 hover:bg-[#3c3c3c]",
                selectedEmail.flagColor ? "" : "text-[#808080] hover:text-white"
              )}
              style={selectedEmail.flagColor ? { color: FLAG_COLORS[selectedEmail.flagColor] } : undefined}
            >
              <Flag className="w-4 h-4" fill={selectedEmail.flagColor ? 'currentColor' : 'none'} />
            </Button>
            <div className="absolute left-0 top-8 hidden group-hover:flex bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg p-1 gap-1 z-10">
              {Object.entries(FLAG_COLORS).map(([color, hex]) => (
                <button
                  key={color}
                  onClick={() => setFlag(selectedEmail.id, color as Email['flagColor'])}
                  className="w-5 h-5 rounded-full hover:scale-110 transition-transform"
                  style={{ backgroundColor: hex }}
                />
              ))}
              <button
                onClick={() => setFlag(selectedEmail.id, undefined)}
                className="w-5 h-5 rounded-full bg-[#3c3c3c] hover:bg-[#4c4c4c] flex items-center justify-center"
              >
                <X className="w-3 h-3 text-[#808080]" />
              </button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleStar(selectedEmail.id)}
            className={cn(
              "h-7 w-7 hover:bg-[#3c3c3c]",
              selectedEmail.starred ? "text-yellow-500" : "text-[#808080] hover:text-white"
            )}
          >
            <Star className="w-4 h-4" fill={selectedEmail.starred ? 'currentColor' : 'none'} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => markAsRead(selectedEmail.id, !selectedEmail.read)}
            className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
          >
            {selectedEmail.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </Button>

          <div className="h-5 w-px bg-[#3c3c3c] mx-2" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveToFolder(selectedEmail.id, 'archive')}
            className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
          >
            <Archive className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveToFolder(selectedEmail.id, 'junk')}
            className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
          >
            <AlertCircle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteEmail(selectedEmail.id)}
            className="h-7 w-7 text-[#808080] hover:text-red-400 hover:bg-[#3c3c3c]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <div className="absolute right-0 top-8 hidden group-hover:block bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg py-1 min-w-[160px] z-10">
              {vipSenders.includes(selectedEmail.from.email) ? (
                <button
                  onClick={() => removeFromVip(selectedEmail.from.email)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Remove from VIP
                </button>
              ) : (
                <button
                  onClick={() => addToVip(selectedEmail.from.email)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to VIP
                </button>
              )}
              <button
                onClick={() => blockSender(selectedEmail.from.email)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
              >
                <Ban className="w-3.5 h-3.5" />
                Block Sender
              </button>
              <div className="h-px bg-[#3c3c3c] my-1" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedEmail.body);
                  toast.success('Copied to clipboard');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </button>
              {customFolders.length > 0 && (
                <>
                  <div className="h-px bg-[#3c3c3c] my-1" />
                  <div className="px-3 py-1 text-[10px] text-[#808080] uppercase">Move to</div>
                  {customFolders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => moveToFolder(selectedEmail.id, folder.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      {folder.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <h2 className="text-xl font-medium text-white mb-4">{selectedEmail.subject}</h2>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#0a84ff] flex items-center justify-center text-white font-medium shrink-0">
              {selectedEmail.from.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-medium">{selectedEmail.from.name}</p>
                {vipSenders.includes(selectedEmail.from.email) && (
                  <span className="text-[10px] bg-[#0a84ff] text-white px-1.5 py-0.5 rounded">VIP</span>
                )}
              </div>
              <p className="text-[#808080] text-sm">{selectedEmail.from.email}</p>
              <p className="text-[#555] text-xs mt-1">
                To: {selectedEmail.to.map(formatEmailAddress).join(', ')}
                {selectedEmail.cc.length > 0 && ` | Cc: ${selectedEmail.cc.map(formatEmailAddress).join(', ')}`}
              </p>
            </div>
            <span className="text-[#808080] text-sm shrink-0">
              {new Date(selectedEmail.date).toLocaleString()}
            </span>
          </div>

          {selectedEmail.attachments.length > 0 && (
            <div className="mb-4 p-3 bg-[#252526] rounded-lg">
              <p className="text-xs text-[#808080] mb-2">
                Attachments ({selectedEmail.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedEmail.attachments.map((att) => (
                  <button
                    key={att.id}
                    className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-3 py-2 text-xs text-[#cccccc] hover:bg-[#4c4c4c]"
                    onClick={() => {
                      if (att.preview) {
                        window.open(att.preview, '_blank');
                      }
                    }}
                  >
                    {att.preview ? (
                      <img src={att.preview} alt={att.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <File className="w-4 h-4" />
                    )}
                    <span className="max-w-[100px] truncate">{att.name}</span>
                    <span className="text-[#808080]">({formatFileSize(att.size)})</span>
                    <Download className="w-3 h-3 text-[#808080]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-[#cccccc] text-sm whitespace-pre-wrap leading-relaxed">
            {selectedEmail.body}
          </div>
        </div>

        <div className="p-4 border-t border-[#3c3c3c]">
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={quickReplyText}
              onChange={(e) => setQuickReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendQuickReply();
                }
              }}
              placeholder="Write a quick reply..."
              className="flex-1 bg-[#3c3c3c] text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-[#808080]"
            />
            <Button
              onClick={sendQuickReply}
              disabled={!quickReplyText.trim()}
              className="h-9 px-4 bg-[#0a84ff] hover:bg-[#0066cc] text-white text-sm rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render compose view
  const renderCompose = () => (
    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
      <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-3 gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSendEmail}
          disabled={sending}
          className="h-7 px-3 bg-[#0a84ff] hover:bg-[#0066cc] text-white text-xs rounded-md"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          {sending ? 'Sending...' : 'Send'}
        </Button>

        <div className="h-5 w-px bg-[#3c3c3c] mx-2" />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileAttachment}
        />

        <div className="h-5 w-px bg-[#3c3c3c] mx-2" />

        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 hover:bg-[#3c3c3c]", formatting.bold ? "text-[#0a84ff]" : "text-[#808080] hover:text-white")}
          onClick={() => applyFormatting('bold')}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 hover:bg-[#3c3c3c]", formatting.italic ? "text-[#0a84ff]" : "text-[#808080] hover:text-white")}
          onClick={() => applyFormatting('italic')}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 hover:bg-[#3c3c3c]", formatting.list ? "text-[#0a84ff]" : "text-[#808080] hover:text-white")}
          onClick={() => applyFormatting('list')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
          <Link2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
          <Image className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsScheduling(!isScheduling)}
          className={cn(
            "h-7 px-2 text-xs",
            isScheduling ? "text-[#0a84ff]" : "text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
          )}
        >
          <Clock className="w-3.5 h-3.5 mr-1" />
          Schedule
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[#808080] hover:text-white hover:bg-[#3c3c3c] text-xs"
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Template
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showTemplateMenu && (
            <div className="absolute right-0 top-8 w-48 bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg z-10 py-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left px-3 py-2 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[#808080] hover:text-white hover:bg-[#3c3c3c] text-xs"
            onClick={() => setShowSignatureMenu(!showSignatureMenu)}
          >
            <Settings className="w-3.5 h-3.5 mr-1" />
            {selectedSignature?.name || 'Signature'}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showSignatureMenu && (
            <div className="absolute right-0 top-8 w-40 bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg z-10 py-1">
              {signatures.map((sig) => (
                <button
                  key={sig.id}
                  onClick={() => {
                    setSelectedSignature(sig);
                    setShowSignatureMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs hover:bg-[#3c3c3c]",
                    selectedSignature?.id === sig.id ? "text-[#0a84ff]" : "text-[#cccccc]"
                  )}
                >
                  {sig.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={saveDraft}
          className="h-7 px-2 text-[#808080] hover:text-white hover:bg-[#3c3c3c] text-xs"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          Save Draft
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsComposing(false)}
          className="h-7 w-7 text-[#808080] hover:text-red-400 hover:bg-[#3c3c3c]"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {isScheduling && (
        <div className="px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] flex items-center gap-4">
          <span className="text-xs text-[#808080]">Schedule for:</span>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="bg-[#3c3c3c] text-white text-xs px-2 py-1 rounded outline-none"
          />
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="bg-[#3c3c3c] text-white text-xs px-2 py-1 rounded outline-none"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#1e1e1e] border-b border-[#3c3c3c]">
          <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
            <span className="text-[#808080] text-sm w-16">To:</span>
            <input
              type="text"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none"
            />
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-xs text-[#808080] hover:text-white"
            >
              Cc/Bcc
            </button>
          </div>

          {showCcBcc && (
            <>
              <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                <span className="text-[#808080] text-sm w-16">Cc:</span>
                <input
                  type="text"
                  value={composeCc}
                  onChange={(e) => setComposeCc(e.target.value)}
                  placeholder="Add recipients..."
                  className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
                />
              </div>
              <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                <span className="text-[#808080] text-sm w-16">Bcc:</span>
                <input
                  type="text"
                  value={composeBcc}
                  onChange={(e) => setComposeBcc(e.target.value)}
                  placeholder="Add recipients..."
                  className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
                />
              </div>
            </>
          )}

          <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
            <span className="text-[#808080] text-sm w-16">From:</span>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
            />
          </div>

          <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
            <span className="text-[#808080] text-sm w-16">Email:</span>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
            />
          </div>

          <div className="flex items-center h-9 px-4">
            <span className="text-[#808080] text-sm w-16">Subject:</span>
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Enter subject..."
              className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
            />
          </div>
        </div>

        {composeAttachments.length > 0 && (
          <div className="px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] flex flex-wrap gap-2">
            {composeAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-2 py-1 text-xs text-[#cccccc]"
              >
                {attachment.preview ? (
                  <img src={attachment.preview} alt={attachment.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <File className="w-4 h-4" />
                )}
                <span className="max-w-[120px] truncate">{attachment.name}</span>
                <span className="text-[#808080]">({formatFileSize(attachment.size)})</span>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-[#808080] hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 p-4 overflow-auto">
          <textarea
            ref={messageRef}
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            placeholder="Write your message..."
            className="w-full h-full bg-transparent text-[#cccccc] text-sm outline-none resize-none placeholder:text-[#555] leading-relaxed"
          />
        </div>

        {selectedSignature?.content && (
          <div className="px-4 pb-4 text-xs text-[#808080] whitespace-pre-line">
            {selectedSignature.content}
          </div>
        )}
      </div>
    </div>
  );

  // Render settings
  const renderSettings = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
      <div className="bg-[#1e1e1e] rounded-lg w-[600px] max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3c3c3c]">
          <h2 className="text-white font-medium">Mail Settings</h2>
          <button onClick={() => setShowSettings(false)} className="text-[#808080] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[400px]">
          <div className="w-40 border-r border-[#3c3c3c] py-2">
            {[
              { id: 'signatures', label: 'Signatures', icon: Edit2 },
              { id: 'rules', label: 'Rules', icon: Filter },
              { id: 'ooo', label: 'Out of Office', icon: Clock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'templates', label: 'Templates', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id as typeof settingsTab)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm",
                    settingsTab === tab.id ? "bg-[#0a84ff] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {settingsTab === 'signatures' && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Email Signatures</h3>
                {signatures.map((sig) => (
                  <div key={sig.id} className="bg-[#252526] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) => setSignatures(prev => prev.map(s => s.id === sig.id ? { ...s, name: e.target.value } : s))}
                        className="bg-transparent text-white text-sm font-medium outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-[#808080]">
                          <input
                            type="checkbox"
                            checked={sig.isDefault}
                            onChange={() => setSignatures(prev => prev.map(s => ({ ...s, isDefault: s.id === sig.id })))}
                            className="rounded"
                          />
                          Default
                        </label>
                        {sig.id !== 'none' && (
                          <button
                            onClick={() => setSignatures(prev => prev.filter(s => s.id !== sig.id))}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={sig.content}
                      onChange={(e) => setSignatures(prev => prev.map(s => s.id === sig.id ? { ...s, content: e.target.value } : s))}
                      className="w-full h-20 bg-[#3c3c3c] text-[#cccccc] text-sm p-2 rounded outline-none resize-none"
                      placeholder="Enter signature..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => setSignatures(prev => [...prev, { id: generateId(), name: 'New Signature', content: '', isDefault: false }])}
                  className="flex items-center gap-2 text-[#0a84ff] text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Signature
                </button>
              </div>
            )}

            {settingsTab === 'rules' && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Mail Rules</h3>
                <p className="text-[#808080] text-sm">Automatically organize incoming mail based on conditions.</p>
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-[#252526] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, name: e.target.value } : r))}
                        className="bg-transparent text-white text-sm font-medium outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                            className="rounded"
                          />
                          <span className={rule.enabled ? 'text-green-400' : 'text-[#808080]'}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                        <button
                          onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-[#808080]">
                      {rule.conditions.length} condition(s), {rule.actions.length} action(s)
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setRules(prev => [...prev, {
                    id: generateId(),
                    name: 'New Rule',
                    enabled: true,
                    conditions: [{ field: 'from', operator: 'contains', value: '' }],
                    actions: [{ type: 'move', value: 'archive' }],
                  }])}
                  className="flex items-center gap-2 text-[#0a84ff] text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>
            )}

            {settingsTab === 'ooo' && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Out of Office</h3>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={oooSettings.enabled}
                    onChange={(e) => setOooSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-[#cccccc]">Send automatic replies</span>
                </label>
                {oooSettings.enabled && (
                  <>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs text-[#808080]">Start Date</label>
                        <input
                          type="date"
                          value={oooSettings.startDate || ''}
                          onChange={(e) => setOooSettings(prev => ({ ...prev, startDate: e.target.value }))}
                          className="block bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#808080]">End Date</label>
                        <input
                          type="date"
                          value={oooSettings.endDate || ''}
                          onChange={(e) => setOooSettings(prev => ({ ...prev, endDate: e.target.value }))}
                          className="block bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[#808080]">Subject</label>
                      <input
                        type="text"
                        value={oooSettings.subject}
                        onChange={(e) => setOooSettings(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#808080]">Message</label>
                      <textarea
                        value={oooSettings.message}
                        onChange={(e) => setOooSettings(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full h-24 bg-[#3c3c3c] text-white text-sm p-2 rounded mt-1 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-[#cccccc]">
                        <input
                          type="checkbox"
                          checked={oooSettings.sendToContacts}
                          onChange={(e) => setOooSettings(prev => ({ ...prev, sendToContacts: e.target.checked }))}
                          className="rounded"
                        />
                        Send to people in my contacts
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#cccccc]">
                        <input
                          type="checkbox"
                          checked={oooSettings.sendToAll}
                          onChange={(e) => setOooSettings(prev => ({ ...prev, sendToAll: e.target.checked }))}
                          className="rounded"
                        />
                        Send to everyone
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}

            {settingsTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Notification Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-[#cccccc]">Enable notifications</span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.enabled}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#cccccc]">Play sound</span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.sound}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, sound: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#cccccc]">Show message preview</span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.showPreview}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, showPreview: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-[#cccccc]">VIP senders only</span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.vipOnly}
                      onChange={(e) => setNotificationPrefs(prev => ({ ...prev, vipOnly: e.target.checked }))}
                      className="w-5 h-5 rounded"
                    />
                  </label>
                </div>

                {vipSenders.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-medium mb-2">VIP Senders</h4>
                    <div className="space-y-1">
                      {vipSenders.map((email) => (
                        <div key={email} className="flex items-center justify-between bg-[#252526] rounded px-2 py-1">
                          <span className="text-[#cccccc] text-sm">{email}</span>
                          <button
                            onClick={() => removeFromVip(email)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blockedSenders.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-medium mb-2">Blocked Senders</h4>
                    <div className="space-y-1">
                      {blockedSenders.map((email) => (
                        <div key={email} className="flex items-center justify-between bg-[#252526] rounded px-2 py-1">
                          <span className="text-[#cccccc] text-sm">{email}</span>
                          <button
                            onClick={() => unblockSender(email)}
                            className="text-green-400 hover:text-green-300 text-xs"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {settingsTab === 'templates' && (
              <div className="space-y-4">
                <h3 className="text-white font-medium">Email Templates</h3>
                {templates.map((template) => (
                  <div key={template.id} className="bg-[#252526] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, name: e.target.value } : t))}
                        className="bg-transparent text-white text-sm font-medium outline-none"
                      />
                      <button
                        onClick={() => setTemplates(prev => prev.filter(t => t.id !== template.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={template.subject}
                      onChange={(e) => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, subject: e.target.value } : t))}
                      placeholder="Subject"
                      className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-2 py-1 rounded mb-2 outline-none"
                    />
                    <textarea
                      value={template.body}
                      onChange={(e) => setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, body: e.target.value } : t))}
                      placeholder="Body"
                      className="w-full h-16 bg-[#3c3c3c] text-[#cccccc] text-sm p-2 rounded outline-none resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setTemplates(prev => [...prev, { id: generateId(), name: 'New Template', subject: '', body: '' }])}
                  className="flex items-center gap-2 text-[#0a84ff] text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div
        className="fixed bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg py-1 z-50 min-w-[180px]"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onClick={() => setContextMenu(null)}
      >
        <button
          onClick={() => markAsRead(contextMenu.email.id, !contextMenu.email.read)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          {contextMenu.email.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
          {contextMenu.email.read ? 'Mark as Unread' : 'Mark as Read'}
        </button>
        <button
          onClick={() => toggleStar(contextMenu.email.id)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <Star className="w-3.5 h-3.5" />
          {contextMenu.email.starred ? 'Remove Star' : 'Add Star'}
        </button>
        <div className="h-px bg-[#3c3c3c] my-1" />
        <button
          onClick={() => startReply(contextMenu.email, 'reply')}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <Reply className="w-3.5 h-3.5" />
          Reply
        </button>
        <button
          onClick={() => startReply(contextMenu.email, 'forward')}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <Forward className="w-3.5 h-3.5" />
          Forward
        </button>
        <div className="h-px bg-[#3c3c3c] my-1" />
        <button
          onClick={() => moveToFolder(contextMenu.email.id, 'archive')}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <Archive className="w-3.5 h-3.5" />
          Archive
        </button>
        <button
          onClick={() => moveToFolder(contextMenu.email.id, 'junk')}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Move to Junk
        </button>
        <button
          onClick={() => deleteEmail(contextMenu.email.id)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-[#3c3c3c]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
        <div className="h-px bg-[#3c3c3c] my-1" />
        <button
          onClick={() => blockSender(contextMenu.email.from.email)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
        >
          <Ban className="w-3.5 h-3.5" />
          Block Sender
        </button>
        {vipSenders.includes(contextMenu.email.from.email) ? (
          <button
            onClick={() => removeFromVip(contextMenu.email.from.email)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <Minus className="w-3.5 h-3.5" />
            Remove from VIP
          </button>
        ) : (
          <button
            onClick={() => addToVip(contextMenu.email.from.email)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#cccccc] hover:bg-[#3c3c3c]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to VIP
          </button>
        )}
      </div>
    );
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 80, y: 60 }}
      initialSize={{ width: 1100, height: 700 }}
      windowType="default"
      className="overflow-hidden"
    >
      <div className="h-full flex bg-[#1e1e1e]">
        {renderSidebar()}

        {isComposing ? (
          renderCompose()
        ) : (
          <>
            {renderEmailList()}
            {renderEmailDetail()}
          </>
        )}
      </div>

      {showSettings && renderSettings()}
      {renderContextMenu()}
    </ZWindow>
  );
};

export default ZEmailWindow;
