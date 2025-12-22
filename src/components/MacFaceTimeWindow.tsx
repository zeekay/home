import React, { useState, useEffect } from 'react';
import MacWindow from './MacWindow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Video, VideoOff, Mic, MicOff, Phone, Mail, Bot, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { contacts } from '@/data/socials';

const MacFaceTimeWindow = ({ onClose }: { onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [activeContact, setActiveContact] = useState<typeof contacts[0] | null>(null);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startCall = (contact: typeof contacts[0]) => {
    if (contact.isAI) {
      toast.success(`Connecting to ${contact.name}...`, {
        description: 'AI assistant is ready to help',
      });
    } else {
      toast.success(`Starting FaceTime call with ${contact.name}`);
    }
    setActiveContact(contact);
    setIsCallActive(true);
    setCallTimer(0);
  };

  const endCall = () => {
    toast.info('Call ended');
    setIsCallActive(false);
    setCallTimer(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setActiveContact(null);
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
    toast.success('Opening email client...');
  };

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCallActive) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  // Format timer as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <MacWindow
      title="FaceTime"
      onClose={onClose}
      initialPosition={{ x: 250, y: 120 }}
      initialSize={{ width: 700, height: 550 }}
      windowType="default"
      className="bg-gray-100/95 dark:bg-gray-900/95"
    >
      <div className="h-full flex flex-col">
        {isCallActive && activeContact ? (
          // Active call UI
          <div className="flex-1 flex flex-col bg-black relative">
            {/* Main video area */}
            <div className="flex-1 flex items-center justify-center">
              {isVideoOff ? (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <VideoOff className="h-16 w-16 mb-2" />
                  <p>Your camera is off</p>
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                  {/* Remote participant */}
                  <div className="text-center text-gray-300">
                    <div className={`h-32 w-32 mx-auto mb-4 rounded-full bg-gradient-to-br ${activeContact.color} flex items-center justify-center border-4 border-white/20`}>
                      {activeContact.isAI ? (
                        <Bot className="w-16 h-16 text-white" />
                      ) : (
                        <span className="text-4xl font-bold text-white">{activeContact.avatar}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium">{activeContact.name}</h3>
                    <p className="text-sm text-gray-400">{activeContact.role}</p>
                    {activeContact.isAI && (
                      <p className="text-xs text-green-400 mt-2">● AI Assistant Active</p>
                    )}
                  </div>

                  {/* Small preview of yourself */}
                  <div className="absolute bottom-4 right-4 w-48 h-32 bg-gradient-to-b from-purple-800 to-purple-900 rounded-md shadow-lg flex items-center justify-center">
                    <div className="text-center text-gray-300">
                      <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-400">
                        <span className="text-lg font-bold">ZK</span>
                      </div>
                      <p className="text-sm">You</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call controls */}
            <div className="bg-gray-900 p-3 flex items-center justify-between">
              <div className="text-gray-300 text-sm">
                {formatTime(callTimer)}
              </div>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full ${isMuted ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full ${isVideoOff ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-red-600 text-white hover:bg-red-700"
                  onClick={endCall}
                >
                  <Phone className="h-5 w-5 rotate-135" />
                </Button>
              </div>
              <div className="w-16"></div>
            </div>
          </div>
        ) : (
          // Contact list UI
          <>
            <div className="bg-gray-200 dark:bg-gray-800 p-2 flex items-center space-x-2 border-b border-gray-300 dark:border-gray-700">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search Contacts"
                  className="pl-8 bg-gray-100 dark:bg-gray-950 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-4 w-4 absolute left-2 top-2 text-gray-500" />
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Contacts</h3>
              <div className="space-y-2">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                  >
                    <div className="flex items-center" onClick={() => startCall(contact)}>
                      <div className={`h-12 w-12 mr-3 rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center`}>
                        {contact.isAI ? (
                          <Bot className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-lg font-bold text-white">{contact.avatar}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{contact.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {contact.isAI && <Bot className="w-3 h-3" />}
                          {contact.role}
                        </p>
                        <p className="text-xs text-gray-400">{contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-700 dark:text-gray-300"
                        onClick={() => sendEmail(contact.email)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-gray-700 dark:text-gray-300"
                        onClick={() => startCall(contact)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Assistants Section */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Assistants
                </h4>
                <p className="text-xs text-gray-500">
                  Hanzo Dev and Z AI are AI assistants available 24/7 to help with development, questions, and more.
                </p>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Click on a contact to start a video call or send an email.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </MacWindow>
  );
};

export default MacFaceTimeWindow;
