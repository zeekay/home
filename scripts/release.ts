#!/usr/bin/env tsx
/**
 * Release Script
 *
 * Creates a new release with version bump, changelog, and git tag.
 *
 * Usage:
 *   npx tsx scripts/release.ts patch    # Patch release (4.2.0 -> 4.2.1)
 *   npx tsx scripts/release.ts minor    # Minor release (4.2.0 -> 4.3.0)
 *   npx tsx scripts/release.ts major    # Major release (4.2.0 -> 5.0.0)
 *   npx tsx scripts/release.ts --dry-run patch  # Preview without committing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

function exec(cmd: string, options?: { silent?: boolean }): string {
  if (!options?.silent) {
    console.log(`$ ${cmd}`);
  }
  return execSync(cmd, { encoding: 'utf-8', cwd: ROOT });
}

function getPackageVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
  return pkg.version;
}

function bumpVersion(type: 'major' | 'minor' | 'patch'): string {
  // Run version script to bump appVersions.ts and package.json
  exec(`npx tsx scripts/version.ts ${type}`);
  return getPackageVersion();
}

function generateChangelog(): void {
  exec('npx tsx scripts/changelog.ts');
}

function createGitTag(version: string): void {
  exec(`git add -A`);
  exec(`git commit -m "chore(release): v${version}"`);
  exec(`git tag -a v${version} -m "Release v${version}"`);
}

function main(): void {
  const args = process.argv.slice(2);
  let dryRun = false;
  let type: 'major' | 'minor' | 'patch' | undefined;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (['major', 'minor', 'patch'].includes(arg)) {
      type = arg as 'major' | 'minor' | 'patch';
    }
  }

  if (!type) {
    console.log(`
Release Script for zOS

Usage:
  npx tsx scripts/release.ts <type>           # Create release
  npx tsx scripts/release.ts --dry-run <type> # Preview release

Types: major, minor, patch

This script will:
1. Bump version in appVersions.ts and package.json
2. Increment all app build numbers
3. Generate/update CHANGELOG.md
4. Create git commit and tag
`);
    process.exit(0);
  }

  const currentVersion = getPackageVersion();
  console.log(`\nCurrent version: ${currentVersion}`);
  console.log(`Release type: ${type}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Would perform the following:');
    console.log('1. Bump version');
    console.log('2. Increment build numbers');
    console.log('3. Generate changelog');
    console.log('4. Commit and tag');
    return;
  }

  // Check for uncommitted changes
  const status = exec('git status --porcelain', { silent: true });
  if (status.trim()) {
    console.error('\nError: Working directory not clean. Commit or stash changes first.');
    process.exit(1);
  }

  console.log('\n1. Bumping version...');
  const newVersion = bumpVersion(type);
  console.log(`   New version: ${newVersion}`);

  console.log('\n2. Incrementing build numbers...');
  exec('npx tsx scripts/version.ts --bump-builds');

  console.log('\n3. Generating changelog...');
  generateChangelog();

  console.log('\n4. Creating commit and tag...');
  createGitTag(newVersion);

  console.log(`
Release v${newVersion} created successfully!

Next steps:
1. Review the changes: git show
2. Push to remote: git push && git push --tags
3. Create GitHub release: gh release create v${newVersion} --generate-notes
`);
}

main();
