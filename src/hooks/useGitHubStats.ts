import { useState, useEffect } from 'react';
import { StatsData, GitHubStats } from '@/types/stats';
import statsData from '@/data/stats.json';

export const useGitHubStats = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Load from imported JSON
      const data = statsData as StatsData;
      setStats(data.github);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  return { stats, loading, error };
};

export const useStatsData = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(statsData as StatsData);
    setLoading(false);
  }, []);

  return { data, loading };
};
