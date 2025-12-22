import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { cn } from '@/lib/utils';
import { Music, Radio, Heart, ListMusic, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface MacMusicWindowProps {
  onClose: () => void;
}

type TabType = 'spotify' | 'soundcloud';

// Spotify playlist embeds - replace with your actual playlist IDs
const spotifyPlaylists = [
  { id: '37i9dQZF1DXcBWIGoYBM5M', name: "Today's Top Hits" },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano' },
  { id: '37i9dQZF1DX5Ejj0EkURtP', name: 'All Out 2010s' },
  { id: '37i9dQZF1DWXRqgorJj26U', name: 'Rock Classics' },
];

// SoundCloud username - replace with your actual username
const soundcloudUsername = 'zeekay';

const MacMusicWindow: React.FC<MacMusicWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spotify');
  const [selectedPlaylist, setSelectedPlaylist] = useState(spotifyPlaylists[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'spotify', label: 'Spotify', icon: <Music className="w-4 h-4" /> },
    { id: 'soundcloud', label: 'SoundCloud', icon: <Radio className="w-4 h-4" /> },
  ];

  return (
    <MacWindow
      title="Music"
      onClose={onClose}
      defaultWidth={900}
      defaultHeight={600}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 180, y: 100 }}
    >
      <div className="flex flex-col h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
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
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
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
            <div className="flex h-full">
              {/* Playlist sidebar */}
              <div className="w-64 border-r border-white/10 bg-black/20 p-4 overflow-y-auto">
                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ListMusic className="w-4 h-4" />
                  Playlists
                </h3>
                <div className="space-y-1">
                  {spotifyPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylist(playlist)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all',
                        selectedPlaylist.id === playlist.id
                          ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-400 border border-green-500/30'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-md flex items-center justify-center',
                          selectedPlaylist.id === playlist.id
                            ? 'bg-green-500'
                            : 'bg-white/10'
                        )}>
                          <Music className="w-4 h-4 text-white" />
                        </div>
                        <span className="truncate">{playlist.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Your Library
                  </h3>
                  <div className="text-white/50 text-xs">
                    Connect your Spotify to see your saved music
                  </div>
                </div>
              </div>

              {/* Spotify embed */}
              <div className="flex-1 p-4">
                <div className="h-full rounded-xl overflow-hidden bg-black/30 border border-white/10">
                  <iframe
                    src={`https://open.spotify.com/embed/playlist/${selectedPlaylist.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-xl"
                  />
                </div>
              </div>
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
                    <h3 className="text-white font-semibold">SoundCloud Likes</h3>
                    <p className="text-white/50 text-sm">@{soundcloudUsername}</p>
                  </div>
                </div>
                <a
                  href={`https://soundcloud.com/${soundcloudUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Open in SoundCloud
                </a>
              </div>

              {/* SoundCloud embed - Likes */}
              <div className="flex-1 rounded-xl overflow-hidden bg-black/30 border border-white/10">
                <iframe
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudUsername}/likes&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                />
              </div>

              {/* Alternative: Track embed for a specific popular track */}
              <div className="mt-4">
                <h4 className="text-white/70 text-sm font-medium mb-2">Recent Uploads</h4>
                <div className="h-32 rounded-xl overflow-hidden bg-black/30 border border-white/10">
                  <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudUsername}/tracks&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom player bar */}
        <div className="h-20 border-t border-white/10 bg-black/40 backdrop-blur-sm px-4 flex items-center justify-between">
          {/* Now playing */}
          <div className="flex items-center gap-3 w-64">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Select a track</p>
              <p className="text-white/50 text-xs truncate">From your playlist</p>
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
