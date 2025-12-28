#!/usr/bin/env npx tsx
/**
 * Fetch Spotify data for static build
 * 
 * Usage:
 *   npx tsx scripts/fetch-spotify.ts
 * 
 * Requires environment variables:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_REFRESH_TOKEN
 */

import * as fs from 'fs';
import * as path from 'path';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!CLIENT_ID) {
  console.error('Error: SPOTIFY_CLIENT_ID is required');
  process.exit(1);
}

if (!REFRESH_TOKEN) {
  console.error('Error: SPOTIFY_REFRESH_TOKEN is required');
  console.error('Run the app locally and authenticate to get a refresh token');
  process.exit(1);
}

// Spotify API types
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

interface SpotifyExternalUrls {
  spotify: string;
}

interface SpotifyFollowers {
  href: string | null;
  total: number;
}

interface SpotifyProfile {
  id: string;
  display_name: string;
  images: SpotifyImage[];
  followers: SpotifyFollowers;
  external_urls: SpotifyExternalUrls;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  external_urls: SpotifyExternalUrls;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  external_urls: SpotifyExternalUrls;
}

interface SpotifyPlaylistItem {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  tracks: { total: number };
  external_urls: SpotifyExternalUrls;
}

interface SpotifyPlayHistory {
  track: SpotifyTrack;
  played_at: string;
}

interface SpotifyPaginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
}

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN!,
  });

  // Use Basic auth with client_id:client_secret
  const authHeader = CLIENT_SECRET 
    ? `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
    : undefined;

  const headers: Record<string, string> = { 
    'Content-Type': 'application/x-www-form-urlencoded' 
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  } else {
    // Fallback to client_id in body for PKCE flow
    params.set('client_id', CLIENT_ID!);
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers,
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  
  // If we got a new refresh token, log it (for updating secrets)
  if (data.refresh_token && data.refresh_token !== REFRESH_TOKEN) {
    console.log('New refresh token received - update SPOTIFY_REFRESH_TOKEN secret');
  }
  
  return data.access_token;
}

async function spotifyFetch<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  console.log('🎵 Fetching Spotify data...');
  
  const token = await getAccessToken();
  console.log('✓ Got access token');

  // Fetch all data in parallel
  const [profile, topTracksShort, topTracksMedium, topTracksLong, topArtists, recentlyPlayed, playlists] = await Promise.all([
    spotifyFetch<SpotifyProfile>('/me', token),
    spotifyFetch<SpotifyPaginated<SpotifyTrack>>('/me/top/tracks?time_range=short_term&limit=50', token),
    spotifyFetch<SpotifyPaginated<SpotifyTrack>>('/me/top/tracks?time_range=medium_term&limit=50', token),
    spotifyFetch<SpotifyPaginated<SpotifyTrack>>('/me/top/tracks?time_range=long_term&limit=50', token),
    spotifyFetch<SpotifyPaginated<SpotifyArtist>>('/me/top/artists?time_range=medium_term&limit=50', token),
    spotifyFetch<SpotifyPaginated<SpotifyPlayHistory>>('/me/player/recently-played?limit=50', token),
    spotifyFetch<SpotifyPaginated<SpotifyPlaylistItem>>('/me/playlists?limit=50', token),
  ]);

  console.log('✓ Fetched profile:', profile.display_name);
  console.log('✓ Fetched top tracks (short/medium/long term)');
  console.log('✓ Fetched top artists');
  console.log('✓ Fetched recently played');
  console.log('✓ Fetched playlists:', playlists.items?.length || 0);

  const data = {
    profile,
    topTracks: {
      shortTerm: topTracksShort.items,
      mediumTerm: topTracksMedium.items,
      longTerm: topTracksLong.items,
    },
    topArtists: topArtists.items,
    recentlyPlayed: recentlyPlayed.items,
    playlists: playlists.items,
    fetchedAt: new Date().toISOString(),
  };

  // Write to public/data/spotify.json
  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'spotify.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✓ Wrote data to ${outputPath}`);

  // Also write minimal version for faster loading
  const minimalData = {
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      images: profile.images,
      followers: profile.followers,
      external_urls: profile.external_urls,
    },
    topTracks: topTracksMedium.items.slice(0, 10).map((t) => ({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a) => ({ id: a.id, name: a.name })),
      album: { id: t.album.id, name: t.album.name, images: t.album.images },
      duration_ms: t.duration_ms,
      external_urls: t.external_urls,
    })),
    topArtists: topArtists.items.slice(0, 10).map((a) => ({
      id: a.id,
      name: a.name,
      images: a.images,
      genres: a.genres?.slice(0, 3),
      external_urls: a.external_urls,
    })),
    playlists: playlists.items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.images?.[0]?.url || null,
      trackCount: p.tracks.total,
      url: p.external_urls.spotify,
    })),
    fetchedAt: new Date().toISOString(),
  };

  const minimalPath = path.join(outputDir, 'spotify-minimal.json');
  fs.writeFileSync(minimalPath, JSON.stringify(minimalData, null, 2));
  console.log(`✓ Wrote minimal data to ${minimalPath}`);

  console.log('\n🎉 Done!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
