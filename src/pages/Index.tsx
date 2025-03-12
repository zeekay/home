
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AnimatedBackground from '@/components/AnimatedBackground';
import ProfileSection from '@/components/sections/ProfileSection';
import TerminalSection from '@/components/sections/TerminalSection';
import GitHubSection from '@/components/sections/GitHubSection';
import TwitterSection from '@/components/sections/TwitterSection';
import Footer from '@/components/Footer';
import { User, Code } from 'lucide-react';

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
        <ProfileSection activeSection={activeSection} setActiveSection={setActiveSection} />
        <TerminalSection activeSection={activeSection} />
        <GitHubSection activeSection={activeSection} />
        <TwitterSection activeSection={activeSection} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
