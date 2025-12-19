#!/usr/bin/env node
/**
 * Sync script for zeekay homepage
 * Reads from stats.db and generates stats.json for static site
 *
 * Usage: npm run sync
 */

import { writeFileSync, readFileSync, existsSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DATA_FILE = join(ROOT, 'data', 'stats.json')
const PUBLIC_DB = join(ROOT, 'public', 'stats.db')
const VIBE_TOTALS_DB = join(process.env.HOME, 'play/vibe-totals/cache/stats.db')

function queryDB(sql) {
  try {
    const result = execSync(`sqlite3 -json "${PUBLIC_DB}" "${sql}"`, { encoding: 'utf-8' })
    return JSON.parse(result || '[]')
  } catch (e) {
    console.error('Query error:', e.message)
    return []
  }
}

function querySingle(sql) {
  try {
    const result = execSync(`sqlite3 "${PUBLIC_DB}" "${sql}"`, { encoding: 'utf-8' })
    return result.trim()
  } catch (e) {
    return '0'
  }
}

async function main() {
  console.log('🔄 Syncing stats data...\n')

  // Copy latest database from vibe-totals if available
  if (existsSync(VIBE_TOTALS_DB)) {
    console.log('Copying latest database from vibe-totals...')
    copyFileSync(VIBE_TOTALS_DB, PUBLIC_DB)
  }

  if (!existsSync(PUBLIC_DB)) {
    console.error('No stats.db found!')
    process.exit(1)
  }

  console.log('Reading stats from database...')

  // GitHub stats
  const totalCommits = parseInt(querySingle('SELECT COUNT(*) FROM commits')) || 0
  const repos = parseInt(querySingle('SELECT COUNT(DISTINCT repo) FROM commits WHERE repo IS NOT NULL')) || 0
  const additions = parseInt(querySingle('SELECT SUM(additions) FROM commits WHERE additions IS NOT NULL')) || 0
  const deletions = parseInt(querySingle('SELECT SUM(deletions) FROM commits WHERE deletions IS NOT NULL')) || 0
  const firstCommit = querySingle('SELECT MIN(date) FROM commits') || '2010-01-01'

  const yearsCoding = Math.round((Date.now() - new Date(firstCommit).getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  // Monthly commits - ALL months (full history)
  const monthlyCommits = queryDB(`
    SELECT strftime('%Y-%m', date) as month, COUNT(*) as commits
    FROM commits
    GROUP BY month
    ORDER BY month
  `)

  // Day of week
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const byDayOfWeekRaw = queryDB(`
    SELECT
      CASE CAST(strftime('%w', date) AS INTEGER)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri' WHEN 6 THEN 'Sat'
      END as day,
      COUNT(*) as commits
    FROM commits
    GROUP BY strftime('%w', date)
  `)
  const byDayOfWeek = dayOrder.map(day => {
    const found = byDayOfWeekRaw.find(d => d.day === day)
    return { day, commits: found?.commits || 0 }
  })

  // Top repos
  const topRepos = queryDB(`
    SELECT repo, COUNT(*) as commits
    FROM commits
    WHERE repo IS NOT NULL
    GROUP BY repo
    ORDER BY commits DESC
    LIMIT 15
  `)

  // Cumulative LOC over time
  const locByMonth = queryDB(`
    SELECT strftime('%Y-%m', date) as month,
           SUM(additions) - SUM(deletions) as net
    FROM commits
    WHERE additions IS NOT NULL
    GROUP BY month
    ORDER BY month
  `)

  let cumLoc = 0
  const cumulativeLoc = locByMonth.map(m => {
    cumLoc += (m.net || 0)
    return { month: m.month, loc: cumLoc }
  })

  // AI stats (from claude_usage table if exists)
  let aiStats = {
    interactions: 0,
    inputTokens: 0,
    outputTokens: 0,
    activeDays: 0,
    byModel: [],
    daily: []
  }

  try {
    const hasClaudeTable = querySingle("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='claude_usage'")
    if (parseInt(hasClaudeTable) > 0) {
      aiStats.interactions = parseInt(querySingle('SELECT COUNT(*) FROM claude_usage')) || 0
      aiStats.inputTokens = parseInt(querySingle('SELECT SUM(input_tokens) FROM claude_usage')) || 0
      aiStats.outputTokens = parseInt(querySingle('SELECT SUM(output_tokens) FROM claude_usage')) || 0
      aiStats.activeDays = parseInt(querySingle('SELECT COUNT(DISTINCT date) FROM claude_usage')) || 0

      aiStats.byModel = queryDB(`
        SELECT
          REPLACE(REPLACE(model, 'claude-', ''), '-20241022', '') as model,
          SUM(input_tokens + output_tokens) as tokens
        FROM claude_usage
        GROUP BY model
        ORDER BY tokens DESC
        LIMIT 5
      `)

      aiStats.daily = queryDB(`
        SELECT date, SUM(input_tokens + output_tokens) as tokens
        FROM claude_usage
        GROUP BY date
        ORDER BY date DESC
        LIMIT 30
      `).reverse().map(d => ({
        date: d.date?.slice(5) || '',
        tokens: d.tokens || 0
      }))
    }
  } catch (e) {
    console.log('No AI stats available')
  }

  const stats = {
    github: {
      totalCommits,
      repos,
      additions,
      deletions,
      netLoc: additions - deletions,
      yearsCoding,
      firstCommit,
      monthlyCommits,
      byDayOfWeek,
      topRepos,
      cumulativeLoc
    },
    ai: aiStats,
    lastUpdated: new Date().toISOString().slice(0, 10)
  }

  writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2))

  console.log(`\n✅ Stats saved to ${DATA_FILE}`)
  console.log(`   GitHub:`)
  console.log(`   - ${totalCommits.toLocaleString()} commits`)
  console.log(`   - ${repos.toLocaleString()} repos`)
  console.log(`   - ${additions.toLocaleString()} additions`)
  console.log(`   - ${deletions.toLocaleString()} deletions`)
  console.log(`   - ${(additions - deletions).toLocaleString()} net LOC`)
  console.log(`   - ${yearsCoding} years coding (since ${firstCommit})`)
  console.log(`   AI:`)
  console.log(`   - ${aiStats.interactions.toLocaleString()} interactions`)
  console.log(`   - ${aiStats.inputTokens.toLocaleString()} input tokens`)
  console.log(`   - ${aiStats.outputTokens.toLocaleString()} output tokens`)
}

main().catch(console.error)
