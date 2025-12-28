/**
 * Animation duration constants (in milliseconds)
 * Keep in sync with tailwind.config.ts keyframe durations
 *
 * These timing values match real macOS Sonoma animations
 */
export const ANIMATION_DURATIONS = {
  /** Dock icon bounce animation */
  DOCK_BOUNCE: 800,
  /** Dock intro slide-in animation */
  DOCK_INTRO: 500,
  /** Stagger delay between dock items during intro */
  DOCK_INTRO_STAGGER: 50,

  // Window Animations (matching macOS Sonoma)
  /** Window open scale animation - Apple's quick open curve */
  WINDOW_OPEN: 250,
  /** Window close scale animation - Accelerates into close */
  WINDOW_CLOSE: 200,
  /** Window genie minimize effect - Takes longer for the curve effect */
  WINDOW_MINIMIZE: 500,
  /** Window genie restore effect */
  WINDOW_RESTORE: 400,
  /** Window maximize/zoom effect */
  WINDOW_MAXIMIZE: 350,

  // Feedback Animations
  /** Window shake (invalid action) */
  WINDOW_SHAKE: 400,
  /** Window bounce (attention) */
  WINDOW_BOUNCE: 600,

  // Sheet/Modal Animations
  /** Sheet slide from title bar */
  SHEET_OPEN: 300,
  SHEET_CLOSE: 200,

  // Popover Animations
  /** Popover with spring physics */
  POPOVER_OPEN: 200,
  POPOVER_CLOSE: 150,

  // Drag/Momentum
  /** Momentum deceleration after drag */
  DRAG_MOMENTUM: 400,

  /** App launching state duration */
  APP_LAUNCH: 1000,
  /** Delay before starting intro sequence after boot */
  INTRO_START_DELAY: 500,
  /** Delay after dock intro before opening window */
  INTRO_WINDOW_DELAY: 800,
} as const;

/**
 * Apple cubic-bezier timing functions
 * Extracted from macOS CoreAnimation
 */
export const APPLE_EASING = {
  /** Standard macOS animation curve */
  standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

  /** Window open - quick start, smooth end */
  windowOpen: 'cubic-bezier(0.16, 1, 0.3, 1)',

  /** Window close - accelerate into close */
  windowClose: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',

  /** Genie effect - starts slow, accelerates */
  genieIn: 'cubic-bezier(0.42, 0, 1, 1)',
  genieOut: 'cubic-bezier(0, 0, 0.58, 1)',

  /** Zoom/fullscreen - Apple's zoom curve */
  zoom: 'cubic-bezier(0.23, 1, 0.32, 1)',

  /** Spring physics (for popovers, sheets) */
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  springTight: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

  /** Shake effect */
  shake: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',

  /** Bounce with overshoot */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  /** Sheet slide */
  sheet: 'cubic-bezier(0.32, 0.72, 0, 1)',

  /** Drag momentum */
  momentum: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
export type AppleEasing = keyof typeof APPLE_EASING;
