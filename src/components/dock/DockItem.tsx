import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

interface DockItemProps {
  icon?: LucideIcon;
  customIcon?: React.ReactNode;
  label: string;
  color?: string;
  onClick?: () => void;
  bgGradient?: string;
}

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, customIcon, label, color, onClick, bgGradient }) => {
  const isMobile = useIsMobile();

  // Get dynamic icon size based on device
  const getIconSize = () => {
    return isMobile ? 'w-11 h-11' : 'w-12 h-12';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="group relative flex items-center justify-center px-0.5 outline-none focus:outline-none focus:ring-0 active:outline-none"
          onClick={onClick}
        >
          <div
            className={`flex items-center justify-center ${getIconSize()} rounded-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 overflow-hidden ${bgGradient || ''}`}
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
          {/* Active indicator dot */}
          <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 text-white border-0 rounded-md px-3 py-1.5 text-sm">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default DockItem;
