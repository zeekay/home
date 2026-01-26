#!/usr/bin/env npx tsx
/**
 * Fetch GitHub data for static build
 *
 * Usage:
 *   npx tsx scripts/fetch-github.ts
 *
 * Optional environment variable:
 *   GITHUB_TOKEN - for higher rate limits
 */

import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// GitHub organizations and users to fetch
const GITHUB_ORGS = ['hanzoai', 'luxfi', 'zooai'];
const GITHUB_USER = 'zeekay';

// Paper repos to specifically highlight
const PAPER_REPOS = [
  { owner: 'luxfi', repo: 'papers' },
  { owner: 'hanzoai', repo: 'papers' },
  { owner: 'zooai', repo: 'papers' },
  // zen-papers is local at ~/work/zen/papers, not yet on GitHub
];

// Types
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

async function githubFetch<T>(endpoint: string): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'zeekay-home-fetch',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com${endpoint}`, { headers });

  if (!response.ok) {
    // Check rate limit
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const resetTime = response.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : 'unknown';
      throw new Error(`GitHub rate limit exceeded. Resets at ${resetDate}. Use GITHUB_TOKEN for higher limits.`);
    }
    throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

// Fetch all repos for a user/org with pagination
async function fetchAllRepos(owner: string, isOrg: boolean, maxItems = 200): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (allRepos.length < maxItems) {
    const endpoint = isOrg
      ? `/orgs/${owner}/repos?per_page=${perPage}&page=${page}&sort=pushed`
      : `/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=pushed`;

    try {
      const repos = await githubFetch<GitHubRepo[]>(endpoint);
      allRepos.push(...repos);

      if (repos.length < perPage) break;
      page++;
    } catch (error) {
      console.error(`Error fetching repos for ${owner}:`, error);
      break;
    }
  }

  return allRepos
    .filter(r => !r.private && !r.archived)
    .slice(0, maxItems);
}

// Fetch contents of a directory in a repo
async function fetchRepoContents(owner: string, repo: string, repoPath = ''): Promise<GitHubContent[]> {
  try {
    const endpoint = `/repos/${owner}/${repo}/contents${repoPath ? `/${repoPath}` : ''}`;
    return await githubFetch<GitHubContent[]>(endpoint);
  } catch (error) {
    console.error(`Error fetching contents for ${owner}/${repo}/${repoPath}:`, error);
    return [];
  }
}

// Fetch papers from a papers repo
async function fetchPapers(owner: string, repo: string): Promise<{ name: string; url: string; type: 'pdf' | 'tex' | 'md' }[]> {
  const contents = await fetchRepoContents(owner, repo);
  const papers: { name: string; url: string; type: 'pdf' | 'tex' | 'md' }[] = [];

  // Get PDFs from pdfs/ folder if it exists
  const pdfFolder = contents.find(c => c.name === 'pdfs' && c.type === 'dir');
  if (pdfFolder) {
    const pdfContents = await fetchRepoContents(owner, repo, 'pdfs');
    for (const item of pdfContents) {
      if (item.name.endsWith('.pdf')) {
        papers.push({
          name: item.name.replace('.pdf', ''),
          url: item.html_url,
          type: 'pdf',
        });
      }
    }
  }

  // Get .tex and .md files from root
  for (const item of contents) {
    if (item.type === 'file') {
      if (item.name.endsWith('.tex')) {
        papers.push({
          name: item.name.replace('.tex', ''),
          url: item.html_url,
          type: 'tex',
        });
      } else if (item.name.endsWith('.md') && !['README.md', 'CLAUDE.md', 'LLM.md'].includes(item.name)) {
        papers.push({
          name: item.name.replace('.md', ''),
          url: item.html_url,
          type: 'md',
        });
      }
    }
  }

  return papers;
}

// Fetch user profile
async function fetchUserProfile(username: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`);
}

// Categorize repos by topic/language
function categorizeRepos(repos: GitHubRepo[]): Record<string, GitHubRepo[]> {
  const categories: Record<string, GitHubRepo[]> = {
    featured: [],
    ai: [],
    blockchain: [],
    web: [],
    tools: [],
    dotfiles: [],
    other: [],
  };

  for (const repo of repos) {
    const name = repo.name.toLowerCase();
    const topics = repo.topics.map(t => t.toLowerCase());
    const desc = (repo.description || '').toLowerCase();

    // Featured repos (high stars or specific names)
    if (repo.stargazers_count > 100 ||
        ['ellipsis', 'handroll', 'mcp', 'node', 'ui'].includes(name)) {
      categories.featured.push(repo);
    }

    // AI/ML
    if (topics.some(t => ['ai', 'ml', 'llm', 'machine-learning', 'deep-learning', 'agent'].includes(t)) ||
        desc.includes('ai') || desc.includes('llm') || desc.includes('model')) {
      categories.ai.push(repo);
    }
    // Blockchain
    else if (topics.some(t => ['blockchain', 'crypto', 'ethereum', 'solidity', 'web3', 'defi'].includes(t)) ||
             desc.includes('blockchain') || desc.includes('consensus')) {
      categories.blockchain.push(repo);
    }
    // Web frameworks
    else if (topics.some(t => ['web', 'react', 'nextjs', 'typescript', 'javascript', 'ui', 'frontend'].includes(t)) ||
             repo.language === 'TypeScript' || repo.language === 'JavaScript') {
      categories.web.push(repo);
    }
    // Dotfiles
    else if (name.startsWith('dot-') || name.includes('dotfile') || topics.includes('dotfiles')) {
      categories.dotfiles.push(repo);
    }
    // CLI tools
    else if (topics.some(t => ['cli', 'tool', 'utility'].includes(t)) ||
             desc.includes('cli') || desc.includes('command')) {
      categories.tools.push(repo);
    }
    // Other
    else {
      categories.other.push(repo);
    }
  }

  // Sort each category by stars
  for (const category of Object.keys(categories)) {
    categories[category].sort((a, b) => b.stargazers_count - a.stargazers_count);
  }

  return categories;
}

