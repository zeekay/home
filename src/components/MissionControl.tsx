import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSpaces, type Space } from '@/contexts/SpacesContext';
import type { AppType } from '@/hooks/useWindowManager';
import { Plus, X } from 'lucide-react';
import {
  Folder,
  Terminal,
  Globe,
  Music,
  MessageSquare,
  Mail,
  Calendar,
  Settings,
  Image,
  Video,
  FileText,
  FileEdit,
  Github,
  Activity,
  Wallet,
  Calculator,
  Clock,
  Cloud,
  StickyNote,
} from 'lucide-react';

// App icons mapping (reused from AppSwitcher)
const HanzoLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-6 h-6", className)} fill="currentColor">
    <path d="M20 80 L50 20 L80 80 M35 55 L65 55" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ZooLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn("w-6 h-6", className)} fill="currentColor">
    <path d="M 15 15 H 85 V 30 L 35 70 H 85 V 85 H 15 V 70 L 65 30 H 15 Z" />
  </svg>
);

const AppStoreIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={cn("w-6 h-6", className)} xmlns="http://www.w3.org/2000/svg">
    <path d="M32 12 L18 52 L24 52 L27 44 L37 44 L40 52 L46 52 L32 12Z" fill="white" />
  </svg>
);

const XcodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 64 64" className={cn("w-6 h-6", className)} xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="14" width="24" height="12" rx="2" fill="white" transform="rotate(-45 26 20)" />
    <rect x="28" y="28" width="6" height="24" rx="2" fill="white" transform="rotate(-45 31 40)" />
  </svg>
);

const appIcons: Record<AppType, React.ReactNode> = {
  'Finder': <Folder className="w-6 h-6" />,
  'Terminal': <Terminal className="w-6 h-6" />,
  'Safari': <Globe className="w-6 h-6" />,
  'Music': <Music className="w-6 h-6" />,
  'Mail': <Mail className="w-6 h-6" />,
  'Calendar': <Calendar className="w-6 h-6" />,
  'System Preferences': <Settings className="w-6 h-6" />,
  'Photos': <Image className="w-6 h-6" />,
  'FaceTime': <Video className="w-6 h-6" />,
  'TextEdit': <FileEdit className="w-6 h-6" />,
  'Notes': <FileText className="w-6 h-6" />,
  'GitHub Stats': <Github className="w-6 h-6" />,
  'Messages': <MessageSquare className="w-6 h-6" />,
  'Activity Monitor': <Activity className="w-6 h-6" />,
  'Hanzo AI': <HanzoLogo className="w-6 h-6" />,
  'Lux Wallet': <Wallet className="w-6 h-6" />,
  'Zoo': <ZooLogo className="w-6 h-6" />,
  'Calculator': <Calculator className="w-6 h-6" />,
  'Clock': <Clock className="w-6 h-6" />,
  'Weather': <Cloud className="w-6 h-6" />,
  'Stickies': <StickyNote className="w-6 h-6" />,
  'App Store': <AppStoreIcon />,
  'Xcode': <XcodeIcon />,
};

const appColors: Record<AppType, string> = {
  'Finder': 'from-blue-400 to-blue-600',
  'Terminal': 'from-gray-700 to-gray-900',
  'Safari': 'from-blue-500 to-cyan-400',
  'Music': 'from-red-500 to-pink-500',
  'Mail': 'from-blue-400 to-blue-600',
  'Calendar': 'from-red-400 to-red-600',
  'System Preferences': 'from-gray-400 to-gray-600',
  'Photos': 'from-yellow-400 via-orange-400 to-pink-500',
  'FaceTime': 'from-green-400 to-green-600',
  'TextEdit': 'from-gray-600 to-gray-800',
  'Notes': 'from-yellow-300 to-yellow-500',
  'GitHub Stats': 'from-gray-700 to-gray-900',
  'Messages': 'from-green-400 to-green-600',
  'Activity Monitor': 'from-green-500 to-green-700',
  'Hanzo AI': 'from-purple-500 to-indigo-600',
  'Lux Wallet': 'from-amber-400 to-orange-500',
  'Zoo': 'from-emerald-400 to-teal-600',
  'Calculator': 'from-orange-400 to-orange-600',
  'Clock': 'from-gray-700 to-gray-900',
  'Weather': 'from-cyan-400 to-blue-500',
  'Stickies': 'from-yellow-300 to-yellow-500',
  'App Store': 'from-blue-400 to-blue-600',
  'Xcode': 'from-blue-400 to-blue-600',
};

