
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProfileSection from '@/components/sections/ProfileSection';
import TerminalSection from '@/components/sections/TerminalSection';
import GitHubSection from '@/components/sections/GitHubSection';
import TwitterSection from '@/components/sections/TwitterSection';

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

  return (
    <Layout
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      <ProfileSection 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div className={activeSection !== 'profile' ? 'mt-24' : ''}>
        <TerminalSection activeSection={activeSection} />
        <GitHubSection activeSection={activeSection} />
        <TwitterSection activeSection={activeSection} />
      </div>
    </Layout>
  );
};

export default Index;
