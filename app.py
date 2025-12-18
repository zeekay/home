#!/usr/bin/env python3
"""
zeekay.ai - Personal homepage with live stats dashboard.

Features:
- GitHub contribution stats
- Claude AI token usage tracking  
- Spotify listening history
- Real-time data via sql.js
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, send_from_directory
import requests

load_dotenv()

app = Flask(__name__)

# Load config
CONFIG_PATH = Path('stats.json')
config = {}
if CONFIG_PATH.exists():
    with open(CONFIG_PATH) as f:
        config = json.load(f)

# Configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')
GITHUB_USERS = config.get('users', ['zeekay'])
PORT = config.get('port', 5002)
DB_PATH = Path(config.get('database', './cache/stats.db'))
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '')
CLAUDE_CONFIG_DIR = Path.home() / '.claude'

DB_PATH.parent.mkdir(exist_ok=True)

# GitHub API headers
GITHUB_HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
} if GITHUB_TOKEN else {}


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS github_commits (
            sha TEXT PRIMARY KEY,
            username TEXT,
            date TEXT,
            repo TEXT,
            message TEXT,
            additions INTEGER,
            deletions INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS claude_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            model TEXT,
            input_tokens INTEGER,
            output_tokens INTEGER,
            cache_creation INTEGER DEFAULT 0,
            cache_read INTEGER DEFAULT 0,
            interaction_hash TEXT UNIQUE
        );
        
        CREATE TABLE IF NOT EXISTS spotify_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            played_at TEXT UNIQUE,
            track_name TEXT,
            artist_name TEXT,
            album_name TEXT,
            duration_ms INTEGER,
            track_id TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_commits_date ON github_commits(date);
        CREATE INDEX IF NOT EXISTS idx_commits_user ON github_commits(username);
        CREATE INDEX IF NOT EXISTS idx_claude_date ON claude_usage(date);
        CREATE INDEX IF NOT EXISTS idx_spotify_played ON spotify_tracks(played_at);
    ''')
    conn.commit()
    conn.close()


@app.route('/')
def index():
    """Serve main dashboard."""
    return render_template('index.html', config=config)


@app.route('/stats.db')
def serve_database():
    """Serve SQLite database for client-side querying."""
    return send_from_directory(DB_PATH.parent, DB_PATH.name)


@app.route('/api/profile')
def api_profile():
    """Get profile data."""
    return jsonify({
        'success': True,
        'profile': {
            'name': config.get('title', 'Zach Kelling'),
            'subtitle': config.get('subtitle', ''),
            'links': config.get('links', {}),
            'avatar': f'https://github.com/{GITHUB_USERS[0]}.png' if GITHUB_USERS else None
        }
    })


@app.route('/api/github/stats')
def api_github_stats():
    """Get GitHub stats summary."""
    conn = get_db()
    try:
        stats = conn.execute('''
            SELECT 
                COUNT(*) as total_commits,
                COUNT(DISTINCT repo) as repos,
                COUNT(DISTINCT date) as active_days,
                COALESCE(SUM(additions), 0) as additions,
                COALESCE(SUM(deletions), 0) as deletions,
                MIN(date) as first_commit,
                MAX(date) as last_commit
            FROM github_commits
        ''').fetchone()
        
        return jsonify({
            'success': True,
            'stats': dict(stats) if stats else {}
        })
    finally:
        conn.close()


@app.route('/api/claude/stats')
def api_claude_stats():
    """Get Claude usage stats."""
    conn = get_db()
    try:
        stats = conn.execute('''
            SELECT 
                COUNT(*) as interactions,
                COALESCE(SUM(input_tokens), 0) as input_tokens,
                COALESCE(SUM(output_tokens), 0) as output_tokens,
                COALESCE(SUM(cache_creation), 0) as cache_creation,
                COALESCE(SUM(cache_read), 0) as cache_read,
                COUNT(DISTINCT date) as active_days,
                COUNT(DISTINCT model) as models_used
            FROM claude_usage
        ''').fetchone()
        
        # Get by model breakdown
        by_model = conn.execute('''
            SELECT model, 
                   SUM(input_tokens) as input,
                   SUM(output_tokens) as output,
                   COUNT(*) as count
            FROM claude_usage
            GROUP BY model
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'stats': dict(stats) if stats else {},
            'by_model': [dict(r) for r in by_model]
        })
    finally:
        conn.close()


@app.route('/api/spotify/stats')
def api_spotify_stats():
    """Get Spotify listening stats."""
    conn = get_db()
    try:
        stats = conn.execute('''
            SELECT 
                COUNT(*) as total_plays,
                COUNT(DISTINCT track_id) as unique_tracks,
                COUNT(DISTINCT artist_name) as unique_artists,
                COALESCE(SUM(duration_ms) / 1000 / 60, 0) as total_minutes
            FROM spotify_tracks
        ''').fetchone()
        
        top_artists = conn.execute('''
            SELECT artist_name, COUNT(*) as plays
            FROM spotify_tracks
            GROUP BY artist_name
            ORDER BY plays DESC
            LIMIT 10
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'stats': dict(stats) if stats else {},
            'top_artists': [dict(r) for r in top_artists]
        })
    finally:
        conn.close()


@app.route('/api/sync/claude')
def sync_claude():
    """Sync Claude usage from local JSONL files."""
    try:
        projects_dir = CLAUDE_CONFIG_DIR / 'projects'
        if not projects_dir.exists():
            return jsonify({'success': False, 'error': 'No Claude projects found'})
        
        conn = get_db()
        imported = 0
        
        for jsonl_file in projects_dir.rglob('*.jsonl'):
            with open(jsonl_file) as f:
                for line in f:
                    try:
                        data = json.loads(line.strip())
                        if not data.get('message', {}).get('usage'):
                            continue
                        
                        usage = data['message']['usage']
                        timestamp = data.get('timestamp', '')
                        date = timestamp[:10] if timestamp else None
                        
                        if not date:
                            continue
                        
                        # Create hash for deduplication
                        import hashlib
                        hash_input = f"{timestamp}{data.get('requestId', '')}"
                        interaction_hash = hashlib.sha256(hash_input.encode()).hexdigest()
                        
                        try:
                            conn.execute('''
                                INSERT OR IGNORE INTO claude_usage 
                                (date, model, input_tokens, output_tokens, cache_creation, cache_read, interaction_hash)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                date,
                                data['message'].get('model', 'unknown'),
                                usage.get('input_tokens', 0),
                                usage.get('output_tokens', 0),
                                usage.get('cache_creation_input_tokens', 0),
                                usage.get('cache_read_input_tokens', 0),
                                interaction_hash
                            ))
                            if conn.total_changes:
                                imported += 1
                        except:
                            pass
                    except:
                        continue
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'imported': imported})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


if __name__ == '__main__':
    init_db()
    print(f"\n{config.get('title', 'zeekay.ai')}")
    print(f"Port: {PORT}")
    print(f"Database: {DB_PATH}\n")
    app.run(host='127.0.0.1', port=PORT, debug=True)
