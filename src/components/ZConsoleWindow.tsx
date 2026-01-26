import React, { useState, useEffect, useRef, useCallback } from 'react';
import ZWindow from './ZWindow';
import {
  Search,
  Filter,
  Trash2,
  Pause,
  Play,
  Download,
  ChevronRight,
  ChevronDown,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Terminal,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZConsoleWindowProps {
  onClose: () => void;
}

type LogLevel = 'error' | 'warning' | 'info' | 'debug';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  process: string;
  subsystem: string;
  message: string;
  details?: string;
}

interface LogSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  children?: LogSource[];
}

// Mock log message templates for realistic system logs
const mockLogTemplates: Array<{
  level: LogLevel;
  process: string;
  subsystem: string;
  messages: string[];
}> = [
  {
    level: 'info',
    process: 'kernel',
    subsystem: 'IOKit',
    messages: [
      'USB device enumeration complete',
      'Power management: system entering S0 state',
      'Bluetooth controller initialized',
      'Display brightness adjusted to 75%',
      'Thermal management: CPU temperature nominal',
    ],
  },
  {
    level: 'info',
    process: 'launchd',
    subsystem: 'com.apple.launchd',
    messages: [
      'Service com.apple.WindowServer started',
      'Job com.apple.metadata.mds submitted',
      'Bootstrapping service com.apple.security.agent',
      'XPC service connection established',
    ],
  },
  {
    level: 'info',
    process: 'WindowServer',
    subsystem: 'CoreGraphics',
    messages: [
      'Display 1 connected: 2560x1440@60Hz',
      'Metal acceleration enabled for GPU 0',
      'Compositing engine initialized',
      'Hardware cursor enabled',
    ],
  },
  {
    level: 'warning',
    process: 'kernel',
    subsystem: 'AppleThunderbolt',
    messages: [
      'Port 1: Link speed degraded to 20Gbps',
      'Device power consumption exceeds specification',
      'Cable may not support full bandwidth',
    ],
  },
  {
    level: 'warning',
    process: 'diskutil',
    subsystem: 'StorageKit',
    messages: [
      'Volume "Macintosh HD" approaching capacity (89% full)',
      'SMART warning: Media Wearout Indicator below threshold',
      'Filesystem metadata inconsistency detected, repairing',
    ],
  },
  {
    level: 'error',
    process: 'kernel',
    subsystem: 'IOUSBHostFamily',
    messages: [
      'USB device descriptor read failed (error: 0xe00002ed)',
      'Port power limit exceeded, device disconnected',
      'Overcurrent condition detected on port 3',
    ],
  },
  {
    level: 'error',
    process: 'coreaudiod',
    subsystem: 'AudioHAL',
    messages: [
      'Audio device "Built-in Output" failed to start',
      'Sample rate conversion error: buffer underrun',
      'Failed to acquire audio device exclusive access',
    ],
  },
  {
    level: 'debug',
    process: 'mDNSResponder',
    subsystem: 'Bonjour',
    messages: [
      'Registering service _http._tcp.local. port 80',
      'Cache flush for A record zeekay-mac.local',
      'Multicast DNS query: _services._dns-sd._udp.local.',
    ],
  },
  {
    level: 'debug',
    process: 'cfprefsd',
    subsystem: 'Preferences',
    messages: [
      'Reading preferences domain com.apple.Terminal',
      'Synchronizing preferences to disk',
      'User defaults changed: NSUserDefaults.didChange',
    ],
  },
  {
    level: 'info',
    process: 'networkd',
    subsystem: 'Network',
    messages: [
      'Interface en0: DHCP lease renewed',
      'DNS servers updated: 8.8.8.8, 8.8.4.4',
      'IPv6 address assigned: fe80::1%en0',
      'Route added: default via 192.168.1.1',
    ],
  },
  {
    level: 'info',
    process: 'securityd',
    subsystem: 'Security',
    messages: [
      'Keychain "login.keychain-db" unlocked',
      'Certificate chain validated successfully',
      'Secure enclave: biometric authentication passed',
      'Code signature verified for /Applications/Safari.app',
    ],
  },
  {
    level: 'warning',
    process: 'securityd',
    subsystem: 'Security',
    messages: [
      'Certificate expiring in 30 days: dev.zeekay.ai',
      'Failed authentication attempt (3 of 5)',
      'Untrusted code signature: /tmp/suspicious.app',
    ],
  },
  {
    level: 'error',
    process: 'securityd',
    subsystem: 'Security',
    messages: [
      'Keychain access denied: missing entitlement',
      'SSL handshake failed: certificate revoked',
    ],
  },
  {
    level: 'debug',
    process: 'kernel',
    subsystem: 'VM',
    messages: [
      'Page fault at address 0x7fff5fbff000',
      'Compressor ratio: 2.3:1, savings: 1.2GB',
      'Memory pressure: nominal (free: 4.2GB)',
    ],
  },
];

