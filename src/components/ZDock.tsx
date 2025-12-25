import React, { useState, useRef, useCallback } from 'react';
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
  activeApps?: string[];
  launchingApp?: string | null;
  introAnimation?: boolean;
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
  activeApps = [],
  launchingApp,
  introAnimation = false
}) => {
  const isMobile = useIsMobile();
  const { dockOrder, isItemInDock } = useDock();
  const { dockMagnification, dockMagnificationSize, dockSize } = useDesktopSettings();
  
  // Use smaller icons on mobile for better fit
  const effectiveDockSize = isMobile ? Math.min(dockSize, 40) : dockSize;

  // Track mouse position relative to dock for magnification
  const dockRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);

  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Handle mouse movement for magnification effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockMagnification || isMobile) return;
    const rect = dockRef.current?.getBoundingClientRect();
    if (rect) {
      setMouseX(e.clientX - rect.left);
    }
  }, [dockMagnification, isMobile]);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
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
    }
    return count;
  }, [dockItems.length, customApps.length, isMobile]);

  const totalItems = getTotalNavigableItems();

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (totalItems === 0) return;

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + 1) % totalItems;
        focusItem(nextIndex);
        break;
      }
      case 'ArrowLeft': {
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
  }, [focusedIndex, totalItems, focusItem]);

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

  // Track navigation index for each rendered item
  let currentNavIndex = 0;

  return (
    <TooltipProvider>
      <div
        ref={dockRef}
        data-dock
        role="toolbar"
        aria-label="Application dock"
        className={cn(
          'fixed left-1/2 transform -translate-x-1/2',
          'inline-flex items-end justify-center',
          'px-2 py-2',
          'glass-lg',
          'rounded-2xl',
          className
        )}
        style={{
          maxWidth: 'calc(100% - 16px)',
          width: 'max-content',
          bottom: isMobile ? '10px' : '16px',
          zIndex: 9999
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        <div className="flex items-end space-x-0.5 py-0.5">
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
              />
            );
          })}

          {/* More apps button (only on mobile) */}
          {isMobile && overflowItems.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />
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
          {!isMobile && customApps.length > 0 && <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />}

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
              />
            );
          })}

          {/* Separator before folders */}
          {!isMobile && <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />}

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
                index={dockItems.length + customApps.length}
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
                index={dockItems.length + customApps.length + 1}
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
                mouseX={mouseX}
                index={dockItems.length + customApps.length + 2}
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
