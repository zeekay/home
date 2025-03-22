
import React, { useState } from 'react';
import { Trash2, Folder } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TrashItem: React.FC = () => {
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const handleTrashClick = () => {
    setIsTrashOpen(true);
    setTimeout(() => setIsTrashOpen(false), 3000); // Auto-close after 3 seconds
  };
  
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="group relative flex flex-col items-center justify-center"
            onClick={handleTrashClick}
          >
            <div className="flex items-center justify-center transition-all duration-200 hover:scale-110">
              <Trash2 className="w-6 h-6 text-gray-400 group-hover:animate-pulse transition-all duration-300" />
            </div>
            <div className="w-1 h-1 rounded-full bg-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/80 text-white border-0">
          Trash
        </TooltipContent>
      </Tooltip>

      {/* Trash Finder Window */}
      {isTrashOpen && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-gray-800 h-6 flex items-center px-2 border-b border-white/10">
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
