
import React, { useState } from 'react';
import MacDock from './MacDock';
import MacTerminalWindow from './MacTerminalWindow';
import MacSafariWindow from './MacSafariWindow';
import MacITunesWindow from './MacITunesWindow';
import Terminal from './Terminal';

interface MacDesktopProps {
  children: React.ReactNode;
}

const MacDesktop: React.FC<MacDesktopProps> = ({ children }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [showITunes, setShowITunes] = useState(false);

  const handleToggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  const handleToggleSafari = () => {
    setShowSafari(!showSafari);
  };

  const handleToggleITunes = () => {
    setShowITunes(!showITunes);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Snow Leopard Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&q=80&w=1932&ixlib=rb-4.0.3")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content Area */}
      <div className="relative z-10 w-full h-full pb-20 overflow-auto">
        {children}
      </div>
      
      {/* Application Windows */}
      {showTerminal && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <div className="relative w-full h-full pointer-events-auto">
            <MacTerminalWindow 
              onClose={() => setShowTerminal(false)}
            />
          </div>
        </div>
      )}
      
      {showSafari && (
        <MacSafariWindow 
          onClose={() => setShowSafari(false)}
        />
      )}
      
      {showITunes && (
        <MacITunesWindow 
          onClose={() => setShowITunes(false)}
        />
      )}
      
      {/* Mac Dock */}
      <MacDock 
        onTerminalClick={handleToggleTerminal}
        onSafariClick={handleToggleSafari}
        onITunesClick={handleToggleITunes}
        className="absolute bottom-0 left-0 right-0 z-20"
      />
    </div>
  );
};

export default MacDesktop;
