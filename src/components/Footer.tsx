
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-accent/30 backdrop-blur-sm border-t border-border mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© 1983-{new Date().getFullYear()} Zach Kelling. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