async function main() {
  console.log('🐙 Fetching GitHub data...');

  // Check rate limit first
  if (!GITHUB_TOKEN) {
    console.log('⚠️  No GITHUB_TOKEN set. Using unauthenticated requests (60/hour limit).');
    console.log('   Set GITHUB_TOKEN for 5000/hour limit.');
  }

  // Fetch user profile
  const profile = await fetchUserProfile(GITHUB_USER);
  console.log(`✓ Fetched profile: ${profile.name || profile.login}`);

  // Fetch repos from personal account
  const personalRepos = await fetchAllRepos(GITHUB_USER, false, 200);
  console.log(`✓ Fetched ${personalRepos.length} personal repos`);

  // Fetch repos from each org
  const orgRepos: Record<string, GitHubRepo[]> = {};
  for (const org of GITHUB_ORGS) {
    orgRepos[org] = await fetchAllRepos(org, true, 100);
    console.log(`✓ Fetched ${orgRepos[org].length} repos from ${org}`);
  }

  // Fetch papers from paper repos
  const papers: Record<string, { name: string; url: string; type: string }[]> = {};
  for (const { owner, repo } of PAPER_REPOS) {
    papers[`${owner}/${repo}`] = await fetchPapers(owner, repo);
    console.log(`✓ Fetched ${papers[`${owner}/${repo}`].length} papers from ${owner}/${repo}`);
  }

  // Combine and categorize all repos
  const allRepos = [
    ...personalRepos,
    ...Object.values(orgRepos).flat(),
  ];

  // Dedupe by full_name
  const uniqueRepos = Array.from(
    new Map(allRepos.map(r => [r.full_name, r])).values()
  );

  const categorizedRepos = categorizeRepos(uniqueRepos);

  // Build output data
  const data = {
    profile: {
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      bio: profile.bio,
      company: profile.company,
      location: profile.location,
      blog: profile.blog,
      twitter_username: profile.twitter_username,
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
    },
    organizations: GITHUB_ORGS.map(org => ({
      name: org,
      repoCount: orgRepos[org]?.length || 0,
      url: `https://github.com/${org}`,
    })),
    repos: {
      personal: personalRepos.slice(0, 50).map(r => ({
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics,
        updated_at: r.updated_at,
      })),
      organizations: Object.fromEntries(
        GITHUB_ORGS.map(org => [
          org,
          (orgRepos[org] || []).slice(0, 30).map(r => ({
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            url: r.html_url,
            homepage: r.homepage,
            stars: r.stargazers_count,
            forks: r.forks_count,
            language: r.language,
            topics: r.topics,
            updated_at: r.updated_at,
          })),
        ])
      ),
    },
    categorized: Object.fromEntries(
      Object.entries(categorizedRepos).map(([category, repos]) => [
        category,
        repos.slice(0, 20).map(r => ({
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          url: r.html_url,
          stars: r.stargazers_count,
          language: r.language,
        })),
      ])
    ),
    papers: Object.fromEntries(
      Object.entries(papers).map(([repo, paperList]) => [
        repo,
        paperList.map(p => ({
          name: p.name,
          url: p.url,
          type: p.type,
        })),
      ])
    ),
    stats: {
      totalRepos: uniqueRepos.length,
      totalStars: uniqueRepos.reduce((sum, r) => sum + r.stargazers_count, 0),
      totalForks: uniqueRepos.reduce((sum, r) => sum + r.forks_count, 0),
      languages: [...new Set(uniqueRepos.map(r => r.language).filter(Boolean))].slice(0, 20),
    },
    fetchedAt: new Date().toISOString(),
  };

  // Write to public/data/github.json
  const outputDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'github.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✓ Wrote data to ${outputPath}`);

  // Write minimal version for faster loading
  const minimalData = {
    profile: {
      login: profile.login,
      name: profile.name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      followers: profile.followers,
    },
    featured: categorizedRepos.featured.slice(0, 10).map(r => ({
      name: r.name,
      owner: r.owner.login,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language,
    })),
    organizations: GITHUB_ORGS,
    papers: Object.fromEntries(
      Object.entries(papers).map(([repo, paperList]) => [
        repo.split('/')[0], // Just the org name
        paperList.filter(p => p.type === 'pdf').slice(0, 10).map(p => p.name),
      ])
    ),
    stats: data.stats,
    fetchedAt: data.fetchedAt,
  };

  const minimalPath = path.join(outputDir, 'github-minimal.json');
  fs.writeFileSync(minimalPath, JSON.stringify(minimalData, null, 2));
  console.log(`✓ Wrote minimal data to ${minimalPath}`);

  console.log('\n🎉 Done!');
  console.log(`   Total repos: ${data.stats.totalRepos}`);
  console.log(`   Total stars: ${data.stats.totalStars}`);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
