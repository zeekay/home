#!/usr/bin/env npx tsx
/**
 * Fetch GitHub stats for static build
 *
 * This fetches detailed commit/LOC statistics.
 * For full historical data, run the stats app at ~/work/zeekay/stats
 *
 * Usage:
 *   npx tsx scripts/fetch-stats.ts
 *
 * Optional:
 *   GITHUB_TOKEN - for higher rate limits
 */

import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = 'zeekay';

interface CommitData {
  sha: string;
  commit: {
    author: {
      date: string;
    };
    message: string;
  };
  stats?: {
    additions: number;
    deletions: number;
  };
}

interface RepoData {
  name: string;
  full_name: string;
  fork: boolean;
  private: boolean;
}

async function githubFetch<T>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'zeekay-stats-fetch',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, { headers });

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error('GitHub rate limit exceeded. Use GITHUB_TOKEN for higher limits.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

async function fetchUserRepos(): Promise<RepoData[]> {
  const allRepos: RepoData[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const repos = await githubFetch<RepoData[]>(
      `/users/${GITHUB_USER}/repos?per_page=${perPage}&page=${page}&sort=pushed`
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
    // Rate limit protection
    await new Promise(r => setTimeout(r, 100));
  }

  return allRepos.filter(r => !r.fork && !r.private);
}

async function fetchRepoCommitCount(repo: string): Promise<number> {
  try {
    // Use the contributors endpoint for commit counts
    const contributors = await githubFetch<{ contributions: number }[]>(
      `/repos/${repo}/contributors?per_page=1`
    );

    // If user is the main contributor, return their count
    const userContrib = contributors.find((c: any) => c.login === GITHUB_USER);
    return userContrib?.contributions || 0;
  } catch {
    return 0;
  }
}

async function fetchRecentActivity(): Promise<{
  monthlyCommits: { month: string; commits: number }[];
  totalCommits: number;
}> {
  // Fetch recent events to estimate activity
  const events = await githubFetch<any[]>(`/users/${GITHUB_USER}/events?per_page=100`);

  const monthlyCommits: Record<string, number> = {};
  let totalPushEvents = 0;

  for (const event of events) {
    if (event.type === 'PushEvent') {
      const date = new Date(event.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCommits[month] = (monthlyCommits[month] || 0) + (event.payload?.commits?.length || 1);
      totalPushEvents += event.payload?.commits?.length || 1;
    }
  }

  return {
    monthlyCommits: Object.entries(monthlyCommits)
      .map(([month, commits]) => ({ month, commits }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    totalCommits: totalPushEvents,
  };
}

async function main() {
  console.log('📊 Fetching GitHub stats...');

  if (!GITHUB_TOKEN) {
    console.log('⚠️  No GITHUB_TOKEN set. Using unauthenticated requests (60/hour limit).');
  }

  // Try to read existing stats to preserve historical data
  const existingStatsPath = path.join(process.cwd(), 'src', 'data', 'stats.json');
  let existingStats: any = null;

  if (fs.existsSync(existingStatsPath)) {
    try {
      existingStats = JSON.parse(fs.readFileSync(existingStatsPath, 'utf-8'));
      console.log('✓ Loaded existing stats');
    } catch {
      console.log('⚠️  Could not parse existing stats');
    }
  }

  // Fetch user profile
  const profile = await githubFetch<any>(`/users/${GITHUB_USER}`);
  console.log(`✓ Fetched profile: ${profile.name || profile.login}`);

  // Fetch repos
  const repos = await fetchUserRepos();
  console.log(`✓ Fetched ${repos.length} repos`);

  // Fetch recent activity
  const { monthlyCommits: recentMonthly, totalCommits: recentCommits } = await fetchRecentActivity();
  console.log(`✓ Fetched recent activity: ${recentCommits} commits`);

  // Merge with existing data or create new
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // If we have existing stats, update only recent months
  let monthlyCommits = existingStats?.github?.monthlyCommits || [];
  let cumulativeLoc = existingStats?.github?.cumulativeLoc || [];

  // Update recent months from API data
  for (const recent of recentMonthly) {
    const existingIdx = monthlyCommits.findIndex((m: any) => m.month === recent.month);
    if (existingIdx >= 0) {
      // Update if API has more commits (it's more recent data)
      if (recent.commits > monthlyCommits[existingIdx].commits) {
        monthlyCommits[existingIdx].commits = recent.commits;
      }
    } else {
      monthlyCommits.push(recent);
    }
  }

  // Sort by month
  monthlyCommits.sort((a: any, b: any) => a.month.localeCompare(b.month));

  // Calculate totals
  const totalCommits = existingStats?.github?.totalCommits || monthlyCommits.reduce((sum: number, m: any) => sum + m.commits, 0);
  const additions = existingStats?.github?.additions || 0;
  const deletions = existingStats?.github?.deletions || 0;
  const netLoc = existingStats?.github?.netLoc || additions - deletions;
  const firstCommit = existingStats?.github?.firstCommit || '2010-07-05';
  const yearsCoding = new Date().getFullYear() - new Date(firstCommit).getFullYear();

  // Build day of week stats (from existing or default)
  const byDayOfWeek = existingStats?.github?.byDayOfWeek || [
    { day: 'Sun', commits: 0 },
    { day: 'Mon', commits: 0 },
    { day: 'Tue', commits: 0 },
    { day: 'Wed', commits: 0 },
    { day: 'Thu', commits: 0 },
    { day: 'Fri', commits: 0 },
    { day: 'Sat', commits: 0 },
  ];

  // Top repos (preserve existing, they require more API calls to update)
  const topRepos = existingStats?.github?.topRepos || [];

  const stats = {
    github: {
      totalCommits,
      repos: repos.length + (profile.public_repos - repos.length), // Include org repos
      additions,
      deletions,
      netLoc,
      yearsCoding,
      firstCommit,
      monthlyCommits,
      byDayOfWeek,
      topRepos,
      cumulativeLoc,
    },
    ai: existingStats?.ai || {
      interactions: 0,
      inputTokens: 0,
      outputTokens: 0,
      activeDays: 0,
      byModel: [],
      daily: [],
    },
    lastUpdated: now.toISOString().split('T')[0],
  };

  // Write updated stats
  fs.writeFileSync(existingStatsPath, JSON.stringify(stats, null, 2));
  console.log(`✓ Updated stats at ${existingStatsPath}`);

  console.log('\n📈 Stats Summary:');
  console.log(`   Total commits: ${totalCommits.toLocaleString()}`);
  console.log(`   Total repos: ${stats.github.repos}`);
  console.log(`   Net LOC: ${netLoc.toLocaleString()}`);
  console.log(`   Years coding: ${yearsCoding}`);

  console.log('\n🎉 Done!');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
