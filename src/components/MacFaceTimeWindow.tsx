
import React, { useState, useEffect } from 'react';
import MacWindow from './MacWindow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Video, VideoOff, Mic, MicOff, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const MacFaceTimeWindow = ({ onClose }: { onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  
  // Sample contacts
  const contacts = [
    { id: 1, name: 'Sarah Johnson', avatar: '/placeholder.svg', online: true },
    { id: 2, name: 'Michael Chen', avatar: '/placeholder.svg', online: true },
    { id: 3, name: 'Emma Wilson', avatar: '/placeholder.svg', online: false },
    { id: 4, name: 'James Rodriguez', avatar: '/placeholder.svg', online: true },
  ];

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startCall = (contactName: string) => {
    toast.success(`Starting FaceTime call with ${contactName}`);
    setIsCallActive(true);
    setCallTimer(0);
  };

  const endCall = () => {
    toast.info('Call ended');
    setIsCallActive(false);
    setCallTimer(0);
    setIsMuted(false);
    setIsVideoOff(false);
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
        {isCallActive ? (
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
                  {/* This would be your camera feed in a real app */}
                  <div className="text-center text-gray-300">
                    <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-purple-500">
                      <AvatarFallback className="bg-purple-700 text-2xl">ZK</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-medium">You</h3>
                  </div>
                  
                  {/* Small preview of the other person */}
                  <div className="absolute bottom-4 right-4 w-48 h-32 bg-gradient-to-b from-blue-800 to-blue-900 rounded-md shadow-lg flex items-center justify-center">
                    <div className="text-center text-gray-300">
                      <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-blue-400">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-blue-700">SJ</AvatarFallback>
                      </Avatar>
                      <p className="text-sm">Sarah Johnson</p>
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
              <div className="w-16"></div> {/* Spacer to center the control buttons */}
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
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Recent Contacts</h3>
              <div className="space-y-2">
                {filteredContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => startCall(contact.name)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-blue-600">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{contact.name}</p>
                        <p className="text-xs text-gray-500">
                          {contact.online ? 
                            <span className="text-green-500">● Online</span> : 
                            'Offline'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>FaceTime allows you to make video calls to anyone with a Mac, iPhone, iPad, or iPod touch.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </MacWindow>
  );
};

export default MacFaceTimeWindow;
