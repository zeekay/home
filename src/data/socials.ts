// Social media configuration for Zach Kelling (Z)
// This provides a single source of truth for all social handles and links

export interface SocialProfile {
  platform: string;
  handle: string;
  url: string;
  displayName?: string;
  embedUrl?: string;
  color: string;
  icon: string;
}

export const socialProfiles: Record<string, SocialProfile> = {
  github: {
    platform: 'GitHub',
    handle: 'zeekay',
    url: 'https://github.com/zeekay',
    displayName: 'Z',
    color: '#333',
    icon: 'Github',
  },
  twitter: {
    platform: 'X (Twitter)',
    handle: 'zeekay',
    url: 'https://x.com/zeekay',
    displayName: 'Z',
    embedUrl: 'https://twitter.com/zeekay',
    color: '#000',
    icon: 'Twitter',
  },
  linkedin: {
    platform: 'LinkedIn',
    handle: 'zeekay',
    url: 'https://linkedin.com/in/zeekay',
    displayName: 'Zach Kelling',
    color: '#0A66C2',
    icon: 'Linkedin',
  },
  instagram: {
    platform: 'Instagram',
    handle: 'zeekayai',
    url: 'https://instagram.com/zeekayai',
    color: '#E4405F',
    icon: 'Instagram',
  },
  spotify: {
    platform: 'Spotify',
    handle: 'zeek4y',
    url: 'https://open.spotify.com/user/zeek4y',
    color: '#1DB954',
    icon: 'Music',
  },
  soundcloud: {
    platform: 'SoundCloud',
    handle: 'requite',
    url: 'https://soundcloud.com/requite',
    color: '#FF5500',
    icon: 'Radio',
  },
  youtube: {
    platform: 'YouTube',
    handle: '@zeekay',
    url: 'https://youtube.com/@zeekay',
    color: '#FF0000',
    icon: 'Youtube',
  },
  stackoverflow: {
    platform: 'Stack Overflow',
    handle: 'zach-kelling',
    url: 'https://stackoverflow.com/users/641766/zach-kelling',
    displayName: 'Zach Kelling',
    color: '#F48024',
    icon: 'StackOverflow',
  },
  sora: {
    platform: 'Sora',
    handle: 'zeekayai',
    url: 'https://sora.chatgpt.com/profile/zeekayai',
    displayName: 'Z',
    color: '#0066FF',
    icon: 'Sora',
  },
};

// Professional info
export const professionalInfo = {
  name: 'Z',
  fullName: 'Zach Kelling',
  title: 'Open Sourceror',
  tagline: 'Cypherpunk building decentralized intelligence to free 1B people from economic slavery',
  roles: [
    { title: 'CEO', company: 'Hanzo AI', description: 'Applied AI cloud, 94+ frontier models, OSS compute dividends', icon: '🥷' },
    { title: 'Chairman', company: 'LUX', description: 'Quantum-safe blockchain accelerating economic freedom', icon: '▼' },
    { title: 'Architect', company: 'ZOO', description: 'Open AI research network — decentralized training, PoAI consensus', icon: '🧬' },
  ],
  location: 'San Francisco, CA',
  bio: 'Grew up in Topeka, KS. Left for computers at 13. Spent a decade as a professional musician. Came back to tech in the 2000s and never stopped. Cypherpunk since the 90s. Built commerce.js, shop.js, checkout.js, coin.js. Founded Hanzo (Techstars \'17). Building applied cryptography (CGGMP21, ML-KEM, Poseidon2), Lux blockchain, Zen models, and the infrastructure to give 1 billion people economic sovereignty through AI and crypto.',
  email: 'z@hanzo.ai',
  website: 'https://zeekay.io',
  blog: 'https://blog.hanzo.ai',
  chat: 'curl -sL zeekay.chat | sh',
};

