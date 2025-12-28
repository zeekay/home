import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Music, Heart, ListMusic, RefreshCw, Loader2, Play, Pause,
  SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2,
  VolumeX, Volume1, ChevronUp, Plus, Trash2,
  Edit3, Search, Clock, Disc, Users, Mic2, Radio,
  MoreHorizontal, GripVertical, X, ExternalLink, ThumbsDown,
  Minimize2, ListOrdered, Star, Airplay, Library
} from 'lucide-react';
import { socialProfiles } from '@/data/socials';
import type { SpotifyStaticData, SpotifyPlaylistMinimal } from '@/types/spotify';

// =============================================================================
// TYPES
// =============================================================================

interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number;
  artwork?: string;
  genre?: string;
  year?: number;
  loved: boolean;
  disliked: boolean;
  playCount: number;
  lastPlayed?: number;
  dateAdded: number;
  lyrics?: string;
  previewUrl?: string;
  externalUrl?: string;
}

interface Album {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  artwork?: string;
  year?: number;
  genre?: string;
  trackIds: string[];
  dateAdded: number;
}

interface Artist {
  id: string;
  name: string;
  image?: string;
  genres: string[];
  albumIds: string[];
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  trackIds: string[];
  isSmartPlaylist: boolean;
  smartRules?: SmartPlaylistRule[];
  collaborative: boolean;
  dateCreated: number;
  dateModified: number;
}

interface SmartPlaylistRule {
  field: 'artist' | 'album' | 'genre' | 'year' | 'loved' | 'playCount' | 'dateAdded';
  operator: 'is' | 'isNot' | 'contains' | 'greaterThan' | 'lessThan';
  value: string | number | boolean;
}

type RepeatMode = 'off' | 'all' | 'one';
type ViewType = 'library' | 'nowPlaying' | 'queue' | 'spotify' | 'soundcloud';
type LibrarySection = 'recentlyAdded' | 'artists' | 'albums' | 'songs' | 'genres' | 'playlists';

interface MusicState {
  tracks: Record<string, Track>;
  albums: Record<string, Album>;
  artists: Record<string, Artist>;
  playlists: Record<string, Playlist>;
  queue: string[];
  queueIndex: number;
  history: string[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  recentlyPlayed: string[];
}

interface ZMusicWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

// =============================================================================
// STORAGE
// =============================================================================

const STORAGE_KEY = 'zos_music_state';

const defaultState: MusicState = {
  tracks: {},
  albums: {},
  artists: {},
  playlists: {},
  queue: [],
  queueIndex: -1,
  history: [],
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  recentlyPlayed: [],
};

function loadMusicState(): MusicState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load music state:', e);
  }
  return defaultState;
}

function saveMusicState(state: MusicState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save music state:', e);
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function generateDemoTracks(spotifyPlaylists: SpotifyPlaylistMinimal[]): Track[] {
  const genres = ['Pop', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Hip-Hop', 'R&B', 'Indie'];
  const demoTracks: Track[] = [];

  spotifyPlaylists.slice(0, 8).forEach((playlist, playlistIdx) => {
    const trackCount = Math.min(playlist.trackCount, 5);
    for (let i = 0; i < trackCount; i++) {
      demoTracks.push({
        id: `demo-${playlistIdx}-${i}`,
        title: `Track ${i + 1} from ${playlist.name}`,
        artist: playlist.name.split(' ')[0] || 'Various Artists',
        album: playlist.name,
        albumId: `album-${playlistIdx}`,
        duration: 180 + Math.floor(Math.random() * 120),
        artwork: playlist.image || undefined,
        genre: genres[playlistIdx % genres.length],
        year: 2020 + (playlistIdx % 5),
        loved: Math.random() > 0.7,
        disliked: false,
        playCount: Math.floor(Math.random() * 50),
        dateAdded: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
        externalUrl: playlist.url,
      });
    }
  });

  return demoTracks;
}

// =============================================================================
// COMPONENTS
// =============================================================================

const ProgressBar: React.FC<{
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}> = ({ currentTime, duration, onSeek }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);

  const progress = duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    setDragTime(time);
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setDragTime(percent * duration);
  }, [isDragging, duration]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onSeek(dragTime);
      setIsDragging(false);
    }
  }, [isDragging, dragTime, onSeek]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-white/50 w-10 text-right">
        {formatDuration(isDragging ? dragTime : currentTime)}
      </span>
      <div
        ref={progressRef}
        className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute inset-y-0 left-0 bg-white/80 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      <span className="text-xs text-white/50 w-10">
        {formatDuration(duration)}
      </span>
    </div>
  );
};

const VolumeSlider: React.FC<{
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}> = ({ volume, isMuted, onVolumeChange, onMuteToggle }) => {
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2">
      <button onClick={onMuteToggle} className="p-1 hover:bg-white/10 rounded transition-colors">
        <VolumeIcon className="w-4 h-4 text-white/70" />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
};

