import React from 'react';
import { Mail, MapPin, Calendar, Link2, Github, Twitter, Linkedin, Code, GitCommit, BarChart3, Flame } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { formatNumber } from '@/types/stats';

const ProfileTab: React.FC = () => {
  const { stats } = useGitHubStats();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Profile</h2>

      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
            Z
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <a
              href="https://github.com/zeekay"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com/zeekay"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/zachkelling"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Zach Kelling</h2>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">Online</span>
            </div>

            <p className="text-gray-600 dark:text-gray-400">
              Founder @ Hanzo AI • Building frontier AI infrastructure
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-1 rounded-full">AI/ML</span>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full">Blockchain</span>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">Open Source</span>
              <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 px-2 py-1 rounded-full">TypeScript</span>
              <span className="text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300 px-2 py-1 rounded-full">Go</span>
              <span className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300 px-2 py-1 rounded-full">Rust</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>zach@hanzo.ai</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>San Francisco, CA</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Coding since {stats?.firstCommit ? new Date(stats.firstCommit).getFullYear() : '2010'}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <a href="https://hanzo.ai" className="text-blue-500 hover:underline">hanzo.ai</a>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* GitHub Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700/50">
            <div className="flex items-center gap-2 mb-1">
              <GitCommit className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600 dark:text-purple-400">Commits</span>
            </div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{formatNumber(stats.totalCommits)}</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400">Repos</span>
            </div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{stats.repos}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400">Lines of Code</span>
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">{formatNumber(stats.netLoc)}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-600 dark:text-orange-400">Years Coding</span>
            </div>
            <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{stats.yearsCoding}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">About</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Founder of Hanzo AI, building frontier AI models and infrastructure. Previously built multiple
          startups, contributed to open-source projects like Handlebars.js, and spent over a decade
          crafting developer tools, AI systems, and blockchain infrastructure.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Passionate about distributed systems, cryptography, quantum computing, and the intersection
          of AI and decentralized technology. Techstars '17 alum.
        </p>
      </div>

      {/* Top Projects */}
      {stats && (
        <div className="space-y-3">
          <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Top Projects</h3>
          <div className="grid grid-cols-2 gap-2">
            {stats.topRepos.slice(0, 6).map((repo) => (
              <a
                key={repo.repo}
                href={`https://github.com/${repo.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-sm"
              >
                <span className="truncate text-gray-700 dark:text-gray-300">
                  {repo.repo.split('/')[1] || repo.repo}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatNumber(repo.commits)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
