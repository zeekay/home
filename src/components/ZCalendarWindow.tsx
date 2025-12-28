import React, { useState } from 'react';
import { ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';

interface ZCalendarWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const CAL_LINK = 'zeekay/15min';

const ZCalendarWindow: React.FC<ZCalendarWindowProps> = ({ onClose, onFocus }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <ZWindow
      title="Calendar"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={800}
      defaultHeight={700}
      minWidth={600}
      minHeight={500}
      defaultPosition={{ x: 150, y: 80 }}
    >
      <div className="flex flex-col h-full bg-[#1a1a1a]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Schedule a Meeting</h2>
              <a 
                href={`https://cal.com/${CAL_LINK}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 text-xs hover:text-white/70 transition-colors flex items-center gap-1"
              >
                cal.com/{CAL_LINK}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Cal.com Embed */}
        <div className="flex-1 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Loading calendar...</p>
              </div>
            </div>
          )}
          <iframe
            src={`https://cal.com/${CAL_LINK}?embed=true&theme=dark&hideEventTypeDetails=false`}
            className={cn(
              "w-full h-full border-0",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
            allow="camera; microphone; fullscreen; display-capture"
          />
        </div>
      </div>
    </ZWindow>
  );
};

export default ZCalendarWindow;
