#!/usr/bin/env tsx
/**
 * Changelog Generator
 *
 * Generates CHANGELOG.md from git commits.
 *
 * Usage:
 *   npx tsx scripts/changelog.ts              # Generate full changelog
 *   npx tsx scripts/changelog.ts --since v4.0 # Since specific tag
 *   npx tsx scripts/changelog.ts --dry-run    # Preview without writing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CHANGELOG_FILE = path.join(__dirname, '../CHANGELOG.md');

interface Commit {
  hash: string;
  date: string;
  subject: string;
  body: string;
  type: string;
  scope: string;
  breaking: boolean;
}

interface Release {
  version: string;
  date: string;
  commits: Commit[];
}

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
  } catch {
    return '';
  }
}

function getGitTags(): string[] {
  const output = exec('git tag --sort=-version:refname');
  return output.split('\n').filter(Boolean);
}

function getCommitsBetween(from: string, to: string): string {
  const range = from ? `${from}..${to}` : to;
  return exec(`git log ${range} --format="%H|%ad|%s|%b" --date=short`);
}

function parseCommit(line: string): Commit | null {
  const [hash, date, subject, body = ''] = line.split('|');
  if (!hash || !subject) return null;

  // Parse conventional commit format: type(scope): message
  const conventionalMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);

  let type = 'other';
  let scope = '';
  let message = subject;

  if (conventionalMatch) {
    type = conventionalMatch[1].toLowerCase();
    scope = conventionalMatch[2] || '';
    message = conventionalMatch[3];
  }

  // Detect breaking changes
  const breaking = subject.includes('!:') || body.includes('BREAKING CHANGE');

  return {
    hash: hash.substring(0, 7),
    date,
    subject: message,
    body,
    type,
    scope,
    breaking,
  };
}

function categorizeCommits(commits: Commit[]): Map<string, Commit[]> {
  const categories = new Map<string, Commit[]>();

  const categoryMap: Record<string, string> = {
    feat: 'Features',
    fix: 'Bug Fixes',
    docs: 'Documentation',
    style: 'Styles',
    refactor: 'Code Refactoring',
    perf: 'Performance Improvements',
    test: 'Tests',
    build: 'Build System',
    ci: 'CI/CD',
    chore: 'Chores',
    revert: 'Reverts',
  };

  for (const commit of commits) {
    const category = categoryMap[commit.type] || 'Other Changes';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(commit);
  }

  return categories;
}

function generateReleaseNotes(release: Release): string {
  const lines: string[] = [];

  lines.push(`## [${release.version}] - ${release.date}`);
  lines.push('');

  // Breaking changes first
  const breaking = release.commits.filter((c) => c.breaking);
  if (breaking.length > 0) {
    lines.push('### BREAKING CHANGES');
    lines.push('');
    for (const commit of breaking) {
      const scope = commit.scope ? `**${commit.scope}:** ` : '';
      lines.push(`- ${scope}${commit.subject} (${commit.hash})`);
    }
    lines.push('');
  }

  // Categorized commits
  const categories = categorizeCommits(release.commits.filter((c) => !c.breaking));
  const categoryOrder = [
    'Features',
    'Bug Fixes',
    'Performance Improvements',
    'Code Refactoring',
    'Documentation',
    'Other Changes',
  ];

  for (const category of categoryOrder) {
    const commits = categories.get(category);
    if (commits && commits.length > 0) {
      lines.push(`### ${category}`);
      lines.push('');
      for (const commit of commits) {
        const scope = commit.scope ? `**${commit.scope}:** ` : '';
        lines.push(`- ${scope}${commit.subject} (${commit.hash})`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function generateChangelog(since?: string): string {
  const tags = getGitTags();
  const lines: string[] = [];

  lines.push('# Changelog');
  lines.push('');
  lines.push('All notable changes to zOS will be documented in this file.');
  lines.push('');
  lines.push('The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),');
  lines.push('and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).');
  lines.push('');

  // Unreleased section (commits since last tag)
  const latestTag = tags[0];
  const unreleasedCommits = getCommitsBetween(latestTag || '', 'HEAD');
  if (unreleasedCommits) {
    const commits = unreleasedCommits
      .split('\n')
      .filter(Boolean)
      .map(parseCommit)
      .filter((c): c is Commit => c !== null);

    if (commits.length > 0) {
      lines.push('## [Unreleased]');
      lines.push('');
      const categories = categorizeCommits(commits);
      for (const [category, catCommits] of categories) {
        lines.push(`### ${category}`);
        lines.push('');
        for (const commit of catCommits) {
          const scope = commit.scope ? `**${commit.scope}:** ` : '';
          lines.push(`- ${scope}${commit.subject} (${commit.hash})`);
        }
        lines.push('');
      }
    }
  }

  // Tagged releases
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const prevTag = tags[i + 1] || '';

    if (since && tag < since) break;

    const commitOutput = getCommitsBetween(prevTag, tag);
    const commits = commitOutput
      .split('\n')
      .filter(Boolean)
      .map(parseCommit)
      .filter((c): c is Commit => c !== null);

    if (commits.length === 0) continue;

    // Get tag date
    const tagDate = exec(`git log -1 --format=%ad --date=short ${tag}`).trim();

    const release: Release = {
      version: tag.replace(/^v/, ''),
      date: tagDate || new Date().toISOString().split('T')[0],
      commits,
    };

    lines.push(generateReleaseNotes(release));
  }

  return lines.join('\n');
}

function main(): void {
  const args = process.argv.slice(2);
  let since: string | undefined;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--since' && args[i + 1]) {
      since = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }

  const changelog = generateChangelog(since);

  if (dryRun) {
    console.log(changelog);
  } else {
    fs.writeFileSync(CHANGELOG_FILE, changelog, 'utf-8');
    console.log(`Changelog written to ${CHANGELOG_FILE}`);
  }
}

main();
