
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
        return 'bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      case 'safari':
        return 'bg-[#E8E8E8] dark:bg-[#38383A] text-gray-700 dark:text-gray-300';
      case 'itunes':
        return 'bg-gradient-to-b from-gray-600 to-gray-800 text-white';
      case 'textpad':
        return 'bg-[#1C1C1E] text-gray-400';
      default:
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={cn(
        'h-8 flex items-center px-3 border-b border-gray-300/30 dark:border-gray-700/30',
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
