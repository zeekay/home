import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';

interface ZTextPadWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  onOpenHanzo?: () => void;
  onOpenLux?: () => void;
  onOpenZoo?: () => void;
  onOpenTerminal?: (command?: string) => void;
}

const ZTextPadWindow: React.FC<ZTextPadWindowProps> = ({
  onClose,
  onFocus,
  onOpenHanzo,
  onOpenLux,
  onOpenZoo,
  onOpenTerminal,
}) => {
  // Check if this is the first open (intro animation plays once)
  const isIntroSession = !sessionStorage.getItem('textedit-intro-played');
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(isIntroSession);
  const [isEditable, setIsEditable] = useState(!isIntroSession);

  const fullText = `👋 Hi, I'm Z

Open Sourceror. Cypherpunk building decentralized intelligence.

🥷 CEO at Hanzo AI — Techstars-backed frontier AI
▼ Chairman of LUX — quantum-safe blockchain
🧬 Architect of ZOO — regenerative finance

Say hi: curl -sL zeekay.chat | sh`;

  // Initialize text if not intro session
  useEffect(() => {
    if (!isIntroSession) {
      setText(fullText);
    }
  }, [isIntroSession, fullText]);

  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      if (text.length < fullText.length) {
        const typingTimer = setTimeout(() => {
          setText(fullText.substring(0, text.length + 1));
        }, 30);

        return () => clearTimeout(typingTimer);
      } else {
        setIsTyping(false);
        setIsEditable(true);
        sessionStorage.setItem('textedit-intro-played', 'true');
      }
    }
  }, [text, isTyping, fullText]);

  // Clickable link component
  const ClickableLink: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }> = ({ children, onClick, className = '' }) => (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={`text-blue-400 hover:underline cursor-pointer ${className}`}
    >
      {children}
    </span>
  );

  const renderTextWithLinks = () => {
    if (!text) return null;

    // Split by all clickable elements
    const pattern = /(Hanzo AI|LUX|ZOO|curl -sL zeekay\.chat \| sh)/g;
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          if (part === 'Hanzo AI') {
            return (
              <ClickableLink key={index} onClick={onOpenHanzo}>
                {part}
              </ClickableLink>
            );
          }
          if (part === 'LUX') {
            return (
              <ClickableLink key={index} onClick={onOpenLux}>
                {part}
              </ClickableLink>
            );
          }
          if (part === 'ZOO') {
            return (
              <ClickableLink key={index} onClick={onOpenZoo}>
                {part}
              </ClickableLink>
            );
          }
          if (part === 'curl -sL zeekay.chat | sh') {
            return (
              <code
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenTerminal?.(part);
                }}
                className="bg-white/10 px-2 py-1 rounded text-green-400 font-mono hover:underline cursor-pointer"
              >
                {part}
              </code>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  // Responsive sizing
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const windowWidth = isMobile ? Math.min(350, window.innerWidth - 40) : 500;
  const windowHeight = isMobile ? 400 : 350;

  return (
    <ZWindow
      title="TextEdit"
      onClose={onClose}
      onFocus={onFocus}
      className="shadow-lg"
      initialPosition={{ x: Math.max(20, window.innerWidth / 2 - windowWidth / 2), y: Math.max(60, window.innerHeight / 2 - windowHeight / 2) }}
      initialSize={{ width: windowWidth, height: windowHeight }}
      windowType="textpad"
    >
      <div className="h-full p-2 bg-gradient-to-br from-zinc-900 to-black border border-white/10 overflow-auto">
        {isTyping ? (
          <div className="w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {text}
            <span className="terminal-cursor animate-blink bg-gray-300">|</span>
          </div>
        ) : isEditable ? (
          <textarea
            className="w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-transparent border-none outline-none resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing..."
            autoFocus
          />
        ) : (
          <div className="w-full h-full p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {renderTextWithLinks()}
          </div>
        )}
      </div>
    </ZWindow>
  );
};

export default ZTextPadWindow;
