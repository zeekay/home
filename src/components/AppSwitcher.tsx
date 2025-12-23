import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
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
} from 'lucide-react';

// Hanzo AI Logo
const HanzoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-6 h-6", className)} fill="currentColor">
    <path d="M20 80 L50 20 L80 80 M35 55 L65 55" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Zoo Logo  
const ZooLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-6 h-6", className)} fill="currentColor">
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

export type AppType = 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar' |
               'System Preferences' | 'Photos' | 'FaceTime' | 'Notes' |
               'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI' |
               'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies';

interface AppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  openApps: AppType[];
  currentApp: AppType;
  onSelectApp: (app: AppType) => void;
}

const appIcons: Record<AppType, React.ReactNode> = {
  'Finder': <Folder className="w-10 h-10" />,
  'Terminal': <Terminal className="w-10 h-10" />,
  'Safari': <Globe className="w-10 h-10" />,
  'Music': <Music className="w-10 h-10" />,
  'Mail': <Mail className="w-10 h-10" />,
  'Calendar': <Calendar className="w-10 h-10" />,
  'System Preferences': <Settings className="w-10 h-10" />,
  'Photos': <Image className="w-10 h-10" />,
  'FaceTime': <Video className="w-10 h-10" />,
  'Notes': <FileText className="w-10 h-10" />,
  'GitHub Stats': <Github className="w-10 h-10" />,
  'Messages': <MessageSquare className="w-10 h-10" />,
  'Activity Monitor': <Activity className="w-10 h-10" />,
  'Hanzo AI': <HanzoLogo className="w-10 h-10" />,
  'Lux Wallet': <Wallet className="w-10 h-10" />,
  'Zoo': <ZooLogo className="w-10 h-10" />,
  'Calculator': <Calculator className="w-10 h-10" />,
  'Clock': <Clock className="w-10 h-10" />,
  'Weather': <Cloud className="w-10 h-10" />,
  'Stickies': <StickyNote className="w-10 h-10" />,
};

const appColors: Record<AppType, string> = {
  'Finder': 'from-blue-400 to-blue-600',
  'Terminal': 'from-gray-700 to-gray-900',
  'Safari': 'from-blue-500 to-cyan-400',
  'Music': 'from-red-500 to-pink-500',
  'Mail': 'from-blue-400 to-blue-600',
  'Calendar': 'from-red-400 to-red-600',
  'System Preferences': 'from-gray-400 to-gray-600',
  'Photos': 'from-yellow-400 via-orange-400 to-pink-500',
  'FaceTime': 'from-green-400 to-green-600',
  'Notes': 'from-yellow-300 to-yellow-500',
  'GitHub Stats': 'from-gray-700 to-gray-900',
  'Messages': 'from-green-400 to-green-600',
  'Activity Monitor': 'from-green-500 to-green-700',
  'Hanzo AI': 'from-purple-500 to-indigo-600',
  'Lux Wallet': 'from-amber-400 to-orange-500',
  'Zoo': 'from-emerald-400 to-teal-600',
  'Calculator': 'from-orange-400 to-orange-600',
  'Clock': 'from-gray-700 to-gray-900',
  'Weather': 'from-cyan-400 to-blue-500',
  'Stickies': 'from-yellow-300 to-yellow-500',
};

const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  onClose,
  openApps,
  currentApp,
  onSelectApp,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = openApps.indexOf(currentApp);
      setSelectedIndex(currentIndex >= 0 ? (currentIndex + 1) % openApps.length : 0);
    }
  }, [isOpen, openApps, currentApp]);

  // Handle Tab key for cycling through apps
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.metaKey) {
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex((prev) => (prev - 1 + openApps.length) % openApps.length);
        } else {
          setSelectedIndex((prev) => (prev + 1) % openApps.length);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Close switcher when Cmd is released
      if (e.key === 'Meta') {
        onSelectApp(openApps[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, openApps, selectedIndex, onSelectApp, onClose]);

  if (!isOpen || openApps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-black/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex gap-4">
          {openApps.map((app, index) => (
            <div
              key={app}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer",
                index === selectedIndex
                  ? "bg-white/20 ring-2 ring-white/50"
                  : "hover:bg-white/10"
              )}
              onClick={() => {
                onSelectApp(app);
                onClose();
              }}
            >
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg",
                appColors[app]
              )}>
                {appIcons[app]}
              </div>
              <span className="text-white/90 text-xs font-medium max-w-[80px] truncate">
                {app}
              </span>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-xs text-center mt-4">
          Release Cmd to switch - Tab to cycle
        </p>
      </div>
    </div>
  );
};

export default AppSwitcher;
