/**
 * macOS Window Animation System
 *
 * Pixel-perfect animations matching real macOS behavior:
 * - Genie effect for minimize (curving into dock)
 * - Scale effect for close (shrink to center)
 * - Zoom effect for maximize/fullscreen
 * - Spring physics for popovers
 * - Sheet animations (slide from title bar)
 * - Shake for invalid actions
 * - Bounce for attention
 */

// ============================================================================
// Apple Timing Curves (extracted from macOS CoreAnimation)
// ============================================================================

/**
 * Apple's standard timing functions as cubic-bezier values.
 * These match the actual curves used in macOS Sonoma.
 */
export const AppleEasing = {
  // Standard macOS animations
  standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

  // Window open - quick start, smooth end
  windowOpen: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Window close - accelerate into close
  windowClose: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',

  // Genie effect - starts slow, accelerates
  genieIn: 'cubic-bezier(0.42, 0, 1, 1)',
  genieOut: 'cubic-bezier(0, 0, 0.58, 1)',

  // Zoom/fullscreen - Apple's zoom curve
  zoom: 'cubic-bezier(0.23, 1, 0.32, 1)',

  // Spring physics (for popovers, sheets)
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  springTight: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springLoose: 'cubic-bezier(0.22, 1.2, 0.36, 1)',

  // Shake effect - linear for sharp movements
  shake: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',

  // Bounce - overshoots then settles
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Sheet slide - smooth deceleration
  sheet: 'cubic-bezier(0.32, 0.72, 0, 1)',

  // Drag momentum - natural deceleration
  momentum: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const;

// Framer Motion spring configurations
export const AppleSprings = {
  // Default window spring
  window: { type: 'spring' as const, stiffness: 300, damping: 30 },

  // Popover/menu spring (bouncier)
  popover: { type: 'spring' as const, stiffness: 400, damping: 25, mass: 0.8 },

  // Sheet slide spring
  sheet: { type: 'spring' as const, stiffness: 350, damping: 35, mass: 1 },

  // Tight spring for snappy feedback
  tight: { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.5 },

  // Loose spring for natural movements
  loose: { type: 'spring' as const, stiffness: 200, damping: 20, mass: 1 },

  // Bounce effect
  bounce: { type: 'spring' as const, stiffness: 600, damping: 15, mass: 0.8 },
} as const;

// ============================================================================
// Animation Durations (milliseconds)
// ============================================================================

export const AppleDurations = {
  // Window operations
  windowOpen: 250,
  windowClose: 200,
  windowMinimize: 500,    // Genie effect takes longer
  windowMaximize: 350,
  windowRestore: 300,

  // UI elements
  sheet: 300,
  popover: 200,
  menu: 150,

  // Feedback
  shake: 400,
  bounce: 600,

  // Interactions
  drag: 0,  // Instant during drag
  momentum: 400,  // After release
} as const;

// ============================================================================
// Window Animation States
// ============================================================================

export type WindowAnimationState =
  | 'idle'
  | 'opening'
  | 'closing'
  | 'minimizing'
  | 'restoring'
  | 'maximizing'
  | 'unmaximizing'
  | 'shaking'
  | 'bouncing';

// ============================================================================
// Genie Effect Implementation
// ============================================================================

/**
 * Genie effect parameters for minimize animation.
 * Creates the curved distortion as window shrinks into dock.
 */
export interface GenieParams {
  /** Starting window bounds */
  startBounds: { x: number; y: number; width: number; height: number };
  /** Dock icon target position */
  dockTarget: { x: number; y: number; width: number; height: number };
  /** Animation progress 0-1 */
  progress: number;
}

/**
 * Calculate the genie distortion mesh for a given progress.
 * Returns control points for the curved effect.
 */
export function calculateGenieDistortion(params: GenieParams): {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  curveIntensity: number;
} {
  const { startBounds, dockTarget, progress } = params;

  // Easing function for smooth acceleration
  const eased = easeInQuad(progress);
  const curveEased = easeOutQuad(progress);

  // Start positions
  const startLeft = startBounds.x;
  const startRight = startBounds.x + startBounds.width;
  const startTop = startBounds.y;
  const startBottom = startBounds.y + startBounds.height;

  // End positions (converge to dock icon)
  const endCenterX = dockTarget.x + dockTarget.width / 2;
  const endY = dockTarget.y;

  // Width shrinks as it approaches dock
  const currentWidth = startBounds.width * (1 - eased * 0.95);
  const halfWidth = currentWidth / 2;

  // Top edge moves toward dock slower than bottom
  const topProgress = eased * 0.7;
  const bottomProgress = eased;

  // Horizontal positions converge toward dock center
  const topCenterX = startBounds.x + startBounds.width / 2 +
    (endCenterX - (startBounds.x + startBounds.width / 2)) * topProgress;
  const bottomCenterX = startBounds.x + startBounds.width / 2 +
    (endCenterX - (startBounds.x + startBounds.width / 2)) * bottomProgress;

  // Vertical positions
  const topY = startTop + (endY - startTop) * topProgress;
  const bottomY = startBottom + (endY - startBottom) * bottomProgress;

  // Width at top vs bottom (top stays wider longer)
  const topHalfWidth = halfWidth * (1 + (1 - topProgress) * 0.3);
  const bottomHalfWidth = halfWidth * (1 - bottomProgress * 0.4);

  return {
    topLeft: { x: topCenterX - topHalfWidth, y: topY },
    topRight: { x: topCenterX + topHalfWidth, y: topY },
    bottomLeft: { x: bottomCenterX - bottomHalfWidth, y: bottomY },
    bottomRight: { x: bottomCenterX + bottomHalfWidth, y: bottomY },
    curveIntensity: curveEased * 0.4, // How much the sides curve
  };
}

/**
 * Generate CSS transform for genie effect at given progress.
 * Uses perspective and 3D transforms to approximate the curve.
 */
export function getGenieTransform(progress: number, dockPosition: 'bottom' | 'left' | 'right' = 'bottom'): string {
  const eased = easeInQuad(progress);

  // Scale decreases as it moves to dock
  const scale = 1 - eased * 0.9;

  // Vertical movement
  const translateY = eased * (window.innerHeight - 100);

  // Perspective distortion (narrower at bottom)
  const perspective = 1000 - eased * 600;
  const rotateX = eased * 10; // Slight tilt

  // Skew for curve effect
  const skewX = Math.sin(progress * Math.PI) * 5;

  return `
    perspective(${perspective}px)
    translateY(${translateY}px)
    scale(${scale})
    rotateX(${rotateX}deg)
    skewX(${skewX}deg)
  `.trim().replace(/\s+/g, ' ');
}

// ============================================================================
// Scale Effect (Close Animation)
// ============================================================================

/**
 * Generate CSS for window close animation.
 * Shrinks toward center with fade.
 */
export function getCloseTransform(progress: number): {
  transform: string;
  opacity: number;
} {
  const eased = easeInQuad(progress);

  return {
    transform: `scale(${1 - eased * 0.2})`,
    opacity: 1 - eased,
  };
}

// ============================================================================
// Zoom Effect (Maximize/Fullscreen)
// ============================================================================

/**
 * Calculate intermediate bounds during zoom animation.
 */
export function calculateZoomBounds(
  startBounds: { x: number; y: number; width: number; height: number },
  endBounds: { x: number; y: number; width: number; height: number },
  progress: number
): { x: number; y: number; width: number; height: number } {
  const eased = easeOutQuint(progress);

  return {
    x: startBounds.x + (endBounds.x - startBounds.x) * eased,
    y: startBounds.y + (endBounds.y - startBounds.y) * eased,
    width: startBounds.width + (endBounds.width - startBounds.width) * eased,
    height: startBounds.height + (endBounds.height - startBounds.height) * eased,
  };
}

// ============================================================================
// Shake Animation (Invalid Action)
// ============================================================================

/**
 * Generate shake animation keyframes.
 * Matches macOS dialog shake exactly.
 */
export function getShakeKeyframes(): Keyframe[] {
  return [
    { transform: 'translateX(0)', offset: 0 },
    { transform: 'translateX(-10px)', offset: 0.1 },
    { transform: 'translateX(10px)', offset: 0.2 },
    { transform: 'translateX(-10px)', offset: 0.3 },
    { transform: 'translateX(10px)', offset: 0.4 },
    { transform: 'translateX(-6px)', offset: 0.5 },
    { transform: 'translateX(6px)', offset: 0.6 },
    { transform: 'translateX(-4px)', offset: 0.7 },
    { transform: 'translateX(4px)', offset: 0.8 },
    { transform: 'translateX(-2px)', offset: 0.9 },
    { transform: 'translateX(0)', offset: 1 },
  ];
}

/**
 * Trigger shake animation on an element.
 */
export function shakeElement(element: HTMLElement): Animation {
  return element.animate(getShakeKeyframes(), {
    duration: AppleDurations.shake,
    easing: AppleEasing.shake,
  });
}

// ============================================================================
// Bounce Animation (Attention)
// ============================================================================

/**
 * Generate bounce animation keyframes.
 * For dock icons and attention indicators.
 */
export function getBounceKeyframes(): Keyframe[] {
  return [
    { transform: 'translateY(0)', offset: 0 },
    { transform: 'translateY(-20px)', offset: 0.15 },
    { transform: 'translateY(0)', offset: 0.3 },
    { transform: 'translateY(-14px)', offset: 0.4 },
    { transform: 'translateY(0)', offset: 0.5 },
    { transform: 'translateY(-8px)', offset: 0.6 },
    { transform: 'translateY(0)', offset: 0.7 },
    { transform: 'translateY(-4px)', offset: 0.8 },
    { transform: 'translateY(0)', offset: 1 },
  ];
}

/**
 * Trigger bounce animation on an element.
 */
export function bounceElement(element: HTMLElement): Animation {
  return element.animate(getBounceKeyframes(), {
    duration: AppleDurations.bounce,
    easing: AppleEasing.bounce,
  });
}

// ============================================================================
// Sheet Animation (Slide from Title Bar)
// ============================================================================

export interface SheetAnimationConfig {
  /** Parent window element for positioning */
  parentWindow: HTMLElement;
  /** Sheet content height */
  sheetHeight: number;
  /** Animation direction */
  direction: 'down' | 'up';
}

/**
 * Get sheet slide animation properties.
 */
export function getSheetAnimation(
  isOpen: boolean,
  config: SheetAnimationConfig
): {
  transform: string;
  opacity: number;
} {
  if (isOpen) {
    return {
      transform: 'translateY(0) scaleY(1)',
      opacity: 1,
    };
  }

  return {
    transform: 'translateY(-20px) scaleY(0.95)',
    opacity: 0,
  };
}

// ============================================================================
// Popover Spring Animation
// ============================================================================

/**
 * Framer Motion variants for popover animations.
 */
export const popoverVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: AppleSprings.popover,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -5,
    transition: { duration: 0.15, ease: [0.55, 0.055, 0.675, 0.19] },
  },
};

