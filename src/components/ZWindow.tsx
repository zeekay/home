
import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import WindowTitleBar from './window/WindowTitleBar';
import WindowResizeHandle from './window/WindowResizeHandle';
import { getWindowStyle, getNextZIndex, getResponsiveWindowSize, getResponsiveWindowPosition } from './window/windowUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ANIMATION_DURATIONS } from '@/utils/animationConstants';

export interface ZWindowProps {
  title: string;
  className?: string;
  onClose: () => void;
  onFocus?: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  /** @deprecated Use initialSize.width */
  defaultWidth?: number;
  /** @deprecated Use initialSize.height */
  defaultHeight?: number;
  /** @deprecated Use initialSize */
  minWidth?: number;
  /** @deprecated Use initialSize */
  minHeight?: number;
  /** @deprecated Use initialPosition */
  defaultPosition?: { x: number; y: number };
  children: ReactNode;
  windowType?: 'default' | 'terminal' | 'safari' | 'itunes' | 'textpad' | 'system' | 'about';
  resizable?: boolean;
  customControls?: ReactNode;
}

const ZWindow: React.FC<ZWindowProps> = ({
  title,
  className,
  onClose,
  onFocus,
  initialPosition,
  initialSize,
  defaultWidth,
  defaultHeight,
  defaultPosition,
  children,
  windowType = 'default',
  resizable = true,
  customControls,
}) => {
  // Support both naming conventions
  const effectivePosition = initialPosition ?? defaultPosition ?? { x: 100, y: 100 };
  const effectiveSize = initialSize ?? {
    width: defaultWidth ?? 700,
    height: defaultHeight ?? 500
  };
  const isMobile = useIsMobile();

  // Window animation state
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Get responsive size and position
  const responsiveSize = getResponsiveWindowSize(effectiveSize);
  const responsivePosition = getResponsiveWindowPosition(effectivePosition);
  
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

  // Ref for minimize animation timer
  const minimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMinimize = useCallback(() => {
    if (isMinimizing || isRestoring) return; // Prevent double-click during animation

    if (isMinimized) {
      // Restore from minimized
      setIsRestoring(true);
      setIsMinimized(false);

      minimizeTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsRestoring(false);
        }
      }, ANIMATION_DURATIONS.WINDOW_MINIMIZE);
    } else {
      // Minimize
      setIsMinimizing(true);

      minimizeTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsMinimized(true);
          setIsMinimizing(false);
        }
      }, ANIMATION_DURATIONS.WINDOW_MINIMIZE);
    }
  }, [isMinimized, isMinimizing, isRestoring]);

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

  // For touch events on mobile - bring to front on interaction
  useEffect(() => {
    if (isMobile) {
      bringToFront();
    }
  }, [isMobile, bringToFront]);

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (minimizeTimerRef.current) {
        clearTimeout(minimizeTimerRef.current);
      }
    };
  }, []);

  // Handle close with animation
  const handleClose = useCallback(() => {
    if (isClosing) return; // Prevent double-close
    setIsClosing(true);

    // Wait for animation to complete before calling onClose
    closeTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        onClose();
      }
    }, ANIMATION_DURATIONS.WINDOW_CLOSE);
  }, [onClose, isClosing]);

  // Generate unique ID for ARIA labelling
  const windowId = `window-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${windowId}-title`}
      aria-describedby={`${windowId}-content`}
      className={cn(
        'fixed overflow-hidden glass-window',
        getWindowStyle(windowType),
        isMobile ? 'transition-all duration-300' : '',
        // Opening animation (only when not in any other animation state)
        !isClosing && !isMinimizing && !isRestoring && !isMinimized && 'animate-window-open',
        // Closing animation
        isClosing && 'animate-window-close',
        // Minimize animation
        isMinimizing && 'animate-window-minimize',
        // Restore animation
        isRestoring && 'animate-window-restore',
        // Hidden when minimized (after animation completes)
        isMinimized && !isRestoring && 'invisible',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: (isMaximized || preMaximizeState)
          ? 'all 0.2s ease-in-out'
          : 'opacity 0.2s ease-in-out',
        zIndex: zIndex,
      }}
      onClick={bringToFront}
    >
      <WindowTitleBar
        title={title}
        titleId={`${windowId}-title`}
        windowType={windowType}
        onMouseDown={handleMouseDown}
        onClose={handleClose}
        onMinimize={toggleMinimize}
        onMaximize={toggleMaximize}
        isMaximized={isMaximized}
        customControls={customControls}
      />

      <div id={`${windowId}-content`} className="h-[calc(100%-32px)] flex flex-col">
        {children}
      </div>

      {resizable && !isMobile && !isMaximized && <WindowResizeHandle onResizeStart={handleResizeStart} />}
    </div>
  );
};

export default ZWindow;
