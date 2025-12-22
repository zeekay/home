import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { BarChart3, ExternalLink, RefreshCw } from 'lucide-react';

interface MacStatsWindowProps {
  onClose: () => void;
}

const MacStatsWindow: React.FC<MacStatsWindowProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const statsUrl = 'https://zeekay.github.io/stats/';

  return (
    <MacWindow
      title="Stats Dashboard"
      onClose={onClose}
      initialPosition={{ x: 60, y: 30 }}
      initialSize={{ width: 1100, height: 700 }}
      windowType="safari"
    >
      <div className="flex flex-col h-full bg-transparent">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 glass-titlebar">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white text-sm font-medium">GitHub Stats Dashboard</h3>
              <p className="text-white/50 text-xs">zeekay & hanzo-dev contributions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsLoading(true);
                const iframe = document.getElementById('stats-iframe') as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = iframe.src;
                }
              }}
              className="p-2 glass-button rounded-lg text-white/70 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href={statsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-white/70 hover:text-white text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Browser
            </a>
          </div>
        </div>

        {/* Stats iframe */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center glass-sm z-10">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-white/50 animate-spin" />
                <p className="text-white/50 text-sm">Loading stats dashboard...</p>
              </div>
            </div>
          )}
          <iframe
            id="stats-iframe"
            src={statsUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            title="GitHub Stats Dashboard"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </MacWindow>
  );
};

export default MacStatsWindow;
