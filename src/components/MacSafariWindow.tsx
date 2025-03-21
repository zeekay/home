
import React, { useState, useEffect } from 'react';
import { X, RefreshCcw, ChevronLeft, ChevronRight, Search, Home, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MacSafariWindowProps {
  onClose: () => void;
  initialUrl?: string;
}

const MacSafariWindow: React.FC<MacSafariWindowProps> = ({ 
  onClose,
  initialUrl = 'https://www.google.com'
}) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = inputUrl;
    
    // Add https if no protocol specified
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setUrl(processedUrl);
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
        'bg-white/90 backdrop-blur-md dark:bg-gray-800/90'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* Safari Title Bar */}
      <div
        className="h-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center px-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2 items-center">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <X className="w-2 h-2 text-red-800 opacity-0 group-hover:opacity-100" />
          </button>
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-center flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          Safari
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="h-12 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-b border-gray-300 dark:border-gray-600 flex items-center px-2 space-x-2">
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <RefreshCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <Home className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        <form onSubmit={handleNavigate} className="flex-1 flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full py-1 pl-8 pr-3 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 text-sm"
            />
          </div>
        </form>

        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <Star className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
          <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="h-8 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-300 dark:border-gray-600 flex items-center px-4 text-xs">
        <div className="flex space-x-4">
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer">Apple</span>
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer">iCloud</span>
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer">App Store</span>
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer">Mac</span>
          <span className="text-blue-600 dark:text-blue-400 cursor-pointer">Support</span>
        </div>
      </div>

      {/* Browser Content */}
      <div className="w-full h-[calc(100%-88px)]">
        <iframe 
          src={url} 
          title="Safari Content"
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

export default MacSafariWindow;
