import { useState, useEffect } from 'react';

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

export const useStackOverflow = (userId: string = '641766') => {
  const [data, setData] = useState<StackOverflowUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://api.stackexchange.com/2.3/users/${userId}?site=stackoverflow`)
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
