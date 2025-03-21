
import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Image, Upload, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const MacPhotosWindow = ({ onClose }: { onClose: () => void }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample demo photos
  const demoPhotos = [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
  ];

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

  return (
    <MacWindow
      title="Photos"
      onClose={onClose}
      initialPosition={{ x: 180, y: 80 }}
      initialSize={{ width: 800, height: 600 }}
      windowType="default"
      className="bg-gray-100/95 dark:bg-gray-900/95"
    >
      <div className="h-full flex flex-col">
        <div className="bg-gray-200 dark:bg-gray-800 p-2 flex items-center space-x-2 border-b border-gray-300 dark:border-gray-700">
          <Button size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300">
            <Plus className="h-4 w-4 mr-1" />
            Album
          </Button>
          <div className="flex-1 relative">
            <Input
              placeholder="Search Photos"
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
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Recent Photos</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {demoPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="aspect-square bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onClick={() => setSelectedImage(photo)}
                    >
                      <img 
                        src={photo} 
                        alt={`Demo ${index}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Albums</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Memories', 'Vacation', 'Family', 'Work'].map((album, index) => (
                    <div 
                      key={index} 
                      className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-md shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center text-white">
                        <Image className="h-8 w-8 mb-1 opacity-80" />
                        <span className="text-sm font-medium">{album}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MacWindow>
  );
};

export default MacPhotosWindow;
