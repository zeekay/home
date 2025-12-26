import React, { useRef, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import { MacTrashIcon } from './icons';
import { cn } from '@/lib/utils';

interface TrashItemProps {
  isFocused?: boolean;
  tabIndex?: number;
  onRegisterRef?: (ref: HTMLButtonElement | null) => void;
  onOpenTrash?: () => void; // Opens Finder with Trash folder
  // Magnification props
  mouseX?: number | null;
  index?: number;
  magnificationEnabled?: boolean;
  baseSize?: number;
  maxSize?: number;
}

const TrashItem: React.FC<TrashItemProps> = ({
  isFocused = false,
  tabIndex,
  onRegisterRef,
  onOpenTrash,
  mouseX = null,
  index = 0,
  magnificationEnabled = false,
  baseSize = 48,
  maxSize = 72
}) => {
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Register ref for keyboard navigation
  useEffect(() => {
    if (onRegisterRef) {
      onRegisterRef(buttonRef.current);
    }
    return () => {
      if (onRegisterRef) {
        onRegisterRef(null);
      }
    };
  }, [onRegisterRef]);

  const handleTrashClick = () => {
    onOpenTrash?.(); // Open Finder with Trash folder
  };

  // Calculate hover scale based on distance from mouse
  const getHoverScale = (): number => {
    if (!magnificationEnabled || mouseX === null || isMobile || !buttonRef.current) {
      return 1;
    }

    // Get actual element position relative to dock
    const dock = buttonRef.current.closest('[data-dock]');
    if (!dock) return 1;

    const dockRect = dock.getBoundingClientRect();
    const itemRect = buttonRef.current.getBoundingClientRect();
    const itemCenter = (itemRect.left + itemRect.width / 2) - dockRect.left;

    // Distance from mouse to item center
    const distance = Math.abs(mouseX - itemCenter);

    // Magnification range - affects nearby items
    const itemWidth = baseSize + 8;
    const magnificationRange = itemWidth * 2;

    if (distance > magnificationRange) {
      return 1;
    }

    const scaleFactor = Math.cos((distance / magnificationRange) * (Math.PI / 2));
    return 1 + (0.33 * scaleFactor); // 1.0 to 1.33 (33% max)
  };

  const hoverScale = getHoverScale();

  // Calculate horizontal padding to push icons apart (dock stays same height, icons grow upward)
  const getHorizontalPadding = (): number => {
    if (!magnificationEnabled || isMobile) return 0;
    const base = 48; // base icon size
    return ((hoverScale - 1) * base) / 2;
  };

  const horizontalPadding = getHorizontalPadding();

  // Calculate tooltip offset based on magnification
  const getTooltipOffset = (): number => {
    if (!magnificationEnabled || isMobile) return 8;
    const extraHeight = (hoverScale - 1) * baseSize;
    return 8 + extraHeight;
  };

  const tooltipOffset = getTooltipOffset();

  // Match DockItem sizing
  const getIconSize = () => {
    return isMobile ? 'w-11 h-11' : 'w-12 h-12';
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            className={cn(
              "group relative flex items-end justify-center rounded-xl",
              // Remove ALL focus/outline/ring styling completely
              "outline-none ring-0 shadow-none",
              "[&]:outline-none [&]:ring-0 [&]:shadow-none [&]:border-0",
              "[&:focus]:outline-none [&:focus]:ring-0 [&:focus]:shadow-none [&:focus]:border-0",
              "[&:focus-visible]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:shadow-none [&:focus-visible]:border-0",
              "[&:active]:outline-none [&:active]:ring-0 [&:active]:shadow-none [&:active]:border-0"
              // No visible focus indicator - rely on scale animation instead
            )}
            style={magnificationEnabled && !isMobile ? {
              paddingLeft: `${horizontalPadding}px`,
              paddingRight: `${horizontalPadding}px`,
              transition: 'padding 100ms ease-out'
            } : { paddingLeft: '2px', paddingRight: '2px' }}
            onClick={handleTrashClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrashClick();
              }
            }}
            tabIndex={tabIndex}
            aria-label="Open Trash"
          >
            <div
              className={cn(
                "flex items-center justify-center",
                getIconSize(),
                !magnificationEnabled && "transition-transform duration-150 ease-out group-hover:scale-110",
                magnificationEnabled && "transition-transform duration-100 ease-out origin-bottom",
                "group-active:scale-95"
              )}
              style={magnificationEnabled && !isMobile ? {
                transform: `scale(${hoverScale})`,
              } : undefined}
            >
              <MacTrashIcon className="w-full h-full" />
            </div>
            {/* Active indicator dot */}
            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={isMobile ? "bottom" : "top"}
          sideOffset={tooltipOffset}
          className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm"
        >
          Trash
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default TrashItem;
