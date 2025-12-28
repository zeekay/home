
import React from 'react';
import { TerminalTab } from '@/types/terminal';
import { cn } from '@/lib/utils';
import { X, Plus, Terminal } from 'lucide-react';

interface TerminalTabBarProps {
  tabs: TerminalTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TerminalTabBar: React.FC<TerminalTabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}) => {
  const handleClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  return (
    <div className="flex items-center bg-black/50 border-b border-white/10 h-8 overflow-x-auto scrollbar-none">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          onClick={() => onTabSelect(tab.id)}
          className={cn(
            'flex items-center gap-2 px-3 h-full min-w-[120px] max-w-[200px]',
            'border-r border-white/10 cursor-pointer transition-colors',
            'hover:bg-white/5 group',
            tab.id === activeTabId
              ? 'bg-white/10 text-white'
              : 'text-white/60'
          )}
        >
          <Terminal size={12} className="flex-shrink-0" />
          <span className="text-xs truncate flex-1">{tab.title}</span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => handleClose(e, tab.id)}
              className={cn(
                'flex-shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors',
                'opacity-0 group-hover:opacity-100',
                tab.id === activeTabId && 'opacity-60'
              )}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-full text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        title="New Tab (Cmd+T)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default TerminalTabBar;
