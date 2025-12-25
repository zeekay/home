import React, { useState, useRef, useEffect } from 'react';
import { Folder } from 'lucide-react';
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
  mouseX = null,
  index = 0,
  magnificationEnabled = false,
  baseSize = 48,
  maxSize = 72
}) => {
  const [isTrashOpen, setIsTrashOpen] = useState(false);
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
    setIsTrashOpen(true);
    setTimeout(() => setIsTrashOpen(false), 3000); // Auto-close after 3 seconds
  };

  // Calculate magnified size based on distance from mouse
  const getMagnifiedSize = (): number => {
    if (!magnificationEnabled || mouseX === null) {
      return baseSize;
    }

    const itemWidth = baseSize + 8;
    const itemCenter = index * itemWidth + itemWidth / 2;
    const distance = Math.abs(mouseX - itemCenter);
    const magnificationRange = itemWidth * 2.5;

    if (distance > magnificationRange) {
      return baseSize;
    }

    const scaleFactor = Math.cos((distance / magnificationRange) * (Math.PI / 2));
    const sizeIncrease = (maxSize - baseSize) * scaleFactor;

    return baseSize + sizeIncrease;
  };

  const magnifiedSize = getMagnifiedSize();
  const useMagnification = magnificationEnabled && !isMobile;

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
              "group relative flex items-end justify-center px-0.5 rounded-xl",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              isFocused && "ring-2 ring-white/70 ring-offset-2 ring-offset-transparent"
            )}
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
                !useMagnification && getIconSize(),
                !useMagnification && "transition-transform duration-200 group-hover:scale-110 group-active:scale-95",
                useMagnification && "transition-[width,height] duration-100 ease-out"
              )}
              style={useMagnification ? {
                width: `${magnifiedSize}px`,
                height: `${magnifiedSize}px`,
              } : undefined}
            >
              <MacTrashIcon className="w-full h-full" />
            </div>
            {/* Active indicator dot */}
            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm">
          Trash
        </TooltipContent>
      </Tooltip>

      {/* Trash Finder Window */}
      {isTrashOpen && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-black h-6 flex items-center px-2 border-b border-white/10">
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="text-white text-xs mx-auto">Trash</div>
          </div>
          <div className="p-4 text-white text-sm">
            <div className="flex items-center mb-2">
              <Folder className="w-4 h-4 text-blue-400 mr-2" />
              <span>Trash</span>
            </div>
            <div className="text-center mt-10 text-gray-400 text-xs">
              The trash is empty
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrashItem;
