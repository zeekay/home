import React, { useState } from 'react';
import MacWindow from './MacWindow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Heart, 
  Lightbulb, 
  Code, 
  Database, 
  Shield, 
  Cpu, 
  Bot, 
  Music, 
  Palette, 
  Library
} from 'lucide-react';

interface MacSystemPreferencesWindowProps {
  onClose: () => void;
}

const MacSystemPreferencesWindow: React.FC<MacSystemPreferencesWindowProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  
  const interests = [
    { 
      category: "Technology",
      icon: <Code className="w-6 h-6 text-blue-500" />,
      items: ["Programming", "Functional Programming", "Distributed Systems", "Cryptography"]
    },
    { 
      category: "Computing",
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
      items: ["Quantum Computing", "ZK (Zero Knowledge) Proofs", "Cloud Architecture"]
    },
    { 
      category: "AI & Robotics",
      icon: <Bot className="w-6 h-6 text-green-500" />,
      items: ["Artificial Intelligence", "Machine Learning", "Robotics", "Neural Networks"]
    },
    { 
      category: "Arts",
      icon: <Palette className="w-6 h-6 text-orange-500" />,
      items: ["Music", "Art", "Photography", "Design"]
    },
    { 
      category: "Literature",
      icon: <Library className="w-6 h-6 text-yellow-500" />,
      items: ["Books", "Poetry", "Science Fiction", "Philosophy"]
    }
  ];
  
  return (
    <MacWindow
      title="System Preferences"
      onClose={onClose}
      initialPosition={{ x: 150, y: 80 }}
      initialSize={{ width: 720, height: 540 }}
      windowType="default"
      className="z-50"
    >
      <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-800 p-4">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <div className="grid grid-cols-6 gap-2 mb-4">
            <TabsList className="grid grid-cols-6 gap-2">
              <TabsTrigger value="profile" className="flex flex-col items-center p-2">
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="interests" className="flex flex-col items-center p-2">
                <Heart className="w-6 h-6 mb-1" />
                <span className="text-xs">Interests</span>
              </TabsTrigger>
              <TabsTrigger value="technology" className="flex flex-col items-center p-2">
                <Code className="w-6 h-6 mb-1" />
                <span className="text-xs">Tech</span>
              </TabsTrigger>
              <TabsTrigger value="computing" className="flex flex-col items-center p-2">
                <Cpu className="w-6 h-6 mb-1" />
                <span className="text-xs">Computing</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex flex-col items-center p-2">
                <Shield className="w-6 h-6 mb-1" />
                <span className="text-xs">Security</span>
              </TabsTrigger>
              <TabsTrigger value="arts" className="flex flex-col items-center p-2">
                <Music className="w-6 h-6 mb-1" />
                <span className="text-xs">Arts</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
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
          </TabsContent>

          <TabsContent value="interests" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Interests & Passions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {interests.map((category, idx) => (
                <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    {category.icon}
                    <h3 className="ml-2 text-lg font-medium">{category.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="technology" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Technology Interests</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium">Programming</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Passionate about various programming paradigms and languages.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium">Functional Programming</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Enthusiast of functional programming concepts and languages like Haskell and Elixir.</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium">Distributed Systems</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Interested in designing and building scalable distributed systems.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="computing" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Computing & Advanced Technologies</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-medium">Quantum Computing</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Fascinated by quantum algorithms and their potential to solve complex problems.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-medium">Zero-Knowledge Proofs</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Interested in cryptographic protocols that allow proving knowledge without revealing it.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-medium">Cryptography</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Enthusiast of cryptographic algorithms and their applications in security and privacy.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Security & Privacy</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-medium">Cryptography</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Passionate about encryption algorithms and secure communication protocols.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-medium">Privacy Engineering</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Interested in building systems that preserve user privacy by design.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-medium">Security Research</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Exploring vulnerabilities and security models for robust systems.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="arts" className="bg-white dark:bg-gray-900 rounded-md p-6 flex-1 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Arts & Literature</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-medium">Music</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Appreciates a wide range of musical genres and composition techniques.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-medium">Visual Arts</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Interested in various art forms and their historical context.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-medium">Literature</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Enthusiastic about books ranging from philosophy to science fiction.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MacWindow>
  );
};

export default MacSystemPreferencesWindow;
