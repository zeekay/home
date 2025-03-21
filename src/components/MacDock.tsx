
import React from 'react';
import { cn } from '@/lib/utils';
import { Terminal, Folder, Mail, Globe, Image, Music, Video, Settings, Calendar } from 'lucide-react';

interface MacDockProps {
  className?: string;
  onTerminalClick: () => void;
  onSafariClick: () => void;
  onITunesClick: () => void;
  onSystemPreferencesClick?: () => void;
}

const MacDock: React.FC<MacDockProps> = ({ 
  className, 
  onTerminalClick, 
  onSafariClick, 
  onITunesClick,
  onSystemPreferencesClick
}) => {
  const dockItems = [
    { icon: Folder, label: 'Finder' },
    { icon: Globe, label: 'Safari', onClick: onSafariClick },
    { icon: Terminal, label: 'Terminal', onClick: onTerminalClick },
    { icon: Music, label: 'iTunes', onClick: onITunesClick },
    { icon: Mail, label: 'Mail' },
    { icon: Image, label: 'Photos' },
    { icon: Video, label: 'Videos' },
    { icon: Calendar, label: 'Calendar' },
    { icon: Settings, label: 'System Preferences', onClick: onSystemPreferencesClick },
  ];

  return (
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
          <button
            key={index}
            className="group relative flex flex-col items-center justify-center"
            onClick={item.onClick}
          >
            <span className="absolute -top-8 text-xs px-2 py-1 bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-200 hover:scale-110 shadow-md group-hover:shadow-lg">
              <item.icon className="w-6 h-6 text-gray-700" />
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-500 mt-1 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MacDock;
