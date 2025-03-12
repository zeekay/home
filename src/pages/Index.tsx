
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

  // Scroll to top when active section changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  // Prevent overscrolling by ensuring content doesn't scroll past footer
  useEffect(() => {
    const pageContainer = document.querySelector('.page-container');
    
    if (pageContainer) {
      const handleScroll = () => {
        const scrollHeight = pageContainer.scrollHeight;
        const scrollTop = pageContainer.scrollTop;
        const clientHeight = pageContainer.clientHeight;
        
        // If scrolled to the bottom, prevent further scrolling
        if (scrollTop + clientHeight >= scrollHeight) {
          pageContainer.scrollTop = scrollHeight - clientHeight;
        }
      };
      
      pageContainer.addEventListener('scroll', handleScroll);
      return () => pageContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="page-container">
      <AnimatedBackground />
      
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="content-container">
        <div className="container mx-auto px-4 py-16">
          <ProfileSection activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <div className={activeSection !== 'profile' ? 'mt-24' : ''}>
            <TerminalSection activeSection={activeSection} />
            <GitHubSection activeSection={activeSection} />
            <TwitterSection activeSection={activeSection} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
