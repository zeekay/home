
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
        return 'bg-black text-gray-500'; // Pure black like iTerm2
      case 'safari':
        return 'glass-titlebar text-gray-300';
      case 'itunes':
        return 'glass-titlebar text-white';
      case 'textpad':
        return 'glass-titlebar text-gray-300';
      default:
        return 'glass-titlebar text-gray-300';
    }
  };

  // Terminal has no visible title, cleaner border
  const getBorderStyle = () => {
    if (windowType === 'terminal') {
      return 'border-b border-gray-800';
    }
    return 'border-b border-white/10';
  };

  // For terminal, hide the title text
  const showTitle = windowType !== 'terminal';

  return (
    <div
      className={cn(
        'h-8 flex items-center px-3',
        getBorderStyle(),
        getTitleBarStyle(),
        isMobile ? 'cursor-default' : 'cursor-move'
      )}
      onMouseDown={onMouseDown}
    >
      <WindowControls onClose={onClose} onMinimize={onMinimize} />
      {showTitle && (
        <div className="text-center flex-1 text-xs font-medium select-none">
          {title}
        </div>
      )}
      {!showTitle && <div className="flex-1" />}
      {customControls}
    </div>
  );
};

export default WindowTitleBar;
