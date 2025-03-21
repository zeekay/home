
import React, { useState } from 'react';
import MacDock from './MacDock';
import MacTerminalWindow from './MacTerminalWindow';
import MacSafariWindow from './MacSafariWindow';
import MacITunesWindow from './MacITunesWindow';
import AnimatedBackground from './AnimatedBackground';
import DesktopSettings from './DesktopSettings';

interface MacDesktopProps {
  children: React.ReactNode;
}

const MacDesktop: React.FC<MacDesktopProps> = ({ children }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [showITunes, setShowITunes] = useState(false);
  
  // Desktop customization settings
  const [padding, setPadding] = useState(1);
  const [opacity, setOpacity] = useState(0.7);
  const [theme, setTheme] = useState('default');
  const [customBgUrl, setCustomBgUrl] = useState('');

  const handleToggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  const handleToggleSafari = () => {
    setShowSafari(!showSafari);
  };

  const handleToggleITunes = () => {
    setShowITunes(!showITunes);
  };

  // Apply custom document styles for padding
  React.useEffect(() => {
    document.documentElement.style.setProperty('--window-padding', `${padding * 16}px`);
    document.documentElement.style.setProperty('--window-opacity', opacity.toString());
  }, [padding, opacity]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground theme={theme} customImageUrl={customBgUrl} />
      
      {/* Content Area */}
      <div className="relative z-10 w-full h-full pb-20 overflow-auto">
        {children}
      </div>
      
      {/* Application Windows */}
      {showTerminal && (
        <MacTerminalWindow onClose={() => setShowTerminal(false)} />
      )}
      
      {showSafari && (
        <MacSafariWindow onClose={() => setShowSafari(false)} />
      )}
      
      {showITunes && (
        <MacITunesWindow onClose={() => setShowITunes(false)} />
      )}
      
      {/* Desktop Settings */}
      <DesktopSettings 
        onPaddingChange={setPadding}
        onOpacityChange={setOpacity}
        onThemeChange={setTheme}
        onCustomBgChange={setCustomBgUrl}
        currentPadding={padding}
        currentOpacity={opacity}
        currentTheme={theme}
        currentBgUrl={customBgUrl}
      />
      
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
