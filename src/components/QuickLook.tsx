import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Code,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// File type detection
type FileType = 'image' | 'video' | 'audio' | 'text' | 'code' | 'pdf' | 'unknown';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
const TEXT_EXTENSIONS = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'csv', 'log'];
const CODE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'css', 'scss', 'html', 'sh', 'bash', 'zsh', 'rb', 'php', 'swift', 'kt', 'scala', 'lua', 'vim', 'sql'];

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

function getFileType(filename: string): FileType {
  const ext = getFileExtension(filename);
  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (TEXT_EXTENSIONS.includes(ext)) return 'text';
  if (CODE_EXTENSIONS.includes(ext)) return 'code';
  if (ext === 'pdf') return 'pdf';
  return 'unknown';
}

function getLanguageClass(filename: string): string {
  const ext = getFileExtension(filename);
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    css: 'css',
    scss: 'scss',
    html: 'html',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
    lua: 'lua',
    vim: 'vim',
    sql: 'sql',
    json: 'json',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
  };
  return langMap[ext] || 'plaintext';
}

function getFileTypeIcon(type: FileType) {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5" />;
    case 'video':
      return <Film className="w-5 h-5" />;
    case 'audio':
      return <Music className="w-5 h-5" />;
    case 'code':
      return <Code className="w-5 h-5" />;
    case 'text':
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
}

// Simple syntax highlighting without external dependencies
function highlightCode(code: string, language: string): string {
  // Keywords for common languages
  const keywords: Record<string, string[]> = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'get', 'set', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'static', 'get', 'set', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true', 'false', 'type', 'interface', 'enum', 'implements', 'private', 'public', 'protected', 'readonly', 'as', 'keyof', 'switch', 'case', 'break', 'continue'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'raise', 'pass', 'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'self', 'global', 'nonlocal', 'async', 'await'],
    go: ['func', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'go', 'defer', 'chan', 'select', 'type', 'struct', 'interface', 'map', 'var', 'const', 'nil', 'true', 'false', 'make', 'new', 'append', 'len', 'cap'],
    rust: ['fn', 'let', 'mut', 'const', 'if', 'else', 'for', 'while', 'loop', 'match', 'return', 'struct', 'enum', 'impl', 'trait', 'pub', 'mod', 'use', 'as', 'self', 'super', 'crate', 'where', 'async', 'await', 'move', 'ref', 'true', 'false', 'Some', 'None', 'Ok', 'Err'],
  };

  const lang = keywords[language] || keywords.javascript || [];
  
  // Escape HTML
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight strings (single and double quotes)
  result = result.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, '<span class="text-emerald-400">$&</span>');

  // Highlight comments
  result = result.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
  result = result.replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>');

  // Highlight numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>');

  // Highlight keywords
  if (lang.length > 0) {
    const keywordRegex = new RegExp(`\\b(${lang.join('|')})\\b`, 'g');
    result = result.replace(keywordRegex, '<span class="text-purple-400 font-medium">$1</span>');
  }

  // Highlight function calls
  result = result.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span class="text-blue-400">$1</span>(');

  return result;
}

export interface QuickLookFile {
  name: string;
  type: 'folder' | 'file';
  content?: string;
  url?: string;
  size?: string;
  modified?: string;
  dimensions?: { width: number; height: number };
  src?: string; // For images/videos/audio
}

interface QuickLookProps {
  file: QuickLookFile;
  files: QuickLookFile[];
  onClose: () => void;
  onNavigate: (file: QuickLookFile) => void;
  onOpenWith?: (file: QuickLookFile) => void;
  onShare?: (file: QuickLookFile) => void;
}

