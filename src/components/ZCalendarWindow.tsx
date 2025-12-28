import React, { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';

interface ZCalendarWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const CAL_LINK = 'zeekay/15min';

const ZCalendarWindow: React.FC<ZCalendarWindowProps> = ({ onClose, onFocus }) => {
  const [loaded, setLoaded] = useState(false);

  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ZWindow
      title="Calendar"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={950}
      defaultHeight={700}
      minWidth={750}
      minHeight={550}
      defaultPosition={{ x: 100, y: 40 }}
    >
      <div className="h-full flex flex-col overflow-hidden bg-[#1d1d1f]/95 backdrop-blur-xl">
        {/* macOS-style Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#2d2d2f]/80">
          {/* Left - Navigation */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
            <button className="ml-2 px-3 py-1 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors">
              Today
            </button>
          </div>
          
          {/* Center - Month */}
          <h2 className="text-white font-medium">{monthName}</h2>
          
          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`https://cal.com/${CAL_LINK}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a84ff] hover:bg-[#0077ed] text-white text-sm font-medium rounded-md transition-colors">
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        </div>

        {/* Cal.com Embed */}
        <div className="flex-1 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1d1d1f] z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#0a84ff] rounded-full animate-spin" />
                <p className="text-white/50 text-sm">Loading calendar...</p>
              </div>
            </div>
          )}
          <iframe
            src={`https://cal.com/${CAL_LINK}?embed=true&theme=dark&layout=month_view&hideEventTypeDetails=false`}
            className={cn(
              "w-full h-full border-0 transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
        
        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/10 bg-[#2d2d2f]/60">
          <span className="text-white/40 text-xs">
            Powered by Cal.com
          </span>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs">15 min meeting</span>
            <span className="text-white/40 text-xs">•</span>
            <span className="text-white/40 text-xs">Google Meet</span>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZCalendarWindow;
