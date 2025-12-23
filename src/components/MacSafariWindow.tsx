
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import MacWindow from './MacWindow';
import SafariNavBar from './safari/SafariNavBar';
import SafariContent from './safari/SafariContent';
import { calculateSizeReduction, checkIfInIframe } from './safari/safariUtils';

interface MacSafariWindowProps {
  onClose: () => void;
  initialUrl?: string;
  depth?: number;
}

const MacSafariWindow: React.FC<MacSafariWindowProps> = ({
  onClose,
  initialUrl = 'https://www.google.com',
  depth = 0
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [isInIframe, setIsInIframe] = useState(false);

  // Scale factor for UI elements based on depth
  const scaleFactor = Math.pow(0.9, depth);

  useEffect(() => {
    // Check if we're in an iframe
    setIsInIframe(checkIfInIframe());
  }, []);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize the URL - add https:// if no protocol specified
    let navigateUrl = inputUrl.trim();
    if (navigateUrl && !navigateUrl.match(/^https?:\/\//i)) {
      navigateUrl = 'https://' + navigateUrl;
    }
    if (navigateUrl) {
      setUrl(navigateUrl);
      setInputUrl(navigateUrl);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), navigateUrl]);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setUrl(history[historyIndex - 1]);
      setInputUrl(history[historyIndex - 1]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setUrl(history[historyIndex + 1]);
      setInputUrl(history[historyIndex + 1]);
    }
  };

  const handleRefresh = () => {
    // Just re-set the URL to trigger a reload
    setIframeKey(Date.now());
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setInputUrl(homeUrl);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), homeUrl]);
    setHistoryIndex(prev => prev + 1);
  };

  // Open a new recursive safari window
  const openRecursiveSafari = () => {
    const newWindow = document.createElement('div');
    document.body.appendChild(newWindow);
    
    // Create a new Safari window component with increased depth
    const safariWindow = (
      <MacSafariWindow 
        onClose={() => document.body.removeChild(newWindow)} 
        initialUrl={window.location.href}
        depth={depth + 1}
      />
    );
    
    // Render the new Safari window
    const root = ReactDOM.createRoot(newWindow);
    root.render(safariWindow);
  };

  return (
    <MacWindow
      title={`Safari${depth > 0 ? ` (${depth})` : ''}`}
      onClose={onClose}
      initialPosition={{ x: 100 + (depth * 30), y: 100 + (depth * 20) }}
      initialSize={{ 
        width: calculateSizeReduction(800, depth), 
        height: calculateSizeReduction(600, depth) 
      }}
      windowType="safari"
      className="z-40"
    >
      <div className="w-full h-full flex flex-col">
        <SafariNavBar 
          historyIndex={historyIndex}
          history={history}
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          handleBack={handleBack}
          handleForward={handleForward}
          handleRefresh={handleRefresh}
          handleHome={handleHome}
          handleNavigate={handleNavigate}
          openRecursiveSafari={openRecursiveSafari}
          scaleFactor={scaleFactor}
        />
        
        <SafariContent
          url={url}
          depth={depth}
          iframeKey={iframeKey}
          onNavigate={(newUrl) => {
            setUrl(newUrl);
            setInputUrl(newUrl);
            setHistory(prev => [...prev.slice(0, historyIndex + 1), newUrl]);
            setHistoryIndex(prev => prev + 1);
          }}
        />
      </div>
    </MacWindow>
  );
};

export default MacSafariWindow;
