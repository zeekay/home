#!/usr/bin/env npx ts-node

/**
 * Fetches Instagram media from the Instagram Graph API
 * 
 * Setup:
 * 1. Go to developers.facebook.com and create an app
 * 2. Add Instagram Basic Display product
 * 3. Generate a long-lived access token
 * 4. Set INSTAGRAM_ACCESS_TOKEN in GitHub secrets
 * 
 * Run: npx ts-node scripts/fetch-instagram.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramUser {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

interface InstagramData {
  user: {
    id: string;
    username: string;
    mediaCount: number;
  };
  media: {
    id: string;
    type: string;
    url: string;
    thumbnail?: string;
    caption?: string;
    permalink: string;
    timestamp: string;
  }[];
  fetchedAt: string;
}

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const API_BASE = 'https://graph.instagram.com';

async function instagramFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${INSTAGRAM_ACCESS_TOKEN}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Instagram API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function fetchUserProfile(): Promise<InstagramUser> {
  return instagramFetch<InstagramUser>('/me?fields=id,username,account_type,media_count');
}

async function fetchUserMedia(limit = 12): Promise<InstagramMedia[]> {
  const response = await instagramFetch<{ data: InstagramMedia[] }>(
    `/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}`
  );
  return response.data;
}

async function main() {
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.log('⚠️  INSTAGRAM_ACCESS_TOKEN not set');
    console.log('');
    console.log('To set up Instagram integration:');
    console.log('1. Go to https://developers.facebook.com/apps');
    console.log('2. Create a new app (Consumer type)');
    console.log('3. Add Instagram Basic Display product');
    console.log('4. Add yourself as a test user');
    console.log('5. Generate an access token');
    console.log('6. Exchange for long-lived token (60 days)');
    console.log('7. Add INSTAGRAM_ACCESS_TOKEN to GitHub secrets');
    console.log('');
    
    // Create placeholder data
    const placeholderData: InstagramData = {
      user: {
        id: '',
        username: 'zeekayai',
        mediaCount: 0,
      },
      media: [],
      fetchedAt: new Date().toISOString(),
    };
    
    const outputPath = path.join(__dirname, '../public/data/instagram.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(placeholderData, null, 2));
    console.log('Created placeholder instagram.json');
    return;
  }

  console.log('🔄 Fetching Instagram data...');

  try {
    // Fetch user profile
    const user = await fetchUserProfile();
    console.log(`✅ Found user: @${user.username} (${user.media_count} posts)`);

    // Fetch recent media
    const media = await fetchUserMedia(24);
    console.log(`✅ Fetched ${media.length} media items`);

    // Transform data
    const data: InstagramData = {
      user: {
        id: user.id,
        username: user.username,
        mediaCount: user.media_count,
      },
      media: media.map((item) => ({
        id: item.id,
        type: item.media_type.toLowerCase(),
        url: item.media_url,
        thumbnail: item.thumbnail_url,
        caption: item.caption,
        permalink: item.permalink,
        timestamp: item.timestamp,
      })),
      fetchedAt: new Date().toISOString(),
    };

    // Save to public/data
    const outputPath = path.join(__dirname, '../public/data/instagram.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Saved to ${outputPath}`);
    console.log('');
    console.log('Instagram data summary:');
    console.log(`  Username: @${data.user.username}`);
    console.log(`  Total posts: ${data.user.mediaCount}`);
    console.log(`  Fetched: ${data.media.length} items`);

  } catch (error) {
    console.error('❌ Error fetching Instagram data:', error);
    process.exit(1);
  }
}

main();
