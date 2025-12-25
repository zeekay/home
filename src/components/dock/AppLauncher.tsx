import React from 'react';
import { FileCode, Coffee, Map, Gamepad2, BookOpen, ExternalLink } from 'lucide-react';
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
import { HanzoLogo, LuxLogo, ZooLogo, MacFolderIcon, AppsBadge } from './logos';
import { EXTERNAL_LINKS } from '@/config/links';

interface AppLauncherProps {
  onHanzoClick?: () => void;
  onLuxClick?: () => void;
  onZooClick?: () => void;
}

// Mac app launcher items
const systemApps = [
  { icon: FileCode, label: 'Xcode', color: 'text-blue-500' },
  { icon: Coffee, label: 'Brew', color: 'text-amber-700' },
  { icon: Map, label: 'Maps', color: 'text-green-500' },
  { icon: Gamepad2, label: 'Games', color: 'text-purple-500' },
  { icon: BookOpen, label: 'Books', color: 'text-orange-500' },
];

const AppLauncher: React.FC<AppLauncherProps> = ({ onHanzoClick, onLuxClick, onZooClick }) => {
  useIsMobile(); // Hook for responsive behavior

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button className="group relative flex flex-col items-center justify-center px-1">
              <div className="flex items-center justify-center w-12 h-12 transition-all duration-200 hover:scale-110">
                <MacFolderIcon className="w-full h-full" badge={<AppsBadge className="w-5 h-5" />} />
              </div>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/80 text-white border-0">
          Applications
        </TooltipContent>
      </Tooltip>
      <PopoverContent side="top" className="w-80 bg-black/90 backdrop-blur-xl border-white/20 text-white rounded-xl p-3">
        {/* Hanzo AI Apps Section */}
        <div className="mb-3">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Hanzo AI</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onHanzoClick}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 rounded-xl mb-1">
                <HanzoLogo className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-center">Hanzo AI</span>
            </button>

            <button
              onClick={onLuxClick}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl mb-1">
                <LuxLogo className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-center">Lux Wallet</span>
            </button>

            <button
              onClick={onZooClick}
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-400 via-yellow-400 to-red-500 rounded-xl mb-1 p-1.5">
                <ZooLogo className="w-full h-full" />
              </div>
              <span className="text-xs text-center">Zoo</span>
            </button>
          </div>
        </div>

        {/* External Links */}
        <div className="mb-3 border-t border-white/10 pt-3">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">Websites</div>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={EXTERNAL_LINKS.hanzoAI}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/15 relative">
                <HanzoLogo className="w-6 h-6 text-white" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-center">hanzo.ai</span>
            </a>

            <a
              href={EXTERNAL_LINKS.luxNetwork}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/15 relative">
                <LuxLogo className="w-6 h-6 text-cyan-400" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-center">lux.network</span>
            </a>

            <a
              href={EXTERNAL_LINKS.zooLabs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/15 relative p-2">
                <ZooLogo className="w-full h-full" />
                <ExternalLink className="absolute -top-1 -right-1 w-3 h-3 text-white/50" />
              </div>
              <span className="text-xs text-center">zoo.ngo</span>
            </a>
          </div>
        </div>

        {/* System Apps */}
        <div className="border-t border-white/10 pt-3">
          <div className="text-xs text-white/50 uppercase tracking-wider mb-2 px-1">System</div>
          <div className="grid grid-cols-5 gap-1">
            {systemApps.map((app, index) => (
              <div key={index} className="flex flex-col items-center p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-xl mb-1 border border-white/15">
                  <app.icon className={`w-5 h-5 ${app.color}`} />
                </div>
                <span className="text-[10px] text-center">{app.label}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppLauncher;
