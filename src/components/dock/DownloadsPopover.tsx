import React, { useState, useEffect } from 'react';
import { FileText, File, ExternalLink } from 'lucide-react';
import { HanzoLogo, LuxLogo, ZooLogo } from './icons';
import { cn } from '@/lib/utils';

interface DownloadsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

// Whitepaper and document links
const documents = [
  {
    title: 'Lux Whitepaper',
    shortTitle: 'Lux',
    icon: <LuxLogo className="w-10 h-10" />,
    url: 'https://lux.network/whitepaper',
    type: 'PDF',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  {
    title: 'Hanzo Docs',
    shortTitle: 'Hanzo',
    icon: <HanzoLogo className="w-10 h-10 text-white" />,
    url: 'https://docs.hanzo.ai',
    type: 'Docs',
    bgColor: 'bg-gradient-to-br from-orange-500 via-red-500 to-purple-600',
  },
  {
    title: 'Zoo Research',
    shortTitle: 'Zoo',
    icon: <ZooLogo className="w-10 h-10" />,
    url: 'https://zoo.ngo/research',
    type: 'Research',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    title: 'ZIPs',
    shortTitle: 'ZIPs',
    icon: <File className="w-6 h-6 text-white" />,
    url: 'https://zips.zoo.ngo',
    type: 'Proposals',
    bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
  },
  {
    title: 'Lux Genesis',
    shortTitle: 'Genesis',
    icon: <FileText className="w-6 h-6 text-white" />,
    url: 'https://docs.lux.network/genesis',
    type: 'Technical',
    bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  },
  {
    title: 'ACI Architecture',
    shortTitle: 'ACI',
    icon: <HanzoLogo className="w-8 h-8 text-white" />,
    url: 'https://docs.hanzo.ai/aci',
    type: 'Architecture',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
];

const DownloadsPopover: React.FC<DownloadsPopoverProps> = ({
  isOpen,
  onClose,
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

  // Desktop: Stack layout - documents stack upward from downloads icon
  // Downloads icon is 2nd from right in dock (before trash)
  // Dock icons are ~48px wide with ~8px gaps, trash is ~56px from right edge
  // Downloads icon center is approximately: 56 (trash) + 48 (downloads) / 2 = ~80px from right
  const totalItems = documents.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      {/* Stack Container - positioned precisely above downloads icon */}
      {/* Downloads is 2nd from right: trash (~56px) + downloads center (~24px) = ~80px from right */}
      <div
        className="fixed z-[9999] flex flex-col-reverse gap-1"
        style={{
          bottom: '85px',
          right: '72px',
        }}
      >
        {documents.map((doc, index) => {
          // Stagger animation delay - first item appears last (stack from bottom)
          const delay = (totalItems - 1 - index) * 40;

          return (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              style={{
                animation: `stack-in 0.2s ease-out ${delay}ms both`,
              }}
            >
              {/* Document card */}
              <div
                className={cn(
                  "w-16 h-20 rounded-xl shadow-2xl flex flex-col items-center justify-center p-2",
                  "border border-white/20 backdrop-blur-sm",
                  "transition-all duration-200 cursor-pointer",
                  "hover:scale-110 hover:z-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-x-2",
                  doc.bgColor
                )}
              >
                {/* Icon */}
                <div className="flex-1 flex items-center justify-center">
                  {doc.icon}
                </div>

                {/* Label */}
                <span className="text-[9px] font-medium text-white/90 text-center leading-tight truncate w-full">
                  {doc.shortTitle}
                </span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10">
                  <div className="text-xs font-medium text-white">{doc.title}</div>
                  <div className="text-[10px] text-white/50 flex items-center gap-1">
                    {doc.type}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* CSS for stack animation */}
      <style>{`
        @keyframes stack-in {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default DownloadsPopover;
