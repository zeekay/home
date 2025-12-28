/**
 * useScrollMomentum - Physics-based scroll momentum hook
 *
 * Provides macOS-style inertial scrolling with:
 * - Momentum/deceleration curves
 * - Rubber-band effect at boundaries
 * - Two-finger trackpad detection
 * - Page up/down smooth animation
 */

import { useRef, useCallback, useEffect } from 'react';

interface ScrollMomentumOptions {
  /** Friction coefficient (0-1). Lower = more momentum. Default: 0.92 */
  friction?: number;
  /** Minimum velocity to continue momentum. Default: 0.5 */
  minVelocity?: number;
  /** Rubber band elasticity (0-1). Higher = more stretch. Default: 0.55 */
  rubberBandElasticity?: number;
  /** Maximum rubber band stretch in pixels. Default: 100 */
  maxRubberBand?: number;
  /** Enable rubber band effect. Default: true */
  rubberBand?: boolean;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  /** Callback when reaching scroll boundaries */
  onBoundary?: (edge: 'top' | 'bottom' | 'left' | 'right') => void;
  /** Callback for infinite scroll (near bottom) */
  onNearEnd?: () => void;
  /** Distance from end to trigger onNearEnd. Default: 200 */
  nearEndThreshold?: number;
}

interface ScrollState {
  velocityY: number;
  velocityX: number;
  isScrolling: boolean;
  isMomentum: boolean;
  lastTimestamp: number;
  rubberBandY: number;
  rubberBandX: number;
  isAtBoundary: boolean;
}

