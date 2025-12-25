import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { useDock } from '@/contexts/DockContext';
import { cn } from '@/lib/utils';

interface DockItemProps {
  id?: string;
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
  bgGradient?: string;
  isActive?: boolean;
  isDraggable?: boolean;
  isLaunching?: boolean; // Bounce animation when launching
  introAnimation?: boolean; // Slide-in animation on intro
  introDelay?: number; // Delay for staggered intro animation
  isFocused?: boolean; // Keyboard navigation focus state
  tabIndex?: number; // For roving tabindex pattern
  onRegisterRef?: (ref: HTMLButtonElement | null) => void; // Register ref for focus management
  // Magnification props
  mouseX?: number | null; // Mouse X position relative to dock
  index?: number; // Item index in dock for position calculation
  magnificationEnabled?: boolean; // Whether magnification is active
  baseSize?: number; // Base icon size in pixels
  maxSize?: number; // Maximum magnified size in pixels
}

const DockItem: React.FC<DockItemProps> = ({
  id,
  icon: Icon,
  customIcon,
  label,
  color,
  onClick,
  bgGradient,
  isActive = false,
  isDraggable = true,
  isLaunching = false,
  introAnimation = false,
  introDelay = 0,
  isFocused = false,
  tabIndex,
  onRegisterRef,
  mouseX = null,
  index = 0,
  magnificationEnabled = false,
  baseSize = 48,
  maxSize = 72
}) => {
  const isMobile = useIsMobile();
  const { reorderItems, removeFromDock, isItemPinned, pinItem, unpinItem } = useDock();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [hasIntroAnimated, setHasIntroAnimated] = useState(!introAnimation);
  const dragRef = useRef<HTMLButtonElement>(null);

  // Handle bounce animation when launching
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isLaunching && !isBouncing) {
      setIsBouncing(true);
      // Stop bouncing after animation
      timer = setTimeout(() => setIsBouncing(false), 800);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLaunching, isBouncing]);

  // Handle intro animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (introAnimation && !hasIntroAnimated) {
      timer = setTimeout(() => setHasIntroAnimated(true), introDelay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [introAnimation, introDelay, hasIntroAnimated]);

  // Register ref for keyboard navigation focus management
  useEffect(() => {
    if (onRegisterRef) {
      onRegisterRef(dragRef.current);
    }
    return () => {
      if (onRegisterRef) {
        onRegisterRef(null);
      }
    };
  }, [onRegisterRef]);

  // Calculate hover scale based on distance from mouse
  const getHoverScale = (): number => {
    if (!magnificationEnabled || mouseX === null || isMobile || !dragRef.current) {
      return 1;
    }

    // Get actual element position relative to dock
    const dock = dragRef.current.closest('[data-dock]');
    if (!dock) return 1;

    const dockRect = dock.getBoundingClientRect();
    const itemRect = dragRef.current.getBoundingClientRect();
    const itemCenter = (itemRect.left + itemRect.width / 2) - dockRect.left;

    // Distance from mouse to item center
    const distance = Math.abs(mouseX - itemCenter);

    // Magnification range - affects nearby items
    const itemWidth = baseSize + 8;
    const magnificationRange = itemWidth * 2;

    if (distance > magnificationRange) {
      return 1;
    }

    // Scale: max 33% increase (1.33) using smooth cosine curve
    const scaleFactor = Math.cos((distance / magnificationRange) * (Math.PI / 2));
    return 1 + (0.33 * scaleFactor); // 1.0 to 1.33 (33% max)
  };

  const hoverScale = getHoverScale();

  // Calculate horizontal padding to push icons apart (dock stays same height, icons grow upward)
  const getHorizontalPadding = (): number => {
    if (!magnificationEnabled || isMobile) return 0;
    const base = 48; // base icon size
    // Add padding equal to half the size increase on each side
    return ((hoverScale - 1) * base) / 2;
  };

  const horizontalPadding = getHorizontalPadding();

  // Get dynamic icon size based on device
  const getIconSize = () => {
    return isMobile ? 'w-11 h-11' : 'w-12 h-12';
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!id || !isDraggable) return;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);

    // Create a custom drag image
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, rect.height / 2);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDropTarget(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!id || !isDraggable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!id || !isDraggable) return;
    e.preventDefault();
    const dragId = e.dataTransfer.getData('text/plain');
    if (dragId && dragId !== id) {
      reorderItems(dragId, id);
    }
    setIsDropTarget(false);
  };

  const handleRemove = () => {
    if (id) {
      removeFromDock(id);
    }
  };

  const handlePin = () => {
    if (id) {
      pinItem(id);
    }
  };

  const handleUnpin = () => {
    if (id) {
      unpinItem(id);
    }
  };

  const isPinned = id ? isItemPinned(id) : false;
  const canRemove = id !== 'finder'; // Finder cannot be removed

  // Handle keyboard activation (Enter/Space)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const button = (
    <button
      ref={dragRef}
      className={cn(
        "group relative flex items-end justify-center",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl",
        isFocused && "ring-2 ring-white/70 ring-offset-2 ring-offset-transparent",
        isDragging && "opacity-50",
        isBouncing && "animate-dock-bounce",
        introAnimation && !hasIntroAnimated && "opacity-0 translate-y-8",
        introAnimation && hasIntroAnimated && "opacity-100 translate-y-0 transition-all duration-500 ease-out"
      )}
      style={magnificationEnabled && !isMobile ? {
        paddingLeft: `${horizontalPadding}px`,
        paddingRight: `${horizontalPadding}px`,
        transition: 'padding 100ms ease-out'
      } : { paddingLeft: '2px', paddingRight: '2px' }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-label={`Open ${label}`}
      draggable={isDraggable && !isMobile && !!id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl overflow-hidden",
          getIconSize(),
          !magnificationEnabled && "transition-transform duration-150 ease-out group-hover:scale-110",
          magnificationEnabled && "transition-transform duration-100 ease-out origin-bottom",
          "group-active:scale-95",
          bgGradient || '',
          isDropTarget && "ring-2 ring-white/50 scale-110",
          isDragging && "scale-90"
        )}
        style={magnificationEnabled && !isMobile ? {
          transform: `scale(${hoverScale})`,
        } : undefined}
      >
        {customIcon ? (
          <div className="w-full h-full flex items-center justify-center">
            {customIcon}
          </div>
        ) : Icon ? (
          <Icon className={`w-6 h-6 ${color || 'text-white'}`} />
        ) : null}
      </div>
      {/* Active indicator dot - macOS style */}
      <div className={cn(
        "absolute -bottom-[6px] w-[5px] h-[5px] rounded-full bg-white/90 transition-all duration-200",
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      )} />
    </button>
  );

  // On mobile or for non-draggable items, just use tooltip
  if (isMobile || !id) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Desktop with context menu
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm">
            {label}
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-black/90 backdrop-blur-xl border-white/20 text-white">
        <ContextMenuItem onClick={onClick} className="hover:bg-white/10 focus:bg-white/10">
          Open {label}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/20" />
        {isPinned ? (
          <ContextMenuItem
            onClick={handleUnpin}
            className="hover:bg-white/10 focus:bg-white/10"
            disabled={id === 'finder'}
          >
            Unpin from Dock
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={handlePin} className="hover:bg-white/10 focus:bg-white/10">
            Keep in Dock
          </ContextMenuItem>
        )}
        {canRemove && (
          <ContextMenuItem
            onClick={handleRemove}
            className="hover:bg-white/10 focus:bg-white/10 text-red-400 focus:text-red-400"
          >
            Remove from Dock
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default DockItem;
