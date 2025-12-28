import React, { useState, useRef, useCallback } from 'react';
import {
  Send,
  Inbox,
  FileText,
  Trash2,
  Star,
  Archive,
  Paperclip,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  MoreHorizontal,
  Reply,
  Forward,
  X,
  Settings,
  ChevronDown,
  File,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { useDropTarget, type DragItem, type DragFileItem, type DragOperation } from '@/contexts/DragDropContext';

interface ZEmailWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

interface Email {
  id: string;
  from: { name: string; email: string };
  to: string;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
  attachments: EmailAttachment[];
  folder: string;
}

interface Signature {
  id: string;
  name: string;
  content: string;
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

const defaultSignatures: Signature[] = [
  { id: 'default', name: 'Default', content: '\n\nBest regards,\nZ' },
  { id: 'professional', name: 'Professional', content: '\n\nBest,\nZachary Elliott\nzeekay.ai' },
  { id: 'none', name: 'No Signature', content: '' },
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
  
  // Enhanced features
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<Signature>(defaultSignatures[0]);
  const [showSignatureMenu, setShowSignatureMenu] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [formatting, setFormatting] = useState({ bold: false, italic: false, list: false });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Handle file drops for attachments
  const handleFileDrop = useCallback((item: DragItem, _operation: DragOperation) => {
    const fileData = item.data as DragFileItem;
    const attachment: EmailAttachment = {
      id: Math.random().toString(36).substring(2),
      name: fileData.name,
      size: fileData.size ? parseInt(fileData.size) * 1024 : 0, // Approximate from size string
      type: fileData.type === 'file' ? 'application/octet-stream' : 'folder',
    };
    setAttachments((prev) => [...prev, attachment]);
    toast.success(`Attached: ${fileData.name}`);
  }, []);

  // Drop target for the compose area
  const composeDropTarget = useDropTarget(
    'email-compose',
    ['file', 'folder', 'image'],
    handleFileDrop
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const attachment: EmailAttachment = {
        id: Math.random().toString(36).substring(2),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id ? { ...a, preview: reader.result as string } : a
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setAttachments((prev) => [...prev, attachment]);
    });

    toast.success(`${files.length} file(s) attached`);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const applyFormatting = (type: 'bold' | 'italic' | 'list') => {
    if (!messageRef.current) return;
    
    const textarea = messageRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let newText = '';
    switch (type) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'list':
        newText = selectedText
          .split('\n')
          .map((line) => `• ${line}`)
          .join('\n');
        break;
    }
    
    const newMessage = message.substring(0, start) + newText + message.substring(end);
    setMessage(newMessage);
    setFormatting((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleReply = (email: Email) => {
    setIsComposing(true);
    setSubject(`Re: ${email.subject}`);
    setMessage(`\n\n--- Original Message ---\nFrom: ${email.from.name} <${email.from.email}>\nDate: ${email.date.toLocaleString()}\n\n${email.body}`);
    setSelectedEmail(null);
  };

  const handleForward = (email: Email) => {
    setIsComposing(true);
    setSubject(`Fwd: ${email.subject}`);
    setMessage(`\n\n--- Forwarded Message ---\nFrom: ${email.from.name} <${email.from.email}>\nTo: ${email.to}\nDate: ${email.date.toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`);
    setAttachments(email.attachments);
    setSelectedEmail(null);
  };

  const handleDelete = (email: Email) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === email.id ? { ...e, folder: 'trash' } : e
      )
    );
    setSelectedEmail(null);
    toast.success('Email moved to trash');
  };

  const toggleStar = (email: Email) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === email.id ? { ...e, starred: !e.starred } : e
      )
    );
  };

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

    const fullMessage = message + selectedSignature.content;

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'd4f2f8a0-8e8a-4f3b-9b1e-2c3d4e5f6a7b',
          to: 'z@zeekay.ai',
          from_name: senderName || 'zOS Visitor',
          email: senderEmail,
          subject: `[zOS Mail] ${subject}`,
          message: fullMessage,
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
        setAttachments([]);
        setIsComposing(false);
      } else {
        const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${senderName} <${senderEmail}>\n\n${fullMessage}`)}`;
        window.open(mailtoLink, '_blank');
        toast.success('Opening email client...');
        setSubject('');
        setMessage('');
      }
    } catch {
      const mailtoLink = `mailto:z@zeekay.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${senderName} <${senderEmail}>\n\n${message + selectedSignature.content}`)}`;
      window.open(mailtoLink, '_blank');
      toast.success('Opening email client...');
    } finally {
      setSending(false);
    }
  };

  const filteredEmails = emails.filter((email) => {
    if (selectedMailbox === 'starred') return email.starred;
    return email.folder === selectedMailbox;
  });

  return (
    <ZWindow
      title="Mail"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 80, y: 60 }}
      initialSize={{ width: 950, height: 650 }}
      windowType="default"
      className="overflow-hidden"
    >
      <div className="h-full flex bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-56 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
          {/* Compose button */}
          <div className="p-3 border-b border-[#3c3c3c]">
            <Button
              onClick={() => {
                setIsComposing(true);
                setSelectedEmail(null);
                setSubject('');
                setMessage('');
                setAttachments([]);
              }}
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
              const count = mailbox.id === 'starred' 
                ? emails.filter(e => e.starred).length
                : emails.filter(e => e.folder === mailbox.id).length;
              return (
                <button
                  key={mailbox.id}
                  onClick={() => {
                    setSelectedMailbox(mailbox.id);
                    setIsComposing(false);
                    setSelectedEmail(null);
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
                  {count > 0 && (
                    <span className="text-xs bg-[#3c3c3c] px-1.5 py-0.5 rounded-full">
                      {count}
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileAttachment}
                />
                <div className="h-5 w-px bg-[#3c3c3c] mx-2" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-7 w-7 hover:bg-[#3c3c3c]",
                    formatting.bold ? "text-[#0a84ff]" : "text-[#808080] hover:text-white"
                  )}
                  onClick={() => applyFormatting('bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-7 w-7 hover:bg-[#3c3c3c]",
                    formatting.italic ? "text-[#0a84ff]" : "text-[#808080] hover:text-white"
                  )}
                  onClick={() => applyFormatting('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-7 w-7 hover:bg-[#3c3c3c]",
                    formatting.list ? "text-[#0a84ff]" : "text-[#808080] hover:text-white"
                  )}
                  onClick={() => applyFormatting('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <Image className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                
                {/* Signature selector */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[#808080] hover:text-white hover:bg-[#3c3c3c] text-xs"
                    onClick={() => setShowSignatureMenu(!showSignatureMenu)}
                  >
                    <Settings className="w-3.5 h-3.5 mr-1" />
                    {selectedSignature.name}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                  {showSignatureMenu && (
                    <div className="absolute right-0 top-8 w-40 bg-[#2d2d2d] border border-[#3c3c3c] rounded-md shadow-lg z-10">
                      {defaultSignatures.map((sig) => (
                        <button
                          key={sig.id}
                          onClick={() => {
                            setSelectedSignature(sig);
                            setShowSignatureMenu(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-xs hover:bg-[#3c3c3c]",
                            selectedSignature.id === sig.id ? "text-[#0a84ff]" : "text-[#cccccc]"
                          )}
                        >
                          {sig.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="icon" className="h-7 w-7 text-[#808080] hover:text-white hover:bg-[#3c3c3c]">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Email form - supports drag & drop attachments */}
              <div
                ref={composeDropTarget.ref}
                className={`flex-1 flex flex-col overflow-hidden transition-colors ${
                  composeDropTarget.isOver && composeDropTarget.canDrop ? 'bg-blue-500/10 ring-2 ring-blue-500/30 ring-inset' : ''
                }`}
                onDragOver={composeDropTarget.onDragOver}
                onDragEnter={composeDropTarget.onDragEnter}
                onDragLeave={composeDropTarget.onDragLeave}
                onDrop={composeDropTarget.onDrop}
              >
                {/* Header fields */}
                <div className="bg-[#1e1e1e] border-b border-[#3c3c3c]">
                  <div className="flex items-center h-9 px-4 border-b border-[#3c3c3c]">
                    <span className="text-[#808080] text-sm w-16">To:</span>
                    <input
                      type="text"
                      value={to}
                      readOnly
                      className="flex-1 bg-transparent text-[#cccccc] text-sm outline-none"
                    />
                  </div>

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

                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-2 py-1 text-xs text-[#cccccc]"
                      >
                        {attachment.preview ? (
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <File className="w-4 h-4" />
                        )}
                        <span className="max-w-[120px] truncate">{attachment.name}</span>
                        <span className="text-[#808080]">({formatFileSize(attachment.size)})</span>
                        <button
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-[#808080] hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message body */}
                <div className="flex-1 p-4 overflow-auto">
                  <textarea
                    ref={messageRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full h-full bg-transparent text-[#cccccc] text-sm outline-none resize-none placeholder:text-[#555] leading-relaxed"
                  />
                </div>

                {/* Signature preview */}
                {selectedSignature.content && (
                  <div className="px-4 pb-4 text-xs text-[#808080] whitespace-pre-line">
                    {selectedSignature.content}
                  </div>
                )}
              </div>
            </>
          ) : selectedEmail ? (
            /* Email detail view */
            <>
              <div className="h-11 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center px-3 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReply(selectedEmail)}
                  className="h-7 px-3 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] text-xs"
                >
                  <Reply className="w-3.5 h-3.5 mr-1.5" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleForward(selectedEmail)}
                  className="h-7 px-3 text-[#cccccc] hover:text-white hover:bg-[#3c3c3c] text-xs"
                >
                  <Forward className="w-3.5 h-3.5 mr-1.5" />
                  Forward
                </Button>
                <div className="h-5 w-px bg-[#3c3c3c] mx-2" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStar(selectedEmail)}
                  className={cn(
                    "h-7 w-7 hover:bg-[#3c3c3c]",
                    selectedEmail.starred ? "text-yellow-500" : "text-[#808080] hover:text-white"
                  )}
                >
                  <Star className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(selectedEmail)}
                  className="h-7 w-7 text-[#808080] hover:text-red-400 hover:bg-[#3c3c3c]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <h2 className="text-xl font-medium text-white mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <div className="w-10 h-10 rounded-full bg-[#0a84ff] flex items-center justify-center text-white font-medium">
                    {selectedEmail.from.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedEmail.from.name}</p>
                    <p className="text-[#808080]">{selectedEmail.from.email}</p>
                  </div>
                  <span className="text-[#808080] ml-auto">
                    {selectedEmail.date.toLocaleString()}
                  </span>
                </div>
                {selectedEmail.attachments.length > 0 && (
                  <div className="mb-4 p-3 bg-[#252526] rounded-lg">
                    <p className="text-xs text-[#808080] mb-2">Attachments ({selectedEmail.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((att) => (
                        <button
                          key={att.id}
                          className="flex items-center gap-2 bg-[#3c3c3c] rounded-md px-3 py-2 text-xs text-[#cccccc] hover:bg-[#4c4c4c]"
                        >
                          {att.preview ? (
                            <img src={att.preview} alt={att.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <File className="w-4 h-4" />
                          )}
                          <span className="max-w-[100px] truncate">{att.name}</span>
                          <Download className="w-3 h-3 text-[#808080]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-[#cccccc] text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.body}
                </div>
              </div>
            </>
          ) : (
            /* Empty inbox view */
            <div className="flex-1 flex flex-col">
              {filteredEmails.length > 0 ? (
                <div className="flex-1 overflow-auto">
                  {filteredEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 border-b border-[#3c3c3c] text-left hover:bg-[#2a2d2e]",
                        !email.read && "bg-[#252526]"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(email);
                        }}
                        className={cn(
                          "p-1 rounded",
                          email.starred ? "text-yellow-500" : "text-[#555] hover:text-[#808080]"
                        )}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm truncate", email.read ? "text-[#cccccc]" : "text-white font-medium")}>
                            {email.from.name}
                          </span>
                          <span className="text-xs text-[#808080]">
                            {email.date.toLocaleDateString()}
                          </span>
                        </div>
                        <p className={cn("text-sm truncate", email.read ? "text-[#808080]" : "text-[#cccccc]")}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-[#555] truncate">{email.body.substring(0, 100)}</p>
                      </div>
                      {email.attachments.length > 0 && (
                        <Paperclip className="w-4 h-4 text-[#808080]" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
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
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZEmailWindow;
