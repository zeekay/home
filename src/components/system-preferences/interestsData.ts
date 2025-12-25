
import { InterestCategory } from './types';

export const interests: InterestCategory[] = [
  { 
    category: "Technology",
    icon: "Code",
    iconColor: "text-cyan-400",
    items: ["Programming", "Functional Programming", "Distributed Systems", "Cryptography"]
  },
  { 
    category: "Computing",
    icon: "Cpu",
    iconColor: "text-purple-400",
    items: ["Quantum Computing", "ZK (Zero Knowledge) Proofs", "Cloud Architecture"]
  },
  { 
    category: "AI & Robotics",
    icon: "Bot",
    iconColor: "text-emerald-400",
    items: ["Artificial Intelligence", "Machine Learning", "Robotics", "Neural Networks"]
  },
  { 
    category: "Arts",
    icon: "Palette",
    iconColor: "text-pink-400",
    items: ["Music", "Art", "Photography", "Design"]
  },
  { 
    category: "Literature",
    icon: "Library",
    iconColor: "text-amber-400",
    items: ["Books", "Poetry", "Science Fiction", "Philosophy"]
  }
];

export const technologyItems = [
  {
    title: "Programming",
    description: "Passionate about various programming paradigms and languages."
  },
  {
    title: "Functional Programming",
    description: "Enthusiast of functional programming concepts and languages like Haskell and Elixir."
  },
  {
    title: "Distributed Systems",
    description: "Interested in designing and building scalable distributed systems."
  }
];

export const computingItems = [
  {
    title: "Quantum Computing",
    description: "Fascinated by quantum algorithms and their potential to solve complex problems."
  },
  {
    title: "Zero-Knowledge Proofs",
    description: "Interested in cryptographic protocols that allow proving knowledge without revealing it."
  },
  {
    title: "Cryptography",
    description: "Enthusiast of cryptographic algorithms and their applications in security and privacy."
  }
];

export const securityItems = [
  {
    title: "Cryptography",
    description: "Passionate about encryption algorithms and secure communication protocols."
  },
  {
    title: "Privacy Engineering",
    description: "Interested in building systems that preserve user privacy by design."
  },
  {
    title: "Security Research",
    description: "Exploring vulnerabilities and security models for robust systems."
  }
];

export const artsItems = [
  {
    title: "Music",
    description: "Appreciates a wide range of musical genres and composition techniques."
  },
  {
    title: "Visual Arts",
    description: "Interested in various art forms and their historical context."
  },
  {
    title: "Literature",
    description: "Enthusiastic about books ranging from philosophy to science fiction."
  }
];
