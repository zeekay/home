
import React, { useState } from 'react';
import { RefreshCcw, ChevronLeft, ChevronRight, Search, Home, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import MacWindow from './MacWindow';

interface MacSafariWindowProps {
  onClose: () => void;
  initialUrl?: string;
}

const MacSafariWindow: React.FC<MacSafariWindowProps> = ({ 
  onClose,
  initialUrl = 'https://www.google.com'
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = inputUrl;
    
    // Add https if no protocol specified
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    setUrl(processedUrl);
  };

  return (
    <MacWindow
      title="Safari"
      onClose={onClose}
      initialPosition={{ x: 100, y: 100 }}
      initialSize={{ width: 800, height: 600 }}
      windowType="safari"
      className="z-40"
    >
      <div className="w-full h-full flex flex-col">
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
        <div className="flex-1">
          <iframe 
            src={url} 
            title="Safari Content"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </MacWindow>
  );
};

export default MacSafariWindow;
