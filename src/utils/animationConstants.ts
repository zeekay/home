/**
 * Animation duration constants (in milliseconds)
 * Keep in sync with tailwind.config.ts keyframe durations
 */
export const ANIMATION_DURATIONS = {
  /** Dock icon bounce animation */
  DOCK_BOUNCE: 800,
  /** Dock intro slide-in animation */
  DOCK_INTRO: 500,
  /** Stagger delay between dock items during intro */
  DOCK_INTRO_STAGGER: 50,
  /** Window open scale animation */
  WINDOW_OPEN: 250,
  /** Window close scale animation */
  WINDOW_CLOSE: 200,
  /** Window minimize animation */
  WINDOW_MINIMIZE: 300,
  /** App launching state duration */
  APP_LAUNCH: 1000,
  /** Delay before starting intro sequence after boot */
  INTRO_START_DELAY: 500,
  /** Delay after dock intro before opening window */
  INTRO_WINDOW_DELAY: 800,
} as const;

export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
