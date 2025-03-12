
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import ProfileSection from '@/components/sections/ProfileSection';
import TerminalSection from '@/components/sections/TerminalSection';
import GitHubSection from '@/components/sections/GitHubSection';
import TwitterSection from '@/components/sections/TwitterSection';
import Footer from '@/components/Footer';

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
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 w-full flex flex-col items-center justify-start pt-16">
        <div className="w-full max-w-6xl mx-auto px-4 pb-24">
          <ProfileSection activeSection={activeSection} setActiveSection={setActiveSection} />
          <TerminalSection activeSection={activeSection} />
          <GitHubSection activeSection={activeSection} />
          <TwitterSection activeSection={activeSection} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
