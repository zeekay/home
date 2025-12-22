import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  HanzoLogo,
  LuxLogo,
  ZooLogo,
  NotesIcon,
  GitHubIcon,
  StatsIcon,
  SettingsIcon,
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  CalendarIcon,
  MusicIcon,
  TerminalIcon,
  PhoneIcon,
  SocialsIcon,
} from './icons';

interface ApplicationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotes?: () => void;
  onOpenGitHub?: () => void;
  onOpenStats?: () => void;
  onOpenSettings?: () => void;
  onOpenHanzo?: () => void;
  onOpenLux?: () => void;
  onOpenZoo?: () => void;
}

const ApplicationsPopover: React.FC<ApplicationsPopoverProps> = ({
  isOpen,
  onClose,
  onOpenNotes,
  onOpenGitHub,
  onOpenStats,
  onOpenSettings,
  onOpenHanzo,
  onOpenLux,
  onOpenZoo,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
      />
      
      {/* Popover */}
      <div 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] w-[420px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4"
      >
        {/* Hanzo AI Section */}
        <div className="mb-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Hanzo AI</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { onOpenHanzo?.(); onClose(); }}
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 rounded-2xl mb-2">
                <HanzoLogo className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-white/90">Hanzo AI</span>
            </button>

            <button
              onClick={() => { onOpenLux?.(); onClose(); }}
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl mb-2">
                <LuxLogo className="w-9 h-9 text-white" />
              </div>
              <span className="text-xs text-white/90">Lux Wallet</span>
            </button>

            <button
              onClick={() => { onOpenZoo?.(); onClose(); }}
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500 rounded-2xl mb-2 p-2">
                <ZooLogo className="w-full h-full" />
              </div>
              <span className="text-xs text-white/90">Zoo</span>
            </button>
          </div>
        </div>

        {/* External Links */}
        <div className="mb-4 border-t border-white/10 pt-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Websites</div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href="https://hanzo.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-black/40 rounded-2xl mb-2 border border-white/15 relative">
                <HanzoLogo className="w-7 h-7 text-white" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-white/90">hanzo.ai</span>
            </a>

            <a
              href="https://lux.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-black/40 rounded-2xl mb-2 border border-white/15 relative">
                <LuxLogo className="w-7 h-7 text-cyan-400" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-white/90">lux.network</span>
            </a>

            <a
              href="https://zoo.ngo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-black/40 rounded-2xl mb-2 border border-white/15 relative p-2.5">
                <ZooLogo className="w-full h-full" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-white/90">zoo.ngo</span>
            </a>
          </div>
        </div>

        {/* System Apps */}
        <div className="border-t border-white/10 pt-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Applications</div>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => { onOpenNotes?.(); onClose(); }}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-11 h-11 mb-1">
                <NotesIcon className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/90">Notes</span>
            </button>

            <button
              onClick={() => { onOpenGitHub?.(); onClose(); }}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-11 h-11 mb-1">
                <GitHubIcon className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/90">GitHub</span>
            </button>

            <button
              onClick={() => { onOpenStats?.(); onClose(); }}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-11 h-11 mb-1">
                <StatsIcon className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/90">Activity</span>
            </button>

            <button
              onClick={() => { onOpenSettings?.(); onClose(); }}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-11 h-11 mb-1">
                <SettingsIcon className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/90">Settings</span>
            </button>

            <div className="flex flex-col items-center p-2 opacity-50">
              <div className="w-11 h-11 mb-1">
                <FinderIcon className="w-full h-full" />
              </div>
              <span className="text-[10px] text-white/90">Finder</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationsPopover;
