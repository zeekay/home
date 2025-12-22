import React from 'react';

// ============================================================================
// MACOS-STYLE ICON PACK
// All icons are designed to look like native macOS dock icons
// ============================================================================

// Finder Icon - Classic macOS Finder face (2-tone with simple black features)
export const FinderIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="finderFaceClip">
        <rect x="8" y="10" width="48" height="44" rx="10" />
      </clipPath>
    </defs>
    {/* Rounded square background */}
    <rect x="4" y="4" width="56" height="56" rx="12" fill="#1E90FF" />
    {/* Face container with clip */}
    <g clipPath="url(#finderFaceClip)">
      {/* Face - left half (darker blue) */}
      <rect x="8" y="10" width="24" height="44" fill="#3BABF0" />
      {/* Face - right half (lighter blue) */}
      <rect x="32" y="10" width="24" height="44" fill="#A8DBF7" />
    </g>
    {/* Face outline for rounded corners */}
    <rect x="8" y="10" width="48" height="44" rx="10" fill="none" stroke="#1E90FF" strokeWidth="0.5" />
    {/* Left eye - simple black rectangle with rounded corners */}
    <rect x="18" y="24" width="5" height="10" rx="2" fill="#1a1a1a" />
    {/* Right eye - simple black rectangle with rounded corners */}
    <rect x="41" y="24" width="5" height="10" rx="2" fill="#1a1a1a" />
    {/* Smile - simple black curved line */}
    <path d="M20 42 Q32 52 44 42" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

// Safari Icon - Compass
export const SafariIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="safariGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#63D3FF" />
        <stop offset="100%" stopColor="#0070E0" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#safariGrad)" />
    {/* Compass outer ring */}
    <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="2" />
    {/* Direction marks */}
    <text x="32" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">N</text>
    <text x="32" y="51" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">S</text>
    <text x="17" y="34" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">W</text>
    <text x="47" y="34" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">E</text>
    {/* Compass needle */}
    <polygon points="32,18 36,32 32,36 28,32" fill="#FF3B30" />
    <polygon points="32,46 28,32 32,28 36,32" fill="white" />
  </svg>
);

// Mail Icon - Envelope
export const MailIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AC8FA" />
        <stop offset="100%" stopColor="#007AFF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#mailGrad)" />
    {/* Envelope body */}
    <rect x="10" y="18" width="44" height="30" rx="2" fill="white" />
    {/* Envelope flap */}
    <path d="M10 20 L32 36 L54 20" stroke="#007AFF" strokeWidth="2" fill="none" />
  </svg>
);

// Photos Icon - Colorful flower
export const PhotosIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="photosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF9500" />
        <stop offset="33%" stopColor="#FF2D55" />
        <stop offset="66%" stopColor="#AF52DE" />
        <stop offset="100%" stopColor="#5856D6" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
    {/* Flower petals */}
    <circle cx="32" cy="22" r="8" fill="#FF9500" />
    <circle cx="22" cy="30" r="8" fill="#FF2D55" />
    <circle cx="24" cy="42" r="8" fill="#AF52DE" />
    <circle cx="40" cy="42" r="8" fill="#5856D6" />
    <circle cx="42" cy="30" r="8" fill="#34C759" />
    <circle cx="32" cy="34" r="6" fill="#FFD60A" />
  </svg>
);

// Calendar Icon - Calendar with current date
export const CalendarIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
  const today = new Date();
  const day = today.getDate().toString();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="white" />
      {/* Red header */}
      <rect x="4" y="4" width="56" height="18" rx="12" fill="#FF3B30" />
      <rect x="4" y="14" width="56" height="8" fill="#FF3B30" />
      {/* Day of week */}
      <text x="32" y="17" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">{weekday}</text>
      {/* Date number */}
      <text x="32" y="48" textAnchor="middle" fill="#1a1a1a" fontSize="26" fontWeight="300">{day}</text>
    </svg>
  );
};

// Socials Icon - Speech bubbles
export const SocialsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="socialsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64D2FF" />
        <stop offset="100%" stopColor="#0A84FF" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#socialsGrad)" />
    {/* Chat bubbles */}
    <path d="M14 20 h22 a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 h-16 l-6 6 v-6 a4 4 0 0 1 -4 -4 v-12 a4 4 0 0 1 4 -4" fill="white" />
    <circle cx="20" cy="30" r="2" fill="#0A84FF" />
    <circle cx="28" cy="30" r="2" fill="#0A84FF" />
    <circle cx="36" cy="30" r="2" fill="#0A84FF" />
  </svg>
);

