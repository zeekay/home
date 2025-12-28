/**
 * useWindowAnimations - React hook for macOS-style window animations
 *
 * Provides Framer Motion integration for pixel-perfect macOS animations:
 * - Genie effect minimize
 * - Scale effect close
 * - Zoom maximize
 * - Momentum dragging
 * - Dynamic shadows
 * - Shake/bounce feedback
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useAnimation, type AnimationControls } from 'framer-motion';
import {
  AppleEasing,
  AppleSprings,
  AppleDurations,
  getWindowShadow,
  calculateVelocity,
  calculateMomentumTarget,
  type WindowAnimationState,
} from '@/lib/windowAnimations';

// ============================================================================
// Types
// ============================================================================

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DockTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseWindowAnimationsConfig {
  /** Initial window bounds */
  initialBounds: WindowBounds;
  /** Dock icon position for genie effect */
  dockTarget?: DockTarget;
  /** Is window focused */
  isFocused?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: (state: WindowAnimationState) => void;
}

export interface UseWindowAnimationsReturn {
  /** Current animation state */
  animationState: WindowAnimationState;

  /** Framer Motion animation controls */
  controls: AnimationControls;

  /** Current shadow style */
  shadow: string;

  /** Animation variants for Framer Motion */
  variants: typeof windowVariants;

  /** Trigger open animation */
  animateOpen: () => Promise<void>;

  /** Trigger close animation */
  animateClose: () => Promise<void>;

  /** Trigger genie minimize */
  animateMinimize: () => Promise<void>;

  /** Trigger restore from minimize */
  animateRestore: () => Promise<void>;

  /** Trigger maximize/zoom */
  animateMaximize: (targetBounds: WindowBounds) => Promise<void>;

  /** Trigger unmaximize/restore */
  animateUnmaximize: (targetBounds: WindowBounds) => Promise<void>;

  /** Trigger shake animation */
  animateShake: () => Promise<void>;

  /** Trigger bounce animation */
  animateBounce: () => Promise<void>;

  /** Drag handlers with momentum */
  dragHandlers: {
    onDragStart: () => void;
    onDrag: (event: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => void;
    onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: { velocity: { x: number; y: number } }) => void;
  };

  /** Is currently dragging */
  isDragging: boolean;
}

// ============================================================================
// Framer Motion Variants
// ============================================================================

