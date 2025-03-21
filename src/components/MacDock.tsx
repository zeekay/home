
import React from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Folder, Mail, Globe, Image, Music, Video, Settings, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MacDockProps {
  className?: string;
  onTerminalClick: () => void;
  onSafariClick: () => void;
  onITunesClick: () => void;
  onSystemPreferencesClick?: () => void;
  onMailClick?: () => void;
  onCalendarClick?: () => void;
}

const MacDock: React.FC<MacDockProps> = ({ 
  className, 
  onTerminalClick, 
  onSafariClick, 
  onITunesClick,
  onSystemPreferencesClick,
  onMailClick,
  onCalendarClick
}) => {
  const dockItems = [
    { icon: Folder, label: 'Finder' },
    { icon: Globe, label: 'Safari', onClick: onSafariClick },
    { icon: Terminal, label: 'Terminal', onClick: onTerminalClick },
    { icon: Music, label: 'iTunes', onClick: onITunesClick },
    { icon: Mail, label: 'Mail', onClick: onMailClick },
    { icon: Image, label: 'Photos' },
    { icon: Video, label: 'Videos' },
    { icon: Calendar, label: 'Calendar', onClick: onCalendarClick },
    { icon: Settings, label: 'System Preferences', onClick: onSystemPreferencesClick },
  ];

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'flex justify-center items-end py-1 w-full',
          'bg-white/20 backdrop-blur-md border-t border-white/40',
          'h-20',
          className
        )}
      >
        <div className="flex items-end space-x-1 px-2 py-1 rounded-2xl bg-white/30 backdrop-blur-md">
          {dockItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className="group relative flex flex-col items-center justify-center"
                  onClick={item.onClick}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-200 hover:scale-110 shadow-md group-hover:shadow-lg">
                    <item.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-500 mt-1 opacity-0 group-hover:opacity-100" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/80 text-white border-0">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MacDock;
