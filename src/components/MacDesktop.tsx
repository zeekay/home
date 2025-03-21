
import React, { useState } from 'react';
import MacDock from './MacDock';
import MacTerminalWindow from './MacTerminalWindow';
import MacSafariWindow from './MacSafariWindow';
import MacITunesWindow from './MacITunesWindow';
import MacEmailWindow from './MacEmailWindow';
import MacCalendarWindow from './MacCalendarWindow';
import MacSystemPreferencesWindow from './MacSystemPreferencesWindow';
import MacPhotosWindow from './MacPhotosWindow';
import MacFaceTimeWindow from './MacFaceTimeWindow';
import AnimatedBackground from './AnimatedBackground';
import DesktopSettings from './DesktopSettings';

interface MacDesktopProps {
  children: React.ReactNode;
}

const MacDesktop: React.FC<MacDesktopProps> = ({ children }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [showITunes, setShowITunes] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSystemPreferences, setShowSystemPreferences] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showFaceTime, setShowFaceTime] = useState(false);
  
  // Desktop customization settings
  const [padding, setPadding] = useState(1);
  const [opacity, setOpacity] = useState(0.7);
  const [theme, setTheme] = useState('wireframe');
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

  const handleToggleEmail = () => {
    setShowEmail(!showEmail);
  };

  const handleToggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  
  const handleToggleSystemPreferences = () => {
    setShowSystemPreferences(!showSystemPreferences);
  };
  
  const handleTogglePhotos = () => {
    setShowPhotos(!showPhotos);
  };
  
  const handleToggleFaceTime = () => {
    setShowFaceTime(!showFaceTime);
  };

  // Apply custom document styles for padding
  React.useEffect(() => {
    document.documentElement.style.setProperty('--window-padding', `${padding * 16}px`);
    document.documentElement.style.setProperty('--window-opacity', opacity.toString());
    
    // Force dark mode by default
    document.documentElement.classList.add('dark');
  }, [padding, opacity]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground theme={theme} customImageUrl={customBgUrl} />
      
      {/* Content Area */}
      <div className="relative z-10 w-full h-full pb-24 overflow-auto">
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
      
      {showEmail && (
        <MacEmailWindow onClose={() => setShowEmail(false)} />
      )}
      
      {showCalendar && (
        <MacCalendarWindow onClose={() => setShowCalendar(false)} />
      )}
      
      {showSystemPreferences && (
        <MacSystemPreferencesWindow onClose={() => setShowSystemPreferences(false)} />
      )}
      
      {showPhotos && (
        <MacPhotosWindow onClose={() => setShowPhotos(false)} />
      )}
      
      {showFaceTime && (
        <MacFaceTimeWindow onClose={() => setShowFaceTime(false)} />
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
      
      {/* Mac Dock - now positioned with its own styles */}
      <MacDock 
        onTerminalClick={handleToggleTerminal}
        onSafariClick={handleToggleSafari}
        onITunesClick={handleToggleITunes}
        onMailClick={handleToggleEmail}
        onCalendarClick={handleToggleCalendar}
        onSystemPreferencesClick={handleToggleSystemPreferences}
        onPhotosClick={handleTogglePhotos}
        onFaceTimeClick={handleToggleFaceTime}
      />
    </div>
  );
};

export default MacDesktop;