// Phone/FaceTime Icon
export const PhoneIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#5AF158" />
        <stop offset="100%" stopColor="#32D74B" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#phoneGrad)" />
    {/* Phone receiver */}
    <path d="M18 22 c0 0 -2 8 6 16 s16 6 16 6 l4 -4 c1 -1 1 -2 0 -3 l-6 -4 c-1 -1 -2 -1 -3 0 l-2 2 c-4 -2 -8 -6 -10 -10 l2 -2 c1 -1 1 -2 0 -3 l-4 -6 c-1 -1 -2 -1 -3 0 l-4 4 z" fill="white" />
  </svg>
);

// Music Icon
export const MusicIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="musicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FC5C7D" />
        <stop offset="100%" stopColor="#6A82FB" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#musicGrad)" />
    {/* Music note */}
    <path d="M42 16 v24 c0 4 -4 7 -8 7 s-8 -3 -8 -7 s4 -7 8 -7 c2 0 4 0.5 5 1.5 v-14 l-16 4 v20 c0 4 -4 7 -8 7 s-8 -3 -8 -7 s4 -7 8 -7 c2 0 4 0.5 5 1.5 v-23 l22 -6 z" fill="white" />
  </svg>
);

// Terminal Icon
export const TerminalIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="56" height="56" rx="12" fill="#1a1a1a" />
    {/* Terminal window frame */}
    <rect x="8" y="8" width="48" height="48" rx="6" fill="#2a2a2a" />
    {/* Title bar */}
    <rect x="8" y="8" width="48" height="10" rx="6" fill="#3a3a3a" />
    <rect x="8" y="14" width="48" height="4" fill="#3a3a3a" />
    {/* Traffic lights */}
    <circle cx="16" cy="13" r="2.5" fill="#FF5F56" />
    <circle cx="24" cy="13" r="2.5" fill="#FFBD2E" />
    <circle cx="32" cy="13" r="2.5" fill="#27CA40" />
    {/* Terminal prompt */}
    <text x="14" y="32" fill="#4AF626" fontSize="12" fontFamily="monospace">$</text>
    <rect x="24" y="26" width="8" height="10" fill="#4AF626" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" />
    </rect>
    {/* Previous command output */}
    <text x="14" y="46" fill="#888" fontSize="8" fontFamily="monospace">~ zach@macbook</text>
  </svg>
);

// Hanzo Logo - White H shape with diagonal stripe
export const HanzoLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 67 67" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M22.21 67V44.6369H0V67H22.21Z" fill="currentColor"/>
    <path d="M0 44.6369L22.21 46.8285V44.6369H0Z" fill="currentColor" opacity="0.7"/>
    <path d="M66.7038 22.3184H22.2534L0.0878906 44.6367H44.4634L66.7038 22.3184Z" fill="currentColor"/>
    <path d="M22.21 0H0V22.3184H22.21V0Z" fill="currentColor"/>
    <path d="M66.7198 0H44.5098V22.3184H66.7198V0Z" fill="currentColor"/>
    <path d="M66.6753 22.3185L44.5098 20.0822V22.3185H66.6753Z" fill="currentColor" opacity="0.7"/>
    <path d="M66.7198 67V44.6369H44.5098V67H66.7198Z" fill="currentColor"/>
  </svg>
);

// Lux Logo - Upside down triangle
export const LuxLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 85 L15 25 L85 25 Z" fill="currentColor"/>
  </svg>
);

