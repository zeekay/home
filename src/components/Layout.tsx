
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';

interface LayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeSection, 
  setActiveSection 
}) => {
  return (
    <div className="layout-container">
      <AnimatedBackground />
      
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <main className="main-content">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
