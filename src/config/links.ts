/**
 * Centralized configuration for external links and URLs
 * This makes it easy to update links across the application
 */

// Main company/product links
export const EXTERNAL_LINKS = {
  // Hanzo AI
  hanzoAI: 'https://hanzo.ai',
  hanzoGitHub: 'https://github.com/hanzoai',
  hanzoHuggingFace: 'https://huggingface.co/hanzoai',

  // Lux Network
  luxNetwork: 'https://lux.network',
  luxExplorer: 'https://explore.lux.network',
  luxDocs: 'https://docs.lux.network',
  luxWhitepaper: 'https://lux.network/whitepaper',
  luxGenesis: 'https://docs.lux.network/genesis',

  // Zoo Labs
  zooLabs: 'https://zoo.ngo',
  zooGitHub: 'https://github.com/zoolabs',
  zooResearch: 'https://zoo.ngo/research',
  zooZips: 'https://zips.zoo.ngo',

  // Hanzo Docs
  hanzoDocs: 'https://docs.hanzo.ai',
  hanzoACI: 'https://docs.hanzo.ai/aci',

  // Social
  twitter: 'https://twitter.com/hanaborosoide',
  linkedin: 'https://linkedin.com/in/user',

  // Developer
  github: 'https://github.com',
  githubUser: 'https://github.com/zeekay',
  stackoverflow: 'https://stackoverflow.com',

  // Search engines
  google: 'https://www.google.com',
  duckduckgo: 'https://duckduckgo.com',
  wikipedia: 'https://en.wikipedia.org',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  stackOverflow: {
    base: 'https://api.stackexchange.com/2.3',
    defaultUserId: import.meta.env.VITE_STACKOVERFLOW_USER_ID || '641766',
  },
  wikipedia: {
    search: 'https://en.wikipedia.org/w/api.php',
  },
  github: {
    api: 'https://api.github.com',
  },
} as const;

// Font CDN URLs (for easy switching or self-hosting)
export const FONT_URLS = {
  inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  geist: 'https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-sans',
  geistMono: 'https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-mono',
} as const;

// Quick links for Spotlight search
export const QUICK_LINKS = [
  { name: 'Hanzo AI', url: EXTERNAL_LINKS.hanzoAI, keywords: ['hanzo', 'ai', 'company'] },
  { name: 'LUX Network', url: EXTERNAL_LINKS.luxNetwork, keywords: ['lux', 'blockchain', 'network'] },
  { name: 'Zoo Labs', url: EXTERNAL_LINKS.zooLabs, keywords: ['zoo', 'labs', 'foundation'] },
  { name: 'GitHub', url: EXTERNAL_LINKS.githubUser, keywords: ['github', 'code', 'repos'] },
  { name: 'Hugging Face', url: EXTERNAL_LINKS.hanzoHuggingFace, keywords: ['huggingface', 'models', 'ai'] },
] as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
