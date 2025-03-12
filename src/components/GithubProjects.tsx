
import React, { useState, useEffect } from 'react';
import { Github, Code, Search } from 'lucide-react';
import ProjectCard, { ProjectProps } from './ProjectCard';
import { cn } from '@/lib/utils';

interface GithubProjectsProps {
  className?: string;
}

// Mock data for GitHub projects
const mockProjects: ProjectProps[] = [
  {
    name: 'executive-order',
    description: 'Reactive order execution. Execute orders reactively with observable sequences.',
    language: 'TypeScript',
    stars: 24,
    forks: 3,
    url: 'https://github.com/zeekay/executive-order'
  },
  {
    name: 'handlebars',
    description: 'Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.',
    language: 'JavaScript',
    stars: 16700,
    forks: 1810,
    url: 'https://github.com/zeekay/handlebars.js'
  },
  {
    name: 'vim-cake',
    description: 'Vim plugin for CoffeeScript and CakeFile.',
    language: 'Vim',
    stars: 11,
    forks: 1,
    url: 'https://github.com/zeekay/vim-cake'
  },
  {
    name: 'dot-files',
    description: 'Personal dotfiles collection.',
    language: 'Shell',
    stars: 5,
    forks: 0,
    url: 'https://github.com/zeekay/dot-files'
  },
  {
    name: 'vice',
    description: 'Meta Vim configuration framework.',
    language: 'Vim',
    stars: 119,
    forks: 12,
    url: 'https://github.com/zeekay/vice'
  },
  {
    name: 'elliptical',
    description: 'Elliptical is a library for building powerful, adaptable and natural language interfaces.',
    language: 'TypeScript',
    stars: 221,
    forks: 26,
    url: 'https://github.com/zeekay/elliptical'
  },
  {
    name: 'grader',
    description: 'Utility for grading programming projects and assignments.',
    language: 'JavaScript',
    stars: 12,
    forks: 3,
    url: 'https://github.com/zeekay/grader'
  },
  {
    name: 'ko',
    description: 'Interactive Makefile replacement / task-runner.',
    language: 'Go',
    stars: 68,
    forks: 5,
    url: 'https://github.com/zeekay/ko'
  }
];

const GithubProjects: React.FC<GithubProjectsProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);

  useEffect(() => {
    const filtered = mockProjects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchQuery]);

  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>
      <div className="bg-accent/50 dark:bg-accent/30 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Github className="mr-2" size={18} />
          <h2 className="text-lg font-medium">GitHub Projects</h2>
          <span className="ml-2 text-xs py-0.5 px-2 bg-primary text-primary-foreground rounded-full">
            @zeekay
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="py-1 px-3 pr-8 text-sm rounded-md border border-border bg-background/50 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search size={14} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      
      <div className="p-4 h-[500px] overflow-y-auto scrollbar-thin">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Code size={40} className="mb-4 opacity-40" />
            <p>No projects found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GithubProjects;
