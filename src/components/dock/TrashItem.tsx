import React, { useRef, useEffect, useCallback } from 'react';
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
import { MacTrashIcon } from './icons';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';

interface TrashItemProps {
  isFocused?: boolean;
  tabIndex?: number;
  onRegisterRef?: (ref: HTMLButtonElement | null) => void;
  onOpenTrash?: () => void;
  onEmptyTrash?: () => void;
  isEmpty?: boolean;
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
  onEmptyTrash,
  isEmpty = true,
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
    onOpenTrash?.();
  };

  // Smooth magnification calculation
  const getHoverScale = useCallback((): number => {
    if (!magnificationEnabled || mouseX === null || isMobile || !buttonRef.current) {
      return 1;
    }

    const dock = buttonRef.current.closest('[data-dock]');
    if (!dock) return 1;

    const dockRect = dock.getBoundingClientRect();
    const itemRect = buttonRef.current.getBoundingClientRect();
    const itemCenter = (itemRect.left + itemRect.width / 2) - dockRect.left;

    const distance = Math.abs(mouseX - itemCenter);
    const itemWidth = baseSize + 8;
    const magnificationRange = itemWidth * 2.5;

    if (distance > magnificationRange) {
      return 1;
    }

    const progress = 1 - (distance / magnificationRange);
    const easedProgress = Math.cos((1 - progress) * Math.PI / 2);

    const maxScale = maxSize / baseSize;
    return 1 + (maxScale - 1) * easedProgress;
  }, [magnificationEnabled, mouseX, isMobile, baseSize, maxSize]);

  const hoverScale = getHoverScale();

  const getHorizontalPadding = useCallback((): number => {
    if (!magnificationEnabled || isMobile) return 0;
    return ((hoverScale - 1) * baseSize) / 2;
  }, [magnificationEnabled, isMobile, hoverScale, baseSize]);

  const horizontalPadding = getHorizontalPadding();

  const getTooltipOffset = useCallback((): number => {
    if (!magnificationEnabled || isMobile) return 8;
    const extraHeight = (hoverScale - 1) * baseSize;
    return 8 + extraHeight;
  }, [magnificationEnabled, isMobile, hoverScale, baseSize]);

  const tooltipOffset = getTooltipOffset();

  const getIconSize = () => {
    return isMobile ? 'w-11 h-11' : 'w-12 h-12';
  };

  // Handle drag over for drop target styling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // In a full implementation, this would move the dragged item to trash
  };

  const button = (
    <button
      ref={buttonRef}
      className={cn(
        "group relative flex items-end justify-center rounded-xl",
        "outline-none ring-0 shadow-none",
        "[&]:outline-none [&]:ring-0 [&]:shadow-none [&]:border-0",
        "[&:focus]:outline-none [&:focus]:ring-0 [&:focus]:shadow-none [&:focus]:border-0",
        "[&:focus-visible]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:shadow-none [&:focus-visible]:border-0",
        "[&:active]:outline-none [&:active]:ring-0 [&:active]:shadow-none [&:active]:border-0"
      )}
      style={{
        paddingLeft: magnificationEnabled && !isMobile ? `${horizontalPadding}px` : '2px',
        paddingRight: magnificationEnabled && !isMobile ? `${horizontalPadding}px` : '2px',
        transition: 'padding 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={handleTrashClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTrashClick();
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      tabIndex={tabIndex}
      aria-label={isEmpty ? "Trash (empty)" : "Trash"}
    >
      <div
        className={cn(
          "flex items-center justify-center relative",
          getIconSize(),
          !magnificationEnabled && "transition-transform duration-150 ease-out group-hover:scale-110",
          magnificationEnabled && "transition-transform duration-150 ease-out origin-bottom",
          "group-active:scale-95"
        )}
        style={magnificationEnabled && !isMobile ? {
          transform: `scale(${hoverScale})`,
          willChange: 'transform',
        } : undefined}
      >
        <MacTrashIcon className="w-full h-full" full={!isEmpty} />

        {/* Subtle reflection effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            borderRadius: 'inherit',
          }}
        />
      </div>
    </button>
  );

  // Mobile: simple tooltip
  if (isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={tooltipOffset}
          className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm font-medium shadow-lg"
        >
          Trash
        </TooltipContent>
      </Tooltip>
    );
  }

  // Desktop: context menu
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={tooltipOffset}
            className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm font-medium shadow-lg"
          >
            Trash
          </TooltipContent>
        </Tooltip>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-black/95 backdrop-blur-xl border-white/20 text-white rounded-lg shadow-xl">
        <ContextMenuItem
          onClick={handleTrashClick}
          className="hover:bg-white/10 focus:bg-white/10"
        >
          Open
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/10 my-1" />
        <ContextMenuItem
          onClick={() => {
            if (!isEmpty) {
              playSound('trashEmpty');
              onEmptyTrash?.();
            }
          }}
          className="hover:bg-white/10 focus:bg-white/10"
          disabled={isEmpty}
        >
          Empty Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default TrashItem;
