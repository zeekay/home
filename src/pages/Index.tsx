
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Terminal from '@/components/Terminal';
import GithubProjects from '@/components/GithubProjects';
import TwitterFeed from '@/components/TwitterFeed';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Github, Twitter, Code, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationCompleted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="container pt-24 pb-16 px-4 mx-auto">
        {/* Profile Section */}
        <section 
          className={cn(
            'transition-all duration-500 ease-in-out max-w-4xl mx-auto',
            activeSection === 'profile' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
          )}
        >
          <div className="flex flex-col items-center text-center mb-8 animate-slide-in">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/30 rounded-full flex items-center justify-center mb-6 overflow-hidden animate-float">
              <User size={64} className="text-primary/70" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold animate-slide-up" style={{ animationDelay: '100ms' }}>
                Zach Kelling
              </h1>
              <p className="text-xl text-muted-foreground animate-slide-up" style={{ animationDelay: '200ms' }}>
                Software Engineer & Open Source Contributor
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <a
                  href="https://github.com/zeekay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://twitter.com/zeekay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 transition-colors"
                >
                  <Twitter size={16} />
                  <span>Twitter</span>
                </a>
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

        {/* Terminal Section */}
        <section 
          className={cn(
            'transition-all duration-500 ease-in-out max-w-4xl mx-auto',
            activeSection === 'terminal' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
          )}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center animate-slide-down">
            <span className="terminal-text mr-2">$</span> Interactive Terminal
          </h2>
          
          <Terminal className="animate-scale-in" />
          
          <div className="mt-6 text-sm text-muted-foreground animate-fade-in">
            <p>Try commands like <code className="code">ls</code>, <code className="code">cat README.md</code>, <code className="code">vim bio.txt</code>, or <code className="code">help</code> for more options.</p>
          </div>
        </section>

        {/* GitHub Projects Section */}
        <section 
          className={cn(
            'transition-all duration-500 ease-in-out max-w-4xl mx-auto',
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

        {/* Twitter Feed Section */}
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
      </main>
      
      <footer className="w-full py-6 bg-accent/30 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zach Kelling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
