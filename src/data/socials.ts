// Social media configuration for Zach Kelling
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
    displayName: 'Zach Kelling',
    color: '#333',
    icon: 'Github',
  },
  twitter: {
    platform: 'X (Twitter)',
    handle: 'zeekay',
    url: 'https://x.com/zeekay',
    displayName: 'Zach Kelling',
    embedUrl: 'https://twitter.com/zeekay',
    color: '#000',
    icon: 'Twitter',
  },
  linkedin: {
    platform: 'LinkedIn',
    handle: 'zachkelling',
    url: 'https://linkedin.com/in/zachkelling',
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
    handle: 'zeekay',
    url: 'https://soundcloud.com/zeekay',
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
};

// Professional info
export const professionalInfo = {
  name: 'Zach Kelling',
  title: 'Founder & CTO',
  company: 'Hanzo AI',
  location: 'San Francisco, CA',
  bio: 'Building the future of AI at Hanzo. Techstars \'17. Passionate about decentralized systems, open source, and pushing the boundaries of what\'s possible.',
  email: 'z@hanzo.ai',
  website: 'https://hanzo.ai',
};

// Tech stack and interests
export const techStack = [
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'React',
  'Next.js',
  'Node.js',
  'AI/ML',
  'Blockchain',
  'Web3',
];

export const interests = [
  'AI/ML Research',
  'Decentralized Systems',
  'Open Source',
  'Music Production',
  'Photography',
];

// Get social profile by key
export const getSocialProfile = (key: string): SocialProfile | undefined => {
  return socialProfiles[key.toLowerCase()];
};

// Get all social profiles as array
export const getAllSocials = (): SocialProfile[] => {
  return Object.values(socialProfiles);
};
