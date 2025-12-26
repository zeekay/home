import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXTERNAL_LINKS } from '@/config/links';
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
  SocialsIcon,
  PhoneIcon,
  MusicIcon,
  TerminalIcon,
  CalculatorIcon,
  ClockIcon,
  WeatherIcon,
  StickiesIcon,
  VideosIcon,
  SoraIcon,
  XcodeIcon,
  AppStoreIcon,
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
  onOpenCalculator?: () => void;
  onOpenClock?: () => void;
  onOpenWeather?: () => void;
  onOpenStickies?: () => void;
  onOpenFinder?: () => void;
  onOpenSafari?: () => void;
  onOpenMail?: () => void;
  onOpenPhotos?: () => void;
  onOpenCalendar?: () => void;
  onOpenMessages?: () => void;
  onOpenFaceTime?: () => void;
  onOpenMusic?: () => void;
  onOpenTerminal?: () => void;
  onOpenVideos?: () => void;
  onOpenSora?: () => void;
  onOpenXcode?: () => void;
  onOpenAppStore?: () => void;
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
  onOpenCalculator,
  onOpenClock,
  onOpenWeather,
  onOpenStickies,
  onOpenFinder,
  onOpenSafari,
  onOpenMail,
  onOpenPhotos,
  onOpenCalendar,
  onOpenMessages,
  onOpenFaceTime,
  onOpenMusic,
  onOpenTerminal,
  onOpenVideos,
  onOpenSora,
  onOpenXcode,
  onOpenAppStore,
}) => {
  if (!isOpen) return null;

  // All system apps
  const systemApps = [
    { id: 'finder', label: 'Finder', icon: <FinderIcon className="w-full h-full" />, onClick: onOpenFinder },
    { id: 'safari', label: 'Safari', icon: <SafariIcon className="w-full h-full" />, onClick: onOpenSafari },
    { id: 'mail', label: 'Mail', icon: <MailIcon className="w-full h-full" />, onClick: onOpenMail },
    { id: 'photos', label: 'Photos', icon: <PhotosIcon className="w-full h-full" />, onClick: onOpenPhotos },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-full h-full" />, onClick: onOpenCalendar },
    { id: 'messages', label: 'Messages', icon: <SocialsIcon className="w-full h-full" />, onClick: onOpenMessages },
    { id: 'facetime', label: 'FaceTime', icon: <PhoneIcon className="w-full h-full" />, onClick: onOpenFaceTime },
    { id: 'music', label: 'Music', icon: <MusicIcon className="w-full h-full" />, onClick: onOpenMusic },
    { id: 'terminal', label: 'Terminal', icon: <TerminalIcon className="w-full h-full" />, onClick: onOpenTerminal },
    { id: 'notes', label: 'Notes', icon: <NotesIcon className="w-full h-full" />, onClick: onOpenNotes },
    { id: 'calculator', label: 'Calculator', icon: <CalculatorIcon className="w-full h-full" />, onClick: onOpenCalculator },
    { id: 'clock', label: 'Clock', icon: <ClockIcon className="w-full h-full" />, onClick: onOpenClock },
    { id: 'weather', label: 'Weather', icon: <WeatherIcon className="w-full h-full" />, onClick: onOpenWeather },
    { id: 'stickies', label: 'Stickies', icon: <StickiesIcon className="w-full h-full" />, onClick: onOpenStickies },
    { id: 'videos', label: 'Videos', icon: <VideosIcon className="w-full h-full" />, onClick: onOpenVideos },
    { id: 'github', label: 'GitHub', icon: <GitHubIcon className="w-full h-full" />, onClick: onOpenGitHub },
    { id: 'activity', label: 'Activity', icon: <StatsIcon className="w-full h-full" />, onClick: onOpenStats },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-full h-full" />, onClick: onOpenSettings },
    { id: 'xcode', label: 'Xcode', icon: <XcodeIcon className="w-full h-full" />, onClick: onOpenXcode },
    { id: 'appstore', label: 'App Store', icon: <AppStoreIcon className="w-full h-full" />, onClick: onOpenAppStore },
  ];

  // Hanzo ecosystem apps
  const hanzoApps = [
    { 
      id: 'hanzo', 
      label: 'Hanzo AI', 
      icon: <HanzoLogo className="w-8 h-8 text-white" />, 
      onClick: onOpenHanzo,
      bgGradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
    },
    { 
      id: 'lux', 
      label: 'Lux Wallet', 
      icon: <LuxLogo className="w-9 h-9 text-white" />, 
      onClick: onOpenLux,
      bgGradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600',
    },
    { 
      id: 'zoo', 
      label: 'Zoo', 
      icon: <ZooLogo className="w-full h-full" />, 
      onClick: onOpenZoo,
      bgGradient: 'bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500',
    },
    { 
      id: 'sora', 
      label: 'Sora', 
      icon: <SoraIcon className="w-full h-full" />, 
      onClick: onOpenSora,
      bgGradient: 'bg-gradient-to-br from-gray-900 to-black border border-white/20',
    },
  ];

  // External website links
  const externalLinks = [
    { label: 'hanzo.ai', url: EXTERNAL_LINKS.hanzoAI, icon: <HanzoLogo className="w-7 h-7 text-white" /> },
    { label: 'lux.network', url: EXTERNAL_LINKS.luxNetwork, icon: <LuxLogo className="w-7 h-7 text-cyan-400" /> },
    { label: 'zoo.ngo', url: EXTERNAL_LINKS.zooLabs, icon: <ZooLogo className="w-full h-full" /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      {/* Popover - centered and animated from bottom */}
      <div
        data-popover
        className={cn(
          "fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]",
          "w-[90vw] max-w-[560px]",
          "bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl",
          "p-4 max-h-[70vh] overflow-y-auto"
        )}
        style={{
          animation: 'slide-up 0.25s ease-out forwards',
        }}
      >
        {/* Hanzo Ecosystem Section */}
        <div className="mb-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Hanzo Ecosystem</div>
          <div className="grid grid-cols-4 gap-2">
            {hanzoApps.map((app) => (
              <button
                key={app.id}
                onClick={() => { app.onClick?.(); onClose(); }}
                className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              >
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-2xl mb-1.5 p-2",
                  app.bgGradient
                )}>
                  {app.icon}
                </div>
                <span className="text-[10px] text-white/90 text-center">{app.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="mb-4 border-t border-white/10 pt-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Websites</div>
          <div className="grid grid-cols-3 gap-2">
            {externalLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-2xl mb-1.5 border border-white/15 relative p-2">
                  {link.icon}
                  <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
                </div>
                <span className="text-[10px] text-white/90">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* All System Apps */}
        <div className="border-t border-white/10 pt-4">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Applications</div>
          <div className="grid grid-cols-6 sm:grid-cols-6 gap-1">
            {systemApps.map((app) => (
              <button
                key={app.id}
                onClick={() => { app.onClick?.(); onClose(); }}
                className="flex flex-col items-center p-1.5 hover:bg-white/10 rounded-xl transition-colors outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              >
                <div className="w-10 h-10 mb-1">
                  {app.icon}
                </div>
                <span className="text-[9px] text-white/90 text-center truncate w-full">{app.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ApplicationsPopover;
