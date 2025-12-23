import React, { useState } from 'react';
import ZWindow from './ZWindow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Image, Upload, Plus, Search, ExternalLink, Instagram, Github, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { socialProfiles, pinnedProjects, professionalInfo } from '@/data/socials';

const ZPhotosWindow = ({ onClose }: { onClose: () => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'photos' | 'projects' | 'brands'>('photos');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
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

  return (
    <ZWindow
      title="Photos"
      onClose={onClose}
      initialPosition={{ x: 180, y: 80 }}
      initialSize={{ width: 800, height: 600 }}
      windowType="default"
      className="bg-gray-100/95 dark:bg-gray-900/95"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-200 dark:bg-gray-800 p-2 flex items-center space-x-2 border-b border-gray-300 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-300 dark:bg-gray-700 rounded-lg p-0.5">
            {(['photos', 'projects', 'brands'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex-1 relative">
            <Input
              placeholder="Search..."
              className="pl-8 bg-gray-100 dark:bg-gray-950 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2 top-2 text-gray-500" />
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-700 dark:text-gray-300"
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
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
              <div className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md mb-4">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="max-w-full max-h-[400px] object-contain rounded"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedImage(null)}
              >
                Back to Library
              </Button>
            </div>
          ) : (
            <>
              {/* Photos Tab - Instagram Integration */}
              {activeTab === 'photos' && (
                <div>
                  <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20 text-center">
                    <Instagram className="w-12 h-12 mx-auto mb-3 text-pink-500" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Instagram Photos</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      View photos and stories on Instagram @{socialProfiles.instagram.handle}
                    </p>
                    <a
                      href={socialProfiles.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Open Instagram <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Quick Links</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <a
                      href={`${socialProfiles.instagram.url}/reels`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-colors text-center"
                    >
                      <span className="text-2xl">🎬</span>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Reels</p>
                    </a>
                    <a
                      href={socialProfiles.instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors text-center"
                    >
                      <span className="text-2xl">📸</span>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Posts</p>
                    </a>
                    <a
                      href={`${socialProfiles.instagram.url}/tagged`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 transition-colors text-center"
                    >
                      <span className="text-2xl">🏷️</span>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">Tagged</p>
                    </a>
                    <a
                      href={socialProfiles.github.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-lg bg-gradient-to-br from-gray-500/20 to-gray-600/20 hover:from-gray-500/30 hover:to-gray-600/30 transition-colors text-center"
                    >
                      <span className="text-2xl">💻</span>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">GitHub</p>
                    </a>
                  </div>
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Pinned Projects</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pinnedProjects.map((project, index) => (
                      <a
                        key={index}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors">
                            {project.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
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
                  <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Companies & Projects</h3>
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
