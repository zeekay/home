/**
 * Blog Window
 * Personal blog viewer for zeekay.io
 */

import React, { useState } from 'react';
import ZWindow from './ZWindow';
import { BlogList, BlogPost } from './blog';
import { BlogPost as BlogPostType } from '@/data/blog/posts';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ZBlogWindowProps {
  onClose: () => void;
  onFocus?: () => void;
  initialPost?: string; // slug of post to open
  depth?: number;
}

const ZBlogWindow: React.FC<ZBlogWindowProps> = ({
  onClose,
  onFocus,
  initialPost,
  depth = 0,
}) => {
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null);

  return (
    <ZWindow
      title={selectedPost ? selectedPost.title : "Blog - Zach Kelling"}
      onClose={onClose}
      onFocus={onFocus}
      appId="blog"
      width={900}
      height={700}
      minWidth={600}
      minHeight={400}
      initialPosition={{ x: 100 + depth * 30, y: 80 + depth * 30 }}
    >
      <div className="h-full flex flex-col bg-gray-900">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <div>
              <h1 className="text-sm font-medium text-white">
                {selectedPost ? 'Reading' : 'zeekay.io/blog'}
              </h1>
              {selectedPost && (
                <p className="text-xs text-gray-400 truncate max-w-[300px]">
                  {selectedPost.title}
                </p>
              )}
            </div>
          </div>

          {selectedPost && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{selectedPost.readTime} min read</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <span>{new Date(selectedPost.date).getFullYear()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {selectedPost ? (
              <BlogPost
                post={selectedPost}
                onBack={() => setSelectedPost(null)}
              />
            ) : (
              <BlogList onSelectPost={setSelectedPost} />
            )}
          </div>
        </ScrollArea>
      </div>
    </ZWindow>
  );
};

export default ZBlogWindow;
