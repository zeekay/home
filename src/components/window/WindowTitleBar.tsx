
import React from 'react';
import { cn } from '@/lib/utils';
import WindowControls from './WindowControls';
import { useIsMobile } from '@/hooks/use-mobile';

interface WindowTitleBarProps {
  title: string;
  windowType: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad';
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onMinimize: () => void;
  customControls?: React.ReactNode;
}

const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
  title,
  windowType,
  onMouseDown,
  onClose,
  onMinimize,
  customControls
}) => {
  const isMobile = useIsMobile();
  
  const getTitleBarStyle = () => {
    switch (windowType) {
      case 'terminal':
        return 'bg-black text-gray-300';
      case 'safari':
        return 'bg-black text-gray-300';
      case 'itunes':
        return 'bg-black text-white';
      case 'textpad':
        return 'bg-black text-gray-300'; 
      default:
        return 'bg-black text-gray-300';
    }
  };

  return (
    <div
      className={cn(
        'h-8 flex items-center px-3 border-b border-white/10',
        getTitleBarStyle(),
        isMobile ? 'cursor-default' : 'cursor-move'
      )}
      onMouseDown={onMouseDown}
    >
      <WindowControls onClose={onClose} onMinimize={onMinimize} />
      <div className="text-center flex-1 text-xs font-medium select-none">
        {title}
      </div>
      {customControls}
    </div>
  );
};

export default WindowTitleBar;
