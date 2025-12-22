import React, { useState, useEffect } from 'react';
import MacDock from './MacDock';
import MacTerminalWindow from './MacTerminalWindow';
import MacSafariWindow from './MacSafariWindow';
import MacMusicWindow from './MacMusicWindow';
import MacEmailWindow from './MacEmailWindow';
import MacCalendarWindow from './MacCalendarWindow';
import MacSystemPreferencesWindow from './MacSystemPreferencesWindow';
import MacPhotosWindow from './MacPhotosWindow';
import MacFaceTimeWindow from './MacFaceTimeWindow';
import MacTextPadWindow from './MacTextPadWindow';
import MacGitHubStatsWindow from './MacGitHubStatsWindow';
import MacSocialsWindow from './MacSocialsWindow';
import MacStatsWindow from './MacStatsWindow';
import AnimatedBackground from './AnimatedBackground';
import DesktopSettings from './DesktopSettings';

interface MacDesktopProps {
  children: React.ReactNode;
}

const MacDesktop: React.FC<MacDesktopProps> = ({ children }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSafari, setShowSafari] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSystemPreferences, setShowSystemPreferences] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showFaceTime, setShowFaceTime] = useState(false);
  const [showTextPad, setShowTextPad] = useState(false);
  const [showGitHubStats, setShowGitHubStats] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Desktop customization settings
  const [padding, setPadding] = useState(1);
  const [opacity, setOpacity] = useState(0.7);
  const [theme, setTheme] = useState('wireframe');
  const [customBgUrl, setCustomBgUrl] = useState('');

  // Auto open TextPad with welcome message on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTextPad(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  const handleToggleSafari = () => {
    setShowSafari(!showSafari);
  };

  const handleToggleMusic = () => {
    setShowMusic(!showMusic);
  };

  const handleToggleSocials = () => {
    setShowSocials(!showSocials);
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

  const handleToggleTextPad = () => {
    setShowTextPad(!showTextPad);
  };

  const handleToggleGitHubStats = () => {
    setShowGitHubStats(!showGitHubStats);
  };

  const handleToggleStats = () => {
    setShowStats(!showStats);
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
      
      {showMusic && (
        <MacMusicWindow onClose={() => setShowMusic(false)} />
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
      
      {showTextPad && (
        <MacTextPadWindow onClose={() => setShowTextPad(false)} />
      )}

      {showGitHubStats && (
        <MacGitHubStatsWindow onClose={() => setShowGitHubStats(false)} />
      )}

      {showSocials && (
        <MacSocialsWindow onClose={() => setShowSocials(false)} />
      )}

        {showStats && (
          <MacStatsWindow onClose={() => setShowStats(false)} />
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
        onMusicClick={handleToggleMusic}
        onSocialsClick={handleToggleSocials}
        onMailClick={handleToggleEmail}
        onCalendarClick={handleToggleCalendar}
        onSystemPreferencesClick={handleToggleSystemPreferences}
        onPhotosClick={handleTogglePhotos}
        onFaceTimeClick={handleToggleFaceTime}
        onTextPadClick={handleToggleTextPad}
        onGitHubStatsClick={handleToggleGitHubStats}
        onStatsClick={handleToggleStats}
      />
    </div>
  );
};

export default MacDesktop;
