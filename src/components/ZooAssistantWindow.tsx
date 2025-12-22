import React, { useState, useEffect } from 'react';
import { X, Sparkles, Heart, Lightbulb, HelpCircle, Coffee, Zap } from 'lucide-react';

interface ZooAssistantWindowProps {
  onClose: () => void;
}

const ZOO_TIPS = [
  { text: "It looks like you're trying to revolutionize AI! Would you like help disrupting the status quo? 🚀", icon: Lightbulb },
  { text: "Did you know? Zoo Labs is building the future of decentralized AI. No VC overlords here! 🦊", icon: Sparkles },
  { text: "Pro tip: The best code is written at 3 AM with questionable amounts of caffeine ☕", icon: Coffee },
  { text: "I see you're on a macOS-inspired site. Bold choice. Thinking different about thinking different! 🍎", icon: Zap },
  { text: "Fun fact: I'm a decentralized assistant. My personality isn't owned by any corporation! 🎉", icon: Heart },
  { text: "Need help? Or just want to chat? I'm literally an AI, I have infinite patience! 💬", icon: HelpCircle },
  { text: "Zoo Labs: Where we take 'move fast and break things' literally. In a good way. Mostly. 🔬", icon: Sparkles },
  { text: "Roses are red, violets are blue, centralized AI is dead, decentralized FTW! 🌹", icon: Heart },
];

const ZooAssistantWindow: React.FC<ZooAssistantWindowProps> = ({ onClose }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Cycle through tips
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % ZOO_TIPS.length);
        setIsAnimating(false);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Eye tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6;
      const y = (e.clientY / window.innerHeight - 0.5) * 6;
      setEyePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const CurrentIcon = ZOO_TIPS[currentTip].icon;

  return (
    <div
      className="fixed z-[15000] select-none"
      style={{
        right: '80px',
        bottom: '120px',
      }}
    >
      {/* Speech Bubble */}
      <div
        className={`relative mb-2 max-w-[280px] transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform -translate-y-2' : 'opacity-100'
        }`}
      >
        <div className="bg-white rounded-2xl p-4 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-800 text-sm leading-relaxed">
              {ZOO_TIPS[currentTip].text}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Zoo Labs Assistant</span>
            <div className="flex gap-1">
              {ZOO_TIPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentTip ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Speech bubble pointer */}
        <div className="absolute -bottom-2 right-12 w-4 h-4 bg-white transform rotate-45 shadow-lg" />
      </div>

      {/* The Zoo Animal (Cute Fox) */}
      <div className="relative cursor-pointer group" onClick={() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentTip((prev) => (prev + 1) % ZOO_TIPS.length);
          setIsAnimating(false);
        }, 300);
      }}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-pulse" />
        
        {/* Fox body */}
        <svg
          viewBox="0 0 120 120"
          className="w-24 h-24 drop-shadow-2xl transform group-hover:scale-105 transition-transform"
        >
          {/* Body */}
          <ellipse cx="60" cy="75" rx="35" ry="30" fill="#FF6B35" />
          
          {/* Belly */}
          <ellipse cx="60" cy="80" rx="20" ry="18" fill="#FFE5D9" />
          
          {/* Head */}
          <circle cx="60" cy="45" r="30" fill="#FF6B35" />
          
          {/* Inner ears */}
          <polygon points="35,25 45,45 25,40" fill="#FF8C5A" />
          <polygon points="85,25 75,45 95,40" fill="#FF8C5A" />
          
          {/* Outer ears */}
          <polygon points="30,15 45,45 20,35" fill="#FF6B35" />
          <polygon points="90,15 75,45 100,35" fill="#FF6B35" />
          
          {/* Face markings */}
          <ellipse cx="60" cy="55" rx="15" ry="12" fill="#FFE5D9" />
          
          {/* Eyes (with tracking) */}
          <g>
            {/* Left eye white */}
            <ellipse cx="48" cy="42" rx="8" ry="9" fill="white" />
            {/* Left eye pupil */}
            <circle
              cx={48 + eyePosition.x}
              cy={42 + eyePosition.y}
              r="4"
              fill="#2D1B0E"
            />
            {/* Left eye shine */}
            <circle cx={46 + eyePosition.x} cy={40 + eyePosition.y} r="1.5" fill="white" />
          </g>
          <g>
            {/* Right eye white */}
            <ellipse cx="72" cy="42" rx="8" ry="9" fill="white" />
            {/* Right eye pupil */}
            <circle
              cx={72 + eyePosition.x}
              cy={42 + eyePosition.y}
              r="4"
              fill="#2D1B0E"
            />
            {/* Right eye shine */}
            <circle cx={70 + eyePosition.x} cy={40 + eyePosition.y} r="1.5" fill="white" />
          </g>
          
          {/* Nose */}
          <ellipse cx="60" cy="55" rx="4" ry="3" fill="#2D1B0E" />
          
          {/* Mouth */}
          <path d="M55,60 Q60,65 65,60" fill="none" stroke="#2D1B0E" strokeWidth="2" strokeLinecap="round" />
          
          {/* Whiskers */}
          <g stroke="#2D1B0E" strokeWidth="1" opacity="0.5">
            <line x1="35" y1="52" x2="25" y2="50" />
            <line x1="35" y1="55" x2="25" y2="55" />
            <line x1="35" y1="58" x2="25" y2="60" />
            <line x1="85" y1="52" x2="95" y2="50" />
            <line x1="85" y1="55" x2="95" y2="55" />
            <line x1="85" y1="58" x2="95" y2="60" />
          </g>
          
          {/* Tail */}
          <ellipse cx="100" cy="85" rx="18" ry="10" fill="#FF6B35" transform="rotate(-30 100 85)" />
          <ellipse cx="108" cy="80" rx="8" ry="5" fill="#FFE5D9" transform="rotate(-30 108 80)" />
          
          {/* Feet */}
          <ellipse cx="45" cy="100" rx="8" ry="5" fill="#2D1B0E" />
          <ellipse cx="75" cy="100" rx="8" ry="5" fill="#2D1B0E" />
        </svg>

        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '0ms' }} />
        <div className="absolute top-4 -left-4 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '200ms' }} />
        <div className="absolute -top-4 left-6 w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce opacity-80" style={{ animationDelay: '400ms' }} />
      </div>

      {/* Click hint */}
      <p className="text-center text-white/40 text-[10px] mt-2">Click me for more tips!</p>
    </div>
  );
};

export default ZooAssistantWindow;
