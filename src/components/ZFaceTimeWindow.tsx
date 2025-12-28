import { useState, useEffect, useRef, useCallback } from 'react';
import ZWindow from './ZWindow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Search,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneOff,
  Bot,
  Settings,
  Users,
  Clock,
  Link,
  Calendar,
  MessageSquare,
  Heart,
  Hand,
  MonitorUp,
  Music,
  PlayCircle,
  LayoutGrid,
  User,
  Sparkles,
  SunDim,
  Image,
  Smile,
  Camera,
  FlipHorizontal,
  Ban,
  Plus,
  Copy,
  Check,
  X,
  Trash2,
  ExternalLink,
  Voicemail,
} from 'lucide-react';
import { toast } from 'sonner';
import { contacts as baseContacts } from '@/data/socials';

// Types
interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  email: string;
  color: string;
  isAI?: boolean;
  phone?: string;
  blocked?: boolean;
  favorite?: boolean;
}

interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'video' | 'audio';
  timestamp: number;
  duration: number;
}

interface ScheduledCall {
  id: string;
  contactId: string;
  contactName: string;
  scheduledTime: number;
  callType: 'video' | 'audio';
  notes?: string;
}

interface VoiceMessage {
  id: string;
  fromContactId: string;
  fromName: string;
  timestamp: number;
  duration: number;
  isVideo: boolean;
  listened: boolean;
}

interface FaceTimeSettings {
  cameraId: string;
  microphoneId: string;
  speakerId: string;
  ringtone: string;
  autoAnswer: boolean;
  showReactions: boolean;
}

type VideoEffect = 'none' | 'portrait' | 'studio' | 'background';
type BackgroundType = 'blur' | 'beach' | 'office' | 'nature' | 'space' | 'custom';
type CallView = 'contacts' | 'recents' | 'scheduled' | 'messages' | 'settings';
type GroupView = 'grid' | 'speaker';

interface Reaction {
  id: string;
  type: 'heart' | 'thumbsup' | 'thumbsdown' | 'laugh' | 'wow' | 'confetti';
  x: number;
  y: number;
  timestamp: number;
}

interface ZFaceTimeWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Storage keys
const STORAGE_KEYS = {
  CONTACTS: 'facetime-contacts',
  CALL_HISTORY: 'facetime-call-history',
  SCHEDULED_CALLS: 'facetime-scheduled-calls',
  VOICE_MESSAGES: 'facetime-voice-messages',
  SETTINGS: 'facetime-settings',
  BLOCKED: 'facetime-blocked',
};

// Default settings
const DEFAULT_SETTINGS: FaceTimeSettings = {
  cameraId: 'default',
  microphoneId: 'default',
  speakerId: 'default',
  ringtone: 'default',
  autoAnswer: false,
  showReactions: true,
};

// Extended contacts with more data
const extendedContacts: Contact[] = [
  ...baseContacts.map(c => ({
    ...c,
    status: c.status as Contact['status'],
    phone: '+1 (555) 000-0001',
    blocked: false,
    favorite: c.id === 'z',
  })),
  {
    id: 'alice',
    name: 'Alice Chen',
    role: 'Designer',
    avatar: 'AC',
    status: 'available',
    email: 'alice@example.com',
    color: 'from-pink-500 to-rose-500',
    phone: '+1 (555) 123-4567',
  },
  {
    id: 'bob',
    name: 'Bob Martinez',
    role: 'Engineer',
    avatar: 'BM',
    status: 'busy',
    email: 'bob@example.com',
    color: 'from-orange-500 to-amber-500',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'carol',
    name: 'Carol Kim',
    role: 'Product Manager',
    avatar: 'CK',
    status: 'away',
    email: 'carol@example.com',
    color: 'from-emerald-500 to-teal-500',
    phone: '+1 (555) 345-6789',
  },
  {
    id: 'david',
    name: 'David Johnson',
    role: 'DevOps',
    avatar: 'DJ',
    status: 'offline',
    email: 'david@example.com',
    color: 'from-indigo-500 to-violet-500',
    phone: '+1 (555) 456-7890',
  },
];

// Virtual backgrounds
const virtualBackgrounds = [
  { id: 'blur', name: 'Blur', icon: Sparkles },
  { id: 'beach', name: 'Beach', color: 'bg-gradient-to-br from-cyan-400 to-blue-500' },
  { id: 'office', name: 'Office', color: 'bg-gradient-to-br from-gray-600 to-gray-800' },
  { id: 'nature', name: 'Nature', color: 'bg-gradient-to-br from-green-400 to-emerald-600' },
  { id: 'space', name: 'Space', color: 'bg-gradient-to-br from-purple-900 to-black' },
];

