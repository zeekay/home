#!/usr/bin/env tsx
/**
 * Version Management Script
 *
 * Handles version bumping for zOS and individual apps.
 *
 * Usage:
 *   npx tsx scripts/version.ts patch          # Bump zOS patch version
 *   npx tsx scripts/version.ts minor          # Bump zOS minor version
 *   npx tsx scripts/version.ts major          # Bump zOS major version
 *   npx tsx scripts/version.ts patch finder   # Bump finder patch version
 *   npx tsx scripts/version.ts --app finder patch  # Alternative syntax
 */

import * as fs from 'fs';
import * as path from 'path';

const VERSIONS_FILE = path.join(__dirname, '../src/config/appVersions.ts');
const PACKAGE_FILE = path.join(__dirname, '../package.json');

interface AppVersion {
  version: string;
  build: number;
  releaseDate: string;
  changelog: string[];
}

function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  return { major, minor, patch };
}

function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const { major, minor, patch } = parseVersion(version);
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function incrementBuild(build: number): number {
  return build + 1;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function readVersionsFile(): string {
  return fs.readFileSync(VERSIONS_FILE, 'utf-8');
}

function writeVersionsFile(content: string): void {
  fs.writeFileSync(VERSIONS_FILE, content, 'utf-8');
}

function updatePackageVersion(newVersion: string): void {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_FILE, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
}

function updateZosVersion(type: 'major' | 'minor' | 'patch'): string {
  let content = readVersionsFile();

  // Extract current ZOS_VERSION
  const versionMatch = content.match(/ZOS_VERSION:\s*AppVersion\s*=\s*\{[\s\S]*?version:\s*'([^']+)'/);
  const buildMatch = content.match(/ZOS_VERSION:\s*AppVersion\s*=\s*\{[\s\S]*?build:\s*(\d+)/);

  if (!versionMatch || !buildMatch) {
    throw new Error('Could not find ZOS_VERSION in appVersions.ts');
  }

  const currentVersion = versionMatch[1];
  const currentBuild = parseInt(buildMatch[1], 10);

  const newVersion = incrementVersion(currentVersion, type);
  const newBuild = incrementBuild(currentBuild);
  const today = getToday();

  // Update ZOS_VERSION block
  content = content.replace(
    /ZOS_VERSION:\s*AppVersion\s*=\s*\{[\s\S]*?version:\s*'[^']+'/,
    `ZOS_VERSION: AppVersion = {\n  version: '${newVersion}'`
  );
  content = content.replace(
    /(ZOS_VERSION[\s\S]*?build:\s*)\d+/,
    `$1${newBuild}`
  );
  content = content.replace(
    /(ZOS_VERSION[\s\S]*?releaseDate:\s*)'[^']+'/,
    `$1'${today}'`
  );

  writeVersionsFile(content);
  updatePackageVersion(newVersion);

  console.log(`zOS version bumped: ${currentVersion} -> ${newVersion}`);
  console.log(`Build: ${currentBuild} -> ${newBuild}`);
  console.log(`Release date: ${today}`);

  return newVersion;
}

function updateAppVersion(appId: string, type: 'major' | 'minor' | 'patch'): string {
  let content = readVersionsFile();

  // Find the app block
  const appRegex = new RegExp(
    `(${appId}:\\s*\\{[\\s\\S]*?version:\\s*')([^']+)('[\\s\\S]*?build:\\s*)(\\d+)([\\s\\S]*?releaseDate:\\s*')([^']+)(')`,
    'g'
  );

  const match = appRegex.exec(content);
  if (!match) {
    throw new Error(`Could not find app '${appId}' in appVersions.ts`);
  }

  const currentVersion = match[2];
  const currentBuild = parseInt(match[4], 10);

  const newVersion = incrementVersion(currentVersion, type);
  const newBuild = incrementBuild(currentBuild);
  const today = getToday();

  content = content.replace(
    appRegex,
    `$1${newVersion}$3${newBuild}$5${today}$7`
  );

  writeVersionsFile(content);

  console.log(`${appId} version bumped: ${currentVersion} -> ${newVersion}`);
  console.log(`Build: ${currentBuild} -> ${newBuild}`);
  console.log(`Release date: ${today}`);

  return newVersion;
}

function bumpAllBuilds(): void {
  let content = readVersionsFile();
  const today = getToday();

  // Increment all build numbers
  content = content.replace(/build:\s*(\d+)/g, (_, build) => {
    return `build: ${parseInt(build, 10) + 1}`;
  });

  // Update all release dates
  content = content.replace(/releaseDate:\s*'[^']+'/g, `releaseDate: '${today}'`);

  writeVersionsFile(content);
  console.log(`All builds incremented and release dates updated to ${today}`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Version Management Script for zOS

Usage:
  npx tsx scripts/version.ts <type>              # Bump zOS version
  npx tsx scripts/version.ts <type> <appId>      # Bump app version
  npx tsx scripts/version.ts --bump-builds       # Increment all builds

Types: major, minor, patch

Examples:
  npx tsx scripts/version.ts patch               # zOS 15.2.0 -> 15.2.1
  npx tsx scripts/version.ts minor               # zOS 15.2.0 -> 15.3.0
  npx tsx scripts/version.ts patch finder        # finder 14.0.0 -> 14.0.1
  npx tsx scripts/version.ts --bump-builds       # Increment all build numbers
`);
    process.exit(0);
  }

  if (args[0] === '--bump-builds') {
    bumpAllBuilds();
    return;
  }

  const type = args[0] as 'major' | 'minor' | 'patch';
  if (!['major', 'minor', 'patch'].includes(type)) {
    console.error(`Invalid version type: ${type}`);
    console.error('Use: major, minor, or patch');
    process.exit(1);
  }

  if (args.length === 1) {
    // Bump zOS version
    updateZosVersion(type);
  } else {
    // Bump app version
    const appId = args[1];
    updateAppVersion(appId, type);
  }
}

main();
