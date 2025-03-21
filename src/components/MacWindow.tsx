
import React, { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import WindowTitleBar from './window/WindowTitleBar';
import WindowResizeHandle from './window/WindowResizeHandle';
import { getWindowStyle, getNextZIndex } from './window/windowUtils';

export interface MacWindowProps {
  title: string;
  className?: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  children: ReactNode;
  windowType?: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad';
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
  const [zIndex, setZIndex] = useState(getNextZIndex());
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    bringToFront();
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
    bringToFront();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // Method to bring window to front
  const bringToFront = () => {
    const newZIndex = getNextZIndex();
    setZIndex(newZIndex);
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
        'fixed overflow-hidden shadow-2xl border border-gray-500/20 backdrop-blur-md rounded-lg',
        getWindowStyle(windowType),
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? '32px' : `${size.height}px`,
        transition: isMinimized ? 'height 0.2s ease-in-out' : 'none',
        zIndex: zIndex,
      }}
      onClick={bringToFront}
    >
      <WindowTitleBar
        title={title}
        windowType={windowType}
        onMouseDown={handleMouseDown}
        onClose={onClose}
        onMinimize={toggleMinimize}
        customControls={customControls}
      />

      {!isMinimized && (
        <>
          <div className="h-[calc(100%-32px)]">
            {children}
          </div>
          
          {resizable && <WindowResizeHandle onResizeStart={handleResizeStart} />}
        </>
      )}
    </div>
  );
};

export default MacWindow;