// Ringtones
const ringtones = [
  { id: 'default', name: 'Default' },
  { id: 'classic', name: 'Classic' },
  { id: 'digital', name: 'Digital' },
  { id: 'gentle', name: 'Gentle' },
  { id: 'urgent', name: 'Urgent' },
];

const ZFaceTimeWindow: React.FC<ZFaceTimeWindowProps> = ({ onClose, onFocus }) => {
  // Core state
  const [currentView, setCurrentView] = useState<CallView>('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [settings, setSettings] = useState<FaceTimeSettings>(DEFAULT_SETTINGS);

  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isGroupCall, setIsGroupCall] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [groupView, setGroupView] = useState<GroupView>('grid');

  // Effects state
  const [videoEffect, setVideoEffect] = useState<VideoEffect>('none');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('blur');
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);

  // SharePlay state
  const [isSharePlayActive, setIsSharePlayActive] = useState(false);
  const [sharePlayMode, setSharePlayMode] = useState<'screen' | 'watch' | 'listen' | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Reactions
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [handRaised, setHandRaised] = useState(false);

  // Call link
  const [callLink, setCallLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Scheduling
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleContact, setScheduleContact] = useState<Contact | null>(null);

  // Leave message
  const [isRecordingMessage, setIsRecordingMessage] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // WebRTC
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [availableDevices, setAvailableDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [], speakers: [] });

  // Load data from localStorage
  useEffect(() => {
    const loadedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    const loadedHistory = localStorage.getItem(STORAGE_KEYS.CALL_HISTORY);
    const loadedScheduled = localStorage.getItem(STORAGE_KEYS.SCHEDULED_CALLS);
    const loadedMessages = localStorage.getItem(STORAGE_KEYS.VOICE_MESSAGES);
    const loadedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (loadedContacts) {
      setContacts(JSON.parse(loadedContacts));
    } else {
      setContacts(extendedContacts);
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(extendedContacts));
    }

    if (loadedHistory) {
      setCallHistory(JSON.parse(loadedHistory));
    } else {
      // Generate mock call history
      const mockHistory: CallRecord[] = [
        { id: '1', contactId: 'alice', contactName: 'Alice Chen', type: 'outgoing', callType: 'video', timestamp: Date.now() - 3600000, duration: 1234 },
        { id: '2', contactId: 'bob', contactName: 'Bob Martinez', type: 'incoming', callType: 'audio', timestamp: Date.now() - 7200000, duration: 567 },
        { id: '3', contactId: 'hanzo-dev', contactName: 'Hanzo Dev', type: 'outgoing', callType: 'video', timestamp: Date.now() - 86400000, duration: 2345 },
        { id: '4', contactId: 'carol', contactName: 'Carol Kim', type: 'missed', callType: 'video', timestamp: Date.now() - 172800000, duration: 0 },
      ];
      setCallHistory(mockHistory);
      localStorage.setItem(STORAGE_KEYS.CALL_HISTORY, JSON.stringify(mockHistory));
    }

    if (loadedScheduled) {
      setScheduledCalls(JSON.parse(loadedScheduled));
    }

    if (loadedMessages) {
      setVoiceMessages(JSON.parse(loadedMessages));
    } else {
      const mockMessages: VoiceMessage[] = [
        { id: '1', fromContactId: 'alice', fromName: 'Alice Chen', timestamp: Date.now() - 1800000, duration: 45, isVideo: true, listened: false },
        { id: '2', fromContactId: 'bob', fromName: 'Bob Martinez', timestamp: Date.now() - 86400000, duration: 30, isVideo: false, listened: true },
      ];
      setVoiceMessages(mockMessages);
      localStorage.setItem(STORAGE_KEYS.VOICE_MESSAGES, JSON.stringify(mockMessages));
    }

    if (loadedSettings) {
      setSettings(JSON.parse(loadedSettings));
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    }
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALL_HISTORY, JSON.stringify(callHistory));
  }, [callHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_CALLS, JSON.stringify(scheduledCalls));
  }, [scheduledCalls]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOICE_MESSAGES, JSON.stringify(voiceMessages));
  }, [voiceMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Get available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices({
          cameras: devices.filter(d => d.kind === 'videoinput'),
          microphones: devices.filter(d => d.kind === 'audioinput'),
          speakers: devices.filter(d => d.kind === 'audiooutput'),
        });
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };
    getDevices();
  }, []);

  // Initialize camera preview
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: settings.cameraId === 'default' ? true : { deviceId: settings.cameraId },
        audio: settings.microphoneId === 'default' ? true : { deviceId: settings.microphoneId },
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  }, [settings.cameraId, settings.microphoneId]);

  const stopCamera = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  }, [mediaStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Call timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecordingMessage) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingMessage]);

  // Clear old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions(prev => prev.filter(r => Date.now() - r.timestamp < 3000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact =>
    !contact.blocked &&
    (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
     contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Start call
  const startCall = async (contact: Contact, type: 'video' | 'audio' = 'video') => {
    if (contact.blocked) {
      toast.error('This contact is blocked');
      return;
    }

    setActiveContact(contact);
    setCallType(type);
    setIsCallActive(true);
    setCallTimer(0);
    setIsGroupCall(false);
    setGroupParticipants([]);

    if (type === 'video') {
      await startCamera();
    }

    // Add to call history
    const newRecord: CallRecord = {
      id: Date.now().toString(),
      contactId: contact.id,
      contactName: contact.name,
      type: 'outgoing',
      callType: type,
      timestamp: Date.now(),
      duration: 0,
    };
    setCallHistory(prev => [newRecord, ...prev]);

    toast.success(`${type === 'video' ? 'FaceTime' : 'FaceTime Audio'} with ${contact.name}`, {
      description: contact.isAI ? 'AI assistant is ready to help' : 'Connecting...',
    });
  };

  // Start group call
  const startGroupCall = (participants: Contact[]) => {
    if (participants.length < 2) {
      toast.error('Select at least 2 participants for a group call');
      return;
    }

    setGroupParticipants(participants);
    setIsGroupCall(true);
    setCallType('video');
    setIsCallActive(true);
    setCallTimer(0);
    startCamera();

    toast.success(`Group FaceTime with ${participants.length} participants`);
  };

  // End call
  const endCall = () => {
    // Update call duration in history
    if (callHistory.length > 0) {
      setCallHistory(prev => {
        const updated = [...prev];
        if (updated[0] && updated[0].duration === 0) {
          updated[0].duration = callTimer;
        }
        return updated;
      });
    }

    stopCamera();
    setIsCallActive(false);
    setCallTimer(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setActiveContact(null);
    setIsGroupCall(false);
    setGroupParticipants([]);
    setShowEffectsPanel(false);
    setVideoEffect('none');
    setIsSharePlayActive(false);
    setSharePlayMode(null);
    setIsScreenSharing(false);
    setHandRaised(false);

    toast.info('Call ended');
  };

  // Generate call link
  const generateCallLink = () => {
    const link = `https://facetime.apple.com/join/${Math.random().toString(36).substring(2, 15)}`;
    setCallLink(link);
    return link;
  };

  // Copy link
  const copyLink = () => {
    if (callLink) {
      navigator.clipboard.writeText(callLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast.success('Link copied to clipboard');
    }
  };

  // Schedule call
  const scheduleCall = () => {
    if (!scheduleContact || !scheduleDate || !scheduleTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const scheduledTime = new Date(`${scheduleDate}T${scheduleTime}`).getTime();
    const newSchedule: ScheduledCall = {
      id: Date.now().toString(),
      contactId: scheduleContact.id,
      contactName: scheduleContact.name,
      scheduledTime,
      callType: callType,
    };

    setScheduledCalls(prev => [...prev, newSchedule]);
    setShowScheduler(false);
    setScheduleDate('');
    setScheduleTime('');
    setScheduleContact(null);

    toast.success('FaceTime scheduled', {
      description: `With ${newSchedule.contactName} on ${new Date(scheduledTime).toLocaleString()}`,
    });
  };

  // Delete scheduled call
  const deleteScheduledCall = (id: string) => {
    setScheduledCalls(prev => prev.filter(s => s.id !== id));
    toast.info('Scheduled call removed');
  };

  // Send reaction
  const sendReaction = (type: Reaction['type']) => {
    const newReaction: Reaction = {
      id: Date.now().toString(),
      type,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      timestamp: Date.now(),
    };
    setReactions(prev => [...prev, newReaction]);
  };

  // Toggle block contact
  const toggleBlockContact = (contactId: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, blocked: !c.blocked } : c))
    );
    const contact = contacts.find(c => c.id === contactId);
    toast.info(contact?.blocked ? 'Contact unblocked' : 'Contact blocked');
  };

  // Toggle favorite
  const toggleFavorite = (contactId: string) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, favorite: !c.favorite } : c))
    );
  };

  // Start/stop recording message
  const toggleRecordMessage = () => {
    if (isRecordingMessage) {
      // Save message
      setIsRecordingMessage(false);
      setRecordingDuration(0);
      stopCamera();
      toast.success('Message saved');
    } else {
      setIsRecordingMessage(true);
      if (callType === 'video') {
        startCamera();
      }
    }
  };

  // Delete voice message
  const deleteVoiceMessage = (id: string) => {
    setVoiceMessages(prev => prev.filter(m => m.id !== id));
    toast.info('Message deleted');
  };

  // Mark message as listened
  const markMessageListened = (id: string) => {
    setVoiceMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, listened: true } : m))
    );
  };

  // Flip camera
  const flipCamera = async () => {
    if (!mediaStream) return;

    const currentTrack = mediaStream.getVideoTracks()[0];
    const currentFacing = currentTrack?.getSettings().facingMode;

    stopCamera();

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacing === 'user' ? 'environment' : 'user' },
        audio: true,
      });
      setMediaStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error flipping camera:', err);
      startCamera();
    }
  };

  // Render status indicator
  const StatusIndicator = ({ status }: { status: Contact['status'] }) => {
    const colors = {
      available: 'bg-green-500',
      busy: 'bg-red-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500',
    };
    return <span className={`w-2.5 h-2.5 rounded-full ${colors[status]} ring-2 ring-white dark:ring-gray-900`} />;
  };

  // Render reaction emoji
  const getReactionEmoji = (type: Reaction['type']) => {
    const emojis = {
      heart: '❤️',
      thumbsup: '👍',
      thumbsdown: '👎',
      laugh: '😂',
      wow: '😮',
      confetti: '🎉',
    };
    return emojis[type];
  };

  // Sidebar navigation
  const SidebarNav = () => (
    <div className="w-16 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-2">
      {[
        { view: 'contacts' as CallView, icon: Users, label: 'Contacts' },
        { view: 'recents' as CallView, icon: Clock, label: 'Recents' },
        { view: 'scheduled' as CallView, icon: Calendar, label: 'Scheduled' },
        { view: 'messages' as CallView, icon: Voicemail, label: 'Messages' },
        { view: 'settings' as CallView, icon: Settings, label: 'Settings' },
      ].map(({ view, icon: Icon, label }) => (
        <Button
          key={view}
          variant={currentView === view ? 'secondary' : 'ghost'}
          size="icon"
          className="w-12 h-12 relative"
          onClick={() => setCurrentView(view)}
          title={label}
        >
          <Icon className="h-5 w-5" />
          {view === 'messages' && voiceMessages.filter(m => !m.listened).length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {voiceMessages.filter(m => !m.listened).length}
            </span>
          )}
        </Button>
      ))}
    </div>
  );

  // Contacts view
  const ContactsView = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Input
            placeholder="Search contacts..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Tabs defaultValue="video" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="video" className="flex-1" onClick={() => setCallType('video')}>
                <Video className="h-4 w-4 mr-2" />
                FaceTime
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex-1" onClick={() => setCallType('audio')}>
                <Phone className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Create Link */}
          <Button
            variant="outline"
            className="w-full mb-3 justify-start"
            onClick={() => {
              generateCallLink();
              toast.success('Call link generated');
            }}
          >
            <Link className="h-4 w-4 mr-2" />
            Create Link
          </Button>

          {/* Favorites */}
          {filteredContacts.filter(c => c.favorite).length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Favorites</h3>
              {filteredContacts.filter(c => c.favorite).map(contact => (
                <ContactRow key={contact.id} contact={contact} />
              ))}
            </div>
          )}

          {/* All Contacts */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">All Contacts</h3>
          {filteredContacts.filter(c => !c.favorite).map(contact => (
            <ContactRow key={contact.id} contact={contact} />
          ))}

          {/* AI Assistants Info */}
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4" /> AI Assistants
            </h4>
            <p className="text-xs text-gray-500">
              Hanzo Dev and Z AI are available 24/7 for assistance.
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Call Link Modal */}
      {callLink && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">FaceTime Link</h3>
              <Button variant="ghost" size="icon" onClick={() => setCallLink(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share this link to invite others to join your FaceTime call.
            </p>
            <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
              <span className="text-sm truncate flex-1">{callLink}</span>
              <Button size="sm" variant="ghost" onClick={copyLink}>
                {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setCallLink(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Contact row component
  const ContactRow = ({ contact }: { contact: Contact }) => (
    <div
      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => startCall(contact, callType)}>
        <div className="relative">
          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center`}>
            {contact.isAI ? (
              <Bot className="w-5 h-5 text-white" />
            ) : (
              <span className="text-sm font-bold text-white">{contact.avatar}</span>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5">
            <StatusIndicator status={contact.status} />
          </div>
        </div>
        <div>
          <p className="font-medium text-sm">{contact.name}</p>
          <p className="text-xs text-gray-500">{contact.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => toggleFavorite(contact.id)}
        >
          <Heart className={`h-4 w-4 ${contact.favorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => startCall(contact, 'video')}
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => startCall(contact, 'audio')}
        >
          <Phone className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Recents view
  const RecentsView = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold">Recent Calls</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {callHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent calls</p>
          ) : (
            callHistory.map(call => {
              const contact = contacts.find(c => c.id === call.contactId);
              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${contact?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                      <span className="text-sm font-bold text-white">{contact?.avatar || '?'}</span>
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${call.type === 'missed' ? 'text-red-500' : ''}`}>
                        {call.contactName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {call.type === 'incoming' && <PhoneCall className="h-3 w-3" />}
                        {call.type === 'outgoing' && <PhoneOff className="h-3 w-3 rotate-180" />}
                        {call.type === 'missed' && <PhoneOff className="h-3 w-3 text-red-500" />}
                        {call.callType === 'video' ? 'FaceTime' : 'FaceTime Audio'}
                        {call.duration > 0 && ` - ${formatTime(call.duration)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatTimestamp(call.timestamp)}</span>
                    {contact && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startCall(contact, call.callType)}
                      >
                        {call.callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Scheduled calls view
  const ScheduledView = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold">Scheduled Calls</h2>
        <Button size="sm" variant="outline" onClick={() => setShowScheduler(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {scheduledCalls.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scheduled calls</p>
          ) : (
            scheduledCalls.map(scheduled => {
              const contact = contacts.find(c => c.id === scheduled.contactId);
              const isPast = scheduled.scheduledTime < Date.now();
              return (
                <div
                  key={scheduled.id}
                  className={`p-3 rounded-lg border ${isPast ? 'border-gray-300 dark:border-gray-700 opacity-60' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{scheduled.contactName}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => deleteScheduledCall(scheduled.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(scheduled.scheduledTime).toLocaleString()}
                  </p>
                  {!isPast && contact && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => startCall(contact, scheduled.callType)}
                    >
                      Start Now
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Schedule FaceTime</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowScheduler(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Contact</label>
                <Select onValueChange={val => setScheduleContact(contacts.find(c => c.id === val) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.filter(c => !c.blocked).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Time</label>
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowScheduler(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={scheduleCall}>
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Voice messages view
  const MessagesView = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold">Voice & Video Messages</h2>
        <Button
          size="sm"
          variant={isRecordingMessage ? 'destructive' : 'outline'}
          onClick={toggleRecordMessage}
        >
          {isRecordingMessage ? (
            <>
              <span className="animate-pulse mr-2 h-2 w-2 bg-red-500 rounded-full" />
              {formatTime(recordingDuration)} - Stop
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-1" />
              Record
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {voiceMessages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No messages</p>
          ) : (
            voiceMessages.map(message => {
              const contact = contacts.find(c => c.id === message.fromContactId);
              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer ${message.listened ? 'border-gray-200 dark:border-gray-800' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'}`}
                  onClick={() => markMessageListened(message.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${contact?.color || 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                        {message.isVideo ? <Video className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{message.fromName}</p>
                        <p className="text-xs text-gray-500">
                          {message.isVideo ? 'Video' : 'Voice'} message - {formatTime(message.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={e => {
                          e.stopPropagation();
                          deleteVoiceMessage(message.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Settings view
  const SettingsView = () => (
    <div className="flex-1 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold">Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Camera Preview */}
          <div>
            <h3 className="text-sm font-medium mb-2">Camera Preview</h3>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {mediaStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Enable Camera
                  </Button>
                </div>
              )}
            </div>
            {mediaStream && (
              <Button variant="outline" size="sm" className="mt-2" onClick={stopCamera}>
                Stop Preview
              </Button>
            )}
          </div>

          {/* Device Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Camera</label>
              <Select
                value={settings.cameraId}
                onValueChange={val => setSettings(s => ({ ...s, cameraId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {availableDevices.cameras.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Microphone</label>
              <Select
                value={settings.microphoneId}
                onValueChange={val => setSettings(s => ({ ...s, microphoneId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {availableDevices.microphones.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Speaker</label>
              <Select
                value={settings.speakerId}
                onValueChange={val => setSettings(s => ({ ...s, speakerId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {availableDevices.speakers.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Speaker ${d.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ringtone */}
          <div>
            <label className="text-sm font-medium mb-1 block">Ringtone</label>
            <Select
              value={settings.ringtone}
              onValueChange={val => setSettings(s => ({ ...s, ringtone: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ringtone" />
              </SelectTrigger>
              <SelectContent>
                {ringtones.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-Answer</p>
                <p className="text-xs text-gray-500">Automatically answer incoming calls</p>
              </div>
              <Switch
                checked={settings.autoAnswer}
                onCheckedChange={val => setSettings(s => ({ ...s, autoAnswer: val }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Reactions</p>
                <p className="text-xs text-gray-500">Display reactions during calls</p>
              </div>
              <Switch
                checked={settings.showReactions}
                onCheckedChange={val => setSettings(s => ({ ...s, showReactions: val }))}
              />
            </div>
          </div>

          {/* Blocked Contacts */}
          <div>
            <h3 className="text-sm font-medium mb-2">Blocked Contacts</h3>
            <div className="space-y-1">
              {contacts.filter(c => c.blocked).length === 0 ? (
                <p className="text-sm text-gray-500">No blocked contacts</p>
              ) : (
                contacts.filter(c => c.blocked).map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{contact.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleBlockContact(contact.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* External Links */}
          <div>
            <h3 className="text-sm font-medium mb-2">Integrations</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Meet
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://zoom.us/join" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Zoom
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4 mr-2" />
                  Open Calendar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // Active call UI
  const ActiveCallView = () => (
    <div className="flex-1 flex flex-col bg-black relative">
      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote video / participants */}
        {isGroupCall ? (
          // Group call view
          <div className={`h-full w-full ${groupView === 'grid' ? 'grid grid-cols-3 gap-1 p-1' : ''}`}>
            {groupView === 'grid' ? (
              // Grid view - show all participants
              groupParticipants.slice(0, 9).map((participant) => (
                <div
                  key={participant.id}
                  className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden"
                >
                  <div className="text-center">
                    <div className={`h-16 w-16 mx-auto mb-2 rounded-full bg-gradient-to-br ${participant.color} flex items-center justify-center`}>
                      {participant.isAI ? (
                        <Bot className="w-8 h-8 text-white" />
                      ) : (
                        <span className="text-xl font-bold text-white">{participant.avatar}</span>
                      )}
                    </div>
                    <p className="text-sm text-white">{participant.name}</p>
                  </div>
                </div>
              ))
            ) : (
              // Speaker view - show active speaker large
              <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="text-center text-gray-300">
                  <div className={`h-32 w-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${groupParticipants[0]?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center border-4 border-white/20`}>
                    <span className="text-4xl font-bold text-white">{groupParticipants[0]?.avatar}</span>
                  </div>
                  <h3 className="text-xl font-medium">{groupParticipants[0]?.name}</h3>
                  <p className="text-sm text-gray-400">Speaking</p>
                </div>
              </div>
            )}

            {/* Participant count */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              {groupParticipants.length} participants
            </div>

            {/* View toggle */}
            <div className="absolute top-4 right-4 flex gap-1">
              <Button
                size="icon"
                variant={groupView === 'grid' ? 'secondary' : 'ghost'}
                className="h-8 w-8 bg-black/50 hover:bg-black/70"
                onClick={() => setGroupView('grid')}
              >
                <LayoutGrid className="h-4 w-4 text-white" />
              </Button>
              <Button
                size="icon"
                variant={groupView === 'speaker' ? 'secondary' : 'ghost'}
                className="h-8 w-8 bg-black/50 hover:bg-black/70"
                onClick={() => setGroupView('speaker')}
              >
                <User className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        ) : (
          // Single call view
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 relative">
            {isVideoOff || callType === 'audio' ? (
              <div className="text-center text-gray-300">
                <div className={`h-32 w-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${activeContact?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center border-4 border-white/20`}>
                  {activeContact?.isAI ? (
                    <Bot className="w-16 h-16 text-white" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{activeContact?.avatar}</span>
                  )}
                </div>
                <h3 className="text-xl font-medium">{activeContact?.name}</h3>
                <p className="text-sm text-gray-400">{activeContact?.role}</p>
                {activeContact?.isAI && (
                  <p className="text-xs text-green-400 mt-2">● AI Assistant Active</p>
                )}
              </div>
            ) : (
              <>
                {/* Simulated remote video with effects */}
                <div
                  className={`absolute inset-0 ${
                    videoEffect === 'portrait' ? 'blur-background' : ''
                  } ${backgroundType !== 'blur' && videoEffect === 'background' ? virtualBackgrounds.find(b => b.id === backgroundType)?.color : ''}`}
                >
                  <div className="h-full flex items-center justify-center">
                    <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${activeContact?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center border-4 border-white/20`}>
                      {activeContact?.isAI ? (
                        <Bot className="w-16 h-16 text-white" />
                      ) : (
                        <span className="text-4xl font-bold text-white">{activeContact?.avatar}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black/30 px-2 py-1 rounded">
                  {activeContact?.name}
                </div>
              </>
            )}
          </div>
        )}

        {/* Self preview (PiP) */}
        <div className="absolute bottom-4 right-4 w-40 h-28 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg shadow-lg overflow-hidden border border-white/20">
          {mediaStream && !isVideoOff && callType === 'video' ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                videoEffect === 'portrait' ? 'filter-portrait' : ''
              }`}
              style={{
                filter: videoEffect === 'studio' ? 'contrast(1.1) brightness(1.05)' : undefined,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto mb-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-400">
                  <span className="text-sm font-bold">ZK</span>
                </div>
                <p className="text-xs">You</p>
              </div>
            </div>
          )}
        </div>

        {/* Reactions overlay */}
        {settings.showReactions && reactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute text-4xl animate-bounce pointer-events-none"
            style={{
              left: `${reaction.x}%`,
              top: `${reaction.y}%`,
              animation: 'float-up 3s ease-out forwards',
            }}
          >
            {getReactionEmoji(reaction.type)}
          </div>
        ))}

        {/* Hand raised indicator */}
        {handRaised && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full font-medium flex items-center gap-2">
            <Hand className="h-5 w-5" />
            Hand Raised
          </div>
        )}

        {/* SharePlay indicator */}
        {isSharePlayActive && (
          <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            {sharePlayMode === 'screen' && <MonitorUp className="h-4 w-4" />}
            {sharePlayMode === 'watch' && <PlayCircle className="h-4 w-4" />}
            {sharePlayMode === 'listen' && <Music className="h-4 w-4" />}
            SharePlay Active
          </div>
        )}

        {/* Effects panel */}
        {showEffectsPanel && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 rounded-xl p-4 w-56">
            <h4 className="text-white font-medium mb-3">Effects</h4>

            {/* Effect types */}
            <div className="space-y-2 mb-4">
              {[
                { id: 'none', label: 'None', icon: X },
                { id: 'portrait', label: 'Portrait', icon: User },
                { id: 'studio', label: 'Studio Light', icon: SunDim },
                { id: 'background', label: 'Background', icon: Image },
              ].map(effect => (
                <button
                  key={effect.id}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    videoEffect === effect.id ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                  onClick={() => setVideoEffect(effect.id as VideoEffect)}
                >
                  <effect.icon className="h-4 w-4" />
                  {effect.label}
                </button>
              ))}
            </div>

            {/* Virtual backgrounds (when background effect selected) */}
            {videoEffect === 'background' && (
              <div>
                <h5 className="text-gray-400 text-xs uppercase mb-2">Backgrounds</h5>
                <div className="grid grid-cols-3 gap-2">
                  {virtualBackgrounds.map(bg => (
                    <button
                      key={bg.id}
                      className={`h-12 rounded-lg ${bg.color || 'bg-gray-600'} ${
                        backgroundType === bg.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setBackgroundType(bg.id as BackgroundType)}
                      title={bg.name}
                    >
                      {bg.icon && <bg.icon className="h-5 w-5 mx-auto text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Memoji placeholder */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <button className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20">
                <Smile className="h-4 w-4" />
                Memoji (Coming Soon)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="bg-gray-900/95 p-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {/* Timer */}
          <div className="text-gray-300 text-sm w-16">
            {formatTime(callTimer)}
          </div>

          {/* Main controls */}
          <div className="flex items-center gap-3">
            {/* Effects button */}
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full h-12 w-12 ${showEffectsPanel ? 'bg-blue-600' : 'bg-gray-800'} text-white hover:bg-gray-700`}
              onClick={() => setShowEffectsPanel(!showEffectsPanel)}
            >
              <Sparkles className="h-5 w-5" />
            </Button>

            {/* Flip camera */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-12 w-12 bg-gray-800 text-white hover:bg-gray-700"
              onClick={flipCamera}
            >
              <FlipHorizontal className="h-5 w-5" />
            </Button>

            {/* Mute */}
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full h-12 w-12 ${isMuted ? 'bg-red-600' : 'bg-gray-800'} text-white hover:bg-gray-700`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Video toggle */}
            {callType === 'video' && (
              <Button
                size="icon"
                variant="ghost"
                className={`rounded-full h-12 w-12 ${isVideoOff ? 'bg-red-600' : 'bg-gray-800'} text-white hover:bg-gray-700`}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            )}

            {/* End call */}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-14 w-14 bg-red-600 text-white hover:bg-red-700"
              onClick={endCall}
            >
              <Phone className="h-6 w-6 rotate-135" />
            </Button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 w-16 justify-end">
            {/* Hand raise */}
            <Button
              size="icon"
              variant="ghost"
              className={`rounded-full h-10 w-10 ${handRaised ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'} hover:bg-gray-700`}
              onClick={() => setHandRaised(!handRaised)}
            >
              <Hand className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Secondary controls row */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {/* Reactions */}
          {settings.showReactions && (
            <div className="flex items-center gap-1 bg-gray-800 rounded-full px-2 py-1">
              {(['heart', 'thumbsup', 'laugh', 'wow', 'confetti'] as const).map(type => (
                <button
                  key={type}
                  className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"
                  onClick={() => sendReaction(type)}
                >
                  {getReactionEmoji(type)}
                </button>
              ))}
            </div>
          )}

          {/* SharePlay */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-full px-2 py-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 px-3 rounded-full ${isScreenSharing ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                setIsSharePlayActive(!isScreenSharing);
                setSharePlayMode(isScreenSharing ? null : 'screen');
                toast.info(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started');
              }}
            >
              <MonitorUp className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 px-3 rounded-full ${sharePlayMode === 'watch' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
              onClick={() => {
                const newMode = sharePlayMode === 'watch' ? null : 'watch';
                setSharePlayMode(newMode);
                setIsSharePlayActive(!!newMode);
                toast.info(newMode ? 'Watch Together enabled' : 'SharePlay stopped');
              }}
            >
              <PlayCircle className="h-4 w-4 mr-1" />
              Watch
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 px-3 rounded-full ${sharePlayMode === 'listen' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}
              onClick={() => {
                const newMode = sharePlayMode === 'listen' ? null : 'listen';
                setSharePlayMode(newMode);
                setIsSharePlayActive(!!newMode);
                toast.info(newMode ? 'Listen Together enabled' : 'SharePlay stopped');
              }}
            >
              <Music className="h-4 w-4 mr-1" />
              Listen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <ZWindow
      title="FaceTime"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 200, y: 80 }}
      initialSize={{ width: 850, height: 650 }}
      windowType="default"
      className="bg-gray-50/95 dark:bg-gray-950/95"
    >
      <div className="h-full flex">
        {!isCallActive && <SidebarNav />}

        <div className="flex-1 flex flex-col relative">
          {isCallActive ? (
            <ActiveCallView />
          ) : (
            <>
              {currentView === 'contacts' && <ContactsView />}
              {currentView === 'recents' && <RecentsView />}
              {currentView === 'scheduled' && <ScheduledView />}
              {currentView === 'messages' && <MessagesView />}
              {currentView === 'settings' && <SettingsView />}
            </>
          )}
        </div>
      </div>

      {/* CSS for effects */}
      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
        }
        .filter-portrait {
          filter: blur(0);
        }
        .blur-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(20px);
          z-index: -1;
        }
      `}</style>
    </ZWindow>
  );
};

export default ZFaceTimeWindow;
