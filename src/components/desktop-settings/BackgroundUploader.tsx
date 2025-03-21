
import React from 'react';
import { Image, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface BackgroundUploaderProps {
  uploadedImagePreview: string | null;
  setUploadedImagePreview: (value: string | null) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BackgroundUploader: React.FC<BackgroundUploaderProps> = ({
  uploadedImagePreview,
  setUploadedImagePreview,
  handleFileUpload
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm flex items-center justify-center"
        >
          <Image className="w-4 h-4 mr-2" />
          Upload Custom Background
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Custom Background</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            {uploadedImagePreview ? (
              <div className="relative">
                <img 
                  src={uploadedImagePreview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-md object-cover"
                />
                <button 
                  onClick={() => setUploadedImagePreview(null)}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Image className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundUploader;
