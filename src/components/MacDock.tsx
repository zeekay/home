
import React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';
import DockItem from './dock/DockItem';
import AppLauncher from './dock/AppLauncher';
import TrashItem from './dock/TrashItem';
import MobileOverflow from './dock/MobileOverflow';
import { createDockItems, DockItemType } from './dock/dockData';

interface MacDockProps {
  className?: string;
  onTerminalClick: () => void;
  onSafariClick: () => void;
  onMusicClick: () => void;
  onSocialsClick?: () => void;
  onSystemPreferencesClick?: () => void;
  onMailClick?: () => void;
  onCalendarClick?: () => void;
  onPhotosClick?: () => void;
  onFaceTimeClick?: () => void;
  onTextPadClick?: () => void;
  onGitHubStatsClick?: () => void;
}

const MacDock: React.FC<MacDockProps> = ({
  className,
  onTerminalClick,
  onSafariClick,
  onMusicClick,
  onSocialsClick,
  onSystemPreferencesClick,
  onMailClick,
  onCalendarClick,
  onPhotosClick,
  onFaceTimeClick,
  onTextPadClick,
  onGitHubStatsClick
}) => {
  const isMobile = useIsMobile();

  // Create all dock items
  const allDockItems = createDockItems({
    onTerminalClick,
    onSafariClick,
    onMusicClick,
    onSocialsClick,
    onSystemPreferencesClick,
    onMailClick,
    onCalendarClick,
    onPhotosClick,
    onFaceTimeClick,
    onTextPadClick,
    onGitHubStatsClick
  });

  // Decide how many items to show directly in the dock based on screen size
  const getMainDockItems = () => {
    if (isMobile) {
      // Show fewer items on mobile
      return allDockItems.slice(0, 4);
    }
    return allDockItems;
  };

  // Get overflow items for mobile
  const getOverflowItems = () => {
    if (isMobile) {
      return allDockItems.slice(4);
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
          'bg-black/80 backdrop-blur-md',
          'rounded-2xl',
          'shadow-xl',
          className
        )}
        style={{ 
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: 'calc(100% - 16px)',
          width: 'max-content',
          bottom: isMobile ? '10px' : '16px',
          zIndex: 50
        }}
      >
        <div className="flex items-center space-x-1 py-0.5">
          {dockItems.map((item: DockItemType, index: number) => (
            <DockItem 
              key={index}
              icon={item.icon}
              label={item.label}
              color={item.color}
              onClick={item.onClick}
            />
          ))}
          
          {/* More apps button (only on mobile) */}
          {isMobile && overflowItems.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-8 bg-white/20 mx-1" />
              <MobileOverflow items={overflowItems} />
            </>
          )}
          
          {!isMobile && <Separator orientation="vertical" className="h-8 bg-white/20 mx-1" />}
          
          {/* App Launcher - Only visible on desktop */}
          {!isMobile && <AppLauncher />}

          {/* Trash - Only visible on desktop */}
          {!isMobile && <TrashItem />}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MacDock;
