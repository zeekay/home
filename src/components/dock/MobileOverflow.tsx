
import React, { useState } from 'react';
import { MoreHorizontal, LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  HanzoLogo,
  LuxLogo,
  ZooLogo,
} from './icons';

interface OverflowItemType {
  id: string;
  icon?: LucideIcon;
  label: string;
  color?: string;
  onClick?: () => void;
  bgGradient?: string;
  useCustomIcon?: boolean;
}

interface MobileOverflowProps {
  items: OverflowItemType[];
}

// Map of item IDs to their custom icon components
const getIconComponent = (id: string): React.ReactNode => {
  switch (id) {
    case 'finder':
      return <FinderIcon className="w-full h-full" />;
    case 'safari':
      return <SafariIcon className="w-full h-full" />;
    case 'mail':
      return <MailIcon className="w-full h-full" />;
    case 'photos':
      return <PhotosIcon className="w-full h-full" />;
    case 'calendar':
      return <CalendarIcon className="w-full h-full" />;
    case 'socials':
      return <SocialsIcon className="w-full h-full" />;
    case 'facetime':
      return <PhoneIcon className="w-full h-full" />;
    case 'music':
      return <MusicIcon className="w-full h-full" />;
    case 'terminal':
      return <TerminalIcon className="w-full h-full" />;
    case 'hanzo':
      return <HanzoLogo className="w-full h-full text-white" />;
    case 'lux':
      return <LuxLogo className="w-full h-full text-white" />;
    case 'zoo':
      return <ZooLogo className="w-full h-full" />;
    default:
      return null;
  }
};

const MobileOverflow: React.FC<MobileOverflowProps> = ({ items }) => {
  const [moreAppsOpen, setMoreAppsOpen] = useState(false);
  
  return (
    <Popover open={moreAppsOpen} onOpenChange={setMoreAppsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="group relative flex flex-col items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-110 shadow-lg group-hover:shadow-xl border border-white/15">
                <MoreHorizontal className="w-5 h-5 text-white group-hover:animate-pulse transition-all duration-300" />
              </div>
              <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/80 text-white border-0">
          More Apps
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="top" align="end" className="w-72 bg-black/90 backdrop-blur-sm border-white/15 text-white rounded-xl p-2">
        <div className="grid grid-cols-3 gap-2">
          {items.map((app, index) => {
            const Icon = app.icon;
            const customIcon = app.useCustomIcon ? getIconComponent(app.id) : null;

            return (
              <div
                key={app.id || index}
                className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  if (app.onClick) {
                    app.onClick();
                    setMoreAppsOpen(false);
                  }
                }}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-1 overflow-hidden ${app.bgGradient || 'bg-black/40 border border-white/5'}`}>
                  {customIcon ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {customIcon}
                    </div>
                  ) : Icon ? (
                    <Icon className={`w-5 h-5 ${app.color || 'text-white'}`} />
                  ) : null}
                </div>
                <span className="text-xs text-center">{app.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MobileOverflow;