export function useScrollMomentum(options: ScrollMomentumOptions = {}) {
  const {
    friction = 0.92,
    minVelocity = 0.5,
    rubberBandElasticity = 0.55,
    maxRubberBand = 100,
    rubberBand = true,
    onScroll,
    onBoundary,
    onNearEnd,
    nearEndThreshold = 200,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef<ScrollState>({
    velocityY: 0,
    velocityX: 0,
    isScrolling: false,
    isMomentum: false,
    lastTimestamp: 0,
    rubberBandY: 0,
    rubberBandX: 0,
    isAtBoundary: false,
  });
  const rafRef = useRef<number | null>(null);
  const lastScrollTop = useRef(0);
  const lastScrollLeft = useRef(0);
  const nearEndTriggered = useRef(false);

  // Deceleration curve (ease-out cubic)
  const decelerate = useCallback((velocity: number): number => {
    return velocity * friction;
  }, [friction]);

  // Rubber band resistance function
  const rubberBandResist = useCallback((overscroll: number, max: number): number => {
    const resistance = 1 - (1 / ((overscroll * rubberBandElasticity / max) + 1));
    return overscroll * resistance;
  }, [rubberBandElasticity]);

  // Animate rubber band snap-back
  const animateRubberBandReturn = useCallback(() => {
    const state = stateRef.current;
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      // Exponential decay for snap-back
      state.rubberBandY *= 0.85;
      state.rubberBandX *= 0.85;

      if (Math.abs(state.rubberBandY) < 0.5) state.rubberBandY = 0;
      if (Math.abs(state.rubberBandX) < 0.5) state.rubberBandX = 0;

      // Apply transform for rubber band effect
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.style.transform = `translate3d(${state.rubberBandX}px, ${state.rubberBandY}px, 0)`;
      }

      if (state.rubberBandY !== 0 || state.rubberBandX !== 0) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        if (viewport) {
          viewport.style.transform = '';
        }
        state.isAtBoundary = false;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // Momentum animation loop
  const animateMomentum = useCallback(() => {
    const state = stateRef.current;
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    state.velocityY = decelerate(state.velocityY);
    state.velocityX = decelerate(state.velocityX);

    const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

    let newScrollTop = viewport.scrollTop + state.velocityY;
    let newScrollLeft = viewport.scrollLeft + state.velocityX;

    // Handle boundaries with rubber band
    if (rubberBand) {
      if (newScrollTop < 0) {
        state.rubberBandY = rubberBandResist(-newScrollTop, maxRubberBand);
        newScrollTop = 0;
        state.velocityY = 0;
        state.isAtBoundary = true;
        onBoundary?.('top');
      } else if (newScrollTop > maxScrollTop) {
        state.rubberBandY = -rubberBandResist(newScrollTop - maxScrollTop, maxRubberBand);
        newScrollTop = maxScrollTop;
        state.velocityY = 0;
        state.isAtBoundary = true;
        onBoundary?.('bottom');
      }

      if (newScrollLeft < 0) {
        state.rubberBandX = rubberBandResist(-newScrollLeft, maxRubberBand);
        newScrollLeft = 0;
        state.velocityX = 0;
        state.isAtBoundary = true;
        onBoundary?.('left');
      } else if (newScrollLeft > maxScrollLeft) {
        state.rubberBandX = -rubberBandResist(newScrollLeft - maxScrollLeft, maxRubberBand);
        newScrollLeft = maxScrollLeft;
        state.velocityX = 0;
        state.isAtBoundary = true;
        onBoundary?.('right');
      }

      // Apply rubber band transform
      if (state.rubberBandY !== 0 || state.rubberBandX !== 0) {
        viewport.style.transform = `translate3d(${state.rubberBandX}px, ${state.rubberBandY}px, 0)`;
      }
    }

    viewport.scrollTop = newScrollTop;
    viewport.scrollLeft = newScrollLeft;

    onScroll?.(newScrollTop, newScrollLeft);

    // Check for infinite scroll
    if (maxScrollTop - newScrollTop < nearEndThreshold) {
      if (!nearEndTriggered.current) {
        nearEndTriggered.current = true;
        onNearEnd?.();
      }
    } else {
      nearEndTriggered.current = false;
    }

    // Continue momentum or snap back rubber band
    if (Math.abs(state.velocityY) > minVelocity || Math.abs(state.velocityX) > minVelocity) {
      rafRef.current = requestAnimationFrame(animateMomentum);
    } else {
      state.isMomentum = false;
      state.velocityY = 0;
      state.velocityX = 0;

      // Animate rubber band return if needed
      if (state.isAtBoundary) {
        animateRubberBandReturn();
      }
    }
  }, [decelerate, rubberBand, rubberBandResist, maxRubberBand, minVelocity, onScroll, onBoundary, onNearEnd, nearEndThreshold, animateRubberBandReturn]);

  // Handle wheel events
  const handleWheel = useCallback((e: WheelEvent) => {
    const state = stateRef.current;
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    // Detect trackpad (two-finger scroll) vs mouse wheel
    // Trackpad events have smaller deltaY and often have deltaX
    const isTrackpad = Math.abs(e.deltaY) < 50 || e.deltaX !== 0;

    if (isTrackpad) {
      // For trackpad, use native momentum but apply rubber band at boundaries
      const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      const currentTop = viewport.scrollTop;
      const currentLeft = viewport.scrollLeft;

      // Check if at boundaries
      const atTop = currentTop <= 0 && e.deltaY < 0;
      const atBottom = currentTop >= maxScrollTop && e.deltaY > 0;
      const atLeft = currentLeft <= 0 && e.deltaX < 0;
      const atRight = currentLeft >= maxScrollLeft && e.deltaX > 0;

      if (rubberBand && (atTop || atBottom || atLeft || atRight)) {
        e.preventDefault();

        if (atTop || atBottom) {
          state.rubberBandY += e.deltaY * 0.3;
          state.rubberBandY = Math.max(-maxRubberBand, Math.min(maxRubberBand, state.rubberBandY));
          onBoundary?.(atTop ? 'top' : 'bottom');
        }

        if (atLeft || atRight) {
          state.rubberBandX += e.deltaX * 0.3;
          state.rubberBandX = Math.max(-maxRubberBand, Math.min(maxRubberBand, state.rubberBandX));
          onBoundary?.(atLeft ? 'left' : 'right');
        }

        viewport.style.transform = `translate3d(${state.rubberBandX}px, ${state.rubberBandY}px, 0)`;
        state.isAtBoundary = true;
      }
    } else {
      // For mouse wheel, apply momentum
      e.preventDefault();

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Accumulate velocity
      state.velocityY += e.deltaY * 0.5;
      state.velocityX += e.deltaX * 0.5;

      // Cap velocity
      state.velocityY = Math.max(-100, Math.min(100, state.velocityY));
      state.velocityX = Math.max(-100, Math.min(100, state.velocityX));

      if (!state.isMomentum) {
        state.isMomentum = true;
        rafRef.current = requestAnimationFrame(animateMomentum);
      }
    }
  }, [rubberBand, maxRubberBand, onBoundary, animateMomentum]);

  // Handle wheel end (for rubber band snap-back)
  const handleWheelEnd = useCallback(() => {
    const state = stateRef.current;
    if (state.isAtBoundary && !state.isMomentum) {
      animateRubberBandReturn();
    }
  }, [animateRubberBandReturn]);

  // Smooth scroll to position
  const scrollTo = useCallback((options: { top?: number; left?: number; behavior?: 'smooth' | 'instant' }) => {
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    if (options.behavior === 'instant') {
      if (options.top !== undefined) viewport.scrollTop = options.top;
      if (options.left !== undefined) viewport.scrollLeft = options.left;
      return;
    }

    // Smooth scroll with spring animation
    const startTop = viewport.scrollTop;
    const startLeft = viewport.scrollLeft;
    const targetTop = options.top ?? startTop;
    const targetLeft = options.left ?? startLeft;
    const duration = 400;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      viewport.scrollTop = startTop + (targetTop - startTop) * eased;
      viewport.scrollLeft = startLeft + (targetLeft - startLeft) * eased;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // Page up/down with smooth animation
  const pageUp = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    scrollTo({ top: viewport.scrollTop - viewport.clientHeight * 0.9 });
  }, [scrollTo]);

  const pageDown = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    scrollTo({ top: viewport.scrollTop + viewport.clientHeight * 0.9 });
  }, [scrollTo]);

  // Scroll to top/bottom
  const scrollToTop = useCallback(() => {
    scrollTo({ top: 0 });
  }, [scrollTo]);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    scrollTo({ top: viewport.scrollHeight - viewport.clientHeight });
  }, [scrollTo]);

  // Set up event listeners
  const setRef = useCallback((element: HTMLElement | null) => {
    // Clean up previous
    if (containerRef.current) {
      containerRef.current.removeEventListener('wheel', handleWheel);
    }

    containerRef.current = element;

    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });

      // Track scroll for velocity calculation and callbacks
      const viewport = element.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        let wheelEndTimer: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
          onScroll?.(viewport.scrollTop, viewport.scrollLeft);

          // Check for infinite scroll
          const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
          if (maxScrollTop - viewport.scrollTop < nearEndThreshold) {
            if (!nearEndTriggered.current) {
              nearEndTriggered.current = true;
              onNearEnd?.();
            }
          } else {
            nearEndTriggered.current = false;
          }

          lastScrollTop.current = viewport.scrollTop;
          lastScrollLeft.current = viewport.scrollLeft;
        };

        const handleWheelWithEnd = () => {
          clearTimeout(wheelEndTimer);
          wheelEndTimer = setTimeout(handleWheelEnd, 150);
        };

        viewport.addEventListener('scroll', handleScroll, { passive: true });
        element.addEventListener('wheel', handleWheelWithEnd, { passive: true });
      }
    }
  }, [handleWheel, handleWheelEnd, onScroll, onNearEnd, nearEndThreshold]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    ref: setRef,
    scrollTo,
    pageUp,
    pageDown,
    scrollToTop,
    scrollToBottom,
  };
}

export default useScrollMomentum;
