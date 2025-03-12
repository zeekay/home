
import React, { useState, useEffect } from 'react';
import { Github, Code, Search, Filter } from 'lucide-react';
import ProjectCard, { ProjectProps } from './ProjectCard';
import { cn } from '@/lib/utils';

interface GithubProjectsProps {
  className?: string;
}

// Enhanced mock data for GitHub projects with more detail
const mockProjects: ProjectProps[] = [
  {
    name: 'executive-order',
    description: 'Reactive order execution. Execute orders reactively with observable sequences.',
    language: 'TypeScript',
    stars: 24,
    forks: 3,
    url: 'https://github.com/zeekay/executive-order',
    updatedAt: '2023-11-10T12:00:00Z',
    readme: '# executive-order\nReactive order execution. This library allows you to execute orders reactively with observable sequences...'
  },
  {
    name: 'handlebars',
    description: 'Handlebars provides the power necessary to let you build semantic templates effectively with no frustration.',
    language: 'JavaScript',
    stars: 16700,
    forks: 1810,
    url: 'https://github.com/zeekay/handlebars.js',
    updatedAt: '2023-12-15T09:30:00Z',
    readme: '# handlebars.js\nMinimal templating on steroids. Handlebars provides the power necessary to let you build semantic templates effectively with no frustration...'
  },
  {
    name: 'vim-cake',
    description: 'Vim plugin for CoffeeScript and CakeFile.',
    language: 'Vim',
    stars: 11,
    forks: 1,
    url: 'https://github.com/zeekay/vim-cake',
    updatedAt: '2023-08-22T16:45:00Z',
    readme: '# vim-cake\nVim plugin for CoffeeScript and CakeFile. This plugin provides syntax highlighting and indentation support...'
  },
  {
    name: 'dot-files',
    description: 'Personal dotfiles collection.',
    language: 'Shell',
    stars: 5,
    forks: 0,
    url: 'https://github.com/zeekay/dot-files',
    updatedAt: '2023-10-05T14:20:00Z',
    readme: '# dot-files\nMy personal dotfiles collection. Sets up zsh, vim, and various other utilities with sane defaults...'
  },
  {
    name: 'vice',
    description: 'Meta Vim configuration framework.',
    language: 'Vim',
    stars: 119,
    forks: 12,
    url: 'https://github.com/zeekay/vice',
    updatedAt: '2024-01-02T10:15:00Z',
    readme: '# vice\nMeta Vim configuration framework. Vice is a meta plugin manager for Vim, designed to manage plugins and configurations in a modular way...'
  },
  {
    name: 'elliptical',
    description: 'Elliptical is a library for building powerful, adaptable and natural language interfaces.',
    language: 'TypeScript',
    stars: 221,
    forks: 26,
    url: 'https://github.com/zeekay/elliptical',
    updatedAt: '2023-12-28T08:10:00Z',
    readme: '# elliptical\nElliptical is a library for building powerful, adaptable and natural language interfaces. It provides a framework for parsing and understanding natural language...'
  },
  {
    name: 'grader',
    description: 'Utility for grading programming projects and assignments.',
    language: 'JavaScript',
    stars: 12,
    forks: 3,
    url: 'https://github.com/zeekay/grader',
    updatedAt: '2023-07-18T11:30:00Z',
    readme: '# grader\nUtility for grading programming projects and assignments. Easily evaluate student code submissions with customizable rubrics...'
  },
  {
    name: 'ko',
    description: 'Interactive Makefile replacement / task-runner.',
    language: 'Go',
    stars: 68,
    forks: 5,
    url: 'https://github.com/zeekay/ko',
    updatedAt: '2024-01-10T15:25:00Z',
    readme: '# ko\nInteractive Makefile replacement / task-runner. Ko provides a more user-friendly and interactive alternative to Make, with a focus on developer experience...'
  }
];

const GithubProjects: React.FC<GithubProjectsProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'name'>('stars');
  const [filteredProjects, setFilteredProjects] = useState(mockProjects);

  useEffect(() => {
    // Filter projects based on search query
    let filtered = mockProjects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.readme?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Sort filtered projects
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      } else if (sortBy === 'updated') {
        return new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredProjects(filtered);
  }, [searchQuery, sortBy]);

  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>
      <div className="bg-accent/50 dark:bg-accent/30 p-4 border-b border-border flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center">
          <Github className="mr-2" size={18} />
          <h2 className="text-lg font-medium">GitHub Projects</h2>
          <span className="ml-2 text-xs py-0.5 px-2 bg-primary text-primary-foreground rounded-full">
            @zeekay
          </span>
        </div>
        
        <div className="flex flex-1 items-center gap-2 ml-0 md:ml-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, code, and READMEs..."
              className="w-full py-1.5 px-3 pr-8 text-sm rounded-md border border-border bg-background/50 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search size={14} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background/50 border border-border rounded py-1 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="stars">Most Stars</option>
              <option value="updated">Recently Updated</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-4 h-[600px] overflow-y-auto scrollbar-thin">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
