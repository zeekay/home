import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { Music, Radio, Heart, ListMusic, RefreshCw, Loader2 } from 'lucide-react';
import { socialProfiles } from '@/data/socials';
import type { SpotifyStaticData, SpotifyPlaylistMinimal } from '@/types/spotify';

interface ZMusicWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type TabType = 'spotify' | 'soundcloud';
const SPOTIFY_EMBED_THEME = 'theme=0'; // 0 = dark theme

const ZMusicWindow: React.FC<ZMusicWindowProps> = ({ onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spotify');
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ type: string; id: string; name: string; description: string } | null>(null);
  const [soundcloudLoaded, setSoundcloudLoaded] = useState(false);
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylistMinimal[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  const spotifyProfile = socialProfiles.spotify;
  const soundcloudProfile = socialProfiles.soundcloud;

  // Load user's playlists from static JSON
  useEffect(() => {
    fetch('/data/spotify-minimal.json')
      .then(res => res.ok ? res.json() : null)
      .then((data: SpotifyStaticData | null) => {
        if (data?.playlists && data.playlists.length > 0) {
          setUserPlaylists(data.playlists);
          // Auto-select first playlist
          const first = data.playlists[0];
          setSelectedPlaylist({
            type: 'playlist',
            id: first.id,
            name: first.name,
            description: first.description || `${first.trackCount} tracks`
          });
        }
      })
      .catch(err => console.error('Failed to load Spotify data:', err))
      .finally(() => setLoadingPlaylists(false));
  }, []);

  // Parse Spotify URL to get embed ID
  const parseSpotifyUrl = (url: string): { type: string; id: string } | null => {
    const patterns = [
      /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
      /spotify\.com\/album\/([a-zA-Z0-9]+)/,
      /spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /spotify\.com\/artist\/([a-zA-Z0-9]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const type = url.includes('/playlist/') ? 'playlist' :
                     url.includes('/album/') ? 'album' :
                     url.includes('/track/') ? 'track' : 'artist';
        return { type, id: match[1] };
      }
    }
    return null;
  };

  const handleCustomPlaylist = () => {
    const parsed = parseSpotifyUrl(customPlaylistUrl);
    if (parsed) {
      setSelectedPlaylist({
        type: parsed.type,
        id: parsed.id,
        name: 'Custom Playlist',
        description: 'Your custom Spotify content'
      });
      setSpotifyLoaded(false);
    }
  };

  // Get pinned playlists (first 4) and remaining playlists
  const pinnedPlaylists = userPlaylists.slice(0, 4);
  const otherPlaylists = userPlaylists.slice(4);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'spotify', label: 'Spotify', icon: <Music className="w-4 h-4" /> },
    { id: 'soundcloud', label: 'SoundCloud', icon: <Radio className="w-4 h-4" /> },
  ];

  return (
    <ZWindow
      title="Music"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={950}
      defaultHeight={700}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 180, y: 100 }}
    >
      <div className="flex flex-col h-full bg-transparent">
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
              activeTab === 'spotify' ? "bg-[#1DB954]" : "bg-[#FF5500]"
            )}>
              {activeTab === 'spotify' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              ) : (
                <Radio className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Music</h2>
              <a 
                href={activeTab === 'spotify' ? spotifyProfile.url : soundcloudProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 text-xs hover:text-white/70 transition-colors"
              >
                @{activeTab === 'spotify' ? spotifyProfile.handle : soundcloudProfile.handle}
              </a>
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
        <div className="flex-1 overflow-auto">
          {activeTab === 'spotify' && (
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar with playlists */}
              <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
                {/* Pinned Playlists (first 4) */}
                {pinnedPlaylists.length > 0 && (
                  <>
                    <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Pinned</h4>
                    <div className="space-y-2">
                      {pinnedPlaylists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => {
                            setSelectedPlaylist({
                              type: 'playlist',
                              id: playlist.id,
                              name: playlist.name,
                              description: playlist.description || `${playlist.trackCount} tracks`
                            });
                            setSpotifyLoaded(false);
                          }}
                          className={cn(
                            "w-full text-left p-2 rounded-xl transition-all flex items-center gap-3",
                            selectedPlaylist?.id === playlist.id
                              ? "bg-[#1DB954]/20 border border-[#1DB954]/30"
                              : "bg-white/5 hover:bg-white/10"
                          )}
                        >
                          {playlist.image ? (
                            <img 
                              src={playlist.image} 
                              alt={playlist.name}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                              <ListMusic className="w-5 h-5 text-white/50" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                            <p className="text-white/50 text-xs truncate">{playlist.trackCount} tracks</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Other Playlists */}
                {otherPlaylists.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Playlists</h4>
                    <div className="space-y-2">
                      {otherPlaylists.slice(0, 20).map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => {
                            setSelectedPlaylist({
                              type: 'playlist',
                              id: playlist.id,
                              name: playlist.name,
                              description: playlist.description || `${playlist.trackCount} tracks`
                            });
                            setSpotifyLoaded(false);
                          }}
                          className={cn(
                            "w-full text-left p-2 rounded-xl transition-all flex items-center gap-3",
                            selectedPlaylist?.id === playlist.id
                              ? "bg-[#1DB954]/20 border border-[#1DB954]/30"
                              : "bg-white/5 hover:bg-white/10"
                          )}
                        >
                          {playlist.image ? (
                            <img 
                              src={playlist.image} 
                              alt={playlist.name}
                              className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                              <ListMusic className="w-5 h-5 text-white/50" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                            <p className="text-white/50 text-xs truncate">{playlist.trackCount} tracks</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {loadingPlaylists && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-[#1DB954] animate-spin" />
                  </div>
                )}

                  {/* Custom URL input */}
                  <div className="mt-6">
                    <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Custom Playlist</h4>
                    <input
                      type="text"
                      value={customPlaylistUrl}
                      onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                      placeholder="Paste Spotify URL..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#1DB954]/50"
                    />
                    <button
                      onClick={handleCustomPlaylist}
                      disabled={!customPlaylistUrl}
                      className="w-full mt-2 px-3 py-2 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 disabled:opacity-50 disabled:cursor-not-allowed text-[#1DB954] text-sm font-medium rounded-lg transition-colors"
                    >
                      Load Playlist
                    </button>
                  </div>
                </div>

                {/* Main embed area */}
                <div className="flex-1 p-4 flex flex-col">
                  {selectedPlaylist ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold">{selectedPlaylist.name}</h3>
                          <p className="text-white/50 text-sm">{selectedPlaylist.description}</p>
                        </div>
                        <button
                          onClick={() => setSpotifyLoaded(false)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 relative rounded-xl overflow-hidden bg-black/30">
                        {!spotifyLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
                          </div>
                        )}
                        <iframe
                          src={`https://open.spotify.com/embed/${selectedPlaylist.type}/${selectedPlaylist.id}?utm_source=generator&${SPOTIFY_EMBED_THEME}`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          onLoad={() => setSpotifyLoaded(true)}
                          className="absolute inset-0"
                          style={{ borderRadius: '12px', minHeight: '380px' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/50">
                      {loadingPlaylists ? (
                        <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
                      ) : (
                        <p>Select a playlist to play</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
          )}

          {activeTab === 'soundcloud' && (
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
                {/* SoundCloud quick links */}
                <div className="flex items-center gap-3 mb-4">
                  <a
                    href={`${soundcloudProfile.url}/reposts`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <RefreshCw className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">Reposts</p>
                  </a>
                  <a
                    href={`${soundcloudProfile.url}/sets`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <ListMusic className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">Playlists</p>
                  </a>
                  <a
                    href={`${soundcloudProfile.url}/likes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <Heart className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">Likes</p>
                  </a>
                  <a
                    href={`${soundcloudProfile.url}/tracks`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <Music className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">Tracks</p>
                  </a>
                </div>
                
                {/* SoundCloud embed */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black/30 min-h-0">
                  {!soundcloudLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  )}
                  <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudProfile.handle}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=true&show_teaser=true&visual=true`}
                    onLoad={() => setSoundcloudLoaded(true)}
                    className="absolute inset-0"
                  />
                </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZMusicWindow;
