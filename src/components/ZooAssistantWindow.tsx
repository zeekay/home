import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Sparkles, Heart, Lightbulb, HelpCircle, Coffee, Zap, ChevronLeft, ChevronRight, Move, Maximize2, Send, MessageCircle } from 'lucide-react';

// Dynamic import of model-viewer for better code splitting (~500KB savings)
// The import happens when component mounts, not at bundle time

// Type declaration for model-viewer custom element
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean;
          'camera-orbit'?: string;
          'camera-target'?: string;
          'field-of-view'?: string;
          'min-camera-orbit'?: string;
          'max-camera-orbit'?: string;
          'min-field-of-view'?: string;
          'max-field-of-view'?: string;
          'disable-zoom'?: boolean;
          'disable-pan'?: boolean;
          'disable-tap'?: boolean;
          'touch-action'?: string;
          'interaction-prompt'?: string;
          'interaction-prompt-style'?: string;
          autoplay?: boolean;
          loading?: string;
          'shadow-intensity'?: string;
          'exposure'?: string;
          'environment-image'?: string;
          'auto-rotate'?: boolean;
          'auto-rotate-delay'?: string;
          'rotation-per-second'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ZooAssistantWindowProps {
  onClose: () => void;
  onFocus?: () => void;
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

const STORAGE_KEY = 'zoo-assistant-position';
// Responsive default size based on screen
const getDefaultSize = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  return isMobile
    ? { width: 140, height: 200 }
    : { width: 220, height: 340 };
};
const MIN_SIZE = { width: 100, height: 150 };
const MAX_SIZE = { width: 500, height: 700 };

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AI_RESPONSES = [
  "That's a great question! At Zoo Labs, we're building decentralized AI infrastructure that puts users in control. 🦊",
  "I love your curiosity! The key to understanding AI is recognizing it as a tool for augmenting human capability, not replacing it. 🚀",
  "Interesting! Did you know that decentralized systems can be more resilient and fair? That's why we're building this way! 💡",
  "You're onto something! The future of AI is open, transparent, and community-driven. We're making that happen at Zoo. 🌟",
  "Great thinking! The intersection of AI and blockchain creates exciting possibilities for trustless, verifiable computation. 🔗",
  "I appreciate you asking! At Zoo, we believe AI should be accessible to everyone, not just big tech companies. 🎉",
];

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

