import React, { useState } from 'react';
import {
  Send,
  Inbox,
  FileText,
  Trash2,
  Star,
  Archive,
  ChevronDown,
  Paperclip,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';

interface ZEmailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// Mailbox items for sidebar
const mailboxes = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 0 },
  { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
  { id: 'sent', label: 'Sent', icon: Send, count: 0 },
  { id: 'starred', label: 'Starred', icon: Star, count: 0 },
  { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
  { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
];

const ZEmailWindow: React.FC<ZEmailWindowProps> = ({ onClose, onFocus }) => {
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [isComposing, setIsComposing] = useState(true);
  const [to, setTo] = useState('z@zeekay.ai');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const handleSendEmail = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    if (!senderEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setSending(true);

    try {
      // Use Web3Forms API for actual email sending
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'd4f2f8a0-8e8a-4f3b-9b1e-2c3d4e5f6a7b', // Public access key
          to: 'z@zeekay.ai',
          from_name: senderName || 'zOS Visitor',
          email: senderEmail,
          subject: `[zOS Mail] ${subject}`,
          message: message,
          redirect: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email sent successfully!');
        setSubject('');
        setMessage('');
        setSenderName('');
        setSenderEmail('');
        setIsComposing(false);
      } else {
        // Fallback to mailto: if Web3Forms fails
        const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${senderName} <${senderEmail}>\n\n${message}`)}`;
        window.open(mailtoLink, '_blank');
        toast.success('Opening email client...');
        setSubject('');
        setMessage('');
      }
    } catch {
      // Fallback to mailto: on error
      const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${senderName} <${senderEmail}>\n\n${message}`)}`;
      window.open(mailtoLink, '_blank');
      toast.success('Opening email client...');
    } finally {
      setSending(false);
    }
  };

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 80, y: 60 }}
      initialSize={{ width: 900, height: 600 }}
      windowType="default"
      className="overflow-hidden"
    >
      <div className="h-full flex bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          {/* Compose button */}
          <div className="p-3 border-b border-[#3c3c3c]">
            <Button
              onClick={() => setIsComposing(true)}
              className="w-full bg-[#0a84ff] hover:bg-[#0066cc] text-white rounded-lg h-9 text-sm font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>

          {/* Mailboxes */}
          <div className="flex-1 overflow-auto py-2">
            <div className="px-3 py-1.5">
              <span className="text-[11px] font-semibold text-[#808080] uppercase tracking-wide">
                Mailboxes
              </span>
            </div>
            {mailboxes.map((mailbox) => {
              const Icon = mailbox.icon;
              return (
                <button
                  key={mailbox.id}
                  onClick={() => {
                    setSelectedMailbox(mailbox.id);
                    if (mailbox.id !== 'inbox') setIsComposing(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                    selectedMailbox === mailbox.id
                      ? "bg-[#0a84ff] text-white"
                      : "text-[#cccccc] hover:bg-[#2a2d2e]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{mailbox.label}</span>
                  {mailbox.count > 0 && (
                    <span className="text-xs bg-[#3c3c3c] px-1.5 py-0.5 rounded-full">
                      {mailbox.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Account section */}
          <div className="p-3 border-t border-[#3c3c3c]">
            <div className="flex items-center gap-2 text-[#808080] text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>iCloud</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {isComposing ? (
            /* Compose view */
            <>
              {/* Toolbar */}
              <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-3 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="h-7 px-3 bg-[#0a84ff] hover:bg-[#0066cc] text-white text-xs rounded-md"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {sending ? 'Sending...' : 'Send'}
                </Button>
                <div className="h-5 w-px bg-[#3c3c3c] mx-2" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="h-5 w-px bg-[#3c3c3c] mx-2" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Bold className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Italic className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Image className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Email form */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header fields */}
                <div className="bg-[#1e1e1e] border-b border-[#3c3c3c]">
                  {/* To field */}
                  <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                    <span className="text-[#808080] text-sm w-16">To:</span>
                    <input
                      type="text"
                      value={to}
                      readOnly
                      className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none"
                    />
                  </div>

                  {/* From name */}
                  <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                    <span className="text-[#808080] text-sm w-16">From:</span>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
                    />
                  </div>

                  {/* Reply-to email */}
                  <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                    <span className="text-[#808080] text-sm w-16">Email:</span>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
                    />
                  </div>

                  {/* Subject field */}
                  <div className="flex items-center h-9 px-4">
                    <span className="text-[#808080] text-sm w-16">Subject:</span>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject..."
                      className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none placeholder:text-[#555]"
                    />
                  </div>
                </div>

                {/* Message body */}
                <div className="flex-1 p-4 overflow-auto">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full h-full bg-transparent text-[#cccccc] text-sm outline-none resize-none placeholder:text-[#555] leading-relaxed"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty inbox view */
            <div className="flex-1 flex flex-col items-center justify-center text-[#808080]">
              <Inbox className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Messages</p>
              <p className="text-sm">
                {selectedMailbox === 'inbox'
                  ? 'Your inbox is empty'
                  : `No messages in ${mailboxes.find(m => m.id === selectedMailbox)?.label}`
                }
              </p>
              <Button
                onClick={() => setIsComposing(true)}
                variant="ghost"
                className="mt-4 text-[#0a84ff] hover:text-[#0066cc] hover:bg-[#2a2d2e]"
              >
                Compose a message
              </Button>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZEmailWindow;
