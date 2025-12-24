import React, { useState, useEffect } from 'react';
import { FileText, File, ExternalLink, FolderOpen } from 'lucide-react';
import { HanzoLogo, LuxLogo, ZooLogo } from './icons';
import { cn } from '@/lib/utils';
import { EXTERNAL_LINKS } from '@/config/links';

interface DownloadsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFinder?: () => void;
}

// Whitepaper and document links
const documents = [
  {
    title: 'Lux Whitepaper',
    shortTitle: 'Lux',
    description: 'Quantum-safe blockchain',
    icon: <LuxLogo className="w-8 h-8" />,
    url: EXTERNAL_LINKS.luxWhitepaper,
    type: 'PDF',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  {
    title: 'Hanzo Docs',
    shortTitle: 'Hanzo',
    description: 'AI platform docs',
    icon: <HanzoLogo className="w-8 h-8 text-white" />,
    url: EXTERNAL_LINKS.hanzoDocs,
    type: 'Docs',
    bgColor: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
  },
  {
    title: 'Zoo Research',
    shortTitle: 'Zoo',
    description: 'DeAI research',
    icon: <ZooLogo className="w-8 h-8" />,
    url: EXTERNAL_LINKS.zooResearch,
    type: 'Research',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    title: 'ZIPs',
    shortTitle: 'ZIPs',
    description: 'Improvement proposals',
    icon: <File className="w-5 h-5 text-white" />,
    url: EXTERNAL_LINKS.zooZips,
    type: 'Proposals',
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  {
    title: 'Lux Genesis',
    shortTitle: 'Genesis',
    description: 'Network genesis',
    icon: <FileText className="w-5 h-5 text-white" />,
    url: EXTERNAL_LINKS.luxGenesis,
    type: 'Technical',
    bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    title: 'ACI Architecture',
    shortTitle: 'ACI',
    description: 'AI chain infra',
    icon: <HanzoLogo className="w-6 h-6 text-white" />,
    url: EXTERNAL_LINKS.hanzoACI,
    type: 'Architecture',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
];

const DownloadsPopover: React.FC<DownloadsPopoverProps> = ({
  isOpen,
  onClose,
  onOpenFinder,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  // Mobile: Simple grid layout
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={onClose}
        />

        {/* Mobile Grid Popover */}
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] w-[85vw] max-w-[320px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-3"
          style={{
            animation: 'slide-up-mobile 0.2s ease-out forwards',
          }}
        >
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Documents</div>
          <div className="grid grid-cols-3 gap-2">
            {documents.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-1",
                  "border border-white/20",
                  doc.bgColor
                )}>
                  {doc.icon}
                </div>
                <span className="text-[9px] text-white/90 text-center leading-tight truncate w-full">
                  {doc.shortTitle}
                </span>
              </a>
            ))}
          </div>

          {/* Open in Finder link */}
          {onOpenFinder && (
            <button
              onClick={() => { onOpenFinder(); onClose(); }}
              className="w-full mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-white/50 hover:text-white/80 transition-colors"
            >
              <FolderOpen className="w-3 h-3" />
              Open in Finder
            </button>
          )}
        </div>

        <style>{`
          @keyframes slide-up-mobile {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  // Desktop: Fan layout - documents fan upward with arc spread
  const totalItems = documents.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      {/* Fan Container - centered above downloads icon (2nd from right in dock) */}
      <div
        data-popover
        className="fixed z-[9999]"
        style={{
          bottom: '85px',
          right: '130px', // Center above downloads icon
          transformOrigin: 'bottom center',
        }}
      >
        {documents.map((doc, index) => {
          // Calculate fan angle - spread outward from center (alternating left/right)
          const centerIndex = (totalItems - 1) / 2;
          const baseOffset = 3; // Slight rotation to continue visual arc from downloads icon
          const fanAngle = (index - centerIndex) * 6 + baseOffset; // 6 degrees spread per item
          const yOffset = index * 62; // Vertical spacing for readability
          const delay = (totalItems - 1 - index) * 40;

          return (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute group"
              style={{
                bottom: `${yOffset}px`,
                right: '0px',
                transform: `rotate(${fanAngle}deg)`,
                transformOrigin: 'bottom center',
                animation: `fan-in 0.25s ease-out ${delay}ms both`,
                zIndex: totalItems - index,
              }}
            >
              {/* Document card - wider with more info */}
              <div
                className={cn(
                  "w-48 h-14 rounded-xl shadow-2xl flex items-center gap-3 px-3",
                  "border border-white/20 backdrop-blur-sm",
                  "transition-all duration-200 cursor-pointer",
                  "hover:scale-105 hover:z-[100] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-x-2",
                  doc.bgColor
                )}
              >
                {/* Icon */}
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {doc.icon}
                </div>

                {/* Text info */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {doc.title}
                  </div>
                  <div className="text-[10px] text-white/70 truncate">
                    {doc.description}
                  </div>
                </div>

                {/* Type badge */}
                <div className="flex items-center gap-1 text-[9px] text-white/50">
                  <ExternalLink className="w-2.5 h-2.5" />
                </div>
              </div>
            </a>
          );
        })}

        {/* Open in Finder button at bottom */}
        {onOpenFinder && (
          <button
            onClick={() => { onOpenFinder(); onClose(); }}
            className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] text-white/70 hover:text-white hover:bg-black/80 transition-all"
            style={{
              bottom: '-35px',
              right: '50px',
              animation: `fan-in 0.25s ease-out ${totalItems * 40 + 100}ms both`,
            }}
          >
            <FolderOpen className="w-3 h-3" />
            Open Downloads
          </button>
        )}
      </div>

      {/* CSS for fan animation - uses opacity only, transform handled by inline styles */}
      <style>{`
        @keyframes fan-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default DownloadsPopover;
