import React from 'react';
import { Twitter, ExternalLink } from 'lucide-react';
import TwitterFeed from '@/components/TwitterFeed';
import { cn } from '@/lib/utils';
import { socialProfiles } from '@/data/socials';

interface TwitterSectionProps {
  activeSection: string;
}

const TwitterSection: React.FC<TwitterSectionProps> = ({ activeSection }) => {
  const twitter = socialProfiles.twitter;
  
  return (
    <section
      className={cn(
        'transition-all duration-500 ease-in-out max-w-4xl mx-auto',
        activeSection === 'twitter' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
      )}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center animate-slide-down">
        <Twitter size={24} className="mr-2" /> X / Twitter
      </h2>

      <TwitterFeed className="animate-scale-in" />

      <div className="mt-6 text-center animate-fade-in">
        <a
          href={twitter.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg transition-colors"
        >
          Follow @{twitter.handle} on X
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default TwitterSection;
