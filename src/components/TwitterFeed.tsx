
import React from 'react';
import { Twitter, Search } from 'lucide-react';
import TweetCard, { TweetProps } from './TweetCard';
import { cn } from '@/lib/utils';

interface TwitterFeedProps {
  className?: string;
}

// Mock data for tweets
const mockTweets: TweetProps[] = [
  {
    id: '1',
    text: 'Just released a new open-source library for reactive order execution. Check it out: github.com/zeekay/executive-order',
    likes: 24,
    retweets: 8,
    replies: 3,
    date: '2023-05-15T14:23:00Z',
    url: 'https://twitter.com/zeekay/status/1'
  },
  {
    id: '2',
    text: 'Working on some improvements to vice, my meta Vim configuration framework. The real power comes from the simplicity and composability.',
    likes: 37,
    retweets: 12,
    replies: 5,
    date: '2023-04-22T10:15:00Z',
    url: 'https://twitter.com/zeekay/status/2'
  },
  {
    id: '3',
    text: 'Excited to be speaking at the upcoming JavaScript conference about building natural language interfaces with Elliptical!',
    likes: 54,
    retweets: 17,
    replies: 8,
    date: '2023-03-10T19:42:00Z',
    url: 'https://twitter.com/zeekay/status/3'
  },
  {
    id: '4',
    text: 'Just pushed some major updates to Ko, my interactive Makefile replacement / task-runner. Makes complex task running so much more maintainable.',
    likes: 42,
    retweets: 14,
    replies: 6,
    date: '2023-02-05T08:30:00Z',
    url: 'https://twitter.com/zeekay/status/4'
  },
  {
    id: '5',
    text: 'Contributed to Handlebars.js today. It\'s amazing how this library has become such a fundamental part of so many developers\' toolkits.',
    likes: 67,
    retweets: 21,
    replies: 12,
    date: '2023-01-18T16:25:00Z',
    url: 'https://twitter.com/zeekay/status/5'
  },
  {
    id: '6',
    text: 'Exploring the intersection of functional programming and UI development. The patterns that emerge are fascinating and lead to more maintainable code.',
    likes: 83,
    retweets: 29,
    replies: 15,
    date: '2022-12-07T11:10:00Z',
    url: 'https://twitter.com/zeekay/status/6'
  }
];

const TwitterFeed: React.FC<TwitterFeedProps> = ({ className }) => {
  return (
    <div className={cn('glass-card rounded-xl overflow-hidden', className)}>
      <div className="bg-accent/50 dark:bg-accent/30 p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          <Twitter className="mr-2" size={18} />
          <h2 className="text-lg font-medium">Latest Tweets</h2>
          <span className="ml-2 text-xs py-0.5 px-2 bg-primary text-primary-foreground rounded-full">
            @zeekay
          </span>
        </div>
      </div>
      
      <div className="p-4 h-[500px] overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          {mockTweets.map((tweet) => (
            <TweetCard key={tweet.id} {...tweet} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TwitterFeed;
