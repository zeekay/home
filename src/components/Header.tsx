
import React, { useState, useEffect } from 'react';
import { Github, Twitter, Terminal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 flex items-center justify-between',
        scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50' : 'bg-transparent'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="font-medium">Zach Kelling - Open Sourceror</div>
      </div>
      <nav className="flex items-center gap-6">
        <button
          onClick={() => handleSectionClick('profile')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeSection === 'profile'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          Profile
        </button>
        <button
          onClick={() => handleSectionClick('terminal')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeSection === 'terminal'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          <Terminal size={16} />
          Terminal
        </button>
        <button
          onClick={() => handleSectionClick('github')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeSection === 'github'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          <Github size={16} />
          GitHub
        </button>
        <button
          onClick={() => handleSectionClick('twitter')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeSection === 'twitter'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          <Twitter size={16} />
          X / Twitter
        </button>
      </nav>
      <div className="w-24 opacity-0">Spacer</div>
    </header>
  );
};

export default Header;
