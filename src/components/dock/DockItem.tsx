import React, { useState, useRef } from 'react';
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
  isDraggable = true
}) => {
  const isMobile = useIsMobile();
  const { reorderItems, removeFromDock, isItemPinned, pinItem, unpinItem } = useDock();
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const dragRef = useRef<HTMLButtonElement>(null);

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
        "group relative flex items-center justify-center px-0.5 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl",
        isDragging && "opacity-50 scale-90",
        isDropTarget && "scale-110"
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
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
          `flex items-center justify-center ${getIconSize()} rounded-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 overflow-hidden`,
          bgGradient || '',
          isDropTarget && "ring-2 ring-white/50"
        )}
        style={bgGradient ? {} : undefined}
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
