import React, { useState, useEffect, useRef } from 'react';
import MacWindow from './MacWindow';
import { cn } from '@/lib/utils';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Youtube,
  ExternalLink,
  RefreshCw,
  Users,
  Globe,
  Code2
} from 'lucide-react';
import { socialProfiles, professionalInfo } from '@/data/socials';

interface MacSocialsWindowProps {
  onClose: () => void;
}

type TabType = 'twitter' | 'linkedin' | 'instagram' | 'youtube';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
        createTimeline: (
          dataSource: { sourceType: string; screenName?: string },
          element: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    LI?: {
      init: () => void;
    };
  }
}

const MacSocialsWindow: React.FC<MacSocialsWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('twitter');
  const [isLoading, setIsLoading] = useState(true);
  const twitterRef = useRef<HTMLDivElement>(null);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'twitter', label: 'X', icon: <Twitter className="w-4 h-4" />, color: 'bg-black' },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'bg-blue-600' },
    { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400' },
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, color: 'bg-red-600' },
  ];

  // Load Twitter timeline
  useEffect(() => {
    if (activeTab !== 'twitter') return;
    setIsLoading(true);

    const loadTwitter = () => {
      if (!window.twttr) {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = renderTwitter;
        document.body.appendChild(script);
      } else {
        renderTwitter();
      }
    };

    const renderTwitter = () => {
      if (!twitterRef.current || !window.twttr) return;
      twitterRef.current.innerHTML = '';
      
      window.twttr.widgets
        .createTimeline(
          { sourceType: 'profile', screenName: socialProfiles.twitter.handle },
          twitterRef.current,
          {
            theme: 'dark',
            chrome: 'noheader nofooter noborders transparent',
            height: 450,
            dnt: true,
            tweetLimit: 5,
          }
        )
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    };

    loadTwitter();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'twitter') {
      setIsLoading(false);
    }
  }, [activeTab]);

  const SocialCard = ({ profile, icon }: { profile: typeof socialProfiles.twitter; icon: React.ReactNode }) => (
    <a
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: profile.color }}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium">{profile.platform}</h3>
        <p className="text-white/50 text-sm">@{profile.handle}</p>
      </div>
      <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
    </a>
  );

  return (
    <MacWindow
      title="Socials"
      onClose={onClose}
      defaultWidth={800}
      defaultHeight={600}
      minWidth={600}
      minHeight={450}
      defaultPosition={{ x: 220, y: 120 }}
    >
      <div className="flex flex-col h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Social Profiles</h2>
              <p className="text-white/50 text-xs">@{socialProfiles.twitter.handle}</p>
            </div>
          </div>
          
          {/* Tab buttons */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Twitter Tab */}
          {activeTab === 'twitter' && (
            <div className="h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">X / Twitter</h3>
                    <p className="text-white/50 text-sm">@{socialProfiles.twitter.handle}</p>
                  </div>
                </div>
                <a
                  href={socialProfiles.twitter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Follow <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="rounded-xl overflow-hidden bg-black/30 border border-white/10 h-[calc(100%-60px)]">
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <RefreshCw className="w-6 h-6 text-white/50 animate-spin" />
                  </div>
                )}
                <div ref={twitterRef} className={cn('h-full overflow-y-auto', isLoading && 'hidden')} />
              </div>
            </div>
          )}

          {/* LinkedIn Tab */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">LinkedIn</h3>
                    <p className="text-white/50 text-sm">{professionalInfo.name}</p>
                  </div>
                </div>
                <a
                  href={socialProfiles.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#0A66C2] hover:bg-[#0952a0] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Connect <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* LinkedIn Profile Card */}
              <div className="rounded-xl bg-gradient-to-br from-[#0A66C2]/20 to-[#0A66C2]/5 border border-[#0A66C2]/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    ZK
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-xl font-bold">{professionalInfo.name}</h2>
                    <p className="text-white/70">{professionalInfo.title} at {professionalInfo.company}</p>
                    <p className="text-white/50 text-sm mt-1">{professionalInfo.location}</p>
                    
                    <p className="text-white/60 text-sm mt-4 leading-relaxed">
                      {professionalInfo.bio}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <a
                    href={socialProfiles.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-[#0A66C2] hover:bg-[#0952a0] text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    View Profile
                  </a>
                  <a
                    href={`mailto:${professionalInfo.email}`}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Send Email
                  </a>
                </div>
              </div>

              {/* Experience highlights */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Companies & Projects
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      H
                    </div>
                    <div>
                      <p className="text-white font-medium">Hanzo AI</p>
                      <p className="text-white/50 text-xs">Founder & CTO • Techstars '17</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      L
                    </div>
                    <div>
                      <p className="text-white font-medium">Lux Network</p>
                      <p className="text-white/50 text-xs">Blockchain Infrastructure</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      Z
                    </div>
                    <div>
                      <p className="text-white font-medium">Zoo Labs</p>
                      <p className="text-white/50 text-xs">DeAI Research Foundation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Tab */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Instagram</h3>
                    <p className="text-white/50 text-sm">@{socialProfiles.instagram.handle}</p>
                  </div>
                </div>
                <a
                  href={socialProfiles.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-sm font-medium rounded-lg transition-opacity flex items-center gap-2"
                >
                  Follow <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Instagram embed placeholder */}
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-400/10 border border-pink-500/20 p-8 text-center">
                <Instagram className="w-16 h-16 mx-auto mb-4 text-pink-400" />
                <h3 className="text-white text-lg font-medium mb-2">Instagram Feed</h3>
                <p className="text-white/60 text-sm mb-4">
                  View photos, stories, and more on Instagram
                </p>
                <a
                  href={socialProfiles.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Open Instagram <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${socialProfiles.instagram.url}/reels`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center"
                >
                  <p className="text-white font-medium">Reels</p>
                  <p className="text-white/50 text-xs mt-1">Watch short videos</p>
                </a>
                <a
                  href={`${socialProfiles.instagram.url}/tagged`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center"
                >
                  <p className="text-white font-medium">Tagged</p>
                  <p className="text-white/50 text-xs mt-1">Tagged photos</p>
                </a>
              </div>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">YouTube</h3>
                    <p className="text-white/50 text-sm">{socialProfiles.youtube.handle}</p>
                  </div>
                </div>
                <a
                  href={socialProfiles.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  Subscribe <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* YouTube embed placeholder */}
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-8 text-center">
                <Youtube className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <h3 className="text-white text-lg font-medium mb-2">YouTube Channel</h3>
                <p className="text-white/60 text-sm mb-4">
                  Watch videos, tutorials, and tech content
                </p>
                <a
                  href={socialProfiles.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Visit Channel <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer with all social links */}
        <div className="border-t border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {Object.entries(socialProfiles).slice(0, 8).map(([key, profile]) => (
              <a
                key={key}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title={profile.platform}
              >
                {key === 'github' && <Globe className="w-4 h-4 text-white" />}
                {key === 'twitter' && <Twitter className="w-4 h-4 text-white" />}
                {key === 'linkedin' && <Linkedin className="w-4 h-4 text-white" />}
                {key === 'instagram' && <Instagram className="w-4 h-4 text-white" />}
                {key === 'youtube' && <Youtube className="w-4 h-4 text-white" />}
                {key === 'stackoverflow' && <Code2 className="w-4 h-4 text-white" />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </MacWindow>
  );
};

export default MacSocialsWindow;
