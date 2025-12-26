import React from 'react';
import { X } from 'lucide-react';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  CalendarIcon,
  SocialsIcon,
  PhoneIcon,
  MusicIcon,
  TerminalIcon,
  TextEditIcon,
  NotesIcon,
  HanzoLogo,
  LuxLogo,
  ZooLogo,
  XcodeIcon,
  SettingsIcon,
  CalculatorIcon,
  ClockIcon,
  WeatherIcon,
  StickiesIcon,
  GitHubIcon,
} from '@/components/dock/icons';

interface AboutAppDialogProps {
  appName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Map app names to their icon components
const APP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'Finder': FinderIcon,
  'Safari': SafariIcon,
  'Mail': MailIcon,
  'Photos': PhotosIcon,
  'Calendar': CalendarIcon,
  'Messages': SocialsIcon,
  'FaceTime': PhoneIcon,
  'Music': MusicIcon,
  'Terminal': TerminalIcon,
  'TextEdit': TextEditIcon,
  'Notes': NotesIcon,
  'Hanzo AI': HanzoLogo,
  'Lux Wallet': LuxLogo,
  'Zoo': ZooLogo,
  'System Preferences': SettingsIcon,
  'Calculator': CalculatorIcon,
  'Clock': ClockIcon,
  'Weather': WeatherIcon,
  'Stickies': StickiesIcon,
  'GitHub Stats': GitHubIcon,
  'Activity Monitor': GitHubIcon,
  'Xcode': XcodeIcon,
};

// Default icon using first letter of app name
const DefaultIcon: React.FC<{ className?: string; letter: string }> = ({ className = "w-12 h-12", letter }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="defaultAppGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#defaultAppGrad)" />
    <text
      x="32"
      y="42"
      textAnchor="middle"
      fill="white"
      fontSize="28"
      fontWeight="600"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      {letter}
    </text>
  </svg>
);

const AboutAppDialog: React.FC<AboutAppDialogProps> = ({ appName, isOpen, onClose }) => {
  if (!isOpen) return null;

  const IconComponent = APP_ICONS[appName];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[10001]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] w-[280px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors group"
          aria-label="Close"
        >
          <X className="w-3 h-3 text-white/70 group-hover:text-white" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center px-6 pt-10 pb-6">
          {/* App Icon */}
          <div className="mb-4">
            {IconComponent ? (
              <IconComponent className="w-20 h-20" />
            ) : (
              <DefaultIcon className="w-20 h-20" letter={appName.charAt(0).toUpperCase()} />
            )}
          </div>

          {/* App Name */}
          <h2 className="text-white text-xl font-bold mb-1">
            {appName}
          </h2>

          {/* Version */}
          <p className="text-white/60 text-sm mb-1">
            Version 1.0.0
          </p>

          {/* zOS subtitle */}
          <p className="text-white/50 text-xs mb-4">
            zOS
          </p>

          {/* Copyright */}
          <p className="text-white/40 text-xs text-center">
            © 2024 Z. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutAppDialog;