interface MissionControlProps {
  isOpen: boolean;
  onClose: () => void;
  openApps: AppType[];
  onSelectApp: (app: AppType) => void;
  onFocusWindow: (app: AppType) => void;
}

interface WindowThumbnailProps {
  app: AppType;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, app: AppType) => void;
  isSelected?: boolean;
}

const WindowThumbnail: React.FC<WindowThumbnailProps> = ({ 
  app, 
  onClick, 
  onDragStart,
  isSelected 
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, app)}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer transition-all duration-300",
        "hover:scale-105 active:scale-95",
        isSelected && "ring-2 ring-white/50 rounded-lg"
      )}
    >
      {/* Window preview */}
      <div className={cn(
        "w-48 h-32 rounded-lg overflow-hidden shadow-xl",
        "bg-gradient-to-br",
        appColors[app],
        "border border-white/20"
      )}>
        {/* Fake window chrome */}
        <div className="h-6 bg-black/30 flex items-center px-2 gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[10px] text-white/70 truncate flex-1">{app}</span>
        </div>
        {/* Window content placeholder */}
        <div className="h-[calc(100%-24px)] flex items-center justify-center text-white/50">
          {appIcons[app]}
        </div>
      </div>
      
      {/* App label */}
      <div className="mt-2 text-center">
        <div className={cn(
          "inline-flex items-center justify-center w-8 h-8 rounded-lg",
          "bg-gradient-to-br shadow-lg",
          appColors[app]
        )}>
          <div className="text-white">{appIcons[app]}</div>
        </div>
        <p className="text-white/90 text-xs mt-1 font-medium">{app}</p>
      </div>
    </div>
  );
};

interface SpacePreviewProps {
  space: Space;
  isActive: boolean;
  onClick: () => void;
  onRemove?: () => void;
  onDrop: (e: React.DragEvent) => void;
  windowCount: number;
}

const SpacePreview: React.FC<SpacePreviewProps> = ({ 
  space, 
  isActive, 
  onClick, 
  onRemove,
  onDrop,
  windowCount 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <div 
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative cursor-pointer transition-all duration-300",
        "hover:scale-105",
        isDragOver && "scale-110"
      )}
    >
      <div className={cn(
        "w-32 h-20 rounded-lg overflow-hidden",
        "bg-gradient-to-br from-gray-800 to-gray-900",
        "border-2 transition-colors duration-200",
        isActive ? "border-blue-500" : "border-white/20",
        isDragOver && "border-green-400 border-2"
      )}>
        {/* Mini desktop preview */}
        <div className="w-full h-full flex items-center justify-center">
          {windowCount > 0 ? (
            <div className="flex flex-wrap gap-0.5 p-1 justify-center">
              {Array.from({ length: Math.min(windowCount, 6) }).map((_, i) => (
                <div key={i} className="w-4 h-3 bg-white/20 rounded-sm" />
              ))}
              {windowCount > 6 && (
                <span className="text-[8px] text-white/50">+{windowCount - 6}</span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-white/30">Empty</span>
          )}
        </div>
      </div>
      
      {/* Space name */}
      <p className={cn(
        "text-center text-xs mt-1 transition-colors",
        isActive ? "text-white" : "text-white/60"
      )}>
        {space.name}
      </p>
      
      {/* Remove button (only for non-first spaces when not active) */}
      {onRemove && !isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "absolute -top-1 -right-1 w-5 h-5 rounded-full",
            "bg-gray-600 hover:bg-red-500 transition-colors",
            "flex items-center justify-center",
            "opacity-0 group-hover:opacity-100"
          )}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
};

