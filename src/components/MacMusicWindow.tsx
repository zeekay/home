import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { cn } from '@/lib/utils';
import { Music, Radio, Heart, Play, Pause, SkipForward, SkipBack, Volume2, ExternalLink, Disc3, ListMusic, Headphones } from 'lucide-react';
import { socialProfiles } from '@/data/socials';

interface MacMusicWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

type TabType = 'spotify' | 'soundcloud';

// Sample playlists/tracks to display
const spotifyContent = {
  playlists: [
    { name: 'Liked Songs', description: 'Your favorite tracks', cover: '❤️', url: 'https://open.spotify.com/collection/tracks' },
    { name: 'Discover Weekly', description: 'Your weekly mixtape', cover: '🎧', url: 'https://open.spotify.com/playlist/37i9dQZEVXcQ9COmYvdajy' },
    { name: 'Release Radar', description: 'New releases for you', cover: '📡', url: 'https://open.spotify.com/playlist/37i9dQZEVXdLp0oGZ0aQ' },
    { name: 'Daily Mix 1', description: 'Made for you', cover: '🎵', url: 'https://open.spotify.com/playlist/37i9dQZF1E35MNn' },
  ],
  recentlyPlayed: [
    { name: 'Chill Vibes', artist: 'Various Artists', cover: '🌊', duration: '2:34' },
    { name: 'Deep Focus', artist: 'Concentration', cover: '🧠', duration: '3:45' },
    { name: 'Coding Mode', artist: 'Lo-Fi Beats', cover: '💻', duration: '4:12' },
    { name: 'Night Drive', artist: 'Synthwave', cover: '🌃', duration: '3:21' },
  ]
};

const MacMusicWindow: React.FC<MacMusicWindowProps> = ({ onClose, onFocus }) => {
  const [activeTab, setActiveTab] = useState<TabType>('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(spotifyContent.recentlyPlayed[0]);

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
      onFocus={onFocus}
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
        <div className="flex-1 overflow-auto">
          {activeTab === 'spotify' && (
            <div className="flex flex-col h-full p-4">
              {/* Spotify header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#1DB954] flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
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

              {/* Playlists Section */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-[#1DB954]" />
                  Your Playlists
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {spotifyContent.playlists.map((playlist, i) => (
                    <a
                      key={i}
                      href={playlist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-[#1DB954]/30 to-[#191414] flex items-center justify-center text-4xl mb-2 group-hover:scale-105 transition-transform">
                        {playlist.cover}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-white/50 text-xs truncate">{playlist.description}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Recently Played Section */}
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#1DB954]" />
                  Recently Played
                </h4>
                <div className="space-y-2">
                  {spotifyContent.recentlyPlayed.map((track, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTrack(track)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
                        selectedTrack.name === track.name
                          ? "bg-[#1DB954]/20 border border-[#1DB954]/30"
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-2xl">
                        {track.cover}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{track.name}</p>
                        <p className="text-white/50 text-xs truncate">{track.artist}</p>
                      </div>
                      <span className="text-white/40 text-xs">{track.duration}</span>
                      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <Play className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'soundcloud' && (
            <div className="flex flex-col h-full p-4">
              {/* SoundCloud header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
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

              {/* SoundCloud Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-4">
                  <Radio className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">SoundCloud Profile</h3>
                <p className="text-white/60 text-sm mb-6 max-w-md">
                  Listen to tracks, playlists, and liked songs on SoundCloud
                </p>
                <a
                  href={soundcloudProfile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors flex items-center gap-2"
                >
                  <Headphones className="w-5 h-5" />
                  Visit Profile
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom player bar */}
        <div className="h-20 border-t border-white/10 glass-sm px-4 flex items-center justify-between">
          {/* Now playing */}
          <div className="flex items-center gap-3 w-64">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              {selectedTrack.cover}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{selectedTrack.name}</p>
              <p className="text-white/50 text-xs truncate">{selectedTrack.artist}</p>
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
              <span>{selectedTrack.duration}</span>
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