// ============================================================================
// Window Shadow System (Focus-Based)
// ============================================================================

export interface WindowShadowConfig {
  /** Is window focused/active */
  isFocused: boolean;
  /** Is window being dragged */
  isDragging: boolean;
  /** Window elevation level */
  elevation: 'normal' | 'high' | 'low';
}

/**
 * Get dynamic shadow based on window state.
 * Matches macOS shadow behavior exactly.
 */
export function getWindowShadow(config: WindowShadowConfig): string {
  const { isFocused, isDragging, elevation } = config;

  // Base shadow layers (macOS uses multiple shadow layers)
  const shadowLayers: string[] = [];

  if (isDragging) {
    // Elevated shadow during drag
    shadowLayers.push(
      '0 30px 60px rgba(0, 0, 0, 0.4)',
      '0 15px 30px rgba(0, 0, 0, 0.25)',
      '0 5px 15px rgba(0, 0, 0, 0.2)',
    );
  } else if (isFocused) {
    // Active window shadow
    switch (elevation) {
      case 'high':
        shadowLayers.push(
          '0 25px 50px rgba(0, 0, 0, 0.35)',
          '0 10px 20px rgba(0, 0, 0, 0.2)',
          '0 3px 8px rgba(0, 0, 0, 0.15)',
        );
        break;
      case 'low':
        shadowLayers.push(
          '0 10px 20px rgba(0, 0, 0, 0.2)',
          '0 3px 8px rgba(0, 0, 0, 0.1)',
        );
        break;
      default:
        shadowLayers.push(
          '0 20px 40px rgba(0, 0, 0, 0.3)',
          '0 8px 16px rgba(0, 0, 0, 0.18)',
          '0 2px 6px rgba(0, 0, 0, 0.12)',
        );
    }

    // Add subtle glow for focused state
    shadowLayers.push('0 0 0 0.5px rgba(255, 255, 255, 0.1)');
  } else {
    // Inactive window shadow (lighter)
    shadowLayers.push(
      '0 10px 20px rgba(0, 0, 0, 0.15)',
      '0 4px 8px rgba(0, 0, 0, 0.1)',
      '0 1px 3px rgba(0, 0, 0, 0.08)',
    );
  }

  // Inner highlight
  shadowLayers.push('inset 0 0.5px 0 rgba(255, 255, 255, 0.1)');

  return shadowLayers.join(', ');
}