const windowVariants = {
  // Initial/idle state
  idle: {
    scale: 1,
    opacity: 1,
    x: 0,
    y: 0,
    rotateX: 0,
    perspective: 1000,
  },

  // Opening animation
  opening: {
    scale: [0.8, 1.02, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: AppleDurations.windowOpen / 1000,
      ease: [0.16, 1, 0.3, 1],
      times: [0, 0.6, 1],
    },
  },

  // Closing animation (scale to center)
  closing: {
    scale: 0.85,
    opacity: 0,
    transition: {
      duration: AppleDurations.windowClose / 1000,
      ease: [0.55, 0.055, 0.675, 0.19],
    },
  },

  // Genie minimize effect
  minimizing: {
    scale: [1, 0.8, 0.4, 0.1],
    y: ['0%', '30%', '60%', '100%'],
    rotateX: [0, 3, 6, 10],
    opacity: [1, 1, 0.8, 0],
    transformOrigin: 'bottom center',
    transition: {
      duration: AppleDurations.windowMinimize / 1000,
      ease: [0.42, 0, 1, 1],
      times: [0, 0.3, 0.6, 1],
    },
  },

  // Minimized state (hidden)
  minimized: {
    scale: 0.1,
    y: '100%',
    opacity: 0,
    rotateX: 10,
  },

  // Restore from minimize
  restoring: {
    scale: [0.1, 0.5, 0.8, 1],
    y: ['100%', '60%', '30%', '0%'],
    rotateX: [10, 6, 3, 0],
    opacity: [0, 0.8, 1, 1],
    transformOrigin: 'bottom center',
    transition: {
      duration: AppleDurations.windowRestore / 1000,
      ease: [0, 0, 0.58, 1],
      times: [0, 0.4, 0.7, 1],
    },
  },

  // Shake effect
  shaking: {
    x: [0, -10, 10, -10, 10, -6, 6, -4, 4, -2, 0],
    transition: {
      duration: AppleDurations.shake / 1000,
      ease: [0.36, 0.07, 0.19, 0.97],
    },
  },

  // Bounce effect
  bouncing: {
    y: [0, -20, 0, -14, 0, -8, 0, -4, 0],
    transition: {
      duration: AppleDurations.bounce / 1000,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useWindowAnimations(config: UseWindowAnimationsConfig): UseWindowAnimationsReturn {
  const {
    initialBounds,
    dockTarget,
    isFocused = true,
    onAnimationComplete,
  } = config;

  // Animation state
  const [animationState, setAnimationState] = useState<WindowAnimationState>('idle');
  const [isDragging, setIsDragging] = useState(false);

  // Framer Motion controls
  const controls = useAnimation();

  // Drag tracking for momentum
  const dragRef = useRef({
    startPosition: { x: 0, y: 0 },
    lastPosition: { x: 0, y: 0, timestamp: 0 },
    velocity: { x: 0, y: 0 },
  });

  // Bounds ref for animations
  const boundsRef = useRef(initialBounds);

  // Calculate dynamic shadow
  const shadow = useMemo(() => {
    return getWindowShadow({
      isFocused,
      isDragging,
      elevation: 'normal',
    });
  }, [isFocused, isDragging]);

  // Animation handlers
  const animateOpen = useCallback(async () => {
    setAnimationState('opening');
    await controls.start('opening');
    setAnimationState('idle');
    onAnimationComplete?.('opening');
  }, [controls, onAnimationComplete]);

  const animateClose = useCallback(async () => {
    setAnimationState('closing');
    await controls.start('closing');
    onAnimationComplete?.('closing');
  }, [controls, onAnimationComplete]);

  const animateMinimize = useCallback(async () => {
    setAnimationState('minimizing');
    await controls.start('minimizing');
    setAnimationState('idle');
    onAnimationComplete?.('minimizing');
  }, [controls, onAnimationComplete]);

  const animateRestore = useCallback(async () => {
    setAnimationState('restoring');
    await controls.start('restoring');
    await controls.start('idle');
    setAnimationState('idle');
    onAnimationComplete?.('restoring');
  }, [controls, onAnimationComplete]);

  const animateMaximize = useCallback(async (targetBounds: WindowBounds) => {
    setAnimationState('maximizing');

    // Store current bounds for restore
    boundsRef.current = targetBounds;

    await controls.start({
      x: targetBounds.x - initialBounds.x,
      y: targetBounds.y - initialBounds.y,
      width: targetBounds.width,
      height: targetBounds.height,
      scale: [1, 1.01, 1],
      transition: {
        duration: AppleDurations.windowMaximize / 1000,
        ease: [0.23, 1, 0.32, 1],
      },
    });

    setAnimationState('idle');
    onAnimationComplete?.('maximizing');
  }, [controls, initialBounds, onAnimationComplete]);

  const animateUnmaximize = useCallback(async (targetBounds: WindowBounds) => {
    setAnimationState('unmaximizing');

    await controls.start({
      x: targetBounds.x - boundsRef.current.x,
      y: targetBounds.y - boundsRef.current.y,
      width: targetBounds.width,
      height: targetBounds.height,
      transition: {
        duration: AppleDurations.windowRestore / 1000,
        ease: [0.23, 1, 0.32, 1],
      },
    });

    boundsRef.current = targetBounds;
    setAnimationState('idle');
    onAnimationComplete?.('unmaximizing');
  }, [controls, onAnimationComplete]);

  const animateShake = useCallback(async () => {
    setAnimationState('shaking');
    await controls.start('shaking');
    await controls.start('idle');
    setAnimationState('idle');
    onAnimationComplete?.('shaking');
  }, [controls, onAnimationComplete]);

  const animateBounce = useCallback(async () => {
    setAnimationState('bouncing');
    await controls.start('bouncing');
    await controls.start('idle');
    setAnimationState('idle');
    onAnimationComplete?.('bouncing');
  }, [controls, onAnimationComplete]);

  // Drag handlers with momentum
  const dragHandlers = useMemo(() => ({
    onDragStart: () => {
      setIsDragging(true);
      dragRef.current = {
        startPosition: { x: 0, y: 0 },
        lastPosition: { x: 0, y: 0, timestamp: Date.now() },
        velocity: { x: 0, y: 0 },
      };
    },

    onDrag: (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { point: { x: number; y: number } }
    ) => {
      const now = Date.now();
      const current = { ...info.point, timestamp: now };
      const previous = dragRef.current.lastPosition;

      // Calculate velocity
      dragRef.current.velocity = calculateVelocity(current, previous);
      dragRef.current.lastPosition = current;
    },

    onDragEnd: (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { velocity: { x: number; y: number } }
    ) => {
      setIsDragging(false);

      // Apply momentum if velocity is significant
      const velocityMagnitude = Math.sqrt(
        info.velocity.x ** 2 + info.velocity.y ** 2
      );

      if (velocityMagnitude > 100) {
        const target = calculateMomentumTarget(
          dragRef.current.lastPosition,
          info.velocity,
          {
            minX: 0,
            maxX: window.innerWidth - boundsRef.current.width,
            minY: 28, // Menu bar height
            maxY: window.innerHeight - 80, // Dock height
          }
        );

        controls.start({
          x: target.x - boundsRef.current.x,
          y: target.y - boundsRef.current.y,
          transition: {
            type: 'spring',
            ...AppleSprings.loose,
          },
        });
      }
    },
  }), [controls]);

  return {
    animationState,
    controls,
    shadow,
    variants: windowVariants,
    animateOpen,
    animateClose,
    animateMinimize,
    animateRestore,
    animateMaximize,
    animateUnmaximize,
    animateShake,
    animateBounce,
    dragHandlers,
    isDragging,
  };
}

// ============================================================================
// Sheet Animation Hook
// ============================================================================

export interface UseSheetAnimationConfig {
  isOpen: boolean;
  onClose?: () => void;
}

export function useSheetAnimation(config: UseSheetAnimationConfig) {
  const { isOpen, onClose } = config;
  const controls = useAnimation();

  useEffect(() => {
    if (isOpen) {
      controls.start({
        y: 0,
        opacity: 1,
        scale: 1,
        transition: AppleSprings.sheet,
      });
    } else {
      controls.start({
        y: -20,
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15, ease: [0.55, 0.055, 0.675, 0.19] },
      });
    }
  }, [isOpen, controls]);

  const sheetVariants = {
    hidden: {
      y: -20,
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: AppleSprings.sheet,
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 },
    },
  };

  return {
    controls,
    variants: sheetVariants,
    isOpen,
    close: onClose,
  };
}

// ============================================================================
// Popover Animation Hook
// ============================================================================

export interface UsePopoverAnimationConfig {
  isOpen: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function usePopoverAnimation(config: UsePopoverAnimationConfig) {
  const { isOpen, placement = 'bottom' } = config;
  const controls = useAnimation();

  const getInitialOffset = () => {
    switch (placement) {
      case 'top': return { y: 10, x: 0 };
      case 'bottom': return { y: -10, x: 0 };
      case 'left': return { y: 0, x: 10 };
      case 'right': return { y: 0, x: -10 };
    }
  };

  useEffect(() => {
    if (isOpen) {
      controls.start({
        ...getInitialOffset(),
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        transition: AppleSprings.popover,
      });
    }
  }, [isOpen, controls, placement]);

  const popoverVariants = {
    hidden: {
      ...getInitialOffset(),
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: AppleSprings.popover,
    },
    exit: {
      ...getInitialOffset(),
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  };

  return {
    controls,
    variants: popoverVariants,
  };
}

export default useWindowAnimations;