const QuickLook: React.FC<QuickLookProps> = ({
  file,
  files,
  onClose,
  onNavigate,
  onOpenWith,
  onShare,
}) => {
  const [zoom, setZoom] = useState(1);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const fileType = getFileType(file.name);
  const currentIndex = files.findIndex((f) => f.name === file.name);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < files.length - 1;

  // Open animation
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrev) {
            onNavigate(files[currentIndex - 1]);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canGoNext) {
            onNavigate(files[currentIndex + 1]);
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          if (fileType === 'image') {
            setZoom((z) => Math.min(z + 0.25, 3));
          }
          break;
        case '-':
          e.preventDefault();
          if (fileType === 'image') {
            setZoom((z) => Math.max(z - 0.25, 0.25));
          }
          break;
        case '0':
          e.preventDefault();
          if (fileType === 'image') {
            setZoom(1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, canGoPrev, canGoNext, currentIndex, files, onNavigate, fileType]);

  // Click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      handleClose();
    }
  };

  // Handle image load to get dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Render content based on file type
  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full overflow-auto p-4">
            <img
              src={file.src || file.url || `/placeholder.svg?text=${encodeURIComponent(file.name)}`}
              alt={file.name}
              onLoad={handleImageLoad}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full p-4">
            <video
              src={file.src || file.url}
              controls
              autoPlay
              className="max-w-full max-h-full"
            >
              Your browser does not support video playback.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Music className="w-16 h-16 text-white" />
            </div>
            <audio src={file.src || file.url} controls autoPlay className="w-full max-w-md">
              Your browser does not support audio playback.
            </audio>
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full w-full">
            <iframe
              src={file.src || file.url}
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        );

      case 'code':
        return (
          <div className="h-full overflow-auto p-4">
            <pre className="text-sm font-mono leading-relaxed">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightCode(file.content || '', getLanguageClass(file.name)),
                }}
              />
            </pre>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="h-full overflow-auto p-4">
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
              {file.content || 'No content available'}
            </pre>
          </div>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-200',
        isVisible ? 'bg-black/70 backdrop-blur-md' : 'bg-black/0 backdrop-blur-none'
      )}
      onClick={handleBackdropClick}
    >
      {/* Main container */}
      <div
        className={cn(
          'relative flex flex-col bg-[#1e1e1e]/95 rounded-xl border border-white/20 shadow-2xl overflow-hidden transition-all duration-200',
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          'w-[90vw] max-w-4xl h-[85vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-white/60">{getFileTypeIcon(fileType)}</div>
            <div>
              <h2 className="text-white font-medium">{file.name}</h2>
              <div className="flex items-center gap-2 text-xs text-white/50">
                {file.size && <span>{file.size}</span>}
                {imageDimensions && (
                  <span>
                    {imageDimensions.width} x {imageDimensions.height}
                  </span>
                )}
                {file.modified && <span>{file.modified}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom controls for images */}
            {fileType === 'image' && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-white/50 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/20 mx-1" />
              </>
            )}

            {/* Share button */}
            {onShare && (
              <button
                onClick={() => onShare(file)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Open with button */}
            {onOpenWith && (
              <button
                onClick={() => onOpenWith(file)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Open with..."
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-4 bg-white/20 mx-1" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Close (Space or Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[#1a1a1a]">{renderContent()}</div>

        {/* Navigation arrows */}
        {files.length > 1 && (
          <>
            <button
              onClick={() => canGoPrev && onNavigate(files[currentIndex - 1])}
              disabled={!canGoPrev}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 transition-all',
                canGoPrev
                  ? 'text-white hover:bg-black/70 hover:scale-110'
                  : 'text-white/30 cursor-not-allowed'
              )}
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => canGoNext && onNavigate(files[currentIndex + 1])}
              disabled={!canGoNext}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 transition-all',
                canGoNext
                  ? 'text-white hover:bg-black/70 hover:scale-110'
                  : 'text-white/30 cursor-not-allowed'
              )}
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Footer with file count */}
        {files.length > 1 && (
          <div className="flex items-center justify-center py-2 bg-[#2d2d2d] border-t border-white/10">
            <span className="text-xs text-white/50">
              {currentIndex + 1} of {files.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLook;
