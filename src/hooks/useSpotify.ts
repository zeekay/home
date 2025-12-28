/**
 * React hook for Spotify data
 * 
 * In development: Uses live API with OAuth
 * In production: Uses pre-fetched static data
 */

import { useState, useEffect, useCallback } from 'react';
import type { SpotifyStaticData, SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyCurrentlyPlaying } from '@/types/spotify';
import * as spotify from '@/services/spotify';

interface UseSpotifyReturn {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  profile: SpotifyUser | null;
  topTracks: SpotifyTrack[];
  topArtists: SpotifyArtist[];
  recentlyPlayed: SpotifyStaticData['recentlyPlayed'];
  currentlyPlaying: SpotifyCurrentlyPlaying | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  
  // Static data info
  fetchedAt: string | null;
  isStaticData: boolean;
}

export function useSpotify(): UseSpotifyReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staticData, setStaticData] = useState<SpotifyStaticData | null>(null);
  const [isStaticData, setIsStaticData] = useState(false);
  
  const [profile, setProfile] = useState<SpotifyUser | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyStaticData['recentlyPlayed']>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyCurrentlyPlaying | null>(null);

  const isAuthenticated = spotify.isAuthenticated();

  // Load static data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try static data first
        const data = await spotify.loadStaticData();
        if (data) {
          setStaticData(data);
          setIsStaticData(true);
          setProfile(data.profile);
          setTopTracks(data.topTracks);
          setTopArtists(data.topArtists);
          setRecentlyPlayed(data.recentlyPlayed);
        }
        
        // If authenticated, fetch fresh data
        if (spotify.isAuthenticated()) {
          await refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Poll for currently playing (when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function pollCurrentlyPlaying() {
      try {
        const data = await spotify.getCurrentlyPlaying();
        setCurrentlyPlaying(data);
      } catch {
        // Ignore errors for polling
      }
    }
    
    pollCurrentlyPlaying();
    const interval = window.setInterval(pollCurrentlyPlaying, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!spotify.isAuthenticated()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [profileData, tracksData, artistsData, recentData] = await Promise.all([
        spotify.getProfile(),
        spotify.getTopTracks('medium_term', 50),
        spotify.getTopArtists('medium_term', 50),
        spotify.getRecentlyPlayed(50),
      ]);
      
      setProfile(profileData);
      setTopTracks(tracksData);
      setTopArtists(artistsData);
      setRecentlyPlayed(recentData);
      setIsStaticData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    await spotify.redirectToSpotifyAuth();
  }, []);

  const logout = useCallback(() => {
    spotify.logout();
    // Reload to reset state
    window.location.reload();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    profile,
    topTracks,
    topArtists,
    recentlyPlayed,
    currentlyPlaying,
    login,
    logout,
    refresh,
    fetchedAt: staticData?.fetchedAt || null,
    isStaticData,
  };
}
