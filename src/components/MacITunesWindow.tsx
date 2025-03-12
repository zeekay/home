
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacITunesWindowProps {
  onClose: () => void;
}

const MacITunesWindow: React.FC<MacITunesWindowProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  
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
        'fixed z-40 rounded-lg overflow-hidden shadow-2xl border border-gray-500/20',
        'bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* iTunes Title Bar */}
      <div
        className="h-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center px-3"
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
          iTunes
        </div>
      </div>
      
      {/* Control Bar */}
      <div className="h-10 bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-4">
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <Play className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div className="w-1/2 h-full bg-gray-500 dark:bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* iTunes Content (Spotify embed) */}
      <div className="w-full h-[calc(100%-72px)] bg-white dark:bg-gray-800 p-4">
        <iframe 
          src="https://open.spotify.com/embed/playlist/37i9dQZEVXcJZyENOWUFo7" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allow="encrypted-media"
          title="Spotify Embed"
        ></iframe>
      </div>
    </div>
  );
};

export default MacITunesWindow;
