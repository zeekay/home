
import React from 'react';
import { Github, Twitter, Terminal as TerminalIcon, User, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  return (
    <section 
      className={cn(
        'transition-all duration-500 ease-in-out max-w-5xl mx-auto',
        activeSection === 'profile' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
      )}
    >
      <div className="relative glass-card rounded-xl p-8 mb-10 animate-slide-in overflow-hidden">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 z-0"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="w-36 h-36 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center overflow-hidden animate-float border-2 border-primary/20 shadow-lg">
            <User size={72} className="text-primary/70" />
          </div>
          
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" style={{ animationDelay: '100ms' }}>
              Zach Kelling
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-slide-up max-w-2xl" style={{ animationDelay: '200ms' }}>
              Software Engineer & Open Source Contributor
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <a
                href="https://github.com/zeekay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a
                href="https://twitter.com/zeekay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 transition-colors"
              >
                <Twitter size={18} />
                <span>Twitter</span>
              </a>
              <button
                onClick={() => setActiveSection('terminal')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <TerminalIcon size={18} />
                <span>Terminal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-xl p-6 mb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          I'm a passionate software engineer with expertise in building elegant, efficient solutions. My work spans from developing open-source libraries to creating developer tools that enhance productivity and code quality.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          With a focus on JavaScript, TypeScript, and Vim, I strive to create software that strikes the perfect balance between simplicity and functionality. I'm a contributor to several popular open-source projects and maintain a collection of my own tools.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="glass-card rounded-xl p-6 animate-slide-left" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center mb-4">
            <Code size={24} className="mr-3 text-primary" />
            <h2 className="text-xl font-semibold">Skills & Expertise</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> JavaScript & TypeScript
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> Node.js & Modern Frontend Frameworks
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> Vim & Developer Tooling
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> API Design & Development
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> Open Source Contribution
            </li>
          </ul>
        </div>
        
        <div className="glass-card rounded-xl p-6 animate-slide-right" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center mb-4">
            <Code size={24} className="mr-3 text-primary" />
            <h2 className="text-xl font-semibold">Notable Projects</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> <span className="font-medium">executive-order:</span> Reactive order execution
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> <span className="font-medium">vice:</span> Meta Vim configuration framework
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> <span className="font-medium">elliptical:</span> Natural language interface library
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> <span className="font-medium">ko:</span> Interactive Makefile replacement
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-primary">•</span> <span className="font-medium">Handlebars.js contributor</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
