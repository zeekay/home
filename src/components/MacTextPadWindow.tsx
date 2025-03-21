
import React, { useState, useEffect } from 'react';
import MacWindow from './MacWindow';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface MacTextPadWindowProps {
  onClose: () => void;
}

const MacTextPadWindow: React.FC<MacTextPadWindowProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "Hi, I'm Zach Keling. Welcome to the inside of my brain.";
  
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

  return (
    <MacWindow 
      title="TextPad" 
      onClose={onClose}
      className="animate-scale-in"
      initialPosition={{ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 150 }}
      initialSize={{ width: 500, height: 300 }}
    >
      <div className="h-full p-2 bg-white dark:bg-gray-800 overflow-auto">
        <Textarea 
          className={cn(
            "w-full h-full p-4 font-mono text-base bg-white dark:bg-gray-800 border-none resize-none focus-visible:ring-0",
            isTyping && "cursor-not-allowed"
          )}
          value={text}
          onChange={(e) => !isTyping && setText(e.target.value)}
          readOnly={isTyping}
        />
        {isTyping && (
          <span className="terminal-cursor animate-blink">|</span>
        )}
      </div>
    </MacWindow>
  );
};

export default MacTextPadWindow;
