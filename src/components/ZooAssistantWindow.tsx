import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ZWindow from './ZWindow';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  MessageCircle,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  FileText,
  Tag,
  FolderOpen,
  Vote,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PenTool,
  Download,
  Share2,
  Settings,
  GitBranch,
  Beaker,
  Coins,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  ChevronDown,
  Copy,
  Star,
  Filter,
  SortAsc,
  RefreshCw,
  Lightbulb,
  Network,
  History,
  Save,
  Edit3,
  X,
  Hash,
  Link,
  Quote,
  Code,
  Maximize2,
} from 'lucide-react';

// ============================================================================
// Types and Interfaces
// ============================================================================

interface ZooAssistantWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  url: string;
  venue?: string;
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  venue: string;
  citationCount: number;
  url: string;
  keywords: string[];
  references?: string[];
  citedBy?: string[];
}

interface ZIP {
  id: string;
  number: number;
  title: string;
  status: 'draft' | 'review' | 'voting' | 'approved' | 'rejected' | 'implemented';
  author: string;
  created: Date;
  updated: Date;
  summary: string;
  content: string;
  votesFor: number;
  votesAgainst: number;
  comments: ZIPComment[];
  category: 'core' | 'research' | 'governance' | 'infrastructure';
}

interface ZIPComment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  projectId: string | null;
  tags: string[];
  created: Date;
  updated: Date;
  citations: Citation[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ResearchDAO {
  id: string;
  name: string;
  description: string;
  members: number;
  treasury: string;
  proposals: number;
  focus: string[];
}

interface FundingProposal {
  id: string;
  title: string;
  amount: string;
  status: 'pending' | 'funded' | 'rejected';
  requestor: string;
  description: string;
  daoId: string;
}

interface PeerReview {
  id: string;
  paperId: string;
  paperTitle: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: Date;
  assignedTo: string;
}

interface Contribution {
  id: string;
  type: 'paper' | 'review' | 'vote' | 'funding' | 'code';
  description: string;
  date: Date;
  impact: string;
}

interface UserSettings {
  citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee';
  exportFormat: 'markdown' | 'latex' | 'bibtex' | 'json';
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  autoSave: boolean;
  defaultProject: string | null;
}

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  CHAT_HISTORY: 'zoo-assistant-chat',
  NOTES: 'zoo-assistant-notes',
  PROJECTS: 'zoo-assistant-projects',
  ZIPS: 'zoo-assistant-zips',
  SETTINGS: 'zoo-assistant-settings',
  CONTRIBUTIONS: 'zoo-assistant-contributions',
};

// ============================================================================
// Utility Functions
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15);

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PAPERS: Paper[] = [
  {
    id: 'p1',
    title: 'Decentralized AI Training: A Survey of Federated Learning Approaches',
    authors: ['Alice Chen', 'Bob Smith', 'Carol Zhang'],
    abstract: 'This survey provides a comprehensive overview of federated learning techniques for training AI models in a decentralized manner. We examine privacy-preserving methods, communication efficiency, and convergence guarantees across heterogeneous data distributions.',
    year: 2024,
    venue: 'Journal of Machine Learning Research',
    citationCount: 145,
    url: 'https://arxiv.org/abs/2401.00001',
    keywords: ['federated learning', 'decentralized AI', 'privacy'],
    references: ['p2', 'p3'],
    citedBy: ['p4'],
  },
  {
    id: 'p2',
    title: 'Privacy-Preserving Deep Learning with Differential Privacy',
    authors: ['David Lee', 'Emma Wilson'],
    abstract: 'We propose a novel framework for training deep neural networks with differential privacy guarantees. Our method achieves state-of-the-art accuracy while maintaining strong privacy bounds.',
    year: 2023,
    venue: 'NeurIPS',
    citationCount: 312,
    url: 'https://arxiv.org/abs/2301.00002',
    keywords: ['differential privacy', 'deep learning', 'privacy'],
    references: [],
    citedBy: ['p1'],
  },
  {
    id: 'p3',
    title: 'Blockchain-Based Incentive Mechanisms for Collaborative AI',
    authors: ['Frank Zhou', 'Grace Kim'],
    abstract: 'This paper introduces a blockchain-based incentive mechanism for collaborative AI training. We design tokenomics that reward participants fairly based on their contributions.',
    year: 2024,
    venue: 'IEEE Transactions on Blockchain',
    citationCount: 78,
    url: 'https://arxiv.org/abs/2402.00003',
    keywords: ['blockchain', 'incentives', 'collaborative AI'],
    references: [],
    citedBy: ['p1'],
  },
  {
    id: 'p4',
    title: 'Scalable Decentralized Science: Infrastructure for Open Research',
    authors: ['Helen Wang', 'Ian Brown', 'Jane Doe'],
    abstract: 'We present DeSci infrastructure for scalable, open scientific research. Our system enables reproducible experiments, transparent peer review, and fair attribution using blockchain technology.',
    year: 2024,
    venue: 'ACM Conference on Computer-Supported Cooperative Work',
    citationCount: 56,
    url: 'https://arxiv.org/abs/2403.00004',
    keywords: ['DeSci', 'open science', 'blockchain'],
    references: ['p1'],
    citedBy: [],
  },
  {
    id: 'p5',
    title: 'Zero-Knowledge Proofs for Machine Learning Inference',
    authors: ['Kevin Liu', 'Laura Martinez'],
    abstract: 'We introduce zkML, a framework for verifiable machine learning inference using zero-knowledge proofs. Our approach enables trustless AI services on blockchain networks.',
    year: 2024,
    venue: 'Crypto',
    citationCount: 189,
    url: 'https://arxiv.org/abs/2404.00005',
    keywords: ['zero-knowledge proofs', 'machine learning', 'verification'],
    references: [],
    citedBy: [],
  },
];

