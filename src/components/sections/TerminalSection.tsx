
import React from 'react';
import Terminal from '@/components/Terminal';
import { cn } from '@/lib/utils';

interface TerminalSectionProps {
  activeSection: string;
}

const TerminalSection: React.FC<TerminalSectionProps> = ({ activeSection }) => {
  return (
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
  );
};

export default TerminalSection;
