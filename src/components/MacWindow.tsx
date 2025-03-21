import React, { useState, useEffect, ReactNode } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MacWindowProps {
  title: string;
  className?: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  children: ReactNode;
  windowType?: 'default' | 'terminal' | 'safari' | 'itunes';
  resizable?: boolean;
  customControls?: ReactNode;
}

const MacWindow: React.FC<MacWindowProps> = ({
  title,
  className,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 700, height: 500 },
  children,
  windowType = 'default',
  resizable = true,
  customControls,
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  
  const getWindowStyle = () => {
    switch (windowType) {
      case 'terminal':
        return 'bg-[#262a33] text-white';
      case 'safari':
        return 'bg-white/90 dark:bg-gray-800/90';
      case 'itunes':
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800';
      default:
        return 'bg-white/90 dark:bg-gray-800/90';
    }
  };
  
  const getTitleBarStyle = () => {
    switch (windowType) {
      case 'terminal':
        return 'bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      case 'safari':
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
      case 'itunes':
        return 'bg-gradient-to-b from-gray-700 to-gray-800 text-white';
      default:
        return 'bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y),
        });
      } else if (isResizing) {
        const newWidth = Math.max(300, startSize.width + (e.clientX - resizeStartPos.x));
        const newHeight = Math.max(200, startSize.height + (e.clientY - resizeStartPos.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStartPos, startSize]);

  return (
    <div
      className={cn(
        'fixed z-40 rounded-lg overflow-hidden shadow-2xl border border-gray-500/20 backdrop-blur-md',
        getWindowStyle(),
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? '32px' : `${size.height}px`,
        transition: isMinimized ? 'height 0.2s ease-in-out' : 'none',
      }}
    >
      <div
        className={cn(
          'h-8 flex items-center px-3',
          getTitleBarStyle()
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2 items-center">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
            title="Close"
          >
            <X className="w-2 h-2 text-red-800 opacity-0 hover:opacity-100" />
          </button>
          <button 
            onClick={toggleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center"
            title="Minimize"
          >
            <Minus className="w-2 h-2 text-yellow-800 opacity-0 hover:opacity-100" />
          </button>
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center">
            <Square className="w-2 h-2 text-green-800 opacity-0 hover:opacity-100" />
          </div>
        </div>
        <div className="text-center flex-1 text-xs font-medium">
          {title}
        </div>
        {customControls}
      </div>

      {!isMinimized && (
        <>
          <div className="h-[calc(100%-32px)]">
            {children}
          </div>
          
          {resizable && (
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={handleResizeStart}
            >
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-transparent border-b-[6px] border-b-gray-400 border-r-[6px] border-r-gray-400 absolute bottom-1 right-1" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MacWindow;
