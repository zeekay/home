
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
  
  // Get dynamic button size based on device
  const getButtonSize = () => {
    return isMobile ? 'w-10 h-10' : 'w-12 h-12';
  };

  const getIconSize = () => {
    return isMobile ? 'w-5 h-5' : 'w-6 h-6';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="group relative flex flex-col items-center justify-center"
          onClick={onClick}
        >
          <div className={`${getButtonSize()} flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-110 shadow-lg group-hover:shadow-xl border border-white/15`}>
            <Icon className={`${getIconSize()} ${color} group-hover:animate-pulse transition-all duration-300`} />
          </div>
          <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isMobile ? "bottom" : "top"} className="bg-black/80 text-white border-0">
        {label}
      </TooltipContent>
    </Tooltip>
  );
};

export default DockItem;
