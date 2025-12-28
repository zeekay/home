/**
 * Spotify OAuth Callback Handler
 * 
 * Handles the redirect from Spotify authorization and exchanges
 * the code for an access token.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleCallback } from '@/services/spotify';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError(errorParam === 'access_denied' 
          ? 'Authorization was denied' 
          : `Authorization failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        return;
      }

      try {
        await handleCallback(code);
        setStatus('success');
        
        // Store refresh token for CI builds
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (refreshToken) {
          console.log('='.repeat(60));
          console.log('SPOTIFY_REFRESH_TOKEN for GitHub Secrets:');
          console.log(refreshToken);
          console.log('='.repeat(60));
        }
        
        // Redirect to home after short delay
        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to authenticate');
      }
    }

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#1DB954] animate-spin mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold">Connecting to Spotify...</h2>
            <p className="text-white/60 mt-2">Please wait while we complete authorization</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-[#1DB954] mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold">Connected!</h2>
            <p className="text-white/60 mt-2">Redirecting you back...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold">Connection Failed</h2>
            <p className="text-red-400 mt-2">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
