import React from 'react';

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

// Zoo Logo - Three overlapping RGB circles with color blending
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

// macOS Folder Icon
export const MacFolderIcon: React.FC<{ className?: string; badge?: React.ReactNode }> = ({ className = "w-12 h-12", badge }) => (
  <div className={`relative ${className}`}>
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Folder back */}
      <path d="M4 16C4 13.7909 5.79086 12 8 12H24L28 18H56C58.2091 18 60 19.7909 60 22V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V16Z" fill="url(#folderGrad)"/>
      {/* Folder front */}
      <path d="M4 24C4 21.7909 5.79086 20 8 20H56C58.2091 20 60 21.7909 60 24V52C60 54.2091 58.2091 56 56 56H8C5.79086 56 4 54.2091 4 52V24Z" fill="url(#folderFrontGrad)"/>
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
    </svg>
    {badge && (
      <div className="absolute inset-0 flex items-center justify-center pt-2">
        {badge}
      </div>
    )}
  </div>
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
    {/* Trash can body - metallic gray */}
    <path d="M16 18H48V56C48 58.2091 46.2091 60 44 60H20C17.7909 60 16 58.2091 16 56V18Z" fill="url(#trashBodyGrad)"/>
    {/* Trash can ridges */}
    <rect x="22" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="31" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    <rect x="40" y="24" width="2" height="30" rx="1" fill="rgba(0,0,0,0.15)"/>
    {/* Trash can lid */}
    <path d="M12 14C12 12.8954 12.8954 12 14 12H50C51.1046 12 52 12.8954 52 14V18H12V14Z" fill="url(#trashLidGrad)"/>
    {/* Lid handle */}
    <rect x="26" y="8" width="12" height="4" rx="2" fill="#8A8A8C"/>
    {full && (
      <>
        {/* Crumpled paper balls */}
        <circle cx="28" cy="12" r="6" fill="#F0E6D3"/>
        <circle cx="36" cy="10" r="5" fill="#E8DCC8"/>
        <circle cx="32" cy="6" r="4" fill="#F5EDE0"/>
        <path d="M24 8C24 8 26 6 28 8C30 10 32 6 34 8" stroke="#D4C4A8" strokeWidth="0.5" fill="none"/>
      </>
    )}
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
  </svg>
);
