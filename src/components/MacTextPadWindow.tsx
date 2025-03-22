
import React, { useState, useEffect } from 'react';
import MacWindow from './MacWindow';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface MacTextPadWindowProps {
  onClose: () => void;
}

const MacTextPadWindow: React.FC<MacTextPadWindowProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Hi, I'm Zach Keling. Welcome to the inside of my brain.\n\nCheck out my cryptocurrency Z on Solana: TjXyMY9zb51fgW2rNp3SeFFVtB2ipcSjMKJ4nu3fomo";
  
  // Typing animation effect
  useEffect(() => {
    if (isTyping) {
      if (text.length < fullText.length) {
        const typingTimer = setTimeout(() => {
          setText(fullText.substring(0, text.length + 1));
        }, 100);
        
        return () => clearTimeout(typingTimer);
      } else {
        setIsTyping(false);
      }
    }
  }, [text, isTyping, fullText]);

  const renderTextWithLinks = () => {
    if (!text) return null;
    
    // Find the Solana address in the text
    const parts = text.split(/(TjXyMY9zb51fgW2rNp3SeFFVtB2ipcSjMKJ4nu3fomo)/);
    
    if (parts.length === 1) {
      return text;
    }
    
    return (
      <>
        {parts.map((part, index) => {
          if (part === 'TjXyMY9zb51fgW2rNp3SeFFVtB2ipcSjMKJ4nu3fomo') {
            return (
              <a 
                key={index}
                href="https://solscan.io/address/TjXyMY9zb51fgW2rNp3SeFFVtB2ipcSjMKJ4nu3fomo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {part}
                <ExternalLink className="inline-block w-3 h-3" />
              </a>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <MacWindow 
      title="TextPad" 
      onClose={onClose}
      className="animate-scale-in shadow-lg"
      initialPosition={{ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 150 }}
      initialSize={{ width: 500, height: 300 }}
      windowType="textpad"
    >
      <div className="h-full p-2 bg-[#151517] overflow-auto">
        {isTyping ? (
          <div className="w-full h-full p-4 font-mono text-base text-gray-300 whitespace-pre-wrap">
            {text}
            <span className="terminal-cursor animate-blink bg-gray-300">|</span>
          </div>
        ) : (
          <div className="w-full h-full p-4 font-mono text-base text-gray-300 whitespace-pre-wrap">
            {renderTextWithLinks()}
          </div>
        )}
      </div>
    </MacWindow>
  );
};

export default MacTextPadWindow;
