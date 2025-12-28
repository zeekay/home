import React, { useState } from 'react';
import { X, ExternalLink, Keyboard, ChevronDown, ChevronUp } from 'lucide-react';
import { getAppMetadata, systemInfo, AppMetadata } from '@/config/appMetadata';
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
  AppStoreIcon,
} from '@/components/dock/icons';

interface AboutAppDialogProps {
  appId: string;
  appName: string;
  isOpen: boolean;
  onClose: () => void;
}

// Map app IDs to their icon components
const APP_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'finder': FinderIcon,
  'safari': SafariIcon,
  'mail': MailIcon,
  'photos': PhotosIcon,
  'calendar': CalendarIcon,
  'messages': SocialsIcon,
  'facetime': PhoneIcon,
  'music': MusicIcon,
  'terminal': TerminalIcon,
  'textedit': TextEditIcon,
  'notes': NotesIcon,
  'hanzo': HanzoLogo,
  'lux': LuxLogo,
  'zoo': ZooLogo,
  'settings': SettingsIcon,
  'calculator': CalculatorIcon,
  'clock': ClockIcon,
  'weather': WeatherIcon,
  'stickies': StickiesIcon,
  'github': GitHubIcon,
  'activity': GitHubIcon,
  'xcode': XcodeIcon,
  'appstore': AppStoreIcon,
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

const AboutAppDialog: React.FC<AboutAppDialogProps> = ({ appId, appName, isOpen, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!isOpen) return null;

  const metadata = getAppMetadata(appId);
  const IconComponent = APP_ICONS[appId];

  // Fallback metadata if not found
  const info: Partial<AppMetadata> = metadata || {
    name: appName,
    version: '1.0.0',
    build: '100',
    copyright: `© 2024-2025 Zach Kelling. All rights reserved.`,
    developer: 'Zach Kelling',
    releaseDate: 'December 2024',
    description: `${appName} for zOS`,
    features: [],
  };

  const handleOpenSource = () => {
    if (metadata?.sourceCode) {
      window.open(metadata.sourceCode, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenWebsite = () => {
    if (metadata?.website) {
      window.open(metadata.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[10001]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] w-[340px] max-h-[80vh] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500 flex items-center justify-center transition-colors group"
          aria-label="Close"
        >
          <X className="w-3 h-3 text-white/70 group-hover:text-white" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center px-6 pt-10 pb-6 overflow-y-auto max-h-[calc(80vh-2rem)]">
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
            {info.name}
          </h2>

          {/* Version & Build */}
          <p className="text-white/60 text-sm mb-1">
            Version {info.version} ({info.build})
          </p>

          {/* Release Date */}
          <p className="text-white/40 text-xs mb-4">
            {info.releaseDate}
          </p>

          {/* Description */}
          <p className="text-white/70 text-sm text-center mb-4 leading-relaxed">
            {info.description}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            {metadata?.sourceCode && (
              <button
                onClick={handleOpenSource}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Source Code
              </button>
            )}
            {metadata?.website && (
              <button
                onClick={handleOpenWebsite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </button>
            )}
          </div>

          {/* Expandable Details */}
          {(metadata?.features?.length || metadata?.shortcuts?.length || metadata?.credits?.length) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-white/50 hover:text-white/70 text-xs mb-3 transition-colors"
            >
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          )}

          {showDetails && (
            <div className="w-full space-y-4 mb-4">
              {/* Features */}
              {metadata?.features && metadata.features.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wide">Features</h3>
                  <ul className="space-y-1">
                    {metadata.features.map((feature, idx) => (
                      <li key={idx} className="text-white/60 text-xs flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keyboard Shortcuts */}
              {metadata?.shortcuts && metadata.shortcuts.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wide flex items-center gap-1">
                    <Keyboard className="w-3 h-3" />
                    Keyboard Shortcuts
                  </h3>
                  <div className="space-y-1.5">
                    {metadata.shortcuts.map((shortcut, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{shortcut.action}</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono text-[10px]">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits */}
              {metadata?.credits && metadata.credits.length > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <h3 className="text-white/80 text-xs font-semibold mb-2 uppercase tracking-wide">Credits</h3>
                  <ul className="space-y-1">
                    {metadata.credits.map((credit, idx) => (
                      <li key={idx} className="text-white/60 text-xs">
                        {credit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-3" />

          {/* Developer & Copyright */}
          <p className="text-white/50 text-xs text-center mb-1">
            Developed by {info.developer}
          </p>
          <p className="text-white/40 text-[10px] text-center">
            {info.copyright}
          </p>

          {/* System Info */}
          <div className="mt-4 pt-3 border-t border-white/10 w-full">
            <p className="text-white/30 text-[10px] text-center">
              {systemInfo.name} {systemInfo.version} ({systemInfo.build})
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutAppDialog;
