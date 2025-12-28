import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LucideIcon, Info } from 'lucide-react';
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
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getAppMenuConfig } from '@/config/appMenus';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDock } from '@/contexts/DockContext';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import AboutAppDialog from '@/components/AboutAppDialog';

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
  isLaunching?: boolean;
  requestingAttention?: boolean; // Continuous bounce for attention
  introAnimation?: boolean;
  introDelay?: number;
  isFocused?: boolean;
  tabIndex?: number;
  onRegisterRef?: (ref: HTMLButtonElement | null) => void;
  // Magnification props
  mouseX?: number | null;
  index?: number;
  magnificationEnabled?: boolean;
  baseSize?: number;
  maxSize?: number;
  // Drag state from parent
  isDragActive?: boolean;
  dragOverIndex?: number | null;
  onDragStateChange?: (isDragging: boolean, index: number) => void;
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
  requestingAttention = false,
  introAnimation = false,
  introDelay = 0,
  isFocused = false,
  tabIndex,
  onRegisterRef,
  mouseX = null,
  index = 0,
  magnificationEnabled = false,
  baseSize = 48,
  maxSize = 72,
  isDragActive = false,
  dragOverIndex = null,
  onDragStateChange,
}) => {
  const isMobile = useIsMobile();
  const { reorderItems, removeFromDock, isItemPinned, pinItem, unpinItem } = useDock();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isAttentionBouncing, setIsAttentionBouncing] = useState(false);
  const [hasIntroAnimated, setHasIntroAnimated] = useState(!introAnimation);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLButtonElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  // Handle launch bounce animation
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isLaunching && !isBouncing) {
      setIsBouncing(true);
      playSound('dockBounce');
      timer = setTimeout(() => setIsBouncing(false), 800);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLaunching, isBouncing]);

  // Handle attention bounce animation (continuous until dismissed)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (requestingAttention && !isAttentionBouncing) {
      setIsAttentionBouncing(true);
      // Bounce every 2 seconds while requesting attention
      interval = setInterval(() => {
        setIsAttentionBouncing(false);
        setTimeout(() => setIsAttentionBouncing(true), 100);
      }, 2000);
    } else if (!requestingAttention) {
      setIsAttentionBouncing(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [requestingAttention, isAttentionBouncing]);

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

  // Register ref for keyboard navigation
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

  // Smooth magnification with spring physics
  const getHoverScale = useCallback((): number => {
    if (!magnificationEnabled || mouseX === null || isMobile || !dragRef.current) {
      return 1;
    }

    const dock = dragRef.current.closest('[data-dock]');
    if (!dock) return 1;

    const dockRect = dock.getBoundingClientRect();
    const itemRect = dragRef.current.getBoundingClientRect();
    const itemCenter = (itemRect.left + itemRect.width / 2) - dockRect.left;

    const distance = Math.abs(mouseX - itemCenter);
    const itemWidth = baseSize + 8;
    // Wider magnification range for smoother effect
    const magnificationRange = itemWidth * 2.5;

    if (distance > magnificationRange) {
      return 1;
    }

    // Smoother easing curve using cosine
    const progress = 1 - (distance / magnificationRange);
    const easedProgress = Math.cos((1 - progress) * Math.PI / 2);

    // Calculate scale based on max size ratio
    const maxScale = maxSize / baseSize;
    return 1 + (maxScale - 1) * easedProgress;
  }, [magnificationEnabled, mouseX, isMobile, baseSize, maxSize]);

  const hoverScale = getHoverScale();

  // Calculate horizontal padding for icon separation
  const getHorizontalPadding = useCallback((): number => {
    if (!magnificationEnabled || isMobile) return 0;
    return ((hoverScale - 1) * baseSize) / 2;
  }, [magnificationEnabled, isMobile, hoverScale, baseSize]);

  const horizontalPadding = getHorizontalPadding();

  // Tooltip offset based on magnification
  const getTooltipOffset = useCallback((): number => {
    if (!magnificationEnabled || isMobile) return 8;
    const extraHeight = (hoverScale - 1) * baseSize;
    return 8 + extraHeight;
  }, [magnificationEnabled, isMobile, hoverScale, baseSize]);

  const tooltipOffset = getTooltipOffset();

  const getIconSize = () => {
    return isMobile ? 'w-11 h-11' : 'w-12 h-12';
  };

  // Drag handlers with visual feedback
  const handleDragStart = (e: React.DragEvent) => {
    if (!id || !isDraggable) return;
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStateChange?.(true, index);

    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, rect.height / 2);
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDropTarget(false);
    onDragStateChange?.(false, index);
    dragStartPos.current = null;
    setDragOffset({ x: 0, y: 0 });
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
  const canRemove = id !== 'finder';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Determine if this item should shift during drag
  const shouldShift = isDragActive && dragOverIndex !== null && index !== dragOverIndex;
  const shiftDirection = shouldShift && dragOverIndex !== null ? (index > dragOverIndex ? 1 : -1) : 0;

  const button = (
    <button
      ref={dragRef}
      data-dock-item
      className={cn(
        "group relative flex items-end justify-center rounded-xl",
        "outline-none ring-0 shadow-none",
        "[&]:outline-none [&]:ring-0 [&]:shadow-none [&]:border-0",
        "[&:focus]:outline-none [&:focus]:ring-0 [&:focus]:shadow-none [&:focus]:border-0",
        "[&:focus-visible]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:shadow-none [&:focus-visible]:border-0",
        "[&:active]:outline-none [&:active]:ring-0 [&:active]:shadow-none [&:active]:border-0",
        isDragging && "opacity-50 scale-110",
        (isBouncing || isAttentionBouncing) && "animate-dock-bounce",
        introAnimation && !hasIntroAnimated && "opacity-0 translate-y-8",
        introAnimation && hasIntroAnimated && "opacity-100 translate-y-0 transition-all duration-500 ease-out"
      )}
      style={{
        paddingLeft: magnificationEnabled && !isMobile ? `${horizontalPadding}px` : '2px',
        paddingRight: magnificationEnabled && !isMobile ? `${horizontalPadding}px` : '2px',
        transition: 'padding 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: shouldShift ? `translateX(${shiftDirection * 20}px)` : undefined,
      }}
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
          "flex items-center justify-center rounded-xl overflow-hidden relative",
          getIconSize(),
          !magnificationEnabled && "transition-transform duration-150 ease-out group-hover:scale-110",
          magnificationEnabled && "transition-transform duration-150 ease-out origin-bottom",
          "group-active:scale-95",
          bgGradient || '',
          isDropTarget && "ring-2 ring-white/50 scale-110",
          isDragging && "scale-90"
        )}
        style={magnificationEnabled && !isMobile ? {
          transform: `scale(${hoverScale})`,
          willChange: 'transform',
        } : undefined}
      >
        {customIcon ? (
          <div className="w-full h-full flex items-center justify-center">
            {customIcon}
          </div>
        ) : Icon ? (
          <Icon className={`w-6 h-6 ${color || 'text-white'}`} />
        ) : null}

        {/* Subtle reflection effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
            borderRadius: 'inherit',
          }}
        />
      </div>

      {/* Active indicator dot - macOS style */}
      <div className={cn(
        "absolute -bottom-[6px] w-[5px] h-[5px] rounded-full bg-white/90 transition-all duration-200 shadow-sm",
        isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      )} />
    </button>
  );

  // Mobile or non-draggable items: simple tooltip
  if (isMobile || !id) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent
          side={isMobile ? "bottom" : "top"}
          sideOffset={tooltipOffset}
          className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm font-medium shadow-lg"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Desktop with context menu
  return (
    <>
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
              {label}
            </TooltipContent>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56 bg-black/95 backdrop-blur-xl border-white/20 text-white rounded-lg shadow-xl">
          {/* App-specific menu items */}
          {(() => {
            const menuConfig = id ? getAppMenuConfig(id) : null;
            if (!menuConfig) return null;

            return menuConfig.items.map((item, idx) => {
              if (item.separator) {
                return <ContextMenuSeparator key={idx} className="bg-white/10 my-1" />;
              }
              return (
                <ContextMenuItem
                  key={idx}
                  onClick={() => {
                    if (item.action === 'new' || item.action === 'showAll') {
                      onClick?.();
                    }
                  }}
                  className="hover:bg-white/10 focus:bg-white/10 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {item.shortcut && (
                    <span className="text-white/40 text-xs ml-4">{item.shortcut}</span>
                  )}
                </ContextMenuItem>
              );
            });
          })()}

          {/* Open Recent submenu */}
          {id && getAppMenuConfig(id)?.hasRecents && (
            <>
              <ContextMenuSeparator className="bg-white/10 my-1" />
              <ContextMenuSub>
                <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
                  Open Recent
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48 bg-black/95 backdrop-blur-xl border-white/20 text-white rounded-lg">
                  <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10 text-white/50">
                    No Recent Items
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/10 my-1" />
                  <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
                    Clear Menu
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}

          <ContextMenuSeparator className="bg-white/10 my-1" />

          {/* Options section */}
          <ContextMenuSub>
            <ContextMenuSubTrigger className="hover:bg-white/10 focus:bg-white/10">
              Options
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 bg-black/95 backdrop-blur-xl border-white/20 text-white rounded-lg">
              {isPinned ? (
                <ContextMenuItem
                  onClick={handleUnpin}
                  className="hover:bg-white/10 focus:bg-white/10"
                  disabled={id === 'finder'}
                >
                  Remove from Dock
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={handlePin} className="hover:bg-white/10 focus:bg-white/10">
                  Keep in Dock
                </ContextMenuItem>
              )}
              <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
                Open at Login
              </ContextMenuItem>
              <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
                Show in Finder
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator className="bg-white/10 my-1" />

          {/* Show All Windows / Hide */}
          <ContextMenuItem onClick={onClick} className="hover:bg-white/10 focus:bg-white/10">
            Show All Windows
          </ContextMenuItem>
          <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
            Hide
          </ContextMenuItem>

          {/* About */}
          <ContextMenuSeparator className="bg-white/10 my-1" />
          <ContextMenuItem
            onClick={() => setShowAboutDialog(true)}
            className="hover:bg-white/10 focus:bg-white/10 flex items-center gap-2"
          >
            <Info className="w-3.5 h-3.5 text-white/60" />
            About {label}
          </ContextMenuItem>

          {/* Quit */}
          {id !== 'finder' && (
            <>
              <ContextMenuSeparator className="bg-white/10 my-1" />
              <ContextMenuItem className="hover:bg-white/10 focus:bg-white/10">
                Quit
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* About Dialog */}
      <AboutAppDialog
        appId={id || label.toLowerCase().replace(/\s+/g, '')}
        appName={label}
        isOpen={showAboutDialog}
        onClose={() => setShowAboutDialog(false)}
      />
    </>
  );
};

export default DockItem;
