
import React, { useState } from 'react';
import { Send, AtSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ZWindow from './ZWindow';
import InstagramProfileEmbed from './InstagramProfileEmbed';

interface ZEmailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const ZEmailWindow: React.FC<ZEmailWindowProps> = ({ onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showInstagram, setShowInstagram] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setSending(true);
    
    // This would typically use a backend API to send emails
    // For demo purposes, we'll simulate the email sending
    setTimeout(() => {
      setSending(false);
      toast.success('Email sent successfully!');
      setSubject('');
      setMessage('');
    }, 1500);
    
    // In a real implementation, you'd call an API endpoint
    // Example: fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to: 'zeekayai@example.com', subject, message }) })
  };

  const handleInsertInstagram = () => {
    setShowInstagram(!showInstagram);
    if (!showInstagram) {
      setMessage(message + '\n\n[Instagram profile embedded]\n\n');
    }
  };

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      initialPosition={{ x: 100, y: 80 }}
      initialSize={{ width: 800, height: 600 }}
      windowType="default"
      className="bg-white/95"
    >
      <div className="h-full flex flex-col">
        <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between items-center">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleInsertInstagram}>
              <AtSign className="h-4 w-4 mr-1" />
              Instagram
            </Button>
          </div>
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSendEmail}
            disabled={sending}
          >
            <Send className="h-4 w-4 mr-1" />
            Send
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <form onSubmit={handleSendEmail} className="p-4 h-full flex flex-col">
            <div className="flex items-center mb-4">
              <span className="w-24 text-gray-700">To:</span>
              <Input 
                value="zeekayai@example.com" 
                readOnly 
                className="bg-gray-50"
              />
            </div>

            <div className="flex items-center mb-4">
              <span className="w-24 text-gray-700">Subject:</span>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="Enter subject..."
                required
              />
            </div>

            <div className="flex-1 mb-4">
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Write your message here..."
                className="h-full min-h-[200px] resize-none"
                required
              />
            </div>

            {showInstagram && (
              <div className="border rounded-md p-3 mb-4 bg-gray-50">
                <h3 className="font-medium mb-2">Instagram Profile Preview</h3>
                <InstagramProfileEmbed />
              </div>
            )}
          </form>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZEmailWindow;
