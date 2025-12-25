
import React from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}) => {
  return (
    <div className="flex space-x-[6px] items-center group/controls" role="group" aria-label="Window controls">
      <button
        onClick={onClose}
        className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57] transition-colors flex items-center justify-center"
        aria-label="Close window"
      >
        <X className="w-2 h-2 text-[#4d0000] opacity-0 group-hover/controls:opacity-100 transition-opacity" aria-hidden="true" />
      </button>
      <button
        onClick={onMinimize}
        className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e] transition-colors flex items-center justify-center"
        aria-label="Minimize window"
      >
        <Minus className="w-2 h-2 text-[#995700] opacity-0 group-hover/controls:opacity-100 transition-opacity" aria-hidden="true" />
      </button>
      <button
        onClick={onMaximize}
        className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840] transition-colors flex items-center justify-center"
        aria-label={isMaximized ? "Restore window" : "Maximize window"}
      >
        {isMaximized ? (
          <Minimize2 className="w-2 h-2 text-[#006500] opacity-0 group-hover/controls:opacity-100 transition-opacity" aria-hidden="true" />
        ) : (
          <Maximize2 className="w-2 h-2 text-[#006500] opacity-0 group-hover/controls:opacity-100 transition-opacity" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export default WindowControls;
