
import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

interface DockItemProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
}

const DockItem: React.FC<DockItemProps> = ({ icon: Icon, label, color, onClick }) => {
  const isMobile = useIsMobile();
  
  // Get dynamic icon size based on device
  const getIconSize = () => {
    return isMobile ? 'w-5 h-5' : 'w-6 h-6';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="group relative flex items-center justify-center px-3"
          onClick={onClick}
        >
          <div className="flex items-center justify-center">
            <Icon className={`${getIconSize()} text-white`} />
          </div>
          <div className="absolute bottom-0 w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/90 text-white border-0">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default DockItem;