const MOCK_DAOS: ResearchDAO[] = [
  {
    id: 'dao1',
    name: 'DeAI Research Collective',
    description: 'Funding and coordinating decentralized AI research initiatives',
    members: 1247,
    treasury: '2.5M ZOO',
    proposals: 34,
    focus: ['Federated Learning', 'Privacy', 'Incentives'],
  },
  {
    id: 'dao2',
    name: 'Open Science DAO',
    description: 'Supporting open access publications and reproducible research',
    members: 892,
    treasury: '1.8M ZOO',
    proposals: 28,
    focus: ['Open Access', 'Reproducibility', 'Peer Review'],
  },
  {
    id: 'dao3',
    name: 'Compute Commons',
    description: 'Decentralized compute infrastructure for AI research',
    members: 456,
    treasury: '3.2M ZOO',
    proposals: 12,
    focus: ['GPU Clusters', 'Training Infrastructure', 'Cost Sharing'],
  },
];

const MOCK_FUNDING_PROPOSALS: FundingProposal[] = [
  {
    id: 'fp1',
    title: 'Multi-modal Federated Learning Framework',
    amount: '50,000 ZOO',
    status: 'pending',
    requestor: 'alice.eth',
    description: 'Develop an open-source framework for federated learning across multiple data modalities.',
    daoId: 'dao1',
  },
  {
    id: 'fp2',
    title: 'Open Peer Review Platform',
    amount: '25,000 ZOO',
    status: 'funded',
    requestor: 'bob.eth',
    description: 'Build a decentralized peer review platform with on-chain reputation.',
    daoId: 'dao2',
  },
];

const MOCK_PEER_REVIEWS: PeerReview[] = [
  {
    id: 'pr1',
    paperId: 'p1',
    paperTitle: 'Decentralized AI Training: A Survey of Federated Learning Approaches',
    status: 'pending',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedTo: 'reviewer.eth',
  },
  {
    id: 'pr2',
    paperId: 'p4',
    paperTitle: 'Scalable Decentralized Science: Infrastructure for Open Research',
    status: 'in-progress',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    assignedTo: 'reviewer.eth',
  },
];

const DEFAULT_ZIPS: ZIP[] = [
  {
    id: 'zip1',
    number: 1,
    title: 'ZIP Purpose and Guidelines',
    status: 'implemented',
    author: 'zoo-core',
    created: new Date('2024-01-15'),
    updated: new Date('2024-01-20'),
    summary: 'Establishes the purpose, format, and workflow for Zoo Improvement Proposals.',
    content: `# ZIP-1: ZIP Purpose and Guidelines

## Abstract
This ZIP describes the Zoo Improvement Proposal process and establishes guidelines for creating and reviewing ZIPs.

## Motivation
A structured proposal process ensures transparent governance and community participation.

## Specification
- ZIPs must follow the standard format
- All ZIPs require community review period
- Voting threshold is 66% approval

## Implementation
Core team will implement ZIP tracking on zips.zoo.ngo`,
    votesFor: 156,
    votesAgainst: 12,
    comments: [],
    category: 'governance',
  },
  {
    id: 'zip2',
    number: 2,
    title: 'Decentralized Compute Credit System',
    status: 'voting',
    author: 'compute-wg',
    created: new Date('2024-02-01'),
    updated: new Date('2024-02-15'),
    summary: 'Proposes a credit system for allocating decentralized compute resources fairly.',
    content: `# ZIP-2: Decentralized Compute Credit System

## Abstract
A tokenized credit system for fair allocation of GPU compute resources.

## Motivation
Current compute allocation is centralized and inefficient.

## Specification
- Credits earned through contributions
- Time-based decay to prevent hoarding
- Priority queue based on credit balance`,
    votesFor: 89,
    votesAgainst: 34,
    comments: [
      { id: 'c1', author: 'alice.eth', content: 'Great proposal! Consider adding staking mechanism.', timestamp: new Date('2024-02-10') },
    ],
    category: 'infrastructure',
  },
  {
    id: 'zip3',
    number: 3,
    title: 'Research Bounty Program',
    status: 'review',
    author: 'research-dao',
    created: new Date('2024-03-01'),
    updated: new Date('2024-03-05'),
    summary: 'Establishes bounties for key research challenges in decentralized AI.',
    content: `# ZIP-3: Research Bounty Program

## Abstract
A bounty program to incentivize solutions to critical research problems.

## Motivation
Attract top researchers by offering competitive bounties.

## Bounty Categories
1. Privacy-preserving inference (50k ZOO)
2. Efficient federated aggregation (30k ZOO)
3. Byzantine-resilient training (40k ZOO)`,
    votesFor: 45,
    votesAgainst: 8,
    comments: [],
    category: 'research',
  },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 'proj1', name: 'Federated Learning', description: 'Research on FL techniques', color: '#3B82F6' },
  { id: 'proj2', name: 'DeSci Infrastructure', description: 'Building open science tools', color: '#10B981' },
  { id: 'proj3', name: 'zkML', description: 'Zero-knowledge machine learning', color: '#8B5CF6' },
];

const DEFAULT_SETTINGS: UserSettings = {
  citationStyle: 'apa',
  exportFormat: 'markdown',
  theme: 'dark',
  notificationsEnabled: true,
  autoSave: true,
  defaultProject: null,
};

// ============================================================================
// AI Response Generator
// ============================================================================

