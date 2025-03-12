
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacTerminalWindowProps {
  onClose: () => void;
}

const MacTerminalWindow: React.FC<MacTerminalWindowProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 700, height: 500 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      className={cn(
        'fixed z-50 rounded-lg overflow-hidden shadow-2xl border border-gray-500/20',
        'bg-[#f6f8fa] dark:bg-[#262a33]'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* Terminal Title Bar */}
      <div
        className="h-8 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center px-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2 items-center">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-center flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          Terminal – bash
        </div>
      </div>

      {/* Terminal Content */}
      <div className="w-full h-[calc(100%-32px)] bg-[#f6f8fa] dark:bg-[#262a33]">
        <iframe 
          src="/terminal-content" 
          className="w-full h-full border-0"
          title="Terminal Content"
        />
      </div>
    </div>
  );
};

export default MacTerminalWindow;