const MissionControl: React.FC<MissionControlProps> = ({
  isOpen,
  onClose,
  openApps,
  onSelectApp,
  onFocusWindow,
}) => {
  const { 
    spaces, 
    activeSpaceId, 
    addSpace, 
    removeSpace, 
    setActiveSpace,
    moveWindowToSpace,
    getWindowsInSpace,
  } = useSpaces();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [draggedApp, setDraggedApp] = useState<AppType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hotCornerRef = useRef<boolean>(false);

  // Handle opening animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Hot corner detection (top-left)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isInHotCorner = e.clientX <= 2 && e.clientY <= 2;
      
      if (isInHotCorner && !hotCornerRef.current && !isOpen) {
        hotCornerRef.current = true;
        // Emit custom event for ZDesktop to handle
        window.dispatchEvent(new CustomEvent('zos:mission-control-trigger'));
      } else if (!isInHotCorner) {
        hotCornerRef.current = false;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  // Swipe gesture detection (simplified - detects rapid upward movement)
  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (isOpen) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      const deltaTime = Date.now() - touchStartTime;
      
      // Swipe up from bottom third of screen, fast swipe
      if (touchStartY > window.innerHeight * 0.7 && deltaY > 100 && deltaTime < 300) {
        window.dispatchEvent(new CustomEvent('zos:mission-control-trigger'));
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  const handleWindowClick = useCallback((app: AppType) => {
    onFocusWindow(app);
    onClose();
  }, [onFocusWindow, onClose]);

  const handleDragStart = useCallback((e: React.DragEvent, app: AppType) => {
    setDraggedApp(app);
    e.dataTransfer.setData('text/plain', app);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleSpaceDrop = useCallback((spaceId: string) => {
    if (draggedApp) {
      moveWindowToSpace(draggedApp, spaceId);
      setDraggedApp(null);
    }
  }, [draggedApp, moveWindowToSpace]);

  const handleSpaceClick = useCallback((spaceId: string) => {
    setActiveSpace(spaceId);
    onClose();
  }, [setActiveSpace, onClose]);

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  // Get windows in the active space (or all open apps if not using spaces)
  const activeSpaceWindows = getWindowsInSpace(activeSpaceId);
  const displayedApps = activeSpaceWindows.length > 0 
    ? openApps.filter(app => activeSpaceWindows.includes(app))
    : openApps;

  return (
    <div
      ref={containerRef}
      onClick={handleBackgroundClick}
      className={cn(
        "fixed inset-0 z-[40000]",
        "vibrancy-mission",
        "transition-opacity duration-300",
        isAnimating ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Spaces bar at top */}
      <div className={cn(
        "absolute top-0 left-0 right-0 px-8 py-4",
        "vibrancy-menubar border-b border-white/10",
        "transition-transform duration-400",
        isAnimating ? "-translate-y-full" : "translate-y-0"
      )}>
        <div className="flex items-center justify-center gap-4">
          {spaces.map((space) => (
            <SpacePreview
              key={space.id}
              space={space}
              isActive={space.id === activeSpaceId}
              onClick={() => handleSpaceClick(space.id)}
              onRemove={spaces.length > 1 ? () => removeSpace(space.id) : undefined}
              onDrop={() => handleSpaceDrop(space.id)}
              windowCount={getWindowsInSpace(space.id).length}
            />
          ))}
          
          {/* Add space button */}
          <button
            onClick={addSpace}
            className={cn(
              "w-32 h-20 rounded-lg",
              "border-2 border-dashed border-white/20",
              "flex items-center justify-center",
              "hover:border-white/40 hover:bg-white/5",
              "transition-all duration-200"
            )}
          >
            <Plus className="w-6 h-6 text-white/40" />
          </button>
        </div>
      </div>

      {/* Windows grid */}
      <div className={cn(
        "absolute inset-0 pt-32 pb-24 px-12",
        "flex items-center justify-center",
        "transition-all duration-400",
        isAnimating ? "scale-90 opacity-0" : "scale-100 opacity-100"
      )}>
        {displayedApps.length > 0 ? (
          <div className="flex flex-wrap gap-8 justify-center max-w-6xl">
            {displayedApps.map((app) => (
              <WindowThumbnail
                key={app}
                app={app}
                onClick={() => handleWindowClick(app)}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white/40 text-lg">No windows open</p>
            <p className="text-white/30 text-sm mt-2">
              Open an app from the Dock to get started
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className={cn(
        "absolute bottom-8 left-0 right-0 text-center",
        "transition-opacity duration-300",
        isAnimating ? "opacity-0" : "opacity-100"
      )}>
        <p className="text-white/40 text-sm">
          Click a window to focus - Drag windows to spaces - Press Esc to exit
        </p>
      </div>
    </div>
  );
};

export default MissionControl;
