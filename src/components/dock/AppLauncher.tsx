
import React from 'react';
import { FileText, FileCode, Coffee, Map, Gamepad2, BookOpen } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from '@/hooks/use-mobile';

// Mac app launcher items
const appLauncherItems = [
  { icon: FileCode, label: 'Xcode', color: 'text-blue-500' },
  { icon: Coffee, label: 'Brew', color: 'text-amber-700' },
  { icon: Map, label: 'Maps', color: 'text-green-500' },
  { icon: Gamepad2, label: 'Games', color: 'text-purple-500' },
  { icon: BookOpen, label: 'Books', color: 'text-orange-500' },
];

const AppLauncher: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="group relative flex flex-col items-center justify-center">
              <div className="w-12 h-12 flex items-center justify-center bg-black/60 rounded-xl hover:bg-gray-900/80 transition-all duration-200 hover:scale-125 shadow-lg group-hover:shadow-xl border border-white/15">
                <FileText className="w-6 h-6 text-yellow-300 group-hover:animate-pulse transition-all duration-300" />
              </div>
              <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/80 text-white border-0">
          Applications
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="top" className="w-72 bg-black/90 backdrop-blur-sm border-white/15 text-white rounded-xl p-2">
        <div className="grid grid-cols-3 gap-2">
          {appLauncherItems.map((app, index) => (
            <div key={index} className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/15">
                <app.icon className={`w-6 h-6 ${app.color}`} />
              </div>
              <span className="text-xs text-center">{app.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppLauncher;
