
import React from 'react';
import { Github } from 'lucide-react';
import GithubProjects from '@/components/GithubProjects';
import { cn } from '@/lib/utils';

interface GitHubSectionProps {
  activeSection: string;
}

const GitHubSection: React.FC<GitHubSectionProps> = ({ activeSection }) => {
  return (
    <section 
      className={cn(
        'transition-all duration-500 ease-in-out max-w-6xl mx-auto',
        activeSection === 'github' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
      )}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center animate-slide-down">
        <Github size={24} className="mr-2" /> GitHub Projects
      </h2>
      
      <GithubProjects className="animate-scale-in" />
      
      <div className="mt-6 text-center animate-fade-in">
        <a 
          href="https://github.com/zeekay"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          View all projects on GitHub
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default GitHubSection;
