// Blog list component for displaying all posts
import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Tag, ChevronDown, Search, Star } from 'lucide-react';
import { BlogPost, blogPosts, getAllTags, getYearsWithPosts, getFeaturedPosts, author } from '@/data/blog/posts';
import { cn } from '@/lib/utils';

interface BlogListProps {
  onSelectPost: (post: BlogPost) => void;
}

const BlogList: React.FC<BlogListProps> = ({ onSelectPost }) => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const years = useMemo(() => getYearsWithPosts(), []);
  const tags = useMemo(() => getAllTags(), []);
  const featuredPosts = useMemo(() => getFeaturedPosts(), []);

  const filteredPosts = useMemo(() => {
    let posts = [...blogPosts];

    // Filter by year
    if (selectedYear) {
      posts = posts.filter(p => p.year === selectedYear);
    }

    // Filter by tag
    if (selectedTag) {
      posts = posts.filter(p => p.tags.includes(selectedTag));
    }

    // Filter by featured
    if (showFeaturedOnly) {
      posts = posts.filter(p => p.featured);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some(t => t.includes(query))
      );
    }

    // Sort by date descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedYear, selectedTag, searchQuery, showFeaturedOnly]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{author.avatar}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Blog</h1>
            <p className="text-gray-400">{author.bio}</p>
          </div>
        </div>
        <p className="text-gray-300">
          Thoughts on AI, blockchain, open source, and building companies over {years.length > 1 ? `${years[years.length - 1]}-${years[0]}` : years[0]}.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {/* Featured toggle */}
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              showFeaturedOnly
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            )}
          >
            <Star size={14} />
            Featured
          </button>

          {/* Year dropdown */}
          <div className="relative group">
            <button className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              selectedYear
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            )}>
              <Calendar size={14} />
              {selectedYear || 'All years'}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
              <button
                onClick={() => setSelectedYear(null)}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5"
              >
                All years
              </button>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-white/5',
                    selectedYear === year ? 'text-purple-400' : 'text-gray-300'
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Tag dropdown */}
          <div className="relative group">
            <button className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              selectedTag
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            )}>
              <Tag size={14} />
              {selectedTag || 'All tags'}
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-64 overflow-y-auto min-w-[160px]">
              <button
                onClick={() => setSelectedTag(null)}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5"
              >
                All tags
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-white/5',
                    selectedTag === tag ? 'text-blue-400' : 'text-gray-300'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {(selectedYear || selectedTag || searchQuery || showFeaturedOnly) && (
            <button
              onClick={() => {
                setSelectedYear(null);
                setSelectedTag(null);
                setSearchQuery('');
                setShowFeaturedOnly(false);
              }}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Posts count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
        {selectedYear && ` from ${selectedYear}`}
        {selectedTag && ` tagged "${selectedTag}"`}
      </div>

      {/* Posts list */}
      <div className="space-y-6">
        {filteredPosts.map(post => (
          <article
            key={post.slug}
            onClick={() => onSelectPost(post)}
            className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.featured && (
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  )}
                  <h2 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {post.title}
                  </h2>
                </div>
                <p className="text-gray-400 mb-3 line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar size={14} />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    {post.readTime} min
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-700 group-hover:text-gray-600 transition-colors">
                {post.year}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{post.tags.length - 4} more
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No posts found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedYear(null);
              setSelectedTag(null);
              setSearchQuery('');
              setShowFeaturedOnly(false);
            }}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Timeline visualization */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
        <div className="flex flex-wrap gap-2">
          {years.map(year => {
            const yearPosts = blogPosts.filter(p => p.year === year);
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-all',
                  selectedYear === year
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                )}
              >
                <div className="font-medium">{year}</div>
                <div className="text-xs opacity-60">{yearPosts.length} posts</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogList;
