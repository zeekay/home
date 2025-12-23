import React, { useState, useEffect } from 'react';
import { FileText, File, Download, ExternalLink } from 'lucide-react';
import { HanzoLogo, LuxLogo, ZooLogo } from './icons';
import { cn } from '@/lib/utils';

interface DownloadsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

// Whitepaper and document links
const documents = [
  {
    title: 'Lux Whitepaper',
    shortTitle: 'Lux',
    description: 'Multi-consensus blockchain architecture',
    icon: <LuxLogo className="w-8 h-8" />,
    url: 'https://lux.network/whitepaper',
    type: 'PDF',
    color: 'from-cyan-500/30 to-cyan-600/20',
  },
  {
    title: 'Hanzo Docs',
    shortTitle: 'Hanzo',
    description: 'Frontier AI and foundational models',
    icon: <HanzoLogo className="w-8 h-8 text-white" />,
    url: 'https://docs.hanzo.ai',
    type: 'Docs',
    color: 'from-purple-500/30 to-purple-600/20',
  },
  {
    title: 'Zoo Research',
    shortTitle: 'Zoo',
    description: 'Decentralized AI research network',
    icon: <ZooLogo className="w-8 h-8" />,
    url: 'https://zoo.ngo/research',
    type: 'Research',
    color: 'from-green-500/30 to-green-600/20',
  },
  {
    title: 'ZIPs',
    shortTitle: 'ZIPs',
    description: 'Governance and improvement proposals',
    icon: <File className="w-8 h-8 text-green-400" />,
    url: 'https://zips.zoo.ngo',
    type: 'Proposals',
    color: 'from-emerald-500/30 to-emerald-600/20',
  },
  {
    title: 'Lux Genesis',
    shortTitle: 'Genesis',
    description: 'Network genesis and validator setup',
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    url: 'https://docs.lux.network/genesis',
    type: 'Technical',
    color: 'from-blue-500/30 to-blue-600/20',
  },
  {
    title: 'ACI Architecture',
    shortTitle: 'ACI',
    description: 'AI Chain Infrastructure overview',
    icon: <HanzoLogo className="w-7 h-7 text-purple-400" />,
    url: 'https://docs.hanzo.ai/aci',
    type: 'Architecture',
    color: 'from-violet-500/30 to-violet-600/20',
  },
];

const DownloadsPopover: React.FC<DownloadsPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={onClose}
      />
      
      {/* Popover */}
      <div 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] w-[380px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-white/70" />
            <span className="text-sm font-medium text-white/90">Downloads</span>
          </div>
          <span className="text-xs text-white/50">{documents.length} items</span>
        </div>

        {/* Documents List */}
        <div className="max-h-[400px] overflow-y-auto">
          {documents.map((doc, index) => (
            <a
              key={index}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
            >
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg shrink-0">
                {doc.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/90 truncate">{doc.title}</span>
                  <ExternalLink className="w-3 h-3 text-white/40 shrink-0" />
                </div>
                <p className="text-xs text-white/50 truncate">{doc.description}</p>
              </div>

              {/* Type badge */}
              <div className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/60 shrink-0">
                {doc.type}
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">Whitepapers & Documentation</span>
          <button 
            onClick={onClose}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default DownloadsPopover;
