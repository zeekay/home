
import React from 'react';
import { Twitter } from 'lucide-react';
import TwitterFeed from '@/components/TwitterFeed';
import { cn } from '@/lib/utils';

interface TwitterSectionProps {
  activeSection: string;
}

const TwitterSection: React.FC<TwitterSectionProps> = ({ activeSection }) => {
  return (
    <section 
      className={cn(
        'transition-all duration-500 ease-in-out max-w-4xl mx-auto',
        activeSection === 'twitter' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
      )}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center animate-slide-down">
        <Twitter size={24} className="mr-2" /> Twitter / X
      </h2>
      
      <TwitterFeed className="animate-scale-in" />
      
      <div className="mt-6 text-center animate-fade-in">
        <a 
          href="https://twitter.com/zeekay"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          Follow @zeekay on Twitter/X
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default TwitterSection;
