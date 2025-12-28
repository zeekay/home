/**
 * ScrollArea - macOS-style smooth scrolling component
 *
 * Features:
 * - Rubber-band effect at scroll boundaries
 * - Momentum scrolling with deceleration curve
 * - Scroll snapping support
 * - Thin, auto-hiding scrollbars
 * - Two-finger trackpad detection
 * - Horizontal scroll support
 * - Scroll shadows (top/bottom fade)
 * - Infinite scroll with smooth loading
 * - Scroll-linked animations via callbacks
 * - Page up/down with smooth animation
 */

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

interface ScrollShadowState {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
}

interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  /** Orientation for scrolling. Default: "vertical" */
  orientation?: "vertical" | "horizontal" | "both"
  /** Show scroll shadows at content edges. Default: true */
  showShadows?: boolean
  /** Enable rubber-band bounce at edges. Default: true */
  rubberBand?: boolean
  /** Enable momentum scrolling. Default: true */
  momentum?: boolean
  /** Enable scroll snapping. Default: false */
  snap?: boolean | "proximity"
  /** Scroll snap alignment. Default: "start" */
  snapAlign?: "start" | "center" | "end"
  /** Auto-hide scrollbar when not scrolling. Default: true */
  autoHideScrollbar?: boolean
  /** Scrollbar size. Default: "default" */
  scrollbarSize?: "thin" | "default"
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number, scrollLeft: number) => void
  /** Callback when reaching scroll boundary */
  onBoundary?: (edge: "top" | "bottom" | "left" | "right") => void
  /** Callback when near the end (for infinite scroll) */
  onNearEnd?: () => void
  /** Distance from end to trigger onNearEnd. Default: 200 */
  nearEndThreshold?: number
  /** Keyboard navigation support. Default: true */
  keyboardNav?: boolean
}

export interface ScrollAreaRef {
  scrollTo: (options: { top?: number; left?: number; behavior?: "smooth" | "instant" }) => void
  scrollToTop: () => void
  scrollToBottom: () => void
  pageUp: () => void
  pageDown: () => void
  getScrollPosition: () => { top: number; left: number }
  getViewport: () => HTMLDivElement | null
}

// ============================================================================
// ScrollArea Component
// ============================================================================

const ScrollArea = React.forwardRef<
  ScrollAreaRef,
  ScrollAreaProps
