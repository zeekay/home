import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface ZTextPadWindowProps {
  onClose: () => void;
}

const ZTextPadWindow: React.FC<ZTextPadWindowProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = `👋 Hi, I'm Z

Open Sourceror. Cypherpunk building decentralized intelligence.

🥷 CEO at Hanzo AI — Techstars-backed frontier AI
▼ Chairman of LUX — quantum-safe blockchain
🧬 Architect of ZOO — regenerative finance

Say hi: curl -sL zeekay.chat | sh`;

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
      }
    }
  }, [text, isTyping, fullText]);

  const renderTextWithLinks = () => {
    if (!text) return null;

    // Find the curl command in the text
    const parts = text.split(/(curl -sL zeekay\.chat \| sh)/);

    return (
      <>
        {parts.map((part, index) => {
          if (part === 'curl -sL zeekay.chat | sh') {
            return (
              <code
                key={index}
                className="bg-white/10 px-2 py-1 rounded text-green-400 font-mono"
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
      title="Welcome"
      onClose={onClose}
      className="animate-scale-in shadow-lg"
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
