import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { cn } from '@/lib/utils';
import { Music, Radio, Heart, ListMusic, Play, Pause, SkipForward, SkipBack, Volume2, ExternalLink, User } from 'lucide-react';
import { socialProfiles } from '@/data/socials';

interface MacMusicWindowProps {
  onClose: () => void;
}

type TabType = 'spotify' | 'soundcloud';

const MacMusicWindow: React.FC<MacMusicWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const spotifyProfile = socialProfiles.spotify;
  const soundcloudProfile = socialProfiles.soundcloud;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'spotify', label: 'Spotify', icon: <Music className="w-4 h-4" /> },
    { id: 'soundcloud', label: 'SoundCloud', icon: <Radio className="w-4 h-4" /> },
  ];

  return (
    <MacWindow
      title="Music"
      onClose={onClose}
      defaultWidth={900}
      defaultHeight={650}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 180, y: 100 }}
    >
      <div className="flex flex-col h-full bg-transparent">
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Music</h2>
              <p className="text-white/50 text-xs">Stream your favorites</p>
            </div>
          </div>
          
          {/* Tab buttons */}
          <div className="flex gap-1 glass-sm rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'spotify' && (
            <div className="flex flex-col h-full p-4">
              {/* Spotify header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1DB954] flex items-center justify-center shadow-lg">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Spotify Profile</h3>
                    <p className="text-white/50 text-sm">@{spotifyProfile.handle}</p>
                  </div>
                </div>
                <a
                  href={spotifyProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-medium rounded-full transition-colors flex items-center gap-2"
                >
                  Open Spotify <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Spotify Follow Button Embed */}
              <div className="mb-4 p-4 rounded-xl glass-sm">
                <iframe 
                  src={`https://open.spotify.com/follow/1/?uri=spotify:user:${spotifyProfile.handle}&size=detail&theme=dark`}
                  width="300" 
                  height="56" 
                  scrolling="no" 
                  frameBorder="0" 
                  style={{ border: 'none', overflow: 'hidden' }} 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
              </div>

              {/* Spotify Playlist Embed - Using a featured playlist */}
              <div className="flex-1 rounded-xl overflow-hidden glass-sm">
                <iframe
                  src="https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>

              <p className="text-white/40 text-xs mt-2 text-center">
                💡 Follow @{spotifyProfile.handle} on Spotify to see their playlists
              </p>
            </div>
          )}

          {activeTab === 'soundcloud' && (
            <div className="flex flex-col h-full p-4">
              {/* SoundCloud header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">SoundCloud</h3>
                    <p className="text-white/50 text-sm">@{soundcloudProfile.handle}</p>
                  </div>
                </div>
                <a
                  href={soundcloudProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-full transition-colors flex items-center gap-2"
                >
                  Open SoundCloud <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* SoundCloud Likes embed */}
              <div className="flex-1 rounded-xl overflow-hidden glass-sm mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudProfile.handle}/likes&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                />
              </div>

              {/* SoundCloud Tracks */}
              <div className="h-32 rounded-xl overflow-hidden glass-sm">
                <iframe
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudProfile.handle}/tracks&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom player bar */}
        <div className="h-20 border-t border-white/10 glass-sm px-4 flex items-center justify-between">
          {/* Now playing */}
          <div className="flex items-center gap-3 w-64">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Select a track</p>
              <p className="text-white/50 text-xs truncate">From {activeTab === 'spotify' ? 'Spotify' : 'SoundCloud'}</p>
            </div>
            <button className="text-white/50 hover:text-pink-400 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Playback controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button className="text-white/50 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-black" />
                ) : (
                  <Play className="w-5 h-5 text-black ml-0.5" />
                )}
              </button>
              <button className="text-white/50 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>0:00</span>
              <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-white rounded-full" />
              </div>
              <span>3:45</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-64 justify-end">
            <Volume2 className="w-5 h-5 text-white/50" />
            <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

export default MacMusicWindow;
