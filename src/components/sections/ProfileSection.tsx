import React, { useEffect, useState } from 'react';
import { Github, Twitter, Terminal as TerminalIcon, Code, GitCommit, BarChart3, Flame, ExternalLink, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { formatNumber } from '@/types/stats';

interface ProfileSectionProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  activeSection,
  setActiveSection
}) => {
  const [scrolled, setScrolled] = useState(false);
  const { stats } = useGitHubStats();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className={cn(
        'transition-all duration-500 ease-in-out max-w-5xl mx-auto',
        activeSection === 'profile' ? 'opacity-100 translate-y-0' : 'opacity-0 absolute -z-10 translate-y-8'
      )}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh] mb-16">
        {/* Avatar */}
        <div className="relative mb-8 group">
          <div className="w-48 h-48 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center overflow-hidden animate-float border-4 border-white/20 shadow-2xl shadow-purple-500/20">
            <span className="text-7xl font-bold text-white/90">Z</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
        </div>

        {/* Name & Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-slide-up bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 text-center" style={{ animationDelay: '100ms' }}>
          Zach Kelling
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 animate-slide-up max-w-2xl text-center mt-4" style={{ animationDelay: '200ms' }}>
          Founder @ <span className="text-purple-400">Hanzo AI</span> • Building Frontier AI
        </p>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">AI/ML</span>
          <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Blockchain</span>
          <span className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded-full border border-green-500/30">Open Source</span>
          <span className="px-3 py-1 text-sm bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">Techstars '17</span>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <a
            href="https://github.com/zeekay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all hover:scale-105"
          >
            <Github size={18} />
            <span className="font-medium">GitHub</span>
          </a>
          <a
            href="https://twitter.com/zeekay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90 transition-all hover:scale-105"
          >
            <Twitter size={18} />
            <span className="font-medium">Twitter</span>
          </a>
          <a
            href="https://linkedin.com/in/zachkelling"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 transition-all hover:scale-105"
          >
            <Linkedin size={18} />
            <span className="font-medium">LinkedIn</span>
          </a>
          <button
            onClick={() => setActiveSection('terminal')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 text-green-400 hover:bg-gray-700 transition-all hover:scale-105 border border-green-500/30"
          >
            <TerminalIcon size={18} />
            <span className="font-medium">Terminal</span>
          </button>
        </div>
      </div>

      {/* Stats Section - appears on scroll */}
      <div className={cn(
        "transition-all duration-700 ease-in-out",
        scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      )}>
        {/* GitHub Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-slide-in">
            <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                  <GitCommit size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatNumber(stats.totalCommits)}</div>
              <div className="text-sm text-gray-400">Total Commits</div>
            </div>

            <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                  <BarChart3 size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.repos}</div>
              <div className="text-sm text-gray-400">Repositories</div>
            </div>

            <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                  <Code size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{formatNumber(stats.netLoc)}</div>
              <div className="text-sm text-gray-400">Lines of Code</div>
            </div>

            <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30 transition-colors">
                  <Flame size={24} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.yearsCoding}</div>
              <div className="text-sm text-gray-400">Years Coding</div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="glass-card rounded-xl p-8 mb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            About Me
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            I'm the founder of <a href="https://hanzo.ai" className="text-purple-400 hover:underline">Hanzo AI</a>, 
            where we're building frontier AI models and infrastructure. With over 15 years of software engineering 
            experience, I've contributed to major open-source projects like <span className="text-white font-medium">Handlebars.js</span>, 
            built multiple startups, and developed everything from developer tools to blockchain infrastructure.
          </p>
          <p className="text-gray-300 leading-relaxed">
            My expertise spans AI/ML, distributed systems, cryptography, and full-stack development. 
            I'm passionate about building tools that make developers more productive and pushing the 
            boundaries of what's possible with technology. <span className="text-orange-400">Techstars '17 alum</span>.
          </p>
        </div>

        {/* Top Projects */}
        {stats && (
          <div className="glass-card rounded-xl p-6 mb-10 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github size={20} className="text-purple-400" />
                Top Projects
              </div>
              <a
                href="https://github.com/zeekay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                View all <ExternalLink size={14} />
              </a>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.topRepos.slice(0, 6).map((repo, idx) => (
                <a
                  key={repo.repo}
                  href={`https://github.com/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-white group-hover:text-purple-400 transition-colors">
                      {repo.repo.split('/')[1] || repo.repo}
                    </div>
                    <div className="text-xs text-gray-500">{repo.repo.split('/')[0]}</div>
                  </div>
                  <div className="text-sm text-gray-400">{formatNumber(repo.commits)}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="glass-card rounded-xl p-6 animate-slide-left" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center mb-4">
              <Code size={24} className="mr-3 text-purple-400" />
              <h2 className="text-xl font-semibold">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['TypeScript', 'Python', 'Go', 'Rust', 'React', 'Node.js', 'PyTorch', 'Kubernetes', 'PostgreSQL', 'Redis'].map((skill) => (
                <span key={skill} className="px-3 py-1.5 text-sm bg-white/10 text-gray-300 rounded-lg border border-white/10">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 animate-slide-right" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center mb-4">
              <Flame size={24} className="mr-3 text-orange-400" />
              <h2 className="text-xl font-semibold">Focus Areas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['AI/ML', 'LLMs', 'Blockchain', 'Distributed Systems', 'DevTools', 'Infrastructure', 'Cryptography', 'Web3'].map((area) => (
                <span key={area} className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-gray-300 rounded-lg border border-purple-500/20">
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
