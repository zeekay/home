
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import WindowTitleBar from './window/WindowTitleBar';
import WindowResizeHandle from './window/WindowResizeHandle';
import { getWindowStyle, getNextZIndex, getResponsiveWindowSize, getResponsiveWindowPosition } from './window/windowUtils';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ZWindowProps {
  title: string;
  className?: string;
  onClose: () => void;
  onFocus?: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  children: ReactNode;
  windowType?: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad';
  resizable?: boolean;
  customControls?: ReactNode;
}

const ZWindow: React.FC<ZWindowProps> = ({
  title,
  className,
  onClose,
  onFocus,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 700, height: 500 },
  children,
  windowType = 'default',
  resizable = true,
  customControls,
}) => {
  const isMobile = useIsMobile();

  // Window animation state
  const [isClosing, setIsClosing] = useState(false);

  // Get responsive size and position
  const responsiveSize = getResponsiveWindowSize(initialSize);
  const responsivePosition = getResponsiveWindowPosition(initialPosition);
  
  const [position, setPosition] = useState(responsivePosition);
  const [size, setSize] = useState(responsiveSize);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState<{ position: { x: number; y: number }; size: { width: number; height: number } } | null>(null);
  const [zIndex, setZIndex] = useState(getNextZIndex());
  
  // Update position and size when screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Update window size based on screen size
      setSize(prevSize => {
        const newSize = getResponsiveWindowSize({
          width: prevSize.width,
          height: prevSize.height
        });
        return newSize;
      });
      
      // Make sure window is still visible after resize
      setPosition(prevPos => {
        const newPos = {
          x: Math.min(Math.max(10, prevPos.x), window.innerWidth - 350),
          y: Math.min(Math.max(10, prevPos.y), window.innerHeight - 400)
        };
        return newPos;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable dragging on mobile
    if (isMaximized) return; // Disable dragging when maximized

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    bringToFront();
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable resizing on mobile
    
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

  const toggleMaximize = () => {
    if (isMobile) return; // Disable maximize on mobile

    if (isMaximized) {
      // Restore to previous size and position
      if (preMaximizeState) {
        setPosition(preMaximizeState.position);
        setSize(preMaximizeState.size);
      }
      setIsMaximized(false);
    } else {
      // Save current state and maximize
      setPreMaximizeState({ position, size });
      setPosition({ x: 0, y: 28 }); // 28px for menu bar
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 28 - 80 // 28 for menu bar, 80 for dock
      });
      setIsMaximized(true);
    }
  };

  // Method to bring window to front
  const bringToFront = useCallback(() => {
    const newZIndex = getNextZIndex();
    setZIndex(newZIndex);
    onFocus?.();
  }, [onFocus]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width/2)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50)),
        });
      } else if (isResizing) {
        const newWidth = Math.max(300, startSize.width + (e.clientX - resizeStartPos.x));
        const newHeight = Math.max(200, startSize.height + (e.clientY - resizeStartPos.y));
        setSize({ 
          width: Math.min(newWidth, window.innerWidth - position.x - 10), 
          height: Math.min(newHeight, window.innerHeight - position.y - 10) 
        });
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
  }, [isDragging, isResizing, dragOffset, resizeStartPos, startSize, position.x, position.y, size.width]);

  // For touch events on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = () => {
      bringToFront();
    };

    return () => {
      // Cleanup if needed
    };
  }, [isMobile, bringToFront]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 200); // Match animation duration
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed overflow-hidden glass-window',
        getWindowStyle(windowType),
        isMobile ? 'transition-all duration-300' : '',
        !isClosing && 'animate-window-open',
        isClosing && 'animate-window-close',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: isMinimized ? '32px' : `${size.height}px`,
        transition: (isMinimized || isMaximized || preMaximizeState)
          ? 'all 0.2s ease-in-out'
          : 'opacity 0.2s ease-in-out',
        zIndex: zIndex,
      }}
      onClick={bringToFront}
    >
      <WindowTitleBar
        title={title}
        windowType={windowType}
        onMouseDown={handleMouseDown}
        onClose={handleClose}
        onMinimize={toggleMinimize}
        onMaximize={toggleMaximize}
        isMaximized={isMaximized}
        customControls={customControls}
      />

      {!isMinimized && (
        <>
          <div className="h-[calc(100%-32px)] flex flex-col">
            {children}
          </div>
          
          {resizable && !isMobile && !isMaximized && <WindowResizeHandle onResizeStart={handleResizeStart} />}
        </>
      )}
    </div>
  );
};

export default ZWindow;