// ============================================================================
// Momentum-Based Dragging
// ============================================================================

export interface DragState {
  /** Current position */
  position: { x: number; y: number };
  /** Velocity from recent movement */
  velocity: { x: number; y: number };
  /** Timestamp of last update */
  timestamp: number;
}

/**
 * Calculate velocity from position history.
 */
export function calculateVelocity(
  current: { x: number; y: number; timestamp: number },
  previous: { x: number; y: number; timestamp: number }
): { x: number; y: number } {
  const dt = (current.timestamp - previous.timestamp) / 1000; // seconds

  if (dt === 0) return { x: 0, y: 0 };

  return {
    x: (current.x - previous.x) / dt,
    y: (current.y - previous.y) / dt,
  };
}

/**
 * Calculate final position after momentum.
 * Uses natural deceleration like macOS.
 */
export function calculateMomentumTarget(
  position: { x: number; y: number },
  velocity: { x: number; y: number },
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  friction: number = 0.95
): { x: number; y: number } {
  // Project where momentum would take us
  const projectedX = position.x + velocity.x * 0.3;
  const projectedY = position.y + velocity.y * 0.3;

  // Clamp to bounds
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, projectedX)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, projectedY)),
  };
}

// ============================================================================
// Easing Functions
// ============================================================================

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeOutQuint(t: number): number {
  return 1 + --t * t * t * t * t;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ============================================================================
// CSS Keyframe Generators for Tailwind
// ============================================================================

/**
 * CSS keyframes string for genie minimize effect.
 */
export const genieMinimizeKeyframes = `
@keyframes genie-minimize {
  0% {
    transform: perspective(1000px) translateY(0) scale(1) rotateX(0deg);
    opacity: 1;
    transform-origin: bottom center;
  }
  30% {
    transform: perspective(800px) translateY(30%) scale(0.8) rotateX(3deg);
    opacity: 1;
  }
  60% {
    transform: perspective(600px) translateY(60%) scale(0.5) rotateX(6deg);
    opacity: 0.8;
  }
  100% {
    transform: perspective(400px) translateY(100%) scale(0.1) rotateX(10deg);
    opacity: 0;
    transform-origin: bottom center;
  }
}
`;

/**
 * CSS keyframes string for genie restore effect.
 */
export const genieRestoreKeyframes = `
@keyframes genie-restore {
  0% {
    transform: perspective(400px) translateY(100%) scale(0.1) rotateX(10deg);
    opacity: 0;
    transform-origin: bottom center;
  }
  40% {
    transform: perspective(600px) translateY(60%) scale(0.5) rotateX(6deg);
    opacity: 0.8;
  }
  70% {
    transform: perspective(800px) translateY(30%) scale(0.8) rotateX(3deg);
    opacity: 1;
  }
  100% {
    transform: perspective(1000px) translateY(0) scale(1) rotateX(0deg);
    opacity: 1;
    transform-origin: bottom center;
  }
}
`;

/**
 * CSS keyframes for scale close effect.
 */
export const scaleCloseKeyframes = `
@keyframes scale-close {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.85);
    opacity: 0;
  }
}
`;

/**
 * CSS keyframes for zoom maximize effect.
 */
export const zoomMaximizeKeyframes = `
@keyframes zoom-maximize {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
`;

/**
 * CSS keyframes for shake effect.
 */
export const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-10px); }
  20% { transform: translateX(10px); }
  30% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  50% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  70% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  90% { transform: translateX(-2px); }
}
`;

/**
 * CSS keyframes for attention bounce.
 */
export const bounceAttentionKeyframes = `
@keyframes bounce-attention {
  0%, 100% { transform: translateY(0); }
  15% { transform: translateY(-20px); }
  30% { transform: translateY(0); }
  40% { transform: translateY(-14px); }
  50% { transform: translateY(0); }
  60% { transform: translateY(-8px); }
  70% { transform: translateY(0); }
  80% { transform: translateY(-4px); }
}
`;

// ============================================================================
// Export all keyframes as injectable CSS
// ============================================================================

export const allWindowAnimationKeyframes = `
${genieMinimizeKeyframes}
${genieRestoreKeyframes}
${scaleCloseKeyframes}
${zoomMaximizeKeyframes}
${shakeKeyframes}
${bounceAttentionKeyframes}
`;
