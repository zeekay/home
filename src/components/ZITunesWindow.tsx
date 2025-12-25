
import React, { useState, useEffect } from 'react';
import { SkipBack, SkipForward, User, List, Music, Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ZITunesWindowProps {
  onClose: () => void;
}

const ZITunesWindow: React.FC<ZITunesWindowProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [size] = useState({ width: 800, height: 600 });
  const [view, setView] = useState<'profile' | 'playlist'>('profile');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  
  // Mock data - in a real app, this would come from the Spotify API
  const profileInfo = {
    name: "Your Name",
    imageUrl: "https://placekitten.com/100/100", // placeholder image
    followers: 123,
    following: 45
  };
  
  const playlists = [
    { 
      id: "37i9dQZEVXcJZyENOWUFo7", 
      name: "Discover Weekly", 
      description: "Your weekly mixtape of fresh music.",
      imageUrl: "https://placekitten.com/300/300" 
    },
    { 
      id: "37i9dQZF1DX0XUsuxWHRQd", 
      name: "Chill Hits", 
      description: "Kick back to the best new and recent chill hits.",
      imageUrl: "https://placekitten.com/301/301" 
    },
    { 
      id: "37i9dQZF1DX4sWSpwq3LiO", 
      name: "Peaceful Piano", 
      description: "Peaceful piano to help you slow down, breathe, and relax.",
      imageUrl: "https://placekitten.com/302/302" 
    }
  ];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
    setView('playlist');
  };

  const handleBackToProfile = () => {
    setView('profile');
    setSelectedPlaylist(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      className={cn(
        'fixed z-40 rounded-lg overflow-hidden shadow-2xl border border-gray-500/20',
        'bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* iTunes Title Bar */}
      <div
        className="h-8 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center px-3"
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2 items-center">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="text-center flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          iTunes
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <div className="flex h-[calc(100%-72px)]">
        <div className="w-48 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 p-4">
          <div className="flex flex-col space-y-2">
            <button 
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm",
                view === 'profile' ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
              onClick={() => setView('profile')}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button 
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm",
                view === 'playlist' ? "bg-blue-500 text-white" : "hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <List className="w-4 h-4" />
              <span>Playlists</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
              <Music className="w-4 h-4" />
              <span>Music</span>
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 p-6">
          {view === 'profile' ? (
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                <img 
                  src={profileInfo.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold mb-2">{profileInfo.name}</h2>
              <div className="flex space-x-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">{profileInfo.followers}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{profileInfo.following}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Your Playlists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {playlists.map((playlist) => (
                  <div 
                    key={playlist.id}
                    className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={() => handleSelectPlaylist(playlist.id)}
                  >
                    <img 
                      src={playlist.imageUrl} 
                      alt={playlist.name} 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{playlist.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{playlist.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToProfile}
                className="mb-4"
              >
                ← Back to Profile
              </Button>
              {selectedPlaylist && (
                <iframe 
                  src={`https://open.spotify.com/embed/playlist/${selectedPlaylist}`} 
                  width="100%" 
                  height="calc(100% - 40px)" 
                  frameBorder="0" 
                  allow="encrypted-media"
                  title="Spotify Playlist"
                ></iframe>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Control Bar */}
      <div className="h-10 bg-gray-100 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600 flex items-center px-4 space-x-4">
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <Play className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div className="w-1/2 h-full bg-gray-500 dark:bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZITunesWindow;
