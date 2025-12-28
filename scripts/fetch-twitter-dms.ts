#!/usr/bin/env npx ts-node

/**
 * Fetches Twitter/X Direct Messages using the Twitter API v2
 * 
 * Setup:
 * 1. Go to developer.twitter.com and create a project/app
 * 2. Enable OAuth 2.0 with read permissions for Direct Messages
 * 3. Generate access tokens with dm.read scope
 * 4. Set TWITTER_BEARER_TOKEN in GitHub secrets
 * 
 * Note: DM API requires elevated access or user context authentication
 * 
 * Run: npx ts-node scripts/fetch-twitter-dms.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

interface DirectMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant: TwitterUser;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: DirectMessage[];
}

interface TwitterDMData {
  user: TwitterUser;
  conversations: Conversation[];
  fetchedAt: string;
}

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;
const API_BASE = 'https://api.twitter.com/2';

async function twitterFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function fetchAuthenticatedUser(): Promise<TwitterUser> {
  const response = await twitterFetch<{
    data: {
      id: string;
      username: string;
      name: string;
      profile_image_url?: string;
    };
  }>('/users/me?user.fields=profile_image_url');
  
  return {
    id: response.data.id,
    username: response.data.username,
    name: response.data.name,
    profileImageUrl: response.data.profile_image_url,
  };
}

async function fetchDirectMessages(): Promise<Conversation[]> {
  // Note: DM endpoints require OAuth 2.0 with user context
  // This is a placeholder - actual implementation needs OAuth 2.0 PKCE flow
  
  // For now, return empty array - DMs require user authentication
  console.log('⚠️  DM fetching requires OAuth 2.0 user context authentication');
  console.log('   This feature will be available in a future update');
  
  return [];
}

async function main() {
  if (!TWITTER_BEARER_TOKEN) {
    console.log('⚠️  TWITTER_BEARER_TOKEN not set');
    console.log('');
    console.log('To set up Twitter/X integration:');
    console.log('1. Go to https://developer.twitter.com/en/portal/dashboard');
    console.log('2. Create a new project and app');
    console.log('3. Set up OAuth 2.0 with dm.read scope');
    console.log('4. Generate Bearer Token');
    console.log('5. Add TWITTER_BEARER_TOKEN to GitHub secrets');
    console.log('');
    console.log('Note: DM access requires elevated API access or user context auth');
    console.log('');
    
    // Create placeholder data
    const placeholderData: TwitterDMData = {
      user: {
        id: '',
        username: 'zeekay',
        name: 'Z',
      },
      conversations: [],
      fetchedAt: new Date().toISOString(),
    };
    
    const outputPath = path.join(__dirname, '../public/data/twitter-dms.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(placeholderData, null, 2));
    console.log('Created placeholder twitter-dms.json');
    return;
  }

  console.log('🔄 Fetching Twitter data...');

  try {
    // Fetch authenticated user info
    const user = await fetchAuthenticatedUser();
    console.log(`✅ Authenticated as: @${user.username}`);

    // Fetch DMs (requires user context auth)
    const conversations = await fetchDirectMessages();
    console.log(`✅ Found ${conversations.length} conversations`);

    // Build data structure
    const data: TwitterDMData = {
      user,
      conversations,
      fetchedAt: new Date().toISOString(),
    };

    // Save to public/data
    const outputPath = path.join(__dirname, '../public/data/twitter-dms.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Saved to ${outputPath}`);
    console.log('');
    console.log('Twitter DM data summary:');
    console.log(`  Username: @${data.user.username}`);
    console.log(`  Conversations: ${data.conversations.length}`);

  } catch (error) {
    console.error('❌ Error fetching Twitter data:', error);
    process.exit(1);
  }
}

main();
