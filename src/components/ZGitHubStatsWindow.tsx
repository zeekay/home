import React, { useState, useMemo } from 'react';
import ZWindow from './ZWindow';
import { useGitHubStats } from '@/hooks/useGitHubStats';
import { useStackOverflow } from '@/hooks/useStackOverflow';
import { formatNumber, formatLargeNumber } from '@/types/stats';
import { Github, GitCommit, Code, Calendar, TrendingUp, BarChart3, Activity, Flame, Clock, Star, Award, MessageSquare, HelpCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ZGitHubStatsWindowProps {
  onClose: () => void;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}> = ({ icon, label, value, subtext, color = 'text-primary' }) => (
  <div className="glass-card p-4 hover:border-white/20 transition-all hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        {icon}
      </div>
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
  </div>
);

const ZGitHubStatsWindow: React.FC<ZGitHubStatsWindowProps> = ({ onClose }) => {
  const { stats, loading, error } = useGitHubStats();
  const { data: soData, loading: soLoading } = useStackOverflow('641766');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'repos' | 'stackoverflow'>('overview');

  if (loading) {
    return (
      <ZWindow
        title="GitHub Stats"
        onClose={onClose}
        initialPosition={{ x: 100, y: 50 }}
        initialSize={{ width: 900, height: 600 }}
      >
        <div className="flex items-center justify-center h-full bg-gray-900">
          <div className="animate-pulse text-gray-400">Loading stats...</div>
        </div>
      </ZWindow>
    );
  }

  if (error || !stats) {
    return (
      <ZWindow
        title="GitHub Stats"
        onClose={onClose}
        initialPosition={{ x: 100, y: 50 }}
        initialSize={{ width: 900, height: 600 }}
      >
        <div className="flex items-center justify-center h-full bg-gray-900 text-red-400">
          Error loading stats
        </div>
      </ZWindow>
    );
  }

  // Memoize chart data transformations - only recalculate when stats change
  const recentCommits = useMemo(() => 
    stats.monthlyCommits.slice(-24).map(item => ({
      month: item.month.slice(2), // "2024-01" -> "24-01"
      commits: item.commits
    })), [stats.monthlyCommits]
  );

  const recentLoc = useMemo(() => 
    stats.cumulativeLoc.slice(-24).map(item => ({
      month: item.month.slice(2),
      loc: item.loc / 1000000 // Convert to millions
    })), [stats.cumulativeLoc]
  );

  const topReposData = useMemo(() => 
    stats.topRepos.slice(0, 7).map((repo, idx) => ({
      name: repo.repo.split('/')[1] || repo.repo,
      fullName: repo.repo,
      commits: repo.commits,
      fill: COLORS[idx % COLORS.length]
    })), [stats.topRepos]
  );

  const dayOfWeekData = useMemo(() => 
    stats.byDayOfWeek.map((item, idx) => ({
      ...item,
      fill: COLORS[idx % COLORS.length]
    })), [stats.byDayOfWeek]
  );

  // Memoize yearly summary calculation
  const yearlySummary = useMemo(() => 
    Object.entries(
      stats.monthlyCommits.reduce((acc, item) => {
        const year = item.month.slice(0, 4);
        acc[year] = (acc[year] || 0) + item.commits;
        return acc;
      }, {} as Record<string, number>)
    ).reverse().slice(0, 10), [stats.monthlyCommits]
  );

  return (
    <ZWindow
      title="GitHub Stats - @zeekay"
      onClose={onClose}
      initialPosition={{ x: 80, y: 40 }}
      initialSize={{ width: 950, height: 650 }}
      windowType="default"
      className="z-50"
    >
      <div className="h-full bg-transparent text-white overflow-hidden flex flex-col">
        {/* Header with avatar and primary stats */}
        <div className="p-4 border-b border-white/10 glass-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold border-2 border-white/20">
                Z
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Zach Kelling</h1>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">@zeekay</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame size={10} /> {stats.yearsCoding} years
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Founder @ Hanzo AI • Open Source Enthusiast • Building the future</p>
            </div>
            <a
              href="https://github.com/zeekay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Github size={18} />
              <span className="text-sm">View Profile</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-4 glass-sm">
          {(['overview', 'activity', 'repos', 'stackoverflow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={<GitCommit size={18} />}
                  label="Total Commits"
                  value={formatNumber(stats.totalCommits)}
                  subtext={`Since ${stats.firstCommit}`}
                  color="text-purple-400"
                />
                <StatCard
                  icon={<Code size={18} />}
                  label="Net Lines of Code"
                  value={formatNumber(stats.netLoc)}
                  subtext={`+${formatNumber(stats.additions)} / -${formatNumber(stats.deletions)}`}
                  color="text-green-400"
                />
                <StatCard
                  icon={<BarChart3 size={18} />}
                  label="Repositories"
                  value={stats.repos}
                  subtext="Public & Private"
                  color="text-blue-400"
                />
                <StatCard
                  icon={<Calendar size={18} />}
                  label="Years Coding"
                  value={stats.yearsCoding}
                  subtext={`Started ${new Date(stats.firstCommit).getFullYear()}`}
                  color="text-orange-400"
                />
              </div>

              {/* Commit Activity Chart */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-purple-400" />
                  <h3 className="font-medium">Commit Activity (Last 24 Months)</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={recentCommits}>
                    <defs>
                      <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="commits"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCommits)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* LOC Growth Chart */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-green-400" />
                  <h3 className="font-medium">Lines of Code Growth (Millions)</h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={recentLoc}>
                    <defs>
                      <linearGradient id="colorLoc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `${v.toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value.toFixed(2)}M lines`, 'LOC']}
                    />
                    <Area
                      type="monotone"
                      dataKey="loc"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorLoc)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day of Week Activity */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-cyan-400" />
                  <h3 className="font-medium">Commits by Day of Week</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
                      {dayOfWeekData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Yearly Breakdown */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-orange-400" />
                  <h3 className="font-medium">Yearly Summary</h3>
                </div>
                <div className="space-y-3 max-h-[250px] overflow-y-auto">
                  {yearlySummary.map(([year, commits]) => (
                    <div key={year} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-12">{year}</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min((commits / 6000) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{formatNumber(commits)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'repos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Repos Pie Chart */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} className="text-yellow-400" />
                  <h3 className="font-medium">Top Repositories by Commits</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={topReposData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="commits"
                      nameKey="name"
                    >
                      {topReposData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [formatNumber(value), name]}
                    />
                    <Legend
                      formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Repos List */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Github size={18} className="text-purple-400" />
                  <h3 className="font-medium">Repository Breakdown</h3>
                </div>
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {stats.topRepos.slice(0, 12).map((repo, idx) => (
                    <a
                      key={repo.repo}
                      href={`https://github.com/${repo.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                          {repo.repo.split('/')[1] || repo.repo}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{repo.repo}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-400">
                        {formatNumber(repo.commits)}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stackoverflow' && (
            <div className="space-y-4">
              {/* StackOverflow Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F48024] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M15 21h-10v-2h10v2zm6-11.665l-1.621-9.335-1.993.346 1.62 9.335 1.994-.346zm-5.964 6.937l-9.746-.975-.186 2.016 9.755.879.177-1.92zm.538-2.587l-9.276-2.608-.526 1.954 9.306 2.5.496-1.846zm1.204-2.413l-8.297-4.864-1.029 1.743 8.298 4.865 1.028-1.744zm1.866-1.467l-5.339-7.829-1.672 1.14 5.339 7.829 1.672-1.14zm-2.644 4.195v8h-12v-8h-2v10h16v-10h-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Stack Overflow</h3>
                    <p className="text-gray-400 text-sm">zach-kelling</p>
                  </div>
                </div>
                <a
                  href="https://stackoverflow.com/users/641766/zach-kelling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#F48024] hover:bg-[#da7020] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  View Profile
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={<Award size={18} />}
                  label="Reputation"
                  value={soLoading ? '...' : formatNumber(soData?.reputation || 0)}
                  color="text-[#F48024]"
                />
                <StatCard
                  icon={<MessageSquare size={18} />}
                  label="Answers"
                  value={soLoading ? '...' : formatNumber(soData?.answer_count || 0)}
                  color="text-green-400"
                />
                <StatCard
                  icon={<HelpCircle size={18} />}
                  label="Questions"
                  value={soLoading ? '...' : formatNumber(soData?.question_count || 0)}
                  color="text-blue-400"
                />
              </div>

              {/* Badges */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Award size={18} className="text-yellow-400" />
                  Badges Earned
                </h3>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl">🥇</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {soLoading ? '-' : soData?.badge_counts?.gold || 0}
                    </div>
                    <div className="text-xs text-gray-400">Gold</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl">🥈</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-300">
                      {soLoading ? '-' : soData?.badge_counts?.silver || 0}
                    </div>
                    <div className="text-xs text-gray-400">Silver</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-700/20 flex items-center justify-center mb-2 mx-auto">
                      <span className="text-2xl">🥉</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {soLoading ? '-' : soData?.badge_counts?.bronze || 0}
                    </div>
                    <div className="text-xs text-gray-400">Bronze</div>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-gradient-to-br from-[#F48024]/10 to-[#F48024]/5 rounded-xl p-4 border border-[#F48024]/20">
                <p className="text-gray-300 text-sm">
                  Active member since 2011. Helping developers solve problems and sharing knowledge
                  about JavaScript, Python, React, and more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZGitHubStatsWindow;
