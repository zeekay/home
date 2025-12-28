import React, { useState, useCallback } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDropTarget, type DragItem, type DragFileItem, type DragOperation } from '@/contexts/DragDropContext';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  ThumbsUp,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';

interface ZMessagesWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Facebook Messenger icon
const MessengerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

const FACEBOOK_USERNAME = 'zeekay';
const MESSENGER_URL = `https://m.me/${FACEBOOK_USERNAME}`;

// Sample conversation to show the UI
const sampleMessages = [
  {
    id: '1',
    text: "Hey! 👋 Welcome to my site.",
    fromMe: true,
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: '2', 
    text: "Feel free to message me here! I'm usually quick to respond.\n\nYou can ask me about:\n• Hanzo AI & our products\n• Lux blockchain\n• Collaboration opportunities\n• Or just say hi!",
    fromMe: true,
    time: '10:31 AM',
    status: 'read',
  },
];

const ZMessagesWindow: React.FC<ZMessagesWindowProps> = ({ onClose, onFocus }) => {
  const [messageInput, setMessageInput] = useState('');

  // Handle file/image drops for sharing
  const handleFileDrop = useCallback((item: DragItem, _operation: DragOperation) => {
    if (item.itemType === 'url') {
      const url = item.data as string;
      setMessageInput((prev) => prev + (prev ? '\n' : '') + url);
      toast.success('URL added to message');
    } else {
      const fileData = item.data as DragFileItem;
      toast.success(`Ready to share: ${fileData.name}`);
      // In a real app, this would attach the file to the message
    }
  }, []);

  // Drop target for the chat area
  const chatDropTarget = useDropTarget(
    'messages-chat',
    ['file', 'folder', 'image', 'url', 'text'],
    handleFileDrop
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // Open Messenger with the conversation
    window.open(MESSENGER_URL, '_blank');
    setMessageInput('');
  };

  const openMessenger = () => {
    window.open(MESSENGER_URL, '_blank');
  };

  return (
    <ZWindow
      title="Messages"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={420}
      defaultHeight={650}
      minWidth={360}
      minHeight={500}
      defaultPosition={{ x: 200, y: 60 }}
    >
      <div className="flex flex-col h-full bg-[#000000] overflow-hidden">
        {/* Messenger Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#000000] border-b border-white/10">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              Z
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#31a24c] rounded-full border-2 border-black" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-base">Z</p>
            <p className="text-[#65676b] text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-[#31a24c] rounded-full"></span>
              Active now
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={openMessenger}
              className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              onClick={openMessenger}
              className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3a3a] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Area - supports drag & drop */}
        <div
          ref={chatDropTarget.ref}
          className={`flex-1 overflow-y-auto p-4 space-y-3 bg-[#000000] transition-colors ${
            chatDropTarget.isOver && chatDropTarget.canDrop ? 'bg-blue-500/10 ring-2 ring-blue-500/30 ring-inset' : ''
          }`}
          onDragOver={chatDropTarget.onDragOver}
          onDragEnter={chatDropTarget.onDragEnter}
          onDragLeave={chatDropTarget.onDragLeave}
          onDrop={chatDropTarget.onDrop}
        >
          {/* Profile Card at Top */}
          <div className="flex flex-col items-center py-6 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg">
              Z
            </div>
            <h3 className="text-white font-semibold text-lg">Z</h3>
            <p className="text-[#65676b] text-sm">Facebook</p>
            <p className="text-[#65676b] text-xs mt-1">You're connected on Facebook</p>
          </div>

          {/* Messages */}
          {sampleMessages.map((msg, idx) => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.fromMe ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] px-3 py-2 rounded-2xl',
                  msg.fromMe 
                    ? 'bg-gradient-to-r from-[#0084ff] to-[#0099ff] text-white' 
                    : 'bg-[#303030] text-white'
                )}
              >
                <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Read receipt */}
          <div className="flex justify-end">
            <div className="flex items-center gap-1 text-[#65676b] text-xs">
              <CheckCheck className="w-3 h-3" />
              Seen
            </div>
          </div>

          {/* CTA Card */}
          <div className="flex justify-center mt-6">
            <div className="bg-[#1c1c1c] rounded-2xl p-5 max-w-[90%] text-center border border-white/5">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-[#00c6ff] to-[#0078ff] flex items-center justify-center">
                <MessengerIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-1">Message me on Messenger</h3>
              <p className="text-[#65676b] text-sm mb-4">
                Click below to start chatting
              </p>
              <button
                onClick={openMessenger}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#00c6ff] to-[#0078ff] hover:opacity-90 text-white rounded-full font-semibold transition-opacity"
              >
                <MessengerIcon className="w-5 h-5" />
                Open Messenger
                <ExternalLink className="w-4 h-4" />
              </button>
              
              {/* Alternative links */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                <a
                  href="https://x.com/zeekay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#65676b] hover:text-white text-sm transition-colors"
                >
                  𝕏 @zeekay
                </a>
                <span className="text-[#65676b]">•</span>
                <a
                  href="https://instagram.com/zeekayai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#65676b] hover:text-white text-sm transition-colors"
                >
                  📸 @zeekayai
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#000000] border-t border-white/10">
          <button className="w-9 h-9 rounded-full bg-[#303030] flex items-center justify-center text-[#0084ff] hover:bg-[#3a3a3a] transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-full bg-[#303030] flex items-center justify-center text-[#0084ff] hover:bg-[#3a3a3a] transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Aa"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full px-4 py-2 bg-[#303030] text-white text-sm rounded-full outline-none placeholder:text-[#65676b] focus:ring-1 focus:ring-[#0084ff]"
            />
          </div>
          {messageInput.trim() ? (
            <button
              onClick={handleSendMessage}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#0084ff] hover:bg-[#303030] transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={openMessenger}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#0084ff] hover:bg-[#303030] transition-colors"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZMessagesWindow;