// Zoo Logo - Three overlapping RGB circles
export const ZooLogo: React.FC<{ className?: string; mono?: boolean }> = ({ className = "w-8 h-8", mono = false }) => {
  if (mono) {
    return (
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <clipPath id="outerCircleMono">
            <circle cx="508" cy="510" r="283"/>
          </clipPath>
        </defs>
        <g clipPath="url(#outerCircleMono)">
          <circle cx="513" cy="369" r="234" fill="none" stroke="currentColor" strokeWidth="33"/>
          <circle cx="365" cy="595" r="234" fill="none" stroke="currentColor" strokeWidth="33"/>
          <circle cx="643" cy="595" r="234" fill="none" stroke="currentColor" strokeWidth="33"/>
          <circle cx="508" cy="510" r="265" fill="none" stroke="currentColor" strokeWidth="36"/>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <clipPath id="outerCircleColor">
          <circle cx="512" cy="511" r="270"/>
        </clipPath>
        <clipPath id="greenClip">
          <circle cx="513" cy="369" r="234"/>
        </clipPath>
        <clipPath id="redClip">
          <circle cx="365" cy="595" r="234"/>
        </clipPath>
        <clipPath id="blueClip">
          <circle cx="643" cy="595" r="234"/>
        </clipPath>
      </defs>
      <g clipPath="url(#outerCircleColor)">
        <circle cx="513" cy="369" r="234" fill="#00A652"/>
        <circle cx="365" cy="595" r="234" fill="#ED1C24"/>
        <circle cx="643" cy="595" r="234" fill="#2E3192"/>
        <g clipPath="url(#greenClip)">
          <circle cx="365" cy="595" r="234" fill="#FCF006"/>
        </g>
        <g clipPath="url(#greenClip)">
          <circle cx="643" cy="595" r="234" fill="#01ACF1"/>
        </g>
        <g clipPath="url(#redClip)">
          <circle cx="643" cy="595" r="234" fill="#EA018E"/>
        </g>
        <g clipPath="url(#greenClip)">
          <g clipPath="url(#redClip)">
            <circle cx="643" cy="595" r="234" fill="#FFFFFF"/>
          </g>
        </g>
      </g>
    </svg>
  );
};

// macOS Folder Icon - Pure SVG for proper dock sizing
export const MacFolderIcon: React.FC<{ className?: string; badgeType?: 'apps' | 'downloads' }> = ({ className = "w-12 h-12", badgeType }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="folderGrad" x1="32" y1="12" x2="32" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6CB5E9"/>
        <stop offset="1" stopColor="#3A8DD0"/>
      </linearGradient>
      <linearGradient id="folderFrontGrad" x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8AC7F0"/>
        <stop offset="1" stopColor="#4A9FE3"/>
      </linearGradient>
    </defs>
    {/* Folder back */}
    <path d="M4 16C4 13.7909 5.79086 12 8 12H24L28 18H56C58.2091 18 60 19.7909 60 22V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V16Z" fill="url(#folderGrad)"/>
    {/* Folder front */}
    <path d="M4 24C4 21.7909 5.79086 20 8 20H56C58.2091 20 60 21.7909 60 24V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V24Z" fill="url(#folderFrontGrad)"/>
    {/* Apps badge - Letter A */}
    {badgeType === 'apps' && (
      <g transform="translate(20, 28)">
        <path d="M12 2L4 22H8L10 18H14L16 22H20L12 2Z" fill="white" opacity="0.95"/>
        <path d="M12 8L10 14H14L12 8Z" fill="#4A9FE3"/>
      </g>
    )}
    {/* Downloads badge - Arrow down in circle */}
    {badgeType === 'downloads' && (
      <g transform="translate(20, 28)">
        <circle cx="12" cy="12" r="10" fill="white" opacity="0.95"/>
        <path d="M12 6V14M12 14L8 10M12 14L16 10" stroke="#4A9FE3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 18H17" stroke="#4A9FE3" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    )}
  </svg>
);

// Applications Folder Badge (App Store style A)
export const AppsBadge: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 20H8L10 16H14L16 20H20L12 4Z" fill="white" opacity="0.9"/>
    <path d="M12 8L10 14H14L12 8Z" fill="#4A9FE3"/>
  </svg>
);

// Downloads Badge (Arrow down)
export const DownloadsBadge: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" fill="white" opacity="0.9"/>
    <path d="M12 6V14M12 14L8 10M12 14L16 10" stroke="#4A9FE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 16H17" stroke="#4A9FE3" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// macOS Trash Icon
export const MacTrashIcon: React.FC<{ className?: string; full?: boolean }> = ({ className = "w-12 h-12", full = false }) => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="trashBodyGrad" x1="32" y1="18" x2="32" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D8D8DA"/>
        <stop offset="0.5" stopColor="#C0C0C2"/>
        <stop offset="1" stopColor="#A8A8AA"/>
      </linearGradient>
      <linearGradient id="trashLidGrad" x1="32" y1="12" x2="32" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E0E0E2"/>
        <stop offset="1" stopColor="#C8C8CA"/>
      </linearGradient>
    </defs>
    <path d="M16 18H48V56C48 58.2091 46.2091 60 44 60H20C17.7909 60 16 58.2091 16 56V18Z" fill="url(#trashBodyGrad)"/>
    <rect x="22" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="31" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="40" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    <path d="M12 14C12 12.8954 12.8954 12 14 12H50C51.1046 12 52 12.8954 52 14V18H12V14Z" fill="url(#trashLidGrad)"/>
    <rect x="26" y="8" width="12" height="4" rx="2" fill="#8A8A8C"/>
    {full && (
      <>
        <circle cx="28" cy="12" r="6" fill="#F0E6D3"/>
        <circle cx="36" cy="10" r="5" fill="#E8DCC8"/>
        <circle cx="32" cy="6" r="4" fill="#F5EDE0"/>
      </>
    )}
  </svg>
);

