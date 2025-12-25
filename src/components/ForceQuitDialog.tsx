import React, { useState, useEffect } from 'react';
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
  FileEdit,
  Github,
  Activity,
  Wallet,
  Calculator,
  Clock,
  Cloud,
  StickyNote,
  AlertCircle,
} from 'lucide-react';

// Hanzo AI Logo
const HanzoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M20 80 L50 20 L80 80 M35 55 L65 55" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Zoo Logo
const ZooLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-5 h-5", className)} fill="currentColor">
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

export type AppType = 'Finder' | 'Terminal' | 'Safari' | 'Music' | 'Mail' | 'Calendar' |
               'System Preferences' | 'Photos' | 'FaceTime' | 'TextEdit' | 'Notes' |
               'GitHub Stats' | 'Messages' | 'Activity Monitor' | 'Hanzo AI' |
               'Lux Wallet' | 'Zoo' | 'Calculator' | 'Clock' | 'Weather' | 'Stickies';

interface ForceQuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  openApps: AppType[];
  onForceQuit: (app: AppType) => void;
}

const appIcons: Record<AppType, React.ReactNode> = {
  'Finder': <Folder className="w-5 h-5" />,
  'Terminal': <Terminal className="w-5 h-5" />,
  'Safari': <Globe className="w-5 h-5" />,
  'Music': <Music className="w-5 h-5" />,
  'Mail': <Mail className="w-5 h-5" />,
  'Calendar': <Calendar className="w-5 h-5" />,
  'System Preferences': <Settings className="w-5 h-5" />,
  'Photos': <Image className="w-5 h-5" />,
  'FaceTime': <Video className="w-5 h-5" />,
  'TextEdit': <FileEdit className="w-5 h-5" />,
  'Notes': <FileText className="w-5 h-5" />,
  'GitHub Stats': <Github className="w-5 h-5" />,
  'Messages': <MessageSquare className="w-5 h-5" />,
  'Activity Monitor': <Activity className="w-5 h-5" />,
  'Hanzo AI': <HanzoLogo />,
  'Lux Wallet': <Wallet className="w-5 h-5" />,
  'Zoo': <ZooLogo />,
  'Calculator': <Calculator className="w-5 h-5" />,
  'Clock': <Clock className="w-5 h-5" />,
  'Weather': <Cloud className="w-5 h-5" />,
  'Stickies': <StickyNote className="w-5 h-5" />,
};

const ForceQuitDialog: React.FC<ForceQuitDialogProps> = ({
  isOpen,
  onClose,
  openApps,
  onForceQuit,
}) => {
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null);

  // Reset selection when opening
  useEffect(() => {
    if (isOpen && openApps.length > 0) {
      setSelectedApp(openApps[0]);
    }
  }, [isOpen, openApps]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = selectedApp ? openApps.indexOf(selectedApp) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < openApps.length - 1) {
            setSelectedApp(openApps[currentIndex + 1]);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedApp(openApps[currentIndex - 1]);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedApp) {
            onForceQuit(selectedApp);
            if (openApps.length <= 1) {
              onClose();
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openApps, selectedApp, onForceQuit, onClose]);

  if (!isOpen) return null;

  const handleForceQuit = () => {
    if (selectedApp) {
      onForceQuit(selectedApp);
      if (openApps.length <= 1) {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[30000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-quit-title"
        className="w-[400px] bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gray-700/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h2 id="force-quit-title" className="text-white font-semibold">Force Quit Applications</h2>
          </div>
          <p className="text-white/60 text-sm mt-1">
            If an app does not respond, select it and click Force Quit.
          </p>
        </div>

        {/* App List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {openApps.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/50">
              No applications running
            </div>
          ) : (
            openApps.map((app) => (
              <div
                key={app}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  selectedApp === app
                    ? "bg-blue-500 text-white"
                    : "text-white/90 hover:bg-white/10"
                )}
                onClick={() => setSelectedApp(app)}
                onDoubleClick={() => { setSelectedApp(app); handleForceQuit(); }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedApp === app ? "bg-white/20" : "bg-white/10"
                )}>
                  {appIcons[app]}
                </div>
                <span className="font-medium">{app}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-700/30 border-t border-white/10 flex items-center justify-between">
          <p className="text-white/40 text-xs">
            You can also relaunch Finder from this window.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleForceQuit}
              disabled={!selectedApp}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                selectedApp
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              )}
            >
              Force Quit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForceQuitDialog;
