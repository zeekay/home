import React, { useState } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Github,
  Music,
  Radio,
  Code2,
  Search,
  Plus,
  Globe,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  Share2,
} from 'lucide-react';
import { socialProfiles, professionalInfo, pinnedProjects } from '@/data/socials';
import { SoraIcon } from './dock/icons';

interface ZSocialsWindowProps {
  onClose: () => void;
}

// Define contact cards - different identities/usernames across platforms
const contactIdentities = [
  {
    id: 'main',
    name: 'Z',
    subtitle: 'Zach Kelling',
    avatar: 'ZK',
    color: 'from-purple-500 to-pink-500',
    isPrimary: true,
  },
  {
    id: 'github',
    name: 'zeekay',
    subtitle: 'GitHub',
    avatar: '🐙',
    color: 'from-gray-600 to-gray-800',
    platform: 'github',
  },
  {
    id: 'twitter',
    name: '@zeekay',
    subtitle: 'X / Twitter',
    avatar: '𝕏',
    color: 'from-gray-800 to-black',
    platform: 'twitter',
  },
  {
    id: 'linkedin',
    name: 'Zach Kelling',
    subtitle: 'LinkedIn',
    avatar: 'in',
    color: 'from-blue-600 to-blue-800',
    platform: 'linkedin',
  },
  {
    id: 'instagram',
    name: '@zeekayai',
    subtitle: 'Instagram',
    avatar: '📸',
    color: 'from-pink-500 to-orange-500',
    platform: 'instagram',
  },
  {
    id: 'youtube',
    name: '@zeekay',
    subtitle: 'YouTube',
    avatar: '▶',
    color: 'from-red-600 to-red-700',
    platform: 'youtube',
  },
  {
    id: 'spotify',
    name: 'zeek4y',
    subtitle: 'Spotify',
    avatar: '🎵',
    color: 'from-green-500 to-green-700',
    platform: 'spotify',
  },
  {
    id: 'soundcloud',
    name: 'zeekay',
    subtitle: 'SoundCloud',
    avatar: '☁',
    color: 'from-orange-500 to-orange-600',
    platform: 'soundcloud',
  },
  {
    id: 'stackoverflow',
    name: 'zach-kelling',
    subtitle: 'Stack Overflow',
    avatar: '📚',
    color: 'from-orange-400 to-orange-600',
    platform: 'stackoverflow',
  },
];

const getIconForPlatform = (platform: string) => {
  switch (platform) {
    case 'github': return <Github className="w-4 h-4" />;
    case 'twitter': return <Twitter className="w-4 h-4" />;
    case 'linkedin': return <Linkedin className="w-4 h-4" />;
    case 'instagram': return <Instagram className="w-4 h-4" />;
    case 'youtube': return <Youtube className="w-4 h-4" />;
    case 'spotify': return <Music className="w-4 h-4" />;
    case 'soundcloud': return <Radio className="w-4 h-4" />;
    case 'stackoverflow': return <Code2 className="w-4 h-4" />;
    case 'sora': return <SoraIcon className="w-4 h-4" />;
    default: return <Globe className="w-4 h-4" />;
  }
};

