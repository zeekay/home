// Blog post component for rendering individual posts
import React from 'react';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { BlogPost as BlogPostType, author } from '@/data/blog/posts';
import { cn } from '@/lib/utils';

interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
}

const BlogPostComponent: React.FC<BlogPostProps> = ({ post, onBack }) => {
  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, i) => {
      // Code block handling
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = [];
        } else {
          elements.push(
            <pre key={`code-${i}`} className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto my-4">
              <code className="text-green-400 text-sm font-mono">
                {codeContent.join('\n')}
              </code>
            </pre>
          );
          inCodeBlock = false;
          codeLanguage = '';
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-bold text-white mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-semibold text-white mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-medium text-white mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
        return;
      }

      // Horizontal rule
      if (line === '---') {
        elements.push(<hr key={i} className="border-white/20 my-8" />);
        return;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-4" />);
        return;
      }

      // Italic (date lines)
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        elements.push(
          <p key={i} className="text-gray-400 italic mb-4">
            {line.slice(1, -1)}
          </p>
        );
        return;
      }

      // List items
      if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-gray-300 ml-4 mb-2">
            {renderInlineFormatting(line.slice(2))}
          </li>
        );
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={i} className="text-gray-300 ml-4 mb-2 list-decimal">
            {renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-gray-300 leading-relaxed mb-4">
          {renderInlineFormatting(line)}
        </p>
      );
    });

    return elements;
  };

  // Render inline formatting (bold, links, code)
  const renderInlineFormatting = (text: string): React.ReactNode => {
    // Handle inline code
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="bg-white/10 px-1.5 py-0.5 rounded text-purple-300 text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Handle bold
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="text-white font-semibold">{bp.slice(2, -2)}</strong>;
        }

        // Handle links
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const linkParts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(bp)) !== null) {
          if (match.index > lastIndex) {
            linkParts.push(bp.slice(lastIndex, match.index));
          }
          linkParts.push(
            <a
              key={`link-${i}-${j}-${match.index}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              {match[1]}
            </a>
          );
          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < bp.length) {
          linkParts.push(bp.slice(lastIndex));
        }

        return linkParts.length > 0 ? linkParts : bp;
      });
    });
  };

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to posts</span>
      </button>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{post.readTime} min read</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {renderContent(post.content)}
      </div>

      {/* Author footer */}
      <footer className="mt-12 pt-8 border-t border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{author.avatar}</span>
          </div>
          <div>
            <div className="font-semibold text-white">{author.name}</div>
            <div className="text-sm text-gray-400">{author.bio}</div>
          </div>
        </div>
      </footer>
    </article>
  );
};

export default BlogPostComponent;