const generateAIResponse = (userMessage: string, papers: Paper[]): { content: string; citations: Citation[] } => {
  const lowerMessage = userMessage.toLowerCase();
  const citations: Citation[] = [];
  let content = '';

  if (lowerMessage.includes('federated') || lowerMessage.includes('decentralized')) {
    content = `Great question about decentralized AI! Federated learning has emerged as a key approach for training models across distributed data sources while preserving privacy.

Key concepts:
- **Privacy Preservation**: Data never leaves local devices
- **Communication Efficiency**: Only model updates are shared
- **Heterogeneous Data**: Handles non-IID data distributions

Recent work [1] provides a comprehensive survey of these techniques. For privacy guarantees, differential privacy approaches [2] offer formal bounds.

Would you like me to dive deeper into any specific aspect?`;

    citations.push({
      id: 'c1',
      title: MOCK_PAPERS[0].title,
      authors: MOCK_PAPERS[0].authors,
      year: MOCK_PAPERS[0].year,
      url: MOCK_PAPERS[0].url,
      venue: MOCK_PAPERS[0].venue,
    });
    citations.push({
      id: 'c2',
      title: MOCK_PAPERS[1].title,
      authors: MOCK_PAPERS[1].authors,
      year: MOCK_PAPERS[1].year,
      url: MOCK_PAPERS[1].url,
      venue: MOCK_PAPERS[1].venue,
    });
  } else if (lowerMessage.includes('desci') || lowerMessage.includes('open science')) {
    content = `DeSci (Decentralized Science) is transforming how research is conducted, funded, and shared.

Core principles:
- **Open Access**: Research should be freely available
- **Transparent Review**: Peer review on-chain
- **Fair Attribution**: Contributors are properly credited
- **Community Governance**: Research direction decided collectively

The Zoo Foundation is building infrastructure for DeSci [1]. Check out our ZIPs for governance proposals!

Would you like to explore specific DeSci initiatives?`;

    citations.push({
      id: 'c1',
      title: MOCK_PAPERS[3].title,
      authors: MOCK_PAPERS[3].authors,
      year: MOCK_PAPERS[3].year,
      url: MOCK_PAPERS[3].url,
      venue: MOCK_PAPERS[3].venue,
    });
  } else if (lowerMessage.includes('zkml') || lowerMessage.includes('zero-knowledge')) {
    content = `zkML (Zero-Knowledge Machine Learning) enables verifiable AI inference without revealing model weights or inputs.

Applications:
- **Trustless AI Services**: Verify predictions on-chain
- **Model IP Protection**: Prove inference without exposing model
- **Privacy-Preserving Inference**: Hide sensitive inputs

Recent advances [1] make zkML increasingly practical. This is a hot research area at Zoo Labs!

Want to learn about specific zkML implementations?`;

    citations.push({
      id: 'c1',
      title: MOCK_PAPERS[4].title,
      authors: MOCK_PAPERS[4].authors,
      year: MOCK_PAPERS[4].year,
      url: MOCK_PAPERS[4].url,
      venue: MOCK_PAPERS[4].venue,
    });
  } else if (lowerMessage.includes('zip') || lowerMessage.includes('proposal')) {
    content = `Zoo Improvement Proposals (ZIPs) are how we govern and evolve the Zoo ecosystem.

Current active areas:
- **Governance**: How decisions are made
- **Infrastructure**: Compute and storage systems
- **Research**: Bounties and priorities
- **Core**: Protocol changes

You can browse ZIPs in the ZIPs tab, or draft your own! Community participation is essential.

Would you like help drafting a ZIP?`;
  } else {
    content = `I'm the Zoo Research Assistant, here to help with:

- **Paper Search**: Find relevant research papers
- **Research Notes**: Organize your findings
- **ZIPs**: Browse and create governance proposals
- **DeSci**: Explore decentralized science initiatives

Try asking about:
- "What is federated learning?"
- "Explain zkML"
- "Tell me about DeSci"
- "How do ZIPs work?"

What would you like to explore?`;
  }

  return { content, citations };
};

// ============================================================================
// Sub-Components
// ============================================================================

