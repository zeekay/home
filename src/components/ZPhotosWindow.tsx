import React, { useState, useEffect, useCallback } from 'react';
import ZWindow from './ZWindow';
import {
  Search, ExternalLink, Instagram, Github, Upload, Play, Image, RefreshCw,
  Heart, Share2, FolderPlus, Pencil, Trash2, RotateCcw, RotateCw, Crop,
  SlidersHorizontal, X, ChevronLeft, ChevronRight, Pause, Copy, Check,
  Folder, Grid3X3
} from 'lucide-react';
import { toast } from 'sonner';
import { socialProfiles, pinnedProjects } from '@/data/socials';
import { cn } from '@/lib/utils';

interface ZPhotosWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface InstagramMedia {
  id: string;
  type: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramData {
  user: {
    id: string;
    username: string;
    mediaCount: number;
  };
  media: InstagramMedia[];
  fetchedAt: string;
}

interface Album {
  id: string;
  name: string;
  count: number;
  cover?: string;
}

interface PhotoFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

const INSTAGRAM_USERNAME = 'zeekayai';

const defaultFilters: PhotoFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

const presetFilters: { name: string; filters: PhotoFilters }[] = [
  { name: 'Original', filters: { ...defaultFilters } },
  { name: 'Vivid', filters: { brightness: 105, contrast: 120, saturation: 130, blur: 0 } },
  { name: 'B&W', filters: { brightness: 100, contrast: 110, saturation: 0, blur: 0 } },
  { name: 'Warm', filters: { brightness: 105, contrast: 105, saturation: 120, blur: 0 } },
  { name: 'Cool', filters: { brightness: 100, contrast: 105, saturation: 90, blur: 0 } },
  { name: 'Dramatic', filters: { brightness: 95, contrast: 130, saturation: 110, blur: 0 } },
];

const ZPhotosWindow: React.FC<ZPhotosWindowProps> = ({ onClose, onFocus }) => {
  const [selectedImage, setSelectedImage] = useState<InstagramMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'photos' | 'albums' | 'projects' | 'brands'>('photos');
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced features
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('zos-photo-favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem('zos-photo-albums');
      return saved ? JSON.parse(saved) : [
        { id: 'favorites', name: 'Favorites', count: 0 },
        { id: 'recent', name: 'Recent', count: 0 },
      ];
    } catch {
      return [
        { id: 'favorites', name: 'Favorites', count: 0 },
        { id: 'recent', name: 'Recent', count: 0 },
      ];
    }
  });

  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState<PhotoFilters>({ ...defaultFilters });
  const [rotation, setRotation] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showNewAlbumModal, setShowNewAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('zos-photo-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Save albums to localStorage
  useEffect(() => {
    localStorage.setItem('zos-photo-albums', JSON.stringify(albums));
  }, [albums]);

  // Load Instagram data from static JSON
  useEffect(() => {
    const loadInstagramData = async () => {
      try {
        const response = await fetch('/data/instagram.json');
        if (response.ok) {
          const data = await response.json();
          setInstagramData(data);
        }
      } catch (error) {
        console.log('Instagram data not available');
      } finally {
        setLoading(false);
      }
    };
    loadInstagramData();
  }, []);

  // Slideshow timer
  useEffect(() => {
    if (!isSlideshow || !instagramData?.media.length) return;

    const timer = setInterval(() => {
      setSlideshowIndex((prev) => (prev + 1) % instagramData.media.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isSlideshow, instagramData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        toast.success('Photo added to library');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success('Removed from favorites');
      } else {
        next.add(id);
        toast.success('Added to favorites');
      }
      return next;
    });
  }, []);

  const createAlbum = () => {
    if (!newAlbumName.trim()) return;

    const newAlbum: Album = {
      id: Math.random().toString(36).substring(2),
      name: newAlbumName.trim(),
      count: 0,
    };

    setAlbums((prev) => [...prev, newAlbum]);
    setNewAlbumName('');
    setShowNewAlbumModal(false);
    toast.success(`Album "${newAlbum.name}" created`);
  };

  const deleteAlbum = (id: string) => {
    if (id === 'favorites' || id === 'recent') {
      toast.error('Cannot delete system albums');
      return;
    }
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    toast.success('Album deleted');
  };

  const renameAlbum = (id: string, newName: string) => {
    setAlbums((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name: newName } : a))
    );
    setEditingAlbumId(null);
  };

  const applyPresetFilter = (preset: typeof presetFilters[0]) => {
    setFilters(preset.filters);
  };

  const resetEdits = () => {
    setFilters({ ...defaultFilters });
    setRotation(0);
  };

  const getFilterStyle = () => ({
    filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`,
    transform: `rotate(${rotation}deg)`,
  });

  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Brand/Company colors for visual representation
  const brands = [
    { name: 'Hanzo AI', icon: '🥷', color: 'from-purple-600 to-pink-600', description: 'Applied AI Cloud' },
    { name: 'LUX', icon: '▼', color: 'from-amber-500 to-orange-600', description: 'Quantum-safe Blockchain' },
    { name: 'ZOO', icon: '🧬', color: 'from-green-500 to-teal-600', description: 'Regenerative Finance' },
    { name: 'Ellipsis', icon: '◦◦◦', color: 'from-gray-600 to-gray-800', description: 'Dotfiles Manager' },
    { name: 'Shop.js', icon: '🛍️', color: 'from-blue-500 to-cyan-500', description: 'Ecommerce Framework' },
    { name: 'Enso', icon: '◯', color: 'from-indigo-500 to-purple-600', description: 'Multimodal AI' },
  ];

  const tabs = [
    { id: 'photos' as const, label: 'Photos', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'albums' as const, label: 'Albums', icon: <Folder className="w-4 h-4" /> },
    { id: 'projects' as const, label: 'Projects', icon: <Github className="w-4 h-4" /> },
    { id: 'brands' as const, label: 'Brands', icon: <Image className="w-4 h-4" /> },
  ];

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredMedia = instagramData?.media.filter(item => {
    if (selectedAlbum === 'favorites') return favorites.has(item.id);
    return item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === '';
  }) || [];

  // Slideshow view
  if (isSlideshow && instagramData?.media.length) {
    const currentPhoto = instagramData.media[slideshowIndex];
    return (
      <ZWindow
        title="Photos - Slideshow"
        onClose={onClose}
        onFocus={onFocus}
        defaultWidth={1000}
        defaultHeight={750}
        minWidth={700}
        minHeight={500}
        defaultPosition={{ x: 100, y: 40 }}
      >
        <div className="h-full flex flex-col bg-black">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setSlideshowIndex((prev) => (prev - 1 + instagramData.media.length) % instagramData.media.length)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSlideshow(false)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              <Pause className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSlideshowIndex((prev) => (prev + 1) % instagramData.media.length)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSlideshow(false)}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Photo */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={currentPhoto.url}
              alt={currentPhoto.caption || 'Photo'}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Progress */}
          <div className="p-4 flex items-center gap-2">
            {instagramData.media.slice(0, 20).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i === slideshowIndex ? "bg-white" : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      </ZWindow>
    );
  }

  return (
    <ZWindow
      title="Photos"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={1000}
      defaultHeight={750}
      minWidth={700}
      minHeight={500}
      defaultPosition={{ x: 100, y: 40 }}
    >
      <div className="h-full flex flex-col bg-[#1a1a1a]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10 bg-black/30">
          {/* Tabs */}
          <div className="flex gap-1 glass-sm rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedAlbum(null);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-white/40" />
          </div>

          {activeTab === 'photos' && filteredMedia.length > 0 && (
            <button
              onClick={() => {
                setSlideshowIndex(0);
                setIsSlideshow(true);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              Slideshow
            </button>
          )}

          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="flex-1 overflow-auto p-4">
          {selectedImage ? (
            <div className="flex flex-col h-full">
              {/* Image viewer toolbar */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setIsEditing(false);
                    resetEdits();
                  }}
                  className="flex items-center gap-2 text-white/70 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedImage.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      favorites.has(selectedImage.id)
                        ? "text-red-500 bg-red-500/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", favorites.has(selectedImage.id) && "fill-current")} />
                  </button>
                  <button
                    onClick={() => setShowShareSheet(true)}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isEditing ? "text-blue-500 bg-blue-500/10" : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex gap-4">
                {/* Main image */}
                <div className="flex-1 flex items-center justify-center bg-black/30 rounded-xl overflow-hidden">
                  {selectedImage.type === 'video' ? (
                    <video
                      src={selectedImage.url}
                      poster={selectedImage.thumbnail}
                      controls
                      className="max-w-full max-h-full object-contain"
                      style={getFilterStyle()}
                    />
                  ) : (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.caption || 'Photo'}
                      className="max-w-full max-h-full object-contain transition-all"
                      style={getFilterStyle()}
                    />
                  )}
                </div>

                {/* Editing panel */}
                {isEditing && (
                  <div className="w-64 bg-black/30 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">Edit</h3>
                      <button
                        onClick={resetEdits}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Rotation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRotation((r) => r - 90)}
                        className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70"
                      >
                        <RotateCcw className="w-4 h-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => setRotation((r) => r + 90)}
                        className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70"
                      >
                        <RotateCw className="w-4 h-4 mx-auto" />
                      </button>
                      <button className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70">
                        <Crop className="w-4 h-4 mx-auto" />
                      </button>
                    </div>

                    {/* Filters */}
                    <div>
                      <p className="text-xs text-white/50 mb-2">Filters</p>
                      <div className="grid grid-cols-3 gap-2">
                        {presetFilters.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyPresetFilter(preset)}
                            className={cn(
                              "p-2 text-xs rounded-lg transition-colors",
                              JSON.stringify(filters) === JSON.stringify(preset.filters)
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/5 text-white/70 hover:bg-white/10"
                            )}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Adjustments */}
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">Adjustments</p>
                      {[
                        { key: 'brightness', label: 'Brightness', min: 50, max: 150 },
                        { key: 'contrast', label: 'Contrast', min: 50, max: 150 },
                        { key: 'saturation', label: 'Saturation', min: 0, max: 200 },
                      ].map((adj) => (
                        <div key={adj.key}>
                          <div className="flex justify-between text-xs text-white/50 mb-1">
                            <span>{adj.label}</span>
                            <span>{filters[adj.key as keyof PhotoFilters]}%</span>
                          </div>
                          <input
                            type="range"
                            min={adj.min}
                            max={adj.max}
                            value={filters[adj.key as keyof PhotoFilters]}
                            onChange={(e) =>
                              setFilters((f) => ({ ...f, [adj.key]: Number(e.target.value) }))
                            }
                            className="w-full accent-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Caption and info */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {selectedImage.caption && (
                    <p className="text-sm text-white/70 line-clamp-2">{selectedImage.caption}</p>
                  )}
                  <span className="text-xs text-white/40">{formatDate(selectedImage.timestamp)}</span>
                </div>
                <a
                  href={selectedImage.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"
                >
                  View on Instagram <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Share sheet modal */}
              {showShareSheet && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareSheet(false)}>
                  <div className="bg-[#2d2d2d] rounded-xl p-4 w-80" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Share</h3>
                      <button onClick={() => setShowShareSheet(false)} className="text-white/50 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => copyShareLink(selectedImage.permalink)}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left"
                      >
                        {copiedLink ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-white/70" />}
                        <span className="text-white">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      <a
                        href={selectedImage.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg"
                      >
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span className="text-white">Open in Instagram</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Albums Tab */}
              {activeTab === 'albums' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/70">My Albums</h3>
                    <button
                      onClick={() => setShowNewAlbumModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70"
                    >
                      <FolderPlus className="w-4 h-4" />
                      New Album
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {albums.map((album) => (
                      <div
                        key={album.id}
                        className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => {
                          setSelectedAlbum(album.id);
                          setActiveTab('photos');
                        }}
                      >
                        {album.cover ? (
                          <img src={album.cover} alt={album.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          {editingAlbumId === album.id ? (
                            <input
                              type="text"
                              defaultValue={album.name}
                              autoFocus
                              className="bg-white/10 px-2 py-1 rounded text-white text-sm w-full"
                              onBlur={(e) => renameAlbum(album.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameAlbum(album.id, e.currentTarget.value);
                                if (e.key === 'Escape') setEditingAlbumId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p className="text-white font-medium text-sm">{album.name}</p>
                          )}
                          <p className="text-white/50 text-xs">
                            {album.id === 'favorites' ? favorites.size : album.count} items
                          </p>
                        </div>

                        {/* Album actions */}
                        {album.id !== 'favorites' && album.id !== 'recent' && (
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAlbumId(album.id);
                              }}
                              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAlbum(album.id);
                              }}
                              className="p-1.5 bg-black/50 hover:bg-red-500/70 rounded-full text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* New album modal */}
                  {showNewAlbumModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewAlbumModal(false)}>
                      <div className="bg-[#2d2d2d] rounded-xl p-4 w-80" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-white font-medium mb-4">New Album</h3>
                        <input
                          type="text"
                          placeholder="Album name"
                          value={newAlbumName}
                          onChange={(e) => setNewAlbumName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && createAlbum()}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 mb-4"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowNewAlbumModal(false)}
                            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={createAlbum}
                            disabled={!newAlbumName.trim()}
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Tab - Instagram Integration */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  {/* Album indicator */}
                  {selectedAlbum && (
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setSelectedAlbum(null)}
                        className="text-white/70 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium">
                        {albums.find((a) => a.id === selectedAlbum)?.name || 'Album'}
                      </span>
                    </div>
                  )}

                  {/* Profile Header */}
                  {!selectedAlbum && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-0.5">
                        <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center">
                          <Instagram className="w-8 h-8 text-pink-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">@{instagramData?.user.username || INSTAGRAM_USERNAME}</h3>
                        <p className="text-sm text-white/60">
                          {instagramData?.user.mediaCount
                            ? `${instagramData.user.mediaCount} posts`
                            : 'Instagram Photos & Stories'}
                        </p>
                      </div>
                      <a
                        href={socialProfiles.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                      >
                        View Profile <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Photo Grid */}
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 text-white/40 animate-spin mb-3" />
                      <p className="text-white/60 text-sm">Loading photos...</p>
                    </div>
                  ) : filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {filteredMedia.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedImage(item)}
                          className="relative aspect-square group overflow-hidden rounded-lg bg-white/5"
                        >
                          <img
                            src={item.type === 'video' ? (item.thumbnail || item.url) : item.url}
                            alt={item.caption || 'Instagram photo'}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {item.type === 'video' ? (
                              <Play className="w-8 h-8 text-white" />
                            ) : (
                              <Image className="w-8 h-8 text-white" />
                            )}
                          </div>
                          {/* Favorite indicator */}
                          {favorites.has(item.id) && (
                            <div className="absolute top-2 left-2">
                              <Heart className="w-4 h-4 text-red-500 fill-current drop-shadow-lg" />
                            </div>
                          )}
                          {/* Video indicator */}
                          {item.type === 'video' && (
                            <div className="absolute top-2 right-2">
                              <Play className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                          {/* Carousel indicator */}
                          {item.type === 'carousel_album' && (
                            <div className="absolute top-2 right-2 flex gap-0.5">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                              <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Instagram className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60 mb-2">
                        {selectedAlbum === 'favorites' ? 'No favorites yet' : 'No photos yet'}
                      </p>
                      <p className="text-white/40 text-sm mb-4">
                        {selectedAlbum === 'favorites'
                          ? 'Heart photos to add them to favorites'
                          : 'Instagram photos will appear here once configured'}
                      </p>
                      {!selectedAlbum && (
                        <a
                          href={socialProfiles.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Visit Instagram <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-white/70">Pinned Projects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pinnedProjects.map((project, index) => (
                      <a
                        key={index}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Github className="w-5 h-5 text-white/50" />
                          <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              project.language === 'TypeScript' ? 'bg-blue-500' :
                              project.language === 'Python' ? 'bg-yellow-500' :
                              project.language === 'Go' ? 'bg-cyan-500' :
                              project.language === 'Shell' ? 'bg-green-500' :
                              'bg-gray-500'
                            }`} />
                            {project.language}
                          </span>
                          <span>* {project.stars}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Tab */}
              {activeTab === 'brands' && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-white/70">Companies & Projects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {brands.map((brand, index) => (
                      <div
                        key={index}
                        className={`aspect-video bg-gradient-to-br ${brand.color} rounded-xl shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center p-4`}
                      >
                        <span className="text-4xl mb-2">{brand.icon}</span>
                        <span className="text-lg font-bold text-white">{brand.name}</span>
                        <span className="text-xs text-white/70">{brand.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ZWindow>
  );
};

export default ZPhotosWindow;