const ZooAssistantWindow: React.FC<ZooAssistantWindowProps> = ({ onClose }) => {
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  
  // Dynamically import model-viewer when component mounts
  useEffect(() => {
    import('@google/model-viewer/dist/model-viewer').then(() => {
      setModelViewerLoaded(true);
    });
  }, []);

  // Chat state
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm the Zoo Labs Assistant 🦒 Ask me anything about AI, decentralization, or just say hello!", timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<HTMLElement & { availableAnimations?: string[]; animationName?: string; play?: () => void }>(null);
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  // Position and size state - responsive for mobile
  const [position, setPosition] = useState<Position>(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const defaultPos = isMobile
      ? { x: window.innerWidth - 160, y: window.innerHeight - 300 }
      : { x: window.innerWidth - 250, y: window.innerHeight - 400 };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate saved position is still on screen
        const savedPos = parsed.position;
        if (savedPos && savedPos.x < window.innerWidth - 50 && savedPos.y < window.innerHeight - 100) {
          return savedPos;
        }
      }
    } catch {
      // localStorage unavailable - use defaults
    }
    return defaultPos;
  });

  const [size, setSize] = useState<Size>(() => {
    const defaultSize = getDefaultSize();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.size || defaultSize;
      }
    } catch {
      // localStorage unavailable - use defaults
    }
    return defaultSize;
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMetaDragging, setIsMetaDragging] = useState(false); // Cmd+drag for desktop repositioning
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save position and size to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ position, size }));
  }, [position, size]);

  // Cycle through tips (only when bubble is visible)
  useEffect(() => {
    if (!showBubble) return;
    const interval = setInterval(() => {
      goToNextTip();
    }, 8000);
    return () => clearInterval(interval);
  }, [showBubble]);

  // Re-show bubble after 1-3 minutes when dismissed
  useEffect(() => {
    if (!bubbleDismissed) return;

    // Random delay between 1-3 minutes (60000-180000ms)
    const delay = 60000 + Math.random() * 120000;

    const timer = setTimeout(() => {
      // Pick a new random tip when re-showing
      setCurrentTip(Math.floor(Math.random() * ZOO_TIPS.length));
      setShowBubble(true);
      setBubbleDismissed(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [bubbleDismissed]);

  const goToNextTip = () => {
    setIsAnimating(true); // Start fade out
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % ZOO_TIPS.length);
      // Small delay before fade in
      setTimeout(() => setIsAnimating(false), 100);
    }, 400);
  };

  const goToPrevTip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev - 1 + ZOO_TIPS.length) % ZOO_TIPS.length);
      setTimeout(() => setIsAnimating(false), 100);
    }, 400);
  };

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatMode && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatMode]);

  // Handle sending a chat message
  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [chatInput]);

  // Handle opening chat mode
  const openChat = useCallback(() => {
    setChatMode(true);
    setShowBubble(false);
    setBubbleDismissed(true);
  }, []);

  // Detect available animations when model loads
  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;

    const handleLoad = () => {
      const animations = modelViewer.availableAnimations || [];
      setAvailableAnimations(animations);
      if (animations.length > 0) {
        modelViewer.animationName = animations[0];
        modelViewer.play?.();
      }
    };

    modelViewer.addEventListener('load', handleLoad);
    return () => modelViewer.removeEventListener('load', handleLoad);
  }, []);

  // Cycle through animations
  const cycleAnimation = useCallback(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || availableAnimations.length === 0) return;

    const nextIndex = (currentAnimation + 1) % availableAnimations.length;
    setCurrentAnimation(nextIndex);
    modelViewer.animationName = availableAnimations[nextIndex];
    modelViewer.play?.();
  }, [currentAnimation, availableAnimations]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
  }, [position]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + deltaX));
    const newY = Math.max(0, Math.min(window.innerHeight - size.height - 80, dragStartRef.current.posY + deltaY));

    setPosition({ x: newX, y: newY });
  }, [isDragging, size]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height,
    };
    setIsResizing(true);
  }, [size]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing || !resizeStartRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStartRef.current.x;
    const deltaY = clientY - resizeStartRef.current.y;

    const newWidth = Math.max(MIN_SIZE.width, Math.min(MAX_SIZE.width, resizeStartRef.current.width + deltaX));
    const newHeight = Math.max(MIN_SIZE.height, Math.min(MAX_SIZE.height, resizeStartRef.current.height + deltaY));

    setSize({ width: newWidth, height: newHeight });
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
  }, []);

  // Global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResizeMove);
      window.addEventListener('touchend', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Cmd+drag handler for desktop repositioning
  useEffect(() => {
    if (!isMetaDragging) return;

    const handleMetaDragMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height - 80, dragStartRef.current.posY + deltaY));
      setPosition({ x: newX, y: newY });
    };

    const handleMetaDragEnd = () => {
      setIsMetaDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMetaDragMove);
    window.addEventListener('mouseup', handleMetaDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleMetaDragMove);
      window.removeEventListener('mouseup', handleMetaDragEnd);
    };
  }, [isMetaDragging, size]);

  const CurrentIcon = ZOO_TIPS[currentTip].icon;

  // Compute bubble position based on giraffe location on screen
  const bubblePosition = React.useMemo(() => {
    const bubbleWidth = 260;
    const bubbleHeight = 180;
    const padding = 20;

    // Check available space on each side
    const spaceLeft = position.x;
    const spaceRight = window.innerWidth - position.x - size.width;
    const spaceTop = position.y;
    const spaceBottom = window.innerHeight - position.y - size.height;

    // Prefer left side, but if not enough space, try other sides
    if (spaceLeft >= bubbleWidth + padding) {
      return { side: 'left' as const, className: 'right-full mr-3 top-0', pointerClass: 'top-8 -right-2' };
    } else if (spaceRight >= bubbleWidth + padding) {
      return { side: 'right' as const, className: 'left-full ml-3 top-0', pointerClass: 'top-8 -left-2' };
    } else if (spaceTop >= bubbleHeight + padding) {
      return { side: 'top' as const, className: 'bottom-full mb-3 left-1/2 -translate-x-1/2', pointerClass: '-bottom-2 left-1/2 -translate-x-1/2' };
    } else {
      return { side: 'bottom' as const, className: 'top-full mt-3 left-1/2 -translate-x-1/2', pointerClass: '-top-2 left-1/2 -translate-x-1/2' };
    }
  }, [position, size]);

  return (
    <div
      ref={containerRef}
      className="fixed z-[100] select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
      }}
    >
      {/* Speech Bubble - responsive positioning based on screen location */}
      {showBubble && (
      <div
        className={`absolute ${bubblePosition.className} w-[220px] sm:w-[260px] transition-all duration-300 z-10 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div
          className="bg-white rounded-2xl p-3 sm:p-4 shadow-2xl relative cursor-pointer hover:shadow-3xl transition-shadow"
          onClick={openChat}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowBubble(false); setBubbleDismissed(true); }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
          >
            <X className="w-3 h-3 text-white" />
          </button>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
              {ZOO_TIPS[currentTip].text}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Zoo Assistant
            </span>
            <div className="flex gap-0.5 sm:gap-1">
              {ZOO_TIPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-500 ${
                    i === currentTip ? 'bg-purple-500 scale-125' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Speech bubble pointer - position based on bubble side */}
        <div className={`absolute ${bubblePosition.pointerClass} w-4 h-4 bg-white transform rotate-45 shadow-lg`} />
      </div>
      )}

      {/* Chat Interface */}
      {chatMode && (
        <div
          className={`absolute ${bubblePosition.className} w-[280px] sm:w-[320px] transition-all duration-300 z-10`}
        >
          <div className="bg-white rounded-2xl shadow-2xl relative flex flex-col" style={{ height: '360px' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-800">Zoo Assistant</span>
                  <span className="block text-[10px] text-green-500">● Online</span>
                </div>
              </div>
              <button
                onClick={() => { setChatMode(false); setBubbleDismissed(true); }}
                className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="w-8 h-8 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Chat bubble pointer */}
          <div className={`absolute ${bubblePosition.pointerClass} w-4 h-4 bg-white transform rotate-45 shadow-lg`} />
        </div>
      )}

      {/* The Zoo Animal (3D Giraffe) */}
      <div className="relative">
        {/* Drag handle */}
        <div
          className={`absolute -top-1 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm cursor-move flex items-center gap-1 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <Move className="w-3 h-3 text-white/80" />
          <span className="text-[10px] text-white/80">drag</span>
        </div>

        {/* 3D Giraffe */}
        <div
          className="drop-shadow-2xl"
          style={{ width: size.width, height: size.height }}
        >
          {!modelViewerLoaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-white/50 text-sm">Loading 3D model...</div>
            </div>
          ) : (
          <model-viewer
            ref={modelViewerRef as React.RefObject<HTMLElement>}
            src="/models/GIRAFFE_ADULT.glb"
            alt="Zoo Giraffe"
            camera-controls={!isMetaDragging}
            camera-orbit=""
            camera-target="0m 28m 0m"
            field-of-view="auto"
            min-camera-orbit="auto auto auto"
            max-camera-orbit="auto auto auto"
            auto-rotate
            auto-rotate-delay="3000"
            rotation-per-second="15deg"
            touch-action={isMetaDragging ? "none" : "pan-y"}
            interaction-prompt="none"
            shadow-intensity="0"
            autoplay
            loading="eager"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              '--poster-color': 'transparent',
              cursor: isMetaDragging ? 'move' : 'grab',
            } as React.CSSProperties}
            onMouseDown={(e: React.MouseEvent) => {
              if (e.metaKey || e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
                setIsMetaDragging(true);
                dragStartRef.current = {
                  x: e.clientX,
                  y: e.clientY,
                  posX: position.x,
                  posY: position.y,
                };
              }
            }}
            onClick={() => {
              if (isMetaDragging) return;
              // Open chat on click, cycle animation with double-click
              openChat();
            }}
            onDoubleClick={() => {
              // Cycle animation on double-click
              if (availableAnimations.length > 0) {
                cycleAnimation();
              }
            }}
          />
          )}
        </div>

        {/* Resize handle */}
        <div
          className={`absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center rounded-tl-lg bg-black/40 backdrop-blur-sm transition-opacity ${isResizing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <Maximize2 className="w-3 h-3 text-white/80 rotate-90" />
        </div>
      </div>

      {/* Click hint */}
      <p
        className={`text-center text-white/40 text-[9px] sm:text-[10px] mt-1 sm:mt-2 ${!showBubble && !chatMode ? 'cursor-pointer hover:text-white/60' : ''}`}
        onClick={() => { if (!showBubble && !chatMode) openChat(); }}
      >
        {isDragging || isMetaDragging ? 'Release to place' : isResizing ? 'Release to resize' : chatMode ? '⌘+drag to move' : '⌘+drag to move • Drag to rotate • Click to chat'}
      </p>
    </div>
  );
};

export default ZooAssistantWindow;