const generateMockLog = (): LogEntry => {
  const template = mockLogTemplates[Math.floor(Math.random() * mockLogTemplates.length)];
  const message = template.messages[Math.floor(Math.random() * template.messages.length)];

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level: template.level,
    process: template.process,
    subsystem: template.subsystem,
    message,
    details: Math.random() > 0.7
      ? `Additional context: Thread ID: ${Math.floor(Math.random() * 10000)}, PID: ${Math.floor(Math.random() * 50000)}, CPU: ${Math.floor(Math.random() * 8)}`
      : undefined,
  };
};

const generateInitialLogs = (count: number): LogEntry[] => {
  const logs: LogEntry[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const log = generateMockLog();
    log.timestamp = new Date(now - (count - i) * Math.random() * 2000);
    logs.push(log);
  }

  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

const levelColors: Record<LogLevel, { bg: string; text: string; icon: React.ReactNode }> = {
  error: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  warning: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  info: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    icon: <Info className="w-3.5 h-3.5" />,
  },
  debug: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    icon: <Bug className="w-3.5 h-3.5" />,
  },
};

const ZConsoleWindow: React.FC<ZConsoleWindowProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>(() => generateInitialLogs(50));
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set(['system', 'apps']));
  const [levelFilters, setLevelFilters] = useState<Set<LogLevel>>(
    new Set(['error', 'warning', 'info', 'debug'])
  );
  const [processFilter, setProcessFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Generate log sources from current logs
  const logSources: LogSource[] = [
    {
      id: 'system',
      name: 'System',
      icon: <Monitor className="w-4 h-4" />,
      count: logs.filter((l) => ['kernel', 'launchd', 'WindowServer'].includes(l.process)).length,
      children: [
        {
          id: 'kernel',
          name: 'kernel',
          icon: <Cpu className="w-4 h-4" />,
          count: logs.filter((l) => l.process === 'kernel').length,
        },
        {
          id: 'launchd',
          name: 'launchd',
          icon: <Terminal className="w-4 h-4" />,
          count: logs.filter((l) => l.process === 'launchd').length,
        },
        {
          id: 'WindowServer',
          name: 'WindowServer',
          icon: <Monitor className="w-4 h-4" />,
          count: logs.filter((l) => l.process === 'WindowServer').length,
        },
      ],
    },
    {
      id: 'apps',
      name: 'Applications',
      icon: <HardDrive className="w-4 h-4" />,
      count: logs.filter((l) =>
        ['coreaudiod', 'cfprefsd', 'mDNSResponder'].includes(l.process)
      ).length,
      children: [
        {
          id: 'coreaudiod',
          name: 'coreaudiod',
          icon: <Terminal className="w-4 h-4" />,
          count: logs.filter((l) => l.process === 'coreaudiod').length,
        },
        {
          id: 'cfprefsd',
          name: 'cfprefsd',
          icon: <Terminal className="w-4 h-4" />,
          count: logs.filter((l) => l.process === 'cfprefsd').length,
        },
      ],
    },
    {
      id: 'network',
      name: 'Network',
      icon: <Wifi className="w-4 h-4" />,
      count: logs.filter((l) => ['networkd', 'mDNSResponder'].includes(l.process)).length,
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Shield className="w-4 h-4" />,
      count: logs.filter((l) => l.process === 'securityd').length,
    },
  ];

  // Streaming effect
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs((prev) => [...prev.slice(-499), newLog]);
    }, Math.random() * 1500 + 500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScrollRef.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!logContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (!levelFilters.has(log.level)) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (processFilter && log.process !== processFilter) return false;
    if (selectedSource) {
      if (selectedSource === 'system') {
        return ['kernel', 'launchd', 'WindowServer'].includes(log.process);
      }
      if (selectedSource === 'apps') {
        return ['coreaudiod', 'cfprefsd', 'mDNSResponder'].includes(log.process);
      }
      if (selectedSource === 'network') {
        return ['networkd', 'mDNSResponder'].includes(log.process);
      }
      if (selectedSource === 'security') {
        return log.process === 'securityd';
      }
      return log.process === selectedSource;
    }
    return true;
  });

  const toggleLevelFilter = (level: LogLevel) => {
    setLevelFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const toggleSourceExpanded = (sourceId: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  const exportLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.process}(${log.subsystem}): ${log.message}`
      )
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (date: Date) => {
    const time = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  const renderSource = (source: LogSource, depth = 0) => {
    const isExpanded = expandedSources.has(source.id);
    const isSelected = selectedSource === source.id;
    const hasChildren = source.children && source.children.length > 0;

    return (
      <div key={source.id}>
        <div
          onClick={() => {
            if (hasChildren) {
              toggleSourceExpanded(source.id);
            }
            setSelectedSource(isSelected ? null : source.id);
          }}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition-colors',
            isSelected ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-white/5 text-white/70'
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3 text-white/40" />
            ) : (
              <ChevronRight className="w-3 h-3 text-white/40" />
            )
          ) : (
            <span className="w-3" />
          )}
          <span className="text-white/50">{source.icon}</span>
          <span className="flex-1 text-sm truncate">{source.name}</span>
          <span className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
            {source.count}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>{source.children!.map((child) => renderSource(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <ZWindow
      title="Console"
      onClose={onClose}
      initialPosition={{ x: 80, y: 40 }}
      initialSize={{ width: 1100, height: 650 }}
      windowType="system"
    >
      <div className="flex h-full bg-[#1e1e1e]">
        {/* Sidebar */}
        <div className="w-52 border-r border-white/10 flex flex-col bg-[#252526]">
          {/* Sidebar Header */}
          <div className="p-2 border-b border-white/10">
            <div className="text-xs text-white/50 uppercase tracking-wide px-2 py-1">
              Log Sources
            </div>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto py-1">
            <div
              onClick={() => setSelectedSource(null)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md mx-1 transition-colors',
                !selectedSource ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-white/5 text-white/70'
              )}
            >
              <Terminal className="w-4 h-4 text-white/50" />
              <span className="flex-1 text-sm">All Messages</span>
              <span className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                {logs.length}
              </span>
            </div>

            <div className="h-px bg-white/10 my-2 mx-3" />

            {logSources.map((source) => renderSource(source))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-white/10">
            <div className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              <span>{isStreaming ? 'Streaming...' : 'Paused'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#2d2d2d]">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/30 border border-white/10 rounded-md text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Level Filters */}
            <div className="flex items-center gap-1">
              {(['error', 'warning', 'info', 'debug'] as LogLevel[]).map((level) => {
                const colors = levelColors[level];
                const isActive = levelFilters.has(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleLevelFilter(level)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                      isActive ? `${colors.bg} ${colors.text}` : 'text-white/30 hover:text-white/50'
                    )}
                    title={`${isActive ? 'Hide' : 'Show'} ${level} logs`}
                  >
                    {colors.icon}
                    <span className="capitalize">{level}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-1.5 rounded transition-colors',
                showFilters ? 'bg-blue-500/30 text-blue-300' : 'text-white/50 hover:text-white/70'
              )}
              title="More filters"
            >
              <Filter className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-white/10" />

            {/* Stream Control */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                isStreaming
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              )}
              title={isStreaming ? 'Pause streaming' : 'Resume streaming'}
            >
              {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isStreaming ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Clear */}
            <button
              onClick={clearLogs}
              className="p-1.5 text-white/50 hover:text-white/70 rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={exportLogs}
              className="p-1.5 text-white/50 hover:text-white/70 rounded transition-colors"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Process Filter Bar */}
          {showFilters && (
            <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#292929]">
              <span className="text-xs text-white/50">Process:</span>
              <input
                type="text"
                value={processFilter}
                onChange={(e) => setProcessFilter(e.target.value)}
                placeholder="Filter by process name..."
                className="flex-1 max-w-xs px-2 py-1 bg-black/30 border border-white/10 rounded text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
              {processFilter && (
                <button
                  onClick={() => setProcessFilter('')}
                  className="text-xs text-white/40 hover:text-white/70"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Log List */}
          <div
            ref={logContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto font-mono text-xs"
          >
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/30">
                <div className="text-center">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No logs to display</p>
                  <p className="text-xs mt-1">Adjust filters or wait for new logs</p>
                </div>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const colors = levelColors[log.level];
                const isSelected = selectedLog?.id === log.id;

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(isSelected ? null : log)}
                    className={cn(
                      'flex items-start gap-2 px-3 py-1 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5',
                      isSelected && 'bg-blue-500/10'
                    )}
                  >
                    {/* Timestamp */}
                    <span className="text-white/40 shrink-0 w-24">
                      {formatTimestamp(log.timestamp)}
                    </span>

                    {/* Level */}
                    <span
                      className={cn(
                        'flex items-center gap-1 shrink-0 w-16',
                        colors.text
                      )}
                    >
                      {colors.icon}
                      <span className="uppercase text-[10px]">{log.level}</span>
                    </span>

                    {/* Process */}
                    <span className="text-purple-400 shrink-0 w-28 truncate">
                      {log.process}
                    </span>

                    {/* Subsystem */}
                    <span className="text-cyan-400/70 shrink-0 w-32 truncate">
                      [{log.subsystem}]
                    </span>

                    {/* Message */}
                    <span className="text-white/80 flex-1 truncate">{log.message}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Panel */}
          {selectedLog && (
            <div className="h-40 border-t border-white/10 bg-[#1a1a1a] p-3 overflow-y-auto">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn('flex items-center gap-1', levelColors[selectedLog.level].text)}>
                    {levelColors[selectedLog.level].icon}
                    <span className="uppercase text-xs font-medium">{selectedLog.level}</span>
                  </span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/60 text-xs">
                    {selectedLog.timestamp.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-white/40 hover:text-white/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex gap-4">
                  <div>
                    <span className="text-white/40">Process:</span>{' '}
                    <span className="text-purple-400">{selectedLog.process}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Subsystem:</span>{' '}
                    <span className="text-cyan-400">{selectedLog.subsystem}</span>
                  </div>
                </div>

                <div>
                  <span className="text-white/40">Message:</span>
                  <p className="text-white/90 mt-1 font-mono">{selectedLog.message}</p>
                </div>

                {selectedLog.details && (
                  <div>
                    <span className="text-white/40">Details:</span>
                    <p className="text-white/60 mt-1 font-mono">{selectedLog.details}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-white/10 bg-[#2d2d2d] text-xs text-white/40">
            <div className="flex items-center gap-3">
              <span>
                {filteredLogs.length} of {logs.length} messages
              </span>
              {searchQuery && <span>| Matching: "{searchQuery}"</span>}
            </div>
            <div className="flex items-center gap-2">
              {!autoScrollRef.current && isStreaming && (
                <button
                  onClick={() => {
                    autoScrollRef.current = true;
                    if (logContainerRef.current) {
                      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Jump to latest
                </button>
              )}
              <span>Console v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </ZWindow>
  );
};

export default ZConsoleWindow;
