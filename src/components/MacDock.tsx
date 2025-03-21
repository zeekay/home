
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
    { icon: Folder, label: 'Finder', color: 'text-blue-400' },
    { icon: Globe, label: 'Safari', onClick: onSafariClick, color: 'text-sky-400' },
    { icon: Terminal, label: 'Terminal', onClick: onTerminalClick, color: 'text-green-400' },
    { icon: Music, label: 'iTunes', onClick: onITunesClick, color: 'text-pink-400' },
    { icon: Mail, label: 'Mail', onClick: onMailClick, color: 'text-red-400' },
    { icon: Image, label: 'Photos', color: 'text-purple-400' },
    { icon: Video, label: 'Videos', color: 'text-amber-400' },
    { icon: Calendar, label: 'Calendar', onClick: onCalendarClick, color: 'text-orange-400' },
    { icon: Settings, label: 'System Preferences', onClick: onSystemPreferencesClick, color: 'text-indigo-400' },
  ];

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'flex justify-center items-end py-1 w-full',
          'bg-black/60 border-t border-white/10',
          'h-20',
          className
        )}
      >
        <div className="flex items-end space-x-2 px-3 py-1 rounded-2xl">
          {dockItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className="group relative flex flex-col items-center justify-center"
                  onClick={item.onClick}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl hover:bg-gray-900 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/5">
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:animate-pulse transition-all duration-300`} />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black text-white border-0">
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
