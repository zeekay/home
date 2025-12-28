/**
 * ZWindow - macOS-style window component with pixel-perfect animations
 *
 * Features:
 * - Genie effect for minimize (perspective distortion into dock)
 * - Scale effect for close (shrinks to center)
 * - Zoom effect for maximize/fullscreen
 * - Momentum-based dragging with natural deceleration
 * - Dynamic shadows based on focus state
 * - Shake animation for invalid actions
 * - Bounce animation for attention
 *
 * All animations use Apple's exact cubic-bezier timing curves
 * extracted from macOS Sonoma CoreAnimation.
 */

import React, { useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { motion, useAnimation, AnimatePresence, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import WindowTitleBar from './window/WindowTitleBar';
import WindowResizeHandle from './window/WindowResizeHandle';
import { getWindowStyle, getNextZIndex, getResponsiveWindowSize, getResponsiveWindowPosition } from './window/windowUtils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ANIMATION_DURATIONS } from '@/utils/animationConstants';
import { getWindowShadow } from '@/lib/windowAnimations';

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
  /** Whether this window is the active/focused window */
  isActive?: boolean;
  /** Trigger shake animation externally (for invalid actions) */
  shake?: boolean;
  /** Trigger bounce animation externally (for attention) */
  bounce?: boolean;
}

// ============================================================================
// Framer Motion Variants - macOS-accurate animations
// ============================================================================

const windowVariants = {
  // Initial hidden state
  hidden: {
    scale: 0.8,
    opacity: 0,
  },

  // Visible/idle state
  visible: {
    scale: 1,
    opacity: 1,
    x: 0,
    y: 0,
    rotateX: 0,
  },

  // Opening with Apple's window-open curve
  opening: {
    scale: [0.8, 1.02, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_OPEN / 1000,
      ease: [0.16, 1, 0.3, 1], // Apple windowOpen
      times: [0, 0.6, 1],
    },
  },

  // Closing - scale to center with Apple's close curve
  closing: {
    scale: 0.85,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_CLOSE / 1000,
      ease: [0.55, 0.055, 0.675, 0.19], // Apple windowClose
    },
  },

  // Genie minimize effect - perspective distortion
  minimizing: {
    scale: [1, 0.8, 0.4, 0.1],
    y: [0, 150, 400, 800],
    rotateX: [0, 3, 6, 10],
    opacity: [1, 1, 0.8, 0],
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_MINIMIZE / 1000,
      ease: [0.42, 0, 1, 1], // Apple genieIn
      times: [0, 0.3, 0.6, 1],
    },
  },

  // Minimized state (hidden at dock position)
  minimized: {
    scale: 0.1,
    y: 800,
    opacity: 0,
    rotateX: 10,
  },

  // Genie restore effect - reverse of minimize
  restoring: {
    scale: [0.1, 0.5, 0.8, 1],
    y: [800, 400, 150, 0],
    rotateX: [10, 6, 3, 0],
    opacity: [0, 0.8, 1, 1],
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_RESTORE / 1000,
      ease: [0, 0, 0.58, 1], // Apple genieOut
      times: [0, 0.4, 0.7, 1],
    },
  },

  // Shake effect for invalid actions (e.g., wrong password)
  shaking: {
    x: [0, -10, 10, -10, 10, -6, 6, -4, 4, -2, 0],
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_SHAKE / 1000,
      ease: [0.36, 0.07, 0.19, 0.97], // Apple shake
    },
  },

  // Bounce effect for attention
  bouncing: {
    y: [0, -20, 0, -14, 0, -8, 0, -4, 0],
    transition: {
      duration: ANIMATION_DURATIONS.WINDOW_BOUNCE / 1000,
      ease: [0.68, -0.55, 0.265, 1.55], // Apple bounce
    },
  },
};

