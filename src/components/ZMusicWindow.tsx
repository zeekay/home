import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { Music, Radio, Heart, ExternalLink, ListMusic, RefreshCw, Loader2 } from 'lucide-react';
import { socialProfiles } from '@/data/socials';
import type { SpotifyStaticData, SpotifyPlaylistMinimal } from '@/types/spotify';

interface ZMusicWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type TabType = 'spotify' | 'soundcloud';
const SPOTIFY_EMBED_THEME = 'theme=0'; // 0 = dark theme

// Featured playlists to embed - you can add more playlist/album IDs here
const spotifyEmbeds = [
  { 
    type: 'playlist',
    id: '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
    name: "Today's Top Hits",
    description: 'The biggest songs right now'
  },
  { 
    type: 'playlist',
    id: '37i9dQZF1DWZeKCadgRdKQ', // Deep Focus
    name: 'Deep Focus',
    description: 'Keep calm and focus'
  },
  { 
    type: 'playlist',
    id: '37i9dQZF1DX4sWSpwq3LiO', // Peaceful Piano
    name: 'Peaceful Piano',
    description: 'Relax and indulge with beautiful piano pieces'
  },
];

const ZMusicWindow: React.FC<ZMusicWindowProps> = ({ onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spotify');
  const [selectedSpotifyEmbed, setSelectedSpotifyEmbed] = useState(spotifyEmbeds[0]);
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
        if (data?.playlists) {
          setUserPlaylists(data.playlists);
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
      setSelectedSpotifyEmbed({
        type: parsed.type,
        id: parsed.id,
        name: 'Custom Playlist',
        description: 'Your custom Spotify content'
      });
      setSpotifyLoaded(false);
    }
  };

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
        <div className="flex-1 overflow-auto">
          {activeTab === 'spotify' && (
            <div className="flex flex-col h-full">
              {/* Spotify header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1DB954] flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Spotify</h3>
                    <p className="text-white/50 text-sm">@{spotifyProfile.handle}</p>
                  </div>
                </div>
                <a
                  href={spotifyProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  Open Spotify <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar with playlists */}
                <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
                  <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Featured Playlists</h4>
                  <div className="space-y-2">
                    {spotifyEmbeds.map((embed, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedSpotifyEmbed(embed);
                          setSpotifyLoaded(false);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all",
                          selectedSpotifyEmbed.id === embed.id
                            ? "bg-[#1DB954]/20 border border-[#1DB954]/30"
                            : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <p className="text-white text-sm font-medium truncate">{embed.name}</p>
                        <p className="text-white/50 text-xs truncate">{embed.description}</p>
                      </button>
                    ))}
                  </div>

                  {/* User's Playlists from Spotify API */}
                  {userPlaylists.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">My Playlists</h4>
                      <div className="space-y-2">
                        {userPlaylists.slice(0, 20).map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => {
                              setSelectedSpotifyEmbed({
                                type: 'playlist',
                                id: playlist.id,
                                name: playlist.name,
                                description: playlist.description || `${playlist.trackCount} tracks`
                              });
                              setSpotifyLoaded(false);
                            }}
                            className={cn(
                              "w-full text-left p-2 rounded-xl transition-all flex items-center gap-3",
                              selectedSpotifyEmbed.id === playlist.id
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
                    <div className="mt-6 flex items-center justify-center py-4">
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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">{selectedSpotifyEmbed.name}</h3>
                      <p className="text-white/50 text-sm">{selectedSpotifyEmbed.description}</p>
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
                      src={`https://open.spotify.com/embed/${selectedSpotifyEmbed.type}/${selectedSpotifyEmbed.id}?utm_source=generator&${SPOTIFY_EMBED_THEME}`}
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'soundcloud' && (
            <div className="flex flex-col h-full">
              {/* SoundCloud header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                      <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.02c-.051 0-.094.047-.101.1l-.183 1.138.183 1.095c.007.057.05.098.101.098.05 0 .09-.04.099-.098l.208-1.095-.208-1.138c-.009-.06-.052-.1-.099-.1zm1.802-.7c-.058 0-.109.051-.115.109l-.218 1.859.218 1.787c.007.06.057.108.115.108.057 0 .108-.048.115-.108l.25-1.787-.25-1.859c-.007-.058-.058-.109-.115-.109zm.9-.236c-.058 0-.11.051-.116.109l-.211 2.095.211 2.024c.007.061.058.109.116.109.057 0 .108-.048.115-.109l.239-2.024-.239-2.095c-.007-.058-.058-.109-.115-.109z"/>
                      <path d="M11.34 5.6c-.091 0-.165.081-.17.179l-.144 6.2.144 3.4c.005.099.079.179.17.179.091 0 .165-.08.171-.179l.163-3.4-.163-6.2c-.006-.098-.08-.179-.171-.179zm1.028.013c-.098 0-.176.086-.182.193l-.126 6.187.126 3.374c.006.105.084.191.182.191.098 0 .176-.086.182-.191l.143-3.374-.143-6.187c-.006-.107-.084-.193-.182-.193z"/>
                      <path d="M22.5 10.5c-.38 0-.75.07-1.09.19-.23-2.76-2.55-4.93-5.41-4.93-.68 0-1.33.13-1.93.36-.23.09-.3.18-.3.36v9.44c.01.19.16.34.35.36h8.38c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">SoundCloud</h3>
                    <p className="text-white/50 text-sm">@{soundcloudProfile.handle}</p>
                  </div>
                </div>
                <a
                  href={soundcloudProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  Open SoundCloud <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* SoundCloud embed - user's profile */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Z's SoundCloud</h3>
                    <p className="text-white/50 text-sm">Tracks, playlists, and likes</p>
                  </div>
                  <button
                    onClick={() => setSoundcloudLoaded(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black/30">
                  {!soundcloudLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  )}
                  {/* SoundCloud User Profile Embed */}
                  <iframe
                    width="100%"
                    height="100%"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudProfile.handle}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=true&show_teaser=true&visual=true`}
                    onLoad={() => setSoundcloudLoaded(true)}
                    className="absolute inset-0"
                    style={{ minHeight: '400px' }}
                  />
                </div>

                {/* Additional SoundCloud links */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <a
                    href={`${soundcloudProfile.url}/tracks`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <Music className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Tracks</p>
                    <p className="text-white/50 text-xs">View all tracks</p>
                  </a>
                  <a
                    href={`${soundcloudProfile.url}/sets`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <ListMusic className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Playlists</p>
                    <p className="text-white/50 text-xs">View playlists</p>
                  </a>
                  <a
                    href={`${soundcloudProfile.url}/likes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center"
                  >
                    <Heart className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">Likes</p>
                    <p className="text-white/50 text-xs">Liked tracks</p>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZMusicWindow;
