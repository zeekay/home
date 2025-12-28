
import React from 'react';
import { cn } from '@/lib/utils';
import WindowControls from './WindowControls';
import { useIsMobile } from '@/hooks/use-mobile';

interface WindowTitleBarProps {
  title: string;
  titleId?: string;
  windowType: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad' | 'system' | 'about';
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  isActive?: boolean;
  customControls?: React.ReactNode;
}

const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
  title,
  titleId,
  windowType,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
  isActive = true,
  customControls
}) => {
  const isMobile = useIsMobile();

  const getTitleBarStyle = () => {
    switch (windowType) {
      case 'terminal':
        return 'bg-black text-gray-500'; // Pure black like iTerm2
      case 'safari':
        return 'vibrancy-titlebar text-gray-300';
      case 'itunes':
        return 'vibrancy-titlebar text-white';
      case 'textpad':
        return 'vibrancy-titlebar text-gray-300';
      default:
        return 'vibrancy-titlebar text-gray-300';
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
      data-window-titlebar
      className={cn(
        'h-8 flex items-center',
        getBorderStyle(),
        getTitleBarStyle()
      )}
      style={{
        paddingLeft: '12px', // Exact 12px from window edge for traffic lights
        paddingRight: '12px',
      }}
      onMouseDown={onMouseDown}
    >
      <WindowControls
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        isMaximized={isMaximized}
        isActive={isActive}
      />
      {showTitle && (
        <div id={titleId} className="text-center flex-1 text-xs font-medium select-none">
          {title}
        </div>
      )}
      {!showTitle && <div className="flex-1" />}
      {customControls}
    </div>
  );
};

export default WindowTitleBar;