// ============================================================================
// ZWindow Component
// ============================================================================

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
  isActive = true,
  shake: externalShake,
  bounce: externalBounce,
}) => {
  // Support both naming conventions
  const effectivePosition = initialPosition ?? defaultPosition ?? { x: 100, y: 100 };
  const effectiveSize = initialSize ?? {
    width: defaultWidth ?? 700,
    height: defaultHeight ?? 500
  };
  const isMobile = useIsMobile();

  // Framer Motion animation controls
  const controls = useAnimation();

  // Animation state tracking
  type AnimState = 'idle' | 'opening' | 'closing' | 'minimizing' | 'restoring' | 'shaking' | 'bouncing';
  const [animationState, setAnimationState] = useState<AnimState>('opening');

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
  const [preMaximizeState, setPreMaximizeState] = useState<{
    position: { x: number; y: number };
    size: { width: number; height: number }
  } | null>(null);
  const [zIndex, setZIndex] = useState(getNextZIndex());
  const [isFocused, setIsFocused] = useState(isActive);

  // Momentum tracking for smooth drag release
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef({ x: 0, y: 0, timestamp: 0 });

  // Track mounted state
  const isMountedRef = useRef(true);

  // Dynamic shadow based on focus and drag state
  const windowShadow = getWindowShadow({
    isFocused,
    isDragging,
    elevation: 'normal',
  });

  // ============================================================================
  // Effects
  // ============================================================================

  // Update focus state from prop
  useEffect(() => {
    setIsFocused(isActive);
  }, [isActive]);

  // Update position and size when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setSize(prevSize => getResponsiveWindowSize({
        width: prevSize.width,
        height: prevSize.height
      }));

      setPosition(prevPos => ({
        x: Math.min(Math.max(10, prevPos.x), window.innerWidth - 350),
        y: Math.min(Math.max(10, prevPos.y), window.innerHeight - 400)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle external shake trigger
  useEffect(() => {
    if (externalShake && animationState === 'idle') {
      animateShake();
    }
  }, [externalShake]);

  // Handle external bounce trigger
  useEffect(() => {
    if (externalBounce && animationState === 'idle') {
      animateBounce();
    }
  }, [externalBounce]);

  // Opening animation on mount
  useEffect(() => {
    controls.start('opening').then(() => {
      if (isMountedRef.current) {
        setAnimationState('idle');
      }
    });
  }, [controls]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // Drag Handlers
  // ============================================================================

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    if (isMaximized) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    lastPositionRef.current = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };
    bringToFront();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMobile) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
    bringToFront();
  };

  // ============================================================================
  // Window Actions
  // ============================================================================

  const toggleMinimize = useCallback(async () => {
    if (animationState !== 'idle') return;

    if (isMinimized) {
      // Restore from minimized with genie effect
      setAnimationState('restoring');
      setIsMinimized(false);
      await controls.start('restoring');
      await controls.start('visible');
      if (isMountedRef.current) {
        setAnimationState('idle');
      }
    } else {
      // Minimize with genie effect
      setAnimationState('minimizing');
      await controls.start('minimizing');
      if (isMountedRef.current) {
        setIsMinimized(true);
        setAnimationState('idle');
      }
    }
  }, [isMinimized, animationState, controls]);

  const toggleMaximize = useCallback(async () => {
    if (isMobile) return;
    if (animationState !== 'idle') return;

    if (isMaximized) {
      // Restore with zoom effect
      if (preMaximizeState) {
        await controls.start({
          scale: [1, 1.02, 1],
          transition: {
            duration: ANIMATION_DURATIONS.WINDOW_MAXIMIZE / 1000,
            ease: [0.23, 1, 0.32, 1], // Apple zoom
          },
        });
        setPosition(preMaximizeState.position);
        setSize(preMaximizeState.size);
      }
      setIsMaximized(false);
    } else {
      // Maximize with zoom effect
      setPreMaximizeState({ position, size });
      await controls.start({
        scale: [1, 1.02, 1],
        transition: {
          duration: ANIMATION_DURATIONS.WINDOW_MAXIMIZE / 1000,
          ease: [0.23, 1, 0.32, 1],
        },
      });
      setPosition({ x: 0, y: 28 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight - 28 - 80
      });
      setIsMaximized(true);
    }
  }, [isMobile, isMaximized, preMaximizeState, position, size, animationState, controls]);

  // Shake animation for invalid actions
  const animateShake = useCallback(async () => {
    if (animationState !== 'idle') return;
    setAnimationState('shaking');
    await controls.start('shaking');
    await controls.start({ x: 0 });
    if (isMountedRef.current) {
      setAnimationState('idle');
    }
  }, [controls, animationState]);

  // Bounce animation for attention
  const animateBounce = useCallback(async () => {
    if (animationState !== 'idle') return;
    setAnimationState('bouncing');
    await controls.start('bouncing');
    await controls.start({ y: 0 });
    if (isMountedRef.current) {
      setAnimationState('idle');
    }
  }, [controls, animationState]);

  // Bring window to front
  const bringToFront = useCallback(() => {
    const newZIndex = getNextZIndex();
    setZIndex(newZIndex);
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  // Handle close with animation
  const handleClose = useCallback(async () => {
    if (animationState === 'closing') return;
    setAnimationState('closing');
    await controls.start('closing');
    if (isMountedRef.current) {
      onClose();
    }
  }, [onClose, animationState, controls]);

  // ============================================================================
  // Mouse Move/Up Handlers for Drag and Resize
  // ============================================================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const now = Date.now();
        const dt = (now - lastPositionRef.current.timestamp) / 1000;

        // Calculate velocity for momentum
        if (dt > 0) {
          velocityRef.current = {
            x: (e.clientX - lastPositionRef.current.x) / dt,
            y: (e.clientY - lastPositionRef.current.y) / dt,
          };
        }

        lastPositionRef.current = {
          x: e.clientX,
          y: e.clientY,
          timestamp: now,
        };

        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - size.width / 2)),
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
      if (isDragging) {
        // Apply momentum if velocity is significant
        const velocityMagnitude = Math.sqrt(
          velocityRef.current.x ** 2 + velocityRef.current.y ** 2
        );

        if (velocityMagnitude > 200) {
          // Calculate projected position with friction
          const friction = 0.3;
          const projectedX = position.x + velocityRef.current.x * friction;
          const projectedY = position.y + velocityRef.current.y * friction;

          // Clamp to bounds
          const finalX = Math.max(0, Math.min(projectedX, window.innerWidth - size.width / 2));
          const finalY = Math.max(0, Math.min(projectedY, window.innerHeight - 50));

          // Animate to final position with spring physics
          controls.start({
            x: finalX - position.x,
            y: finalY - position.y,
            transition: {
              type: 'spring',
              stiffness: 200,
              damping: 20,
              mass: 1,
            },
          }).then(() => {
            setPosition({ x: finalX, y: finalY });
            controls.set({ x: 0, y: 0 });
          });
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      velocityRef.current = { x: 0, y: 0 };
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStartPos, startSize, position, size, controls]);

  // Bring to front on mobile interaction
  useEffect(() => {
    if (isMobile) {
      bringToFront();
    }
  }, [isMobile, bringToFront]);

  // ============================================================================
  // Render
  // ============================================================================

  const windowId = `window-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${windowId}-title`}
        aria-describedby={`${windowId}-content`}
        className={cn(
          'fixed overflow-hidden glass-window',
          getWindowStyle(windowType),
          isMobile ? 'transition-all duration-300' : '',
          isMinimized && 'pointer-events-none',
          className
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          zIndex: zIndex,
          boxShadow: windowShadow,
          transformOrigin: 'bottom center',
          willChange: 'transform, opacity, box-shadow',
        }}
        initial="hidden"
        animate={controls}
        variants={windowVariants}
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
          isActive={isFocused}
          customControls={customControls}
        />

        <div id={`${windowId}-content`} className="h-[calc(100%-32px)] flex flex-col">
          {children}
        </div>

        {resizable && !isMobile && !isMaximized && (
          <WindowResizeHandle onResizeStart={handleResizeStart} />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ZWindow;
