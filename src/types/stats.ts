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

export interface AIStats {
  interactions: number;
  inputTokens: number;
  outputTokens: number;
  activeDays: number;
  byModel: any[];
  daily: any[];
}

export interface StatsData {
  github: GitHubStats;
  ai: AIStats;
  lastUpdated: string;
}

// Formatted display helpers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

export const formatLargeNumber = (num: number): string => {
  return num.toLocaleString();
};