const ZSocialsWindow: React.FC<ZSocialsWindowProps> = ({ onClose }) => {
  const [selectedContact, setSelectedContact] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contactIdentities.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentContact = contactIdentities.find(c => c.id === selectedContact);

  return (
    <ZWindow
      title="Contacts"
      onClose={onClose}
      defaultWidth={900}
      defaultHeight={620}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 180, y: 100 }}
    >
      <div className="flex h-full bg-transparent overflow-hidden">
        {/* Sidebar - Contact List */}
        <div className="w-64 border-r border-white/10 flex flex-col bg-black/20">
          {/* Search Bar */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
              />
            </div>
          </div>

          {/* All Contacts Header */}
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">All Contacts</span>
              <span className="text-white/40 text-xs">{contactIdentities.length}</span>
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors outline-none',
                  selectedContact === contact.id
                    ? 'bg-blue-500/30'
                    : 'hover:bg-white/5'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-br',
                  contact.color
                )}>
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    contact.isPrimary ? 'text-white' : 'text-white/90'
                  )}>
                    {contact.name}
                  </p>
                  <p className="text-white/50 text-xs truncate">{contact.subtitle}</p>
                </div>
                {contact.isPrimary && (
                  <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Add Contact Button */}
          <div className="p-3 border-t border-white/10">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white text-sm transition-colors outline-none">
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        {/* Main Content - Contact Details */}
        <div className="flex-1 overflow-y-auto">
          {currentContact?.id === 'main' ? (
            // Main Profile View
            <div className="p-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-lg shadow-purple-500/30">
                  ZK
                </div>
                <h1 className="text-white text-2xl font-semibold">{professionalInfo.fullName}</h1>
                <p className="text-white/60">{professionalInfo.title}</p>
                <p className="text-white/40 text-sm mt-1">{professionalInfo.tagline}</p>
              </div>

              {/* Contact Actions */}
              <div className="flex justify-center gap-3 mb-6">
                <a
                  href={`mailto:${professionalInfo.email}`}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-white/60 text-xs">email</span>
                </a>
                <a
                  href={professionalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Globe className="w-5 h-5 text-green-400" />
                  <span className="text-white/60 text-xs">website</span>
                </a>
                <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors outline-none">
                  <Share2 className="w-5 h-5 text-orange-400" />
                  <span className="text-white/60 text-xs">share</span>
                </button>
              </div>

              {/* Contact Info Sections */}
              <div className="space-y-4">
                {/* Work */}
                <div className="rounded-xl bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Work</h3>
                  </div>
                  {professionalInfo.roles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{role.title} at {role.company}</p>
                        <p className="text-white/50 text-xs">{role.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="rounded-xl bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Contact</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Mail className="w-4 h-4 text-white/40" />
                      <div>
                        <p className="text-white/40 text-xs">email</p>
                        <a href={`mailto:${professionalInfo.email}`} className="text-blue-400 text-sm hover:underline">
                          {professionalInfo.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Globe className="w-4 h-4 text-white/40" />
                      <div>
                        <p className="text-white/40 text-xs">website</p>
                        <a href={professionalInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">
                          {professionalInfo.website}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <MapPin className="w-4 h-4 text-white/40" />
                      <div>
                        <p className="text-white/40 text-xs">location</p>
                        <p className="text-white text-sm">{professionalInfo.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Accounts - All Identities */}
                <div className="rounded-xl bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Social Accounts</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {Object.entries(socialProfiles).map(([key, profile]) => (
                      <a
                        key={key}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: profile.color }}
                        >
                          {getIconForPlatform(key)}
                        </div>
                        <div className="flex-1">
                          <p className="text-white/40 text-xs">{profile.platform}</p>
                          <p className="text-blue-400 text-sm">@{profile.handle}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="rounded-xl bg-white/5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/10">
                    <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Notes</h3>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-white/70 text-sm leading-relaxed">{professionalInfo.bio}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Individual Platform View
            <div className="p-6">
              {currentContact && (
                <>
                  {/* Profile Header for Platform */}
                  <div className="text-center mb-6">
                    <div className={cn(
                      'w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg bg-gradient-to-br',
                      currentContact.color
                    )}>
                      {currentContact.avatar}
                    </div>
                    <h1 className="text-white text-xl font-semibold">{currentContact.name}</h1>
                    <p className="text-white/60">{currentContact.subtitle}</p>
                  </div>

                  {/* Platform Profile Link */}
                  {currentContact.platform && socialProfiles[currentContact.platform] && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-white/5 overflow-hidden">
                        <div className="px-4 py-2 border-b border-white/10">
                          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Profile</h3>
                        </div>
                        <a
                          href={socialProfiles[currentContact.platform].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-4 hover:bg-white/5 transition-colors group"
                        >
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                            style={{ backgroundColor: socialProfiles[currentContact.platform].color }}
                          >
                            {getIconForPlatform(currentContact.platform)}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{socialProfiles[currentContact.platform].platform}</p>
                            <p className="text-blue-400 text-sm">{socialProfiles[currentContact.platform].url}</p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
                        </a>
                      </div>

                      {/* Open Profile Button */}
                      <a
                        href={socialProfiles[currentContact.platform].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium transition-colors bg-gradient-to-r hover:opacity-90"
                        style={{ 
                          background: `linear-gradient(to right, ${socialProfiles[currentContact.platform].color}, ${socialProfiles[currentContact.platform].color})` 
                        }}
                      >
                        {getIconForPlatform(currentContact.platform)}
                        <span>Open {socialProfiles[currentContact.platform].platform}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Connected Accounts */}
                      <div className="rounded-xl bg-white/5 overflow-hidden">
                        <div className="px-4 py-2 border-b border-white/10">
                          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider">Same Person On</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {Object.entries(socialProfiles)
                            .filter(([key]) => key !== currentContact.platform)
                            .slice(0, 4)
                            .map(([key, profile]) => (
                              <a
                                key={key}
                                href={profile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                              >
                                <div 
                                  className="w-6 h-6 rounded flex items-center justify-center text-white"
                                  style={{ backgroundColor: profile.color }}
                                >
                                  {getIconForPlatform(key)}
                                </div>
                                <span className="text-white/70 text-sm flex-1">@{profile.handle}</span>
                                <span className="text-white/40 text-xs">{profile.platform}</span>
                              </a>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZSocialsWindow;
