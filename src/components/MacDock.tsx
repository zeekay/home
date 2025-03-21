
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Folder, Mail, Globe, Image, Music, Video, Settings, Calendar, Trash2, FileText, Files, FileCode, Coffee, Map, Gamepad2, Camera, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MacDockProps {
  className?: string;
  onTerminalClick: () => void;
  onSafariClick: () => void;
  onITunesClick: () => void;
  onSystemPreferencesClick?: () => void;
  onMailClick?: () => void;
  onCalendarClick?: () => void;
  onPhotosClick?: () => void;
  onFaceTimeClick?: () => void;
}

const MacDock: React.FC<MacDockProps> = ({ 
  className, 
  onTerminalClick, 
  onSafariClick, 
  onITunesClick,
  onSystemPreferencesClick,
  onMailClick,
  onCalendarClick,
  onPhotosClick,
  onFaceTimeClick
}) => {
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const dockItems = [
    { icon: Folder, label: 'Finder', color: 'text-blue-400' },
    { icon: Globe, label: 'Safari', onClick: onSafariClick, color: 'text-sky-400' },
    { icon: Terminal, label: 'Terminal', onClick: onTerminalClick, color: 'text-green-400' },
    { icon: Music, label: 'iTunes', onClick: onITunesClick, color: 'text-pink-400' },
    { icon: Mail, label: 'Mail', onClick: onMailClick, color: 'text-red-400' },
    { icon: Image, label: 'Photos', onClick: onPhotosClick, color: 'text-purple-400' },
    { icon: Camera, label: 'FaceTime', onClick: onFaceTimeClick, color: 'text-sky-500' },
    { icon: Video, label: 'Videos', color: 'text-amber-400' },
    { icon: Calendar, label: 'Calendar', onClick: onCalendarClick, color: 'text-orange-400' },
    { icon: Settings, label: 'System Preferences', onClick: onSystemPreferencesClick, color: 'text-indigo-400' },
  ];

  // Mac app launcher items
  const appLauncherItems = [
    { icon: FileCode, label: 'Xcode', color: 'text-blue-500' },
    { icon: Coffee, label: 'Brew', color: 'text-amber-700' },
    { icon: Map, label: 'Maps', color: 'text-green-500' },
    { icon: Gamepad2, label: 'Games', color: 'text-purple-500' },
    { icon: BookOpen, label: 'Books', color: 'text-orange-500' },
  ];

  const handleTrashClick = () => {
    setIsTrashOpen(true);
    setTimeout(() => setIsTrashOpen(false), 3000); // Auto-close after 3 seconds
  };

  return (
    <TooltipProvider>
      <div 
        className={cn(
          'fixed left-1/2 transform -translate-x-1/2',
          'inline-flex items-center justify-center',
          'px-3 py-2',
          'bg-black/40 backdrop-blur-sm',
          'rounded-2xl',
          'shadow-xl',
          className
        )}
        style={{ 
          border: '1px solid rgba(255, 255, 255, 0.05)',
          maxWidth: 'calc(100% - 32px)',
          width: 'max-content',
          bottom: '20px',
          zIndex: 50
        }}
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
          
          {/* App Launcher */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button className="group relative flex flex-col items-center justify-center">
                    <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/10">
                      <FileText className="w-6 h-6 text-yellow-300 group-hover:animate-pulse transition-all duration-300" />
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-black/80 text-white border-0">
                Applications
              </TooltipContent>
            </Tooltip>
            <PopoverContent side="top" className="w-72 bg-black/90 backdrop-blur-sm border-white/10 text-white rounded-xl p-2">
              <div className="grid grid-cols-3 gap-2">
                {appLauncherItems.map((app, index) => (
                  <div key={index} className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                    <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/5">
                      <app.icon className={`w-6 h-6 ${app.color}`} />
                    </div>
                    <span className="text-xs text-center">{app.label}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Trash */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="group relative flex flex-col items-center justify-center"
                onClick={handleTrashClick}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/10">
                  <Trash2 className="w-6 h-6 text-gray-400 group-hover:animate-pulse transition-all duration-300" />
                </div>
                <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-black/80 text-white border-0">
              Trash
            </TooltipContent>
          </Tooltip>

          {/* Trash Finder Window */}
          {isTrashOpen && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
              <div className="bg-gray-800 h-6 flex items-center px-2 border-b border-white/10">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <div className="text-white text-xs mx-auto">Trash</div>
              </div>
              <div className="p-4 text-white text-sm">
                <div className="flex items-center mb-2">
                  <Folder className="w-4 h-4 text-blue-400 mr-2" />
                  <span>Trash</span>
                </div>
                <div className="text-center mt-10 text-gray-400 text-xs">
                  The trash is empty
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MacDock;