const TrackRow: React.FC<{
  track: Track;
  index: number;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: () => void;
  onLove: () => void;
  onAddToQueue: () => void;
  onRemove?: () => void;
  showAlbum?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}> = ({
  track, index, isPlaying, isCurrent, onPlay, onLove, onAddToQueue,
  onRemove, showAlbum = true, draggable, onDragStart, onDragOver, onDrop
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
        isCurrent ? "bg-white/10" : "hover:bg-white/5",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDoubleClick={onPlay}
    >
      {draggable && (
        <GripVertical className="w-4 h-4 text-white/30 opacity-0 group-hover:opacity-100" />
      )}
      <div className="w-6 text-center">
        {isCurrent && isPlaying ? (
          <div className="flex items-center justify-center gap-0.5">
            <div className="w-0.5 h-3 bg-green-500 animate-pulse" />
            <div className="w-0.5 h-4 bg-green-500 animate-pulse delay-75" />
            <div className="w-0.5 h-2 bg-green-500 animate-pulse delay-150" />
          </div>
        ) : (
          <span className="text-xs text-white/50 group-hover:hidden">{index + 1}</span>
        )}
        <button
          onClick={onPlay}
          className={cn("hidden group-hover:block", isCurrent && isPlaying && "group-hover:hidden")}
        >
          <Play className="w-4 h-4 text-white fill-white" />
        </button>
      </div>

      {track.artwork ? (
        <img src={track.artwork} alt={track.album} className="w-10 h-10 rounded object-cover" />
      ) : (
        <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
          <Music className="w-5 h-5 text-white/50" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isCurrent ? "text-green-400" : "text-white")}>
          {track.title}
        </p>
        <p className="text-xs text-white/50 truncate">{track.artist}</p>
      </div>

      {showAlbum && (
        <p className="text-xs text-white/50 truncate w-32 hidden md:block">{track.album}</p>
      )}

      <button
        onClick={onLove}
        className={cn(
          "p-1 rounded transition-colors opacity-0 group-hover:opacity-100",
          track.loved ? "text-red-500" : "text-white/50 hover:text-white"
        )}
      >
        <Heart className={cn("w-4 h-4", track.loved && "fill-current")} />
      </button>

      <span className="text-xs text-white/50 w-12 text-right">{formatDuration(track.duration)}</span>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4 text-white/50" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 bg-gray-800 rounded-lg shadow-xl border border-white/10 py-1 min-w-[160px]">
              <button
                onClick={() => { onAddToQueue(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <ListOrdered className="w-4 h-4" /> Add to Queue
              </button>
              <button
                onClick={() => { onLove(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Heart className="w-4 h-4" /> {track.loved ? 'Remove from Loved' : 'Love'}
              </button>
              {onRemove && (
                <button
                  onClick={() => { onRemove(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
              {track.externalUrl && (
                <a
                  href={track.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => setShowMenu(false)}
                >
                  <ExternalLink className="w-4 h-4" /> Open in Spotify
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const NowPlayingView: React.FC<{
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onLove: () => void;
  onDislike: () => void;
  onMinimize: () => void;
  showLyrics: boolean;
  onToggleLyrics: () => void;
}> = ({
  track, isPlaying, currentTime, volume, isMuted, shuffle, repeat,
  onPlayPause, onPrev, onNext, onSeek, onVolumeChange, onMuteToggle,
  onShuffleToggle, onRepeatToggle, onLove, onDislike, onMinimize,
  showLyrics, onToggleLyrics
}) => {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/50">
        <Music className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No Track Playing</p>
        <p className="text-sm">Select a track from your library to play</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-auto">
      <div className="flex-1 flex items-center justify-center min-h-0 py-4">
        <div className="relative group">
          {track.artwork ? (
            <img src={track.artwork} alt={track.album} className="w-64 h-64 md:w-80 md:h-80 rounded-xl shadow-2xl object-cover" />
          ) : (
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
              <Music className="w-24 h-24 text-white/50" />
            </div>
          )}
          <button
            onClick={onMinimize}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white truncate">{track.title}</h2>
        <p className="text-white/60">{track.artist} - {track.album}</p>
      </div>

      <div className="mb-4">
        <ProgressBar currentTime={currentTime} duration={track.duration} onSeek={onSeek} />
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={onShuffleToggle}
          className={cn("p-2 rounded-full transition-colors", shuffle ? "text-green-400" : "text-white/50 hover:text-white")}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button onClick={onPrev} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <SkipBack className="w-6 h-6 fill-current" />
        </button>

        <button onClick={onPlayPause} className="p-4 bg-white rounded-full text-black hover:scale-105 transition-transform">
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>

        <button onClick={onNext} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <SkipForward className="w-6 h-6 fill-current" />
        </button>

        <button
          onClick={onRepeatToggle}
          className={cn("p-2 rounded-full transition-colors", repeat !== 'off' ? "text-green-400" : "text-white/50 hover:text-white")}
        >
          <RepeatIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onLove}
            className={cn("p-2 rounded-full transition-colors", track.loved ? "text-red-500" : "text-white/50 hover:text-white")}
          >
            <Heart className={cn("w-5 h-5", track.loved && "fill-current")} />
          </button>
          <button
            onClick={onDislike}
            className={cn("p-2 rounded-full transition-colors", track.disliked ? "text-white" : "text-white/50 hover:text-white")}
          >
            <ThumbsDown className={cn("w-5 h-5", track.disliked && "fill-current")} />
          </button>
        </div>

        <VolumeSlider volume={volume} isMuted={isMuted} onVolumeChange={onVolumeChange} onMuteToggle={onMuteToggle} />

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLyrics}
            className={cn("p-2 rounded-full transition-colors", showLyrics ? "text-green-400" : "text-white/50 hover:text-white")}
          >
            <Mic2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-white/50 hover:text-white rounded-full transition-colors">
            <Airplay className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showLyrics && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl max-h-48 overflow-auto">
          <h3 className="text-sm font-semibold text-white/70 mb-2">Lyrics</h3>
          {track.lyrics ? (
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">{track.lyrics}</pre>
          ) : (
            <p className="text-sm text-white/50 text-center py-4">Lyrics not available for this track</p>
          )}
        </div>
      )}
    </div>
  );
};

const QueueView: React.FC<{
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onClear: () => void;
  onLove: (trackId: string) => void;
}> = ({ queue, currentIndex, isPlaying, onPlay, onRemove, onReorder, onClear, onLove }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const upNext = queue.slice(currentIndex + 1);
  const currentTrack = queue[currentIndex];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex) onReorder(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Queue</h2>
        <button onClick={onClear} className="text-sm text-white/50 hover:text-white transition-colors">Clear</button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {currentTrack && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Now Playing</h3>
            <TrackRow
              track={currentTrack}
              index={0}
              isPlaying={isPlaying}
              isCurrent={true}
              onPlay={() => {}}
              onLove={() => onLove(currentTrack.id)}
              onAddToQueue={() => {}}
            />
          </div>
        )}

        {upNext.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Up Next ({upNext.length})</h3>
            <div className="space-y-1">
              {upNext.map((track, idx) => (
                <TrackRow
                  key={`${track.id}-${currentIndex + 1 + idx}`}
                  track={track}
                  index={idx}
                  isPlaying={false}
                  isCurrent={false}
                  onPlay={() => onPlay(currentIndex + 1 + idx)}
                  onLove={() => onLove(track.id)}
                  onAddToQueue={() => {}}
                  onRemove={() => onRemove(currentIndex + 1 + idx)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, currentIndex + 1 + idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentIndex + 1 + idx)}
                />
              ))}
            </div>
          </div>
        )}

        {queue.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-white/50">
            <ListMusic className="w-12 h-12 mb-3 opacity-50" />
            <p>Your queue is empty</p>
            <p className="text-sm">Add songs to start playing</p>
          </div>
        )}
      </div>
    </div>
  );
};

const LibraryView: React.FC<{
  section: LibrarySection;
  onSectionChange: (section: LibrarySection) => void;
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (trackId: string) => void;
  onPlayAlbum: (albumId: string) => void;
  onPlayPlaylist: (playlistId: string) => void;
  onLove: (trackId: string) => void;
  onAddToQueue: (trackId: string) => void;
  onCreatePlaylist: () => void;
  onEditPlaylist: (playlistId: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({
  section, onSectionChange, tracks, albums, artists, playlists,
  currentTrackId, isPlaying, onPlayTrack, onPlayPlaylist,
  onLove, onAddToQueue, onCreatePlaylist, onEditPlaylist, onDeletePlaylist,
  searchQuery, onSearchChange
}) => {
  const sections: { id: LibrarySection; label: string; icon: React.ReactNode }[] = [
    { id: 'recentlyAdded', label: 'Recently Added', icon: <Clock className="w-4 h-4" /> },
    { id: 'artists', label: 'Artists', icon: <Users className="w-4 h-4" /> },
    { id: 'albums', label: 'Albums', icon: <Disc className="w-4 h-4" /> },
    { id: 'songs', label: 'Songs', icon: <Music className="w-4 h-4" /> },
    { id: 'genres', label: 'Genres', icon: <Radio className="w-4 h-4" /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic className="w-4 h-4" /> },
  ];

  const filteredTracks = useMemo(() => {
    let result = [...tracks];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.album.toLowerCase().includes(query)
      );
    }
    if (section === 'recentlyAdded') {
      result.sort((a, b) => b.dateAdded - a.dateAdded);
      result = result.slice(0, 50);
    } else if (section === 'songs') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [tracks, section, searchQuery]);

  const genres = useMemo(() => {
    const genreMap: Record<string, Track[]> = {};
    tracks.forEach(track => {
      const genre = track.genre || 'Unknown';
      if (!genreMap[genre]) genreMap[genre] = [];
      genreMap[genre].push(track);
    });
    return Object.entries(genreMap).sort((a, b) => b[1].length - a[1].length);
  }, [tracks]);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-48 border-r border-white/10 p-3 overflow-y-auto">
        <div className="space-y-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                section === s.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {(section === 'songs' || section === 'recentlyAdded') && (
            <div className="space-y-1">
              {filteredTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  isPlaying={isPlaying}
                  isCurrent={track.id === currentTrackId}
                  onPlay={() => onPlayTrack(track.id)}
                  onLove={() => onLove(track.id)}
                  onAddToQueue={() => onAddToQueue(track.id)}
                />
              ))}
              {filteredTracks.length === 0 && (
                <div className="text-center py-12 text-white/50">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tracks found</p>
                </div>
              )}
            </div>
          )}

          {section === 'artists' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artists.map(artist => (
                <div key={artist.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-center">
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-10 h-10 text-white/50" />
                    </div>
                  )}
                  <p className="text-white font-medium truncate">{artist.name}</p>
                  <p className="text-xs text-white/50">{artist.albumIds.length} albums</p>
                </div>
              ))}
              {artists.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/50">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No artists in library</p>
                </div>
              )}
            </div>
          )}

          {section === 'albums' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <div key={album.id} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group relative">
                  {album.artwork ? (
                    <img src={album.artwork} alt={album.name} className="w-full aspect-square rounded-lg mb-3 object-cover" />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-white/10 mb-3 flex items-center justify-center">
                      <Disc className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                  <p className="text-white font-medium truncate">{album.name}</p>
                  <p className="text-xs text-white/50 truncate">{album.artist}</p>
                </div>
              ))}
              {albums.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/50">
                  <Disc className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No albums in library</p>
                </div>
              )}
            </div>
          )}

          {section === 'genres' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {genres.map(([genre, genreTracks]) => (
                <div key={genre} className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 transition-colors cursor-pointer">
                  <Radio className="w-8 h-8 text-white/70 mb-2" />
                  <p className="text-white font-medium">{genre}</p>
                  <p className="text-xs text-white/50">{genreTracks.length} songs</p>
                </div>
              ))}
              {genres.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/50">
                  <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No genres found</p>
                </div>
              )}
            </div>
          )}

          {section === 'playlists' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Playlists</h3>
                <button onClick={onCreatePlaylist} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                  <Plus className="w-4 h-4" /> New Playlist
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group relative">
                    {playlist.artwork ? (
                      <img src={playlist.artwork} alt={playlist.name} className="w-full aspect-square rounded-lg mb-3 object-cover" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 mb-3 flex items-center justify-center">
                        <ListMusic className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {playlist.isSmartPlaylist && <Star className="w-3 h-3 text-yellow-500" />}
                      <p className="text-white font-medium truncate flex-1">{playlist.name}</p>
                    </div>
                    <p className="text-xs text-white/50 truncate">
                      {playlist.trackIds.length} songs{playlist.collaborative && ' - Collaborative'}
                    </p>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onEditPlaylist(playlist.id); }} className="p-1.5 bg-black/50 rounded-full hover:bg-black/70">
                        <Edit3 className="w-3 h-3 text-white" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDeletePlaylist(playlist.id); }} className="p-1.5 bg-black/50 rounded-full hover:bg-black/70">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>

                    <button onClick={() => onPlayPlaylist(playlist.id)} className="absolute bottom-12 right-3 p-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Play className="w-4 h-4 text-black fill-current" />
                    </button>
                  </div>
                ))}

                {playlists.length === 0 && (
                  <div className="col-span-full text-center py-12 text-white/50">
                    <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No playlists yet</p>
                    <button onClick={onCreatePlaylist} className="mt-2 text-sm text-green-400 hover:underline">Create your first playlist</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MiniPlayer: React.FC<{
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExpand: () => void;
}> = ({ track, isPlaying, currentTime, onPlayPause, onPrev, onNext, onExpand }) => {
  const progress = track.duration > 0 ? (currentTime / track.duration) * 100 : 0;

  return (
    <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="h-0.5 bg-white/10">
        <div className="h-full bg-white/80 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-3 px-4 py-2">
        <div className="cursor-pointer" onClick={onExpand}>
          {track.artwork ? (
            <img src={track.artwork} alt={track.album} className="w-12 h-12 rounded-md object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-white/50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
          <p className="text-sm font-medium text-white truncate">{track.title}</p>
          <p className="text-xs text-white/50 truncate">{track.artist}</p>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="p-2 text-white/70 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={onPlayPause} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button onClick={onNext} className="p-2 text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <button onClick={onExpand} className="p-2 text-white/50 hover:text-white transition-colors">
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const PlaylistEditor: React.FC<{
  playlist: Playlist | null;
  tracks: Track[];
  onSave: (playlist: Partial<Playlist>) => void;
  onClose: () => void;
}> = ({ playlist, tracks, onSave, onClose }) => {
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState(playlist?.description || '');
  const [isSmartPlaylist, setIsSmartPlaylist] = useState(playlist?.isSmartPlaylist || false);
  const [collaborative, setCollaborative] = useState(playlist?.collaborative || false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>(playlist?.trackIds || []);

  const handleSave = () => {
    onSave({ id: playlist?.id, name, description, isSmartPlaylist, collaborative, trackIds: selectedTracks });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">{playlist ? 'Edit Playlist' : 'New Playlist'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5 text-white/70" /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Playlist" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." rows={2} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none" />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={isSmartPlaylist} onChange={(e) => setIsSmartPlaylist(e.target.checked)} className="rounded border-white/20" />
              Smart Playlist
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={collaborative} onChange={(e) => setCollaborative(e.target.checked)} className="rounded border-white/20" />
              Collaborative
            </label>
          </div>

          {!isSmartPlaylist && (
            <div>
              <label className="block text-sm text-white/70 mb-2">Add Songs ({selectedTracks.length} selected)</label>
              <div className="max-h-48 overflow-auto bg-white/5 rounded-lg border border-white/10">
                {tracks.map(track => (
                  <label key={track.id} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTracks([...selectedTracks, track.id]);
                        else setSelectedTracks(selectedTracks.filter(id => id !== track.id));
                      }}
                      className="rounded border-white/20"
                    />
                    <span className="text-sm text-white truncate">{track.title}</span>
                    <span className="text-xs text-white/50 truncate">{track.artist}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!name} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
            {playlist ? 'Save Changes' : 'Create Playlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SpotifyView: React.FC<{ userPlaylists: SpotifyPlaylistMinimal[]; loadingPlaylists: boolean }> = ({ userPlaylists, loadingPlaylists }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<{ type: string; id: string; name: string; description: string } | null>(null);
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [customPlaylistUrl, setCustomPlaylistUrl] = useState('');
  const SPOTIFY_EMBED_THEME = 'theme=0';

  useEffect(() => {
    if (userPlaylists.length > 0 && !selectedPlaylist) {
      const first = userPlaylists[0];
      setSelectedPlaylist({ type: 'playlist', id: first.id, name: first.name, description: first.description || `${first.trackCount} tracks` });
    }
  }, [userPlaylists, selectedPlaylist]);

  const parseSpotifyUrl = (url: string): { type: string; id: string } | null => {
    const patterns = [/spotify\.com\/playlist\/([a-zA-Z0-9]+)/, /spotify\.com\/album\/([a-zA-Z0-9]+)/, /spotify\.com\/track\/([a-zA-Z0-9]+)/, /spotify\.com\/artist\/([a-zA-Z0-9]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const type = url.includes('/playlist/') ? 'playlist' : url.includes('/album/') ? 'album' : url.includes('/track/') ? 'track' : 'artist';
        return { type, id: match[1] };
      }
    }
    return null;
  };

  const handleCustomPlaylist = () => {
    const parsed = parseSpotifyUrl(customPlaylistUrl);
    if (parsed) {
      setSelectedPlaylist({ type: parsed.type, id: parsed.id, name: 'Custom Playlist', description: 'Your custom Spotify content' });
      setSpotifyLoaded(false);
    }
  };

  const pinnedPlaylists = userPlaylists.slice(0, 4);
  const otherPlaylists = userPlaylists.slice(4);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
        {pinnedPlaylists.length > 0 && (
          <>
            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Pinned</h4>
            <div className="space-y-2">
              {pinnedPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => { setSelectedPlaylist({ type: 'playlist', id: playlist.id, name: playlist.name, description: playlist.description || `${playlist.trackCount} tracks` }); setSpotifyLoaded(false); }}
                  className={cn("w-full text-left p-2 rounded-xl transition-all flex items-center gap-3", selectedPlaylist?.id === playlist.id ? "bg-[#1DB954]/20 border border-[#1DB954]/30" : "bg-white/5 hover:bg-white/10")}
                >
                  {playlist.image ? <img src={playlist.image} alt={playlist.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0"><ListMusic className="w-5 h-5 text-white/50" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                    <p className="text-white/50 text-xs truncate">{playlist.trackCount} tracks</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {otherPlaylists.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Playlists</h4>
            <div className="space-y-2">
              {otherPlaylists.slice(0, 20).map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => { setSelectedPlaylist({ type: 'playlist', id: playlist.id, name: playlist.name, description: playlist.description || `${playlist.trackCount} tracks` }); setSpotifyLoaded(false); }}
                  className={cn("w-full text-left p-2 rounded-xl transition-all flex items-center gap-3", selectedPlaylist?.id === playlist.id ? "bg-[#1DB954]/20 border border-[#1DB954]/30" : "bg-white/5 hover:bg-white/10")}
                >
                  {playlist.image ? <img src={playlist.image} alt={playlist.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0"><ListMusic className="w-5 h-5 text-white/50" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{playlist.name}</p>
                    <p className="text-white/50 text-xs truncate">{playlist.trackCount} tracks</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingPlaylists && <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-[#1DB954] animate-spin" /></div>}

        <div className="mt-6">
          <h4 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Custom Playlist</h4>
          <input type="text" value={customPlaylistUrl} onChange={(e) => setCustomPlaylistUrl(e.target.value)} placeholder="Paste Spotify URL..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#1DB954]/50" />
          <button onClick={handleCustomPlaylist} disabled={!customPlaylistUrl} className="w-full mt-2 px-3 py-2 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 disabled:opacity-50 disabled:cursor-not-allowed text-[#1DB954] text-sm font-medium rounded-lg transition-colors">Load Playlist</button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {selectedPlaylist ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{selectedPlaylist.name}</h3>
                <p className="text-white/50 text-sm">{selectedPlaylist.description}</p>
              </div>
              <button onClick={() => setSpotifyLoaded(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 relative rounded-xl overflow-hidden bg-black/30">
              {!spotifyLoaded && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"><Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" /></div>}
              <iframe src={`https://open.spotify.com/embed/${selectedPlaylist.type}/${selectedPlaylist.id}?utm_source=generator&${SPOTIFY_EMBED_THEME}`} width="100%" height="100%" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" onLoad={() => setSpotifyLoaded(true)} className="absolute inset-0" style={{ borderRadius: '12px', minHeight: '380px' }} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50">
            {loadingPlaylists ? <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" /> : <p>Select a playlist to play</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const SoundCloudView: React.FC = () => {
  const [soundcloudLoaded, setSoundcloudLoaded] = useState(false);
  const soundcloudProfile = socialProfiles.soundcloud;

  return (
    <div className="flex-1 p-4 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <a href={`${soundcloudProfile.url}/reposts`} target="_blank" rel="noopener noreferrer" className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center">
          <RefreshCw className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-white text-sm font-medium">Reposts</p>
        </a>
        <a href={`${soundcloudProfile.url}/sets`} target="_blank" rel="noopener noreferrer" className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center">
          <ListMusic className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-white text-sm font-medium">Playlists</p>
        </a>
        <a href={`${soundcloudProfile.url}/likes`} target="_blank" rel="noopener noreferrer" className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center">
          <Heart className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-white text-sm font-medium">Likes</p>
        </a>
        <a href={`${soundcloudProfile.url}/tracks`} target="_blank" rel="noopener noreferrer" className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center">
          <Music className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-white text-sm font-medium">Tracks</p>
        </a>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-black/30 min-h-0">
        {!soundcloudLoaded && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>}
        <iframe width="100%" height="100%" scrolling="no" frameBorder="no" allow="autoplay" src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${soundcloudProfile.handle}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=true&show_teaser=true&visual=true`} onLoad={() => setSoundcloudLoaded(true)} className="absolute inset-0" />
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ZMusicWindow: React.FC<ZMusicWindowProps> = ({ onClose, onFocus }) => {
  const [state, setState] = useState<MusicState>(loadMusicState);
  const [view, setView] = useState<ViewType>('library');
  const [librarySection, setLibrarySection] = useState<LibrarySection>('recentlyAdded');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLyrics, setShowLyrics] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [showPlaylistEditor, setShowPlaylistEditor] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylistMinimal[]>([]);
  const [loadingSpotify, setLoadingSpotify] = useState(true);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => { saveMusicState(state); }, [state]);

  useEffect(() => {
    fetch('/data/spotify-minimal.json')
      .then(res => res.ok ? res.json() : null)
      .then((data: SpotifyStaticData | null) => {
        if (data?.playlists) {
          setSpotifyPlaylists(data.playlists);
          if (Object.keys(state.tracks).length === 0 && data.playlists.length > 0) {
            const demoTracks = generateDemoTracks(data.playlists);
            const tracksMap: Record<string, Track> = {};
            demoTracks.forEach(t => { tracksMap[t.id] = t; });
            setState(prev => ({ ...prev, tracks: tracksMap }));
          }
        }
      })
      .catch(err => console.error('Failed to load Spotify data:', err))
      .finally(() => setLoadingSpotify(false));
  }, []);

  const tracks = useMemo(() => Object.values(state.tracks), [state.tracks]);
  const albums = useMemo(() => Object.values(state.albums), [state.albums]);
  const artists = useMemo(() => Object.values(state.artists), [state.artists]);
  const playlists = useMemo(() => Object.values(state.playlists), [state.playlists]);
  const currentTrack = state.queue[state.queueIndex] ? state.tracks[state.queue[state.queueIndex]] : null;
  const queueTracks = state.queue.map(id => state.tracks[id]).filter(Boolean);

  useEffect(() => {
    if (state.isPlaying && currentTrack) {
      progressIntervalRef.current = window.setInterval(() => {
        setState(prev => {
          const newTime = prev.currentTime + 1;
          const track = prev.queue[prev.queueIndex] ? prev.tracks[prev.queue[prev.queueIndex]] : null;
          if (track && newTime >= track.duration) {
            if (prev.repeat === 'one') return { ...prev, currentTime: 0 };
            else if (prev.queueIndex < prev.queue.length - 1) return { ...prev, currentTime: 0, queueIndex: prev.queueIndex + 1 };
            else if (prev.repeat === 'all') return { ...prev, currentTime: 0, queueIndex: 0 };
            else return { ...prev, isPlaying: false, currentTime: 0 };
          }
          return { ...prev, currentTime: newTime };
        });
      }, 1000);
      return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
    }
  }, [state.isPlaying, state.queueIndex]);

  const playTrack = useCallback((trackId: string) => {
    const trackIds = tracks.map(t => t.id);
    const index = trackIds.indexOf(trackId);
    if (index !== -1) {
      setState(prev => ({
        ...prev,
        queue: prev.shuffle ? [trackId, ...trackIds.filter(id => id !== trackId).sort(() => Math.random() - 0.5)] : trackIds,
        queueIndex: prev.shuffle ? 0 : index,
        isPlaying: true,
        currentTime: 0,
        recentlyPlayed: [trackId, ...prev.recentlyPlayed.filter(id => id !== trackId)].slice(0, 50),
        tracks: { ...prev.tracks, [trackId]: { ...prev.tracks[trackId], playCount: prev.tracks[trackId].playCount + 1, lastPlayed: Date.now() } },
      }));
    }
  }, [tracks]);

  const playAlbum = useCallback((albumId: string) => {
    const album = state.albums[albumId];
    if (album && album.trackIds.length > 0) setState(prev => ({ ...prev, queue: album.trackIds, queueIndex: 0, isPlaying: true, currentTime: 0 }));
  }, [state.albums]);

  const playPlaylist = useCallback((playlistId: string) => {
    const playlist = state.playlists[playlistId];
    if (playlist && playlist.trackIds.length > 0) setState(prev => ({ ...prev, queue: prev.shuffle ? [...playlist.trackIds].sort(() => Math.random() - 0.5) : playlist.trackIds, queueIndex: 0, isPlaying: true, currentTime: 0 }));
  }, [state.playlists]);

  const togglePlay = useCallback(() => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying })), []);
  const playPrev = useCallback(() => setState(prev => prev.currentTime > 3 ? { ...prev, currentTime: 0 } : { ...prev, queueIndex: prev.queueIndex > 0 ? prev.queueIndex - 1 : prev.queue.length - 1, currentTime: 0 }), []);
  const playNext = useCallback(() => setState(prev => ({ ...prev, queueIndex: prev.queueIndex < prev.queue.length - 1 ? prev.queueIndex + 1 : 0, currentTime: 0 })), []);
  const seek = useCallback((time: number) => setState(prev => ({ ...prev, currentTime: time })), []);
  const setVolume = useCallback((volume: number) => setState(prev => ({ ...prev, volume, isMuted: false })), []);
  const toggleMute = useCallback(() => setState(prev => ({ ...prev, isMuted: !prev.isMuted })), []);
  const toggleShuffle = useCallback(() => setState(prev => ({ ...prev, shuffle: !prev.shuffle })), []);
  const toggleRepeat = useCallback(() => setState(prev => ({ ...prev, repeat: prev.repeat === 'off' ? 'all' : prev.repeat === 'all' ? 'one' : 'off' })), []);

  const toggleLove = useCallback((trackId: string) => {
    setState(prev => ({ ...prev, tracks: { ...prev.tracks, [trackId]: { ...prev.tracks[trackId], loved: !prev.tracks[trackId].loved, disliked: false } } }));
  }, []);

  const toggleDislike = useCallback((trackId: string) => {
    setState(prev => ({ ...prev, tracks: { ...prev.tracks, [trackId]: { ...prev.tracks[trackId], disliked: !prev.tracks[trackId].disliked, loved: false } } }));
  }, []);

  const addToQueue = useCallback((trackId: string) => setState(prev => ({ ...prev, queue: [...prev.queue, trackId] })), []);

  const removeFromQueue = useCallback((index: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      newQueue.splice(index, 1);
      return { ...prev, queue: newQueue, queueIndex: index < prev.queueIndex ? prev.queueIndex - 1 : prev.queueIndex };
    });
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      let newQueueIndex = prev.queueIndex;
      if (fromIndex === prev.queueIndex) newQueueIndex = toIndex;
      else if (fromIndex < prev.queueIndex && toIndex >= prev.queueIndex) newQueueIndex--;
      else if (fromIndex > prev.queueIndex && toIndex <= prev.queueIndex) newQueueIndex++;
      return { ...prev, queue: newQueue, queueIndex: newQueueIndex };
    });
  }, []);

  const clearQueue = useCallback(() => setState(prev => ({ ...prev, queue: prev.queue[prev.queueIndex] ? [prev.queue[prev.queueIndex]] : [], queueIndex: prev.queue[prev.queueIndex] ? 0 : -1 })), []);
  const createPlaylist = useCallback(() => { setEditingPlaylist(null); setShowPlaylistEditor(true); }, []);
  const editPlaylist = useCallback((playlistId: string) => { setEditingPlaylist(state.playlists[playlistId] || null); setShowPlaylistEditor(true); }, [state.playlists]);

  const savePlaylist = useCallback((playlistData: Partial<Playlist>) => {
    setState(prev => {
      const now = Date.now();
      const id = playlistData.id || generateId();
      const existing = prev.playlists[id];
      const playlist: Playlist = { id, name: playlistData.name || 'Untitled Playlist', description: playlistData.description, trackIds: playlistData.trackIds || [], isSmartPlaylist: playlistData.isSmartPlaylist || false, smartRules: playlistData.smartRules, collaborative: playlistData.collaborative || false, dateCreated: existing?.dateCreated || now, dateModified: now };
      return { ...prev, playlists: { ...prev.playlists, [id]: playlist } };
    });
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setState(prev => { const { [playlistId]: _, ...rest } = prev.playlists; return { ...prev, playlists: rest }; });
  }, []);

  const viewTabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Library', icon: <Library className="w-4 h-4" /> },
    { id: 'nowPlaying', label: 'Now Playing', icon: <Music className="w-4 h-4" /> },
    { id: 'queue', label: 'Queue', icon: <ListOrdered className="w-4 h-4" /> },
    { id: 'spotify', label: 'Spotify', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
    { id: 'soundcloud', label: 'SoundCloud', icon: <img src="/images/soundcloud-logo.jpg" alt="" className="w-4 h-4 rounded" /> },
  ];

  const spotifyProfile = socialProfiles.spotify;
  const soundcloudProfile = socialProfiles.soundcloud;

  return (
    <ZWindow title="Music" onClose={onClose} onFocus={onFocus} defaultWidth={1000} defaultHeight={720} minWidth={700} minHeight={500} defaultPosition={{ x: 160, y: 80 }}>
      <div className="flex flex-col h-full bg-transparent">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", view === 'spotify' ? "bg-[#1DB954]" : view === 'soundcloud' ? "bg-[#FF5500]" : "bg-gradient-to-br from-pink-500 to-red-500")}>
              {view === 'spotify' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              ) : view === 'soundcloud' ? (
                <img src="/images/soundcloud-logo.jpg" alt="SoundCloud" className="w-6 h-6 rounded" />
              ) : (
                <Music className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Music</h2>
              {(view === 'spotify' || view === 'soundcloud') && (
                <a href={view === 'spotify' ? spotifyProfile.url : soundcloudProfile.url} target="_blank" rel="noopener noreferrer" className="text-white/50 text-xs hover:text-white/70 transition-colors">
                  @{view === 'spotify' ? spotifyProfile.handle : soundcloudProfile.handle}
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-1 glass-sm rounded-lg p-1">
            {viewTabs.map((tab) => (
              <button key={tab.id} onClick={() => setView(tab.id)} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all', view === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5')}>
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'library' && (
            <LibraryView section={librarySection} onSectionChange={setLibrarySection} tracks={tracks} albums={albums} artists={artists} playlists={playlists} currentTrackId={currentTrack?.id || null} isPlaying={state.isPlaying} onPlayTrack={playTrack} onPlayAlbum={playAlbum} onPlayPlaylist={playPlaylist} onLove={toggleLove} onAddToQueue={addToQueue} onCreatePlaylist={createPlaylist} onEditPlaylist={editPlaylist} onDeletePlaylist={deletePlaylist} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          )}

          {view === 'nowPlaying' && (
            <NowPlayingView track={currentTrack} isPlaying={state.isPlaying} currentTime={state.currentTime} volume={state.volume} isMuted={state.isMuted} shuffle={state.shuffle} repeat={state.repeat} onPlayPause={togglePlay} onPrev={playPrev} onNext={playNext} onSeek={seek} onVolumeChange={setVolume} onMuteToggle={toggleMute} onShuffleToggle={toggleShuffle} onRepeatToggle={toggleRepeat} onLove={() => currentTrack && toggleLove(currentTrack.id)} onDislike={() => currentTrack && toggleDislike(currentTrack.id)} onMinimize={() => setView('library')} showLyrics={showLyrics} onToggleLyrics={() => setShowLyrics(!showLyrics)} />
          )}

          {view === 'queue' && (
            <QueueView queue={queueTracks} currentIndex={state.queueIndex} isPlaying={state.isPlaying} onPlay={(index) => setState(prev => ({ ...prev, queueIndex: index, currentTime: 0, isPlaying: true }))} onRemove={removeFromQueue} onReorder={reorderQueue} onClear={clearQueue} onLove={toggleLove} />
          )}

          {view === 'spotify' && <SpotifyView userPlaylists={spotifyPlaylists} loadingPlaylists={loadingSpotify} />}
          {view === 'soundcloud' && <SoundCloudView />}
        </div>

        {currentTrack && view !== 'nowPlaying' && (
          <MiniPlayer track={currentTrack} isPlaying={state.isPlaying} currentTime={state.currentTime} onPlayPause={togglePlay} onPrev={playPrev} onNext={playNext} onExpand={() => setView('nowPlaying')} />
        )}

        {showPlaylistEditor && <PlaylistEditor playlist={editingPlaylist} tracks={tracks} onSave={savePlaylist} onClose={() => setShowPlaylistEditor(false)} />}
      </div>
    </ZWindow>
  );
};

export default ZMusicWindow;
