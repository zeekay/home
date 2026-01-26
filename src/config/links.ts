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
  hanzoPapers: 'https://github.com/hanzoai/papers',
  hanzoResearch: 'https://hanzo.industries/research',

  // Lux Network
  luxNetwork: 'https://lux.network',
  luxExplorer: 'https://explore.lux.network',
  luxDocs: 'https://docs.lux.network',
  luxWhitepaper: 'https://lux.network/whitepaper',
  luxGenesis: 'https://docs.lux.network/genesis',
  luxPapers: 'https://github.com/luxfi/papers',
  luxFHEPapers: 'https://github.com/luxfhe/papers',

  // Zoo Labs
  zooLabs: 'https://zoo.ngo',
  zooGitHub: 'https://github.com/zooai',
  zooResearch: 'https://zoo.ngo/research',
  zooZips: 'https://zips.zoo.ngo',
  zooPapers: 'https://github.com/zooai/papers',

  // Zen LM
  zenLM: 'https://zenlm.ai',
  zenHuggingFace: 'https://huggingface.co/zenlm',
  zenPapers: 'https://github.com/zenlm/papers',

  // ZAP Protocol
  zapProtocol: 'https://github.com/zap-protocol/zap',
  zapPapers: 'https://github.com/zap-protocol/papers',

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
  { name: 'Zen LM', url: EXTERNAL_LINKS.zenLM, keywords: ['zen', 'models', 'llm'] },
  { name: 'GitHub', url: EXTERNAL_LINKS.githubUser, keywords: ['github', 'code', 'repos'] },
  { name: 'Hugging Face', url: EXTERNAL_LINKS.zenHuggingFace, keywords: ['huggingface', 'models', 'ai'] },
  // Research Papers
  { name: 'Hanzo Research', url: EXTERNAL_LINKS.hanzoResearch, keywords: ['research', 'papers', 'hanzo'] },
  { name: 'Hanzo Papers', url: EXTERNAL_LINKS.hanzoPapers, keywords: ['papers', 'aso', 'hmm', 'dso'] },
  { name: 'Lux Papers', url: EXTERNAL_LINKS.luxPapers, keywords: ['papers', 'consensus', 'crypto'] },
  { name: 'Zoo Papers', url: EXTERNAL_LINKS.zooPapers, keywords: ['papers', 'grpo', 'training'] },
  { name: 'Zen Papers', url: EXTERNAL_LINKS.zenPapers, keywords: ['papers', 'models', 'zen'] },
] as const;

export type ExternalLinkKey = keyof typeof EXTERNAL_LINKS;
