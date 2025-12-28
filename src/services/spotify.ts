/**
 * Spotify Web API Service
 * 
 * Handles OAuth PKCE flow and API calls
 */

import type {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTopItems,
  SpotifyRecentlyPlayed,
  SpotifyCurrentlyPlaying,
  SpotifyStaticData,
} from '@/types/spotify';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/spotify/callback`;

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-read-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

const TOKEN_KEY = 'spotify_access_token';
const REFRESH_KEY = 'spotify_refresh_token';
const EXPIRY_KEY = 'spotify_token_expiry';
const VERIFIER_KEY = 'spotify_verifier';

// PKCE helpers
function generateCodeVerifier(length: number = 128): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Auth functions
export async function redirectToSpotifyAuth(): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  
  localStorage.setItem(VERIFIER_KEY, verifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleCallback(code: string): Promise<string> {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('No verifier found');
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to get access token');
  }
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
  }
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + data.expires_in * 1000));
  localStorage.removeItem(VERIFIER_KEY);
  
  return data.access_token;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  
  if (!response.ok) {
    logout();
    return null;
  }
  
  const data = await response.json();
  
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
  }
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + data.expires_in * 1000));
  
  return data.access_token;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isTokenExpired(): boolean {
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > parseInt(expiry) - 60000; // 1 minute buffer
}

export function isAuthenticated(): boolean {
  return !!getAccessToken() && !isTokenExpired();
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

// API helpers
async function getValidToken(): Promise<string> {
  let token = getAccessToken();
  
  if (!token || isTokenExpired()) {
    token = await refreshAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
  }
  
  return token;
}

async function spotifyFetch<T>(endpoint: string): Promise<T> {
  const token = await getValidToken();
  
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Try refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        const retry = await fetch(`https://api.spotify.com/v1${endpoint}`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (retry.ok) return retry.json();
      }
      throw new Error('Authentication expired');
    }
    throw new Error(`Spotify API error: ${response.status}`);
  }
  
  return response.json();
}

// API functions
export async function getProfile(): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>('/me');
}

export async function getTopTracks(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<SpotifyTopItems<SpotifyTrack>>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
  return data.items;
}

export async function getTopArtists(
  timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
  limit: number = 20
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<SpotifyTopItems<SpotifyArtist>>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );
  return data.items;
}

export async function getRecentlyPlayed(limit: number = 20): Promise<SpotifyRecentlyPlayed['items']> {
  const data = await spotifyFetch<SpotifyRecentlyPlayed>(
    `/me/player/recently-played?limit=${limit}`
  );
  return data.items;
}

export async function getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
  try {
    const token = await getValidToken();
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.status === 204) return null; // Nothing playing
    if (!response.ok) return null;
    
    return response.json();
  } catch {
    return null;
  }
}

export async function getPlaylists(limit: number = 50): Promise<SpotifyPlaylist[]> {
  const data = await spotifyFetch<SpotifyTopItems<SpotifyPlaylist>>(
    `/me/playlists?limit=${limit}`
  );
  return data.items;
}

export async function getPlaylist(id: string): Promise<SpotifyPlaylist> {
  return spotifyFetch<SpotifyPlaylist>(`/playlists/${id}`);
}

// Fetch all data for static export
export async function fetchAllData(): Promise<SpotifyStaticData> {
  const [profile, topTracks, topArtists, recentlyPlayed, playlists] = await Promise.all([
    getProfile(),
    getTopTracks('medium_term', 50),
    getTopArtists('medium_term', 50),
    getRecentlyPlayed(50),
    getPlaylists(50),
  ]);
  
  return {
    profile,
    topTracks,
    topArtists,
    recentlyPlayed,
    playlists,
    fetchedAt: new Date().toISOString(),
  };
}

// Load static data (for production without auth)
export async function loadStaticData(): Promise<SpotifyStaticData | null> {
  try {
    const response = await fetch('/data/spotify.json');
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