// GitHub stats (from profile)
export const githubStats = {
  repos: 326,
  stars: 2700,
  followers: 562,
  following: 490,
  contributionsLastYear: 5363,
  organizations: ['hanzoai', 'zooai', 'luxfi', 'ellipsis', 'shopjs'],
};

// Pinned/Top projects from GitHub
export const pinnedProjects = [
  {
    name: 'ellipsis',
    repo: 'ellipsis/ellipsis',
    description: '◦◦◦ Ellipsis is a package manager for dotfiles.',
    language: 'Shell',
    stars: 362,
    forks: 28,
    url: 'https://github.com/ellipsis/ellipsis',
  },
  {
    name: 'shop.js',
    repo: 'shopjs/shop.js',
    description: '🛍️ Ecommerce UI components and framework powered by React.',
    language: 'HTML',
    stars: 457,
    forks: 64,
    url: 'https://github.com/shopjs/shop.js',
  },
  {
    name: 'Enso',
    repo: 'hanzoai/enso',
    description: '◯ Multimodal Mixture of Unbound Experts with Noise (MUEN) — unifying understanding and generation.',
    language: 'Python',
    stars: 0,
    forks: 0,
    url: 'https://github.com/hanzoai/enso',
  },
  {
    name: 'Zen',
    repo: 'hanzoai/zen',
    description: "🪷 Hanzo's flagship 1T+ parameter MoE LLM fusing top language models together.",
    language: 'Python',
    stars: 2,
    forks: 0,
    url: 'https://github.com/hanzoai/zen',
  },
  {
    name: 'LUX Node',
    repo: 'luxfi/node',
    description: '▼ High performance network of blockchains focused on quantum safety and privacy.',
    language: 'Go',
    stars: 8,
    forks: 5,
    url: 'https://github.com/luxfi/node',
  },
  {
    name: 'ZOO AI',
    repo: 'zooai/ai',
    description: '🧬 ZOO Chat app',
    language: 'TypeScript',
    stars: 3,
    forks: 1,
    url: 'https://github.com/zooai/ai',
  },
];

// Hanzo AI Models
export const hanzoModels = [
  { name: 'Enso', icon: '◯', description: 'Multimodal MoE' },
  { name: 'Genjo', icon: '🌀', description: 'Reality synthesis' },
  { name: 'Jin', icon: '🤖', description: 'Agent framework' },
  { name: 'Mu', icon: '🎹', description: 'Audio intelligence' },
  { name: 'Satori', icon: '🎥', description: 'Video understanding' },
  { name: 'Zen', icon: '🪷', description: 'Flagship LLM' },
];

// Tech stack and interests
export const techStack = [
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Shell',
  'React',
  'Next.js',
  'AI/ML',
  'Blockchain',
  'Quantum',
];

export const interests = [
  'Frontier AI',
  'Decentralized Systems',
  'Confidential Compute',
  'Robotics',
  'Autonomous Protocols',
];

// Contacts for FaceTime/Communication
export const contacts = [
  {
    id: 'z',
    name: 'Z',
    role: 'You',
    avatar: 'ZK',
    status: 'available',
    email: 'z@hanzo.ai',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'hanzo-dev',
    name: 'Hanzo Dev',
    role: 'AI Assistant',
    avatar: 'HD',
    status: 'available',
    email: 'dev@hanzo.ai',
    color: 'from-blue-500 to-cyan-500',
    isAI: true,
  },
  {
    id: 'z-ai',
    name: 'Z AI',
    role: 'AI Clone',
    avatar: 'ZA',
    status: 'available', 
    email: 'ai@zeekay.ai',
    color: 'from-green-500 to-teal-500',
    isAI: true,
  },
];

// Get social profile by key
export const getSocialProfile = (key: string): SocialProfile | undefined => {
  return socialProfiles[key.toLowerCase()];
};

// Get all social profiles as array
export const getAllSocials = (): SocialProfile[] => {
  return Object.values(socialProfiles);
};
