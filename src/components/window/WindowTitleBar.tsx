
import React from 'react';
import { cn } from '@/lib/utils';
import WindowControls from './WindowControls';

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
  const getTitleBarStyle = () => {
    switch (windowType) {
      case 'terminal':
        return 'bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      case 'safari':
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      case 'itunes':
        return 'bg-gradient-to-b from-gray-700 to-gray-800 text-white';
      case 'textpad':
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={cn(
        'h-8 flex items-center px-3',
        getTitleBarStyle()
      )}
      onMouseDown={onMouseDown}
    >
      <WindowControls onClose={onClose} onMinimize={onMinimize} />
      <div className="text-center flex-1 text-xs font-medium">
        {title}
      </div>
      {customControls}
    </div>
  );
};

export default WindowTitleBar;
