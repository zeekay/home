
import React from 'react';
import { Twitter, Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TweetProps {
  id: string;
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  date: string;
  url: string;
}

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const TweetCard: React.FC<TweetProps> = ({
  id,
  text,
  likes,
  retweets,
  replies,
  date,
  url
}) => {
  return (
    <div className="glass-card glass-card-hover rounded-lg p-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
      <div className="flex items-start mb-1">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Twitter size={18} className="text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className="font-medium">Zach Kelling</h3>
            <span className="ml-2 text-muted-foreground text-sm">@zeekay</span>
            <span className="mx-1 text-muted-foreground">·</span>
            <span className="text-muted-foreground text-sm">{formatDate(date)}</span>
          </div>
          
          <p className="mt-1 whitespace-pre-wrap break-words">{text}</p>
          
          <div className="flex mt-3 -ml-2 text-muted-foreground">
            <a href={`${url}/reply`} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
              <MessageCircle size={16} />
              {replies > 0 && <span className="ml-1 text-xs">{replies}</span>}
            </a>
            
            <a href={`${url}/retweet`} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full hover:bg-green-500/5 hover:text-green-500 transition-colors">
              <Repeat size={16} />
              {retweets > 0 && <span className="ml-1 text-xs">{retweets}</span>}
            </a>
            
            <a href={`${url}/like`} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full hover:bg-red-500/5 hover:text-red-500 transition-colors">
              <Heart size={16} />
              {likes > 0 && <span className="ml-1 text-xs">{likes}</span>}
            </a>
            
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
              <Share size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetCard;
