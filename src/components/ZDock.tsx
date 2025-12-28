import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import { useDesktopSettings } from '@/hooks/useDesktopSettings';
import DockItem from './dock/DockItem';
import TrashItem from './dock/TrashItem';
import MobileOverflow from './dock/MobileOverflow';
import { createDockItems, DockItemType, DockCallbacks } from './dock/dockData';
import { useDock } from '@/contexts/DockContext';
import {
  FinderIcon,
  SafariIcon,
  MailIcon,
  PhotosIcon,
  CalendarIcon,
  SocialsIcon,
  PhoneIcon,
  MusicIcon,
  TerminalIcon,
  TextEditIcon,
  HanzoLogo,
  LuxLogo,
  ZooLogo,
  MacFolderIcon,
} from './dock/icons';

interface ZDockProps extends DockCallbacks {
  className?: string;
  onApplicationsClick?: () => void;
  onDownloadsClick?: () => void;
  onTrashClick?: () => void;
  onEmptyTrash?: () => void;
  activeApps?: string[];
  launchingApp?: string | null;
  attentionApps?: string[]; // Apps requesting attention (continuous bounce)
  recentApps?: string[]; // Recently used apps (shown after separator)
  introAnimation?: boolean;
  trashEmpty?: boolean;
}

// Map of item IDs to their custom icon components
const getIconComponent = (id: string): React.ReactNode => {
  switch (id) {
    case 'finder':
      return <FinderIcon className="w-full h-full" />;
    case 'safari':
      return <SafariIcon className="w-full h-full" />;
    case 'mail':
      return <MailIcon className="w-full h-full" />;
    case 'photos':
      return <PhotosIcon className="w-full h-full" />;
    case 'calendar':
      return <CalendarIcon className="w-full h-full" />;
    case 'socials':
      return <SocialsIcon className="w-full h-full" />;
    case 'facetime':
      return <PhoneIcon className="w-full h-full" />;
    case 'music':
      return <MusicIcon className="w-full h-full" />;
    case 'terminal':
      return <TerminalIcon className="w-full h-full" />;
    case 'textedit':
      return <TextEditIcon className="w-full h-full" />;
    case 'hanzo':
      return <HanzoLogo className="w-full h-full text-white" />;
    case 'lux':
      return <LuxLogo className="w-full h-full text-white" />;
    case 'zoo':
      return <ZooLogo className="w-full h-full" />;
    default:
      return null;
  }
};

