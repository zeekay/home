
import React from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Folder, Mail, Globe, Image, Music, Video, Settings, Calendar, Trash2, FileText, Files } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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

  const fileItems = [
    { icon: Files, label: 'Applications', color: 'text-blue-300' },
    { icon: FileText, label: 'Documents', color: 'text-yellow-300' },
    { icon: Trash2, label: 'Trash', color: 'text-gray-400' },
  ];

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'flex justify-center items-end py-2 w-fit mx-auto', // Changed from w-auto to w-fit
          'bg-black/40 backdrop-blur-sm border border-white/5',
          'rounded-2xl h-20 px-4',
          className
        )}
      >
        <div className="flex items-end space-x-2 py-1">
          {dockItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  className="group relative flex flex-col items-center justify-center"
                  onClick={item.onClick}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/10">
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:animate-pulse transition-all duration-300`} />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/80 text-white border-0">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
          
          <Separator orientation="vertical" className="h-10 bg-white/10 mx-1" />
          
          {fileItems.map((item, index) => (
            <Tooltip key={`file-${index}`}>
              <TooltipTrigger asChild>
                <button
                  className="group relative flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/10">
                    <item.icon className={`w-6 h-6 ${item.color} group-hover:animate-pulse transition-all duration-300`} />
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
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
