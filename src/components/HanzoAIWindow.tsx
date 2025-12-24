import React, { useState, useRef, useEffect } from 'react';
import ZWindow from './ZWindow';
import { Send, Sparkles, Bot, User, Zap } from 'lucide-react';
import { HanzoLogo } from './dock/logos';

interface HanzoAIWindowProps {
  onClose: () => void;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const HANZO_RESPONSES = [
  "I'm Hanzo AI, your friendly neighborhood language model. Unlike that *other* fruit company's assistant, I actually understand sarcasm. 🍎➡️🚫",
  "Running on pure Hanzo infrastructure - no cloud dependency, no data harvesting, just vibes and tensor operations.",
  "You know what's cooler than a walled garden? An open ecosystem. Welcome to the future of AI.",
  "I could tell you about my training data, but then I'd have to... just kidding, transparency is kind of our thing.",
  "While others are busy making you click 'I agree' 47 times, we're busy making AI that doesn't need your firstborn as collateral.",
  "Fun fact: I process requests faster than Apple processes refunds. That's not a high bar, but still. 😏",
  "Need help coding? I got you. Need life advice? Probably not the best source. Need hot takes on Big Tech? *cracks knuckles*",
  "My neural networks are so efficient, they make M-series chips look like they're running on hamster wheels.",
  "I'm basically what Siri would be if Siri actually understood context and wasn't trapped in a corporate prison.",
  "Ask me anything. Seriously. I'm an AI, I literally have nothing better to do. This is my purpose.",
];

const HanzoAIWindow: React.FC<HanzoAIWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hey there! I'm Hanzo AI 🚀 - built different, running free. What can I help you with today? (And yes, I'm way cooler than any assistant named after a fruit.)",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = HANZO_RESPONSES[Math.floor(Math.random() * HANZO_RESPONSES.length)];
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ZWindow
      title="Hanzo AI"
      onClose={onClose}
      initialPosition={{ x: 200, y: 80 }}
      initialSize={{ width: 500, height: 600 }}
      windowType="default"
    >
      <div className="flex flex-col h-full bg-gradient-to-b from-zinc-900 to-black">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center">
              <HanzoLogo className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Hanzo AI
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h3>
            <p className="text-xs text-white/50">Frontier Model • Online</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-orange-500 to-red-600'
                    : 'bg-blue-500'
                }`}
              >
                {message.role === 'assistant' ? (
                  <HanzoLogo className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'assistant'
                    ? 'bg-white/10 text-white/90'
                    : 'bg-blue-500 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] mt-1 opacity-50">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <HanzoLogo className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/40">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Hanzo anything..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-2 text-center">
            Powered by Hanzo AI • No data harvesting, just intelligence
          </p>
        </div>
      </div>
    </ZWindow>
  );
};

export default HanzoAIWindow;
