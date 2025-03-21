
import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Link2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const ProfileTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">Profile</h2>
      
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
            Z
          </div>
          <button className="mt-3 w-full text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400">
            Change Photo
          </button>
        </div>
        
        <div className="flex-1 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Zeek</h2>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-0.5 rounded-full">Online</span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
              Developer & Tech Enthusiast
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>zeek@example.com</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>San Francisco, CA</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Joined January 2023</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <a href="#" className="text-blue-500 hover:underline">github.com/zeek</a>
            </div>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">About</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Passionate about building innovative technologies and exploring the intersection of computer science, mathematics, and art. 
          Developer and researcher with interests in distributed systems, cryptography, quantum computing, AI, and the arts.
        </p>
      </div>
      
      <div className="pt-4 flex justify-end space-x-3">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
          Edit Profile
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
