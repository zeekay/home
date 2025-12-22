import React, { useEffect, useState } from 'react';
import { Github, Twitter, Terminal as TerminalIcon, Code, GitCommit, BarChart3, Flame, ExternalLink, Linkedin, Star, Users, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { formatNumber } from '@/types/stats';
import { professionalInfo, socialProfiles, pinnedProjects, githubStats, hanzoModels, techStack, interests } from '@/data/socials';

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
          {professionalInfo.name}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 animate-slide-up max-w-2xl text-center mt-3" style={{ animationDelay: '150ms' }}>
          {professionalInfo.title} • {professionalInfo.tagline}
        </p>

        {/* Roles */}
        <div className="flex flex-wrap justify-center gap-3 mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {professionalInfo.roles.map((role, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-xl">{role.icon}</span>
              <div className="text-left">
                <div className="text-sm font-medium text-white">{role.title} @ {role.company}</div>
                <div className="text-xs text-gray-500">{role.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">Frontier AI</span>
          <span className="px-3 py-1 text-sm bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">Quantum-Safe</span>
          <span className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded-full border border-green-500/30">Open Source</span>
          <span className="px-3 py-1 text-sm bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">Techstars '17</span>
          <span className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">Cypherpunk</span>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <a
            href={socialProfiles.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-all hover:scale-105"
          >
            <Github size={18} />
            <span className="font-medium">GitHub</span>
          </a>
          <a
            href={socialProfiles.twitter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:bg-gray-900 transition-all hover:scale-105 border border-white/20"
          >
            <Twitter size={18} />
            <span className="font-medium">X</span>
          </a>
          <a
            href={socialProfiles.linkedin.url}
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

        {/* Chat command */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <code className="px-4 py-2 bg-black/50 border border-green-500/30 rounded-lg text-green-400 text-sm font-mono">
            {professionalInfo.chat}
          </code>
        </div>
      </div>

      {/* Stats Section - appears on scroll */}
      <div className={cn(
        "transition-all duration-700 ease-in-out",
        scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      )}>
        {/* GitHub Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-slide-in">
          <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 transition-colors">
                <GitCommit size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(stats?.totalCommits || 37106)}</div>
            <div className="text-sm text-gray-400">Total Commits</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                <BarChart3 size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{githubStats.repos}</div>
            <div className="text-sm text-gray-400">Repositories</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30 transition-colors">
                <Star size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(githubStats.stars)}</div>
            <div className="text-sm text-gray-400">Stars Earned</div>
          </div>

          <div className="glass-card rounded-xl p-6 text-center group hover:scale-105 transition-transform">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                <Users size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{githubStats.followers}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
        </div>

        {/* About Section */}
        <div className="glass-card rounded-xl p-8 mb-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            About
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            {professionalInfo.bio}
          </p>
          <p className="text-gray-300 leading-relaxed">
            With {stats?.yearsCoding || 15}+ years building software, I've contributed to projects like{' '}
            <span className="text-white font-medium">Handlebars.js</span>,{' '}
            created <a href="https://github.com/ellipsis/ellipsis" className="text-purple-400 hover:underline">Ellipsis</a> (dotfiles manager),
            and <a href="https://github.com/shopjs/shop.js" className="text-blue-400 hover:underline">Shop.js</a> (ecommerce framework).
            Now focused on building the future of AI at{' '}
            <a href="https://hanzo.ai" className="text-pink-400 hover:underline">Hanzo AI</a>.
          </p>
        </div>

        {/* Hanzo AI Models */}
        <div className="glass-card rounded-xl p-6 mb-10 animate-slide-up" style={{ animationDelay: '450ms' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bot size={20} className="text-purple-400" />
            Hanzo AI Models
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {hanzoModels.map((model, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center hover:border-purple-500/40 transition-colors"
              >
                <span className="text-2xl">{model.icon}</span>
                <div className="font-medium text-white mt-2">{model.name}</div>
                <div className="text-xs text-gray-500">{model.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Projects */}
        <div className="glass-card rounded-xl p-6 mb-10 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github size={20} className="text-purple-400" />
              Pinned Projects
            </div>
            <a
              href={socialProfiles.github.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              View all <ExternalLink size={14} />
            </a>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedProjects.map((project, idx) => (
              <a
                key={idx}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group border border-white/5 hover:border-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Github size={16} className="text-gray-500" />
                  <span className="font-medium text-white group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      project.language === 'TypeScript' ? 'bg-blue-500' :
                      project.language === 'Python' ? 'bg-yellow-500' :
                      project.language === 'Go' ? 'bg-cyan-500' :
                      project.language === 'Shell' ? 'bg-green-500' :
                      project.language === 'HTML' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    {project.language}
                  </span>
                  {project.stars > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} /> {project.stars}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="glass-card rounded-xl p-6 animate-slide-left" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center mb-4">
              <Code size={24} className="mr-3 text-purple-400" />
              <h2 className="text-xl font-semibold">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {techStack.map((skill) => (
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
              {interests.map((area) => (
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