const ZDock: React.FC<ZDockProps> = ({
  className,
  onFinderClick,
  onSafariClick,
  onMailClick,
  onPhotosClick,
  onCalendarClick,
  onSocialsClick,
  onFaceTimeClick,
  onMusicClick,
  onTerminalClick,
  onTextEditClick,
  onHanzoClick,
  onLuxClick,
  onZooClick,
  onApplicationsClick,
  onDownloadsClick,
  onTrashClick,
  onEmptyTrash,
  activeApps = [],
  launchingApp,
  attentionApps = [],
  recentApps = [],
  introAnimation = false,
  trashEmpty = true,
}) => {
  const isMobile = useIsMobile();
  const { dockOrder, isItemInDock } = useDock();
  const { dockMagnification, dockMagnificationSize, dockSize, dockAutoHide, dockPosition } = useDesktopSettings();

  // Use smaller icons on mobile for better fit
  const effectiveDockSize = isMobile ? Math.min(dockSize, 40) : dockSize;

  // Track mouse position relative to dock for magnification
  const dockRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Auto-hide state
  const [isHidden, setIsHidden] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag state for smooth reordering
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Handle dock auto-hide
  useEffect(() => {
    if (!dockAutoHide || isMobile) {
      setIsHidden(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 10;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let shouldShow = false;

      if (dockPosition === 'bottom') {
        shouldShow = e.clientY >= viewportHeight - threshold;
      } else if (dockPosition === 'left') {
        shouldShow = e.clientX <= threshold;
      } else if (dockPosition === 'right') {
        shouldShow = e.clientX >= viewportWidth - threshold;
      }

      if (shouldShow || isHovering) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setIsHidden(false);
      } else if (!isHidden && !isHovering) {
        if (!hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setIsHidden(true);
            hideTimeoutRef.current = null;
          }, 1000);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [dockAutoHide, dockPosition, isHovering, isHidden, isMobile]);

  // Handle mouse movement for magnification effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockMagnification || isMobile) return;
    const rect = dockRef.current?.getBoundingClientRect();
    if (rect) {
      if (dockPosition === 'bottom') {
        setMouseX(e.clientX - rect.left);
      } else {
        setMouseY(e.clientY - rect.top);
      }
    }
  }, [dockMagnification, isMobile, dockPosition]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setMouseY(null);
    setIsHovering(false);
  }, []);

  // Register item ref for focus management
  const registerItemRef = useCallback((index: number, ref: HTMLButtonElement | null) => {
    if (ref) {
      itemRefs.current.set(index, ref);
    } else {
      itemRefs.current.delete(index);
    }
  }, []);

  // Focus the item at the given index
  const focusItem = useCallback((index: number) => {
    const ref = itemRefs.current.get(index);
    if (ref) {
      ref.focus();
      setFocusedIndex(index);
    }
  }, []);

  // Create all dock items
  const allDockItems = createDockItems({
    onFinderClick,
    onSafariClick,
    onMailClick,
    onPhotosClick,
    onCalendarClick,
    onSocialsClick,
    onFaceTimeClick,
    onMusicClick,
    onTerminalClick,
    onTextEditClick,
    onHanzoClick,
    onLuxClick,
    onZooClick
  });

  // Create a map of items by ID for quick lookup
  const itemsById = new Map(allDockItems.map(item => [item.id, item]));

  // Get ordered dock items based on dockOrder from context
  const getOrderedItems = () => {
    return dockOrder
      .filter(orderItem => itemsById.has(orderItem.id))
      .map(orderItem => itemsById.get(orderItem.id)!)
      .filter(item => isItemInDock(item.id));
  };

  const orderedItems = getOrderedItems();

  // Split items into main apps and hanzo/lux/zoo for separator placement
  const mainApps = orderedItems.filter(item =>
    !['hanzo', 'lux', 'zoo'].includes(item.id)
  );
  const customApps = orderedItems.filter(item =>
    ['hanzo', 'lux', 'zoo'].includes(item.id)
  );

  // Decide how many items to show directly in the dock based on screen size
  const getMainDockItems = () => {
    if (isMobile) {
      return mainApps.slice(0, 5);
    }
    return mainApps;
  };

  // Get overflow items for mobile
  const getOverflowItems = () => {
    if (isMobile) {
      return [...mainApps.slice(5), ...customApps];
    }
    return [];
  };

  const dockItems = getMainDockItems();
  const overflowItems = getOverflowItems();

  // Calculate total navigable items count
  const getTotalNavigableItems = useCallback(() => {
    let count = dockItems.length;
    if (isMobile) {
      count += 1; // Downloads folder
    } else {
      count += customApps.length; // Hanzo, Lux, Zoo
      count += 2; // Applications and Downloads folders
      count += 1; // Trash
      count += recentApps.length; // Recent apps
    }
    return count;
  }, [dockItems.length, customApps.length, isMobile, recentApps.length]);

  const totalItems = getTotalNavigableItems();

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (totalItems === 0) return;

    const isHorizontal = dockPosition === 'bottom';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    switch (e.key) {
      case nextKey: {
        e.preventDefault();
        const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + 1) % totalItems;
        focusItem(nextIndex);
        break;
      }
      case prevKey: {
        e.preventDefault();
        const prevIndex = focusedIndex <= 0 ? totalItems - 1 : focusedIndex - 1;
        focusItem(prevIndex);
        break;
      }
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(totalItems - 1);
        break;
    }
  }, [focusedIndex, totalItems, focusItem, dockPosition]);

  // Reset focused index when dock loses focus
  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Only reset if focus moved outside the dock
    if (!dockRef.current?.contains(e.relatedTarget as Node)) {
      setFocusedIndex(-1);
    }
  }, []);

  // Handle focus entering the dock
  const handleFocus = useCallback((e: React.FocusEvent) => {
    // If focus entered dock but no item is focused, find which item got focus
    if (focusedIndex < 0 && dockRef.current?.contains(e.target as Node)) {
      const focusedItem = Array.from(itemRefs.current.entries()).find(
        ([_, ref]) => ref === e.target
      );
      if (focusedItem) {
        setFocusedIndex(focusedItem[0]);
      }
    }
  }, [focusedIndex]);

  // Handle drag state changes for smooth reordering animation
  const handleDragStateChange = useCallback((isDragging: boolean, index: number) => {
    setIsDragActive(isDragging);
    if (isDragging) {
      setDragOverIndex(index);
    } else {
      setDragOverIndex(null);
    }
  }, []);

  // Track navigation index for each rendered item
  let currentNavIndex = 0;

  // Position styles based on dock position
  const getPositionStyles = (): React.CSSProperties => {
    const hideOffset = '-80px';

    if (dockPosition === 'bottom') {
      return {
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: isHidden ? hideOffset : (isMobile ? '10px' : '16px'),
        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    } else if (dockPosition === 'left') {
      return {
        left: isHidden ? hideOffset : '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    } else {
      return {
        right: isHidden ? hideOffset : '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
  };

  // Flex direction based on dock position
  const getFlexDirection = () => {
    return dockPosition === 'bottom' ? 'flex-row' : 'flex-col';
  };

  // Separator orientation based on dock position
  const separatorOrientation = dockPosition === 'bottom' ? 'vertical' : 'horizontal';
  const separatorClass = dockPosition === 'bottom' ? 'h-10 mx-1' : 'w-10 my-1';

  return (
    <TooltipProvider>
      <div
        ref={dockRef}
        data-dock
        data-genie-target
        role="toolbar"
        aria-label="Application dock"
        className={cn(
          'fixed',
          'inline-flex items-end justify-center',
          dockPosition !== 'bottom' && 'items-center',
          'px-2 py-2',
          'vibrancy-dock',
          'rounded-2xl',
          className
        )}
        style={{
          maxWidth: dockPosition === 'bottom' ? 'calc(100% - 16px)' : undefined,
          maxHeight: dockPosition !== 'bottom' ? 'calc(100% - 100px)' : undefined,
          width: dockPosition === 'bottom' ? 'max-content' : undefined,
          height: dockPosition !== 'bottom' ? 'max-content' : undefined,
          zIndex: 9999,
          ...getPositionStyles(),
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        {/* Reflection effect - subtle gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{
            background: dockPosition === 'bottom'
              ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)'
              : dockPosition === 'left'
              ? 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)'
              : 'linear-gradient(270deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        <div className={cn(
          "flex items-end py-0.5 relative",
          getFlexDirection(),
          dockPosition === 'bottom' ? 'space-x-0.5' : 'space-y-0.5'
        )}>
          {/* Main app icons */}
          {dockItems.map((item: DockItemType, index: number) => {
            const navIndex = currentNavIndex++;
            return (
              <DockItem
                key={item.id}
                id={item.id}
                label={item.label}
                onClick={item.onClick}
                customIcon={item.useCustomIcon ? getIconComponent(item.id) : undefined}
                icon={item.icon}
                bgGradient={item.bgGradient}
                isActive={activeApps.includes(item.id)}
                isLaunching={launchingApp === item.id}
                requestingAttention={attentionApps.includes(item.id)}
                introAnimation={introAnimation}
                introDelay={index * 50}
                mouseX={mouseX}
                index={index}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? (navIndex === 0 ? 0 : -1) : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
                isDragActive={isDragActive}
                dragOverIndex={dragOverIndex}
                onDragStateChange={handleDragStateChange}
              />
            );
          })}

          {/* More apps button (only on mobile) */}
          {isMobile && overflowItems.length > 0 && (
            <>
              <Separator orientation={separatorOrientation} className={cn("bg-white/20", separatorClass)} />
              <MobileOverflow items={overflowItems} />
            </>
          )}

          {/* Downloads Folder - shown on mobile too */}
          {isMobile && (() => {
            const navIndex = currentNavIndex++;
            return (
              <DockItem
                id="downloads"
                label="Downloads"
                onClick={onDownloadsClick}
                customIcon={<MacFolderIcon className="w-full h-full" badgeType="downloads" />}
                isDraggable={false}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
              />
            );
          })()}

          {/* Separator before Hanzo/Lux/Zoo apps */}
          {!isMobile && customApps.length > 0 && (
            <Separator orientation={separatorOrientation} className={cn("bg-white/20", separatorClass)} />
          )}

          {/* Hanzo, Lux, Zoo apps */}
          {!isMobile && customApps.map((item: DockItemType, index: number) => {
            const navIndex = currentNavIndex++;
            return (
              <DockItem
                key={item.id}
                id={item.id}
                label={item.label}
                onClick={item.onClick}
                customIcon={item.useCustomIcon ? getIconComponent(item.id) : undefined}
                bgGradient={item.bgGradient}
                isActive={activeApps.includes(item.id)}
                isLaunching={launchingApp === item.id}
                requestingAttention={attentionApps.includes(item.id)}
                introAnimation={introAnimation}
                introDelay={(dockItems.length + index) * 50}
                mouseX={mouseX}
                index={dockItems.length + index}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
                isDragActive={isDragActive}
                dragOverIndex={dragOverIndex}
                onDragStateChange={handleDragStateChange}
              />
            );
          })}

          {/* Separator before folders */}
          {!isMobile && <Separator orientation={separatorOrientation} className={cn("bg-white/20", separatorClass)} />}

          {/* Recent apps section (running apps not pinned to dock) */}
          {!isMobile && recentApps.length > 0 && recentApps.map((appId, index) => {
            const item = itemsById.get(appId);
            if (!item || isItemInDock(appId)) return null;

            const navIndex = currentNavIndex++;
            return (
              <DockItem
                key={`recent-${appId}`}
                id={appId}
                label={item.label}
                onClick={item.onClick}
                customIcon={item.useCustomIcon ? getIconComponent(appId) : undefined}
                bgGradient={item.bgGradient}
                isActive={activeApps.includes(appId)}
                isDraggable={false}
                mouseX={mouseX}
                index={dockItems.length + customApps.length + index}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
              />
            );
          })}

          {/* Separator after recent apps if any */}
          {!isMobile && recentApps.filter(id => !isItemInDock(id)).length > 0 && (
            <Separator orientation={separatorOrientation} className={cn("bg-white/20", separatorClass)} />
          )}

          {/* Applications Folder */}
          {!isMobile && (() => {
            const navIndex = currentNavIndex++;
            return (
              <DockItem
                id="applications"
                label="Applications"
                onClick={onApplicationsClick}
                customIcon={<MacFolderIcon className="w-full h-full" badgeType="apps" />}
                isDraggable={false}
                mouseX={mouseX}
                index={dockItems.length + customApps.length + recentApps.length}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
              />
            );
          })()}

          {/* Downloads Folder */}
          {!isMobile && (() => {
            const navIndex = currentNavIndex++;
            return (
              <DockItem
                id="downloads"
                label="Downloads"
                onClick={onDownloadsClick}
                customIcon={<MacFolderIcon className="w-full h-full" badgeType="downloads" />}
                isDraggable={false}
                mouseX={mouseX}
                index={dockItems.length + customApps.length + recentApps.length + 1}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
              />
            );
          })()}

          {/* Trash - Only visible on desktop */}
          {!isMobile && (() => {
            const navIndex = currentNavIndex++;
            return (
              <TrashItem
                isFocused={focusedIndex === navIndex}
                tabIndex={focusedIndex === -1 ? -1 : (focusedIndex === navIndex ? 0 : -1)}
                onRegisterRef={(ref) => registerItemRef(navIndex, ref)}
                onOpenTrash={onTrashClick}
                onEmptyTrash={onEmptyTrash}
                isEmpty={trashEmpty}
                mouseX={mouseX}
                index={dockItems.length + customApps.length + recentApps.length + 2}
                magnificationEnabled={dockMagnification && !isMobile}
                baseSize={effectiveDockSize}
                maxSize={dockMagnificationSize}
              />
            );
          })()}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ZDock;
