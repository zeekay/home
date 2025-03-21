
import React from 'react';
import { User, Image, Heart, MessageCircle, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const InstagramProfileEmbed = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-pink-500">
            <AvatarImage src="https://github.com/shadcn.png" alt="@zeekayai" />
            <AvatarFallback>ZK</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-lg">@zeekayai</h2>
              <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">Verified</span>
            </div>
            <p className="text-gray-500 text-sm">ZeeKay AI • Creative AI Developer</p>
            <p className="text-gray-500 text-xs flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" /> San Francisco, CA
            </p>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-sm">
          <div className="text-center">
            <div className="font-bold">210</div>
            <div className="text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold">15.4K</div>
            <div className="text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold">321</div>
            <div className="text-gray-500">Following</div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-sm">
          <p className="mb-2">Building AI-powered tools and interfaces. Sharing my journey in AI development and innovation.</p>
          <a href="#" className="text-blue-500">zeekay.ai</a>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1">
        <div className="aspect-square bg-gray-100 relative">
          <img 
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2" 
            alt="Coding setup" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-white mr-1" />
            <span className="text-white text-xs">245</span>
          </div>
        </div>
        <div className="aspect-square bg-gray-100 relative">
          <img 
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1" 
            alt="Tech" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-white mr-1" />
            <span className="text-white text-xs">132</span>
          </div>
        </div>
        <div className="aspect-square bg-gray-100 relative">
          <img 
            src="https://images.unsplash.com/photo-1496065187959-7f07b8353c55" 
            alt="Laptop" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-white mr-1" />
            <span className="text-white text-xs">187</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramProfileEmbed;
