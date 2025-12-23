import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import DockItem from './dock/DockItem';
import TrashItem from './dock/TrashItem';
import MobileOverflow from './dock/MobileOverflow';
import { createDockItems, DockItemType, DockCallbacks } from './dock/dockData';
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
  HanzoLogo,
  LuxLogo,
  ZooLogo,
  MacFolderIcon,
} from './dock/icons';

interface MacDockProps extends DockCallbacks {
  className?: string;
  onApplicationsClick?: () => void;
  onDownloadsClick?: () => void;
  activeApps?: string[];
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
    case 'hanzo':
      return <HanzoLogo className="w-8 h-8 text-white" />;
    case 'lux':
      return <LuxLogo className="w-9 h-9 text-white" />;
    case 'zoo':
      return <ZooLogo className="w-full h-full" />;
    default:
      return null;
  }
};

const MacDock: React.FC<MacDockProps> = ({
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
  onHanzoClick,
  onLuxClick,
  onZooClick,
  onApplicationsClick,
  onDownloadsClick,
  activeApps = []
}) => {
  const isMobile = useIsMobile();

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
    onHanzoClick,
    onLuxClick,
    onZooClick
  });

  // Split items into main apps and hanzo/lux/zoo
  const mainApps = allDockItems.filter(item => 
    !['hanzo', 'lux', 'zoo'].includes(item.id)
  );
  const customApps = allDockItems.filter(item => 
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

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed left-1/2 transform -translate-x-1/2',
          'inline-flex items-center justify-center',
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
      >
        <div className="flex items-center space-x-0.5 py-0.5">
          {/* Main app icons */}
          {dockItems.map((item: DockItemType) => (
            <DockItem
              key={item.id}
              label={item.label}
              onClick={item.onClick}
              customIcon={item.useCustomIcon ? getIconComponent(item.id) : undefined}
              icon={item.icon}
              bgGradient={item.bgGradient}
              isActive={activeApps.includes(item.id)}
            />
          ))}

          {/* More apps button (only on mobile) */}
          {isMobile && overflowItems.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />
              <MobileOverflow items={overflowItems} />
            </>
          )}

          {/* Separator before Hanzo/Lux/Zoo apps */}
          {!isMobile && <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />}

          {/* Hanzo, Lux, Zoo apps */}
          {!isMobile && customApps.map((item: DockItemType) => (
            <DockItem
              key={item.id}
              label={item.label}
              onClick={item.onClick}
              customIcon={item.useCustomIcon ? getIconComponent(item.id) : undefined}
              bgGradient={item.bgGradient}
              isActive={activeApps.includes(item.id)}
            />
          ))}

          {/* Separator before folders */}
          {!isMobile && <Separator orientation="vertical" className="h-10 bg-white/20 mx-1" />}

          {/* Applications Folder */}
          {!isMobile && (
            <DockItem
              label="Applications"
              onClick={onApplicationsClick}
              customIcon={<MacFolderIcon className="w-full h-full" badgeType="apps" />}
            />
          )}

          {/* Downloads Folder */}
          {!isMobile && (
            <DockItem
              label="Downloads"
              onClick={onDownloadsClick}
              customIcon={<MacFolderIcon className="w-full h-full" badgeType="downloads" />}
            />
          )}

          {/* Trash - Only visible on desktop */}
          {!isMobile && <TrashItem />}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MacDock;
