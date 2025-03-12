
import React from 'react';
import { ExternalLink, Star, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProjectProps {
  name: string;
  description: string;
  language?: string;
  stars?: number;
  forks?: number;
  url: string;
}

const LanguageColors: Record<string, string> = {
  JavaScript: 'bg-yellow-300',
  TypeScript: 'bg-blue-500',
  Python: 'bg-blue-600',
  Java: 'bg-orange-600',
  Go: 'bg-blue-400',
  Rust: 'bg-orange-700',
  Ruby: 'bg-red-600',
  C: 'bg-gray-500',
  'C++': 'bg-pink-600',
  'C#': 'bg-green-600',
  PHP: 'bg-purple-500',
  Shell: 'bg-green-500',
  CSS: 'bg-purple-600',
  HTML: 'bg-red-500',
  Dart: 'bg-blue-500',
  Kotlin: 'bg-purple-400',
  Swift: 'bg-orange-500',
  default: 'bg-gray-400'
};

const ProjectCard: React.FC<ProjectProps> = ({
  name,
  description,
  language,
  stars = 0,
  forks = 0,
  url
}) => {
  const languageColorClass = language && LanguageColors[language] ? LanguageColors[language] : LanguageColors.default;

  return (
    <div className="glass-card glass-card-hover rounded-lg p-4 flex flex-col transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium truncate flex-1">{name}</h3>
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Visit ${name} repository`}
        >
          <ExternalLink size={16} />
        </a>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
        {description || 'No description available'}
      </p>
      
      <div className="flex items-center text-xs text-muted-foreground mt-auto">
        {language && (
          <div className="flex items-center mr-4">
            <span className={cn("inline-block w-2.5 h-2.5 rounded-full mr-1.5", languageColorClass)} />
            <span>{language}</span>
          </div>
        )}
        
        {stars > 0 && (
          <div className="flex items-center mr-4">
            <Star size={14} className="mr-1" />
            <span>{stars}</span>
          </div>
        )}
        
        {forks > 0 && (
          <div className="flex items-center">
            <GitFork size={14} className="mr-1" />
            <span>{forks}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