// Markdown-like renderer for chat messages
const MessageContent: React.FC<{ content: string; citations?: Citation[] }> = ({ content, citations }) => {
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-lg font-bold mt-2 mb-1">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-base font-semibold mt-2 mb-1">{line.slice(3)}</h2>;
      }

      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          return (
            <div key={i} className="flex gap-2 ml-2 my-0.5">
              <span className="text-purple-400">*</span>
              <span><strong className="text-purple-300">{match[1]}</strong>: {match[2]}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-2 my-0.5">
            <span className="text-purple-400">*</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      }

      const numMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        return (
          <div key={i} className="flex gap-2 ml-2 my-0.5">
            <span className="text-purple-400 w-4">{numMatch[1]}.</span>
            <span>{numMatch[2]}</span>
          </div>
        );
      }

      const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-purple-300">$1</strong>');
      const citeParsed = boldParsed.replace(/\[(\d+)\]/g, '<sup class="text-purple-400 cursor-pointer hover:underline">[$1]</sup>');

      if (!line.trim()) return <div key={i} className="h-2" />;

      return <p key={i} className="my-1" dangerouslySetInnerHTML={{ __html: citeParsed }} />;
    });
  };

  return (
    <div className="text-sm leading-relaxed">
      {renderContent(content)}
      {citations && citations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-white/50 mb-2">References:</div>
          {citations.map((cite, i) => (
            <a
              key={cite.id}
              href={cite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-purple-400 hover:text-purple-300 my-1"
            >
              [{i + 1}] {cite.authors.slice(0, 2).join(', ')}{cite.authors.length > 2 ? ' et al.' : ''} ({cite.year}). {cite.title}. <ExternalLink className="inline w-3 h-3 ml-1" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Paper card component
const PaperCard: React.FC<{ paper: Paper; onSaveNote: (paper: Paper) => void }> = ({ paper, onSaveNote }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm leading-tight">{paper.title}</h3>
          <p className="text-white/60 text-xs mt-1">
            {paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''} - {paper.year}
          </p>
          <p className="text-white/50 text-xs mt-0.5">{paper.venue}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-purple-400">{paper.citationCount} citations</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSaveNote(paper)}
              className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Save to notes"
            >
              <Save className="w-4 h-4" />
            </button>
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Open paper"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 mt-2"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {expanded ? 'Hide abstract' : 'Show abstract'}
      </button>

      {expanded && (
        <div className="mt-2">
          <p className="text-white/70 text-xs leading-relaxed">{paper.abstract}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {paper.keywords.map(kw => (
              <span key={kw} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ZIP card component
const ZIPCard: React.FC<{
  zip: ZIP;
  onSelect: (zip: ZIP) => void;
  onVote: (zipId: string, vote: 'for' | 'against') => void;
}> = ({ zip, onSelect, onVote }) => {
  const statusColors: Record<ZIP['status'], string> = {
    draft: 'bg-gray-500',
    review: 'bg-yellow-500',
    voting: 'bg-purple-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    implemented: 'bg-blue-500',
  };

  const categoryColors: Record<ZIP['category'], string> = {
    core: 'text-red-400',
    research: 'text-green-400',
    governance: 'text-yellow-400',
    infrastructure: 'text-blue-400',
  };

  return (
    <div
      className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => onSelect(zip)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs font-mono">ZIP-{zip.number}</span>
            <span className={cn("px-2 py-0.5 rounded text-xs text-white", statusColors[zip.status])}>
              {zip.status}
            </span>
            <span className={cn("text-xs", categoryColors[zip.category])}>
              {zip.category}
            </span>
          </div>
          <h3 className="text-white font-medium text-sm mt-1">{zip.title}</h3>
          <p className="text-white/60 text-xs mt-1 line-clamp-2">{zip.summary}</p>
        </div>
      </div>

      {zip.status === 'voting' && (
        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(zip.votesFor / (zip.votesFor + zip.votesAgainst)) * 100}%` }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onVote(zip.id, 'for'); }}
              className="flex items-center gap-1 px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-xs"
            >
              <ThumbsUp className="w-3 h-3" /> {zip.votesFor}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onVote(zip.id, 'against'); }}
              className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-xs"
            >
              <ThumbsDown className="w-3 h-3" /> {zip.votesAgainst}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
        <span>by {zip.author}</span>
        <span>{formatDate(zip.updated)}</span>
        <span>{zip.comments.length} comments</span>
      </div>
    </div>
  );
};

// Note card component
const NoteCard: React.FC<{
  note: ResearchNote;
  projects: Project[];
  onSelect: (note: ResearchNote) => void;
  onDelete: (id: string) => void;
}> = ({ note, projects, onSelect, onDelete }) => {
  const project = projects.find(p => p.id === note.projectId);

  return (
    <div
      className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => onSelect(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">{note.title || 'Untitled'}</h3>
          <p className="text-white/50 text-xs mt-1 line-clamp-2">
            {note.content.replace(/[#*_]/g, '').substring(0, 100) || 'Empty note'}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {project && (
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: `${project.color}20`, color: project.color }}
          >
            {project.name}
          </span>
        )}
        {note.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">
            #{tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-white/30 mt-2">
        {formatDate(note.updated)}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ZooAssistantWindow: React.FC<ZooAssistantWindowProps> = ({ onClose, onFocus }) => {
  // Active tab
  const [activeTab, setActiveTab] = useState('chat');

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (e) {
      logger.error('Failed to load chat history:', e);
    }
    return [{
      id: generateId(),
      role: 'assistant',
      content: `Welcome to Zoo Research Assistant! I can help you with:

- **Paper Search**: Find relevant research papers
- **Research Notes**: Organize your findings
- **ZIPs**: Browse and create governance proposals
- **DeSci**: Explore decentralized science initiatives

What would you like to explore today?`,
      timestamp: new Date(),
      citations: [],
    }];
  });
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Research state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<ResearchNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((n: ResearchNote) => ({
          ...n,
          created: new Date(n.created),
          updated: new Date(n.updated),
        }));
      }
    } catch (e) {
      logger.error('Failed to load notes:', e);
    }
    return [];
  });
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [noteFilter, setNoteFilter] = useState<string | null>(null);
  const [noteTagFilter, setNoteTagFilter] = useState<string | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.error('Failed to load projects:', e);
    }
    return DEFAULT_PROJECTS;
  });

  // ZIPs state
  const [zips, setZips] = useState<ZIP[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ZIPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((z: ZIP) => ({
          ...z,
          created: new Date(z.created),
          updated: new Date(z.updated),
          comments: z.comments.map((c: ZIPComment) => ({ ...c, timestamp: new Date(c.timestamp) })),
        }));
      }
    } catch (e) {
      logger.error('Failed to load ZIPs:', e);
    }
    return DEFAULT_ZIPS;
  });
  const [selectedZIP, setSelectedZIP] = useState<ZIP | null>(null);
  const [zipFilter, setZipFilter] = useState<ZIP['status'] | 'all'>('all');
  const [draftingZIP, setDraftingZIP] = useState(false);
  const [newZIPTitle, setNewZIPTitle] = useState('');
  const [newZIPSummary, setNewZIPSummary] = useState('');
  const [newZIPContent, setNewZIPContent] = useState('');
  const [newZIPCategory, setNewZIPCategory] = useState<ZIP['category']>('research');

  // DeSci state
  const [daos] = useState<ResearchDAO[]>(MOCK_DAOS);
  const [fundingProposals] = useState<FundingProposal[]>(MOCK_FUNDING_PROPOSALS);
  const [peerReviews] = useState<PeerReview[]>(MOCK_PEER_REVIEWS);
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: Contribution) => ({ ...c, date: new Date(c.date) }));
      }
    } catch (e) {
      logger.error('Failed to load contributions:', e);
    }
    return [
      { id: 'con1', type: 'review', description: 'Reviewed ZIP-2: Compute Credit System', date: new Date('2024-02-10'), impact: '+50 reputation' },
      { id: 'con2', type: 'vote', description: 'Voted on 5 governance proposals', date: new Date('2024-02-15'), impact: '+10 reputation' },
    ];
  });

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // UI state
  const [desciTab, setDesciTab] = useState<'daos' | 'funding' | 'reviews' | 'history'>('daos');

  // Effects - Save to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatMessages)); } catch (e) { logger.error('Failed to save chat:', e); }
  }, [chatMessages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); } catch (e) { logger.error('Failed to save notes:', e); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects)); } catch (e) { logger.error('Failed to save projects:', e); }
  }, [projects]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ZIPS, JSON.stringify(zips)); } catch (e) { logger.error('Failed to save ZIPs:', e); }
  }, [zips]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch (e) { logger.error('Failed to save settings:', e); }
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions)); } catch (e) { logger.error('Failed to save contributions:', e); }
  }, [contributions]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // Handlers
  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { content, citations } = generateAIResponse(userMessage.content, MOCK_PAPERS);
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        citations,
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [chatInput]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = MOCK_PAPERS.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.abstract.toLowerCase().includes(query) ||
        p.keywords.some(k => k.toLowerCase().includes(query)) ||
        p.authors.some(a => a.toLowerCase().includes(query))
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, [searchQuery]);

  const createNote = useCallback((paper?: Paper) => {
    const newNote: ResearchNote = {
      id: generateId(),
      title: paper ? `Notes: ${paper.title}` : 'New Note',
      content: paper
        ? `# ${paper.title}\n\n**Authors:** ${paper.authors.join(', ')}\n**Year:** ${paper.year}\n**Venue:** ${paper.venue}\n\n## Abstract\n${paper.abstract}\n\n## Key Findings\n- \n\n## Notes\n`
        : '',
      projectId: settings.defaultProject,
      tags: paper ? paper.keywords : [],
      created: new Date(),
      updated: new Date(),
      citations: paper ? [{ id: paper.id, title: paper.title, authors: paper.authors, year: paper.year, url: paper.url, venue: paper.venue }] : [],
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setActiveTab('notes');
  }, [settings.defaultProject]);

  const updateNote = useCallback((id: string, updates: Partial<ResearchNote>) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updates, updated: new Date() } : note));
    if (selectedNote?.id === id) {
      setSelectedNote(prev => prev ? { ...prev, ...updates, updated: new Date() } : null);
    }
  }, [selectedNote]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  }, [selectedNote]);

  const createZIP = useCallback(() => {
    if (!newZIPTitle.trim() || !newZIPSummary.trim()) return;

    const newZIP: ZIP = {
      id: generateId(),
      number: Math.max(...zips.map(z => z.number), 0) + 1,
      title: newZIPTitle.trim(),
      status: 'draft',
      author: 'you.eth',
      created: new Date(),
      updated: new Date(),
      summary: newZIPSummary.trim(),
      content: newZIPContent || `# ${newZIPTitle}\n\n## Abstract\n${newZIPSummary}\n\n## Motivation\n\n## Specification\n\n## Implementation\n`,
      votesFor: 0,
      votesAgainst: 0,
      comments: [],
      category: newZIPCategory,
    };

    setZips(prev => [newZIP, ...prev]);
    setDraftingZIP(false);
    setNewZIPTitle('');
    setNewZIPSummary('');
    setNewZIPContent('');
    setNewZIPCategory('research');
    setSelectedZIP(newZIP);

    setContributions(prev => [{ id: generateId(), type: 'paper', description: `Drafted ZIP-${newZIP.number}: ${newZIP.title}`, date: new Date(), impact: '+100 reputation' }, ...prev]);
  }, [newZIPTitle, newZIPSummary, newZIPContent, newZIPCategory, zips]);

  const voteOnZIP = useCallback((zipId: string, vote: 'for' | 'against') => {
    setZips(prev => prev.map(zip =>
      zip.id === zipId
        ? { ...zip, votesFor: vote === 'for' ? zip.votesFor + 1 : zip.votesFor, votesAgainst: vote === 'against' ? zip.votesAgainst + 1 : zip.votesAgainst, updated: new Date() }
        : zip
    ));
    setContributions(prev => [{ id: generateId(), type: 'vote', description: `Voted ${vote} on ZIP`, date: new Date(), impact: '+5 reputation' }, ...prev]);
  }, []);

  const exportNotes = useCallback(() => {
    let content = '';
    const format = settings.exportFormat;

    if (format === 'markdown') {
      notes.forEach(note => { content += `# ${note.title}\n\n${note.content}\n\n---\n\n`; });
    } else if (format === 'json') {
      content = JSON.stringify(notes, null, 2);
    } else if (format === 'bibtex') {
      notes.forEach(note => {
        note.citations.forEach(cite => {
          content += `@article{${cite.id},\n  title={${cite.title}},\n  author={${cite.authors.join(' and ')}},\n  year={${cite.year}},\n  url={${cite.url}}\n}\n\n`;
        });
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zoo-research-${new Date().toISOString().split('T')[0]}.${format === 'bibtex' ? 'bib' : format === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes, settings.exportFormat]);

  // Filtered Data
  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (noteFilter) filtered = filtered.filter(n => n.projectId === noteFilter);
    if (noteTagFilter) filtered = filtered.filter(n => n.tags.includes(noteTagFilter));
    return filtered.sort((a, b) => b.updated.getTime() - a.updated.getTime());
  }, [notes, noteFilter, noteTagFilter]);

  const filteredZIPs = useMemo(() => {
    if (zipFilter === 'all') return zips;
    return zips.filter(z => z.status === zipFilter);
  }, [zips, zipFilter]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [notes]);

  return (
    <ZWindow
      title="Zoo Research Assistant"
      onClose={onClose}
      onFocus={onFocus}
      initialSize={{ width: 1100, height: 700 }}
      initialPosition={{ x: 80, y: 60 }}
      windowType="default"
    >
      <div className="flex h-full bg-[#1a1a2e]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-b border-white/10">
            <TabsList className="bg-transparent">
              <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <MessageCircle className="w-4 h-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="research" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <Search className="w-4 h-4" /> Research
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <FileText className="w-4 h-4" /> Notes
              </TabsTrigger>
              <TabsTrigger value="zips" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <Vote className="w-4 h-4" /> ZIPs
              </TabsTrigger>
              <TabsTrigger value="desci" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <Beaker className="w-4 h-4" /> DeSci
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                <Settings className="w-4 h-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <a href="https://zoo.ngo" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                zoo.ngo <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://zips.zoo.ngo" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                zips.zoo.ngo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3", msg.role === 'user' ? 'bg-purple-500 text-white rounded-br-md' : 'bg-white/10 text-white rounded-bl-md')}>
                    <MessageContent content={msg.content} citations={msg.citations} />
                    <div className="text-xs text-white/40 mt-2 text-right">{formatDate(msg.timestamp)}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} placeholder="Ask about federated learning, DeSci, ZIPs..." className="flex-1 px-4 py-3 bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/40" />
                <button onClick={handleSendMessage} disabled={!chatInput.trim()} className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl transition-colors">
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research" className="flex-1 flex flex-col m-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                  <Search className="w-4 h-4 text-white/40" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search papers (e.g., federated learning, privacy, zkML)" className="flex-1 bg-transparent text-white placeholder-white/40 outline-none" />
                </div>
                <button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 rounded-lg text-white text-sm transition-colors">
                  {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                <span>Quick searches:</span>
                {['federated learning', 'privacy', 'DeSci', 'zkML', 'blockchain'].map(term => (
                  <button key={term} onClick={() => { setSearchQuery(term); handleSearch(); }} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors">{term}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{searchResults.length} papers found</span>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
                      <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"><SortAsc className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {searchResults.map(paper => (<PaperCard key={paper.id} paper={paper} onSaveNote={createNote} />))}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                  <p>No papers found for "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try different keywords or check spelling</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <Search className="w-16 h-16 mb-4 opacity-50" />
                  <p>Search for research papers</p>
                  <p className="text-sm mt-2">Enter keywords to find relevant papers from Semantic Scholar</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="flex-1 flex m-0 overflow-hidden">
            <div className="w-64 bg-[#16162a] border-r border-white/10 flex flex-col">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/70 text-sm font-medium">Knowledge Base</span>
                <button onClick={() => createNote()} className="p-1.5 rounded hover:bg-white/10 text-purple-400 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>

              <div className="p-2 border-b border-white/10">
                <div className="text-xs text-white/40 px-2 mb-1">Projects</div>
                <button onClick={() => setNoteFilter(null)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors", noteFilter === null ? "bg-purple-500/20 text-purple-300" : "text-white/60 hover:bg-white/10")}>
                  <FolderOpen className="w-4 h-4" /> All Notes <span className="ml-auto text-xs text-white/40">{notes.length}</span>
                </button>
                {projects.map(proj => (
                  <button key={proj.id} onClick={() => setNoteFilter(proj.id)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors", noteFilter === proj.id ? "bg-purple-500/20 text-purple-300" : "text-white/60 hover:bg-white/10")}>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: proj.color }} />
                    {proj.name}
                    <span className="ml-auto text-xs text-white/40">{notes.filter(n => n.projectId === proj.id).length}</span>
                  </button>
                ))}
              </div>

              <div className="p-2 border-b border-white/10">
                <div className="text-xs text-white/40 px-2 mb-1">Tags</div>
                <div className="flex flex-wrap gap-1 px-2">
                  {allTags.slice(0, 10).map(tag => (
                    <button key={tag} onClick={() => setNoteTagFilter(noteTagFilter === tag ? null : tag)} className={cn("px-2 py-0.5 rounded text-xs transition-colors", noteTagFilter === tag ? "bg-purple-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20")}>#{tag}</button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredNotes.map(note => (<NoteCard key={note.id} note={note} projects={projects} onSelect={setSelectedNote} onDelete={deleteNote} />))}
              </div>

              <div className="p-3 border-t border-white/10">
                <button onClick={exportNotes} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white/60 text-sm transition-colors">
                  <Download className="w-4 h-4" /> Export All
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {selectedNote ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <input type="text" value={selectedNote.title} onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })} className="text-lg font-medium text-white bg-transparent outline-none flex-1" placeholder="Note title" />
                    <div className="flex items-center gap-2">
                      <select value={selectedNote.projectId || ''} onChange={(e) => updateNote(selectedNote.id, { projectId: e.target.value || null })} className="px-2 py-1 bg-white/5 rounded text-white text-sm outline-none">
                        <option value="">No project</option>
                        {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                      </select>
                      <button onClick={() => setSelectedNote(null)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-white/40" />
                    <div className="flex flex-wrap gap-1">
                      {selectedNote.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs flex items-center gap-1">
                          #{tag}
                          <button onClick={() => updateNote(selectedNote.id, { tags: selectedNote.tags.filter(t => t !== tag) })} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      <input type="text" placeholder="Add tag..." className="bg-transparent text-white text-xs outline-none w-20" onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          const tag = (e.target as HTMLInputElement).value.trim();
                          if (!selectedNote.tags.includes(tag)) updateNote(selectedNote.id, { tags: [...selectedNote.tags, tag] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }} />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <textarea value={selectedNote.content} onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })} className="w-full h-full p-4 bg-transparent text-white/90 resize-none outline-none font-mono text-sm leading-relaxed" placeholder="Start writing..." />
                  </div>

                  <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                    <span>Last edited {formatDate(selectedNote.updated)}</span>
                    <span>{selectedNote.citations.length} citations</span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">Select a note or create a new one</p>
                  <button onClick={() => createNote()} className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white text-sm transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />New Note
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ZIPs Tab */}
          <TabsContent value="zips" className="flex-1 flex m-0 overflow-hidden">
            <div className="w-80 bg-[#16162a] border-r border-white/10 flex flex-col">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white/70 text-sm font-medium">Zoo Improvement Proposals</span>
                <button onClick={() => setDraftingZIP(true)} className="p-1.5 rounded hover:bg-white/10 text-purple-400 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>

              <div className="p-2 border-b border-white/10 flex flex-wrap gap-1">
                {(['all', 'draft', 'review', 'voting', 'approved', 'implemented'] as const).map(status => (
                  <button key={status} onClick={() => setZipFilter(status)} className={cn("px-2 py-1 rounded text-xs transition-colors", zipFilter === status ? "bg-purple-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20")}>{status}</button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredZIPs.map(zip => (<ZIPCard key={zip.id} zip={zip} onSelect={setSelectedZIP} onVote={voteOnZIP} />))}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {draftingZIP ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="text-white font-medium">Draft New ZIP</span>
                    <button onClick={() => setDraftingZIP(false)} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                      <label className="text-white/60 text-sm block mb-1">Title</label>
                      <input type="text" value={newZIPTitle} onChange={(e) => setNewZIPTitle(e.target.value)} placeholder="ZIP title" className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm block mb-1">Category</label>
                      <select value={newZIPCategory} onChange={(e) => setNewZIPCategory(e.target.value as ZIP['category'])} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="core">Core</option>
                        <option value="research">Research</option>
                        <option value="governance">Governance</option>
                        <option value="infrastructure">Infrastructure</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/60 text-sm block mb-1">Summary</label>
                      <textarea value={newZIPSummary} onChange={(e) => setNewZIPSummary(e.target.value)} placeholder="Brief summary of the proposal" rows={3} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm block mb-1">Content (Markdown)</label>
                      <textarea value={newZIPContent} onChange={(e) => setNewZIPContent(e.target.value)} placeholder="# ZIP Title&#10;&#10;## Abstract&#10;&#10;## Motivation&#10;&#10;## Specification&#10;&#10;## Implementation" rows={10} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" />
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/10">
                    <button onClick={createZIP} disabled={!newZIPTitle.trim() || !newZIPSummary.trim()} className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:cursor-not-allowed rounded text-white transition-colors">Submit Draft</button>
                  </div>
                </>
              ) : selectedZIP ? (
                <>
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <span className="font-mono">ZIP-{selectedZIP.number}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs text-white", { 'bg-gray-500': selectedZIP.status === 'draft', 'bg-yellow-500': selectedZIP.status === 'review', 'bg-purple-500': selectedZIP.status === 'voting', 'bg-green-500': selectedZIP.status === 'approved', 'bg-red-500': selectedZIP.status === 'rejected', 'bg-blue-500': selectedZIP.status === 'implemented' })}>{selectedZIP.status}</span>
                    </div>
                    <h2 className="text-xl font-medium text-white mt-1">{selectedZIP.title}</h2>
                    <p className="text-white/60 text-sm mt-1">by {selectedZIP.author} * {formatDate(selectedZIP.updated)}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {selectedZIP.content.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white mt-3 mb-2">{line.slice(3)}</h2>;
                        if (line.startsWith('- ')) return <li key={i} className="text-white/80 ml-4">{line.slice(2)}</li>;
                        if (!line.trim()) return <br key={i} />;
                        return <p key={i} className="text-white/80 my-1">{line}</p>;
                      })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <h3 className="text-white font-medium mb-3">Comments ({selectedZIP.comments.length})</h3>
                      {selectedZIP.comments.length > 0 ? (
                        <div className="space-y-3">
                          {selectedZIP.comments.map(comment => (
                            <div key={comment.id} className="bg-white/5 rounded p-3">
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <span className="text-purple-400">{comment.author}</span>
                                <span>{formatDate(comment.timestamp)}</span>
                              </div>
                              <p className="text-white/80 text-sm mt-1">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (<p className="text-white/40 text-sm">No comments yet</p>)}
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/10 flex items-center gap-2">
                    <input type="text" placeholder="Add a comment..." className="flex-1 px-3 py-2 bg-white/5 rounded text-white text-sm outline-none focus:ring-2 focus:ring-purple-500" onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        const content = (e.target as HTMLInputElement).value.trim();
                        setZips(prev => prev.map(z => z.id === selectedZIP.id ? { ...z, comments: [...z.comments, { id: generateId(), author: 'you.eth', content, timestamp: new Date() }] } : z));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }} />
                    {selectedZIP.status === 'voting' && (
                      <div className="flex gap-2">
                        <button onClick={() => voteOnZIP(selectedZIP.id, 'for')} className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded text-green-400 text-sm flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> Vote For</button>
                        <button onClick={() => voteOnZIP(selectedZIP.id, 'against')} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-sm flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> Vote Against</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                  <Vote className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg">Select a ZIP or draft a new one</p>
                  <button onClick={() => setDraftingZIP(true)} className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white text-sm transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />Draft New ZIP
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* DeSci Tab */}
          <TabsContent value="desci" className="flex-1 flex flex-col m-0 overflow-hidden">
            <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10">
              {[{ id: 'daos', label: 'Research DAOs', icon: Users }, { id: 'funding', label: 'Funding', icon: Coins }, { id: 'reviews', label: 'Peer Review', icon: Eye }, { id: 'history', label: 'Contributions', icon: History }].map(tab => (
                <button key={tab.id} onClick={() => setDesciTab(tab.id as typeof desciTab)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors", desciTab === tab.id ? "bg-purple-500/20 text-purple-300" : "text-white/60 hover:bg-white/10")}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {desciTab === 'daos' && (
                <div className="space-y-4">
                  <h2 className="text-white font-medium">Research DAOs</h2>
                  <div className="grid gap-4">
                    {daos.map(dao => (
                      <div key={dao.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-medium">{dao.name}</h3>
                            <p className="text-white/60 text-sm mt-1">{dao.description}</p>
                          </div>
                          <a href="#" className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 text-sm">Join</a>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                          <span>{dao.members} members</span>
                          <span>{dao.treasury} treasury</span>
                          <span>{dao.proposals} proposals</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dao.focus.map(f => (<span key={f} className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">{f}</span>))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {desciTab === 'funding' && (
                <div className="space-y-4">
                  <h2 className="text-white font-medium">Funding Proposals</h2>
                  <div className="grid gap-4">
                    {fundingProposals.map(proposal => (
                      <div key={proposal.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-medium">{proposal.title}</h3>
                            <p className="text-white/60 text-sm mt-1">{proposal.description}</p>
                          </div>
                          <span className={cn("px-2 py-1 rounded text-xs", { 'bg-yellow-500/20 text-yellow-400': proposal.status === 'pending', 'bg-green-500/20 text-green-400': proposal.status === 'funded', 'bg-red-500/20 text-red-400': proposal.status === 'rejected' })}>{proposal.status}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                          <span className="text-purple-400 font-medium">{proposal.amount}</span>
                          <span>by {proposal.requestor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {desciTab === 'reviews' && (
                <div className="space-y-4">
                  <h2 className="text-white font-medium">Peer Review Queue</h2>
                  <div className="grid gap-4">
                    {peerReviews.map(review => (
                      <div key={review.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-medium">{review.paperTitle}</h3>
                            <p className="text-white/60 text-sm mt-1">Deadline: {formatDate(review.deadline)}</p>
                          </div>
                          <span className={cn("px-2 py-1 rounded text-xs", { 'bg-yellow-500/20 text-yellow-400': review.status === 'pending', 'bg-blue-500/20 text-blue-400': review.status === 'in-progress', 'bg-green-500/20 text-green-400': review.status === 'completed' })}>{review.status}</span>
                        </div>
                        {review.status === 'pending' && (<button className="mt-3 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 text-sm">Start Review</button>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {desciTab === 'history' && (
                <div className="space-y-4">
                  <h2 className="text-white font-medium">Your Contributions</h2>
                  <div className="grid gap-2">
                    {contributions.map(contribution => (
                      <div key={contribution.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", { 'bg-blue-500/20': contribution.type === 'paper', 'bg-green-500/20': contribution.type === 'review', 'bg-purple-500/20': contribution.type === 'vote', 'bg-yellow-500/20': contribution.type === 'funding', 'bg-orange-500/20': contribution.type === 'code' })}>
                            {contribution.type === 'paper' && <FileText className="w-4 h-4 text-blue-400" />}
                            {contribution.type === 'review' && <Eye className="w-4 h-4 text-green-400" />}
                            {contribution.type === 'vote' && <Vote className="w-4 h-4 text-purple-400" />}
                            {contribution.type === 'funding' && <Coins className="w-4 h-4 text-yellow-400" />}
                            {contribution.type === 'code' && <GitBranch className="w-4 h-4 text-orange-400" />}
                          </div>
                          <div>
                            <p className="text-white text-sm">{contribution.description}</p>
                            <p className="text-white/40 text-xs">{formatDate(contribution.date)}</p>
                          </div>
                        </div>
                        <span className="text-green-400 text-sm">{contribution.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 m-0">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-white font-medium text-lg">Settings</h2>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Research Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm block mb-1">Citation Style</label>
                    <select value={settings.citationStyle} onChange={(e) => setSettings(prev => ({ ...prev, citationStyle: e.target.value as UserSettings['citationStyle'] }))} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none">
                      <option value="apa">APA</option>
                      <option value="mla">MLA</option>
                      <option value="chicago">Chicago</option>
                      <option value="ieee">IEEE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1">Export Format</label>
                    <select value={settings.exportFormat} onChange={(e) => setSettings(prev => ({ ...prev, exportFormat: e.target.value as UserSettings['exportFormat'] }))} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none">
                      <option value="markdown">Markdown</option>
                      <option value="latex">LaTeX</option>
                      <option value="bibtex">BibTeX</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1">Default Project</label>
                    <select value={settings.defaultProject || ''} onChange={(e) => setSettings(prev => ({ ...prev, defaultProject: e.target.value || null }))} className="w-full px-3 py-2 bg-white/5 rounded text-white outline-none">
                      <option value="">None</option>
                      {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Behavior</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Auto-save notes</span>
                    <input type="checkbox" checked={settings.autoSave} onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))} className="w-5 h-5 rounded bg-white/10 border-none checked:bg-purple-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Enable notifications</span>
                    <input type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => setSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))} className="w-5 h-5 rounded bg-white/10 border-none checked:bg-purple-500" />
                  </label>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Integrations</h3>
                <div className="space-y-3">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3"><GitBranch className="w-5 h-5 text-white/60" /><span className="text-white/80">GitHub</span></div>
                    <span className="text-purple-400 text-sm">Connect</span>
                  </a>
                  <a href="https://zoo.ngo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3"><Network className="w-5 h-5 text-white/60" /><span className="text-white/80">Zoo Network</span></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </a>
                  <a href="https://zips.zoo.ngo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3"><Vote className="w-5 h-5 text-white/60" /><span className="text-white/80">ZIPs Registry</span></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </a>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Data Management</h3>
                <div className="flex gap-3">
                  <button onClick={exportNotes} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded text-purple-300 text-sm transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />Export All Data
                  </button>
                  <button onClick={() => { if (confirm('Clear all local data? This cannot be undone.')) { Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key)); window.location.reload(); } }} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 text-sm transition-colors">
                    <Trash2 className="w-4 h-4 inline mr-2" />Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ZWindow>
  );
};

export default ZooAssistantWindow;
