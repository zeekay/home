
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer w-full py-6 bg-accent/30 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Zach Kelling. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
