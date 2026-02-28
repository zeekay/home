// Blog page wrapper for desktop application
import React, { useState } from 'react';
import { BlogList, BlogPost } from '@/components/blog';
import { BlogPost as BlogPostType } from '@/data/blog/posts';

const BlogPage: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPostType | null>(null);

  return (
    <div className="min-h-full p-6">
      {selectedPost ? (
        <BlogPost
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
        />
      ) : (
        <BlogList onSelectPost={setSelectedPost} />
      )}
    </div>
  );
};

export default BlogPage;