>(({
  className,
  children,
  orientation = "vertical",
  showShadows = true,
  rubberBand = true,
  momentum = true,
  snap = false,
  snapAlign = "start",
  autoHideScrollbar = true,
  scrollbarSize = "default",
  onScroll,
  onBoundary,
  onNearEnd,
  nearEndThreshold = 200,
  keyboardNav = true,
  ...props
}, ref) => {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [shadows, setShadows] = React.useState<ScrollShadowState>({
    top: false,
    bottom: false,
    left: false,
    right: false,
  })
  const [isScrolling, setIsScrolling] = React.useState(false)
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()
  const nearEndTriggeredRef = React.useRef(false)

  // Rubber band state
  const rubberBandRef = React.useRef({ x: 0, y: 0 })
  const isAtBoundaryRef = React.useRef(false)
  const rafRef = React.useRef<number>()

  // Update scroll shadows based on scroll position
  const updateShadows = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !showShadows) return

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = viewport

    setShadows({
      top: scrollTop > 5,
      bottom: scrollTop < scrollHeight - clientHeight - 5,
      left: scrollLeft > 5,
      right: scrollLeft < scrollWidth - clientWidth - 5,
    })
  }, [showShadows])

  // Check for infinite scroll trigger
  const checkNearEnd = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !onNearEnd) return

    const { scrollTop, scrollHeight, clientHeight } = viewport
    const distanceFromEnd = scrollHeight - scrollTop - clientHeight

    if (distanceFromEnd < nearEndThreshold) {
      if (!nearEndTriggeredRef.current) {
        nearEndTriggeredRef.current = true
        onNearEnd()
      }
    } else {
      nearEndTriggeredRef.current = false
    }
  }, [onNearEnd, nearEndThreshold])

  // Rubber band animation return
  const animateRubberBandReturn = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const animate = () => {
      rubberBandRef.current.x *= 0.85
      rubberBandRef.current.y *= 0.85

      if (Math.abs(rubberBandRef.current.x) < 0.5) rubberBandRef.current.x = 0
      if (Math.abs(rubberBandRef.current.y) < 0.5) rubberBandRef.current.y = 0

      viewport.style.transform = `translate3d(${rubberBandRef.current.x}px, ${rubberBandRef.current.y}px, 0)`

      if (rubberBandRef.current.x !== 0 || rubberBandRef.current.y !== 0) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        viewport.style.transform = ""
        isAtBoundaryRef.current = false
      }
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [])

  // Handle scroll events
  const handleScroll = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    // Mark as scrolling
    setIsScrolling(true)
    clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      // Trigger rubber band return when scrolling stops
      if (isAtBoundaryRef.current) {
        animateRubberBandReturn()
      }
    }, 150)

    updateShadows()
    checkNearEnd()
    onScroll?.(viewport.scrollTop, viewport.scrollLeft)
  }, [updateShadows, checkNearEnd, onScroll, animateRubberBandReturn])

  // Handle wheel events for rubber band and momentum
  const handleWheel = React.useCallback((e: WheelEvent) => {
    if (!rubberBand) return

    const viewport = viewportRef.current
    if (!viewport) return

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = viewport
    const maxScrollTop = scrollHeight - clientHeight
    const maxScrollLeft = scrollWidth - clientWidth

    // Check boundaries
    const atTop = scrollTop <= 0 && e.deltaY < 0
    const atBottom = scrollTop >= maxScrollTop && e.deltaY > 0
    const atLeft = scrollLeft <= 0 && e.deltaX < 0
    const atRight = scrollLeft >= maxScrollLeft && e.deltaX > 0

    if (atTop || atBottom || atLeft || atRight) {
      // Detect if this is a trackpad scroll (smaller delta values)
      const isTrackpad = Math.abs(e.deltaY) < 50 || e.deltaX !== 0

      if (isTrackpad) {
        e.preventDefault()
        isAtBoundaryRef.current = true

        const maxRubberBand = 100
        const elasticity = 0.3

        if (atTop || atBottom) {
          rubberBandRef.current.y += e.deltaY * elasticity
          rubberBandRef.current.y = Math.max(-maxRubberBand, Math.min(maxRubberBand, rubberBandRef.current.y))
          onBoundary?.(atTop ? "top" : "bottom")
        }

        if (atLeft || atRight) {
          rubberBandRef.current.x += e.deltaX * elasticity
          rubberBandRef.current.x = Math.max(-maxRubberBand, Math.min(maxRubberBand, rubberBandRef.current.x))
          onBoundary?.(atLeft ? "left" : "right")
        }

        viewport.style.transform = `translate3d(${rubberBandRef.current.x}px, ${rubberBandRef.current.y}px, 0)`
      }
    }
  }, [rubberBand, onBoundary])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNav) return

    const viewport = viewportRef.current
    if (!viewport) return

    const pageSize = viewport.clientHeight * 0.9

    switch (e.key) {
      case "PageUp":
        e.preventDefault()
        viewport.scrollBy({ top: -pageSize, behavior: "smooth" })
        break
      case "PageDown":
        e.preventDefault()
        viewport.scrollBy({ top: pageSize, behavior: "smooth" })
        break
      case "Home":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          viewport.scrollTo({ top: 0, behavior: "smooth" })
        }
        break
      case "End":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
        }
        break
    }
  }, [keyboardNav])

  // Imperative handle for external control
  React.useImperativeHandle(ref, () => ({
    scrollTo: (options) => {
      const viewport = viewportRef.current
      if (!viewport) return

      if (options.behavior === "instant") {
        if (options.top !== undefined) viewport.scrollTop = options.top
        if (options.left !== undefined) viewport.scrollLeft = options.left
      } else {
        viewport.scrollTo({
          top: options.top,
          left: options.left,
          behavior: "smooth",
        })
      }
    },
    scrollToTop: () => {
      viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    },
    scrollToBottom: () => {
      const viewport = viewportRef.current
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
      }
    },
    pageUp: () => {
      const viewport = viewportRef.current
      if (viewport) {
        viewport.scrollBy({ top: -viewport.clientHeight * 0.9, behavior: "smooth" })
      }
    },
    pageDown: () => {
      const viewport = viewportRef.current
      if (viewport) {
        viewport.scrollBy({ top: viewport.clientHeight * 0.9, behavior: "smooth" })
      }
    },
    getScrollPosition: () => {
      const viewport = viewportRef.current
      return {
        top: viewport?.scrollTop ?? 0,
        left: viewport?.scrollLeft ?? 0,
      }
    },
    getViewport: () => viewportRef.current,
  }), [])

  // Set up event listeners
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.addEventListener("scroll", handleScroll, { passive: true })
    viewport.addEventListener("wheel", handleWheel, { passive: false })

    // Initial shadow state
    updateShadows()

    return () => {
      viewport.removeEventListener("scroll", handleScroll)
      viewport.removeEventListener("wheel", handleWheel)
      clearTimeout(scrollTimeoutRef.current)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleScroll, handleWheel, updateShadows])

  // Build class names
  const scrollSnapClass = snap
    ? orientation === "horizontal"
      ? snap === "proximity" ? "scroll-snap-x-proximity" : "scroll-snap-x"
      : snap === "proximity" ? "scroll-snap-y-proximity" : "scroll-snap-y"
    : ""

  const shadowClasses = showShadows ? cn(
    "scroll-shadow",
    orientation === "horizontal" && "scroll-shadow-horizontal",
    shadows.top && "shadow-top",
    shadows.bottom && "shadow-bottom",
    shadows.left && "shadow-left",
    shadows.right && "shadow-right",
  ) : ""

  const scrollbarClass = autoHideScrollbar ? "scrollbar-autohide" : "scrollbar-macos"

  return (
    <ScrollAreaPrimitive.Root
      ref={rootRef}
      className={cn(
        "relative overflow-hidden",
        showShadows && shadowClasses,
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={keyboardNav ? 0 : undefined}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className={cn(
          "h-full w-full rounded-[inherit]",
          momentum && "scroll-momentum",
          scrollSnapClass,
          scrollbarClass,
          isScrolling && "is-scrolling"
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(orientation === "vertical" || orientation === "both") && (
        <ScrollBar
          orientation="vertical"
          size={scrollbarSize}
          autoHide={autoHideScrollbar}
        />
      )}
      {(orientation === "horizontal" || orientation === "both") && (
        <ScrollBar
          orientation="horizontal"
          size={scrollbarSize}
          autoHide={autoHideScrollbar}
        />
      )}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = "ScrollArea"

// ============================================================================
// ScrollBar Component
// ============================================================================

interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> {
  size?: "thin" | "default"
  autoHide?: boolean
}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", size = "default", autoHide = true, ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-all duration-200",
      orientation === "vertical" &&
        cn(
          "h-full border-l border-l-transparent p-[1px]",
          size === "thin" ? "w-1.5" : "w-2"
        ),
      orientation === "horizontal" &&
        cn(
          "flex-col border-t border-t-transparent p-[1px]",
          size === "thin" ? "h-1.5" : "h-2"
        ),
      autoHide && "opacity-0 hover:opacity-100 data-[state=visible]:opacity-100",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative flex-1 rounded-full",
        "bg-white/25 hover:bg-white/40 active:bg-white/50",
        "transition-colors duration-150"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

// ============================================================================
// ScrollSnapItem Component - for use inside ScrollArea with snap enabled
// ============================================================================

interface ScrollSnapItemProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end"
}

const ScrollSnapItem = React.forwardRef<HTMLDivElement, ScrollSnapItemProps>(
  ({ className, align = "start", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        align === "start" && "scroll-snap-start",
        align === "center" && "scroll-snap-center",
        align === "end" && "scroll-snap-end",
        className
      )}
      {...props}
    />
  )
)
ScrollSnapItem.displayName = "ScrollSnapItem"

// ============================================================================
// InfiniteScrollLoader - loading indicator for infinite scroll
// ============================================================================

interface InfiniteScrollLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean
}

const InfiniteScrollLoader = React.forwardRef<HTMLDivElement, InfiniteScrollLoaderProps>(
  ({ className, loading = true, ...props }, ref) => {
    if (!loading) return null

    return (
      <div
        ref={ref}
        className={cn("scroll-loading", className)}
        {...props}
      >
        <div className="scroll-loading-spinner" />
      </div>
    )
  }
)
InfiniteScrollLoader.displayName = "InfiniteScrollLoader"

// ============================================================================
// Exports
// ============================================================================

export { ScrollArea, ScrollBar, ScrollSnapItem, InfiniteScrollLoader }
