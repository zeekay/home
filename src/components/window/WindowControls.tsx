
import React from 'react';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowControlsProps {
  onClose: () => void;
  onMinimize: () => void;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  onClose,
  onMinimize
}) => {
  return (
    <div className="flex space-x-2 items-center">
      <button 
        onClick={onClose}
        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
        title="Close"
      >
        <X className="w-2 h-2 text-red-800 opacity-0 hover:opacity-100" />
      </button>
      <button 
        onClick={onMinimize}
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center"
        title="Minimize"
      >
        <Minus className="w-2 h-2 text-yellow-800 opacity-0 hover:opacity-100" />
      </button>
      <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center">
        <Square className="w-2 h-2 text-green-800 opacity-0 hover:opacity-100" />
      </div>
    </div>
  );
};

export default WindowControls;
