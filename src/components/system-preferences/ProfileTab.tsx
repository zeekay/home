
import React from 'react';

const ProfileTab: React.FC = () => {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
          Z
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2">Zeek</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Developer & Tech Enthusiast</p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">About</h3>
            <p className="mt-1">Passionate about building innovative technologies and exploring the intersection of computer science, mathematics, and art.</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
            <p className="mt-1">Developer and researcher with interests in distributed systems, cryptography, quantum computing, AI, and the arts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
