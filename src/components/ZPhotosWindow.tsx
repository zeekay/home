import React, { useState, useEffect } from 'react';
import ZWindow from './ZWindow';
import { Search, ExternalLink, Instagram, Github, Upload, Play, Image, RefreshCw } from 'lucide-react';
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

const INSTAGRAM_USERNAME = 'zeekayai';

const ZPhotosWindow: React.FC<ZPhotosWindowProps> = ({ onClose, onFocus }) => {
  const [selectedImage, setSelectedImage] = useState<InstagramMedia | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'photos' | 'projects' | 'brands'>('photos');
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [loading, setLoading] = useState(true);

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
    { id: 'photos' as const, label: 'Photos' },
    { id: 'projects' as const, label: 'Projects' },
    { id: 'brands' as const, label: 'Brands' },
  ];

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredMedia = instagramData?.media.filter(item => 
    item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === ''
  ) || [];

  return (
    <ZWindow
      title="Photos"
      onClose={onClose}
      onFocus={onFocus}
      defaultWidth={900}
      defaultHeight={700}
      minWidth={600}
      minHeight={400}
      defaultPosition={{ x: 150, y: 60 }}
    >
      <div className="h-full flex flex-col bg-[#1a1a1a]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10 bg-black/30">
          {/* Tabs */}
          <div className="flex gap-1 glass-sm rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
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
            <div className="flex flex-col items-center">
              <div className="bg-black/30 p-2 rounded-xl shadow-lg mb-4 border border-white/10 max-w-2xl w-full">
                {selectedImage.type === 'video' ? (
                  <video
                    src={selectedImage.url}
                    poster={selectedImage.thumbnail}
                    controls
                    className="w-full max-h-[400px] object-contain rounded-lg"
                  />
                ) : (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.caption || 'Instagram photo'}
                    className="w-full max-h-[400px] object-contain rounded-lg"
                  />
                )}
                {selectedImage.caption && (
                  <p className="mt-3 text-sm text-white/70 px-2 line-clamp-3">{selectedImage.caption}</p>
                )}
                <div className="flex items-center justify-between mt-3 px-2">
                  <span className="text-xs text-white/40">{formatDate(selectedImage.timestamp)}</span>
                  <a
                    href={selectedImage.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300"
                  >
                    View on Instagram <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                Back to Library
              </button>
            </div>
          ) : (
            <>
              {/* Photos Tab - Instagram Integration */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  {/* Profile Header */}
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
                      <p className="text-white/60 mb-2">No photos yet</p>
                      <p className="text-white/40 text-sm mb-4">Instagram photos will appear here once configured</p>
                      <a
                        href={socialProfiles.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Visit Instagram <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Quick Links */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-white/70">Quick Links</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <a
                        href={`${socialProfiles.instagram.url}/reels`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-colors text-center border border-white/5"
                      >
                        <span className="text-2xl">🎬</span>
                        <p className="text-sm font-medium text-white/80 mt-2">Reels</p>
                      </a>
                      <a
                        href={socialProfiles.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors text-center border border-white/5"
                      >
                        <span className="text-2xl">📸</span>
                        <p className="text-sm font-medium text-white/80 mt-2">Posts</p>
                      </a>
                      <a
                        href={`${socialProfiles.instagram.url}/tagged`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 transition-colors text-center border border-white/5"
                      >
                        <span className="text-2xl">🏷️</span>
                        <p className="text-sm font-medium text-white/80 mt-2">Tagged</p>
                      </a>
                      <a
                        href={socialProfiles.github.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 transition-colors text-center border border-white/5"
                      >
                        <span className="text-2xl">💻</span>
                        <p className="text-sm font-medium text-white/80 mt-2">GitHub</p>
                      </a>
                    </div>
                  </div>
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
                          <span>⭐ {project.stars}</span>
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
