
import React, { useState, useEffect } from 'react';
import ProfileSection from '@/components/sections/ProfileSection';
import TerminalSection from '@/components/sections/TerminalSection';
import GitHubSection from '@/components/sections/GitHubSection';
import TwitterSection from '@/components/sections/TwitterSection';
import { Menu, X, Settings, User, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="h-full w-full overflow-auto relative">
      {/* Fixed top navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleMenu}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="font-medium text-sm">Zach Kelling</span>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <Settings size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/90 border border-white/10 text-white">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-white/10 text-white">ZK</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Sidebar navigation */}
      <div className={`fixed left-0 top-[53px] bottom-0 w-64 bg-black/80 backdrop-blur-md border-r border-white/10 transition-transform z-40 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-white/10 text-xl">ZK</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-medium">Zach Kelling</h2>
            <p className="text-sm text-gray-400">Open Sourceror</p>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveSection('profile');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 rounded-md text-sm ${activeSection === 'profile' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <User size={16} className="mr-3" />
              Profile
            </button>
            <button
              onClick={() => {
                setActiveSection('terminal');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 rounded-md text-sm ${activeSection === 'terminal' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <User size={16} className="mr-3" />
              Terminal
            </button>
            <button
              onClick={() => {
                setActiveSection('github');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 rounded-md text-sm ${activeSection === 'github' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <Github size={16} className="mr-3" />
              GitHub
            </button>
            <button
              onClick={() => {
                setActiveSection('twitter');
                setMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-2 rounded-md text-sm ${activeSection === 'twitter' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <Twitter size={16} className="mr-3" />
              Twitter
            </button>
          </nav>
          
          <div className="mt-auto">
            <div className="flex items-center justify-center space-x-4 py-4">
              <a href="https://github.com/zeekay" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Github size={18} />
              </a>
              <a href="https://twitter.com/zeekay" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com/in/zachkelling" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Linkedin size={18} />
              </a>
              <a href="mailto:zach@kelling.dev" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-16 p-6">
        <ProfileSection 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        <div className={activeSection !== 'profile' ? 'mt-24' : ''}>
          <TerminalSection activeSection={activeSection} />
          <GitHubSection activeSection={activeSection} />
          <TwitterSection activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default Index;