// Settings/System Preferences Icon - Gear
export const SettingsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8E8E93" />
        <stop offset="100%" stopColor="#636366" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#settingsGrad)" />
    {/* Gear */}
    <path d="M32 20c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="white"/>
    <path d="M50 29h-3.1c-.4-1.5-1-2.9-1.8-4.2l2.2-2.2c.8-.8.8-2 0-2.8l-2.8-2.8c-.8-.8-2-.8-2.8 0l-2.2 2.2c-1.3-.8-2.7-1.4-4.2-1.8V14c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3.1c-1.5.4-2.9 1-4.2 1.8l-2.2-2.2c-.8-.8-2-.8-2.8 0l-2.8 2.8c-.8.8-.8 2 0 2.8l2.2 2.2c-.8 1.3-1.4 2.7-1.8 4.2H14c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h3.1c.4 1.5 1 2.9 1.8 4.2l-2.2 2.2c-.8.8-.8 2 0 2.8l2.8 2.8c.8.8 2 .8 2.8 0l2.2-2.2c1.3.8 2.7 1.4 4.2 1.8V50c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3.1c1.5-.4 2.9-1 4.2-1.8l2.2 2.2c.8.8 2 .8 2.8 0l2.8-2.8c.8-.8.8-2 0-2.8l-2.2-2.2c.8-1.3 1.4-2.7 1.8-4.2H50c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z" fill="white"/>
  </svg>
);

// Notes/TextPad Icon
export const NotesIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="notesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFDC5D" />
        <stop offset="100%" stopColor="#FFB800" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#notesGrad)" />
    {/* Paper */}
    <rect x="12" y="10" width="40" height="44" rx="4" fill="white" />
    {/* Lines */}
    <line x1="18" y1="22" x2="46" y2="22" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="30" x2="46" y2="30" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="38" x2="46" y2="38" stroke="#E0E0E0" strokeWidth="1" />
    <line x1="18" y1="46" x2="38" y2="46" stroke="#E0E0E0" strokeWidth="1" />
    {/* Text */}
    <text x="18" y="20" fill="#333" fontSize="7" fontWeight="500">Hello World</text>
  </svg>
);

// GitHub Stats Icon
export const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="githubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#6E5494" />
        <stop offset="100%" stopColor="#4A3770" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#githubGrad)" />
    {/* GitHub octocat silhouette simplified */}
    <path d="M32 14c-9.94 0-18 8.06-18 18 0 7.95 5.16 14.69 12.31 17.06.9.17 1.23-.39 1.23-.86 0-.42-.02-1.54-.02-3.02-5.01 1.09-6.07-2.41-6.07-2.41-.82-2.08-2-2.64-2-2.64-1.63-1.11.12-1.09.12-1.09 1.81.13 2.76 1.86 2.76 1.86 1.6 2.75 4.21 1.95 5.24 1.49.16-1.16.63-1.95 1.14-2.4-4-.45-8.21-2-8.21-8.91 0-1.97.7-3.58 1.86-4.84-.19-.46-.81-2.29.18-4.77 0 0 1.52-.49 4.97 1.85a17.4 17.4 0 019.02 0c3.45-2.34 4.97-1.85 4.97-1.85.99 2.48.37 4.31.18 4.77 1.16 1.26 1.86 2.87 1.86 4.84 0 6.93-4.22 8.46-8.24 8.9.65.56 1.22 1.66 1.22 3.35 0 2.42-.02 4.37-.02 4.96 0 .48.32 1.04 1.24.86C44.84 46.69 50 39.95 50 32c0-9.94-8.06-18-18-18z" fill="white"/>
  </svg>
);

// Stats/Activity Icon
export const StatsIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="statsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#statsGrad)" />
    {/* Bar chart */}
    <rect x="12" y="38" width="8" height="16" rx="2" fill="white" opacity="0.9"/>
    <rect x="24" y="28" width="8" height="26" rx="2" fill="white"/>
    <rect x="36" y="20" width="8" height="34" rx="2" fill="white" opacity="0.9"/>
    <rect x="48" y="32" width="8" height="22" rx="2" fill="white"/>
  </svg>
);

// Videos Icon
export const VideosIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="videosGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#videosGrad)" />
    {/* Play button */}
    <circle cx="32" cy="32" r="16" fill="white" opacity="0.2"/>
    <path d="M26 22 L46 32 L26 42 Z" fill="white"/>
  </svg>
);
