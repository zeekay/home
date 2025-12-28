// Spotify API Types

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email?: string;
  country?: string;
  product?: string;
  type: string;
  uri: string;
  href: string;
  images: SpotifyImage[];
  followers: {
    href: string | null;
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  href: string;
  type: string;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
  followers?: {
    href: string | null;
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  href: string;
  type: string;
  album_type: string;
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  href: string;
  type: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  disc_number: number;
  is_local: boolean;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  uri: string;
  href: string;
  type: string;
  public: boolean;
  collaborative: boolean;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
    uri: string;
    href: string;
    external_urls: {
      spotify: string;
    };
  };
  tracks: {
    href: string;
    total: number;
    items?: Array<{
      added_at: string;
      track: SpotifyTrack;
    }>;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopItems<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export interface SpotifyRecentlyPlayed {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
    context: {
      type: string;
      uri: string;
      href: string;
      external_urls: {
        spotify: string;
      };
    } | null;
  }>;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

export interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number;
  timestamp: number;
  item: SpotifyTrack | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  context: {
    type: string;
    uri: string;
    href: string;
    external_urls: {
      spotify: string;
    };
  } | null;
}

// Minimal playlist data for static JSON (smaller file size)
export interface SpotifyPlaylistMinimal {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  trackCount: number;
  url: string;
}

// Static data structure for daily builds
export interface SpotifyStaticData {
  fetchedAt: string;
  user: {
    id: string;
    name: string;
    url: string;
    image: string | null;
  };
  playlists: SpotifyPlaylistMinimal[];
}
