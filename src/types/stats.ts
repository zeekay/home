export interface MonthlyCommit {
  month: string;
  commits: number;
}

export interface DayOfWeekCommit {
  day: string;
  commits: number;
}

export interface TopRepo {
  repo: string;
  commits: number;
}

export interface CumulativeLoc {
  month: string;
  loc: number;
}

export interface GitHubStats {
  totalCommits: number;
  repos: number;
  additions: number;
  deletions: number;
  netLoc: number;
  yearsCoding: number;
  firstCommit: string;
  monthlyCommits: MonthlyCommit[];
  byDayOfWeek: DayOfWeekCommit[];
  topRepos: TopRepo[];
  cumulativeLoc: CumulativeLoc[];
}

export interface ModelUsage {
  model: string;
  interactions: number;
  tokens: number;
}

export interface DailyUsage {
  date: string;
  interactions: number;
  inputTokens: number;
  outputTokens: number;
}

export interface AIStats {
  interactions: number;
  inputTokens: number;
  outputTokens: number;
  activeDays: number;
  byModel: ModelUsage[];
  daily: DailyUsage[];
}

export interface StatsData {
  github: GitHubStats;
  ai: AIStats;
  lastUpdated: string;
}

// Formatted display helpers
export const formatNumber = (num: number): string => {
  // Handle edge cases
  if (!Number.isFinite(num)) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1000000) {
    return sign + (absNum / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return sign + (absNum / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export const formatLargeNumber = (num: number): string => {
  return num.toLocaleString();
};
