
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
    <div className="flex flex-col min-h-screen bg-background text-foreground relative">
      <AnimatedBackground />
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main content container with proper padding */}
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 py-16 mb-16">
          <ProfileSection activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <div className={activeSection !== 'profile' ? 'mt-24' : ''}>
            <TerminalSection activeSection={activeSection} />
            <GitHubSection activeSection={activeSection} />
            <TwitterSection activeSection={activeSection} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
