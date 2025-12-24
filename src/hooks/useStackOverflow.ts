import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/config/links';

export interface StackOverflowUser {
  reputation: number;
  answer_count: number;
  question_count: number;
  badge_counts: {
    gold: number;
    silver: number;
    bronze: number;
  };
  profile_image: string;
  display_name: string;
  link: string;
}

export const useStackOverflow = (userId: string = API_ENDPOINTS.stackOverflow.defaultUserId) => {
  const [data, setData] = useState<StackOverflowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.stackOverflow.base}/users/${userId}?site=stackoverflow`)
      .then(r => r.json())
      .then(response => {
        if (response.items?.[0]) {
          setData(response.items[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  return { data, loading, error };
};
